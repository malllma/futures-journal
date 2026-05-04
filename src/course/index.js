// Course content index: aggregates all 6 phases.
// Graduation checklist is also defined here.

import { phase1 } from './modules/phase1';
import { phase2 } from './modules/phase2';
import { phase3 } from './modules/phase3';
import { phase4 } from './modules/phase4';
import { phase5 } from './modules/phase5';
import { phase6 } from './modules/phase6';

export const phases = [phase1, phase2, phase3, phase4, phase5, phase6];

// Flat list of all modules in order.
export const allModules = phases.flatMap(p => p.modules.map(m => ({ ...m, phaseId: p.id, phaseTitle: p.title })));

// Lookup helpers
export const moduleById = id => allModules.find(m => m.id === id);
export const phaseByModuleId = id => phases.find(p => p.modules.some(m => m.id === id));
export const moduleIndex = id => allModules.findIndex(m => m.id === id);

// Total stats
export const totalModules = allModules.length;
export const totalQuizQuestions = allModules.reduce((s, m) => s + m.quiz.length, 0);

// Graduation checklist — the gate to "ready for prop eval".
// item ids prefixed with `graduation.` so they live alongside takeaway items
// in the same course_checklist Supabase table.
export const graduationChecklist = [
  {
    section: 'Foundations',
    items: [
      { id: 'graduation.f1', text: 'I can answer Phase 1-2 quizzes cold without notes.' },
      { id: 'graduation.f2', text: 'I have memorized ES contract specs (point value, tick size, margin, expiry).' },
      { id: 'graduation.f3', text: 'I can identify the day type (balance vs imbalance, trend vs normal) by 11am ET.' }
    ]
  },
  {
    section: 'Risk discipline',
    items: [
      { id: 'graduation.r1', text: 'I have traded 30+ consecutive sim sessions without violating my 1% per-trade limit.' },
      { id: 'graduation.r2', text: 'I have respected my daily loss limit (3% or 3 consecutive losses) on every session for 30+ days.' },
      { id: 'graduation.r3', text: 'I have not moved a stop after entry in the last 30 days of sim.' },
      { id: 'graduation.r4', text: 'I have a written drawdown plan covering 5R, 10R, and 20R drawdowns, signed and dated.' }
    ]
  },
  {
    section: 'Validated playbook',
    items: [
      { id: 'graduation.p1', text: 'I have ONE primary playbook setup with specific, written, testable rules.' },
      { id: 'graduation.p2', text: 'I have backtested this setup on 100+ historical occurrences. Expectancy is +0.2R or better after slippage.' },
      { id: 'graduation.p3', text: 'I have sim-traded this setup for 50+ trades. Expectancy is +0.2R or better.' },
      { id: 'graduation.p4', text: 'My sim performance is within 30% of my backtest performance (execution is consistent).' }
    ]
  },
  {
    section: 'Journal habit',
    items: [
      { id: 'graduation.j1', text: 'I have logged every trade in the journal for the last 30+ trading days. No skipped entries.' },
      { id: 'graduation.j2', text: 'I have completed at least 8 weekly reviews, with written takeaways and concrete adjustments.' },
      { id: 'graduation.j3', text: 'I have completed at least 1 monthly deep review.' },
      { id: 'graduation.j4', text: 'I can articulate, for any past loss in my journal, whether it was a valid setup that lost or an execution error.' }
    ]
  },
  {
    section: 'Psychology',
    items: [
      { id: 'graduation.psy1', text: 'I have a written psychology rules document (daily limits, max trades, sizing rules, cooldown rules).' },
      { id: 'graduation.psy2', text: 'I have not had a revenge trade or off-playbook trade in the last 30 days of sim.' },
      { id: 'graduation.psy3', text: 'My position size has not flexed with recent results in the last 30 days. Same size after wins, same size after losses.' },
      { id: 'graduation.psy4', text: 'I can name a recent moment when I wanted to violate a rule, and what I did instead.' }
    ]
  },
  {
    section: 'Prop readiness',
    items: [
      { id: 'graduation.pr1', text: 'I have simulated a Topstep $50K Combine (or MFFU equivalent) in sim with strict rule adherence and passed at least 2 of 3 attempts.' },
      { id: 'graduation.pr2', text: 'I have read the current Topstep and/or MFFU rules directly from their website (not summary sources).' },
      { id: 'graduation.pr3', text: 'I have a written plan for sizing during the eval that respects the trailing/EOD drawdown rule.' },
      { id: 'graduation.pr4', text: 'I have decided which firm to start with, and why, in writing.' }
    ]
  }
];

// Total graduation items (for progress calculation)
export const totalGraduationItems = graduationChecklist.reduce((s, sec) => s + sec.items.length, 0);
