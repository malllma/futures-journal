// Pure analytics functions — no React, no Supabase. Just math on trade arrays.
// All functions accept the trades array (UI shape: pnl, market_type, setup, rules_followed, ...)
// and return computed metrics. Functions handle empty arrays gracefully.

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
    const p = Number(t.pnl) || 0;
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
  // Expectancy in $ per trade. If we don't have both a win-rate and avg loss, return null.
  const expectancy =
    winRate !== null && avgWin !== null && avgLoss !== null
      ? winRate * avgWin + lossRate * avgLoss
      : null;
  // Profit factor: |grossWin| / |grossLoss|. Infinity if no losses.
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
// Statistical edge analysis
// ============================================================================
// Mean per-trade P/L with 95% confidence interval (normal approximation).
// Honest verdict: requires n >= 30 before declaring anything.

export function computeEdge(trades) {
  const n = trades.length;
  if (n === 0) return { n: 0, verdict: 'no_data', mean: 0, sd: 0, se: 0, ciLow: 0, ciHigh: 0 };

  const pnls = trades.map((t) => Number(t.pnl) || 0);
  const mean = pnls.reduce((s, x) => s + x, 0) / n;
  // Sample variance (n-1 denominator)
  const variance =
    n > 1
      ? pnls.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1)
      : 0;
  const sd = Math.sqrt(variance);
  const se = sd / Math.sqrt(n);
  // 95% CI using normal approx. (For n>=30 the difference vs t-distribution is small.)
  const ciLow = mean - 1.96 * se;
  const ciHigh = mean + 1.96 * se;

  // Verdict — deliberately conservative.
  let verdict;
  if (n < 30) {
    verdict = 'insufficient_data';
  } else if (ciLow > 0) {
    verdict = 'edge_confirmed';
  } else if (ciHigh < 0) {
    verdict = 'negative_edge';
  } else {
    verdict = 'inconclusive';
  }

  return { n, verdict, mean, sd, se, ciLow, ciHigh };
}

// ============================================================================
// Grouped metrics
// ============================================================================

export function groupBy(trades, keyFn) {
  const groups = new Map();
  for (const t of trades) {
    const k = keyFn(t);
    if (k === null || k === undefined || k === '') {
      // bucket into 'Unclassified'
      const bucket = groups.get('__unclassified__') || [];
      bucket.push(t);
      groups.set('__unclassified__', bucket);
    } else {
      const bucket = groups.get(k) || [];
      bucket.push(t);
      groups.set(k, bucket);
    }
  }
  return groups;
}

export function metricsByGroup(trades, keyFn) {
  const groups = groupBy(trades, keyFn);
  const result = [];
  for (const [key, items] of groups.entries()) {
    result.push({
      key,
      label: key === '__unclassified__' ? 'Unclassified' : key,
      metrics: computeMetrics(items),
    });
  }
  // Sort: largest n first, unclassified last
  result.sort((a, b) => {
    if (a.key === '__unclassified__') return 1;
    if (b.key === '__unclassified__') return -1;
    return b.metrics.n - a.metrics.n;
  });
  return result;
}

// ============================================================================
// Loss audit — valid (rules followed) vs invalid (rules broken) losses
// ============================================================================

export function lossAudit(trades) {
  const losses = trades.filter((t) => Number(t.pnl) < 0);
  let valid = [], invalid = [], unclassified = [];
  for (const t of losses) {
    if (t.rules_followed === true) valid.push(t);
    else if (t.rules_followed === false) invalid.push(t);
    else unclassified.push(t);
  }
  const sumPnl = (arr) => arr.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  return {
    totalLosses: losses.length,
    validCount: valid.length,
    invalidCount: invalid.length,
    unclassifiedCount: unclassified.length,
    validTotal: sumPnl(valid),         // negative number
    invalidTotal: sumPnl(invalid),     // negative — money lost to discipline failures
    unclassifiedTotal: sumPnl(unclassified),
    validAvg: valid.length ? sumPnl(valid) / valid.length : null,
    invalidAvg: invalid.length ? sumPnl(invalid) / invalid.length : null,
  };
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
// CSV export
// ============================================================================

export function tradesToCSV(trades, dailyNotesMap) {
  // dailyNotesMap: { 'YYYY-MM-DD': 'note text' }
  const header = [
    'date', 'symbol', 'direction', 'quantity', 'entry', 'exit', 'pnl',
    'setup', 'market_type', 'rules_followed', 'rule_breaks',
    'loss_explanation', 'notes', 'daily_note',
  ];
  const rows = [header.join(',')];
  for (const t of trades) {
    const dailyNote = (dailyNotesMap && dailyNotesMap[t.date]) || '';
    const row = [
      t.date || '',
      t.symbol || '',
      t.direction || '',
      t.quantity ?? '',
      t.entry ?? '',
      t.exit ?? '',
      t.pnl ?? '',
      t.setup || '',
      t.market_type || '',
      t.rules_followed === true ? 'yes' : t.rules_followed === false ? 'no' : '',
      t.rule_breaks || '',
      t.loss_explanation || '',
      t.notes || '',
      dailyNote,
    ].map(csvEscape);
    rows.push(row.join(','));
  }
  return rows.join('\n');
}

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // If contains comma, quote, newline → wrap in quotes and double-up quotes
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ============================================================================
// Display formatters
// ============================================================================

export function fmtMoney(n, opts = {}) {
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

// ============================================================================
// Market type labels (human-readable for the 5 buckets)
// ============================================================================

export const MARKET_TYPES = [
  { value: 'bull_trend', label: 'Bullish trend', color: 'emerald' },
  { value: 'bear_trend', label: 'Bearish trend', color: 'rose' },
  { value: 'range',      label: 'Range',         color: 'blue' },
  { value: 'chop',       label: 'Chop',          color: 'yellow' },
  { value: 'news',       label: 'News day',      color: 'purple' },
];

export function marketTypeLabel(value) {
  if (!value) return 'Unclassified';
  const m = MARKET_TYPES.find((x) => x.value === value);
  return m ? m.label : value;
}
