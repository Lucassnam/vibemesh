import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import { SearchInput, FilterButton, SortDropdown } from '../feed-controls';

export const revalidate = 30;

const BLUE = '#4272C4';
const BLUE_DARK = '#2B4E96';
const NAVY = '#0F1B2D';
const MUTED = '#6B7280';
const PAGE_BG = '#f5f4f0';
const CARD_BG = '#ffffff';
const CARD_BORDER = 'rgba(0,0,0,0.07)';
const CARD_SHADOW = '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)';

interface App {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  download_count: number;
  remix_count: number;
  preview_url: string | null;
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span style={{
      fontSize: '0.6875rem', padding: '3px 8px', borderRadius: 5, fontWeight: 480,
      background: 'rgba(37,99,235,0.07)', color: BLUE,
      border: '1px solid rgba(37,99,235,0.12)',
    }}>
      {tag}
    </span>
  );
}

function AppCard({ app }: { app: App }) {
  const initial = app.title[0]?.toUpperCase() ?? '?';

  return (
    <Link
      href={`/app/${app.slug}`}
      data-testid="feed-card"
      data-slug={app.slug}
      className="discover-card"
      style={{
        display: 'block', borderRadius: 16, overflow: 'hidden',
        background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
        boxShadow: CARD_SHADOW, textDecoration: 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio: '16/10', background: '#eeecea', position: 'relative', overflow: 'hidden' }}>
        {app.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.preview_url} alt={app.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(145deg, #eeecea 0%, #e5e3de 100%)',
          }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#C9C7C1' }}>{initial}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="card-overlay"
          style={{
            position: 'absolute', inset: 0, opacity: 0,
            background: 'linear-gradient(to top, rgba(15,27,45,0.85) 0%, rgba(15,27,45,0.25) 55%, transparent 100%)',
            display: 'flex', alignItems: 'flex-end', padding: 12,
          }}
        >
          <span style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
            background: BLUE_DARK, color: '#fff',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v6M3 5.5L6 8l3-2.5M2 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </span>
        </div>

        {app.remix_count > 0 && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 510,
            background: 'rgba(37,99,235,0.14)', color: BLUE_DARK,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(37,99,235,0.22)',
          }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M9 2.5L6.5 1 6.5 2C3.5 2 1 4 1 7c.8-2 2.5-3 5.5-3v1L9 2.5Z" fill="currentColor" />
            </svg>
            {app.remix_count}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '11px 14px 13px' }}>
        <h2 style={{
          fontSize: '0.9375rem', fontWeight: 640, color: NAVY,
          letterSpacing: '-0.018em', lineHeight: 1.3, marginBottom: 4,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {app.title}
        </h2>

        {app.description && (
          <p style={{
            fontSize: '0.8125rem', color: MUTED, lineHeight: 1.5, marginBottom: 6,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {app.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: MUTED }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v6M3 5.5L6 8l3-2.5M2 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {app.download_count.toLocaleString()}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: MUTED }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M10 3L7.5 1v1.5C4.5 2.5 2 4.5 2 7.5c.8-2 2.5-3 5.5-3V6L10 3Z" fill="currentColor" opacity="0.7" />
            </svg>
            {app.remix_count.toLocaleString()}
          </span>
          {app.tags && app.tags.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
              {app.tags.slice(0, 2).map(t => <TagPill key={t} tag={t} />)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function FeaturedCard({ app }: { app: App }) {
  const initial = app.title[0]?.toUpperCase() ?? '?';

  return (
    <Link
      href={`/app/${app.slug}`}
      style={{
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr',
        borderRadius: 20, overflow: 'hidden',
        background: CARD_BG, border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.05)',
        textDecoration: 'none', marginBottom: 20,
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', minHeight: 300, background: '#e8eef8' }}>
        {app.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={app.preview_url} alt={app.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(145deg, #dbeafe 0%, #ede9fe 100%)',
          }}>
            <span style={{ fontSize: '7rem', fontWeight: 800, color: 'rgba(37,99,235,0.15)' }}>{initial}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '44px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 99, width: 'fit-content',
          background: 'rgba(37,99,235,0.08)', color: BLUE_DARK,
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          ★ Featured this week
        </div>

        <h2 style={{
          fontSize: '1.875rem', fontWeight: 760, color: NAVY,
          letterSpacing: '-0.035em', lineHeight: 1.12, marginBottom: 14,
        }}>
          {app.title}
        </h2>

        {app.description && (
          <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.65, marginBottom: 28 }}>
            {app.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: MUTED }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v6M3 5.5L6 8l3-2.5M2 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {app.download_count.toLocaleString()} downloads
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.875rem', color: MUTED }}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
              <path d="M10 3L7.5 1v1.5C4.5 2.5 2 4.5 2 7.5c.8-2 2.5-3 5.5-3V6L10 3Z" fill="currentColor" opacity="0.7" />
            </svg>
            {app.remix_count.toLocaleString()} remixes
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 22px', borderRadius: 9,
            background: BLUE_DARK, color: '#fff', fontSize: '0.875rem', fontWeight: 600,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v6M3 5.5L6 8l3-2.5M2 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download
          </span>
          {app.tags?.slice(0, 3).map(t => <TagPill key={t} tag={t} />)}
        </div>
      </div>
    </Link>
  );
}

interface PageProps {
  searchParams: Promise<{ sort?: string; tag?: string; q?: string }>;
}

export default async function DiscoverPage({ searchParams }: PageProps) {
  const { sort = 'new', tag, q } = await searchParams;
  const supabase = await createClient();

  const [{ data: featuredArr }, { data: { user } }] = await Promise.all([
    supabase
      .from('apps')
      .select('id, slug, title, description, tags, download_count, remix_count, preview_url')
      .eq('status', 'active')
      .eq('scan_status', 'clean')
      .order('download_count', { ascending: false })
      .limit(1),
    supabase.auth.getUser(),
  ]);

  const featured = featuredArr?.[0] ?? null;
  const showFeatured = featured !== null && !tag && !q?.trim();

  let query = supabase
    .from('apps')
    .select('id, slug, title, description, tags, download_count, remix_count, preview_url')
    .eq('status', 'active')
    .eq('scan_status', 'clean');

  if (showFeatured) query = query.neq('id', featured.id);
  if (tag && tag !== 'all') query = query.contains('tags', [tag]);
  if (q?.trim()) query = query.or(`title.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`);

  if (sort === 'top') {
    query = query.order('download_count', { ascending: false });
  } else if (sort === 'trending') {
    query = query.order('remix_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: apps } = await query.limit(48);
  const userInitial = user?.email?.[0]?.toUpperCase() ?? null;

  return (
    <AppShell>
      <div style={{
        background: PAGE_BG,
        backgroundImage: [
          'linear-gradient(rgba(37,99,235,0.038) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(37,99,235,0.038) 1px, transparent 1px)',
          'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(37,99,235,0.05) 0%, transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 5% 80%, rgba(59,130,246,0.04) 0%, transparent 60%)',
        ].join(', '),
        backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%',
        minHeight: '100vh',
      }}>

        {/* ── Inline top bar (replaces TopNav) ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 28px',
          borderBottom: '1px solid rgba(37,99,235,0.07)',
          background: 'rgba(245,244,240,0.65)',
          backdropFilter: 'blur(16px) saturate(150%)',
          WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: NAVY, letterSpacing: '-0.03em' }}>
            Blueprint
          </span>
          <div style={{ flex: 1 }} />
          <Link
            href="/upload"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              background: BLUE_DARK, color: '#fff',
              fontSize: '0.8125rem', fontWeight: 580,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Upload
          </Link>
          {userInitial ? (
            <Link href="/profile" style={{
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: BLUE_DARK, color: '#fff',
              fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
            }}>
              {userInitial}
            </Link>
          ) : (
            <Link href="/login" style={{
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              color: '#374151', fontSize: '0.8125rem', fontWeight: 480,
              border: '1px solid rgba(0,0,0,0.1)',
            }}>
              Sign in
            </Link>
          )}
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 28px 64px' }}>

          {/* Page title */}
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 780, color: NAVY,
            letterSpacing: '-0.03em', marginBottom: 6,
            fontFamily: "'Cabinet Grotesk', 'Inter Variable', sans-serif",
          }}>
            Discover Blueprints
          </h1>
          <p style={{
            fontSize: '0.9375rem', color: MUTED, marginBottom: 20, letterSpacing: '-0.01em',
          }}>
            AI-built apps. Free to download or remix with your favorite AI assistant.
          </p>

          {/* Search + Filter + Sort — all on one line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 360, flexShrink: 0 }}>
              <Suspense fallback={<div style={{ height: 38, background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)' }} />}>
                <SearchInput />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <FilterButton />
            </Suspense>
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
          </div>

          {/* Featured card */}
          {showFeatured && <FeaturedCard app={featured} />}

          {/* Grid */}
          <section
            data-testid="feed"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 18,
            }}
          >
            {apps?.map((app) => <AppCard key={app.id} app={app} />)}
            {!apps?.length && <EmptyState />}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eeecea', border: '1px solid rgba(0,0,0,0.07)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: MUTED }}>
          <path d="M12 3v12M6 9l6 6 6-6M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 280 }}>
        <p style={{ fontSize: 15, marginBottom: 6, color: NAVY, fontWeight: 560 }}>No blueprints yet</p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: MUTED }}>
          Be the first to share something.{' '}
          <Link href="/upload" style={{ color: BLUE_DARK, textDecoration: 'none', fontWeight: 500 }}>
            Upload a blueprint
          </Link>
        </p>
      </div>
    </div>
  );
}
