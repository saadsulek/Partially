import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const ShowcaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130 },
  });

  const term1Spring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const term2Spring = spring({
    frame: frame - 38,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const term3Spring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const resultSpring = spring({
    frame: frame - 84,
    fps,
    config: { damping: 15, stiffness: 125 },
  });

  const rightCard1Spring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const rightCard2Spring = spring({
    frame: frame - 75,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  const exitOpacity = interpolate(frame, [196, 210], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0d1513',
        opacity: exitOpacity,
        fontFamily: "'Nunito Sans', 'Inter', sans-serif",
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 28% 35%, rgba(82, 183, 136, 0.14) 0%, transparent 50%), radial-gradient(circle at 76% 65%, rgba(231, 194, 104, 0.12) 0%, transparent 50%)',
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
                marginBottom: 8,
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
                CHAPTER 03 • STEP-BY-STEP SYMBOLIC RULES & GRADIENT
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
              How to Solve <span style={{ color: '#52b788' }}>∂f / ∂x</span>{' '}
              Term-by-Term
            </div>
          </div>

          {/* Color Legend Pill */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              backgroundColor: '#111b18',
              border: '1px solid #23352f',
              borderRadius: 16,
              padding: '14px 22px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 15,
            }}
          >
            <span style={{ color: '#52b788', fontWeight: 700 }}>
              ● x = Active Variable
            </span>
            <span style={{ color: '#23352f' }}>|</span>
            <span style={{ color: '#e7c268', fontWeight: 700 }}>
              🔒 y = Treated as Constant
            </span>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.22fr 0.78fr',
            gap: 32,
            flex: 1,
            marginTop: 22,
            alignItems: 'stretch',
          }}
        >
          {/* Left Column: Step-by-Step Symbolic Solver Breakdown */}
          <div
            style={{
              backgroundColor: '#111b18',
              borderRadius: 24,
              border: '1px solid #23352f',
              padding: '28px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Target Function Banner */}
            <div
              style={{
                backgroundColor: '#0d1513',
                borderRadius: 16,
                border: '1px solid #23352f',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <span style={{ fontSize: 14, color: '#88938f' }}>
                GIVEN FUNCTION:
              </span>
              <span style={{ fontSize: 27, fontWeight: 700, color: '#dbe5e0' }}>
                f(<span style={{ color: '#52b788' }}>x</span>,{' '}
                <span style={{ color: '#e7c268' }}>y</span>) = 3
                <span style={{ color: '#52b788' }}>x²</span>
                <span style={{ color: '#e7c268' }}>y³</span> − 5
                <span style={{ color: '#52b788' }}>x</span>
                <span style={{ color: '#e7c268' }}>y</span> + 4
                <span style={{ color: '#e7c268' }}>y²</span>
              </span>
            </div>

            {/* 3 Term Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Term 1 */}
              <div
                style={{
                  backgroundColor: '#15221f',
                  borderRadius: 16,
                  border: '1px solid rgba(82, 183, 136, 0.35)',
                  padding: '16px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: term1Spring,
                  transform: `translateX(${interpolate(term1Spring, [0, 1], [-28, 0])}px)`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#52b788',
                      fontWeight: 700,
                    }}
                  >
                    TERM 1 • CONSTANT MULTIPLE + POWER RULE
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: '#bfc9c4',
                      marginTop: 4,
                    }}
                  >
                    Pull constant <code style={{ color: '#e7c268' }}>3y³</code>{' '}
                    in front, differentiate{' '}
                    <code style={{ color: '#52b788' }}>x² → 2x</code>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#dbe5e0',
                  }}
                >
                  <span style={{ color: '#e7c268' }}>3y³</span> · (
                  <span style={{ color: '#52b788' }}>2x</span>) ={' '}
                  <span style={{ color: '#52b788' }}>6xy³</span>
                </div>
              </div>

              {/* Term 2 */}
              <div
                style={{
                  backgroundColor: '#15221f',
                  borderRadius: 16,
                  border: '1px solid rgba(82, 183, 136, 0.35)',
                  padding: '16px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: term2Spring,
                  transform: `translateX(${interpolate(term2Spring, [0, 1], [-28, 0])}px)`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#52b788',
                      fontWeight: 700,
                    }}
                  >
                    TERM 2 • LINEAR X-TERM RULE
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: '#bfc9c4',
                      marginTop: 4,
                    }}
                  >
                    Coefficient <code style={{ color: '#e7c268' }}>−5y</code> is
                    constant, and <code style={{ color: '#52b788' }}>d/dx(x) = 1</code>
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#dbe5e0',
                  }}
                >
                  <span style={{ color: '#e7c268' }}>−5y</span> · (
                  <span style={{ color: '#52b788' }}>1</span>) ={' '}
                  <span style={{ color: '#e7c268' }}>−5y</span>
                </div>
              </div>

              {/* Term 3 */}
              <div
                style={{
                  backgroundColor: '#15221f',
                  borderRadius: 16,
                  border: '1px solid rgba(231, 194, 104, 0.45)',
                  padding: '16px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: term3Spring,
                  transform: `translateX(${interpolate(term3Spring, [0, 1], [-28, 0])}px)`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: '#e7c268',
                      fontWeight: 700,
                    }}
                  >
                    TERM 3 • PURE CONSTANT RULE (NO X PRESENT!)
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: '#bfc9c4',
                      marginTop: 4,
                    }}
                  >
                    <code style={{ color: '#e7c268' }}>+4y²</code> has zero{' '}
                    <code style={{ color: '#52b788' }}>x</code> dependence — its
                    derivative is <strong style={{ color: '#e7c268' }}>0</strong>!
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#e7c268',
                  }}
                >
                  ∂/∂x(4y²) = 0
                </div>
              </div>
            </div>

            {/* Final Combined Derivative Result */}
            <div
              style={{
                backgroundColor: 'rgba(82, 183, 136, 0.14)',
                borderRadius: 16,
                border: '2px solid #52b788',
                padding: '18px 26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
                opacity: resultSpring,
                transform: `scale(${interpolate(resultSpring, [0, 1], [0.94, 1])})`,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#52b788',
                  letterSpacing: '0.1em',
                }}
              >
                FINAL X-PARTIAL DERIVATIVE:
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#dbe5e0' }}>
                ∂f / ∂x = <span style={{ color: '#52b788' }}>6xy³</span> −{' '}
                <span style={{ color: '#e7c268' }}>5y</span>
              </span>
            </div>
          </div>

          {/* Right Column: Gradient Vector ∇f & Clairaut's Theorem */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 22,
            }}
          >
            {/* Card A: The Gradient Vector ∇f */}
            <div
              style={{
                backgroundColor: '#111b18',
                borderRadius: 24,
                border: '1px solid #23352f',
                padding: '26px 28px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: rightCard1Spring,
                transform: `translateY(${interpolate(rightCard1Spring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#52b788',
                    letterSpacing: '0.12em',
                    marginBottom: 10,
                  }}
                >
                  THE GRADIENT VECTOR • STEEPEST ASCENT
                </div>
                <div
                  style={{
                    backgroundColor: '#0d1513',
                    borderRadius: 14,
                    border: '1px solid #23352f',
                    padding: '16px 18px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#dbe5e0',
                    textAlign: 'center',
                    marginBottom: 14,
                  }}
                >
                  ∇f(x, y) = ⟨{' '}
                  <span style={{ color: '#52b788' }}>∂f/∂x</span>,{' '}
                  <span style={{ color: '#e7c268' }}>∂f/∂y</span> ⟩
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: '#bfc9c4',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  Packing both first partials into a 2D vector creates the{' '}
                  <strong style={{ color: '#dbe5e0' }}>Gradient ∇f</strong>. It
                  always points uphill in the direction of{' '}
                  <strong style={{ color: '#52b788' }}>maximum rate of increase</strong>{' '}
                  and is orthogonal to level curves.
                </p>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  color: '#88938f',
                  paddingTop: 12,
                  borderTop: '1px solid #23352f',
                }}
              >
                Directional Slope: <strong style={{ color: '#dbe5e0' }}>Dᵤf = ∇f · û</strong>
              </div>
            </div>

            {/* Card B: Clairaut's Theorem (Mixed Partials) */}
            <div
              style={{
                backgroundColor: '#111b18',
                borderRadius: 24,
                border: '1px solid #23352f',
                padding: '26px 28px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: rightCard2Spring,
                transform: `translateY(${interpolate(rightCard2Spring, [0, 1], [30, 0])}px)`,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#e7c268',
                    letterSpacing: '0.12em',
                    marginBottom: 10,
                  }}
                >
                  CLAIRAUT’S THEOREM • MIXED PARTIAL SYMMETRY
                </div>
                <div
                  style={{
                    backgroundColor: '#0d1513',
                    borderRadius: 14,
                    border: '1px solid #23352f',
                    padding: '16px 18px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#dbe5e0',
                    textAlign: 'center',
                    marginBottom: 14,
                  }}
                >
                  ∂²f / ∂y∂x = ∂²f / ∂x∂y ={' '}
                  <span style={{ color: '#e7c268' }}>18xy² − 5</span>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: '#bfc9c4',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  For smooth surfaces, the order of differentiation does not
                  matter: differentiating with respect to{' '}
                  <strong style={{ color: '#52b788' }}>x then y</strong> gives
                  the exact same mixed partial as{' '}
                  <strong style={{ color: '#e7c268' }}>y then x</strong>.
                </p>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 15,
                  color: '#52b788',
                  paddingTop: 12,
                  borderTop: '1px solid #23352f',
                }}
              >
                ✓ Verified Symbolically: fₓᵧ(x,y) ≡ fᵧₓ(x,y)
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
