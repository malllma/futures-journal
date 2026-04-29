import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const submit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) return setError('Email is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        if (!data.session) {
          setInfo(
            'Account created. Check your email for a confirmation link, then come back and sign in.'
          );
          setMode('signin');
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (e2) {
      setError(e2?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-neutral-200 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-emerald-500/30 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
            Futures Journal
          </div>
          <div className="font-display text-lg mt-0.5">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-xl border border-white/5 bg-[#0d0e13] p-5 space-y-4"
        >
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 font-semibold mb-1">
              Email
            </div>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
            />
          </label>

          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 font-semibold mb-1">
              Password
            </div>
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#0a0b0f] border border-white/10 rounded-md px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-700 focus:border-emerald-500/50 focus:outline-none"
            />
          </label>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          {info && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-md">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-md bg-emerald-500 text-black font-medium text-sm hover:bg-emerald-400 disabled:opacity-50"
          >
            {busy ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="text-center mt-4 text-xs text-neutral-500">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setInfo(null);
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div className="text-center mt-6 text-[10px] text-neutral-600">
          Your trades are private and tied to your account.
        </div>
      </div>
    </div>
  );
}
