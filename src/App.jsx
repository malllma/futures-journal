import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  X,
  TrendingUp,
  TrendingDown,
  Calendar as CalIcon,
  LogOut,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';

// ----- date helpers -----
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayYMD = () => ymd(new Date());

const monthLabel = (d) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const grid = [];
  const start = new Date(year, month, 1 - startDow);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push({
      date: d,
      inMonth: d.getMonth() === month,
      key: ymd(d),
    });
  }
  const rows = [];
  for (let r = 0; r < 6; r++) rows.push(grid.slice(r * 7, r * 7 + 7));
  while (rows.length > 0 && rows[rows.length - 1].every((c) => !c.inMonth)) {
    rows.pop();
  }
  return rows;
}

// ----- formatting -----
const fmtMoney = (n, opts = {}) => {
  const { sign = true, dp = 2 } = opts;
  if (n === 0 || n === undefined || n === null || Number.isNaN(n)) return '$0.00';
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
  const s = n < 0 ? '-' : sign ? '' : '';
  return `${s}$${abs}`;
};

const niceDate = (yyyymmdd) => {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// transform Supabase row to UI shape
function fromDb(row) {
  return {
    id: row.id,
    date: row.date,
    symbol: row.symbol,
    direction: row.direction,
    pnl: Number(row.pnl),
    entry: row.entry == null ? null : Number(row.entry),
    exit: row.exit == null ? null : Number(row.exit),
    quantity: row.quantity == null ? null : Number(row.quantity),
    setup: row.setup,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// ===== top-level =====
export default function App() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] text-neutral-300 flex items-center justify-center font-sans">
        <div className="text-sm tracking-wide opacity-60">Loading…</div>
      </div>
    );
  }
  if (!session) return <Auth />;
  return <Journal user={session.user} key={session.user.id} />;
}

// ===== Journal (the original main app, with Supabase data layer) =====
function Journal({ user }) {
  const [trades, setTrades] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [storageErr, setStorageErr] = useState(null);

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formDefaultDate, setFormDefaultDate] = useState(todayYMD());

  // --- load + realtime ---
  const loadTrades = async () => {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) {
      setStorageErr(`Could not load trades: ${error.message}`);
      return;
    }
    setTrades((data || []).map(fromDb));
    setStorageErr(null);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadTrades();
      if (mounted) setLoaded(true);
    })();

    const channel = supabase
      .channel(`trades-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trades' },
        () => {
          loadTrades();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // --- CRUD ---
  const addTrade = async (t) => {
    const { error } = await supabase.from('trades').insert({
      user_id: user.id,
      date: t.date,
      symbol: t.symbol,
      direction: t.direction,
      pnl: t.pnl,
      entry: t.entry,
      exit: t.exit,
      quantity: t.quantity,
      setup: t.setup,
      notes: t.notes,
    });
    if (error) setStorageErr(`Save failed: ${error.message}`);
    else {
      setStorageErr(null);
      await loadTrades();
    }
  };

  const updateTrade = async (id, patch) => {
    const dbPatch = {};
    for (const [k, v] of Object.entries(patch)) {
      if (k === 'createdAt') dbPatch.created_at = v;
      else dbPatch[k] = v;
    }
    const { error } = await supabase.from('trades').update(dbPatch).eq('id', id);
    if (error) setStorageErr(`Update failed: ${error.message}`);
    else {
      setStorageErr(null);
      await loadTrades();
    }
  };

  const deleteTrade = async (id) => {
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) setStorageErr(`Delete failed: ${error.message}`);
    else {
      setStorageErr(null);
      await loadTrades();
    }
  };

  // --- derived ---
  const byDate = useMemo(() => {
    const m = new Map();
    for (const t of trades) {
      if (!m.has(t.date)) m.set(t.date, []);
      m.get(t.date).push(t);
    }
    return m;
  }, [trades]);

  const grid = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );

  const monthlyPnl = useMemo(() => {
    let total = 0;
    let count = 0;
    for (const t of trades) {
      const [y, m] = t.date.split('-').map(Number);
      if (y === cursor.getFullYear() && m - 1 === cursor.getMonth()) {
        total += Number(t.pnl) || 0;
        count += 1;
      }
    }
    return { total, count };
  }, [trades, cursor]);

  const weeklyTotals = useMemo(() => {
    return grid.map((row) => {
      let total = 0;
      let count = 0;
      let any = false;
      for (const cell of row) {
        const list = byDate.get(cell.key) || [];
        for (const t of list) {
          total += Number(t.pnl) || 0;
          count += 1;
          any = true;
        }
      }
      return { total, count, any };
    });
  }, [grid, byDate]);

  const goPrev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
  };

  const openDay = (key) => setSelectedDate(key);
  const closeDay = () => setSelectedDate(null);

  const openAdd = (date) => {
    setEditingTrade(null);
    setShowForm(true);
    setFormDefaultDate(date || todayYMD());
  };
  const openEdit = (trade) => {
    setEditingTrade(trade);
    setShowForm(true);
    setFormDefaultDate(trade.date);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingTrade(null);
  };

  const submitTrade = async (data) => {
    if (editingTrade) {
      await updateTrade(editingTrade.id, data);
    } else {
      await addTrade(data);
    }
    closeForm();
    if (data.date) setSelectedDate(data.date);
  };

  const requestDelete = (id) => setConfirmDelete(id);
  const cancelDelete = () => setConfirmDelete(null);
  const doDelete = async () => {
    if (confirmDelete) await deleteTrade(confirmDelete);
    setConfirmDelete(null);
  };

  const selectedTrades = selectedDate ? byDate.get(selectedDate) || [] : [];
  const selectedPnl = selectedTrades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const selectedWins = selectedTrades.filter((t) => Number(t.pnl) > 0).length;

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] text-neutral-300 flex items-center justify-center font-sans">
        <div className="text-sm tracking-wide opacity-60">Loading journal…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#0a0b0f]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                Futures Journal
              </div>
              <div className="text-sm font-medium truncate">P/L Calendar</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                Monthly P/L
              </div>
              <div
                className={`font-mono text-lg tabular-nums ${
                  monthlyPnl.total > 0
                    ? 'text-emerald-400'
                    : monthlyPnl.total < 0
                    ? 'text-rose-400'
                    : 'text-neutral-400'
                }`}
              >
                {fmtMoney(monthlyPnl.total)}
              </div>
            </div>
            <button
              onClick={() => openAdd(todayYMD())}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-500 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Trade</span>
              <span className="sm:hidden">New</span>
            </button>
            <UserMenu email={user.email} />
          </div>
        </div>

        <div className="sm:hidden border-t border-white/5 px-4 py-2 flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Monthly P/L
          </div>
          <div
            className={`font-mono text-base tabular-nums ${
              monthlyPnl.total > 0
                ? 'text-emerald-400'
                : monthlyPnl.total < 0
                ? 'text-rose-400'
                : 'text-neutral-400'
            }`}
          >
            {fmtMoney(monthlyPnl.total)}
            <span className="ml-2 text-[11px] text-neutral-500">
              {monthlyPnl.count} trades
            </span>
          </div>
        </div>
      </header>

      {storageErr && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-3">
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs px-3 py-2">
            {storageErr}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-2 rounded-md hover:bg-white/5 text-neutral-400 hover:text-neutral-200"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="font-display text-lg sm:text-xl tracking-tight px-1">
              {monthLabel(cursor)}
            </div>
            <button
              onClick={goNext}
              className="p-2 rounded-md hover:bg-white/5 text-neutral-400 hover:text-neutral-200"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <button
            onClick={goToday}
            className="text-xs px-2.5 py-1.5 rounded-md border border-white/10 hover:border-white/20 text-neutral-300"
          >
            Today
          </button>
        </div>

        <Calendar
          grid={grid}
          byDate={byDate}
          weeklyTotals={weeklyTotals}
          monthIdx={cursor.getMonth()}
          onSelectDay={openDay}
        />

        {trades.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-white/10 p-8 text-center">
            <div className="mx-auto w-10 h-10 rounded-md border border-white/10 flex items-center justify-center mb-3">
              <CalIcon size={18} className="text-neutral-500" />
            </div>
            <div className="text-sm text-neutral-300 font-medium">No trades yet</div>
            <div className="text-xs text-neutral-500 mt-1">
              Tap any day to log your first trade, or hit{' '}
              <span className="text-emerald-400">New Trade</span> at the top.
            </div>
          </div>
        )}

        <footer className="mt-8 text-[11px] text-neutral-600 text-center">
          Trades sync across all devices signed in to your account.
        </footer>
      </main>

      {selectedDate && (
        <DayDrawer
          dateKey={selectedDate}
          trades={selectedTrades}
          totalPnl={selectedPnl}
          wins={selectedWins}
          onClose={closeDay}
          onAdd={() => openAdd(selectedDate)}
          onEdit={openEdit}
          onDelete={requestDelete}
        />
      )}

      {showForm && (
        <TradeForm
          initial={editingTrade}
          defaultDate={formDefaultDate}
          onSubmit={submitTrade}
          onCancel={closeForm}
        />
      )}

      {confirmDelete && (
        <ConfirmDelete onCancel={cancelDelete} onConfirm={doDelete} />
      )}
    </div>
  );
}

// ===== User menu =====
function UserMenu({ email }) {
  const [open, setOpen] = useState(false);
  const initial = (email || '?').charAt(0).toUpperCase();

  const signOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] flex items-center justify-center text-xs font-medium text-neutral-300"
        aria-label="Account menu"
      >
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-60 rounded-md border border-white/10 bg-[#101218] shadow-xl z-20 anim-fade overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/5">
              <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                Signed in as
              </div>
              <div className="text-xs text-neutral-200 truncate mt-0.5">{email}</div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-left px-3 py-2.5 text-xs text-neutral-300 hover:bg-white/5 inline-flex items-center gap-2"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ===== Calendar =====
function Calendar({ grid, byDate, weeklyTotals, monthIdx, onSelectDay }) {
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return (
    <div className="rounded-lg border border-white/5 overflow-hidden bg-[#0d0e13]">
      <div className="grid grid-cols-7 text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-neutral-500 border-b border-white/5">
        {dayNames.map((d, i) => (
          <div
            key={d}
            className={`px-2 py-2 text-center ${i === 6 ? 'bg-white/[0.015]' : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div>
        {grid.map((row, ri) => {
          const wt = weeklyTotals[ri];
          return (
            <div
              key={ri}
              className="grid grid-cols-7 border-b border-white/5 last:border-b-0"
            >
              {row.map((cell, ci) => {
                const isSat = ci === 6;
                if (isSat) {
                  const dayTrades = byDate.get(cell.key) || [];
                  const dayPnl = dayTrades.reduce(
                    (s, t) => s + (Number(t.pnl) || 0),
                    0
                  );
                  return (
                    <SaturdayCell
                      key={cell.key}
                      cell={cell}
                      monthIdx={monthIdx}
                      weeklyTotal={wt.total}
                      weeklyCount={wt.count}
                      weekHas={wt.any}
                      dayTrades={dayTrades}
                      dayPnl={dayPnl}
                      weekIndex={ri + 1}
                      onClick={() => onSelectDay(cell.key)}
                    />
                  );
                }
                const dayTrades = byDate.get(cell.key) || [];
                const dayPnl = dayTrades.reduce(
                  (s, t) => s + (Number(t.pnl) || 0),
                  0
                );
                return (
                  <DayCell
                    key={cell.key}
                    cell={cell}
                    monthIdx={monthIdx}
                    pnl={dayPnl}
                    count={dayTrades.length}
                    onClick={() => onSelectDay(cell.key)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function cellTone(pnl, count) {
  if (count === 0) return { bg: '', text: 'text-neutral-600', amount: '' };
  if (pnl > 0)
    return {
      bg: 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.13]',
      text: 'text-emerald-300',
      amount: 'text-emerald-400',
    };
  if (pnl < 0)
    return {
      bg: 'bg-rose-500/[0.08] hover:bg-rose-500/[0.13]',
      text: 'text-rose-300',
      amount: 'text-rose-400',
    };
  return { bg: 'bg-white/[0.02]', text: 'text-neutral-400', amount: 'text-neutral-400' };
}

function DayCell({ cell, monthIdx, pnl, count, onClick }) {
  const inMonth = cell.date.getMonth() === monthIdx;
  const isToday = ymd(cell.date) === todayYMD();
  const tone = cellTone(pnl, count);

  return (
    <button
      onClick={onClick}
      className={[
        'group relative text-left',
        'min-h-[68px] sm:min-h-[96px] p-1.5 sm:p-2.5',
        'border-r border-white/5 last:border-r-0',
        'transition-colors duration-150',
        tone.bg || 'hover:bg-white/[0.025]',
        inMonth ? '' : 'opacity-40',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            'text-[11px] sm:text-xs font-medium tabular-nums',
            isToday ? 'text-white' : 'text-neutral-500',
          ].join(' ')}
        >
          {cell.date.getDate()}
        </span>
        {isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]" />
        )}
      </div>

      {count > 0 ? (
        <div className="mt-2 sm:mt-3">
          <div
            className={`font-mono text-[12px] sm:text-[15px] font-semibold tabular-nums leading-tight ${tone.amount}`}
          >
            {fmtMoney(pnl)}
          </div>
          <div className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5">
            {count} {count === 1 ? 'trade' : 'trades'}
          </div>
        </div>
      ) : (
        <div className="mt-2 sm:mt-3 text-[10px] text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
          + add
        </div>
      )}
    </button>
  );
}

function SaturdayCell({
  cell,
  monthIdx,
  weeklyTotal,
  weeklyCount,
  weekHas,
  dayTrades,
  dayPnl,
  weekIndex,
  onClick,
}) {
  const inMonth = cell.date.getMonth() === monthIdx;
  const isToday = ymd(cell.date) === todayYMD();
  const dayHas = dayTrades.length > 0;
  const tone = cellTone(weeklyTotal, weeklyCount);

  return (
    <button
      onClick={onClick}
      className={[
        'group relative text-left',
        'min-h-[68px] sm:min-h-[96px] p-1.5 sm:p-2.5',
        'transition-colors duration-150',
        weekHas ? tone.bg : 'bg-white/[0.015] hover:bg-white/[0.03]',
        inMonth ? '' : 'opacity-40',
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] sm:text-xs font-medium tabular-nums ${
            isToday ? 'text-white' : 'text-neutral-500'
          }`}
        >
          {cell.date.getDate()}
        </span>
        {isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]" />
        )}
      </div>

      <div className="mt-1 sm:mt-2">
        <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-neutral-500 font-semibold">
          Week {weekIndex}
        </div>
        {weekHas ? (
          <>
            <div
              className={`font-mono text-[12px] sm:text-[15px] font-semibold tabular-nums leading-tight mt-0.5 ${tone.amount}`}
            >
              {fmtMoney(weeklyTotal)}
            </div>
            <div className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5">
              {weeklyCount} {weeklyCount === 1 ? 'trade' : 'trades'}
            </div>
          </>
        ) : (
          <div className="text-[10px] text-neutral-700 mt-1">—</div>
        )}
        {dayHas && (
          <div
            className={`mt-1 text-[9px] sm:text-[10px] tabular-nums ${
              dayPnl > 0
                ? 'text-emerald-500/70'
                : dayPnl < 0
                ? 'text-rose-500/70'
                : 'text-neutral-500'
            }`}
          >
            Sat: {fmtMoney(dayPnl)}
          </div>
        )}
      </div>
    </button>
  );
}

// ===== Day drawer =====
function DayDrawer({
  dateKey,
  trades,
  totalPnl,
  wins,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}) {
  const losses = trades.filter((t) => Number(t.pnl) < 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center anim-fade">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg sm:mx-4 bg-[#101218] border border-white/10 sm:rounded-xl rounded-t-xl shadow-2xl anim-slide-up max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-white/5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              Daily Recap
            </div>
            <div className="font-display text-base sm:text-lg mt-0.5">
              {niceDate(dateKey)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 sm:p-5 border-b border-white/5">
          <Stat
            label="P/L"
            value={fmtMoney(totalPnl)}
            tone={totalPnl > 0 ? 'pos' : totalPnl < 0 ? 'neg' : 'neutral'}
          />
          <Stat label="Trades" value={trades.length.toString()} />
          <Stat
            label="Win rate"
            value={trades.length ? `${winRate}%` : '—'}
            sub={trades.length ? `${wins}W / ${losses}L` : null}
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {trades.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-sm text-neutral-300">No trades on this day</div>
              <div className="text-xs text-neutral-500 mt-1">
                Add one to start journaling.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {trades
                .slice()
                .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
                .map((t) => (
                  <TradeRow
                    key={t.id}
                    trade={t}
                    onEdit={() => onEdit(t)}
                    onDelete={() => onDelete(t.id)}
                  />
                ))}
            </ul>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t border-white/5 bg-[#0d0e13]">
          <button
            onClick={onAdd}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400"
          >
            <Plus size={16} /> Add trade for this day
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'neutral', sub = null }) {
  const color =
    tone === 'pos' ? 'text-emerald-400' : tone === 'neg' ? 'text-rose-400' : 'text-neutral-200';
  return (
    <div className="rounded-md bg-white/[0.02] border border-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className={`font-mono text-base tabular-nums mt-0.5 ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function TradeRow({ trade, onEdit, onDelete }) {
  const pnl = Number(trade.pnl) || 0;
  const isLong = trade.direction === 'long';
  return (
    <li className="px-4 sm:px-5 py-3 hover:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-neutral-100">
              {trade.symbol || '—'}
            </span>
            <span
              className={[
                'inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded',
                isLong
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400',
              ].join(' ')}
            >
              {isLong ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {isLong ? 'LONG' : 'SHORT'}
            </span>
            {trade.setup && (
              <span className="text-[10px] uppercase tracking-wider text-neutral-500 px-1.5 py-0.5 rounded border border-white/10">
                {trade.setup}
              </span>
            )}
            {trade.quantity ? (
              <span className="text-[11px] text-neutral-500 font-mono tabular-nums">
                ×{trade.quantity}
              </span>
            ) : null}
          </div>
          {(trade.entry || trade.exit) && (
            <div className="text-[11px] text-neutral-500 font-mono tabular-nums mt-1">
              {trade.entry ? `Entry ${trade.entry}` : ''}
              {trade.entry && trade.exit ? ' → ' : ''}
              {trade.exit ? `Exit ${trade.exit}` : ''}
            </div>
          )}
          {trade.notes && (
            <div className="text-xs text-neutral-400 mt-1.5 leading-relaxed line-clamp-2">
              {trade.notes}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div
            className={`font-mono text-sm font-semibold tabular-nums ${
              pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-rose-400' : 'text-neutral-300'
            }`}
          >
            {fmtMoney(pnl)}
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400 hover:text-neutral-200"
              aria-label="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-md hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ===== Trade form =====
function TradeForm({ initial, defaultDate, onSubmit, onCancel }) {
  const [date, setDate] = useState(initial?.date || defaultDate || todayYMD());
  const [symbol, setSymbol] = useState(initial?.symbol || '');
  const [direction, setDirection] = useState(initial?.direction || 'long');
  const [pnl, setPnl] = useState(initial?.pnl ?? '');
  const [entry, setEntry] = useState(initial?.entry ?? '');
  const [exitVal, setExitVal] = useState(initial?.exit ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? '');
  const [setup, setSetup] = useState(initial?.setup || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [error, setError] = useState(null);

  const symbolRef = useRef(null);
  useEffect(() => {
    if (!initial && symbolRef.current) symbolRef.current.focus();
  }, [initial]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const handleSubmit = () => {
    setError(null);
    if (!symbol.trim()) {
      setError('Symbol is required (e.g. ES, NQ, CL).');
      return;
    }
    if (pnl === '' || pnl === null || isNaN(Number(pnl))) {
      setError('P/L is required and must be a number.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    const trade = {
      date,
      symbol: symbol.trim().toUpperCase(),
      direction,
      pnl: Number(pnl),
      entry: entry === '' ? null : Number(entry),
      exit: exitVal === '' ? null : Number(exitVal),
      quantity: quantity === '' ? null : Number(quantity),
      setup: setup.trim() || null,
      notes: notes.trim() || null,
    };
    onSubmit(trade);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center anim-fade">
      <div className="absolute inset-0 bg-black/75" onClick={onCancel} />
      <div className="relative w-full sm:max-w-md sm:mx-4 bg-[#101218] border border-white/10 sm:rounded-xl rounded-t-xl shadow-2xl anim-slide-up max-h-[92vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 sticky top-0 bg-[#101218]/95 backdrop-blur z-10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
              {initial ? 'Edit' : 'New'} Trade
            </div>
            <div className="font-display text-base mt-0.5">Trade Details</div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <Field label="Date">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 focus:border-emerald-500/50 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Symbol">
              <input
                ref={symbolRef}
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="ES, NQ, CL…"
                autoCapitalize="characters"
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm font-mono uppercase tracking-wide text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none"
              />
            </Field>
            <Field label="Direction">
              <div className="grid grid-cols-2 gap-1 bg-[#0a0b0f] border border-white/10 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => setDirection('long')}
                  className={[
                    'inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded',
                    direction === 'long'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-neutral-500 hover:text-neutral-300',
                  ].join(' ')}
                >
                  <TrendingUp size={12} /> LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('short')}
                  className={[
                    'inline-flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded',
                    direction === 'short'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'text-neutral-500 hover:text-neutral-300',
                  ].join(' ')}
                >
                  <TrendingDown size={12} /> SHORT
                </button>
              </div>
            </Field>
          </div>

          <Field label="P/L ($)" hint="Net profit or loss for this trade. Negative for losses.">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="e.g. 250.00 or -180.50"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-base font-mono tabular-nums text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="—"
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-2.5 py-2 text-sm font-mono tabular-nums text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
              />
            </Field>
            <Field label="Exit">
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={exitVal}
                onChange={(e) => setExitVal(e.target.value)}
                placeholder="—"
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-2.5 py-2 text-sm font-mono tabular-nums text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
              />
            </Field>
            <Field label="Qty">
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="—"
                className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-2.5 py-2 text-sm font-mono tabular-nums text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
              />
            </Field>
          </div>

          <Field label="Setup / Tag" hint="Optional — e.g. breakout, VWAP reclaim, opening drive.">
            <input
              type="text"
              value={setup}
              onChange={(e) => setSetup(e.target.value)}
              placeholder="—"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
            />
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What worked, what didn't, lessons…"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none resize-none"
            />
          </Field>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-white/5 flex gap-2 sticky bottom-0 bg-[#101218]/95 backdrop-blur">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-md border border-white/10 text-sm text-neutral-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-md bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400"
          >
            {initial ? 'Save Changes' : 'Save Trade'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 font-semibold">
          {label}
        </span>
      </div>
      {children}
      {hint && <div className="text-[10px] text-neutral-600 mt-1">{hint}</div>}
    </label>
  );
}

// ===== Confirm delete =====
function ConfirmDelete({ onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center anim-fade">
      <div className="absolute inset-0 bg-black/75" onClick={onCancel} />
      <div className="relative max-w-sm mx-4 w-full bg-[#101218] border border-white/10 rounded-xl shadow-2xl p-5 anim-slide-up">
        <div className="font-display text-base">Delete this trade?</div>
        <div className="text-sm text-neutral-400 mt-1">This can't be undone.</div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-md border border-white/10 text-sm text-neutral-300 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-md bg-rose-500 text-white font-medium text-sm hover:bg-rose-400"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
