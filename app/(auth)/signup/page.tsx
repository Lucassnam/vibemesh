'use client';

import { useState } from 'react';
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

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get('email') as string;
    const password = form.get('password') as string;
    const username = form.get('username') as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'var(--bg-0)' }}
      >
        <div
          className="w-full max-w-[360px] rounded-16 p-8 text-center"
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border-1)',
          }}
        >
          <div
            className="w-12 h-12 rounded-16 flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(0, 255, 135, 0.08)',
              border: '1px solid rgba(0, 255, 135, 0.2)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--neon-green)' }}>
              <path d="M3 10l4.5 4.5L17 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1
            className="text-lg font-heading mb-2"
            style={{ color: 'var(--text-primary)', fontWeight: 680, letterSpacing: '-0.02em' }}
          >
            Check your email
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            We sent you a confirmation link. Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-xs transition-colors hover:text-white"
            style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
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
            Create account
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Join the Blueprint community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="yourhandle"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Min. 8 characters"
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div
          className="mt-5 pt-5 text-center text-xs"
          style={{
            borderTop: '1px solid var(--border-1)',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            className="transition-colors hover:text-white"
            style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
