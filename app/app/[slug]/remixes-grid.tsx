'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface RemixApp {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  preview_url: string | null;
  screenshots: string[];
  download_count: number;
  remix_count: number;
  tags: string[] | null;
}

interface Props {
  appId: string;
}

export default function RemixesGrid({ appId }: Props) {
  const [remixes, setRemixes] = useState<RemixApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('apps')
      .select('id, slug, title, tagline, preview_url, screenshots, download_count, remix_count, tags')
      .eq('parent_id', appId)
      .eq('status', 'active')
      .eq('scan_status', 'clean')
      .order('created_at', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setRemixes(data ?? []);
        setLoading(false);
      });
  }, [appId]);

  if (!loading && remixes.length === 0) return null;

  return (
    <section className="mt-12">
      <h2
        className="text-base font-heading mb-5"
        style={{
          color: 'var(--text-primary)',
          fontWeight: 660,
          letterSpacing: '-0.02em',
        }}
      >
        <span style={{ color: 'var(--purple)' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}
          >
            <path d="M12 4L8.5 1v2C5 3 2 5.5 2 9.5c1-2.5 3.5-4 6.5-4V7.5L12 4Z" fill="currentColor" />
          </svg>
        </span>
        Remixes{remixes.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}> · {remixes.length}</span>}
      </h2>

      {loading ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-12 animate-pulse"
              style={{ aspectRatio: '4/3', background: 'var(--bg-2)' }}
            />
          ))}
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {remixes.map((remix) => {
            const thumb = remix.screenshots?.[0] ?? remix.preview_url;
            const initial = remix.title[0]?.toUpperCase() ?? '?';
            return (
              <Link
                key={remix.id}
                href={`/app/${remix.slug}`}
                className="group block rounded-12 overflow-hidden card-lift"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid var(--border-1)',
                  textDecoration: 'none',
                }}
              >
                <div style={{ aspectRatio: '16/9', background: 'var(--bg-2)' }}>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={remix.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(145deg, var(--bg-2) 0%, var(--bg-3) 100%)' }}
                    >
                      <span style={{ fontSize: 32, color: 'var(--border-3)', fontWeight: 700 }}>
                        {initial}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: 'var(--text-primary)', fontWeight: 510, letterSpacing: '-0.01em' }}
                  >
                    {remix.title}
                  </div>
                  {remix.tagline && (
                    <div
                      className="text-[11px] truncate mt-0.5"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {remix.tagline}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-3 mt-1.5 text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{remix.download_count.toLocaleString()} ↓</span>
                    <span style={{ color: 'var(--purple)' }}>{remix.remix_count} remixes</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
