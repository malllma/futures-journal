// useJournalData — shared Supabase loader for the read-only analytics surfaces
// (Analytics page + Edge/Playbook page). Loads trades + daily_notes + no_trades,
// keeps them in sync via realtime, and degrades gracefully if an optional table
// (daily_notes / no_trades) doesn't exist yet because a migration hasn't been run.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabase';

export function useJournalData(user) {
  const [trades, setTrades] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]); // [{date, note, updated_at}]
  const [noTrades, setNoTrades] = useState([]);      // [{date, reason, note}]
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(null);

  const loadAll = useCallback(async () => {
    const [tradesRes, notesRes, noTradesRes] = await Promise.all([
      supabase.from('trades').select('*').order('date', { ascending: false }),
      supabase.from('daily_notes').select('*').order('date', { ascending: false }),
      supabase.from('no_trades').select('*').order('date', { ascending: false }),
    ]);

    if (tradesRes.error) { setErr(`Trades load failed: ${tradesRes.error.message}`); return; }
    setTrades(tradesRes.data || []);

    // daily_notes / no_trades are optional — missing table is not a hard error
    setDailyNotes(notesRes.error ? [] : (notesRes.data || []));
    setNoTrades(noTradesRes.error ? [] : (noTradesRes.data || []));
    setErr(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAll();
      if (mounted) setLoaded(true);
    })();
    const ch = supabase
      .channel(`journal-data-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_notes' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'no_trades' }, loadAll)
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(ch); };
  }, [user.id, loadAll]);

  const notesMap = useMemo(() => {
    const m = {};
    for (const n of dailyNotes) m[n.date] = n.note;
    return m;
  }, [dailyNotes]);

  return { trades, dailyNotes, noTrades, notesMap, loaded, err, reload: loadAll };
}
