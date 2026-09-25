import React from 'react';
import { Composition } from 'remotion';
import { PartiallyPromo } from './PartiallyPromo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PartiallyPromo"
        component={PartiallyPromo}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

export default RemotionRoot;
