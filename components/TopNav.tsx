import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { User } from '@supabase/supabase-js';
import SignoutButton from './SignoutButton';
import TopNavSearch from './TopNavSearch';

export default function TopNav({ user }: { user: User | null }) {
  const initial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header
      className="fixed top-0 left-0 right-0 flex items-center gap-3 px-5"
      style={{
        height: 'var(--header-height)',
        background: 'rgba(9, 13, 28, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-1)',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 flex-shrink-0 mr-1"
        style={{ textDecoration: 'none' }}
      >
        <Image
          src="/transperantlogo.png"
          alt="Blueprint"
          width={26}
          height={26}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', flexShrink: 0 }}
        />
        <span
          className="text-sm hidden sm:block"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
          }}
        >
          Blueprint
        </span>
      </Link>

      {/* Search bar */}
      <Suspense fallback={<div className="flex-1 max-w-[440px]" />}>
        <TopNavSearch />
      </Suspense>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/upload"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-8 text-xs transition-opacity hover:opacity-80"
          style={{
            background: '#3B82F6',
            color: '#ffffff',
            fontWeight: 590,
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Upload
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <Link
              href="/profile"
              title={user.email}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold transition-opacity hover:opacity-80 flex-shrink-0"
              style={{
                background: 'var(--electric-blue)',
                color: 'var(--bg-0)',
                textDecoration: 'none',
                fontWeight: 680,
              }}
            >
              {initial}
            </Link>
            <SignoutButton />
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-8 text-xs transition-colors hover:border-opacity-60"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-2)',
              textDecoration: 'none',
              fontWeight: 400,
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
