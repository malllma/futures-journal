// App.jsx — shell. Handles auth and the Journal <-> Course switcher.
// Existing v1 journal logic is preserved 1:1 inside Journal.jsx.

import { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, LogOut, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Journal from './Journal';
import Course from './Course';

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
        <FontStyles />
        <div className="text-sm tracking-wide opacity-60">Loading…</div>
      </div>
    );
  }
  if (!session) return (<><FontStyles /><Auth /></>);
  return <Shell user={session.user} key={session.user.id} />;
}

// ===== Shell with sidebar/tab nav =====
function Shell({ user }) {
  // Persist last-selected tab in localStorage so reload doesn't bounce you back to Journal.
  const initial = (() => {
    try {
      const v = localStorage.getItem('fj_tab');
      return v === 'course' ? 'course' : 'journal';
    } catch { return 'journal'; }
  })();
  const [tab, setTab] = useState(initial);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const setTabPersist = (t) => {
    setTab(t);
    setMobileNavOpen(false);
    try { localStorage.setItem('fj_tab', t); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans">
      <FontStyles />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-56 bg-[#0d0e13] border-r border-white/5 flex-col z-30">
        <div className="px-4 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Futures</div>
              <div className="text-sm font-medium text-neutral-200">Journal & Course</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <NavLink active={tab === 'journal'} onClick={() => setTabPersist('journal')} icon={<TrendingUp size={15} />}>
            Journal
          </NavLink>
          <NavLink active={tab === 'course'} onClick={() => setTabPersist('course')} icon={<BookOpen size={15} />}>
            Course
          </NavLink>
        </nav>

        <div className="p-3 border-t border-white/5">
          <UserPanel email={user.email} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0a0b0f]/95 backdrop-blur border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp size={14} className="text-emerald-400" />
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-neutral-400 font-medium">
              {tab === 'journal' ? 'Journal' : 'Course'}
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile bottom tab strip — always visible, instant switch */}
        <div className="grid grid-cols-2 border-t border-white/5">
          <MobileTab active={tab === 'journal'} onClick={() => setTabPersist('journal')} icon={<TrendingUp size={14} />}>
            Journal
          </MobileTab>
          <MobileTab active={tab === 'course'} onClick={() => setTabPersist('course')} icon={<BookOpen size={14} />}>
            Course
          </MobileTab>
        </div>
      </div>

      {/* Mobile slide-out drawer (account menu) */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0d0e13] border-l border-white/10 anim-slide-in flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Account</div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/5 text-neutral-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-3 flex-1">
              <UserPanel email={user.email} />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-56 min-h-screen">
        {tab === 'journal' && <Journal user={user} />}
        {tab === 'course' && <Course user={user} />}
      </main>
    </div>
  );
}

// ===== Nav primitives =====
function NavLink({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
        active
          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] border border-transparent',
      ].join(' ')}
    >
      <span className={active ? 'text-emerald-400' : 'text-neutral-500'}>{icon}</span>
      <span className="font-medium">{children}</span>
    </button>
  );
}

function MobileTab({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors',
        active ? 'text-emerald-400 bg-emerald-500/[0.06]' : 'text-neutral-500 hover:text-neutral-300',
      ].join(' ')}
    >
      <span>{icon}</span>
      {children}
    </button>
  );
}

function UserPanel({ email }) {
  const initial = (email || '?').charAt(0).toUpperCase();
  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-medium text-neutral-300 shrink-0">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">Signed in</div>
          <div className="text-xs text-neutral-200 truncate">{email}</div>
        </div>
      </div>
      <button
        onClick={signOut}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03] transition-colors"
      >
        <LogOut size={13} /> Sign out
      </button>
    </div>
  );
}

// ===== Global font styles (loaded once at top of app) =====
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      :root { color-scheme: dark; }
      .font-sans { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }
      .font-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
      .font-display { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
      .tabular-nums { font-variant-numeric: tabular-nums; }
      input[type=number]::-webkit-outer-spin-button,
      input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }
      .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
      .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 999px; }
      @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .anim-slide-up { animation: slideUp 220ms cubic-bezier(0.2, 0.8, 0.2, 1); }
      @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      .anim-slide-in { animation: slideIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1); }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      .anim-fade { animation: fadeIn 160ms ease-out; }
    `}</style>
  );
}
