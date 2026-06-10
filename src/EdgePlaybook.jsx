// Edge / Playbook page — replaces the old Course tab.
// "What is my edge, and how do I trade each setup?" — driven by the user's real data.

import { useMemo } from 'react';
import {
  Compass, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle2, HelpCircle, BookOpen, Layers,
} from 'lucide-react';
import { useJournalData } from './lib/useJournalData';
import {
  computeEdgeReport, setupFamilyGroups, weeklySummaries, mistakeCostAnalysis,
  fmtMoney, fmtPct, fmtPF,
} from './lib/analytics';
import { resolveSetupFamily } from './lib/classification';
import ExportButtons from './components/ExportButtons';

// ----------------------------------------------------------------------------
// Authored playbook content (the strategy reference). Performance stats + example
// notes are layered on from the user's real trades at render time.
// ----------------------------------------------------------------------------
const PLAYBOOK = [
  {
    family: 'support_resistance',
    name: 'Support & Resistance',
    meaning: 'Trading reactions at pre-defined horizontal price levels where supply/demand has flipped before — PDH/PDL, ORH/ORL, prior highs/lows, range edges, supply/demand zones.',
    conditions: [
      'Level marked in advance (not drawn after the fact)',
      'Clear prior reaction at the level',
      'Price approaching with a story (trend into it, or a sweep)',
    ],
    trigger: 'Rejection wick, failed breakout, or break-and-retest hold at the level.',
    stop: 'Just beyond the level (past the wick that rejected). If price closes through and holds, the level failed — you are out.',
    tp: 'Next opposing level / range target. Partial at 1R, trail the rest to structure.',
    avoid: [
      'Mid-range, no clean level nearby',
      'High-impact news about to print',
      'Chasing after price already moved away from the level',
    ],
  },
  {
    family: 'vwap',
    name: 'VWAP',
    meaning: 'Using the session VWAP as the fair-value reference: bounces, rejections, reclaims and losses around it, especially with a level confluence.',
    conditions: [
      'VWAP is the relevant reference for the session (decent volume)',
      'Price interacting with VWAP, not 20 points away from it',
      'Ideally VWAP lines up with a S&R level',
    ],
    trigger: 'VWAP reclaim (back above and holds) for longs, VWAP loss (rejects below) for shorts; rejection on first test.',
    stop: 'Other side of VWAP plus a small buffer. A decisive close through invalidates.',
    tp: 'Prior swing / level. On trend days, trail along VWAP.',
    avoid: [
      'Dead, low-volume tape where VWAP is meaningless',
      'Price chopping back and forth across VWAP (no edge)',
    ],
  },
  {
    family: 'trendline',
    name: 'Trendline',
    meaning: 'Trading diagonal structure: bounces off a rising/falling trendline, trendline breaks, and break-retests.',
    conditions: [
      'Trendline has at least 2-3 real touches',
      'Slope is sustainable (not a parabolic blow-off)',
      'Clear higher-low / lower-high structure supporting it',
    ],
    trigger: 'Higher low at the line (longs) / lower high (shorts); break-and-hold for trendline-break trades.',
    stop: 'Beyond the structural swing the trendline protects.',
    tp: 'Measured move / next horizontal level. Trail under higher lows in a trend.',
    avoid: [
      'Over-fitted lines touching only wicks',
      'Choppy ranges where every line breaks',
    ],
  },
  {
    family: 'confluence',
    name: 'Confluence',
    meaning: 'Your A+ trades: two or more setup families pointing at the same price — e.g. VWAP + prior high, or trendline + level. Highest conviction, biggest size (within risk rules).',
    conditions: [
      'Two or more independent reasons at one price',
      'They agree on direction',
      'Clean trigger, defined risk',
    ],
    trigger: 'Whichever trigger fires at the confluence (rejection, reclaim, retest hold).',
    stop: 'Tight — beyond the confluence zone. If multiple reasons fail at once, the read was wrong.',
    tp: 'Run further than single-reason trades; scale out and trail.',
    avoid: [
      'Forcing "confluence" by stacking weak reasons',
      'Confusing a busy chart for real agreement',
    ],
  },
  {
    family: 'no_setup',
    name: 'No setup / avoid list',
    meaning: 'Not a strategy — the things that bleed your account. Random entries, FOMO, chasing, revenge, emotional/forced trades. Track them so you can see what they cost.',
    conditions: ['There is no condition. There was no setup.'],
    trigger: 'Boredom, fear of missing out, anger after a loss, wanting action.',
    stop: 'The real stop is not taking the trade. If you are here, step away.',
    tp: 'N/A — the goal is zero of these.',
    avoid: [
      'Trading to "make it back"',
      'Trading when you are not in state',
      'Sizing up to feel something',
    ],
  },
];

const VERDICT_META = {
  no_data:   { icon: HelpCircle,    cls: 'text-neutral-400 bg-white/[0.03] border-white/10' },
  too_early: { icon: HelpCircle,    cls: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
  promising: { icon: TrendingUp,    cls: 'text-sky-300 bg-sky-500/10 border-sky-500/20' },
  stronger:  { icon: CheckCircle2,  cls: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
  no_edge:   { icon: AlertTriangle, cls: 'text-rose-300 bg-rose-500/10 border-rose-500/20' },
};

export default function EdgePlaybook({ user }) {
  const { trades, notesMap, loaded } = useJournalData(user);

  const report = useMemo(() => computeEdgeReport(trades), [trades]);
  const setupGroups = useMemo(() => setupFamilyGroups(trades), [trades]);
  const weeks = useMemo(() => weeklySummaries(trades, notesMap), [trades, notesMap]);
  const mistakes = useMemo(() => mistakeCostAnalysis(trades), [trades]);

  const groupByFamily = useMemo(() => {
    const m = {};
    for (const g of setupGroups) m[g.key] = g;
    return m;
  }, [setupGroups]);

  const examplesByFamily = useMemo(() => {
    const m = {};
    for (const t of trades) {
      const fam = resolveSetupFamily(t);
      if (!fam || !t.notes || !t.notes.trim()) continue;
      (m[fam] = m[fam] || []).push(t);
    }
    return m;
  }, [trades]);

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Loading edge…</div>;
  }

  const meta = VERDICT_META[report.edge.verdict] || VERDICT_META.no_data;
  const Icon = meta.icon;
  const latestWeeks = weeks.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans">
      <header className="sticky top-0 z-20 bg-[#0a0b0f]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Compass size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Futures Journal</div>
              <div className="text-sm font-medium truncate">Edge / Playbook</div>
            </div>
          </div>
          <ExportButtons trades={trades} notesMap={notesMap} meta={{ rangeLabel: 'All time', filterLabel: 'All trades' }} compact />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {trades.length === 0 ? (
          <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-8 text-center">
            <Compass size={28} className="mx-auto text-neutral-600 mb-3" />
            <div className="text-sm text-neutral-300">No trades yet</div>
            <div className="text-xs text-neutral-500 mt-1">Log trades in the Journal to build your edge profile and playbook stats.</div>
          </div>
        ) : (
          <>
            {/* Current edge summary */}
            <section>
              <SectionHeader icon={<ShieldCheck size={14} />} title="Current edge" subtitle="Where you stand right now, across all logged trades." />
              <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 sm:p-5">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium ${meta.cls}`}>
                  <Icon size={14} /> {report.edge.label}
                </div>
                <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{report.edge.explanation}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                  <Mini label="Trades" v={String(report.n)} />
                  <Mini label="Net P/L" v={fmtMoney(report.netPnl)} tone={report.netPnl > 0 ? 'pos' : 'neg'} />
                  <Mini label="Win rate" v={fmtPct(report.winRate)} />
                  <Mini label="Expectancy" v={fmtMoney(report.expectancy)} tone={report.expectancy > 0 ? 'pos' : 'neg'} />
                  <Mini label="Profit factor" v={fmtPF(report.profitFactor)} />
                  <Mini label="Valid expectancy" v={fmtMoney(report.validExpectancy)} tone={report.validExpectancy > 0 ? 'pos' : 'neutral'} />
                  <Mini label="Invalid cost" v={fmtMoney(report.invalidCost)} tone="neg" />
                  <Mini label="Lost to broken rules" v={fmtMoney(report.audit.moneyLostToBrokenRules)} tone="neg" />
                </div>
              </div>
            </section>

            {/* Best / worst + costliest mistakes */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <HighlightCard title="Best setup" g={report.bestSetup} tone="pos" />
                <HighlightCard title="Worst setup" g={report.worstSetup} tone="neg" />
                <HighlightCard title="Best market" g={report.bestMarket} tone="pos" />
                <HighlightCard title="Worst market" g={report.worstMarket} tone="neg" />
              </div>
            </section>

            {/* Costliest mistakes */}
            <CostliestMistakes mistakes={mistakes} />

            {/* Weekly coach */}
            {latestWeeks.length > 0 && (
              <section>
                <SectionHeader icon={<BookOpen size={14} />} title="Weekly coach" subtitle="Your most recent week(s), summarized from your notes and trades." />
                <div className="space-y-3">
                  {latestWeeks.map((w) => (
                    <div key={w.weekStart} className="bg-[#0d0e13] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-neutral-200">{w.weekLabel}</div>
                        <div className={`font-mono text-sm tabular-nums ${w.metrics.netPnl > 0 ? 'text-emerald-400' : w.metrics.netPnl < 0 ? 'text-rose-400' : 'text-neutral-400'}`}>{fmtMoney(w.metrics.netPnl)}</div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                        <Coach title="Worked" items={w.summary.worked} tone="pos" />
                        <Coach title="Failed" items={w.summary.failed} tone="neg" />
                        <Coach title="Focus next week" items={w.summary.focus} tone="neutral" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Playbook cards */}
            <section>
              <SectionHeader icon={<Layers size={14} />} title="Setup playbook" subtitle="How to trade each family — with your real performance and example notes." />
              <div className="space-y-3">
                {PLAYBOOK.map((p) => (
                  <PlaybookCard key={p.family} card={p} group={groupByFamily[p.family]} examples={examplesByFamily[p.family] || []} />
                ))}
              </div>
            </section>

            {/* Export */}
            <section>
              <SectionHeader icon={<BookOpen size={14} />} title="Export report" subtitle="A compact Markdown summary for ChatGPT, plus the raw trades CSV." />
              <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4">
                <ExportButtons trades={trades} notesMap={notesMap} meta={{ rangeLabel: 'All time', filterLabel: 'All trades' }} />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function CostliestMistakes({ mistakes }) {
  if (!mistakes || mistakes.rows.length === 0) return null;
  const top = mistakes.rows.slice(0, 5);
  return (
    <section>
      <SectionHeader icon={<AlertTriangle size={14} />} title="Mistakes costing the most" subtitle="Stop these first — ranked by money cost." />
      <div className="bg-[#0d0e13] border border-white/5 rounded-xl divide-y divide-white/5">
        {top.map((r, i) => (
          <div key={r.key} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {i === 0 && <span className="text-[9px] uppercase tracking-wider text-rose-400">costliest</span>}
              <span className="text-sm text-neutral-200 truncate">{r.label}</span>
              <span className="text-[11px] text-neutral-500">×{r.count}</span>
            </div>
            <div className="font-mono text-sm tabular-nums text-rose-400 shrink-0">{fmtMoney(r.totalPnl)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlaybookCard({ card, group, examples }) {
  const m = group ? group.metrics : null;
  const tone = !m ? 'neutral' : m.netPnl > 0 ? 'pos' : m.netPnl < 0 ? 'neg' : 'neutral';
  const toneCls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-400';
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="text-base font-medium text-neutral-100">{card.name}</div>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed max-w-2xl">{card.meaning}</p>
        </div>
        {m && m.n > 0 ? (
          <div className="text-right shrink-0">
            <div className={`font-mono text-lg tabular-nums ${toneCls}`}>{fmtMoney(m.netPnl)}</div>
            <div className="text-[10px] text-neutral-500">{m.n} trades · win {fmtPct(m.winRate)} · exp {fmtMoney(m.expectancy)}</div>
          </div>
        ) : (
          <div className="text-[10px] text-neutral-600 shrink-0">no trades yet</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-xs">
        <PBlock label="Conditions needed" items={card.conditions} />
        <PBlock label="When NOT to trade it" items={card.avoid} tone="neg" />
        <PLine label="Entry trigger" text={card.trigger} />
        <PLine label="Stop-loss logic" text={card.stop} />
        <PLine label="Take-profit logic" text={card.tp} />
      </div>

      {examples.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1.5">From your trades</div>
          <div className="space-y-1.5">
            {examples.slice(0, 3).map((t) => (
              <div key={t.id} className="text-[11px] text-neutral-400 bg-white/[0.02] border border-white/5 rounded px-2.5 py-1.5">
                <span className="font-mono text-neutral-500">{t.date}</span>{' '}
                <span className={Number(t.pnl) > 0 ? 'text-emerald-400' : Number(t.pnl) < 0 ? 'text-rose-400' : 'text-neutral-400'}>{fmtMoney(Number(t.pnl))}</span>
                <span> — {t.notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PBlock({ label, items, tone }) {
  const dot = tone === 'neg' ? 'text-rose-400' : 'text-emerald-400';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">{label}</div>
      <ul className="space-y-0.5">
        {items.map((it, i) => (
          <li key={i} className="text-neutral-300 leading-relaxed flex gap-1.5">
            <span className={dot}>·</span><span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PLine({ label, text }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-1">{label}</div>
      <div className="text-neutral-300 leading-relaxed">{text}</div>
    </div>
  );
}

function HighlightCard({ title, g, tone }) {
  const cls = tone === 'pos' ? 'text-emerald-400' : 'text-rose-400';
  return (
    <div className="bg-[#0d0e13] border border-white/5 rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{title}</div>
      {g ? (
        <>
          <div className="text-sm text-neutral-100 mt-1">{g.label}</div>
          <div className={`font-mono text-lg tabular-nums ${cls}`}>{fmtMoney(g.metrics.netPnl)}</div>
          <div className="text-[10px] text-neutral-500">{g.metrics.n} trades · win {fmtPct(g.metrics.winRate)} · exp {fmtMoney(g.metrics.expectancy)}</div>
        </>
      ) : (
        <div className="text-xs text-neutral-600 mt-2">Not enough classified data yet.</div>
      )}
    </div>
  );
}

function Mini({ label, v, tone }) {
  const cls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-200';
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono tabular-nums text-sm mt-0.5 ${cls}`}>{v}</div>
    </div>
  );
}

function Coach({ title, items, tone }) {
  const cls = tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-sky-400';
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className={`text-[10px] uppercase tracking-[0.16em] mb-1 ${cls}`}>{title}</div>
      {items.length === 0 ? <div className="text-neutral-600">—</div> : (
        <ul className="space-y-0.5">{items.map((it, i) => <li key={i} className="text-neutral-300 leading-relaxed">{it}</li>)}</ul>
      )}
    </div>
  );
}

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
