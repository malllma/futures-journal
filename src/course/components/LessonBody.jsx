// LessonBody: renders the sections array of a module.
// Supports **bold** markdown in body text.

import React from 'react';

function renderInline(text) {
  // Split by **bold** markers, preserving them
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="text-zinc-100 font-semibold">{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export function LessonBody({ sections }) {
  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <section key={i} className="space-y-3">
          <h3 className="text-lg font-semibold text-zinc-100 tracking-tight">
            {section.heading}
          </h3>
          <div className="space-y-3 text-zinc-300 leading-relaxed">
            {section.body.map((para, j) => (
              <p key={j}>{renderInline(para)}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
