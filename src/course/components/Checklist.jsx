// Checklist: renders an array of items with checkboxes synced via toggleChecklist.

import React from 'react';

export function Checklist({ items, checklist, onToggle, title }) {
  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          {title}
        </h4>
      )}
      <ul className="space-y-2">
        {items.map(item => {
          const checked = !!checklist[item.id];
          return (
            <li key={item.id}>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onToggle(item.id, e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-900
                             text-emerald-500 focus:ring-1 focus:ring-emerald-500
                             focus:ring-offset-0 focus:ring-offset-transparent cursor-pointer"
                />
                <span className={`text-sm leading-relaxed transition-colors
                  ${checked ? 'text-zinc-500 line-through' : 'text-zinc-200 group-hover:text-zinc-100'}`}>
                  {item.text}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
