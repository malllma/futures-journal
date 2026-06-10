// Pure analytics functions — no React, no Supabase. Just math on trade arrays.
// Import-safe from the browser app AND the Node self-test harness.
//
// All functions accept the trades array (UI shape: pnl, market_type, setup, setup_family,
// entry_trigger, rules_followed, mistake_type, ...) and return computed metrics.
// Functions handle empty arrays gracefully.

import {
  resolveSetupFamily, setupFamilyLabel, entryTriggerLabel,
  marketTypeLabel, mistakeLabel,
  isValidTrade, isInvalidTrade, classifyValidity,
} from './classification.js';

// Re-export label helpers + vocab so existing importers of analytics.js keep working
// (single source of truth lives in classification.js).
export {
  marketTypeLabel, setupFamilyLabel, entryTriggerLabel, mistakeLabel,
  resolveSetupFamily, isValidTrade, isInvalidTrade, classifyValidity,
} from './classification.js';
export { MARKET_TYPES, SETUP_FAMILIES, ENTRY_TRIGGERS } from './classification.js';

const num = (x) => { const v = Number(x); return Number.isFinite(v) ? v : 0; };
const sumPnl = (arr) => arr.reduce((s, t) => s + num(t.pnl), 0);

// ============================================================================
// Basic metrics
// ============================================================================

export function computeMetrics(trades) {
  const n = trades.length;
  if (n === 0) {
    return {
      n: 0, wins: 0, losses: 0, breakeven: 0,
      winRate: null, lossRate: null,
      grossWin: 0, grossLoss: 0, netPnl: 0,
      avgWin: null, avgLoss: null,
      expectancy: null, profitFactor: null,
      bestTrade: null, worstTrade: null,
    };
  }

  let wins = 0, losses = 0, breakeven = 0;
  let grossWin = 0, grossLoss = 0;
  let bestTrade = null, worstTrade = null;

  for (const t of trades) {
    const p = num(t.pnl);
    if (p > 0) { wins++; grossWin += p; }
    else if (p < 0) { losses++; grossLoss += p; } // grossLoss stays negative
    else { breakeven++; }
    if (bestTrade === null || p > bestTrade) bestTrade = p;
    if (worstTrade === null || p < worstTrade) worstTrade = p;
  }

  const winRate = (wins + losses) > 0 ? wins / (wins + losses) : null;
  const lossRate = winRate === null ? null : 1 - winRate;
  const netPnl = grossWin + grossLoss;
  const avgWin = wins > 0 ? grossWin / wins : null;
  const avgLoss = losses > 0 ? grossLoss / losses : null; // negative number
  const expectancy =
    winRate !== null && avgWin !== null && avgLoss !== null
      ? winRate * avgWin + lossRate * avgLoss
      : null;
  const profitFactor =
    grossLoss === 0
      ? (grossWin > 0 ? Infinity : null)
      : Math.abs(grossWin / grossLoss);

  return {
    n, wins, losses, breakeven,
    winRate, lossRate,
    grossWin, grossLoss, netPnl,
    avgWin, avgLoss,
    expectancy, profitFactor,
    bestTrade, worstTrade,
  };
}

// ============================================================================
// Statistical edge analysis — GRADED, plain-language (replaces binary verdict).  (#3)
// ============================================================================
// Counts EVERY trade with a usable numeric P/L (all valid logged trades).
// Verdicts: no_data | too_early | promising | stronger | no_edge — never a useless
// bare "inconclusive". Each comes with a plain-language explanation.

export const EDGE_EARLY_MIN = 10;   // meaningful early analysis starts here
export const EDGE_STRONG_MIN = 30;  // "statistically stronger" needs this + positive CI

// Two-tailed 95% Student-t critical value by sample size (honest for small n,
// converges to 1.96 for large n). Abbreviated table with linear interpolation.
function tCritical95(n) {
  const df = Math.max(1, n - 1);
  const table = {
    1: 12.71, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571, 6: 2.447, 7: 2.365,
    8: 2.306, 9: 2.262, 10: 2.228, 12: 2.179, 15: 2.131, 20: 2.086, 24: 2.064,
    30: 2.042, 40: 2.021, 60: 2.000, 120: 1.980,
  };
  if (table[df]) return table[df];
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (df >= keys[keys.length - 1]) return 1.96;
  let lo = keys[0], hi = keys[keys.length - 1];
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] <= df) lo = keys[i];
    if (keys[i] >= df) { hi = keys[i]; break; }
  }
  if (lo === hi) return table[lo];
  return table[lo] + (table[hi] - table[lo]) * ((df - lo) / (hi - lo));
}

export function computeEdge(trades) {
  const pnls = trades.map((t) => Number(t.pnl)).filter((x) => Number.isFinite(x));
  const n = pnls.length;

  if (n === 0) {
    return {
      n: 0, verdict: 'no_data', label: 'No data',
      explanation: 'Log some trades to start edge analysis.',
      mean: 0, sd: 0, se: 0, ciLow: 0, ciHigh: 0, tCrit: 0,
    };
  }

  const mean = pnls.reduce((s, x) => s + x, 0) / n;
  const variance = n > 1 ? pnls.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1) : 0;
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  const tCrit = tCritical95(n);
  const ciLow = mean - tCrit * se;
  const ciHigh = mean + tCrit * se;

  let verdict, label, explanation;
  if (n < EDGE_EARLY_MIN) {
    verdict = 'too_early';
    label = 'Too early';
    explanation =
      `Only ${n} trade${n === 1 ? '' : 's'} logged. That's too few to say anything statistical — ` +
      `even a coin flip can look lopsided over ${n} flips. Keep logging; meaningful edge analysis ` +
      `starts around ${EDGE_EARLY_MIN} trades.`;
  } else if (ciHigh < 0) {
    verdict = 'no_edge';
    label = 'No edge detected';
    explanation =
      `Across ${n} trades you average ${fmtMoney(mean)} per trade, and even the optimistic end of the ` +
      `range stays below zero. On this data you don't have a positive edge yet — find what's leaking ` +
      `money (check the mistake-cost and invalid-trade sections) before sizing up.`;
  } else if (ciLow > 0 && n >= EDGE_STRONG_MIN) {
    verdict = 'stronger';
    label = 'Statistically stronger';
    explanation =
      `Across ${n} trades you average ${fmtMoney(mean)} per trade and the entire 95% range stays above ` +
      `zero. With ${EDGE_STRONG_MIN}+ trades that's a statistically stronger signal the edge is real. ` +
      `Keep doing what's working and protect it.`;
  } else if (mean > 0) {
    verdict = 'promising';
    label = 'Promising but unproven';
    explanation =
      `You have enough trades to start early edge analysis. Your results are promising — you average ` +
      `${fmtMoney(mean)} per trade — but the sample is still not strong enough to statistically prove the ` +
      `edge yet (the 95% range still dips below zero). Keep following your rules and logging.`;
  } else {
    verdict = 'no_edge';
    label = 'No edge detected';
    explanation =
      `Across ${n} trades you average ${fmtMoney(mean)} per trade and the range straddles zero, leaning ` +
      `flat-to-negative. No positive edge is showing yet — cutting the invalid / rule-break trades is the ` +
      `fastest lever. Re-check after a few more clean trades.`;
  }

  return { n, verdict, label, explanation, mean, sd, se, ciLow, ciHigh, tCrit };
}

// ============================================================================
// Grouped metrics
// ============================================================================

export function groupBy(trades, keyFn) {
  const groups = new Map();
  for (const t of trades) {
    const k = keyFn(t);
    const bucket = (k === null || k === undefined || k === '') ? '__unclassified__' : k;
    const arr = groups.get(bucket) || [];
    arr.push(t);
    groups.set(bucket, arr);
  }
  return groups;
}

export function metricsByGroup(trades, keyFn, labelFn) {
  const groups = groupBy(trades, keyFn);
  const result = [];
  for (const [key, items] of groups.entries()) {
    result.push({
      key,
      label: key === '__unclassified__' ? 'Unclassified' : (labelFn ? labelFn(key) : key),
      metrics: computeMetrics(items),
      trades: items,
    });
  }
  result.sort((a, b) => {
    if (a.key === '__unclassified__') return 1;
    if (b.key === '__unclassified__') return -1;
    return b.metrics.n - a.metrics.n;
  });
  return result;
}

// Normalize legacy 'range' market type into the 'chop' bucket for grouping.
const marketKey = (t) => {
  const v = t.market_type;
  if (!v) return null;
  return v === 'range' ? 'chop' : v;
};

export const setupFamilyGroups = (trades) =>
  metricsByGroup(trades, (t) => resolveSetupFamily(t), setupFamilyLabel);

export const rawSetupGroups = (trades) =>
  metricsByGroup(trades, (t) => (t.setup ? t.setup.trim().toLowerCase() : null), (k) => k);

export const entryTriggerGroups = (trades) =>
  metricsByGroup(trades, (t) => t.entry_trigger || null, entryTriggerLabel);

export const marketTypeGroups = (trades) =>
  metricsByGroup(trades, marketKey, marketTypeLabel);

// Setup + trigger combination (#6)
export const setupTriggerGroups = (trades) =>
  metricsByGroup(
    trades,
    (t) => {
      const f = resolveSetupFamily(t);
      const tr = t.entry_trigger || null;
      if (!f && !tr) return null;
      return `${f || 'unknown'}|${tr || 'none'}`;
    },
    (k) => {
      const [f, tr] = k.split('|');
      const fl = f === 'unknown' ? 'Unknown setup' : setupFamilyLabel(f);
      const trl = tr === 'none' ? 'no trigger' : entryTriggerLabel(tr);
      return `${fl} + ${trl}`;
    }
  );

// Pick best / worst group by expectancy (fallback net P/L), ignoring Unclassified
// and groups with too few trades to be meaningful.
export function pickBestWorst(groups, minN = 2) {
  const eligible = groups.filter((g) => g.key !== '__unclassified__' && g.metrics.n >= minN);
  if (eligible.length === 0) return { best: null, worst: null };
  const score = (g) => (g.metrics.expectancy != null ? g.metrics.expectancy : g.metrics.netPnl / Math.max(1, g.metrics.n));
  const sorted = [...eligible].sort((a, b) => score(b) - score(a));
  return { best: sorted[0], worst: sorted[sorted.length - 1] };
}

// ============================================================================
// Mistake-cost analysis (#9)
// ============================================================================

export function mistakeCostAnalysis(trades) {
  const losers = trades.filter((t) => num(t.pnl) < 0);
  const totalLoss = sumPnl(losers); // negative

  // A trade carries a mistake if mistake_type is set, OR rules were broken (fallback 'other').
  const keyed = new Map();
  for (const t of trades) {
    let key = t.mistake_type || null;
    if (!key && t.rules_followed === false) key = 'other';
    if (!key) continue;
    const arr = keyed.get(key) || [];
    arr.push(t);
    keyed.set(key, arr);
  }

  const rows = [];
  for (const [key, items] of keyed.entries()) {
    const lossItems = items.filter((t) => num(t.pnl) < 0);
    const totalPnl = sumPnl(items);
    const lossPnl = sumPnl(lossItems); // negative
    rows.push({
      key,
      label: mistakeLabel(key),
      count: items.length,
      lossCount: lossItems.length,
      totalPnl,                                         // net P/L impact (may include the odd win)
      lossPnl,                                          // money lost on this mistake
      avgLoss: lossItems.length ? lossPnl / lossItems.length : null,
      pctOfLosses: totalLoss < 0 ? lossPnl / totalLoss : null, // share of all loss $
    });
  }
  // Most expensive (most negative net) first.
  rows.sort((a, b) => a.totalPnl - b.totalPnl);
  return { rows, mostExpensive: rows[0] || null, totalLoss };
}

// ============================================================================
// Valid vs invalid audit (#10)
// ============================================================================

export function validInvalidAudit(trades) {
  const valid = trades.filter(isValidTrade);
  const invalid = trades.filter(isInvalidTrade);
  const unclassified = trades.filter((t) => classifyValidity(t) === 'unclassified');

  const vM = computeMetrics(valid);
  const iM = computeMetrics(invalid);
  const uM = computeMetrics(unclassified);

  const validLosses = valid.filter((t) => num(t.pnl) < 0);
  const invalidLosses = invalid.filter((t) => num(t.pnl) < 0);

  return {
    valid: {
      count: valid.length, netPnl: vM.netPnl, expectancy: vM.expectancy,
      winRate: vM.winRate, lossCount: validLosses.length, lossTotal: sumPnl(validLosses),
    },
    invalid: {
      count: invalid.length, netPnl: iM.netPnl, expectancy: iM.expectancy,
      winRate: iM.winRate, lossCount: invalidLosses.length, lossTotal: sumPnl(invalidLosses),
    },
    unclassified: { count: unclassified.length, netPnl: uM.netPnl },
    moneyLostToBrokenRules: iM.netPnl, // net of invalid trades — usually negative
  };
}

// Kept for backward-compatibility (older callers). Losses-only valid/invalid split.
export function lossAudit(trades) {
  const losses = trades.filter((t) => num(t.pnl) < 0);
  const valid = [], invalid = [], unclassified = [];
  for (const t of losses) {
    if (t.rules_followed === true) valid.push(t);
    else if (t.rules_followed === false) invalid.push(t);
    else unclassified.push(t);
  }
  return {
    totalLosses: losses.length,
    validCount: valid.length, invalidCount: invalid.length, unclassifiedCount: unclassified.length,
    validTotal: sumPnl(valid), invalidTotal: sumPnl(invalid), unclassifiedTotal: sumPnl(unclassified),
    validAvg: valid.length ? sumPnl(valid) / valid.length : null,
    invalidAvg: invalid.length ? sumPnl(invalid) / invalid.length : null,
  };
}

// ============================================================================
// Consolidated edge report object (#3 — the full stat block in one call)
// ============================================================================

export function computeEdgeReport(trades) {
  const m = computeMetrics(trades);
  const edge = computeEdge(trades);
  const audit = validInvalidAudit(trades);
  const setups = setupFamilyGroups(trades);
  const markets = marketTypeGroups(trades);
  const { best: bestSetup, worst: worstSetup } = pickBestWorst(setups);
  const { best: bestMarket, worst: worstMarket } = pickBestWorst(markets);

  return {
    n: m.n,
    winRate: m.winRate,
    netPnl: m.netPnl,
    avgWin: m.avgWin,
    avgLoss: m.avgLoss,
    expectancy: m.expectancy,
    profitFactor: m.profitFactor,
    bestTrade: m.bestTrade,
    worstTrade: m.worstTrade,
    validExpectancy: audit.valid.expectancy,
    invalidCost: audit.invalid.netPnl,
    bestSetup, worstSetup, bestMarket, worstMarket,
    edge, audit, setups, markets,
  };
}

// ============================================================================
// Weekly summaries (#11) — replaces per-day note clicking
// ============================================================================

// Monday-anchored ISO-ish week start (computed in UTC so plain YYYY-MM-DD dates
// don't drift across timezones).
export function weekStartMonday(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();            // 0 Sun .. 6 Sat
  const diff = dow === 0 ? -6 : 1 - dow; // step back to Monday
  dt.setUTCDate(dt.getUTCDate() + diff);
  return dt.toISOString().slice(0, 10);
}

function niceWeekLabel(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `Week of ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
}

// notesMap: { 'YYYY-MM-DD': 'daily note text' } (optional)
export function weeklySummaries(trades, notesMap = {}) {
  const byWeek = new Map();
  for (const t of trades) {
    if (!t.date) continue;
    const wk = weekStartMonday(t.date);
    const arr = byWeek.get(wk) || [];
    arr.push(t);
    byWeek.set(wk, arr);
  }
  // also seed weeks that only have a daily note
  for (const date of Object.keys(notesMap || {})) {
    if (!date) continue;
    const wk = weekStartMonday(date);
    if (!byWeek.has(wk)) byWeek.set(wk, []);
  }

  const weeks = [];
  for (const [weekStart, wkTrades] of byWeek.entries()) {
    const metrics = computeMetrics(wkTrades);
    const setups = setupFamilyGroups(wkTrades);
    const markets = marketTypeGroups(wkTrades);
    const { best: bestSetup, worst: worstSetup } = pickBestWorst(setups, 1);
    const { best: bestMarket, worst: worstMarket } = pickBestWorst(markets, 1);
    const mistakes = mistakeCostAnalysis(wkTrades);
    const audit = validInvalidAudit(wkTrades);

    // collect notes for the week (trade notes + daily notes), grouped readably
    const dates = [...new Set(wkTrades.map((t) => t.date))].sort();
    const noteItems = [];
    for (const t of wkTrades) {
      if (t.notes && t.notes.trim()) {
        noteItems.push({ date: t.date, symbol: t.symbol, pnl: num(t.pnl), text: t.notes.trim() });
      }
    }
    const dailyNotes = [];
    for (const date of new Set([...dates, ...Object.keys(notesMap || {}).filter((d) => weekStartMonday(d) === weekStart)])) {
      if (notesMap && notesMap[date] && notesMap[date].trim()) {
        dailyNotes.push({ date, text: notesMap[date].trim() });
      }
    }

    // rules-based coaching lines
    const worked = [];
    const failed = [];
    const focus = [];
    if (bestSetup) worked.push(`${bestSetup.label} was your best setup (${fmtMoney(bestSetup.metrics.netPnl)}, ${bestSetup.metrics.n} trade${bestSetup.metrics.n === 1 ? '' : 's'}).`);
    if (bestMarket) worked.push(`You traded ${bestMarket.label.toLowerCase()} conditions well (${fmtMoney(bestMarket.metrics.netPnl)}).`);
    if (metrics.winRate != null && metrics.winRate >= 0.5) worked.push(`Win rate held at ${fmtPct(metrics.winRate)}.`);

    if (worstSetup && worstSetup.metrics.netPnl < 0) failed.push(`${worstSetup.label} lost money (${fmtMoney(worstSetup.metrics.netPnl)}).`);
    if (worstMarket && worstMarket.metrics.netPnl < 0) failed.push(`${worstMarket.label} hurt you (${fmtMoney(worstMarket.metrics.netPnl)}).`);
    if (audit.invalid.count > 0) failed.push(`${audit.invalid.count} invalid / rule-break trade${audit.invalid.count === 1 ? '' : 's'} cost ${fmtMoney(audit.invalid.netPnl)}.`);

    if (mistakes.mostExpensive) focus.push(`Cut "${mistakes.mostExpensive.label}" — your costliest mistake this week (${fmtMoney(mistakes.mostExpensive.totalPnl)}).`);
    if (worstSetup && worstSetup.metrics.netPnl < 0) focus.push(`Avoid or refine ${worstSetup.label} until it proves itself.`);
    if (audit.invalid.netPnl < 0 && audit.valid.netPnl > 0) focus.push(`Your valid trades made ${fmtMoney(audit.valid.netPnl)} — protect that by skipping the invalid ones.`);
    if (focus.length === 0) focus.push('Keep logging and following your rules — nothing major to change.');

    weeks.push({
      weekStart,
      weekLabel: niceWeekLabel(weekStart),
      metrics,
      bestSetup, worstSetup, bestMarket, worstMarket,
      commonMistakes: mistakes.rows.slice(0, 3),
      ruleBreak: { count: audit.invalid.lossCount, total: audit.invalid.lossTotal },
      audit,
      noteItems, dailyNotes,
      summary: { worked, failed, focus },
    });
  }

  weeks.sort((a, b) => b.weekStart.localeCompare(a.weekStart)); // newest first
  return weeks;
}

// ============================================================================
// Filters (#13)
// ============================================================================

export const TRADE_FILTERS = [
  { value: 'all',          label: 'All trades' },
  { value: 'valid',        label: 'Valid only' },
  { value: 'invalid',      label: 'Invalid only' },
  { value: 'sr',           label: 'S&R only' },
  { value: 'vwap',         label: 'VWAP only' },
  { value: 'trendline',    label: 'Trendline only' },
  { value: 'confluence',   label: 'Confluence only' },
  { value: 'no_setup',     label: 'No-setup only' },
  { value: 'exclude_news', label: 'Exclude news' },
  { value: 'news',         label: 'News days only' },
  { value: 'trend',        label: 'Trend days only' },
  { value: 'chop',         label: 'Chop/range only' },
  { value: 'last20',       label: 'Last 20' },
  { value: 'last30',       label: 'Last 30' },
  { value: 'eval',         label: 'Eval only' },
];

export const hasEvalTrades = (trades) => trades.some((t) => t.is_eval === true);

function lastN(trades, k) {
  return [...trades]
    .sort((a, b) => {
      const d = (b.date || '').localeCompare(a.date || '');
      if (d !== 0) return d;
      return (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || '');
    })
    .slice(0, k);
}

export function applyTradeFilter(trades, filter) {
  switch (filter) {
    case 'valid':        return trades.filter(isValidTrade);
    case 'invalid':      return trades.filter(isInvalidTrade);
    case 'sr':           return trades.filter((t) => resolveSetupFamily(t) === 'support_resistance');
    case 'vwap':         return trades.filter((t) => resolveSetupFamily(t) === 'vwap');
    case 'trendline':    return trades.filter((t) => resolveSetupFamily(t) === 'trendline');
    case 'confluence':   return trades.filter((t) => resolveSetupFamily(t) === 'confluence');
    case 'no_setup':     return trades.filter((t) => resolveSetupFamily(t) === 'no_setup');
    case 'exclude_news': return trades.filter((t) => t.market_type !== 'news');
    case 'news':         return trades.filter((t) => t.market_type === 'news');
    case 'trend':        return trades.filter((t) => ['bull_trend', 'bear_trend', 'breakout'].includes(t.market_type));
    case 'chop':         return trades.filter((t) => t.market_type === 'chop' || t.market_type === 'range');
    case 'last20':       return lastN(trades, 20);
    case 'last30':       return lastN(trades, 30);
    case 'eval':         return trades.filter((t) => t.is_eval === true);
    case 'all':
    default:             return trades;
  }
}

// ============================================================================
// Date range filtering
// ============================================================================

export function filterByDateRange(trades, range) {
  if (range === 'all') return trades;
  const now = new Date();
  const cutoff = new Date(now);
  if (range === '7d') cutoff.setDate(now.getDate() - 7);
  else if (range === '30d') cutoff.setDate(now.getDate() - 30);
  else if (range === '90d') cutoff.setDate(now.getDate() - 90);
  else if (range === 'ytd') {
    cutoff.setMonth(0); cutoff.setDate(1);
    cutoff.setHours(0, 0, 0, 0);
  } else return trades;
  const cutoffYmd = cutoff.toISOString().slice(0, 10);
  return trades.filter((t) => t.date >= cutoffYmd);
}

// ============================================================================
// Display formatters
// ============================================================================

export function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}$${str}`;
}

export function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

export function fmtNumber(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimals);
}

export function fmtPF(pf) {
  if (pf === null || pf === undefined) return '—';
  if (!isFinite(pf)) return '∞';
  return pf.toFixed(2);
}
