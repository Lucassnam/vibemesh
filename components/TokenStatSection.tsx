'use client';
import { useEffect, useRef, useState } from 'react';

const INTER = "'Inter Variable', -apple-system, BlinkMacSystemFont, sans-serif";
const SHADOW_CARD = [
  '0 0.175px 1px rgba(0,0,0,.013)',
  '0 0.8px 2.9px rgba(0,0,0,.015)',
  '0 2px 7.8px rgba(0,0,0,.027)',
  '0 4px 18px rgba(0,0,0,.04)',
].join(', ');
const BORDER = 'rgba(0,0,0,0.08)';
const HPAD = 'max(5vw, 48px)';
const SVPAD = 'clamp(64px, 6vw, 96px)';

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

function useCountUp(target: number, duration: number, triggered: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!triggered) return;
    let start: number | null = null;
    let rafId: number;
    rafId = requestAnimationFrame(function step(ts) {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      setValue(Math.round(easeOutQuart(pct) * target));
      if (pct < 1) rafId = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(rafId);
  }, [triggered, target, duration]);
  return value;
}

function fmtK(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function TokenStatSection() {
  const ref = useRef<HTMLElement>(null);
  const [triggered, setTriggered] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Mark done after animation completes so we can show the full range
  useEffect(() => {
    if (!triggered) return;
    const t = setTimeout(() => setDone(true), 2400);
    return () => clearTimeout(t);
  }, [triggered]);

  // Scratch counts to 150k in 2.2s, remix counts to 30k in 2.2s
  const scratchVal = useCountUp(150_000, 2200, triggered);
  const remixVal = useCountUp(30_000, 2200, triggered);

  const scratchDisplay = done ? '80k – 150k' : fmtK(scratchVal);
  const remixDisplay = done ? '15k – 30k' : fmtK(remixVal);

  // Bar widths: scratch = 100%, remix = 20% (15k vs 75k midpoint ratio)
  const scratchBarPct = triggered ? 100 : 0;
  const remixBarPct = triggered ? 20 : 0;

  return (
    <section
      ref={ref}
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        textAlign: 'center',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Eyebrow */}
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 24, fontFamily: INTER }}>
          The token savings are real
        </p>

        {/* Headline */}
        <h2 style={{ fontFamily: INTER, fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.375rem)', lineHeight: 1.08, color: '#0F1B2D', letterSpacing: '-0.04em', marginBottom: 64 }}>
          Remix an existing app for 5×<br />less than building from scratch.
        </h2>

        {/* Two cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0, maxWidth: 700, margin: '0 auto 40px', alignItems: 'start' }}>

          {/* Scratch */}
          <div
            className="landing-stat-card"
            style={{ padding: '28px 32px', borderRadius: '12px 0 0 12px', border: `1px solid ${BORDER}`, borderRight: 'none', background: '#f9f9f8', textAlign: 'center', boxShadow: SHADOW_CARD }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 16, fontFamily: INTER }}>
              Building from scratch
            </p>
            <p
              style={{
                fontFamily: INTER, fontWeight: 800, fontSize: '2.25rem', color: '#B91C1C',
                lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em',
                minWidth: 120, display: 'inline-block',
                transition: done ? 'none' : undefined,
              }}
            >
              {scratchDisplay}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontFamily: INTER, marginBottom: 16 }}>tokens</p>

            {/* Bar */}
            <div style={{ height: 4, background: '#F5F0E8', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: '#FCA5A5', borderRadius: 99,
                  width: `${scratchBarPct}%`,
                  transition: 'width 2.2s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>

            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: 14, lineHeight: 1.6, fontFamily: INTER }}>
              Starting from zero every time
            </p>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 0', position: 'relative', zIndex: 1 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%', background: '#fff',
                border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 14, color: '#9CA3AF', marginTop: 60,
                boxShadow: SHADOW_CARD,
              }}
            >
              →
            </div>
          </div>

          {/* Remix */}
          <div
            className="landing-stat-card"
            style={{ padding: '28px 32px', borderRadius: '0 12px 12px 0', border: `1px solid ${BORDER}`, borderLeft: 'none', background: '#f9f9f8', textAlign: 'center', boxShadow: SHADOW_CARD }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 16, fontFamily: INTER }}>
              Remixing a Blueprint
            </p>
            <p
              style={{
                fontFamily: INTER, fontWeight: 800, fontSize: '2.25rem', color: '#15803D',
                lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em',
                minWidth: 120, display: 'inline-block',
              }}
            >
              {remixDisplay}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', fontFamily: INTER, marginBottom: 16 }}>tokens</p>

            {/* Bar — much shorter, showing the dramatic difference */}
            <div style={{ height: 4, background: '#F5F0E8', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', background: '#86EFAC', borderRadius: 99,
                  width: `${remixBarPct}%`,
                  transition: 'width 2.2s cubic-bezier(0.16,1,0.3,1)',
                }}
              />
            </div>

            <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: 14, lineHeight: 1.6, fontFamily: INTER }}>
              Your AI already knows the codebase
            </p>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#15803D', marginTop: 8, fontFamily: INTER, letterSpacing: '-0.01em' }}>
              Cheaper. Faster. Done.
            </p>
          </div>
        </div>

        {/* 5x callout */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#F5F0E8', borderRadius: 99, padding: '8px 20px',
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0F1B2D', fontFamily: INTER, letterSpacing: '-0.02em' }}>
            5× fewer tokens
          </span>
          <span style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: INTER }}>when you remix instead of build</span>
        </div>

        <p style={{ fontSize: '1rem', color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.65, fontFamily: INTER }}>
          Every Blueprint includes a{' '}
          <code style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.875rem', background: '#f6f5f4', padding: '1px 6px', borderRadius: 4 }}>
            context file
          </code>{' '}
          so your AI assistant understands the app before you write a single prompt.
        </p>
      </div>
    </section>
  );
}
