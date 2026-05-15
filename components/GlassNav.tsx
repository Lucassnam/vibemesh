'use client';
import Link from 'next/link';
import Image from 'next/image';
import LiquidGlassButton from '@/components/LiquidGlassButton';

const INTER = "'Inter Variable', -apple-system, BlinkMacSystemFont, sans-serif";

export default function GlassNav() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backdropFilter: 'blur(28px) saturate(170%) brightness(1.02)',
        WebkitBackdropFilter: 'blur(28px) saturate(170%) brightness(1.02)',
        background: 'rgba(255,255,255,0.055)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingLeft: 'max(7.22vw, 60px)',
          paddingRight: 'max(7.22vw, 60px)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0, marginRight: 20 }}
        >
          <Image
            src="/transperantlogo.png"
            alt="Blueprint"
            width={34}
            height={34}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#F5F0E8', letterSpacing: '-0.03em', fontFamily: INTER }}>
            Blueprint
          </span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 104px)', gap: 2, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {(['Discover', 'Trending', 'Upload'] as const).map((label, i) => (
            <Link
              key={label}
              href={i === 0 ? '/discover' : i === 1 ? '/discover?sort=trending' : '/upload'}
              style={{
                fontSize: '1rem',
                fontWeight: 450,
                color: 'rgba(245,240,232,0.75)',
                textDecoration: 'none',
                padding: '6px 10px',
                borderRadius: 8,
                fontFamily: INTER,
                letterSpacing: '-0.01em',
                textAlign: 'center',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link
            href="/login"
            style={{
              fontSize: '1rem', fontWeight: 500, color: 'rgba(245,240,232,0.65)',
              textDecoration: 'none', padding: '6px 14px', letterSpacing: '-0.01em', fontFamily: INTER,
            }}
          >
            Sign in
          </Link>
          <LiquidGlassButton
            href="/discover"
            padding="8px 18px"
            textStyle={{ fontFamily: INTER, fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.015em', color: '#F5F0E8', whiteSpace: 'nowrap' }}
          >
            Browse free apps
          </LiquidGlassButton>
        </div>
      </div>
    </header>
  );
}
