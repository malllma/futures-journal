// Quiz: multiple-choice quiz with instant feedback.
// Submitting calls recordQuizAttempt with score (0..1).
// Score >= 0.7 marks the module as completed.

import React, { useState } from 'react';

export function Quiz({ questions, onSubmit, savedBest }) {
  const [answers, setAnswers] = useState({});  // { questionIdx: optionIdx }
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const handleSelect = (qIdx, optIdx) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qIdx]: optIdx }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const score = correct / questions.length;
    setSubmitted(true);
    const r = onSubmit ? onSubmit(score) : { passed: score >= 0.7, score };
    setResult(r);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
          End-of-module quiz
        </h3>
        {savedBest > 0 && !submitted && (
          <div className="text-xs text-zinc-500 font-mono">
            Best: {Math.round(savedBest * 100)}%
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => {
          const userAns = answers[qi];
          const isCorrect = submitted && userAns === q.answer;
          const isWrong = submitted && userAns !== undefined && userAns !== q.answer;

          return (
            <div key={qi} className="space-y-3">
              <div className="text-sm font-medium text-zinc-200">
                <span className="text-zinc-500 font-mono mr-2">Q{qi + 1}.</span>
                {q.q}
              </div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = userAns === oi;
                  const isAnswer = q.answer === oi;

                  let cls = 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700';
                  if (submitted) {
                    if (isAnswer) cls = 'border-emerald-700/60 bg-emerald-950/30 text-emerald-200';
                    else if (isSelected) cls = 'border-rose-700/60 bg-rose-950/30 text-rose-200';
                    else cls = 'border-zinc-800 bg-zinc-900/30 text-zinc-500';
                  } else if (isSelected) {
                    cls = 'border-zinc-500 bg-zinc-800 text-zinc-100';
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={submitted}
                      className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors
                                  ${cls} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="font-mono text-xs text-zinc-500 mr-3">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (isCorrect || isWrong) && (
                <div className={`text-xs px-3 py-2 rounded-md border
                                 ${isCorrect ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300'
                                            : 'border-rose-900/60 bg-rose-950/20 text-rose-300'}`}>
                  <span className="font-medium">{isCorrect ? 'Correct.' : 'Incorrect.'}</span>{' '}
                  {q.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500
                     disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed
                     text-white text-sm font-medium transition-colors"
        >
          Submit answers
        </button>
      ) : (
        <div className="flex items-center gap-4 pt-2 border-t border-zinc-800">
          <div className={`text-sm font-medium ${result?.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {result?.passed ? '✓ Passed' : 'Did not pass'} — Score: {Math.round(result?.score * 100)}%
            {result?.passed
              ? ' — module marked complete.'
              : ' — review the material and retry. 70% to pass.'}
          </div>
          <button
            onClick={handleRetry}
            className="ml-auto px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-600
                       text-zinc-300 hover:text-zinc-100 text-xs transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
