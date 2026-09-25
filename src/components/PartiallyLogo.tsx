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
    config: { damping: 14, stiffness: 95 }
  });

  const drawProgress = spring({
    frame: Math.max(0, relFrame - 4),
    fps,
    config: { damping: 18, stiffness: 75 }
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
      {/* Spectral Obsidian Mint/Gold Halo */}
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.15,
          borderRadius: '9999px',
          background:
            'radial-gradient(circle, rgba(82,183,136,0.35) 0%, rgba(231,194,104,0.2) 48%, rgba(13,21,19,0) 72%)',
          filter: 'blur(24px)',
          pointerEvents: 'none'
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 220 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Coordinate Grid Circle */}
        <circle
          cx="110"
          cy="110"
          r="82"
          stroke="#23352f"
          strokeWidth="2"
          strokeDasharray="5 5"
        />

        {/* X-Slice Curve Arc (Mint #52b788 - ∂f/∂x) */}
        <path
          d="M 42 142 Q 110 42 178 142"
          stroke="#52b788"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={dashOffset}
        />

        {/* Y-Slice Curve Arc (Gold #e7c268 - ∂f/∂y) */}
        <path
          d="M 52 162 Q 110 82 168 118"
          stroke="#e7c268"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={dashOffset}
        />

        {/* Center Partial Derivative Symbol ∂ */}
        <text
          x="110"
          y="132"
          textAnchor="middle"
          fill="#e2ece9"
          fontFamily="Literata, Georgia, serif"
          fontWeight="bold"
          fontSize="74"
        >
          ∂
        </text>
      </svg>
    </div>
  );
};

export default PartiallyLogo;
