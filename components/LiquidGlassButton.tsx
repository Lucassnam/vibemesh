'use client';
import Link from 'next/link';

interface Props {
  href: string;
  children: React.ReactNode;
  textStyle?: React.CSSProperties;
  outerStyle?: React.CSSProperties;
  accentColor?: string;
  padding?: string;
}

export default function LiquidGlassButton({
  href,
  children,
  textStyle,
  outerStyle,
  accentColor = 'rgba(255,255,255,0.04)',
  padding = '14px 28px',
}: Props) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        display: outerStyle?.width ? 'block' : 'inline-block',
        ...outerStyle,
      }}
    >
      <span
        style={{
          display: outerStyle?.width ? 'flex' : 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: outerStyle?.width ? '100%' : undefined,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 10,
          backdropFilter: 'blur(22px) saturate(170%) brightness(1.06)',
          WebkitBackdropFilter: 'blur(22px) saturate(170%) brightness(1.06)',
          background: accentColor,
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: [
            'inset 0 1px 0 rgba(255,255,255,0.22)',
            'inset 0 -1px 0 rgba(0,0,0,0.06)',
            '0 4px 18px rgba(0,0,0,0.16)',
          ].join(', '),
          padding,
          cursor: 'pointer',
        }}
      >
        {/* Drifting light blob — the core liquid feel */}
        <span
          className="lg-blob"
          style={{
            position: 'absolute',
            inset: '-60%',
            background:
              'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(255,255,255,0.2) 0%, transparent 70%)',
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top specular arc — breathes gently */}
        <span
          className="lg-sheen"
          style={{
            position: 'absolute',
            top: 0,
            left: '-10%',
            right: '-10%',
            height: '48%',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 100%)',
            borderRadius: '0 0 60% 60%',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom rim light */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: '20%',
            right: '20%',
            height: 1,
            background: 'rgba(255,255,255,0.10)',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <span style={{ position: 'relative', zIndex: 1, ...textStyle }}>
          {children}
        </span>
      </span>
    </Link>
  );
}
