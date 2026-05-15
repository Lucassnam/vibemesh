import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import ReportModal from './report-modal';
import ScreenshotCarousel from './screenshot-carousel';
import CommentsSection from './comments-section';
import RemixesGrid from './remixes-grid';
import VersionHistory from './version-history';
import DownloadSidebar from './download-sidebar';
import type { AppVersion } from '@/types';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: app } = await supabase
    .from('apps')
    .select(
      `id, slug, title, tagline, description, how_to_run, demo_url,
       tags, status, scan_status, download_count, remix_count,
       parent_id, root_id, creator_id, packages, preview_url, screenshots,
       current_version_id, created_at`,
    )
    .eq('slug', slug)
    .single();

  if (!app) notFound();

  // Fetch creator profile separately (RLS fix)
  const { data: creatorProfile } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .eq('id', app.creator_id)
    .maybeSingle();

  // Merge creator into app object
  const appWithCreator = {
    ...app,
    creator: creatorProfile,
  } as typeof app & { creator: typeof creatorProfile };

  const isActive = appWithCreator.status === 'active' && appWithCreator.scan_status === 'clean';
  const isCreator = user?.id === appWithCreator.creator_id;

  // Allow creators to view their own apps even if pending
  if (!isActive && !isCreator) notFound();

  // Fetch all versions for the dropdown and history table
  const { data: versions } = await supabase
    .from('app_versions')
    .select('id, version_number, changelog, scan_status, created_at, zip_path')
    .eq('app_id', appWithCreator.id)
    .order('version_number', { ascending: false });

  const safeVersions = (versions ?? []) as AppVersion[];

  // Fetch parent app slug if this is a remix
  let parentSlug: string | null = null;
  if (appWithCreator.parent_id) {
    const { data: parentApp } = await supabase
      .from('apps')
      .select('slug')
      .eq('id', appWithCreator.parent_id)
      .single();
    parentSlug = parentApp?.slug ?? null;
  }

  const packages: Record<string, string> = appWithCreator.packages ?? {};
  const pkgEntries = Object.entries(packages);

  // Build screenshot list — use screenshots array or fall back to preview_url
  const screenshots: string[] =
    Array.isArray(appWithCreator.screenshots) && appWithCreator.screenshots.length > 0
      ? appWithCreator.screenshots
      : appWithCreator.preview_url
      ? [appWithCreator.preview_url]
      : [];

  const creator = creatorProfile;
  const creatorName = creator?.display_name ?? creator?.username ?? 'Unknown';
  const creatorInitial = creatorName[0]?.toUpperCase() ?? '?';
  const remixHref = user ? `/app/${appWithCreator.slug}/remix` : null;

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-[1200px] mx-auto w-full">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          <Link
            href="/"
            className="transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Discover
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{appWithCreator.slug}</span>
        </nav>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ── LEFT: main content ── */}
          <div className="min-w-0 flex flex-col gap-6">

            {/* Screenshot carousel */}
            <ScreenshotCarousel screenshots={screenshots} title={appWithCreator.title} />

            {/* Title + identity */}
            <div>
              <h1
                data-testid="app-title"
                className="text-2xl font-heading leading-tight mb-1"
                style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.028em' }}
              >
                {appWithCreator.title}
              </h1>
              {app.tagline && (
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}
                >
                  {appWithCreator.tagline}
                </p>
              )}
              {parentSlug && (
                <p
                  className="text-xs mt-2 flex items-center gap-1"
                  style={{ color: 'var(--purple)' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M9 2.5L6.5 1v1.5C3.5 2.5 1 4.5 1 7.5c.8-2 2.5-3 5.5-3V6L9 2.5Z" fill="currentColor" />
                  </svg>
                  Remix of{' '}
                  <Link
                    href={`/app/${parentSlug}`}
                    style={{ color: 'var(--purple)', textDecoration: 'underline' }}
                  >
                    parent blueprint
                  </Link>
                </p>
              )}
            </div>

            {/* Description */}
            <section>
              <h2
                className="text-[10px] uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)', fontWeight: 590 }}
              >
                About
              </h2>
              <p
                data-testid="app-description"
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {appWithCreator.description}
              </p>
              {app.demo_url && (
                <a
                  href={appWithCreator.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs transition-opacity hover:opacity-80"
                  style={{ color: 'var(--electric-blue)', textDecoration: 'none', fontWeight: 510 }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 9L9 2M9 2H4.5M9 2v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  View live demo
                </a>
              )}
            </section>

            {/* How to run */}
            {app.how_to_run && (
              <section>
                <h2
                  className="text-[10px] uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)', fontWeight: 590 }}
                >
                  How to run
                </h2>
                <div
                  className="rounded-10 p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border-1)',
                    color: 'var(--text-secondary)',
                    fontSize: 12.5,
                  }}
                >
                  {appWithCreator.how_to_run}
                </div>
              </section>
            )}

            {/* Comments — lazy loaded client side */}
            <CommentsSection appId={appWithCreator.id} userId={user?.id ?? null} />
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div>
            <div
              className="flex flex-col gap-4"
              style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}
            >
              {/* Creator card */}
              <div
                className="rounded-12 p-4 flex items-center gap-3"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--electric-blue) 0%, #0075a8 100%)',
                    color: 'var(--bg-0)',
                    fontWeight: 700,
                  }}
                >
                  {creatorInitial}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--text-primary)', fontWeight: 510 }}
                  >
                    {creatorName}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {new Date(appWithCreator.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ReportModal appId={appWithCreator.id} userId={user?.id ?? null} />
                </div>
              </div>

              {/* Version dropdown + download + remix */}
              <DownloadSidebar
                appId={appWithCreator.id}
                isActive={isActive}
                versions={safeVersions}
                currentVersionId={appWithCreator.current_version_id}
                remixHref={remixHref}
                isCreator={isCreator}
                appSlug={appWithCreator.slug}
              />

              {/* Tags */}
              {appWithCreator.tags && appWithCreator.tags.length > 0 && (
                <div
                  className="rounded-12 p-4"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
                >
                  <h3
                    className="text-[10px] uppercase tracking-widest mb-3"
                    style={{ color: 'var(--text-muted)', fontWeight: 590 }}
                  >
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {appWithCreator.tags.map((tag: string) => (
                      <Link
                        key={tag}
                        href={`/?tag=${tag}`}
                        data-testid="tag"
                        className="text-xs px-2.5 py-1 rounded-6 transition-opacity hover:opacity-80"
                        style={{
                          background: 'rgba(155, 92, 255, 0.1)',
                          color: 'var(--purple)',
                          border: '1px solid rgba(155, 92, 255, 0.15)',
                          textDecoration: 'none',
                        }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech stack / packages */}
              <div
                data-testid="deps"
                className="rounded-12 p-4"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
              >
                <h3
                  className="text-[10px] uppercase tracking-widest mb-3 font-mono"
                  style={{ color: 'var(--text-muted)', fontWeight: 590 }}
                >
                  Packages
                </h3>
                {pkgEntries.length === 0 ? (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    No packages listed
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {pkgEntries.slice(0, 12).map(([name, version]) => (
                      <li key={name} className="flex items-center justify-between gap-2 text-xs font-mono">
                        <span className="truncate" style={{ color: 'var(--electric-blue)' }}>{name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ color: 'var(--text-muted)', background: 'var(--bg-2)', fontSize: 10 }}
                        >
                          {version}
                        </span>
                      </li>
                    ))}
                    {pkgEntries.length > 12 && (
                      <li className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        +{pkgEntries.length - 12} more
                      </li>
                    )}
                  </ul>
                )}
              </div>

              {/* Stats */}
              <div
                className="rounded-12 p-4 grid grid-cols-2 gap-3"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
              >
                <div>
                  <div
                    className="text-lg font-heading"
                    style={{ color: 'var(--text-primary)', fontWeight: 680, letterSpacing: '-0.02em' }}
                  >
                    {appWithCreator.download_count.toLocaleString()}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    downloads
                  </div>
                </div>
                <div>
                  <div
                    className="text-lg font-heading"
                    style={{ color: 'var(--purple)', fontWeight: 680, letterSpacing: '-0.02em' }}
                  >
                    {appWithCreator.remix_count.toLocaleString()}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    remixes
                  </div>
                </div>
              </div>

              {/* Remix tree link */}
              <Link
                href={`/app/${appWithCreator.slug}/tree`}
                className="flex items-center gap-1.5 text-xs transition-colors hover:text-white justify-center py-2"
                style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="2" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="2" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="10" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 3.5v2L2 8M6 5.5l4 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                View remix tree
              </Link>
            </div>
          </div>
        </div>

        {/* ── Below the fold ─────────────────────────────────────────────── */}

        {/* Remixes grid — client loaded */}
        <RemixesGrid appId={app.id} />

        {/* Version history table */}
        <VersionHistory versions={safeVersions} appId={app.id} />
      </div>
    </AppShell>
  );
}
