import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { PartiallyLogo } from '../components/PartiallyLogo';

const LAB_MODULES = [
  {
    code: '01',
    title: '3D Surface & Slicing Lab',
    desc: 'Interactive Three.js z = f(x,y) plot with y = y₀ and x = x₀ planes.',
    accent: '#52b788',
  },
  {
    code: '02',
    title: 'Symbolic Step-by-Step Solver',
    desc: 'Color-coded constant & power rule breakdown for ∂f/∂x & ∂f/∂y.',
    accent: '#e7c268',
  },
  {
    code: '03',
    title: 'Curl (∇ × F) & Paddlewheel',
    desc: '3×3 determinant cofactor solver with live 2D vorticity circulation.',
    accent: '#52b788',
  },
  {
    code: '04',
    title: 'Clairaut & Gradient Contour Map',
    desc: 'Verify fₓᵧ = fᵧₓ and drag directional vector û against ∇f.',
    accent: '#e7c268',
  },
];

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130 },
  });

  const curlCardSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const modulesSpring = spring({
    frame: frame - 26,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Continuous paddlewheel rotation driven by frame
  const wheelAngle = frame * 3.2;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1513',
        fontFamily: "'Nunito Sans', 'Inter', sans-serif",
      }}
    >
      {/* Ambient Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 25% 40%, rgba(82, 183, 136, 0.15) 0%, transparent 52%), radial-gradient(circle at 78% 60%, rgba(231, 194, 104, 0.13) 0%, transparent 50%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          padding: '50px 84px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: headerSpring,
            transform: `translateY(${interpolate(headerSpring, [0, 1], [-20, 0])}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <PartiallyLogo size={64} delay={0} />
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '5px 14px',
                  borderRadius: 999,
                  backgroundColor: '#15221f',
                  border: '1px solid rgba(82, 183, 136, 0.35)',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: '#52b788',
                  }}
                >
                  CHAPTER 04 • VECTOR CURL & INTERACTIVE WORKSPACE
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Literata', Georgia, serif",
                  fontSize: 42,
                  fontWeight: 700,
                  color: '#dbe5e0',
                }}
              >
                From Partial Derivatives to{' '}
                <span style={{ color: '#52b788' }}>Curl (∇ × F)</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#111b18',
              border: '1px solid #23352f',
              borderRadius: 16,
              padding: '14px 22px',
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: 11, color: '#88938f', letterSpacing: '0.14em' }}>
              TERRACALC ∂/∂x ENGINE
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#52b788', marginTop: 4 }}>
              Interactive Multivariable Lab
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout: Left = Curl 3x3 Determinant & Paddlewheel, Right = 4 Interactive Modules */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.12fr 0.88fr',
            gap: 32,
            flex: 1,
            marginTop: 22,
            alignItems: 'stretch',
          }}
        >
          {/* Left Card: Curl 3x3 Determinant + Vorticity Paddlewheel */}
          <div
            style={{
              backgroundColor: '#111b18',
              borderRadius: 24,
              border: '1px solid #23352f',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: curlCardSpring,
              transform: `translateY(${interpolate(curlCardSpring, [0, 1], [32, 0])}px)`,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#52b788',
                  }}
                >
                  3D CURL DETERMINANT • F = ⟨P, Q, R⟩
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: '#e7c268',
                    backgroundColor: 'rgba(231, 194, 104, 0.12)',
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(231, 194, 104, 0.3)',
                  }}
                >
                  Measures Local Rotation
                </span>
              </div>

              {/* 3x3 Matrix Visual + Paddlewheel Side-by-Side */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.3fr 0.7fr',
                  gap: 20,
                  backgroundColor: '#0d1513',
                  borderRadius: 18,
                  border: '1px solid #23352f',
                  padding: '22px 24px',
                  alignItems: 'center',
                }}
              >
                {/* 3x3 Determinant Grid */}
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                  }}
                >
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#dbe5e0' }}>
                    ∇ × F =
                  </span>
                  <div
                    style={{
                      borderLeft: '3px solid #52b788',
                      borderRight: '3px solid #52b788',
                      padding: '8px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      rowGap: 10,
                      columnGap: 26,
                      textAlign: 'center',
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: '#52b788' }}>î</span>
                    <span style={{ color: '#e7c268' }}>ĵ</span>
                    <span style={{ color: '#dbe5e0' }}>k̂</span>

                    <span style={{ color: '#88938f' }}>∂/∂x</span>
                    <span style={{ color: '#88938f' }}>∂/∂y</span>
                    <span style={{ color: '#88938f' }}>∂/∂z</span>

                    <span style={{ color: '#dbe5e0' }}>P</span>
                    <span style={{ color: '#dbe5e0' }}>Q</span>
                    <span style={{ color: '#dbe5e0' }}>R</span>
                  </div>
                </div>

                {/* Spinning Vorticity Paddlewheel SVG */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderLeft: '1px solid #23352f',
                    paddingLeft: 18,
                  }}
                >
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      fill="none"
                      stroke="rgba(82, 183, 136, 0.35)"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                    <g transform={`translate(60, 60) rotate(${wheelAngle})`}>
                      <line x1="-34" y1="0" x2="34" y2="0" stroke="#52b788" strokeWidth="4" />
                      <line x1="0" y1="-34" x2="0" y2="34" stroke="#e7c268" strokeWidth="4" />
                      <rect x="24" y="-8" width="12" height="16" rx="3" fill="#52b788" />
                      <rect x="-36" y="-8" width="12" height="16" rx="3" fill="#52b788" />
                      <rect x="-8" y="24" width="16" height="12" rx="3" fill="#e7c268" />
                      <rect x="-8" y="-36" width="16" height="12" rx="3" fill="#e7c268" />
                      <circle cx="0" cy="0" r="7" fill="#dbe5e0" />
                    </g>
                  </svg>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#52b788',
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    ω_z = ∂Q/∂x − ∂P/∂y
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Formula Breakdown */}
            <div
              style={{
                backgroundColor: '#15221f',
                borderRadius: 16,
                border: '1px solid #23352f',
                padding: '18px 22px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 19,
                fontWeight: 700,
                color: '#dbe5e0',
                textAlign: 'center',
              }}
            >
              ∇ × F = <span style={{ color: '#52b788' }}>(∂R/∂y − ∂Q/∂z)î</span> −{' '}
              <span style={{ color: '#e7c268' }}>(∂R/∂x − ∂P/∂z)ĵ</span> +{' '}
              <span style={{ color: '#52b788' }}>(∂Q/∂x − ∂P/∂y)k̂</span>
            </div>

            <div
              style={{
                fontSize: 16,
                color: '#bfc9c4',
                lineHeight: 1.5,
              }}
            >
              If <strong style={{ color: '#52b788' }}>∇ × F = ⟨0, 0, 0⟩</strong>, the
              vector field is <strong style={{ color: '#dbe5e0' }}>Irrotational (Conservative)</strong>{' '}
              — a microscopic paddlewheel placed in the flow will not spin!
            </div>
          </div>

          {/* Right Column: Interactive Workspace Guide */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              opacity: modulesSpring,
              transform: `translateX(${interpolate(modulesSpring, [0, 1], [32, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: '#88938f',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              TRY EVERY CONCEPT LIVE IN PARTIALLY (TERRACALC ∂/∂x):
            </div>

            {LAB_MODULES.map((mod) => (
              <div
                key={mod.code}
                style={{
                  backgroundColor: '#111b18',
                  borderRadius: 18,
                  border: `1px solid ${mod.accent}44`,
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    backgroundColor: `${mod.accent}20`,
                    border: `1px solid ${mod.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 18,
                    fontWeight: 800,
                    color: mod.accent,
                    flexShrink: 0,
                  }}
                >
                  {mod.code}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: 700,
                      color: '#dbe5e0',
                      marginBottom: 3,
                    }}
                  >
                    {mod.title}
                  </div>
                  <div style={{ fontSize: 15, color: '#88938f' }}>{mod.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
