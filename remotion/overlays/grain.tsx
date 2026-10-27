import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Animated film grain: a new feTurbulence seed every frame, drawn at half resolution for chunkier grain. */
export const Grain = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ opacity: 0.065, pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 960 540" preserveAspectRatio="none">
        <filter id="reel-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={2}
            seed={(frame % 113) + 1}
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0.8 0.8 0.8 0 -0.7  0.8 0.8 0.8 0 -0.7  0.8 0.8 0.8 0 -0.7  0 0 0 0 1"
          />
        </filter>
        <rect width="960" height="540" filter="url(#reel-grain)" />
      </svg>
    </AbsoluteFill>
  );
};
