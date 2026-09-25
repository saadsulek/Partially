import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { PartiallyLogo } from '../components/PartiallyLogo';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130, mass: 0.9 },
  });

  const leftCardSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.9 },
  });

  const rightCardSpring = spring({
    frame: frame - 26,
    fps,
    config: { damping: 15, stiffness: 120, mass: 0.9 },
  });

  const bottomBannerSpring = spring({
    frame: frame - 44,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  // Exit fade at frames 108..120
  const exitOpacity = interpolate(frame, [108, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitScale = interpolate(frame, [108, 120], [1, 0.96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1513',
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        fontFamily: "'Nunito Sans', 'Inter', sans-serif",
      }}
    >
      {/* Spectral Mint & Luminous Gold Ambient Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 22% 25%, rgba(82, 183, 136, 0.14) 0%, transparent 50%), radial-gradient(circle at 78% 70%, rgba(231, 194, 104, 0.12) 0%, transparent 50%)',
        }}
      />

      {/* Coordinate grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, rgba(35, 53, 47, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(35, 53, 47, 0.35) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          padding: '58px 88px',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: headerSpring,
            transform: `translateY(${interpolate(headerSpring, [0, 1], [-24, 0])}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <PartiallyLogo size={68} delay={0} />
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
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#52b788',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    color: '#52b788',
                    textTransform: 'uppercase',
                  }}
                >
                  CHAPTER 01 • THE FUNDAMENTAL IDEA
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Literata', Georgia, serif",
                  fontSize: 46,
                  fontWeight: 700,
                  color: '#dbe5e0',
                  letterSpacing: '-0.02em',
                }}
              >
                What is a{' '}
                <span style={{ color: '#52b788' }}>Partial Derivative</span>?
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 24px',
              borderRadius: 16,
              backgroundColor: '#111b18',
              border: '1px solid #23352f',
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#88938f',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              3D SURFACE FUNCTION
            </div>
            <div
              style={{
                fontSize: 28,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: '#dbe5e0',
                marginTop: 4,
              }}
            >
              z = f(<span style={{ color: '#52b788' }}>x</span>,{' '}
              <span style={{ color: '#e7c268' }}>y</span>)
            </div>
          </div>
        </div>

        {/* Center Comparison Cards: Partial wrt X vs Partial wrt Y */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 36,
            alignItems: 'stretch',
          }}
        >
          {/* Card 1: Partial with respect to x */}
          <div
            style={{
              backgroundColor: '#111b18',
              borderRadius: 24,
              border: '1px solid rgba(82, 183, 136, 0.45)',
              padding: '34px 38px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              opacity: leftCardSpring,
              transform: `translateY(${interpolate(leftCardSpring, [0, 1], [40, 0])}px)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(82, 183, 136, 0.14)',
                    border: '1px solid rgba(82, 183, 136, 0.35)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#52b788',
                  }}
                >
                  X-PARTIAL DERIVATIVE
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: '#e7c268',
                    backgroundColor: 'rgba(231, 194, 104, 0.12)',
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(231, 194, 104, 0.3)',
                  }}
                >
                  🔒 Hold y = y₀ constant
                </span>
              </div>

              {/* Definition Formula */}
              <div
                style={{
                  backgroundColor: '#0d1513',
                  borderRadius: 16,
                  border: '1px solid #23352f',
                  padding: '22px 26px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 30,
                  fontWeight: 700,
                  color: '#dbe5e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                <span style={{ color: '#52b788', fontSize: 38 }}>∂f / ∂x</span>
                <span style={{ color: '#88938f' }}>=</span>
                <span style={{ fontSize: 24 }}>
                  lim<sub>h→0</sub> [f(
                  <span style={{ color: '#52b788' }}>x + h</span>,{' '}
                  <span style={{ color: '#e7c268' }}>y₀</span>) − f(
                  <span style={{ color: '#52b788' }}>x</span>,{' '}
                  <span style={{ color: '#e7c268' }}>y₀</span>)] / h
                </span>
              </div>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: '#bfc9c4',
                  margin: 0,
                }}
              >
                Treat every <strong style={{ color: '#e7c268' }}>y</strong> in
                the equation like a fixed number (such as{' '}
                <code style={{ color: '#e7c268' }}>5</code>), and differentiate
                normally with respect to{' '}
                <strong style={{ color: '#52b788' }}>x</strong>.
              </p>
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: '1px solid #23352f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
              }}
            >
              <span style={{ color: '#88938f' }}>Example: f(x,y) = x²y³</span>
              <span style={{ color: '#52b788', fontWeight: 700 }}>
                ∂f/∂x = (2x) · y³ = 2xy³
              </span>
            </div>
          </div>

          {/* Card 2: Partial with respect to y */}
          <div
            style={{
              backgroundColor: '#111b18',
              borderRadius: 24,
              border: '1px solid rgba(231, 194, 104, 0.45)',
              padding: '34px 38px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
              opacity: rightCardSpring,
              transform: `translateY(${interpolate(rightCardSpring, [0, 1], [40, 0])}px)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    backgroundColor: 'rgba(231, 194, 104, 0.14)',
                    border: '1px solid rgba(231, 194, 104, 0.35)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#e7c268',
                  }}
                >
                  Y-PARTIAL DERIVATIVE
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: '#52b788',
                    backgroundColor: 'rgba(82, 183, 136, 0.12)',
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(82, 183, 136, 0.3)',
                  }}
                >
                  🔒 Hold x = x₀ constant
                </span>
              </div>

              {/* Definition Formula */}
              <div
                style={{
                  backgroundColor: '#0d1513',
                  borderRadius: 16,
                  border: '1px solid #23352f',
                  padding: '22px 26px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 30,
                  fontWeight: 700,
                  color: '#dbe5e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                <span style={{ color: '#e7c268', fontSize: 38 }}>∂f / ∂y</span>
                <span style={{ color: '#88938f' }}>=</span>
                <span style={{ fontSize: 24 }}>
                  lim<sub>k→0</sub> [f(
                  <span style={{ color: '#52b788' }}>x₀</span>,{' '}
                  <span style={{ color: '#e7c268' }}>y + k</span>) − f(
                  <span style={{ color: '#52b788' }}>x₀</span>,{' '}
                  <span style={{ color: '#e7c268' }}>y</span>)] / k
                </span>
              </div>

              <p
                style={{
                  fontSize: 21,
                  lineHeight: 1.55,
                  color: '#bfc9c4',
                  margin: 0,
                }}
              >
                Now freeze <strong style={{ color: '#52b788' }}>x</strong> as a
                constant multiplier, and measure how fast height{' '}
                <strong style={{ color: '#dbe5e0' }}>z</strong> changes along
                the <strong style={{ color: '#e7c268' }}>y-axis</strong>.
              </p>
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: '1px solid #23352f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
              }}
            >
              <span style={{ color: '#88938f' }}>Example: f(x,y) = x²y³</span>
              <span style={{ color: '#e7c268', fontWeight: 700 }}>
                ∂f/∂y = x² · (3y²) = 3x²y²
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Summary Takeaway Banner */}
        <div
          style={{
            backgroundColor: '#15221f',
            borderRadius: 18,
            border: '1px solid #23352f',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: bottomBannerSpring,
            transform: `translateY(${interpolate(bottomBannerSpring, [0, 1], [24, 0])}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                backgroundColor: '#52b788',
                color: '#052918',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              GOLDEN RULE
            </span>
            <span style={{ fontSize: 22, color: '#dbe5e0', fontWeight: 600 }}>
              On a 3D surface, slope depends on direction — so we measure{' '}
              <span style={{ color: '#52b788' }}>one axis at a time</span>.
            </span>
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
              color: '#88938f',
            }}
          >
            NEXT: 3D SLICING PLANES →
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
