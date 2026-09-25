import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const LogoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 130 },
  });

  const canvasSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 115 },
  });

  const rightPanelSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  // Animated progress for drawing the intersection curves and tangent vectors
  const sliceDraw = interpolate(frame, [15, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const tangentDraw = interpolate(frame, [42, 85], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitOpacity = interpolate(frame, [108, 120], [1, 0], {
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
            'radial-gradient(circle at 35% 55%, rgba(82, 183, 136, 0.14) 0%, transparent 55%), radial-gradient(circle at 75% 35%, rgba(231, 194, 104, 0.12) 0%, transparent 50%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          padding: '54px 84px',
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
                CHAPTER 02 • GEOMETRIC INTUITION
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Literata', Georgia, serif",
                fontSize: 44,
                fontWeight: 700,
                color: '#dbe5e0',
              }}
            >
              Slicing a 3D Surface with{' '}
              <span style={{ color: '#52b788' }}>y = y₀</span> &{' '}
              <span style={{ color: '#e7c268' }}>x = x₀</span> Planes
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#111b18',
              border: '1px solid #23352f',
              borderRadius: 16,
              padding: '14px 22px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div style={{ fontSize: 11, color: '#88938f', letterSpacing: '0.14em' }}>
              EVALUATION POINT P₀
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#dbe5e0', marginTop: 4 }}>
              (x₀, y₀, z₀) = (<span style={{ color: '#52b788' }}>1.20</span>,{' '}
              <span style={{ color: '#e7c268' }}>1.00</span>, 2.44)
            </div>
          </div>
        </div>

        {/* Main Content: 3D Slicing Plane SVG Diagram + Inspector Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.18fr 0.82fr',
            gap: 34,
            alignItems: 'stretch',
            flex: 1,
            marginTop: 24,
          }}
        >
          {/* Left: Procedural 3D Surface + Slicing Planes Visualizer */}
          <div
            style={{
              backgroundColor: '#111b18',
              borderRadius: 24,
              border: '1px solid #23352f',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px 28px',
              opacity: canvasSpring,
              transform: `scale(${interpolate(canvasSpring, [0, 1], [0.95, 1])})`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#88938f',
                  letterSpacing: '0.12em',
                }}
              >
                SURFACE: z = f(x, y) = 4 − 0.4x² − 0.4y²
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(82, 183, 136, 0.15)',
                    color: '#52b788',
                    border: '1px solid rgba(82, 183, 136, 0.35)',
                  }}
                >
                  Plane y = y₀ (X-Slice)
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(231, 194, 104, 0.15)',
                    color: '#e7c268',
                    border: '1px solid rgba(231, 194, 104, 0.35)',
                  }}
                >
                  Plane x = x₀ (Y-Slice)
                </span>
              </div>
            </div>

            {/* 3D Isometric Surface + Slicing Planes SVG */}
            <svg
              viewBox="0 0 880 500"
              style={{ width: '100%', height: 430, overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="surfaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#52b788" stopOpacity="0.24" />
                  <stop offset="60%" stopColor="#1b4332" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#e7c268" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id="xPlaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#52b788" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#52b788" stopOpacity="0.04" />
                </linearGradient>
                <linearGradient id="yPlaneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e7c268" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#e7c268" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* 3D Coordinate Axes */}
              <line x1="440" y1="420" x2="440" y2="55" stroke="#2f473f" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="440" y1="420" x2="120" y2="465" stroke="#2f473f" strokeWidth="2" />
              <line x1="440" y1="420" x2="770" y2="465" stroke="#2f473f" strokeWidth="2" />
              <text x="450" y="68" fill="#88938f" fontSize="15" fontFamily="JetBrains Mono">Z (Height)</text>
              <text x="135" y="450" fill="#52b788" fontSize="15" fontFamily="JetBrains Mono">X-Axis</text>
              <text x="710" y="450" fill="#e7c268" fontSize="15" fontFamily="JetBrains Mono">Y-Axis</text>

              {/* 3D Paraboloid Surface Dome Mesh */}
              <path
                d="M 150 385 Q 440 70 730 385 Q 585 455 440 440 Q 295 455 150 385 Z"
                fill="url(#surfaceGrad)"
                stroke="#35584c"
                strokeWidth="1.5"
              />
              {/* Wireframe latitude/longitude ribs */}
              <path d="M 210 340 Q 440 120 670 340" fill="none" stroke="rgba(82,183,136,0.22)" strokeWidth="1.2" />
              <path d="M 275 295 Q 440 165 605 295" fill="none" stroke="rgba(82,183,136,0.22)" strokeWidth="1.2" />

              {/* Vertical X-Slice Plane (y = y₀ held constant) */}
              <polygon
                points="170,415 690,345 690,120 170,190"
                fill="url(#xPlaneGrad)"
                stroke="rgba(82, 183, 136, 0.55)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity={sliceDraw}
              />

              {/* Vertical Y-Slice Plane (x = x₀ held constant) */}
              <polygon
                points="230,340 710,425 710,195 230,110"
                fill="url(#yPlaneGrad)"
                stroke="rgba(231, 194, 104, 0.55)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity={sliceDraw}
              />

              {/* 1D X-Intersection Curve on Surface (Mint #52b788) */}
              <path
                d="M 175 375 Q 435 95 685 350"
                fill="none"
                stroke="#52b788"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={680}
                strokeDashoffset={(1 - sliceDraw) * 680}
              />

              {/* 1D Y-Intersection Curve on Surface (Gold #e7c268) */}
              <path
                d="M 235 345 Q 445 110 705 390"
                fill="none"
                stroke="#e7c268"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={680}
                strokeDashoffset={(1 - sliceDraw) * 680}
              />

              {/* Tangent Plane Patch at P₀ */}
              <polygon
                points="345,195 545,175 565,260 365,280"
                fill="rgba(219, 229, 224, 0.14)"
                stroke="#dbe5e0"
                strokeWidth="1.5"
                opacity={tangentDraw}
              />

              {/* Tangent Vector T_x along X-Curve */}
              <g opacity={tangentDraw}>
                <line
                  x1="445"
                  y1="228"
                  x2="315"
                  y2="295"
                  stroke="#52b788"
                  strokeWidth="4"
                />
                <circle cx="315" cy="295" r="5" fill="#52b788" />
                <rect x="205" y="252" width="150" height="32" rx="8" fill="#0d1513" stroke="#52b788" />
                <text x="217" y="273" fill="#52b788" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">
                  Slope ∂z/∂x = fₓ
                </text>
              </g>

              {/* Tangent Vector T_y along Y-Curve */}
              <g opacity={tangentDraw}>
                <line
                  x1="445"
                  y1="228"
                  x2="585"
                  y2="288"
                  stroke="#e7c268"
                  strokeWidth="4"
                />
                <circle cx="585" cy="288" r="5" fill="#e7c268" />
                <rect x="555" y="232" width="150" height="32" rx="8" fill="#0d1513" stroke="#e7c268" />
                <text x="567" y="253" fill="#e7c268" fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">
                  Slope ∂z/∂y = fᵧ
                </text>
              </g>

              {/* Evaluation Point P₀ */}
              <circle cx="445" cy="228" r="9" fill="#dbe5e0" stroke="#0d1513" strokeWidth="3" />
              <text x="405" y="198" fill="#dbe5e0" fontSize="16" fontWeight="700" fontFamily="JetBrains Mono">
                P₀(x₀, y₀, z₀)
              </text>
            </svg>

            <div
              style={{
                backgroundColor: '#0d1513',
                borderRadius: 14,
                border: '1px solid #23352f',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
              }}
            >
              <span style={{ color: '#88938f' }}>TANGENT PLANE EQUATION:</span>
              <span style={{ color: '#dbe5e0', fontWeight: 700 }}>
                z − z₀ = <span style={{ color: '#52b788' }}>fₓ(x₀,y₀)</span>(x − x₀) +{' '}
                <span style={{ color: '#e7c268' }}>fᵧ(x₀,y₀)</span>(y − y₀)
              </span>
            </div>
          </div>

          {/* Right Column: How Slicing Works Step-by-Step */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 18,
              opacity: rightPanelSpring,
              transform: `translateX(${interpolate(rightPanelSpring, [0, 1], [36, 0])}px)`,
            }}
          >
            {/* Step 1 Card */}
            <div
              style={{
                backgroundColor: '#111b18',
                borderRadius: 20,
                border: '1px solid rgba(82, 183, 136, 0.4)',
                padding: '24px 26px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#52b788',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                01 • VERTICAL KNIFE CUT ALONG X (y = y₀)
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#dbe5e0',
                  marginBottom: 8,
                }}
              >
                Reduces a 3D Surface to a 2D Curve
              </div>
              <p style={{ fontSize: 16, color: '#bfc9c4', lineHeight: 1.5, margin: 0 }}>
                Intersecting <code style={{ color: '#dbe5e0' }}>z = f(x, y)</code> with the
                vertical plane <code style={{ color: '#e7c268' }}>y = y₀</code> traces the
                green curve. Its ordinary 2D slope is{' '}
                <strong style={{ color: '#52b788' }}>∂f/∂x</strong>, pointing along{' '}
                <code style={{ color: '#52b788' }}>Tₓ = ⟨1, 0, fₓ⟩</code>.
              </p>
            </div>

            {/* Step 2 Card */}
            <div
              style={{
                backgroundColor: '#111b18',
                borderRadius: 20,
                border: '1px solid rgba(231, 194, 104, 0.4)',
                padding: '24px 26px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#e7c268',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                02 • VERTICAL KNIFE CUT ALONG Y (x = x₀)
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#dbe5e0',
                  marginBottom: 8,
                }}
              >
                Orthogonal Cross-Section Slope
              </div>
              <p style={{ fontSize: 16, color: '#bfc9c4', lineHeight: 1.5, margin: 0 }}>
                Slicing perpendicular at <code style={{ color: '#52b788' }}>x = x₀</code>{' '}
                traces the gold curve. Its tangent slope is{' '}
                <strong style={{ color: '#e7c268' }}>∂f/∂y</strong>, pointing along{' '}
                <code style={{ color: '#e7c268' }}>Tᵧ = ⟨0, 1, fᵧ⟩</code>.
              </p>
            </div>

            {/* Step 3 Card */}
            <div
              style={{
                backgroundColor: '#15221f',
                borderRadius: 20,
                border: '1px solid #23352f',
                padding: '24px 26px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: '#dbe5e0',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                03 • TWO VECTORS SPAN THE TANGENT PLANE
              </div>
              <p style={{ fontSize: 16, color: '#bfc9c4', lineHeight: 1.5, margin: 0 }}>
                Together, <strong style={{ color: '#52b788' }}>Tₓ</strong> and{' '}
                <strong style={{ color: '#e7c268' }}>Tᵧ</strong> define the flat{' '}
                <strong style={{ color: '#dbe5e0' }}>Tangent Plane</strong> that best
                approximates the curved surface near <code style={{ color: '#dbe5e0' }}>P₀</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
