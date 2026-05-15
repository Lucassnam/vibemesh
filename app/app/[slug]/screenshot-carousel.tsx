'use client';

import { useState } from 'react';

interface Props {
  screenshots: string[];
  title: string;
}

export default function ScreenshotCarousel({ screenshots, title }: Props) {
  const [idx, setIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  if (screenshots.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + screenshots.length) % screenshots.length);
  const next = () => setIdx((i) => (i + 1) % screenshots.length);

  return (
    <div className="relative rounded-12 overflow-hidden" style={{ border: '1px solid var(--border-1)' }}>
      {/* Image */}
      <div style={{ aspectRatio: '16/9', background: 'var(--bg-2)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[idx]}
          alt={`${title} screenshot ${idx + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
          key={idx}
          onError={() => setImgError(true)}
          onLoad={() => setImgError(false)}
          style={{ display: imgError ? 'none' : 'block' }}
        />
        {imgError && (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--bg-2)' }}
          >
            <p style={{ color: 'var(--text-muted)' }}>Image failed to load</p>
          </div>
        )}
      </div>

      {/* Nav arrows — only show if more than 1 screenshot */}
      {screenshots.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous screenshot"
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-105"
            style={{
              background: 'rgba(8,9,10,0.7)',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            onClick={next}
            aria-label="Next screenshot"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-105"
            style={{
              background: 'rgba(8,9,10,0.7)',
              border: '1px solid var(--border-2)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {screenshots.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Screenshot ${i + 1}`}
                className="transition-all duration-200"
                style={{
                  width: i === idx ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === idx ? 'var(--neon-green)' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div
            className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-6"
            style={{
              background: 'rgba(8,9,10,0.65)',
              color: 'var(--text-secondary)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-1)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {idx + 1} / {screenshots.length}
          </div>
        </>
      )}
    </div>
  );
}
