import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Download, AlertTriangle, CheckCircle2,
  HelpCircle, BarChart3, Layers, ShieldCheck, FileText, Calendar,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import {
  computeMetrics, computeEdge, metricsByGroup, lossAudit,
  filterByDateRange, tradesToCSV,
  fmtMoney, fmtPct, fmtNumber, marketTypeLabel, MARKET_TYPES,
} from './lib/analytics';

// ============================================================================
// Main page
// ============================================================================

export default function Analytics({ user }) {
  const [trades, setTrades] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]); // [{date, note, updated_at}]
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(null);
  const [range, setRange] = useState('all'); // 'all' | '7d' | '30d' | '90d' | 'ytd'

  // ---- Load trades + daily notes ----
  const loadAll = useCallback(async () => {
    const [tradesRes, notesRes] = await Promise.all([
      supabase.from('trades').select('*').order('date', { ascending: false }),
      supabase.from('daily_notes').select('*').order('date', { ascending: false }),
    ]);
    if (tradesRes.error) { setErr(`Trades load failed: ${tradesRes.error.message}`); return; }
    if (notesRes.error) {
      // daily_notes table might not exist yet if migration wasn't run; degrade gracefully
      console.warn('daily_notes load failed:', notesRes.error.message);
      setDailyNotes([]);
    } else {
      setDailyNotes(notesRes.data || []);
    }
    setTrades(tradesRes.data || []);
    setErr(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAll();
      if (mounted) setLoaded(true);
    })();
    const ch = supabase
      .channel(`analytics-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_notes' }, loadAll)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [user.id, loadAll]);

  // ---- Filtered trades ----
  const filtered = useMemo(() => filterByDateRange(trades, range), [trades, range]);
  const overall = useMemo(() => computeMetrics(filtered), [filtered]);
  const edge = useMemo(() => computeEdge(filtered), [filtered]);
  const byMarket = useMemo(() => metricsByGroup(filtered, (t) => t.market_type), [filtered]);
  const bySetup = useMemo(
    () => metricsByGroup(filtered, (t) => (t.setup ? t.setup.trim().toLowerCase() : null)),
    [filtered]
  );
  const audit = useMemo(() => lossAudit(filtered), [filtered]);

  const notesMap = useMemo(() => {
    const m = {};
    for (const n of dailyNotes) m[n.date] = n.note;
    return m;
  }, [dailyNotes]);

  // ---- CSV export ----
  const exportCSV = () => {
    const csv = tradesToCSV(filtered, notesMap);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- Daily note CRUD ----
  const saveDailyNote = async (date, note) => {
    const existing = dailyNotes.find((n) => n.date === date);
    if (note.trim() === '') {
      // Delete the note
      if (existing) {
        await supabase.from('daily_notes').delete().eq('id', existing.id);
        await loadAll();
      }
      return;
    }
    if (existing) {
      await supabase
        .from('daily_notes')
        .update({ note, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase.from('daily_notes').insert({
        user_id: user.id, date, note,
      });
    }
    await loadAll();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-neutral-500">Loading analytics…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0b0f]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <BarChart3 size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Futures Journal</div>
              <div className="text-sm font-medium truncate">Analytics</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RangePicker value={range} onChange={setRange} />
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {err && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-md">
            {err}
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState range={range} totalTrades={trades.length} />
        ) : (
          <>
            <OverviewSection metrics={overall} />
            <EdgeSection edge={edge} />
            <GroupSection
              title="By market type"
              subtitle="Which conditions actually pay you. Bull trend vs chop vs news days."
              groups={byMarket}
              labelFn={marketTypeLabel}
              icon={<Layers size={14} />}
            />
            <GroupSection
              title="By setup"
              subtitle="Each setup tag is its own mini-strategy. If one has a negative expectancy, stop trading it."
              groups={bySetup}
              labelFn={(k) => k === '__unclassified__' ? 'Unclassified' : k}
              icon={<Layers size={14} />}
            />
            <LossAuditSection audit={audit} />
            <DailyNotesSection
              trades={filtered}
              dailyNotes={dailyNotes}
              onSave={saveDailyNote}
            />
          </>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function RangePicker({ value, onChange }) {
  const opts = [
    { v: '7d',  l: '7d' },
    { v: '30d', l: '30d' },
    { v: '90d', l: '90d' },
    { v: 'ytd', l: 'YTD' },
    { v: 'all', l: 'All' },
  ];
  return (
    <div className="inline-flex bg-[#0d0e13] border border-white/10 rounded-md p-0.5">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={[
            'px-2.5 py-1 text-xs font-medium rounded transition-colors',
            value === o.v
              ? 'bg-white/10 text-neutral-100'
              : 'text-neutral-500 hover:text-neutral-300',
          ].join(' ')}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ range, totalTrades }) {
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-8 text-center">
      <BarChart3 size={28} className="mx-auto text-neutral-600 mb-3" />
      <div className="text-sm text-neutral-300 mb-1">No trades in this range</div>
      <div className="text-xs text-neutral-500">
        {totalTrades === 0
          ? 'Log your first trade in the Journal tab to see analytics here.'
          : `You have ${totalTrades} trade${totalTrades === 1 ? '' : 's'} total — try a wider range.`}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Overview
// ----------------------------------------------------------------------------

function OverviewSection({ metrics }) {
  const { n, wins, losses, breakeven, winRate, netPnl, avgWin, avgLoss, expectancy, profitFactor, bestTrade, worstTrade } = metrics;
  return (
    <section>
      <SectionHeader icon={<TrendingUp size={14} />} title="Overview" subtitle={`${n} trade${n === 1 ? '' : 's'} in range`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Tile
          label="Net P/L"
          value={fmtMoney(netPnl)}
          tone={netPnl > 0 ? 'pos' : netPnl < 0 ? 'neg' : 'neutral'}
          large
        />
        <Tile label="Win rate" value={fmtPct(winRate)} hint={`${wins}W / ${losses}L${breakeven ? ` / ${breakeven}BE` : ''}`} />
        <Tile
          label="Expectancy"
          value={fmtMoney(expectancy)}
          hint="per trade"
          tone={expectancy > 0 ? 'pos' : expectancy < 0 ? 'neg' : 'neutral'}
        />
        <Tile
          label="Profit factor"
          value={profitFactor === null ? '—' : !isFinite(profitFactor) ? '∞' : fmtNumber(profitFactor, 2)}
          hint={profitFactor && profitFactor >= 2 ? 'strong' : profitFactor && profitFactor >= 1.5 ? 'decent' : profitFactor && profitFactor >= 1 ? 'breakeven+' : 'losing'}
          tone={profitFactor === null ? 'neutral' : profitFactor >= 1 ? 'pos' : 'neg'}
        />
        <Tile label="Avg win" value={fmtMoney(avgWin)} tone="pos" />
        <Tile label="Avg loss" value={fmtMoney(avgLoss)} tone="neg" />
        <Tile label="Best trade" value={fmtMoney(bestTrade)} />
        <Tile label="Worst trade" value={fmtMoney(worstTrade)} />
      </div>
    </section>
  );
}

function Tile({ label, value, hint, tone, large }) {
  const toneCls =
    tone === 'pos' ? 'text-emerald-400'
    : tone === 'neg' ? 'text-rose-400'
    : 'text-neutral-200';
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums ${large ? 'text-2xl' : 'text-lg'} mt-1 ${toneCls}`}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-neutral-500 mt-0.5">{hint}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Statistical edge
// ----------------------------------------------------------------------------

function EdgeSection({ edge }) {
  const { n, verdict, mean, sd, se, ciLow, ciHigh } = edge;
  const verdictMeta = {
    no_data:           { icon: HelpCircle,  color: 'neutral', label: 'No data',           desc: 'Log trades to see edge analysis.' },
    insufficient_data: { icon: HelpCircle,  color: 'neutral', label: 'Insufficient data', desc: `n = ${n} of 30+ needed. Below 30 trades, your win rate could be pure luck — statistical tests can't distinguish skill from noise yet. Keep logging.` },
    edge_confirmed:    { icon: CheckCircle2, color: 'pos',    label: 'Edge confirmed',    desc: 'The lower bound of your 95% confidence interval is above zero. Your expected P/L per trade is positive with statistical significance.' },
    inconclusive:      { icon: HelpCircle,  color: 'neutral', label: 'Inconclusive',      desc: 'Your 95% confidence interval crosses zero. Your results are statistically consistent with having no edge. Keep going — more data may resolve this.' },
    negative_edge:     { icon: AlertTriangle, color: 'neg',   label: 'Negative edge',     desc: 'The upper bound of your 95% CI is below zero. Your strategy is statistically likely to be losing money. Stop trading live and review.' },
  }[verdict];

  const Icon = verdictMeta.icon;
  const colorCls = verdictMeta.color === 'pos'
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    : verdictMeta.color === 'neg'
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    : 'text-neutral-400 bg-white/[0.03] border-white/10';

  return (
    <section>
      <SectionHeader
        icon={<ShieldCheck size={14} />}
        title="Edge analysis"
        subtitle="Honest statistical test, not vibes. Requires 30+ trades before declaring anything."
      />
      <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 sm:p-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${colorCls}`}>
          <Icon size={14} />
          {verdictMeta.label}
        </div>
        <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{verdictMeta.desc}</p>

        {n > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
            <StatRow label="n" value={String(n)} />
            <StatRow label="Mean per trade" value={fmtMoney(mean)} tone={mean > 0 ? 'pos' : mean < 0 ? 'neg' : 'neutral'} />
            <StatRow label="Std deviation" value={fmtMoney(sd)} />
            <StatRow label="Std error" value={fmtMoney(se)} />
            <StatRow label="95% CI low"  value={fmtMoney(ciLow)}  tone={ciLow > 0 ? 'pos' : ciLow < 0 ? 'neg' : 'neutral'} />
            <StatRow label="95% CI high" value={fmtMoney(ciHigh)} tone={ciHigh > 0 ? 'pos' : ciHigh < 0 ? 'neg' : 'neutral'} />
          </div>
        )}

        {n >= 1 && n < 30 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">Progress to 30 trades</div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500/60 transition-all"
                style={{ width: `${Math.min(100, (n / 30) * 100)}%` }}
              />
            </div>
            <div className="text-xs text-neutral-500 mt-1.5">{n} / 30 — {30 - n} to go</div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatRow({ label, value, tone }) {
  const toneCls =
    tone === 'pos' ? 'text-emerald-400'
    : tone === 'neg' ? 'text-rose-400'
    : 'text-neutral-200';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums text-sm mt-0.5 ${toneCls}`}>{value}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Group section (by market type / by setup)
// ----------------------------------------------------------------------------

function GroupSection({ title, subtitle, groups, labelFn, icon }) {
  if (groups.length === 0) return null;
  return (
    <section>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} />
      <div className="bg-[#0d0e13] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                <th className="px-4 py-2.5 font-medium">Group</th>
                <th className="px-3 py-2.5 font-medium text-right">n</th>
                <th className="px-3 py-2.5 font-medium text-right">Win rate</th>
                <th className="px-3 py-2.5 font-medium text-right">Expectancy</th>
                <th className="px-3 py-2.5 font-medium text-right">PF</th>
                <th className="px-3 py-2.5 font-medium text-right">Net P/L</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const { n, winRate, expectancy, profitFactor, netPnl } = g.metrics;
                return (
                  <tr key={g.key} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="text-neutral-200">{labelFn(g.key)}</div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-400">{n}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">{fmtPct(winRate)}</td>
                    <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${expectancy > 0 ? 'text-emerald-400' : expectancy < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
                      {fmtMoney(expectancy)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">
                      {profitFactor === null ? '—' : !isFinite(profitFactor) ? '∞' : fmtNumber(profitFactor, 2)}
                    </td>
                    <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${netPnl > 0 ? 'text-emerald-400' : netPnl < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
                      {fmtMoney(netPnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// Loss audit
// ----------------------------------------------------------------------------

function LossAuditSection({ audit }) {
  const { totalLosses, validCount, invalidCount, unclassifiedCount, validTotal, invalidTotal, validAvg, invalidAvg } = audit;
  return (
    <section>
      <SectionHeader
        icon={<AlertTriangle size={14} />}
        title="Loss audit"
        subtitle='Valid losses = "I followed my rules, the trade just didn\u2019t work". Invalid losses = money lost to discipline failures.'
      />
      {totalLosses === 0 ? (
        <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 text-sm text-neutral-500">
          No losing trades in this range.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AuditCard
            tone="pos"
            label="Valid losses"
            count={validCount}
            total={validTotal}
            avg={validAvg}
            desc="Followed your rules. These are the cost of doing business."
          />
          <AuditCard
            tone="neg"
            label="Invalid losses"
            count={invalidCount}
            total={invalidTotal}
            avg={invalidAvg}
            desc="Rules broken. This is money you paid to learn discipline."
          />
          <AuditCard
            tone="neutral"
            label="Unclassified"
            count={unclassifiedCount}
            total={null}
            avg={null}
            desc="Mark each trade's rules-followed in the form to see how much costs you."
          />
        </div>
      )}
    </section>
  );
}

function AuditCard({ tone, label, count, total, avg, desc }) {
  const colorCls =
    tone === 'pos' ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
    : tone === 'neg' ? 'border-rose-500/20 bg-rose-500/[0.04]'
    : 'border-white/5 bg-[#0d0e13]';
  const textCls =
    tone === 'pos' ? 'text-emerald-400'
    : tone === 'neg' ? 'text-rose-400'
    : 'text-neutral-300';
  return (
    <div className={`border rounded-xl p-4 ${colorCls}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums text-2xl mt-1 ${textCls}`}>{count}</div>
      {total !== null && (
        <div className="mt-2 space-y-0.5">
          <div className="text-xs text-neutral-400">
            Total: <span className="font-mono tabular-nums">{fmtMoney(total)}</span>
          </div>
          {avg !== null && (
            <div className="text-xs text-neutral-400">
              Avg: <span className="font-mono tabular-nums">{fmtMoney(avg)}</span>
            </div>
          )}
        </div>
      )}
      <div className="text-[11px] text-neutral-500 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Daily notes
// ----------------------------------------------------------------------------

function DailyNotesSection({ trades, dailyNotes, onSave }) {
  // Build a date list: every day that either has a trade OR a note
  const dates = useMemo(() => {
    const set = new Set();
    for (const t of trades) if (t.date) set.add(t.date);
    for (const n of dailyNotes) if (n.date) set.add(n.date);
    return Array.from(set).sort((a, b) => b.localeCompare(a)); // newest first
  }, [trades, dailyNotes]);

  const notesMap = useMemo(() => {
    const m = {};
    for (const n of dailyNotes) m[n.date] = n.note || '';
    return m;
  }, [dailyNotes]);

  const tradesByDate = useMemo(() => {
    const m = new Map();
    for (const t of trades) {
      if (!t.date) continue;
      const arr = m.get(t.date) || [];
      arr.push(t);
      m.set(t.date, arr);
    }
    return m;
  }, [trades]);

  return (
    <section>
      <SectionHeader
        icon={<FileText size={14} />}
        title="Daily notes"
        subtitle="One note per trading day. End-of-day reflection: what worked, what didn\u2019t, what to fix tomorrow."
      />
      {dates.length === 0 ? (
        <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 text-sm text-neutral-500">
          No trades or notes yet.
        </div>
      ) : (
        <div className="space-y-3">
          {dates.map((d) => (
            <DailyNoteRow
              key={d}
              date={d}
              trades={tradesByDate.get(d) || []}
              note={notesMap[d] || ''}
              onSave={(text) => onSave(d, text)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function DailyNoteRow({ date, trades, note, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // Keep draft in sync if the saved note changes externally (e.g. realtime update from phone)
  useEffect(() => { setDraft(note); }, [note]);

  const dayPnl = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const dayCount = trades.length;
  const dayWins = trades.filter((t) => Number(t.pnl) > 0).length;
  const dayLosses = trades.filter((t) => Number(t.pnl) < 0).length;

  const dirty = draft !== note;
  const save = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setSavedAt(Date.now());
  };

  const niceDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Calendar size={14} className="text-neutral-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm text-neutral-200">{niceDate}</div>
            <div className="text-[11px] text-neutral-500">
              {dayCount === 0 ? 'No trades — note only' : `${dayCount} trade${dayCount === 1 ? '' : 's'} · ${dayWins}W / ${dayLosses}L`}
              {note && ' · 📝 has note'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {dayCount > 0 && (
            <div className={`font-mono tabular-nums text-sm ${dayPnl > 0 ? 'text-emerald-400' : dayPnl < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
              {fmtMoney(dayPnl)}
            </div>
          )}
          {expanded ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-3">
          {trades.length > 0 && (
            <div className="space-y-1">
              {trades.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 text-xs py-1.5 px-2 rounded bg-white/[0.02]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono uppercase text-neutral-200">{t.symbol || '—'}</span>
                    <span className="text-neutral-600">·</span>
                    <span className={t.direction === 'short' ? 'text-rose-400' : 'text-emerald-400'}>{t.direction || '—'}</span>
                    {t.setup && (
                      <>
                        <span className="text-neutral-600">·</span>
                        <span className="text-neutral-400 truncate">{t.setup}</span>
                      </>
                    )}
                    {t.market_type && (
                      <>
                        <span className="text-neutral-600">·</span>
                        <span className="text-neutral-500 text-[10px]">{marketTypeLabel(t.market_type)}</span>
                      </>
                    )}
                    {t.rules_followed === false && (
                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">rules broken</span>
                    )}
                  </div>
                  <span className={`font-mono tabular-nums shrink-0 ${Number(t.pnl) > 0 ? 'text-emerald-400' : Number(t.pnl) < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>
                    {fmtMoney(Number(t.pnl))}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">Daily note</div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="End-of-day reflection. What was the market doing? Did you stick to your playbook? What's one thing to fix tomorrow?"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-[11px] text-neutral-500">
                {savedAt && !dirty && 'Saved.'}
                {dirty && !saving && 'Unsaved changes.'}
                {saving && 'Saving…'}
              </div>
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:bg-white/5 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Common bits
// ----------------------------------------------------------------------------

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/5 flex items-center justify-center text-neutral-400 shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral-200">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{subtitle}</div>}
      </div>
    </div>
  );
}
