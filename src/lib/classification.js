// classification.js — the non-destructive bridge between old messy labels and the
// new standardized categories. Pure functions, no React / no Supabase, so this file
// is import-safe from both the browser app and the Node self-test harness.
//
// Design rules:
//   * The old free-text `setup` field is NEVER rewritten. When a trade has no explicit
//     `setup_family`, we DERIVE one at read-time from its raw text via keyword mapping.
//   * Every vocabulary is a {value, label} list so the UI renders clean dropdowns while
//     the DB stores compact values.
//   * Suggestions are suggestions — callers fill only empty fields, never overwrite.

// ============================================================================
// Controlled vocabularies (value + human label)  — used for dropdowns + display
// ============================================================================

// --- Setup families (#5) ---
export const SETUP_FAMILIES = [
  { value: 'support_resistance', label: 'Support & Resistance', short: 'S&R' },
  { value: 'vwap',              label: 'VWAP',                  short: 'VWAP' },
  { value: 'trendline',         label: 'Trendline',             short: 'Trendline' },
  { value: 'confluence',        label: 'Confluence',            short: 'Confluence' },
  { value: 'no_setup',          label: 'No setup',              short: 'No setup' },
];

// --- Entry triggers (#6) — separate from setup ---
export const ENTRY_TRIGGERS = [
  { value: 'rejection',              label: 'Rejection' },
  { value: 'break_and_hold',         label: 'Break and hold' },
  { value: 'retest_hold',            label: 'Retest hold' },
  { value: 'liquidity_sweep',        label: 'Liquidity sweep' },
  { value: 'higher_low',             label: 'Higher low' },
  { value: 'lower_high',             label: 'Lower high' },
  { value: 'momentum_continuation',  label: 'Momentum continuation' },
  { value: 'vwap_reclaim',           label: 'VWAP reclaim' },
  { value: 'vwap_loss',              label: 'VWAP loss' },
  { value: 'failed_breakout',        label: 'Failed breakout' },
  { value: 'failed_breakdown',       label: 'Failed breakdown' },
];

// --- Market types (#8) — extended. `range` is a legacy value kept for old rows. ---
export const MARKET_TYPES = [
  { value: 'bull_trend', label: 'Bull trend',           color: 'emerald' },
  { value: 'bear_trend', label: 'Bear trend',           color: 'rose' },
  { value: 'chop',       label: 'Chop / range',         color: 'yellow' },
  { value: 'news',       label: 'News day',             color: 'purple' },
  { value: 'reversal',   label: 'Reversal day',         color: 'orange' },
  { value: 'breakout',   label: 'Breakout day',         color: 'blue' },
  { value: 'slow',       label: 'Slow / low-volume day', color: 'neutral' },
];
// Legacy 'range' rows display under the same "Chop / range" bucket.
const MARKET_TYPE_LABELS = { ...Object.fromEntries(MARKET_TYPES.map((m) => [m.value, m.label])), range: 'Chop / range' };

// --- Execution quality (#4) ---
export const EXECUTION_QUALITY = [
  { value: 'clean',           label: 'Clean entry' },
  { value: 'late',            label: 'Late entry' },
  { value: 'early',           label: 'Early entry' },
  { value: 'chased',          label: 'Chased' },
  { value: 'hesitated',       label: 'Hesitated' },
  { value: 'reentered_badly', label: 'Re-entered badly' },
];

// --- Mistake types (#9) ---
export const MISTAKE_TYPES = [
  { value: 'no_setup',         label: 'No setup' },
  { value: 'trigger_missing',  label: 'Trigger missing' },
  { value: 'chased',           label: 'Chased entry' },
  { value: 'late',             label: 'Late entry' },
  { value: 'early',            label: 'Early entry' },
  { value: 'oversized',        label: 'Oversized' },
  { value: 'revenge',          label: 'Revenge trade' },
  { value: 'overtrading',      label: 'Overtrading' },
  { value: 'ignored_news',     label: 'Ignored news risk' },
  { value: 'moved_stop',       label: 'Moved stop loss' },
  { value: 'cut_winner',       label: 'Cut winner too early' },
  { value: 'held_loser',       label: 'Held loser too long' },
  { value: 'broke_loss_limit', label: 'Broke daily loss limit' },
  { value: 'other',            label: 'Other' },
];

// Mistakes that, when present, mean the trade was NOT a clean rule-following trade.
const DISCIPLINE_FAILURE_MISTAKES = new Set([
  'no_setup', 'trigger_missing', 'chased', 'oversized', 'revenge',
  'overtrading', 'ignored_news', 'moved_stop', 'broke_loss_limit',
]);

// --- No-trade reasons (#12) ---
export const NO_TRADE_REASONS = [
  { value: 'no_setup',             label: 'No setup' },
  { value: 'too_choppy',           label: 'Too choppy' },
  { value: 'news_risk',            label: 'News risk' },
  { value: 'missed_entry',         label: 'Missed entry' },
  { value: 'already_hit_target',   label: 'Already hit target' },
  { value: 'not_ready',            label: 'Emotionally not ready' },
  { value: 'waiting_confirmation', label: 'Waiting for confirmation' },
  { value: 'other',                label: 'Other' },
];

// ============================================================================
// Generic label lookup
// ============================================================================

function labelFromList(list, value, fallback = 'Unclassified') {
  if (!value) return fallback;
  const hit = list.find((x) => x.value === value);
  return hit ? hit.label : value;
}

export const setupFamilyLabel    = (v) => labelFromList(SETUP_FAMILIES, v);
export const entryTriggerLabel   = (v) => labelFromList(ENTRY_TRIGGERS, v, 'None');
export const executionLabel      = (v) => labelFromList(EXECUTION_QUALITY, v, '—');
export const mistakeLabel        = (v) => labelFromList(MISTAKE_TYPES, v, 'None');
export const noTradeReasonLabel  = (v) => labelFromList(NO_TRADE_REASONS, v, '—');
export const marketTypeLabel     = (v) => (v ? (MARKET_TYPE_LABELS[v] || v) : 'Unclassified');

// ============================================================================
// Keyword matcher
// ============================================================================

function norm(s) { return (s == null ? '' : String(s)).toLowerCase(); }

// Match a keyword in text. Short alphanumeric tokens (<=4 chars, e.g. PDH/ORL/HL)
// use word boundaries to avoid false positives inside longer words; multi-word /
// longer keywords use a plain substring test.
function hasKw(text, kw) {
  if (!text || !kw) return false;
  const k = kw.toLowerCase();
  if (/^[a-z0-9]{1,4}$/.test(k)) {
    const re = new RegExp(`(^|[^a-z0-9])${k}([^a-z0-9]|$)`);
    return re.test(text);
  }
  return text.includes(k);
}
const anyKw = (text, kws) => kws.some((k) => hasKw(text, k));

// ---- keyword banks ----------------------------------------------------------

const NO_SETUP_KW = ['no setup', 'no plan', 'random', 'fomo', 'chase', 'chasing', 'chased',
  'revenge', 'emotional', 'forced', 'forced trade', 'yolo', 'boredom', 'bored', 'tilt'];

// Note: deliberately excludes generic trigger words like 'bounce', 'rejection',
// 'liquidity' — those describe HOW you entered, not the setup family, and would
// wrongly pull e.g. "trendline bounce" or "VWAP bounce" into Support & Resistance.
const SR_KW = ['pdh', 'pdl', 'orh', 'orl', 'previous high', 'previous low', 'prev high', 'prev low',
  'support', 'resistance', 's/r', 's&r', 'sr level', 'key level', 'breakout and retest',
  'break and retest', 'range high', 'range low', 'supply', 'demand', 'level'];

const VWAP_KW = ['vwap'];

const TRENDLINE_KW = ['trendline', 'trend line', 'tl break', 'tl bounce', 'trend-line'];

const TRIGGER_KW = {
  vwap_reclaim:          ['vwap reclaim', 'reclaim vwap', 'reclaimed vwap', 'reclaim'],
  vwap_loss:             ['vwap loss', 'lost vwap', 'vwap fail', 'lose vwap', 'below vwap'],
  failed_breakout:       ['failed breakout', 'failed break', 'false breakout', 'fakeout', 'fake out'],
  failed_breakdown:      ['failed breakdown', 'failed flush', 'failed breakdwn'],
  liquidity_sweep:       ['liquidity sweep', 'sweep', 'swept', 'stop run', 'stop hunt', 'stop-run'],
  break_and_hold:        ['break and hold', 'broke and held', 'break hold', 'breakout hold', 'held the break'],
  retest_hold:           ['retest', 're-test', 'retested', 'backtest'],
  higher_low:            ['higher low', 'higher-low', ' hl ', 'hl hold'],
  lower_high:            ['lower high', 'lower-high', ' lh ', 'lh hold'],
  momentum_continuation: ['momentum', 'continuation', 'momo', 'trend continuation'],
  rejection:             ['rejection', 'rejected', 'reject ', 'wick rejection'],
};
// Order in which triggers are checked (more specific first).
const TRIGGER_ORDER = ['vwap_reclaim', 'vwap_loss', 'failed_breakout', 'failed_breakdown',
  'liquidity_sweep', 'break_and_hold', 'retest_hold', 'higher_low', 'lower_high',
  'momentum_continuation', 'rejection'];

const MARKET_KW = {
  news:       ['news', 'cpi', 'fomc', 'nfp', 'ppi', 'jobs report', 'fed ', 'powell', 'data drop', 'econ data'],
  reversal:   ['reversal', 'reversed', 'v-shape', 'v reversal', 'v-reversal', 'failed trend', 'turned around'],
  breakout:   ['breakout day', 'broke out', 'range break', 'expansion', 'trend day up', 'trend day'],
  bull_trend: ['uptrend', 'bullish', 'bull trend', 'trending up', 'strong up', 'grind up'],
  bear_trend: ['downtrend', 'bearish', 'bear trend', 'trending down', 'strong down', 'grind down'],
  slow:       ['low volume', 'low-volume', 'slow', 'dead', 'thin', 'holiday', 'lunch', 'no volume'],
  chop:       ['chop', 'choppy', 'range', 'ranging', 'sideways', 'balance', 'two-sided', 'whippy'],
};
const MARKET_ORDER = ['news', 'reversal', 'breakout', 'bull_trend', 'bear_trend', 'slow', 'chop'];

const MISTAKE_KW = {
  revenge:          ['revenge'],
  oversized:        ['oversized', 'over-sized', 'too big', 'too many contracts', 'overleveraged', 'sized up', 'max size'],
  chased:           ['chase', 'chased', 'chasing'],
  no_setup:         ['no setup', 'no plan', 'random', 'forced'],
  trigger_missing:  ['no trigger', 'trigger missing', 'no confirmation', 'no confirm', 'early no trigger'],
  moved_stop:       ['moved stop', 'move stop', 'moved my stop', 'widened stop', 'pulled stop'],
  broke_loss_limit: ['loss limit', 'daily limit', 'max loss', 'blew limit'],
  overtrading:      ['overtrade', 'overtrading', 'too many trades', 'overtraded'],
  ignored_news:     ['ignored news', 'into news', 'news risk', 'traded the news'],
  cut_winner:       ['cut winner', 'exited early', 'took profit early', 'sold too early', 'cut it short', 'paper hands'],
  held_loser:       ['held loser', 'held too long', "didn't cut", 'did not cut', 'hoping', 'hope trade', 'no stop'],
  late:             ['late entry', 'too late', 'entered late'],
  early:            ['early entry', 'too early', 'entered early', 'jumped early'],
};
const MISTAKE_ORDER = ['revenge', 'oversized', 'chased', 'broke_loss_limit', 'moved_stop',
  'overtrading', 'ignored_news', 'cut_winner', 'held_loser', 'no_setup', 'trigger_missing', 'late', 'early'];

// ============================================================================
// Mapping: old raw setup text -> standardized setup family
// ============================================================================

export function setupFamilyFromRaw(raw) {
  const t = norm(raw);
  if (!t.trim()) return null;
  // Discipline-failure language means there was no real edge → "no setup".
  if (anyKw(t, NO_SETUP_KW)) return 'no_setup';
  const fams = [];
  if (anyKw(t, SR_KW)) fams.push('support_resistance');
  if (anyKw(t, VWAP_KW)) fams.push('vwap');
  if (anyKw(t, TRENDLINE_KW)) fams.push('trendline');
  if (fams.length >= 2) return 'confluence';
  if (fams.length === 1) return fams[0];
  return null; // unknown — stays "Unclassified", user can set it explicitly
}

// Explicit field wins; otherwise derive from the raw `setup` text (non-destructive).
export function resolveSetupFamily(trade) {
  if (!trade) return null;
  if (trade.setup_family) return trade.setup_family;
  return setupFamilyFromRaw(trade.setup);
}

// ============================================================================
// Valid vs invalid classification (#10)
// ============================================================================
// Valid   = rules followed AND a setup + trigger were present (risk defined).
// Invalid = rules broken, OR setup/trigger explicitly missing, OR a discipline-failure mistake.
// Unclassified = not enough review info yet (old un-reviewed trades).
//
// A trade only becomes "valid" when you explicitly marked rules-followed = Yes. That is
// intentional: the whole point is to measure "am I profitable only when I follow my rules".

export function classifyValidity(trade) {
  if (!trade) return 'unclassified';
  const rules = trade.rules_followed;            // true | false | null
  const setupPresent = trade.setup_present;       // true | false | null
  const triggerPresent = trade.trigger_present;   // true | false | null
  const mistake = trade.mistake_type || null;

  // Hard invalid signals
  if (rules === false) return 'invalid';
  if (setupPresent === false || triggerPresent === false) return 'invalid';
  if (mistake && DISCIPLINE_FAILURE_MISTAKES.has(mistake)) return 'invalid';

  // Valid only when rules were explicitly followed and nothing contradicts it.
  if (rules === true && setupPresent !== false && triggerPresent !== false) return 'valid';

  return 'unclassified';
}

export const isValidTrade   = (t) => classifyValidity(t) === 'valid';
export const isInvalidTrade = (t) => classifyValidity(t) === 'invalid';

// ============================================================================
// Auto-suggest labels from notes (#19) — keyword-based, suggestion only
// ============================================================================
// Returns an object with ONLY the keys it could infer. The caller decides whether
// to apply each (and only into empty fields). Nothing is ever auto-saved.

export function suggestLabelsFromNotes(notes, setup) {
  const text = `${norm(setup)} ${norm(notes)}`.trim();
  const out = {};
  if (!text) return out;

  const fam = setupFamilyFromRaw(text);
  if (fam) out.setup_family = fam;

  for (const key of TRIGGER_ORDER) {
    if (anyKw(text, TRIGGER_KW[key])) { out.entry_trigger = key; break; }
  }
  for (const key of MARKET_ORDER) {
    if (anyKw(text, MARKET_KW[key])) { out.market_type = key; break; }
  }
  for (const key of MISTAKE_ORDER) {
    if (anyKw(text, MISTAKE_KW[key])) { out.mistake_type = key; break; }
  }

  // Validity hint: discipline-failure language → suggest "rules NOT followed".
  if (anyKw(text, NO_SETUP_KW) || out.mistake_type) {
    if (out.mistake_type && DISCIPLINE_FAILURE_MISTAKES.has(out.mistake_type)) out.rules_followed = false;
    else if (anyKw(text, NO_SETUP_KW)) out.rules_followed = false;
  }
  return out;
}
