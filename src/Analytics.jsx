import { useState, useMemo } from 'react';
import {
  TrendingUp, AlertTriangle, CheckCircle2, HelpCircle, BarChart3, Layers,
  ShieldCheck, FileText, Calendar, ChevronDown, ChevronUp, Crosshair, Target, Ban,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useJournalData } from './lib/useJournalData';
import {
  computeEdgeReport,
  setupFamilyGroups, rawSetupGroups, entryTriggerGroups, setupTriggerGroups, marketTypeGroups,
  mistakeCostAnalysis, validInvalidAudit, weeklySummaries,
  filterByDateRange, applyTradeFilter, TRADE_FILTERS, hasEvalTrades,
  fmtMoney, fmtPct, fmtPF,
} from './lib/analytics';
import { NO_TRADE_REASONS } from './lib/classification';
import ExportButtons from './components/ExportButtons';

const RANGE_LABELS = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', ytd: 'Year to date', all: 'All time' };

export default function Analytics({ user }) {
  const { trades, dailyNotes, noTrades, notesMap, loaded, err, reload } = useJournalData(user);
  const [range, setRange] = useState('all');
  const [filter, setFilter] = useState('all');

  // date range first, then the edge filter — every section recomputes from `filtered`
  const ranged = useMemo(() => filterByDateRange(trades, range), [trades, range]);
  const filtered = useMemo(() => applyTradeFilter(ranged, filter), [ranged, filter]);

  const report = useMemo(() => computeEdgeReport(filtered), [filtered]);
  const setups = useMemo(() => setupFamilyGroups(filtered), [filtered]);
  const rawSetups = useMemo(() => rawSetupGroups(filtered), [filtered]);
  const triggers = useMemo(() => entryTriggerGroups(filtered), [filtered]);
  const combos = useMemo(() => setupTriggerGroups(filtered), [filtered]);
  const markets = useMemo(() => marketTypeGroups(filtered), [filtered]);
  const mistakes = useMemo(() => mistakeCostAnalysis(filtered), [filtered]);
  const audit = useMemo(() => validInvalidAudit(filtered), [filtered]);
  const weeks = useMemo(() => weeklySummaries(filtered, notesMap), [filtered, notesMap]);
  const showEval = useMemo(() => hasEvalTrades(trades), [trades]);

  const filterLabel = (TRADE_FILTERS.find((f) => f.value === filter) || {}).label || 'All trades';

  const saveDailyNote = async (date, note) => {
    const existing = dailyNotes.find((n) => n.date === date);
    if (note.trim() === '') {
      if (existing) { await supabase.from('daily_notes').delete().eq('id', existing.id); await reload(); }
      return;
    }
    if (existing) {
      await supabase.from('daily_notes').update({ note, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('daily_notes').insert({ user_id: user.id, date, note });
    }
    await reload();
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
            <ExportButtons trades={filtered} notesMap={notesMap} meta={{ rangeLabel: RANGE_LABELS[range], filterLabel }} compact />
          </div>
        </div>
        <FilterBar value={filter} onChange={setFilter} showEval={showEval} />
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {err && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-md">{err}</div>
        )}

        {filtered.length === 0 ? (
          <EmptyState range={range} filter={filter} totalTrades={trades.length} />
        ) : (
          <>
            {/* 1. Performance overview */}
            <OverviewSection report={report} />

            {/* 2. Edge confidence */}
            <EdgeSection report={report} />

            {/* 3. Setup performance */}
            <GroupSection
              icon={<Layers size={14} />}
              title="Setup performance"
              subtitle="By standardized setup family. Old free-text setups are mapped automatically."
              groups={setups}
              extra={<RawSetupDisclosure groups={rawSetups} />}
            />

            {/* 4. Entry trigger performance */}
            <GroupSection
              icon={<Crosshair size={14} />}
              title="Entry trigger performance"
              subtitle="Why you entered — separate from the setup. Which triggers actually pay."
              groups={triggers}
            />

            {/* 5. Setup + trigger combinations */}
            <GroupSection
              icon={<Target size={14} />}
              title="Setup + trigger combinations"
              subtitle="The real edge often lives in a specific setup + trigger pairing."
              groups={combos}
            />

            {/* 6. Market type performance (News highlighted) */}
            <MarketSection groups={markets} />

            {/* 7. Mistake-cost analysis */}
            <MistakeSection mistakes={mistakes} />

            {/* 8. Valid vs invalid loss audit */}
            <ValidInvalidSection audit={audit} />

            {/* 8b. Discipline / no-trade tracker */}
            <DisciplineSection noTrades={noTrades} />

            {/* 9. Weekly coach summary */}
            <WeeklySection weeks={weeks} onSaveNote={saveDailyNote} />

            {/* 10. Export */}
            <section>
              <SectionHeader icon={<FileText size={14} />} title="Export report"
                subtitle="Download a compact Markdown summary for ChatGPT, plus the raw trades CSV." />
              <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4">
                <ExportButtons trades={filtered} notesMap={notesMap} meta={{ rangeLabel: RANGE_LABELS[range], filterLabel }} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Header controls
// ============================================================================

function RangePicker({ value, onChange }) {
  const opts = [
    { v: '7d', l: '7d' }, { v: '30d', l: '30d' }, { v: '90d', l: '90d' }, { v: 'ytd', l: 'YTD' }, { v: 'all', l: 'All' },
  ];
  return (
    <div className="inline-flex bg-[#0d0e13] border border-white/10 rounded-md p-0.5">
      {opts.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={['px-2.5 py-1 text-xs font-medium rounded transition-colors',
            value === o.v ? 'bg-white/10 text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'].join(' ')}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

function FilterBar({ value, onChange, showEval }) {
  const filters = TRADE_FILTERS.filter((f) => f.value !== 'eval' || showEval);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 -mt-1">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
        {filters.map((f) => (
          <button key={f.value} onClick={() => onChange(f.value)}
            className={['shrink-0 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-colors',
              value === f.value
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-white/[0.02] text-neutral-400 border-white/10 hover:text-neutral-200'].join(' ')}>
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ range, filter, totalTrades }) {
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-8 text-center">
      <BarChart3 size={28} className="mx-auto text-neutral-600 mb-3" />
      <div className="text-sm text-neutral-300 mb-1">No trades match this view</div>
      <div className="text-xs text-neutral-500">
        {totalTrades === 0
          ? 'Log your first trade in the Journal tab to see analytics here.'
          : `You have ${totalTrades} trade${totalTrades === 1 ? '' : 's'} total — try a wider range or the "All trades" filter.`}
      </div>
    </div>
  );
}

// ============================================================================
// 1. Overview
// ============================================================================

function OverviewSection({ report }) {
  const { n, winRate, netPnl, avgWin, avgLoss, expectancy, profitFactor, bestTrade, worstTrade } = report;
  return (
    <section>
      <SectionHeader icon={<TrendingUp size={14} />} title="Performance overview" subtitle={`${n} trade${n === 1 ? '' : 's'} in view`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Tile label="Net P/L" value={fmtMoney(netPnl)} tone={netPnl > 0 ? 'pos' : netPnl < 0 ? 'neg' : 'neutral'} large />
        <Tile label="Win rate" value={fmtPct(winRate)} />
        <Tile label="Expectancy" value={fmtMoney(expectancy)} hint="per trade" tone={expectancy > 0 ? 'pos' : expectancy < 0 ? 'neg' : 'neutral'} />
        <Tile label="Profit factor" value={fmtPF(profitFactor)}
          tone={profitFactor == null ? 'neutral' : profitFactor >= 1 ? 'pos' : 'neg'}
          hint={profitFactor && profitFactor >= 2 ? 'strong' : profitFactor && profitFactor >= 1.5 ? 'decent' : profitFactor && profitFactor >= 1 ? 'breakeven+' : 'losing'} />
        <Tile label="Avg win" value={fmtMoney(avgWin)} tone="pos" />
        <Tile label="Avg loss" value={fmtMoney(avgLoss)} tone="neg" />
        <Tile label="Best trade" value={fmtMoney(bestTrade)} tone="pos" />
        <Tile label="Worst trade" value={fmtMoney(worstTrade)} tone="neg" />
      </div>
    </section>
  );
}

function Tile({ label, value, hint, tone, large }) {
  const toneCls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-200';
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums ${large ? 'text-2xl' : 'text-lg'} mt-1 ${toneCls}`}>{value}</div>
      {hint && <div className="text-[10px] text-neutral-500 mt-0.5">{hint}</div>}
    </div>
  );
}

// ============================================================================
// 2. Edge confidence (graded)
// ============================================================================

const VERDICT_META = {
  no_data:    { icon: HelpCircle,    cls: 'text-neutral-400 bg-white/[0.03] border-white/10' },
  too_early:  { icon: HelpCircle,    cls: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  promising:  { icon: TrendingUp,    cls: 'text-sky-300 bg-sky-500/10 border-sky-500/20' },
  stronger:   { icon: CheckCircle2,  cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  no_edge:    { icon: AlertTriangle, cls: 'text-rose-300 bg-rose-500/10 border-rose-500/20' },
};

function EdgeSection({ report }) {
  const { edge, audit, bestSetup, worstSetup, bestMarket, worstMarket } = report;
  const meta = VERDICT_META[edge.verdict] || VERDICT_META.no_data;
  const Icon = meta.icon;

  return (
    <section>
      <SectionHeader icon={<ShieldCheck size={14} />} title="Edge confidence"
        subtitle="Counts every logged trade. Graded honestly — no useless 'inconclusive'." />
      <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 sm:p-5">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${meta.cls}`}>
          <Icon size={14} /> {edge.label}
        </div>
        <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{edge.explanation}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
          <StatRow label="Trades counted" value={String(edge.n)} />
          <StatRow label="Win rate" value={fmtPct(report.winRate)} />
          <StatRow label="Net P/L" value={fmtMoney(report.netPnl)} tone={report.netPnl > 0 ? 'pos' : report.netPnl < 0 ? 'neg' : 'neutral'} />
          <StatRow label="Expectancy / trade" value={fmtMoney(report.expectancy)} tone={report.expectancy > 0 ? 'pos' : report.expectancy < 0 ? 'neg' : 'neutral'} />
          <StatRow label="Avg win" value={fmtMoney(report.avgWin)} tone="pos" />
          <StatRow label="Avg loss" value={fmtMoney(report.avgLoss)} tone="neg" />
          <StatRow label="Profit factor" value={fmtPF(report.profitFactor)} />
          <StatRow label="Mean / trade" value={fmtMoney(edge.mean)} tone={edge.mean > 0 ? 'pos' : edge.mean < 0 ? 'neg' : 'neutral'} />
          <StatRow label="Valid-trade expectancy" value={fmtMoney(audit.valid.expectancy)} tone={audit.valid.expectancy > 0 ? 'pos' : 'neutral'} />
          <StatRow label="Invalid-trade cost" value={fmtMoney(audit.invalid.netPnl)} tone={audit.invalid.netPnl < 0 ? 'neg' : 'neutral'} />
          <StatRow label="95% CI low" value={fmtMoney(edge.ciLow)} tone={edge.ciLow > 0 ? 'pos' : 'neg'} />
          <StatRow label="95% CI high" value={fmtMoney(edge.ciHigh)} tone={edge.ciHigh > 0 ? 'pos' : 'neg'} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 text-xs">
          <BestWorst label="Best setup" g={bestSetup} tone="pos" />
          <BestWorst label="Worst setup" g={worstSetup} tone="neg" />
          <BestWorst label="Best market" g={bestMarket} tone="pos" />
          <BestWorst label="Worst market" g={worstMarket} tone="neg" />
        </div>
      </div>
    </section>
  );
}

function BestWorst({ label, g, tone }) {
  const cls = tone === 'pos' ? 'text-emerald-400' : 'text-rose-400';
  return (
    <div className="flex items-center justify-between gap-2 bg-white/[0.02] border border-white/5 rounded-md px-3 py-2">
      <span className="text-neutral-500">{label}</span>
      {g ? (
        <span className="text-neutral-200">{g.label} <span className={`font-mono ${cls}`}>{fmtMoney(g.metrics.netPnl)}</span></span>
      ) : (
        <span className="text-neutral-600">not enough data</span>
      )}
    </div>
  );
}

function StatRow({ label, value, tone }) {
  const toneCls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-200';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums text-sm mt-0.5 ${toneCls}`}>{value}</div>
    </div>
  );
}

// ============================================================================
// Generic group section + table
// ============================================================================

function GroupSection({ icon, title, subtitle, groups, extra, highlightKey }) {
  return (
    <section>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} />
      <GroupTable groups={groups} highlightKey={highlightKey} />
      {extra}
    </section>
  );
}

function GroupTable({ groups, highlightKey }) {
  if (!groups || groups.length === 0) {
    return <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 text-sm text-neutral-500">No data yet.</div>;
  }
  return (
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
              const hl = highlightKey && g.key === highlightKey;
              return (
                <tr key={g.key} className={`border-b border-white/[0.04] last:border-0 ${hl ? 'bg-purple-500/[0.06]' : ''}`}>
                  <td className="px-4 py-2.5 text-neutral-200">
                    {hl && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mr-2 align-middle" />}
                    {g.label}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-400">{n}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">{fmtPct(winRate)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${expectancy > 0 ? 'text-emerald-400' : expectancy < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>{fmtMoney(expectancy)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">{fmtPF(profitFactor)}</td>
                  <td className={`px-3 py-2.5 text-right font-mono tabular-nums ${netPnl > 0 ? 'text-emerald-400' : netPnl < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>{fmtMoney(netPnl)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RawSetupDisclosure({ groups }) {
  const [open, setOpen] = useState(false);
  if (!groups || groups.length === 0) return null;
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-300">
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? 'Hide' : 'Show'} raw setup labels ({groups.length})
      </button>
      {open && <div className="mt-2"><GroupTable groups={groups} /></div>}
    </div>
  );
}

// ============================================================================
// 6. Market type (News highlighted)
// ============================================================================

function MarketSection({ groups }) {
  const news = groups.find((g) => g.key === 'news');
  return (
    <section>
      <SectionHeader icon={<Layers size={14} />} title="Market type performance"
        subtitle="Which conditions pay you. News-day performance is called out below." />
      {news && (
        <div className={`mb-3 rounded-xl border p-4 ${news.metrics.netPnl < 0 ? 'border-rose-500/30 bg-rose-500/[0.06]' : 'border-emerald-500/30 bg-emerald-500/[0.06]'}`}>
          <div className="text-[10px] uppercase tracking-[0.16em] text-purple-300">News days</div>
          <div className="flex items-baseline gap-3 mt-1 flex-wrap">
            <div className={`font-mono text-xl tabular-nums ${news.metrics.netPnl < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{fmtMoney(news.metrics.netPnl)}</div>
            <div className="text-xs text-neutral-400">{news.metrics.n} trades · win {fmtPct(news.metrics.winRate)} · expectancy {fmtMoney(news.metrics.expectancy)}</div>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1.5">
            {news.metrics.netPnl < 0
              ? 'News days are costing you money. Consider sitting out scheduled high-impact news.'
              : 'News days are net positive — but watch the variance.'}
          </div>
        </div>
      )}
      <GroupTable groups={groups} highlightKey="news" />
    </section>
  );
}

// ============================================================================
// 7. Mistake-cost
// ============================================================================

function MistakeSection({ mistakes }) {
  return (
    <section>
      <SectionHeader icon={<AlertTriangle size={14} />} title="Mistake-cost analysis"
        subtitle="What to stop doing first — ranked by money cost." />
      {mistakes.rows.length === 0 ? (
        <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 text-sm text-neutral-500">
          No mistakes logged yet. Set a mistake type (or mark trades invalid) in the trade form.
        </div>
      ) : (
        <div className="bg-[#0d0e13] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">Mistake</th>
                  <th className="px-3 py-2.5 font-medium text-right">Count</th>
                  <th className="px-3 py-2.5 font-medium text-right">Net impact</th>
                  <th className="px-3 py-2.5 font-medium text-right">Avg loss</th>
                  <th className="px-3 py-2.5 font-medium text-right">% of losses</th>
                </tr>
              </thead>
              <tbody>
                {mistakes.rows.map((r, i) => (
                  <tr key={r.key} className={`border-b border-white/[0.04] last:border-0 ${i === 0 ? 'bg-rose-500/[0.05]' : ''}`}>
                    <td className="px-4 py-2.5 text-neutral-200">
                      {i === 0 && <span className="text-[9px] uppercase tracking-wider text-rose-400 mr-1.5">costliest</span>}
                      {r.label}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-400">{r.count}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-rose-400">{fmtMoney(r.totalPnl)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">{fmtMoney(r.avgLoss)}</td>
                    <td className="px-3 py-2.5 text-right font-mono tabular-nums text-neutral-300">{r.pctOfLosses != null ? fmtPct(r.pctOfLosses) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// 8. Valid vs invalid
// ============================================================================

function ValidInvalidSection({ audit }) {
  return (
    <section>
      <SectionHeader icon={<ShieldCheck size={14} />} title="Valid vs invalid audit"
        subtitle="Are you profitable only when you follow your rules? This is the answer." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AuditCard tone="pos" label="Valid trades" a={audit.valid}
          desc="Setup + trigger present, rules followed. Your real strategy." />
        <AuditCard tone="neg" label="Invalid trades" a={audit.invalid}
          desc="Rules broken or core requirement missing. Money paid for indiscipline." />
        <AuditCard tone="neutral" label="Unclassified" a={{ ...audit.unclassified, expectancy: null, winRate: null, lossCount: null, lossTotal: null }}
          desc="Not reviewed yet. Mark rules-followed in the form to sort these." />
      </div>
      <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4 text-sm">
        <span className="text-neutral-400">Money lost to broken rules: </span>
        <span className="font-mono tabular-nums text-rose-400">{fmtMoney(audit.moneyLostToBrokenRules)}</span>
        {audit.valid.netPnl > 0 && audit.invalid.netPnl < 0 && (
          <span className="text-neutral-500"> — your valid trades made {fmtMoney(audit.valid.netPnl)}. Cutting the invalid ones is your fastest gain.</span>
        )}
      </div>
    </section>
  );
}

function AuditCard({ tone, label, a, desc }) {
  const colorCls = tone === 'pos' ? 'border-emerald-500/20 bg-emerald-500/[0.04]' : tone === 'neg' ? 'border-rose-500/20 bg-rose-500/[0.04]' : 'border-white/5 bg-[#0d0e13]';
  const textCls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-300';
  return (
    <div className={`border rounded-xl p-4 ${colorCls}`}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums text-2xl mt-1 ${textCls}`}>{a.count}</div>
      <div className="mt-2 space-y-0.5 text-xs text-neutral-400">
        <div>Net P/L: <span className="font-mono tabular-nums">{fmtMoney(a.netPnl)}</span></div>
        {a.expectancy != null && <div>Expectancy: <span className="font-mono tabular-nums">{fmtMoney(a.expectancy)}</span></div>}
        {a.lossCount != null && <div>Losses: <span className="font-mono tabular-nums">{a.lossCount}</span> ({fmtMoney(a.lossTotal)})</div>}
      </div>
      <div className="text-[11px] text-neutral-500 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}

// ============================================================================
// 8b. Discipline / no-trade tracker (#12) — never affects P/L
// ============================================================================

function DisciplineSection({ noTrades }) {
  if (!noTrades || noTrades.length === 0) return null;
  const byReason = new Map();
  for (const nt of noTrades) {
    const k = nt.reason || 'other';
    byReason.set(k, (byReason.get(k) || 0) + 1);
  }
  const rows = [...byReason.entries()].sort((a, b) => b[1] - a[1]);
  return (
    <section>
      <SectionHeader icon={<Ban size={14} />} title="Discipline (no-trade days)"
        subtitle="Days you correctly stayed out. Tracked separately — never counted in P/L." />
      <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4">
        <div className="flex items-baseline gap-2 mb-3">
          <div className="font-mono text-2xl tabular-nums text-sky-400">{noTrades.length}</div>
          <div className="text-xs text-neutral-500">no-trade entr{noTrades.length === 1 ? 'y' : 'ies'} logged</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {rows.map(([reason, count]) => (
            <div key={reason} className="inline-flex items-center gap-1.5 text-xs bg-sky-500/[0.06] border border-sky-500/20 text-sky-300 rounded-full px-2.5 py-1">
              {(NO_TRADE_REASONS.find((r) => r.value === reason) || {}).label || reason}
              <span className="font-mono text-sky-400/80">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// 9. Weekly coach summary
// ============================================================================

function WeeklySection({ weeks, onSaveNote }) {
  return (
    <section>
      <SectionHeader icon={<Calendar size={14} />} title="Weekly coach summary"
        subtitle="Your trade notes, grouped by week, with an automatic review — no more clicking each day." />
      {weeks.length === 0 ? (
        <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 text-sm text-neutral-500">No weeks with trades yet.</div>
      ) : (
        <div className="space-y-3">
          {weeks.map((w) => <WeekCard key={w.weekStart} week={w} onSaveNote={onSaveNote} />)}
        </div>
      )}
    </section>
  );
}

function WeekCard({ week, onSaveNote }) {
  const [open, setOpen] = useState(false);
  const net = week.metrics.netPnl;
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.02] text-left">
        <div className="min-w-0">
          <div className="text-sm text-neutral-200">{week.weekLabel}</div>
          <div className="text-[11px] text-neutral-500">{week.metrics.n} trades · win {fmtPct(week.metrics.winRate)}{week.ruleBreak.count ? ` · ${week.ruleBreak.count} rule-break loss${week.ruleBreak.count === 1 ? '' : 'es'}` : ''}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className={`font-mono tabular-nums text-sm ${net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>{fmtMoney(net)}</div>
          {open ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <CoachList title="What worked" items={week.summary.worked} tone="pos" />
            <CoachList title="What failed" items={week.summary.failed} tone="neg" />
            <CoachList title="Focus next week" items={week.summary.focus} tone="neutral" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <MiniStat label="Best setup" v={week.bestSetup ? week.bestSetup.label : '—'} />
            <MiniStat label="Worst setup" v={week.worstSetup ? week.worstSetup.label : '—'} />
            <MiniStat label="Best market" v={week.bestMarket ? week.bestMarket.label : '—'} />
            <MiniStat label="Worst market" v={week.worstMarket ? week.worstMarket.label : '—'} />
          </div>

          {week.noteItems.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">Trade notes this week</div>
              <div className="space-y-1.5">
                {week.noteItems.map((it, i) => (
                  <div key={i} className="text-xs text-neutral-300 bg-white/[0.02] border border-white/5 rounded px-2.5 py-1.5">
                    <span className="text-neutral-500 font-mono">{it.date}</span>{' '}
                    <span className="font-mono uppercase">{it.symbol}</span>{' '}
                    <span className={it.pnl > 0 ? 'text-emerald-400' : it.pnl < 0 ? 'text-rose-400' : 'text-neutral-400'}>{fmtMoney(it.pnl)}</span>
                    <span className="text-neutral-400"> — {it.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <WeeklyNote weekStart={week.weekStart} dailyNotes={week.dailyNotes} onSaveNote={onSaveNote} />
        </div>
      )}
    </div>
  );
}

function CoachList({ title, items, tone }) {
  const cls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-sky-400';
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className={`text-[10px] uppercase tracking-[0.16em] mb-1.5 ${cls}`}>{title}</div>
      {items.length === 0 ? (
        <div className="text-[11px] text-neutral-600">—</div>
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => <li key={i} className="text-[11px] text-neutral-300 leading-relaxed">{it}</li>)}
        </ul>
      )}
    </div>
  );
}

function MiniStat({ label, v }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-[0.14em] text-neutral-500">{label}</div>
      <div className="text-xs text-neutral-200 truncate">{v}</div>
    </div>
  );
}

// Optional weekly free-text note — stored as a daily_note on the week's Monday so it
// reuses the existing table without a new schema. Trade notes remain the primary source.
function WeeklyNote({ weekStart, dailyNotes, onSaveNote }) {
  const existing = (dailyNotes.find((d) => d.date === weekStart) || {}).text || '';
  const [draft, setDraft] = useState(existing);
  const [saving, setSaving] = useState(false);
  const dirty = draft !== existing;
  const save = async () => { setSaving(true); await onSaveNote(weekStart, draft); setSaving(false); };
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">Weekly review note (optional)</div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
        placeholder="Anything to add beyond the trade notes above?"
        className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none resize-none" />
      <div className="flex items-center justify-end mt-2">
        <button onClick={save} disabled={!dirty || saving}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:bg-white/5 disabled:text-neutral-500 disabled:cursor-not-allowed">
          {saving ? 'Saving…' : 'Save note'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Common
// ============================================================================

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/5 flex items-center justify-center text-neutral-400 shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-neutral-200">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{subtitle}</div>}
      </div>
    </div>
  );
}
