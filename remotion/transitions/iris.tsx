import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { expoIn, expoOut, lerp, progress } from "../lib/easing";
import { COLORS } from "../lib/theme";

/** Circular mask that closes to black exactly at `at` (global), then reopens from the center. */
export const Iris = ({ at, close = 10, open = 12 }: { at: number; close?: number; open?: number }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame - at;
  if (t < -close || t > open) return null;

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.hypot(cx, cy) + 40;
  const r =
    t < 0
      ? lerp(maxRadius, 0, progress(t, -close, close, expoIn))
      : lerp(0, maxRadius, progress(t, 0, open, expoOut));
  const hole =
    r > 0.5 ? `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 Z` : "";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height}>
        <path d={`M 0 0 H ${width} V ${height} H 0 Z ${hole}`} fill={COLORS.ink} fillRule="evenodd" />
        {r > 0.5 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.signal} strokeWidth={6} />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
