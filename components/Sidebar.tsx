import Link from 'next/link';

const NAV_ITEMS = [
  {
    href: '/discover',
    label: 'Discover',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 5L7 9L5 5L9 5Z" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
  {
    href: '/discover?sort=trending',
    label: 'Trending',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M2 10L5.5 6L8 8.5L12 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.5 3H12V5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/discover?sort=new',
    label: 'New',
    icon: (
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

const POPULAR_TAGS = [
  'react',
  'dashboard',
  'tool',
  'game',
  'utility',
  'api',
  'cli',
  'design',
];

const TAG_COLORS: Record<string, string> = {
  react: '#61dafb',
  dashboard: 'var(--electric-blue)',
  tool: 'var(--neon-green)',
  game: '#ff6b6b',
  utility: '#ffd93d',
  api: 'var(--purple)',
  cli: '#c792ea',
  design: '#f78c6c',
};

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 px-3 py-2 rounded-8 text-sm transition-colors sidebar-nav-link"
      style={{
        color: 'var(--text-tertiary)',
        textDecoration: 'none',
        fontWeight: 400,
      }}
    >
      <span
        className="flex-shrink-0 transition-colors group-hover:text-white"
        style={{ color: 'var(--text-muted)' }}
      >
        {icon}
      </span>
      <span
        className="transition-colors group-hover:text-white"
        style={{ letterSpacing: '-0.01em' }}
      >
        {label}
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--text-muted)', fontWeight: 590 }}
    >
      {children}
    </div>
  );
}

export default function Sidebar() {
  return (
    <nav className="app-shell-sidebar">
      <SectionLabel>Explore</SectionLabel>
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} />
      ))}

      <div className="mx-3 my-3" style={{ height: '1px', background: 'var(--border-1)' }} />

      <SectionLabel>Browse by tag</SectionLabel>
      {POPULAR_TAGS.map((tag) => {
        const color = TAG_COLORS[tag] ?? 'var(--purple)';
        return (
          <Link
            key={tag}
            href={`/discover?tag=${tag}`}
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-8 text-sm sidebar-tag"
            style={{
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              border: `1px solid transparent`,
              '--tag-color': color,
            } as React.CSSProperties}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-125"
              style={{
                background: color,
                opacity: 0.75,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
            <span className="transition-colors group-hover:text-white">{tag}</span>
          </Link>
        );
      })}

      {/* Bottom CTA */}
      <div className="mt-auto pt-6">
        <div className="mx-1 mb-4" style={{ height: '1px', background: 'var(--border-1)' }} />
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-8 text-sm transition-all hover:opacity-80"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#60A5FA',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textDecoration: 'none',
            fontWeight: 510,
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Upload blueprint
        </Link>
      </div>
    </nav>
  );
}
