// Shared export controls (used by Analytics, Edge/Playbook, Settings).
//   * Download Edge Report — compact Markdown summary to upload to ChatGPT (#16)
//   * Export CSV — raw per-trade data, backward-compatible columns

import { Download, FileText } from 'lucide-react';
import { buildEdgeReportMarkdown, tradesToCSV } from '../lib/report';
import { downloadText } from '../lib/download';

export default function ExportButtons({ trades, notesMap = {}, meta = {}, compact = false }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const disabled = !trades || trades.length === 0;

  const onReport = () => {
    const md = buildEdgeReportMarkdown(trades, notesMap, { generatedAt: stamp, ...meta });
    downloadText(`edge-report-${stamp}.md`, md, 'text/markdown');
  };
  const onCSV = () => {
    downloadText(`trades-${stamp}.csv`, tradesToCSV(trades, notesMap), 'text/csv');
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onReport}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FileText size={14} />
        <span className={compact ? 'hidden sm:inline' : ''}>Download Edge Report</span>
        <span className={compact ? 'sm:hidden' : 'hidden'}>Report</span>
      </button>
      <button
        onClick={onCSV}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-white/5 border border-white/10 text-neutral-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Download size={14} />
        <span className={compact ? 'hidden sm:inline' : ''}>Export CSV</span>
        <span className={compact ? 'sm:hidden' : 'hidden'}>CSV</span>
      </button>
    </div>
  );
}
