import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { expoIn, expoInOut, lerp, progress, tween } from "../lib/easing";
import { COLORS, LETTERBOX } from "../lib/theme";

const CLOSE_START = 435;

/** 2:1 cinema bars. On the last beat they close to black and end on a CRT-style line that shrinks to nothing. */
export const Letterbox = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const bar = lerp(LETTERBOX, height / 2 + 2, progress(frame, CLOSE_START, 11, expoInOut));
  const lineWidth = lerp(width, 0, progress(frame, CLOSE_START + 9, 5, expoIn));
  const lineOpacity = tween(frame, [CLOSE_START + 8, CLOSE_START + 10], [0, 1]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bar, backgroundColor: COLORS.ink }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bar, backgroundColor: COLORS.ink }} />
      {frame >= CLOSE_START + 8 && lineWidth > 0.5 ? (
        <div
          style={{
            position: "absolute",
            top: height / 2 - 2,
            left: (width - lineWidth) / 2,
            width: lineWidth,
            height: 4,
            borderRadius: 4,
            backgroundColor: COLORS.signal,
            opacity: lineOpacity,
            boxShadow: `0 0 24px ${COLORS.signal}`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
