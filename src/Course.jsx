// Course page: phase navigator + module detail view.
// Tracks progress and checklist state via useCourseData (Supabase synced).

import React, { useState, useMemo } from 'react';
import { phases, allModules, moduleById, graduationChecklist, totalModules, totalGraduationItems } from './course';
import { useCourseData } from './course/useCourseData';
import { LessonBody } from './course/components/LessonBody';
import { Checklist } from './course/components/Checklist';
import { Quiz } from './course/components/Quiz';
import { Diagram } from './course/components/Diagrams';
import { PositionCalculator } from './course/components/PositionCalculator';

export default function Course({ user }) {
  const { progress, checklist, loading, toggleChecklist, markStarted, recordQuizAttempt } = useCourseData(user.id);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [showGraduation, setShowGraduation] = useState(false);

  const completedCount = useMemo(
    () => Object.values(progress).filter(p => p.status === 'completed').length,
    [progress]
  );
  const overallPct = Math.round((completedCount / totalModules) * 100);

  const graduationCheckedCount = useMemo(
    () => graduationChecklist.flatMap(s => s.items).filter(it => checklist[it.id]).length,
    [checklist]
  );
  const graduationPct = Math.round((graduationCheckedCount / totalGraduationItems) * 100);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0b0f] text-zinc-400 flex items-center justify-center text-sm">Loading course…</div>;
  }

  // ===== Module detail view =====
  if (selectedModuleId) {
    const mod = moduleById(selectedModuleId);
    if (!mod) {
      setSelectedModuleId(null);
      return null;
    }
    return (
      <ModuleView
        mod={mod}
        progress={progress[mod.id]}
        checklist={checklist}
        onBack={() => setSelectedModuleId(null)}
        onSelectModule={setSelectedModuleId}
        onToggle={toggleChecklist}
        onStart={() => markStarted(mod.id)}
        onQuizSubmit={(score) => recordQuizAttempt(mod.id, score)}
      />
    );
  }

  // ===== Graduation view =====
  if (showGraduation) {
    return (
      <GraduationView
        checklist={checklist}
        onToggle={toggleChecklist}
        onBack={() => setShowGraduation(false)}
        checkedCount={graduationCheckedCount}
        pct={graduationPct}
      />
    );
  }

  // ===== Phase / module list =====
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-zinc-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Course
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            From beginner to ES futures trader
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            24 modules across 6 phases. Direct, no-BS, designed to be genuinely useful.
            Work through it in order. The graduation checklist gates "ready for prop eval."
          </p>
        </div>

        {/* Progress summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProgressCard
            label="Course progress"
            sub={`${completedCount} of ${totalModules} modules`}
            pct={overallPct}
            color="emerald"
          />
          <button
            onClick={() => setShowGraduation(true)}
            className="text-left rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Graduation checklist
            </div>
            <div className="text-zinc-200 text-sm mt-1">
              {graduationCheckedCount} of {totalGraduationItems} items checked
            </div>
            <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${graduationPct}%` }} />
            </div>
          </button>
        </div>

        {/* Phases */}
        <div className="space-y-8">
          {phases.map(phase => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              progress={progress}
              onSelect={setSelectedModuleId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ label, sub, pct, color }) {
  const colorClass = color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500';
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="text-zinc-200 text-sm mt-1">{sub} · {pct}%</div>
      <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PhaseSection({ phase, progress, onSelect }) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">{phase.title}</h2>
          <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
            {phase.id}
          </div>
        </div>
        <p className="text-sm text-zinc-400 max-w-2xl">{phase.description}</p>
      </div>
      <ul className="space-y-2">
        {phase.modules.map((mod, idx) => {
          const p = progress[mod.id];
          const status = p?.status || 'not_started';
          return (
            <li key={mod.id}>
              <button
                onClick={() => onSelect(mod.id)}
                className="w-full text-left rounded-md border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors p-4 group"
              >
                <div className="flex items-start gap-4">
                  <StatusDot status={status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{mod.id}</span>
                      <span className="text-sm font-medium text-zinc-100 group-hover:text-white">{mod.title}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{mod.summary}</div>
                  </div>
                  <div className="hidden sm:block text-xs text-zinc-500 font-mono">
                    {p?.quiz_best_score ? `${Math.round(p.quiz_best_score * 100)}%` : ''}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatusDot({ status }) {
  const map = {
    not_started: { color: 'bg-zinc-700', label: '—' },
    in_progress: { color: 'bg-yellow-500', label: '…' },
    completed: { color: 'bg-emerald-500', label: '✓' }
  };
  const s = map[status] || map.not_started;
  return (
    <div className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{}}>
      <div className={`w-full h-full rounded-full ${s.color}`} />
    </div>
  );
}

// ============================================================
// Module detail view
// ============================================================

function ModuleView({ mod, progress, checklist, onBack, onSelectModule, onToggle, onStart, onQuizSubmit }) {
  // Mark as started on first view
  React.useEffect(() => { onStart(); /* eslint-disable-next-line */ }, [mod.id]);

  // Scroll to top when module changes
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [mod.id]);

  const isPositionCalculatorModule = mod.id === 'm10' || mod.id === 'm11';
  const idx = allModules.findIndex(m => m.id === mod.id);
  const nextMod = allModules[idx + 1];
  const prevMod = allModules[idx - 1];

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-zinc-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Back nav */}
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
        >
          ← Back to all modules
        </button>

        {/* Module header */}
        <header className="space-y-2 pb-6 border-b border-zinc-800">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{mod.id}</span>
            {progress?.status === 'completed' && (
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded">
                Completed
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">{mod.title}</h1>
          <p className="text-sm text-zinc-400">{mod.summary}</p>
        </header>

        {/* Lesson body */}
        <LessonBody sections={mod.sections} />

        {/* Diagram */}
        {mod.diagram && (
          <div className="pt-2">
            <Diagram id={mod.diagram} />
          </div>
        )}

        {/* Position Calculator (only on m10/m11) */}
        {isPositionCalculatorModule && (
          <div className="pt-2">
            <PositionCalculator />
          </div>
        )}

        {/* Takeaways checklist */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Key takeaways — check when you have them down
          </h3>
          <Checklist items={mod.takeaways} checklist={checklist} onToggle={onToggle} />
        </section>

        {/* Practice task */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Practice task
          </h3>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
            <div className="text-sm font-medium text-zinc-100">{mod.task.title}</div>
            <ol className="space-y-2 list-decimal list-inside text-sm text-zinc-300">
              {mod.task.steps.map((step, i) => (
                <li key={i} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Quiz */}
        <section className="space-y-3 pt-4 border-t border-zinc-800">
          <Quiz
            questions={mod.quiz}
            onSubmit={onQuizSubmit}
            savedBest={progress?.quiz_best_score || 0}
          />
        </section>

        {/* Footer nav */}
        <div className="pt-6 border-t border-zinc-800 flex items-center justify-between gap-3">
          {prevMod ? (
            <button
              onClick={() => onSelectModule(prevMod.id)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-left"
            >
              ← {prevMod.id}: {prevMod.title}
            </button>
          ) : (
            <button
              onClick={onBack}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Back to all modules
            </button>
          )}
          {nextMod ? (
            <button
              onClick={() => onSelectModule(nextMod.id)}
              className="text-xs text-zinc-300 hover:text-zinc-100 transition-colors text-right"
            >
              {nextMod.id}: {nextMod.title} →
            </button>
          ) : (
            <div className="text-xs text-zinc-500 text-right">Last module · graduate via the checklist.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Graduation view
// ============================================================

function GraduationView({ checklist, onToggle, onBack, checkedCount, pct }) {
  return (
    <div className="min-h-screen bg-[#0a0b0f] text-zinc-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <button
          onClick={onBack}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
        >
          ← Back to course
        </button>

        <header className="space-y-3 pb-6 border-b border-zinc-800">
          <div className="text-[11px] uppercase tracking-[0.18em] text-purple-400">
            Graduation checklist
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
            Ready for prop eval?
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Be brutally honest. Only check items that are genuinely true. False checks help no one.
            All {totalGraduationItems} items must be checked before you should pay for a Topstep or MFFU evaluation.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs font-mono text-zinc-400">{checkedCount} / {totalGraduationItems}</div>
          </div>
        </header>

        {graduationChecklist.map((section, i) => (
          <section key={i} className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
              {section.section}
            </h2>
            <Checklist items={section.items} checklist={checklist} onToggle={onToggle} />
          </section>
        ))}

        {pct === 100 && (
          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-5 text-emerald-300 text-sm">
            <div className="font-semibold mb-1">All checks complete.</div>
            <p>You've done the work. Time to take a real eval. Verify current rules at topstep.com or myfundedfutures.com before paying.</p>
          </div>
        )}
      </div>
    </div>
  );
}
