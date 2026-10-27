import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { expoIn, lerp, progress } from "../lib/easing";
import { COLORS } from "../lib/theme";
import { mono } from "../lib/type";

const LOG = [
  "[OK] ARCHIVO VARIABLE  wdth 62—125  wght 100—900",
  "[OK] TEMPO 120 BPM  ·  15 FRAMES PER BEAT",
  "[OK] PALETTE  INK · BONE · SIGNAL · COBALT",
];

/**
 * 0–30: a Signal line draws edge to edge under the creator credit (overlays/credit.tsx) while the reel "loads",
 * then collapses into the dot the title pops from.
 */
export const Boot = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cy = height / 2;

  const draw = progress(frame, 2, 12);
  const drawing = frame < 19;
  const collapse = progress(frame, 19, 10, expoIn);
  const dotSize = lerp(4, 20, progress(frame, 23, 6, expoIn));
  const linePath = `M 0 ${cy} L ${width} ${cy}`;
  const { strokeDasharray, strokeDashoffset } = evolvePath(draw, linePath);

  const textOpacity = 1 - progress(frame, 18, 6);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 14px ${COLORS.signal})` }}
      >
        {drawing ? (
          <path
            d={linePath}
            fill="none"
            stroke={COLORS.signal}
            strokeWidth={4}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
          />
        ) : (
          <line
            x1={lerp(0, width / 2, collapse)}
            x2={lerp(width, width / 2, collapse)}
            y1={cy}
            y2={cy}
            stroke={COLORS.signal}
            strokeWidth={dotSize}
            strokeLinecap="round"
          />
        )}
      </svg>

      {drawing && draw > 0 && draw < 0.99 ? (
        <div
          style={{
            position: "absolute",
            left: draw * width - 1,
            top: cy - 26,
            width: 2,
            height: 52,
            backgroundColor: COLORS.bone,
          }}
        />
      ) : null}

      <span
        style={{
          ...mono(22, { letterSpacing: "0.2em" }),
          position: "absolute",
          right: 120,
          top: cy + 40,
          opacity: textOpacity,
        }}
      >
        {String(Math.round(draw * 100)).padStart(3, "0")}%
      </span>

      <div
        style={{
          position: "absolute",
          left: 120,
          top: cy + 40,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: textOpacity * 0.55,
        }}
      >
        {LOG.map((line, i) => (
          <span key={line} style={mono(15, { letterSpacing: "0.12em" })}>
            {line.slice(0, Math.max(0, Math.floor((frame - 7 - i * 3) * 8)))}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
