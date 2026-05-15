'use client';
import Link from 'next/link';
import Image from 'next/image';

const EXPLORE_NAV = [
  {
    href: '/discover',
    label: 'Discover',
    icon: (
      <svg width="17" height="17" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.55" />
        <path d="M9 5L7 9L5 5L9 5Z" fill="currentColor" opacity="0.85" />
      </svg>
    ),
  },
  {
    href: '/discover?sort=trending',
    label: 'Trending',
    icon: (
      <svg width="17" height="17" viewBox="0 0 14 14" fill="none">
        <path d="M2 10L5.5 6L8 8.5L12 3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 3H12V5.5" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/discover?sort=new',
    label: 'New',
    icon: (
      <svg width="17" height="17" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
      </svg>
    ),
  },
];

const TYPE_CATEGORIES = [
  { label: 'Dashboard', tag: 'dashboard', color: '#3B82F6' },
  { label: 'Tool / Utility', tag: 'tool', color: '#8B5CF6' },
  { label: 'Game', tag: 'game', color: '#EF4444' },
  { label: 'Website Design', tag: 'design', color: '#F59E0B' },
  { label: 'E-Commerce', tag: 'e-commerce', color: '#10B981' },
  { label: 'API', tag: 'api', color: '#6366F1' },
  { label: 'CLI', tag: 'cli', color: '#C792EA' },
];

const LANG_CATEGORIES = [
  { label: 'React', tag: 'react', color: '#61DAFB' },
  { label: 'Vue', tag: 'vue', color: '#42B883' },
  { label: 'Next.js', tag: 'next.js', color: '#E8ECF5' },
  { label: 'Svelte', tag: 'svelte', color: '#FF3E00' },
];

export default function CollapsibleSidebar() {
  return (
    <aside
      className="hover-sidebar"
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        background: 'var(--bg-0)',
        borderRight: '1px solid var(--border-1)',
        display: 'flex', flexDirection: 'column',
        zIndex: 70,
        overflow: 'hidden',
      }}
    >
      {/* Logo row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '13px 12px',
        justifyContent: 'space-between',
        gap: 8, flexShrink: 0,
        borderBottom: '1px solid var(--border-1)',
        minHeight: 50,
      }}>
        <Link
          href="/"
          title="Blueprint"
          className="hover-sidebar-logo-collapsed"
          style={{ position: 'absolute', left: 0, top: 0, width: 59, height: 50, alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
        >
          <Image
            src="/transperantlogo.png"
            alt="Blueprint"
            width={28}
            height={28}
            style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
          />
        </Link>

        <div className="hover-sidebar-expanded-only" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flex: 1, minWidth: 0 }}>
            <Image
              src="/transperantlogo.png"
              alt="Blueprint"
              width={22}
              height={22}
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', flexShrink: 0 }}
            />
            <span style={{
              fontSize: '0.9375rem', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.025em',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}>
              Blueprint
            </span>
          </Link>
          <span aria-hidden="true" style={{ flexShrink: 0, color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L9 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Nav content */}
      <div className="hover-sidebar-expanded-only" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>

        {/* Explore label */}
        <div style={{
          fontSize: 10, fontWeight: 650, letterSpacing: '0.09em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          padding: '10px 8px 5px',
        }}>
          Explore
        </div>

        {EXPLORE_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar-nav-link"
            style={{
              display: 'flex', alignItems: 'center',
              gap: 10,
              padding: '8px 9px',
              justifyContent: 'flex-start',
              borderRadius: 8, textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.9375rem', fontWeight: 470,
              whiteSpace: 'nowrap',
              transition: 'background 0.12s ease, color 0.12s ease',
              letterSpacing: '-0.012em',
            }}
          >
            <span style={{ flexShrink: 0, color: 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
            <span style={{ letterSpacing: '-0.01em' }}>{item.label}</span>
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--border-1)', margin: '10px 2px' }} />
        <div style={{
          fontSize: 10, fontWeight: 650, letterSpacing: '0.09em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          padding: '4px 8px 5px',
        }}>
          Browse by Type
        </div>
        {TYPE_CATEGORIES.map(({ label, tag, color }) => (
          <Link
            key={tag}
            href={`/discover?tag=${tag}`}
            className="sidebar-tag"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 9px', borderRadius: 7, textDecoration: 'none',
              color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 420,
              border: '1px solid transparent',
              '--tag-color': color,
              transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
            } as React.CSSProperties}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: color, opacity: 0.85,
              boxShadow: `0 0 5px ${color}`,
            }} />
            <span>{label}</span>
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--border-1)', margin: '10px 2px' }} />
        <div style={{
          fontSize: 10, fontWeight: 650, letterSpacing: '0.09em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          padding: '4px 8px 5px',
        }}>
          By Language
        </div>
        {LANG_CATEGORIES.map(({ label, tag, color }) => (
          <Link
            key={tag}
            href={`/discover?tag=${tag}`}
            className="sidebar-tag"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '5px 8px', borderRadius: 7, textDecoration: 'none',
              color: 'var(--text-tertiary)', fontSize: '0.8125rem',
              border: '1px solid transparent',
              '--tag-color': color,
            } as React.CSSProperties}
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: color, opacity: 0.85,
              boxShadow: `0 0 5px ${color}`,
            }} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Bottom */}
      <div className="hover-sidebar-expanded-only" style={{ flexShrink: 0, padding: '10px 10px' }}>
        <div style={{ height: 1, background: 'var(--border-1)', marginBottom: 10 }} />
          <Link
            href="/upload"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              background: 'rgba(59,130,246,0.1)', color: '#60A5FA',
              border: '1px solid rgba(59,130,246,0.2)',
              fontSize: '0.875rem', fontWeight: 510,
              transition: 'opacity 0.12s ease',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Upload blueprint
          </Link>
      </div>
    </aside>
  );
}
