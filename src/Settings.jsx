// Settings — account, data export, and migration status.

import { Settings as SettingsIcon, LogOut, Database, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useJournalData } from './lib/useJournalData';
import ExportButtons from './components/ExportButtons';

export default function Settings({ user }) {
  const { trades, noTrades, notesMap, loaded } = useJournalData(user);

  // If the edge-upgrade migration ran, new columns exist. We can't read DDL from the
  // client, so we infer: any trade with a new field set ⇒ migration is live.
  const migrationLive = trades.some(
    (t) => t.setup_family != null || t.entry_trigger != null || t.execution_quality != null ||
      t.mistake_type != null || t.stop_loss != null || t.take_profit != null || t.is_eval != null
  ) || noTrades.length > 0;

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans">
      <header className="sticky top-0 z-20 bg-[#0a0b0f]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <SettingsIcon size={16} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Futures Journal</div>
            <div className="text-sm font-medium">Settings</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Account */}
        <Card title="Account" icon={<SettingsIcon size={14} />}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Signed in as</div>
              <div className="text-sm text-neutral-200 truncate">{user.email}</div>
            </div>
            <button onClick={signOut} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-white/10 text-neutral-300 hover:bg-white/5">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </Card>

        {/* Export */}
        <Card title="Export" icon={<FileText size={14} />} subtitle="Download a Markdown edge report for ChatGPT, plus the raw trades CSV.">
          {loaded ? (
            <ExportButtons trades={trades} notesMap={notesMap} meta={{ rangeLabel: 'All time', filterLabel: 'All trades' }} />
          ) : (
            <div className="text-xs text-neutral-500">Loading your trades…</div>
          )}
        </Card>

        {/* Migration status */}
        <Card title="Database migration" icon={<Database size={14} />}
          subtitle="The edge-upgrade adds new (nullable) fields. Your existing trades are never modified.">
          {migrationLive ? (
            <div className="flex items-start gap-2 text-sm text-emerald-300">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>Edge-upgrade fields detected — the migration looks live. New setup-family, trigger, execution and mistake fields are active.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm text-amber-300">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>No edge-upgrade fields detected yet. If you just deployed, run the migration once so the new fields can save.</span>
              </div>
              <ol className="text-xs text-neutral-400 list-decimal list-inside space-y-1 pl-1">
                <li>Open Supabase → <span className="text-neutral-200">SQL Editor</span> → New query.</li>
                <li>Paste the contents of <span className="font-mono text-neutral-200">supabase-edge-upgrade.sql</span>.</li>
                <li>Click <span className="text-neutral-200">Run</span>. It only adds nullable columns + one table — your 34 trades stay intact.</li>
              </ol>
            </div>
          )}
        </Card>

        <div className="text-[11px] text-neutral-600 text-center pt-2">
          {trades.length} trade{trades.length === 1 ? '' : 's'} · {noTrades.length} no-trade day{noTrades.length === 1 ? '' : 's'} · synced across your devices.
        </div>
      </main>
    </div>
  );
}

function Card({ title, subtitle, icon, children }) {
  return (
    <section className="bg-[#0d0e13] border border-white/5 rounded-xl p-4 sm:p-5">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/5 flex items-center justify-center text-neutral-400 shrink-0 mt-0.5">{icon}</div>
        <div>
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          {subtitle && <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{subtitle}</div>}
        </div>
      </div>
      {children}
    </section>
  );
}
