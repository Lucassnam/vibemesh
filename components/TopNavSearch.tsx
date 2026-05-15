'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

export default function TopNavSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(v: string) {
    const p = new URLSearchParams();
    if (v.trim()) p.set('q', v.trim());
    router.push(`/discover${p.toString() ? `?${p}` : ''}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => commit(v), 350);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (timerRef.current) clearTimeout(timerRef.current);
      commit(value);
    }
  }

  return (
    <div className="flex-1 max-w-[440px]" style={{ position: 'relative' }}>
      <svg
        width="12" height="12" viewBox="0 0 14 14" fill="none"
        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.45, pointerEvents: 'none', flexShrink: 0, color: 'var(--text-muted)' }}
      >
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search blueprints…"
        style={{
          width: '100%',
          paddingLeft: 34, paddingRight: 40, paddingTop: 7, paddingBottom: 7,
          borderRadius: 9, fontSize: '0.875rem',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-1)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
      <kbd style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        fontSize: 10, padding: '2px 6px', borderRadius: 4, lineHeight: 1.4, pointerEvents: 'none',
        background: 'var(--bg-3)', color: 'var(--text-muted)', border: '1px solid var(--border-1)',
      }}>
        ⌘K
      </kbd>
    </div>
  );
}
