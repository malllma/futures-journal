// report.js — export builders. Pure (Node-importable).
//   * tradesToCSV       — raw trades, backward-compatible (keeps all old columns, appends new)
//   * buildEdgeReportMarkdown — compact, complete summary to paste/upload into ChatGPT (#16)

import {
  computeMetrics, computeEdge, validInvalidAudit, mistakeCostAnalysis,
  setupFamilyGroups, entryTriggerGroups, setupTriggerGroups, marketTypeGroups,
  weeklySummaries, pickBestWorst,
  fmtMoney, fmtPct, fmtPF,
} from './analytics.js';
import { resolveSetupFamily, setupFamilyLabel, classifyValidity } from './classification.js';

// ============================================================================
// CSV (raw trades)
// ============================================================================

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

const yn = (b) => (b === true ? 'yes' : b === false ? 'no' : '');

export function tradesToCSV(trades, dailyNotesMap) {
  const header = [
    'date', 'symbol', 'direction', 'quantity', 'entry', 'exit', 'stop_loss', 'take_profit', 'pnl',
    'setup_raw', 'setup_family', 'setup_family_resolved', 'entry_trigger', 'market_type',
    'setup_present', 'trigger_present', 'rules_followed', 'validity',
    'execution_quality', 'mistake_type', 'is_eval',
    'rule_breaks', 'loss_explanation', 'notes', 'daily_note',
  ];
  const rows = [header.join(',')];
  for (const t of trades) {
    const dailyNote = (dailyNotesMap && dailyNotesMap[t.date]) || '';
    const row = [
      t.date || '', t.symbol || '', t.direction || '',
      t.quantity ?? '', t.entry ?? '', t.exit ?? '', t.stop_loss ?? '', t.take_profit ?? '', t.pnl ?? '',
      t.setup || '', t.setup_family || '', resolveSetupFamily(t) || '', t.entry_trigger || '', t.market_type || '',
      yn(t.setup_present), yn(t.trigger_present), yn(t.rules_followed), classifyValidity(t),
      t.execution_quality || '', t.mistake_type || '', yn(t.is_eval),
      t.rule_breaks || '', t.loss_explanation || '', t.notes || '', dailyNote,
    ].map(csvEscape);
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

// ============================================================================
// Markdown summary report
// ============================================================================

function groupTable(title, groups, { showRaw = false } = {}) {
  if (!groups || groups.length === 0) return `### ${title}\n\n_No data._\n`;
  let out = `### ${title}\n\n| Group | n | Win% | Expectancy | PF | Net P/L |\n|---|--:|--:|--:|--:|--:|\n`;
  for (const g of groups) {
    const m = g.metrics;
    out += `| ${g.label} | ${m.n} | ${fmtPct(m.winRate)} | ${fmtMoney(m.expectancy)} | ${fmtPF(m.profitFactor)} | ${fmtMoney(m.netPnl)} |\n`;
  }
  return out;
}

function topTrades(trades, n, dir) {
  const sorted = [...trades].sort((a, b) =>
    dir === 'win' ? Number(b.pnl) - Number(a.pnl) : Number(a.pnl) - Number(b.pnl)
  );
  return sorted.slice(0, n).filter((t) => (dir === 'win' ? Number(t.pnl) > 0 : Number(t.pnl) < 0));
}

function tradeLine(t) {
  const fam = setupFamilyLabel(resolveSetupFamily(t));
  const note = t.notes ? ` — ${t.notes.replace(/\s+/g, ' ').slice(0, 120)}` : '';
  return `- ${t.date} ${t.symbol || ''} ${(t.direction || '').toUpperCase()} ${fmtMoney(Number(t.pnl))} · ${fam}${note}`;
}

// meta: { rangeLabel, filterLabel, generatedAt }
export function buildEdgeReportMarkdown(trades, dailyNotesMap = {}, meta = {}) {
  const m = computeMetrics(trades);
  const edge = computeEdge(trades);
  const audit = validInvalidAudit(trades);
  const mistakes = mistakeCostAnalysis(trades);
  const setups = setupFamilyGroups(trades);
  const triggers = entryTriggerGroups(trades);
  const combos = setupTriggerGroups(trades);
  const markets = marketTypeGroups(trades);
  const weeks = weeklySummaries(trades, dailyNotesMap);
  const { best: bestSetup, worst: worstSetup } = pickBestWorst(setups);
  const { best: bestMarket, worst: worstMarket } = pickBestWorst(markets);

  const L = [];
  L.push(`# Trading Edge Report`);
  if (meta.generatedAt) L.push(`_Generated ${meta.generatedAt}_`);
  const ctx = [meta.rangeLabel && `Range: ${meta.rangeLabel}`, meta.filterLabel && `Filter: ${meta.filterLabel}`].filter(Boolean).join(' · ');
  if (ctx) L.push(`_${ctx}_`);
  L.push('');

  // Overall
  L.push(`## Overall`);
  L.push('');
  L.push(`- Total trades: **${m.n}**`);
  L.push(`- Net P/L: **${fmtMoney(m.netPnl)}**`);
  L.push(`- Win rate: **${fmtPct(m.winRate)}** (${m.wins}W / ${m.losses}L${m.breakeven ? ` / ${m.breakeven}BE` : ''})`);
  L.push(`- Avg win: ${fmtMoney(m.avgWin)} · Avg loss: ${fmtMoney(m.avgLoss)}`);
  L.push(`- Expectancy: **${fmtMoney(m.expectancy)}** per trade`);
  L.push(`- Profit factor: **${fmtPF(m.profitFactor)}**`);
  L.push('');

  // Edge
  L.push(`## Edge confidence — ${edge.label}`);
  L.push('');
  L.push(edge.explanation);
  L.push('');
  L.push(`- Trades counted: ${edge.n}`);
  L.push(`- Mean per trade: ${fmtMoney(edge.mean)}`);
  L.push(`- 95% confidence interval: ${fmtMoney(edge.ciLow)} … ${fmtMoney(edge.ciHigh)}`);
  L.push(`- Valid-trade expectancy: ${fmtMoney(audit.valid.expectancy)} · Invalid-trade cost: ${fmtMoney(audit.invalid.netPnl)}`);
  if (bestSetup) L.push(`- Best setup: ${bestSetup.label} (${fmtMoney(bestSetup.metrics.netPnl)})`);
  if (worstSetup) L.push(`- Worst setup: ${worstSetup.label} (${fmtMoney(worstSetup.metrics.netPnl)})`);
  if (bestMarket) L.push(`- Best market: ${bestMarket.label} (${fmtMoney(bestMarket.metrics.netPnl)})`);
  if (worstMarket) L.push(`- Worst market: ${worstMarket.label} (${fmtMoney(worstMarket.metrics.netPnl)})`);
  L.push('');

  // Setup / trigger / combo / market tables
  L.push(groupTable('Setup-family performance', setups));
  L.push(groupTable('Entry-trigger performance', triggers));
  L.push(groupTable('Setup + trigger combinations', combos));
  L.push(groupTable('Market-type performance', markets));

  // Mistake cost
  L.push(`### Mistake cost`);
  L.push('');
  if (mistakes.rows.length === 0) {
    L.push('_No mistakes logged._');
  } else {
    L.push(`| Mistake | Count | Net impact | Avg loss | % of losses |\n|---|--:|--:|--:|--:|`);
    for (const r of mistakes.rows) {
      L.push(`| ${r.label} | ${r.count} | ${fmtMoney(r.totalPnl)} | ${fmtMoney(r.avgLoss)} | ${r.pctOfLosses != null ? fmtPct(r.pctOfLosses) : '—'} |`);
    }
    if (mistakes.mostExpensive) L.push(`\n**Most expensive mistake:** ${mistakes.mostExpensive.label} (${fmtMoney(mistakes.mostExpensive.totalPnl)})`);
  }
  L.push('');

  // Valid vs invalid
  L.push(`### Valid vs invalid trades`);
  L.push('');
  L.push(`| | Count | Net P/L | Expectancy | Win% | Losses | Loss $ |\n|---|--:|--:|--:|--:|--:|--:|`);
  L.push(`| Valid | ${audit.valid.count} | ${fmtMoney(audit.valid.netPnl)} | ${fmtMoney(audit.valid.expectancy)} | ${fmtPct(audit.valid.winRate)} | ${audit.valid.lossCount} | ${fmtMoney(audit.valid.lossTotal)} |`);
  L.push(`| Invalid | ${audit.invalid.count} | ${fmtMoney(audit.invalid.netPnl)} | ${fmtMoney(audit.invalid.expectancy)} | ${fmtPct(audit.invalid.winRate)} | ${audit.invalid.lossCount} | ${fmtMoney(audit.invalid.lossTotal)} |`);
  L.push(`| Unclassified | ${audit.unclassified.count} | ${fmtMoney(audit.unclassified.netPnl)} | — | — | — | — |`);
  L.push(`\n**Money lost to broken rules:** ${fmtMoney(audit.moneyLostToBrokenRules)}`);
  L.push('');

  // Weekly
  L.push(`## Weekly summaries`);
  L.push('');
  if (weeks.length === 0) {
    L.push('_No weeks with trades._');
  } else {
    for (const w of weeks.slice(0, 8)) {
      L.push(`### ${w.weekLabel}`);
      L.push(`Net ${fmtMoney(w.metrics.netPnl)} · ${w.metrics.n} trades · Win ${fmtPct(w.metrics.winRate)}`);
      if (w.summary.worked.length) L.push(`- **Worked:** ${w.summary.worked.join(' ')}`);
      if (w.summary.failed.length) L.push(`- **Failed:** ${w.summary.failed.join(' ')}`);
      if (w.summary.focus.length) L.push(`- **Focus next week:** ${w.summary.focus.join(' ')}`);
      L.push('');
    }
  }

  // Best / worst trades
  L.push(`## Best & worst trades`);
  L.push('');
  L.push(`**Best:**`);
  const bests = topTrades(trades, 3, 'win');
  L.push(bests.length ? bests.map(tradeLine).join('\n') : '_None._');
  L.push('');
  L.push(`**Worst:**`);
  const worsts = topTrades(trades, 3, 'loss');
  L.push(worsts.length ? worsts.map(tradeLine).join('\n') : '_None._');
  L.push('');

  // Notes summary (recent, compact)
  L.push(`## Notes (recent)`);
  L.push('');
  const noteTrades = [...trades].filter((t) => t.notes && t.notes.trim())
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 12);
  if (noteTrades.length === 0) {
    L.push('_No trade notes._');
  } else {
    for (const t of noteTrades) {
      L.push(`- **${t.date} ${t.symbol || ''}** (${fmtMoney(Number(t.pnl))}): ${t.notes.replace(/\s+/g, ' ').slice(0, 200)}`);
    }
  }
  L.push('');
  L.push('---');
  L.push('_Raw per-trade data is in the accompanying CSV export._');

  return L.join('\n');
}
