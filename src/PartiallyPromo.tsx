import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { HookScene } from './scenes/HookScene';
import { LogoScene } from './scenes/LogoScene';
import { ShowcaseScene } from './scenes/ShowcaseScene';
import { CtaScene } from './scenes/CtaScene';

export const PartiallyPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0d14' }}>
      {/* Scene 1: The Hook (0s – 4s / Frames 0–120) */}
      <Sequence from={0} durationInFrames={120} name="Scene 1: The Hook">
        <HookScene />
      </Sequence>

      {/* Scene 2: Brand & Logo Reveal (4s – 8s / Frames 120–240) */}
      <Sequence from={120} durationInFrames={120} name="Scene 2: Brand & Logo Reveal">
        <LogoScene />
      </Sequence>

      {/* Scene 3: Mock Interface & Feature Highlights (8s – 15s / Frames 240–450) */}
      <Sequence from={240} durationInFrames={210} name="Scene 3: Dashboard Showcase">
        <ShowcaseScene />
      </Sequence>

      {/* Scene 4: Call to Action (15s – 20s / Frames 450–600) */}
      <Sequence from={450} durationInFrames={150} name="Scene 4: GitHub Call to Action">
        <CtaScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export default PartiallyPromo;
