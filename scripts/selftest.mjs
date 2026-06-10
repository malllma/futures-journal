// Node self-test for the pure analytics libs. No React / no Supabase.
//   Run:  node scripts/selftest.mjs
//   Optionally validate against your real data:  node scripts/selftest.mjs path/to/trades.csv
//
// This is a verification harness, not shipped app code. It builds a synthetic
// 34-trade dataset (matching the user's reported count) and asserts the new
// edge/mapping/audit/mistake/weekly/export logic behaves correctly.

import { readFileSync } from 'node:fs';
import {
  computeMetrics, computeEdge, computeEdgeReport,
  setupFamilyGroups, entryTriggerGroups, setupTriggerGroups, marketTypeGroups,
  mistakeCostAnalysis, validInvalidAudit, weeklySummaries, applyTradeFilter,
  EDGE_EARLY_MIN, EDGE_STRONG_MIN,
} from '../src/lib/analytics.js';
import {
  setupFamilyFromRaw, resolveSetupFamily, classifyValidity, suggestLabelsFromNotes,
} from '../src/lib/classification.js';
import { tradesToCSV, buildEdgeReportMarkdown } from '../src/lib/report.js';

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('  ✗ FAIL:', msg); } };
const section = (s) => console.log(`\n— ${s} —`);

// ----------------------------------------------------------------------------
// Synthetic 34-trade dataset. Mix of setups (raw + explicit), market types,
// valid/invalid, mistakes, across ~3 calendar weeks.
// ----------------------------------------------------------------------------
function makeTrades() {
  const t = [];
  let i = 0;
  const push = (o) => t.push({ id: `t${i++}`, symbol: 'ES', direction: 'long', ...o });

  // Week 1 (2026-06-01 Mon .. 06-05 Fri) — mostly clean valid trades, profitable
  push({ date: '2026-06-01', pnl: 250, setup: 'VWAP reclaim at PDH', entry_trigger: 'vwap_reclaim', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true, stop_loss: 5200, execution_quality: 'clean', notes: 'clean reclaim, held' });
  push({ date: '2026-06-01', pnl: -120, setup: 'support bounce', entry_trigger: 'rejection', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true, stop_loss: 5180, loss_explanation: 'stop hit cleanly' });
  push({ date: '2026-06-02', pnl: 300, setup: 'trendline bounce', entry_trigger: 'higher_low', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-02', pnl: 180, setup: 'VWAP + previous high', entry_trigger: 'retest_hold', market_type: 'breakout', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-03', pnl: -90, setup: 'resistance rejection', entry_trigger: 'rejection', market_type: 'chop', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-03', pnl: -400, setup: 'fomo chase', market_type: 'news', rules_followed: false, mistake_type: 'chased', setup_present: false, trigger_present: false, notes: 'chased the news spike, revenge after' });
  push({ date: '2026-06-04', pnl: 220, setup: 'ORH break and retest', entry_trigger: 'break_and_hold', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-05', pnl: -150, setup: 'VWAP loss short', direction: 'short', entry_trigger: 'vwap_loss', market_type: 'bear_trend', setup_present: true, trigger_present: true, rules_followed: true });

  // Week 2 (06-08 Mon .. 06-12 Fri) — more invalid trades, choppy
  push({ date: '2026-06-08', pnl: -300, setup: 'revenge trade', market_type: 'chop', rules_followed: false, mistake_type: 'revenge', setup_present: false, trigger_present: false, notes: 'revenge after morning loss, oversized' });
  push({ date: '2026-06-08', pnl: 120, setup: 'trendline break', entry_trigger: 'failed_breakout', market_type: 'reversal', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-09', pnl: -250, setup: 'oversized breakout', market_type: 'breakout', rules_followed: false, mistake_type: 'oversized', setup_present: true, trigger_present: true });
  push({ date: '2026-06-09', pnl: 90, setup: 'VWAP bounce', entry_trigger: 'rejection', market_type: 'range', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-10', pnl: -60, setup: 'support', entry_trigger: 'rejection', market_type: 'chop', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-10', pnl: -500, setup: 'no setup boredom', market_type: 'slow', rules_followed: false, mistake_type: 'no_setup', setup_present: false, trigger_present: false, notes: 'bored, forced a trade in dead tape' });
  push({ date: '2026-06-11', pnl: 160, setup: 'PDL bounce', entry_trigger: 'liquidity_sweep', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-12', pnl: -110, setup: 'late entry vwap', entry_trigger: 'momentum_continuation', market_type: 'bull_trend', rules_followed: false, mistake_type: 'late', execution_quality: 'late' });

  // Week 3 (06-15 Mon .. 06-19 Fri) — recovery, plus some legacy/raw-only trades
  push({ date: '2026-06-15', pnl: 280, setup: 'VWAP reclaim', entry_trigger: 'vwap_reclaim', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-15', pnl: 140, setup: 'trendline retest', entry_trigger: 'retest_hold', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-16', pnl: -130, setup: 'resistance', entry_trigger: 'rejection', direction: 'short', market_type: 'bear_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-16', pnl: 210, setup: 'breakout and retest', entry_trigger: 'break_and_hold', market_type: 'breakout', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-17', pnl: 95, setup: 'VWAP', entry_trigger: 'rejection', market_type: 'range', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-17', pnl: -340, setup: 'moved my stop', market_type: 'chop', rules_followed: false, mistake_type: 'moved_stop', setup_present: true, trigger_present: true, notes: 'moved stop and it ran' });
  push({ date: '2026-06-18', pnl: 175, setup: 'supply zone short', direction: 'short', entry_trigger: 'lower_high', market_type: 'bear_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-18', pnl: 60, setup: 'key level bounce', entry_trigger: 'higher_low', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true });
  push({ date: '2026-06-19', pnl: 130, setup: 'ORL reclaim', entry_trigger: 'vwap_reclaim', market_type: 'reversal', setup_present: true, trigger_present: true, rules_followed: true });

  // Legacy-style trades: only raw `setup` + notes, NO explicit classification fields.
  // These exercise the read-time keyword mapping + unclassified validity.
  push({ date: '2026-06-19', pnl: -75, setup: 'vwap rejection near pdh', notes: 'price rejected VWAP near previous high' });
  push({ date: '2026-06-22', pnl: 200, setup: 'trendline bounce', notes: 'clean bounce off rising trendline' });
  push({ date: '2026-06-22', pnl: -220, setup: 'random fomo', notes: 'chased, no plan' });
  push({ date: '2026-06-23', pnl: 110, setup: 'resistance breakout retest', notes: '' });
  push({ date: '2026-06-23', pnl: 40, setup: 'supply/demand zone', notes: '' });
  push({ date: '2026-06-24', pnl: -180, setup: 'PDH rejection', direction: 'short', notes: 'faded the high' });
  push({ date: '2026-06-24', pnl: 90, setup: '', notes: 'no real setup, scalp' });
  push({ date: '2026-06-25', pnl: 0, setup: 'scratch', notes: 'breakeven, exited at entry' });
  push({ date: '2026-06-25', pnl: 175, setup: 'VWAP reclaim at key level', entry_trigger: 'vwap_reclaim', market_type: 'bull_trend', setup_present: true, trigger_present: true, rules_followed: true, stop_loss: 5300, notes: 'textbook reclaim, 34th trade' });

  return t;
}

// ----------------------------------------------------------------------------
// Optional: load real trades from a CSV the user exports from the app.
// ----------------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let i = 0, field = '', record = [], inQ = false;
  const pushF = () => { record.push(field); field = ''; };
  const pushR = () => { rows.push(record); record = []; };
  while (i < text.length) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ',') { pushF(); i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { pushF(); pushR(); i++; continue; }
    field += c; i++;
  }
  if (field !== '' || record.length) { pushF(); pushR(); }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function loadCSVTrades(path) {
  const rows = parseCSV(readFileSync(path, 'utf8'));
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name) => header.indexOf(name);
  const get = (r, name) => { const k = idx(name); return k >= 0 ? r[k] : undefined; };
  const ynb = (v) => (v === 'yes' || v === 'true' ? true : v === 'no' || v === 'false' ? false : null);
  return rows.slice(1).map((r, n) => ({
    id: `csv${n}`,
    date: get(r, 'date'),
    symbol: get(r, 'symbol'),
    direction: get(r, 'direction'),
    pnl: Number(get(r, 'pnl')),
    entry: get(r, 'entry') ? Number(get(r, 'entry')) : null,
    exit: get(r, 'exit') ? Number(get(r, 'exit')) : null,
    quantity: get(r, 'quantity') ? Number(get(r, 'quantity')) : null,
    stop_loss: get(r, 'stop_loss') ? Number(get(r, 'stop_loss')) : null,
    take_profit: get(r, 'take_profit') ? Number(get(r, 'take_profit')) : null,
    setup: get(r, 'setup_raw') ?? get(r, 'setup') ?? '',
    setup_family: get(r, 'setup_family') || null,
    entry_trigger: get(r, 'entry_trigger') || null,
    market_type: get(r, 'market_type') || null,
    setup_present: ynb(get(r, 'setup_present')),
    trigger_present: ynb(get(r, 'trigger_present')),
    rules_followed: ynb(get(r, 'rules_followed')),
    execution_quality: get(r, 'execution_quality') || null,
    mistake_type: get(r, 'mistake_type') || null,
    is_eval: ynb(get(r, 'is_eval')),
    rule_breaks: get(r, 'rule_breaks') || null,
    loss_explanation: get(r, 'loss_explanation') || null,
    notes: get(r, 'notes') || '',
  })).filter((t) => t.date && Number.isFinite(t.pnl));
}

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------
const csvPath = process.argv[2];
const trades = csvPath ? loadCSVTrades(csvPath) : makeTrades();
console.log(`Dataset: ${csvPath ? `CSV (${csvPath})` : 'synthetic'} — ${trades.length} trades`);

section('Edge counts ALL logged trades (the #3 bug)');
const edge = computeEdge(trades);
ok(edge.n === trades.length, `edge.n (${edge.n}) should equal trade count (${trades.length})`);
ok(['no_data', 'too_early', 'promising', 'stronger', 'no_edge'].includes(edge.verdict), `verdict is graded, got "${edge.verdict}"`);
ok(typeof edge.explanation === 'string' && edge.explanation.length > 20, 'edge has a plain-language explanation');
ok(edge.verdict !== 'inconclusive' && edge.verdict !== 'insufficient_data', 'no useless "inconclusive"/"insufficient_data" verdict');
console.log(`  → ${trades.length} trades ⇒ "${edge.label}" (CI ${edge.ciLow.toFixed(1)}…${edge.ciHigh.toFixed(1)})`);
// With 34 trades the verdict must NOT be the "too early" gate.
if (!csvPath) ok(edge.verdict !== 'too_early', '34 synthetic trades should pass the too-early gate');

section('Edge thresholds behave');
ok(computeEdge(trades.slice(0, 5)).verdict === 'too_early', '5 trades ⇒ too_early');
ok(computeEdge([]).verdict === 'no_data', '0 trades ⇒ no_data');
ok(EDGE_EARLY_MIN === 10 && EDGE_STRONG_MIN === 30, 'thresholds exposed');

section('Old raw labels map to new setup families (non-destructive)');
ok(setupFamilyFromRaw('vwap rejection near pdh') === 'confluence', 'VWAP + PDH ⇒ confluence');
ok(setupFamilyFromRaw('trendline bounce') === 'trendline', 'trendline bounce ⇒ trendline');
ok(setupFamilyFromRaw('PDH rejection') === 'support_resistance', 'PDH ⇒ support_resistance');
ok(setupFamilyFromRaw('VWAP reclaim') === 'vwap', 'VWAP ⇒ vwap');
ok(setupFamilyFromRaw('random fomo') === 'no_setup', 'fomo ⇒ no_setup');
ok(setupFamilyFromRaw('') === null, 'empty ⇒ null');
// resolve uses explicit field first, else derives
ok(resolveSetupFamily({ setup_family: 'vwap', setup: 'whatever' }) === 'vwap', 'explicit setup_family wins');
ok(resolveSetupFamily({ setup: 'trendline break' }) === 'trendline', 'derives from raw when no explicit');

section('Valid / invalid classification');
ok(classifyValidity({ rules_followed: true, setup_present: true, trigger_present: true }) === 'valid', 'rules+setup+trigger ⇒ valid');
ok(classifyValidity({ rules_followed: false }) === 'invalid', 'rules broken ⇒ invalid');
ok(classifyValidity({ mistake_type: 'revenge' }) === 'invalid', 'revenge mistake ⇒ invalid');
ok(classifyValidity({ setup: 'vwap', notes: 'x' }) === 'unclassified', 'unreviewed legacy ⇒ unclassified');

section('Audits, groups, mistakes, weekly all compute');
const audit = validInvalidAudit(trades);
ok(audit.valid.count + audit.invalid.count + audit.unclassified.count === trades.length, 'valid+invalid+unclassified == total');
ok(audit.invalid.netPnl <= 0 || audit.invalid.count === 0, 'invalid net P/L is non-positive in synthetic data');
const setups = setupFamilyGroups(trades);
ok(setups.length > 0, 'setup-family groups produced');
ok(setups.every((g) => g.metrics.n > 0), 'every group has trades');
const triggers = entryTriggerGroups(trades);
const combos = setupTriggerGroups(trades);
const markets = marketTypeGroups(trades);
ok(triggers.length > 0 && combos.length > 0 && markets.length > 0, 'trigger/combo/market groups produced');
// legacy 'range' must merge into 'chop' bucket
ok(!markets.some((g) => g.key === 'range'), "'range' merges into 'chop' bucket");
const mc = mistakeCostAnalysis(trades);
ok(mc.rows.length > 0, 'mistake-cost rows produced');
ok(mc.mostExpensive && mc.mostExpensive.totalPnl <= 0, 'most expensive mistake is a net loss');
const weeks = weeklySummaries(trades, {});
ok(weeks.length >= 3, `weekly summaries produced (${weeks.length} weeks)`);
ok(weeks.every((w) => w.summary && w.summary.focus.length > 0), 'every week has a focus line');

section('Filters recompute subsets');
ok(applyTradeFilter(trades, 'valid').every((t) => classifyValidity(t) === 'valid'), 'valid filter');
ok(applyTradeFilter(trades, 'invalid').every((t) => classifyValidity(t) === 'invalid'), 'invalid filter');
ok(applyTradeFilter(trades, 'news').every((t) => t.market_type === 'news'), 'news filter');
ok(applyTradeFilter(trades, 'exclude_news').every((t) => t.market_type !== 'news'), 'exclude-news filter');
ok(applyTradeFilter(trades, 'vwap').every((t) => resolveSetupFamily(t) === 'vwap'), 'vwap filter');
ok(applyTradeFilter(trades, 'last20').length === Math.min(20, trades.length), 'last20 size');

section('Suggestion engine (#19)');
const sug = suggestLabelsFromNotes('price rejected VWAP near previous high', '');
ok(sug.setup_family === 'confluence', 'VWAP+prev high ⇒ confluence suggestion');
ok(sug.entry_trigger === 'rejection' || sug.entry_trigger === 'vwap_reclaim', 'a trigger is suggested');

section('Exports produce output');
const csv = tradesToCSV(trades, {});
ok(csv.split('\n').length === trades.length + 1, 'CSV has header + one row per trade');
ok(csv.split('\n')[0].includes('setup_family_resolved'), 'CSV header has new resolved column');
const md = buildEdgeReportMarkdown(trades, {}, { generatedAt: '2026-06-10', rangeLabel: 'All', filterLabel: 'All trades' });
ok(md.includes('# Trading Edge Report'), 'markdown report has title');
ok(md.includes('Edge confidence') && md.includes('Weekly summaries') && md.includes('Mistake cost'), 'markdown has key sections');

section('computeEdgeReport assembles full stat block (#3)');
const rep = computeEdgeReport(trades);
for (const k of ['winRate', 'netPnl', 'avgWin', 'avgLoss', 'expectancy', 'profitFactor', 'validExpectancy', 'invalidCost']) {
  ok(k in rep, `report has ${k}`);
}
ok('best' in (rep.bestSetup ? { best: 1 } : {}) || rep.bestSetup === null || typeof rep.bestSetup === 'object', 'bestSetup present or null');

console.log(`\n=========================`);
console.log(`PASS: ${pass}   FAIL: ${fail}`);
console.log(`=========================`);
if (!csvPath) {
  console.log('\nTip: validate against your real data with:  node scripts/selftest.mjs <your-export>.csv');
}
process.exit(fail === 0 ? 0 : 1);
