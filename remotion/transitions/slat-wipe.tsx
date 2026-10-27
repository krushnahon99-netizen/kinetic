import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { expoInOut, progress } from "../lib/easing";

const SLATS = 8;
const STAGGER = 0.75;
const SKEW_MARGIN = 220;

/** Skewed slats drop in to fully cover the frame exactly at `at` (global), then keep falling to reveal the next scene. */
export const SlatWipe = ({
  at,
  color,
  cover = 10,
  reveal = 10,
}: {
  at: number;
  color: string;
  cover?: number;
  reveal?: number;
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at;
  if (t < -cover || t > reveal) return null;

  const span = width + SKEW_MARGIN * 2;
  const slatWidth = span / SLATS;
  const fillDuration = cover - (SLATS - 1) * STAGGER;
  const drainDuration = reveal - (SLATS - 1) * STAGGER;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: -SKEW_MARGIN,
          width: span,
          transform: "skewX(-14deg)",
        }}
      >
        {Array.from({ length: SLATS }, (_, i) => {
          const fill = progress(t, -cover + i * STAGGER, fillDuration, expoInOut);
          const drain = progress(t, i * STAGGER, drainDuration, expoInOut);
          const top = drain * height;
          const slatHeight = Math.max(0, fill * height - top);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: i * slatWidth - 0.5,
                width: slatWidth + 1,
                top,
                height: slatHeight,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
