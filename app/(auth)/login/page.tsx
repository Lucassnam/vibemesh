'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const inputStyle = {
  background: 'var(--bg-0)',
  border: '1px solid var(--border-2)',
  borderRadius: '8px',
  padding: '9px 12px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  color: 'var(--text-tertiary)',
  marginBottom: '6px',
  fontWeight: 510 as const,
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-0)' }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-10"
        style={{ textDecoration: 'none' }}
      >
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
            color: '#fff',
            fontWeight: 800,
          }}
        >
          BP
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)', fontWeight: 590, letterSpacing: '-0.015em' }}
        >
          Blueprint
        </span>
      </Link>

      <div
        className="w-full max-w-[360px] rounded-16 p-7"
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border-1)',
          boxShadow: '0px 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        <div className="mb-6">
          <h1
            className="text-lg font-heading"
            style={{
              color: 'var(--text-primary)',
              fontWeight: 680,
              letterSpacing: '-0.02em',
            }}
          >
            Sign in
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Welcome back to Blueprint
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" style={{ ...labelStyle, marginBottom: 0 }}>
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-8 text-xs"
              style={{
                background: 'rgba(255,107,107,0.07)',
                border: '1px solid rgba(255,107,107,0.15)',
                color: '#ff6b6b',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 4v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
              </svg>
              <span data-testid="auth-error">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-8 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40 mt-1"
            style={{
              background: 'var(--neon-green)',
              color: 'var(--bg-0)',
              fontWeight: 590,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '-0.01em',
              border: 'none',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div
          className="mt-5 pt-5 text-center text-xs"
          style={{
            borderTop: '1px solid var(--border-1)',
            color: 'var(--text-muted)',
          }}
        >
          New here?{' '}
          <Link
            href="/signup"
            className="transition-colors hover:text-white"
            style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
