'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* ── Search ─────────────────────────────────────────────────────── */
export function SearchInput() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const p = new URLSearchParams(params.toString());
      if (v.trim()) { p.set('q', v.trim()); } else { p.delete('q'); }
      router.push(`/discover?${p.toString()}`);
    }, 300);
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}>
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search blueprints…"
        style={{
          width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
          borderRadius: 10, fontSize: '0.9375rem', outline: 'none',
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
          color: '#0F1B2D', fontFamily: 'inherit',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      />
    </div>
  );
}

/* ── Sort dropdown ───────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'top', label: 'Most Downloaded' },
  { value: 'trending', label: 'Most Remixed' },
];

export function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const sort = params.get('sort') ?? 'new';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = SORT_OPTIONS.find(o => o.value === sort) ?? SORT_OPTIONS[0];

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function select(value: string) {
    const p = new URLSearchParams(params.toString());
    p.set('sort', value);
    router.push(`/discover?${p.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 13px', borderRadius: 9, cursor: 'pointer',
          background: '#eae9e3', border: '1px solid rgba(0,0,0,0.1)',
          color: '#3A4A62', fontSize: '0.8125rem', fontWeight: 560,
          fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {current.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.45, marginLeft: 2 }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0,
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 11, boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          minWidth: 190, zIndex: 50, overflow: 'hidden', padding: '4px 0',
        }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                width: '100%', padding: '9px 14px',
                background: sort === opt.value ? 'rgba(43,78,150,0.07)' : 'transparent',
                color: sort === opt.value ? '#2B4E96' : '#374151',
                fontSize: '0.875rem', fontWeight: sort === opt.value ? 620 : 400,
                border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
            >
              {sort === opt.value
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                : <span style={{ width: 10, display: 'inline-block' }} />
              }
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Filter button ───────────────────────────────────────────────── */
const FILTER_GROUPS = [
  {
    section: 'Type',
    items: [
      { label: 'Dashboard', tag: 'dashboard' },
      { label: 'Tool / Utility', tag: 'tool' },
      { label: 'Game', tag: 'game' },
      { label: 'Website Design', tag: 'design' },
      { label: 'E-Commerce', tag: 'e-commerce' },
      { label: 'API', tag: 'api' },
      { label: 'CLI', tag: 'cli' },
    ],
  },
  {
    section: 'Language',
    items: [
      { label: 'React', tag: 'react' },
      { label: 'Vue', tag: 'vue' },
      { label: 'Next.js', tag: 'next.js' },
      { label: 'Svelte', tag: 'svelte' },
    ],
  },
];

export function FilterButton() {
  const router = useRouter();
  const params = useSearchParams();
  const tag = params.get('tag') ?? '';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function selectTag(value: string) {
    const p = new URLSearchParams(params.toString());
    if (value === '' || value === tag) { p.delete('tag'); } else { p.set('tag', value); }
    router.push(`/discover?${p.toString()}`);
    setOpen(false);
  }

  const hasFilter = !!tag;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 13px', borderRadius: 9, cursor: 'pointer',
          background: hasFilter ? 'rgba(43,78,150,0.09)' : '#eae9e3',
          border: hasFilter ? '1px solid rgba(43,78,150,0.28)' : '1px solid rgba(0,0,0,0.1)',
          color: hasFilter ? '#2B4E96' : '#3A4A62',
          fontSize: '0.8125rem', fontWeight: 560, fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 3h9M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {hasFilter ? tag : 'Filter'}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.45, marginLeft: 2 }}>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 5px)', left: 0,
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 12, boxShadow: '0 6px 28px rgba(0,0,0,0.12)',
          minWidth: 220, zIndex: 50, padding: '6px 0',
        }}>
          <button
            onClick={() => selectTag('')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 14px',
              background: !tag ? 'rgba(43,78,150,0.07)' : 'transparent',
              color: !tag ? '#2B4E96' : '#374151',
              fontSize: '0.875rem', fontWeight: !tag ? 620 : 400,
              border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
            }}
          >
            All blueprints
            {!tag && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </button>

          {FILTER_GROUPS.map(({ section, items }) => (
            <div key={section}>
              <div style={{
                padding: '8px 14px 3px',
                fontSize: '0.6875rem', fontWeight: 650, color: '#9CA3AF',
                letterSpacing: '0.07em', textTransform: 'uppercase',
              }}>
                {section}
              </div>
              {items.map(item => (
                <button
                  key={item.tag}
                  onClick={() => selectTag(item.tag)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '7px 14px',
                    background: tag === item.tag ? 'rgba(43,78,150,0.07)' : 'transparent',
                    color: tag === item.tag ? '#2B4E96' : '#374151',
                    fontSize: '0.875rem', fontWeight: tag === item.tag ? 620 : 400,
                    border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}
                >
                  {item.label}
                  {tag === item.tag && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l3 3 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
