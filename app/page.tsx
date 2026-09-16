import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import TokenStatSection from '@/components/TokenStatSection';
import GlassNav from '@/components/GlassNav';
import LiquidGlassButton from '@/components/LiquidGlassButton';

// ─── Design tokens
const SHADOW_CARD = [
  '0 0.175px 1px rgba(0,0,0,.013)',
  '0 0.8px 2.9px rgba(0,0,0,.015)',
  '0 2px 7.8px rgba(0,0,0,.027)',
  '0 4px 18px rgba(0,0,0,.04)',
].join(', ');

const HPAD = 'max(5vw, 48px)';
const BORDER = 'rgba(0,0,0,0.08)';
const INTER = "'Inter Variable', -apple-system, BlinkMacSystemFont, sans-serif";
// Section vertical padding — scales from 64px on mobile to 96px max on large screens
const SVPAD = 'clamp(64px, 6vw, 96px)';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeedApp {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  download_count: number;
  tags: string[] | null;
}


// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        textAlign: 'center',
        position: 'relative',
        background: '#07091A',
        overflow: 'hidden',
      }}
    >
      {/* Top white glow — Notion-style radial spotlight */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: 900,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.58)',
            marginBottom: 28,
            fontFamily: INTER,
          }}
        >
          The app library for vibe-coded projects
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 'clamp(2.75rem, 7vw, 5rem)',
            lineHeight: 1.04,
            color: '#fff',
            letterSpacing: '-0.04em',
            marginBottom: 14,
          }}
        >
          Don&apos;t start from scratch.
        </h1>

        {/* Cream highlight line */}
        <div style={{ marginBottom: 36, display: 'inline-block' }}>
          <span
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 'clamp(2.75rem, 7vw, 5rem)',
              lineHeight: 1.04,
              color: '#07091A',
              letterSpacing: '-0.04em',
              background: '#F5F0E8',
              padding: '0 18px 8px',
              borderRadius: 6,
              display: 'inline-block',
            }}
          >
            Remix a Blueprint.
          </span>
        </div>

        {/* Body */}
        <p
          style={{
            fontSize: '1.1875rem',
            lineHeight: '1.75rem',
            color: 'rgba(255,255,255,0.72)',
            maxWidth: 520,
            margin: '0 auto 20px',
            fontFamily: INTER,
            fontWeight: 400,
          }}
        >
          Find an app someone already built with AI. Download it, open it, and make it yours — spending 5× fewer tokens than starting from scratch.
        </p>

        {/* Definition line */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.42)',
            fontStyle: 'italic',
            marginBottom: 40,
            fontFamily: INTER,
          }}
        >
          A Blueprint is a ready-to-run project, built with AI and packaged with everything you need to remix it.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 20,
          }}
        >
          <Link
            href="/discover"
            style={{
              background: '#fff',
              color: '#07091A',
              padding: '14px 28px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
              letterSpacing: '-0.015em',
              fontFamily: INTER,
            }}
          >
            Browse Blueprints →
          </Link>
          <LiquidGlassButton
            href="/upload"
            textStyle={{ fontFamily: INTER, fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '-0.015em', color: 'rgba(255,255,255,0.9)' }}
          >
            Upload yours
          </LiquidGlassButton>
        </div>

      </div>

      {/* Product mockup */}
      <div style={{ maxWidth: 1000, margin: '72px auto 0', position: 'relative', zIndex: 1 }}>
        <AppMockup />
      </div>
    </section>
  );
}

// ─── App Mockup ───────────────────────────────────────────────────────────────
function AppMockup() {
  const cards = [
    {
      title: 'Invoice Generator',
      tag: 'tool',
      dl: 847,
      img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=240&fit=crop&auto=format',
    },
    {
      title: 'Habit Tracker',
      tag: 'dashboard',
      dl: 623,
      img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=240&fit=crop&auto=format',
    },
    {
      title: 'Budget Planner',
      tag: 'utility',
      dl: 512,
      img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=240&fit=crop&auto=format',
    },
    {
      title: 'Recipe Manager',
      tag: 'react',
      dl: 389,
      img: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=240&fit=crop&auto=format',
    },
    {
      title: 'Kanban Board',
      tag: 'dashboard',
      dl: 334,
      img: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=240&fit=crop&auto=format',
    },
    {
      title: 'Markdown Notes',
      tag: 'tool',
      dl: 298,
      img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=240&fit=crop&auto=format',
    },
  ];

  return (
    <div
      style={{
        background: '#080B12',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.07)',
        padding: 14,
        boxShadow: '0 48px 100px rgba(0,0,0,0.5), 0 12px 32px rgba(0,0,0,0.3)',
        textAlign: 'left',
        userSelect: 'none',
      }}
    >
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 10px', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
            <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.75 }} />
          ))}
        </div>
        <div
          style={{
            flex: 1, height: 22, background: '#111418', borderRadius: 5,
            display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2a2e38' }} />
          <span style={{ fontSize: 11, color: '#3e4450', fontFamily: 'ui-monospace, monospace' }}>blueprint.app/discover</span>
        </div>
      </div>

      {/* Mock header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 8px 12px', borderBottom: '1px solid #1a1d23', marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'linear-gradient(135deg, #2563EB, #1d4ed8)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#e8ecf0', letterSpacing: '-0.02em', fontFamily: INTER }}>Blueprint</span>
        </div>
        <div style={{ flex: 1, height: 22, background: '#111418', borderRadius: 5, maxWidth: 200 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['#1a1d23', '#2563EB22'].map((bg, i) => (
            <div key={i} style={{ height: 22, width: i === 0 ? 40 : 60, borderRadius: 5, background: bg }} />
          ))}
        </div>
      </div>

      {/* Mock grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '0 4px 4px' }}>
        {cards.map((card) => (
          <div key={card.title} style={{ background: '#0D1117', borderRadius: 10, border: '1px solid #1e2127', overflow: 'hidden' }}>
            <div style={{ height: 80, overflow: 'hidden', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.img}
                alt={card.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ padding: '7px 9px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#c8d0dc', marginBottom: 5, letterSpacing: '-0.01em', fontFamily: INTER }}>
                {card.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9, color: '#404550', fontFamily: INTER }}>↓ {card.dl}</span>
                <span style={{ fontSize: 9, background: 'rgba(37,99,235,0.18)', color: '#7EB3FF', padding: '1px 5px', borderRadius: 3, fontFamily: INTER }}>
                  {card.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Logo Marquee Strip ───────────────────────────────────────────────────────
function LogoStrip() {
  return (
    <div
      style={{
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        background: '#fff',
        paddingTop: 28,
        paddingBottom: 28,
      }}
    >
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
          marginBottom: 24,
          fontFamily: INTER,
        }}
      >
        Built by creators using
      </p>
      <div style={{ overflow: 'hidden' }}>
        <div className="marquee-track">
          {[0, 1, 2, 3].map((i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/logos.png"
              alt=""
              aria-hidden="true"
              className="marquee-logo"
              style={{ height: 72, width: 'auto', flexShrink: 0, paddingRight: 16 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '01',
      accent: '#6366F1',
      iconBg: '#EEF2FF',
      cardBg: '#fff',
      title: 'Find a Blueprint',
      body: 'Browse by what the app does — calculators, dashboards, games, tools. Every card shows a live preview.',
      cta: { label: 'Find a Blueprint', href: '/discover' },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7.5" stroke="#6366F1" strokeWidth="1.5" />
          <path d="M16.5 16.5L20 20" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      num: '02',
      accent: '#F59E0B',
      iconBg: '#FFFBEB',
      cardBg: '#fff',
      title: 'Remix it with AI',
      body: 'Download the zip. It includes project context and starter prompts, so your AI assistant knows what to do.',
      cta: { label: 'Remix →', href: '/discover' },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 3v12M7 9l5 5 5-5M4 20h16" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      num: '03',
      accent: '#10B981',
      iconBg: '#ECFDF5',
      cardBg: '#fff',
      title: 'Publish your version',
      body: 'Upload your remix. It joins the lineage. Someone else will build on yours next.',
      cta: { label: 'Publish your version', href: '/upload' },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 3L14 10M21 3H15M21 3V9" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 16, fontFamily: INTER }}>
            How it works
          </p>
          <h2
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)',
              color: '#0F1B2D',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
            }}
          >
            From idea to shipped. Three steps.
          </h2>
        </div>

        <div className="grid-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="landing-how-card"
              style={{
                background: step.cardBg,
                border: `1px solid ${BORDER}`,
                borderTop: `3px solid ${step.accent}`,
                borderRadius: 12,
                padding: '24px 24px',
                boxShadow: SHADOW_CARD,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: step.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    fontFamily: INTER,
                    fontWeight: 800,
                    fontSize: '1.75rem',
                    color: step.accent,
                    opacity: 0.2,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                  }}
                >
                  {step.num}
                </span>
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#0F1B2D', marginBottom: 10, letterSpacing: '-0.02em', fontFamily: INTER, lineHeight: 1.35 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '0.9375rem', color: '#4B5563', lineHeight: 1.65, fontFamily: INTER, marginBottom: 20 }}>
                {step.body}
              </p>
              <LiquidGlassButton
                href={step.cta.href}
                accentColor={`${step.accent}22`}
                outerStyle={{ width: '100%' }}
                textStyle={{ fontFamily: INTER, fontSize: '0.875rem', fontWeight: 600, letterSpacing: '-0.012em', color: step.accent }}
              >
                {step.cta.label}
              </LiquidGlassButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Two Paths ────────────────────────────────────────────────────────────────
function TwoPaths() {
  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        borderBottom: `1px solid ${BORDER}`,
        background: '#f9f9f8',
      }}
    >
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)',
              color: '#0F1B2D',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
            }}
          >
            One app. Two ways to use it.
          </h2>
        </div>

        <div className="grid-2">
          {/* Download card */}
          <div
            className="landing-path-card"
            style={{
              background: '#fff',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              padding: '32px 28px',
              boxShadow: SHADOW_CARD,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#0F1B2D',
                background: '#F5F0E8',
                padding: '4px 10px',
                borderRadius: 6,
                marginBottom: 24,
                fontFamily: INTER,
              }}
            >
              Download
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F1B2D', marginBottom: 14, letterSpacing: '-0.025em', fontFamily: INTER, lineHeight: 1.3 }}>
              Just want to use it?
            </h3>
            <p style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1.7, marginBottom: 28, fontFamily: INTER }}>
              Every blueprint opens in your browser instantly. No install. No terminal. No setup. Just download, double-click, done.
            </p>
            <Link
              href="/discover"
              style={{
                fontSize: '0.9375rem', fontWeight: 500, color: '#0F1B2D',
                textDecoration: 'none', letterSpacing: '-0.01em', fontFamily: INTER,
                borderBottom: '1px solid rgba(15,27,45,0.25)', paddingBottom: 1,
              }}
            >
              Browse apps →
            </Link>
          </div>

          {/* Remix card — blue */}
          <div
            className="landing-path-card"
            style={{
              background: '#2B4E96',
              border: '1px solid #2B4E96',
              borderRadius: 12,
              padding: '32px 28px',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#fff',
                background: 'rgba(255,255,255,0.14)',
                padding: '4px 10px',
                borderRadius: 6,
                marginBottom: 24,
                fontFamily: INTER,
              }}
            >
              Remix
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '-0.025em', fontFamily: INTER, lineHeight: 1.3 }}>
              Want to build on it?
            </h3>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.80)', lineHeight: 1.7, marginBottom: 28, fontFamily: INTER }}>
              Every blueprint ships with project context so your AI assistant understands the codebase before you type a word. Attach the zip and start from something that already works.
            </p>
            <Link
              href="/discover"
              style={{
                fontSize: '0.9375rem', fontWeight: 500, color: '#fff',
                textDecoration: 'none', letterSpacing: '-0.01em', fontFamily: INTER,
                borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: 1,
              }}
            >
              Start remixing →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Live Feed Preview ────────────────────────────────────────────────────────
function LiveFeed({ apps }: { apps: FeedApp[] | null }) {
  const displayApps = apps?.slice(0, 6) ?? [];

  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2
            style={{
              fontFamily: INTER,
              fontWeight: 800,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.625rem)',
              color: '#0F1B2D',
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            What the community is building
          </h2>
          <p style={{ fontSize: '1rem', color: '#6B7280', fontFamily: INTER }}>
            AI-built apps. Free to download, remix, and build on.
          </p>
        </div>

        {displayApps.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {displayApps.map((app) => (
              <Link
                key={app.id}
                href={`/app/${app.slug}`}
                className="landing-feed-card"
                style={{
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  display: 'block',
                  boxShadow: SHADOW_CARD,
                }}
              >
                <div style={{ aspectRatio: '4/3', background: '#EEF2FF', position: 'relative', overflow: 'hidden' }}>
                  {app.preview_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={app.preview_url} alt={app.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div
                      style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(145deg, #EEF2FF 0%, #E0E8FF 100%)',
                      }}
                    >
                      <span style={{ fontSize: '2.25rem', fontWeight: 700, color: '#93A8DC', fontFamily: INTER }}>
                        {app.title[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0F1B2D', marginBottom: 4, letterSpacing: '-0.015em', fontFamily: INTER, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {app.title}
                  </h3>
                  {app.description && (
                    <p
                      style={{
                        fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5, marginBottom: 10,
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontFamily: INTER,
                      }}
                    >
                      {app.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#6B7280', fontFamily: INTER }}>↓ {app.download_count.toLocaleString()}</span>
                    {app.tags?.[0] && (
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', background: 'rgba(37,99,235,0.08)', padding: '2px 8px', borderRadius: 6, fontFamily: INTER }}>
                        {app.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Show mockup instead of blank skeletons when no live apps yet */
          <AppMockup />
        )}

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <Link
            href="/discover"
            style={{
              display: 'inline-block',
              background: '#2B4E96',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '-0.015em',
              fontFamily: INTER,
            }}
          >
            Browse all Blueprints →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Banner ─────────────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { num: '847+', label: 'Blueprints uploaded' },
    { num: '12,400+', label: 'Total downloads' },
    { num: '340+', label: 'Remixes published' },
    { num: '60+', label: 'Creators building' },
  ];

  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        borderBottom: `1px solid ${BORDER}`,
        background: '#f9f9f8',
      }}
    >
      <div
        style={{
          maxWidth: 940, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0, textAlign: 'center',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{ padding: '0 32px', borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : 'none' }}
          >
            <p style={{ fontFamily: INTER, fontWeight: 800, fontSize: '2.5rem', color: '#0F1B2D', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.04em' }}>
              {stat.num}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', fontFamily: INTER }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      style={{
        paddingTop: SVPAD,
        paddingBottom: SVPAD,
        paddingLeft: HPAD,
        paddingRight: HPAD,
        background: '#2B4E96',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2
          style={{
            fontFamily: INTER,
            fontWeight: 800,
            fontSize: 'clamp(2rem, 4.5vw, 3.375rem)',
            color: '#fff',
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            marginBottom: 24,
          }}
        >
          Built something with AI?<br />It belongs here.
        </h2>

        <p style={{ fontSize: '1.1875rem', lineHeight: '1.75rem', color: 'rgba(255,255,255,0.78)', marginBottom: 48, fontFamily: INTER, fontWeight: 400 }}>
          Blueprint is where vibe coders share what they build. Free to upload. Free to remix. Free forever.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link
            href="/discover"
            style={{
              background: '#fff', color: '#2B4E96',
              padding: '14px 28px', borderRadius: 8,
              fontWeight: 600, fontSize: '0.9375rem',
              textDecoration: 'none', letterSpacing: '-0.015em', fontFamily: INTER,
            }}
          >
            Explore the feed →
          </Link>
          <LiquidGlassButton
            href="/upload"
            textStyle={{ fontFamily: INTER, fontSize: '0.9375rem', fontWeight: 500, letterSpacing: '-0.015em', color: 'rgba(255,255,255,0.9)' }}
          >
            Upload your first blueprint
          </LiquidGlassButton>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', fontFamily: INTER }}>
          No account needed to browse. Upload takes 2 minutes.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: '#fff',
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 40,
        paddingBottom: 40,
        paddingLeft: HPAD,
        paddingRight: HPAD,
      }}
    >
      <div
        style={{
          maxWidth: 1160, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr auto auto',
          gap: 48, alignItems: 'start',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Image src="/transperantlogo.png" alt="Blueprint" width={20} height={20} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F1B2D', letterSpacing: '-0.02em', fontFamily: INTER }}>Blueprint</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontFamily: INTER }}>© 2026 Blueprint</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ href: '/discover', label: 'Discover' }, { href: '/discover?sort=trending', label: 'Trending' }, { href: '/upload', label: 'Upload' }, { href: '#', label: 'About' }].map((item) => (
            <Link key={item.label} href={item.href} style={{ fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', fontFamily: INTER, letterSpacing: '-0.01em' }}>
              {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[{ href: '#', label: 'Twitter / X' }, { href: '#', label: 'GitHub' }, { href: '#', label: 'Terms' }, { href: '#', label: 'Privacy' }].map((item) => (
            <Link key={item.label} href={item.href} style={{ fontSize: '0.875rem', color: '#6B7280', textDecoration: 'none', fontFamily: INTER, letterSpacing: '-0.01em' }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function LandingPage() {
  const supabase = await createClient();
  const { data: apps } = await supabase
    .from('apps')
    .select('id, slug, title, description, preview_url, download_count, tags')
    .eq('status', 'active')
    .eq('scan_status', 'clean')
    .order('download_count', { ascending: false })
    .limit(6);

  return (
    <div style={{ background: '#fff', color: '#0F1B2D', minHeight: '100vh', fontFamily: INTER }}>
      <GlassNav />
      <Hero />
      <LogoStrip />
      <TokenStatSection />
      <HowItWorks />
      <TwoPaths />
      <LiveFeed apps={apps} />
      <StatsBanner />
      <FinalCTA />
      <Footer />
    </div>
  );
}
