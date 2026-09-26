import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PartiallyLogoProps {
  size?: number;
  startFrame?: number;
}

export const PartiallyLogo: React.FC<PartiallyLogoProps> = ({
  size = 200,
  startFrame = 0
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relFrame = Math.max(0, frame - startFrame);

  const entranceSpring = spring({
    frame: relFrame,
    fps,
    config: { damping: 16, stiffness: 100 }
  });

  const drawProgress = spring({
    frame: Math.max(0, relFrame - 4),
    fps,
    config: { damping: 18, stiffness: 80 }
  });

  const arcLen = 230;
  const dashOffset = interpolate(drawProgress, [0, 1], [arcLen, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${entranceSpring})`
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Precise Coordinate Calibration Circle */}
        <circle
          cx="110"
          cy="110"
          r="86"
          stroke="#27272a"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* X-Slice Curve Arc (Cyan #38bdf8 - ∂f/∂x) */}
        <path
          d="M 42 142 Q 110 42 178 142"
          stroke="#38bdf8"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={dashOffset}
        />

        {/* Y-Slice Curve Arc (Amber #f59e0b - ∂f/∂y) */}
        <path
          d="M 52 162 Q 110 82 168 118"
          stroke="#f59e0b"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={dashOffset}
        />

        {/* Center Partial Derivative Symbol ∂ */}
        <text
          x="110"
          y="132"
          textAnchor="middle"
          fill="#f4f4f5"
          fontFamily="Literata, Georgia, serif"
          fontWeight="bold"
          fontSize="76"
        >
          ∂
        </text>
      </svg>
    </div>
  );
};

export default PartiallyLogo;
