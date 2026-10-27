import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { expoIn, expoOut, progress } from "../lib/easing";
import { COLORS } from "../lib/theme";

const PALETTE = [COLORS.ink, COLORS.bone, COLORS.signal, COLORS.cobalt, COLORS.ink];
const BAND_COUNT = 18;

const weights = Array.from({ length: BAND_COUNT }, (_, i) => 0.4 + random(`whip-h-${i}`) * 1.6);
const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

const BANDS = weights.map((weight, i) => {
  const stops = Array.from({ length: 5 }, (_, s) => {
    const color = PALETTE[Math.floor(random(`whip-c-${i}-${s}`) * PALETTE.length)];
    return `${color} ${Math.round(s * 25 + random(`whip-p-${i}-${s}`) * 12)}%`;
  });
  const top = weights.slice(0, i).reduce((sum, w) => sum + w, 0) / totalWeight;
  return { top, size: weight / totalWeight, gradient: `linear-gradient(90deg, ${stops.join(", ")})` };
});

/** Horizontal motion-smear streaks that are fully opaque exactly at `at` (global), selling a whip-pan cut. */
export const WhipPan = ({ at, before = 6, after = 7 }: { at: number; before?: number; after?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at;
  if (t < -before || t > after) return null;

  const coverage =
    t < 0 ? progress(t, -before, before, expoIn) : 1 - progress(t, 0, after, expoOut);
  const tile = width * 1.5;
  const shift = ((t + before) * 0.9 * width) % tile;

  return (
    <AbsoluteFill style={{ opacity: coverage, pointerEvents: "none", overflow: "hidden" }}>
      {BANDS.map((band, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: band.top * height,
            height: band.size * height + 1,
            left: 0,
            width: width * 3,
            backgroundImage: band.gradient,
            backgroundSize: `${tile}px 100%`,
            backgroundRepeat: "repeat-x",
            transform: `translateX(${-shift}px)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
