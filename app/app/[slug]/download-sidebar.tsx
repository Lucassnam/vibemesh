'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { AppVersion } from '@/types';

interface Props {
  appId: string;
  isActive: boolean;
  versions: Pick<AppVersion, 'id' | 'version_number' | 'scan_status' | 'changelog' | 'created_at'>[];
  currentVersionId: string | null;
  remixHref: string | null;
  isCreator: boolean;
  appSlug: string;
}

export default function DownloadSidebar({
  appId,
  isActive,
  versions,
  currentVersionId,
  remixHref,
  isCreator,
  appSlug,
}: Props) {
  const cleanVersions = versions.filter((v) => v.scan_status === 'clean');
  const [selectedVersionId, setSelectedVersionId] = useState(currentVersionId ?? cleanVersions[0]?.id ?? '');

  const isNonCurrentVersion = selectedVersionId && selectedVersionId !== currentVersionId;
  const downloadHref = isNonCurrentVersion
    ? `/api/download/${appId}?v=${selectedVersionId}`
    : `/api/download/${appId}`;

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg-0)',
    border: '1px solid var(--border-2)',
    borderRadius: 8,
    padding: '7px 10px',
    color: 'var(--text-primary)',
    fontSize: 12,
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 3.5L5 6.5L8 3.5' stroke='%2362666d' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 28,
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Version selector */}
      {cleanVersions.length > 1 && (
        <div>
          <label
            className="block text-[10px] uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-muted)', fontWeight: 590 }}
          >
            Version
          </label>
          <div className="relative">
            <select
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              style={selectStyle}
            >
              {cleanVersions.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.version_number}{v.id === currentVersionId ? ' (latest)' : ''}
                </option>
              ))}
            </select>
          </div>
          {isNonCurrentVersion && (
            <p className="text-[10px] mt-1" style={{ color: '#fac800' }}>
              You&apos;re downloading an older version
            </p>
          )}
        </div>
      )}

      {/* Download button */}
      <div
        className="rounded-12 p-4"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
      >
        {isActive ? (
          <>
            <a
              href={downloadHref}
              data-testid="download-btn"
              download
              className="flex items-center justify-center gap-2 w-full py-3 rounded-8 text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{
                background: 'var(--neon-green)',
                color: 'var(--bg-0)',
                textDecoration: 'none',
                fontWeight: 680,
                letterSpacing: '-0.01em',
                boxShadow: '0 0 24px rgba(0,255,135,0.2)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5v8M4 7L7 10l3-3M1.5 12h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download blueprint
            </a>
            <p className="text-[11px] text-center mt-2" style={{ color: 'var(--text-muted)' }}>
              Scanned &amp; verified clean
            </p>
          </>
        ) : (
          <div
            className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-8"
            style={{
              background: 'rgba(250, 200, 0, 0.07)',
              border: '1px solid rgba(250, 200, 0, 0.15)',
              color: '#fac800',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L1 10h10L6 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M6 5v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <circle cx="6" cy="9" r="0.5" fill="currentColor" />
            </svg>
            Pending review — not available yet
          </div>
        )}
      </div>

      {/* Remix button */}
      {remixHref && (
        <Link
          href={remixHref}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-8 text-sm transition-all hover:opacity-80"
          style={{
            border: '1px solid rgba(155, 92, 255, 0.35)',
            color: 'var(--purple)',
            background: 'rgba(155, 92, 255, 0.07)',
            textDecoration: 'none',
            fontWeight: 510,
            letterSpacing: '-0.01em',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M11 3.5L8 1v1.5C5 2.5 2 4.5 2 8c.8-2 2.5-3 6-3V6.5L11 3.5Z" fill="currentColor" />
          </svg>
          Remix This
        </Link>
      )}

      {/* Creator: update blueprint link */}
      {isCreator && (
        <Link
          href={`/upload?update_app_id=${appId}`}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-8 text-xs transition-opacity hover:opacity-70"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border-1)',
            textDecoration: 'none',
            fontWeight: 480,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Upload new version
        </Link>
      )}
    </div>
  );
}
