import type { CSSProperties } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { beatPulse, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS } from "../lib/theme";
import { Typed, display, mono } from "../lib/type";

const WORD = Array.from("MOTION DESIGNER");
const SUBTITLE = "SELECTED WORK 2024—2026";
const MONOGRAM = "KH";
const MONOGRAM_SIZE = 560;
const WORD_SIZE = 128;

const LayoutGrid = ({ frame, width, height }: { frame: number; width: number; height: number }) => {
  const size = width / 16;
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
      {Array.from({ length: 15 }, (_, i) => {
        const half = (height / 2) * progress(frame, Math.abs(i - 7) * 0.6, 12);
        const x = (i + 1) * size;
        return <line key={`v${i}`} x1={x} x2={x} y1={height / 2 - half} y2={height / 2 + half} stroke={COLORS.bone} />;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const half = (width / 2) * progress(frame, Math.abs(i - 3.5) * 0.6 + 2, 12);
        const y = (i + 1) * size;
        return <line key={`h${i}`} x1={width / 2 - half} x2={width / 2 + half} y1={y} y2={y} stroke={COLORS.bone} />;
      })}
    </svg>
  );
};

const Word = ({ frame }: { frame: number }) => (
  <div style={{ display: "flex", marginTop: 18 }}>
    {WORD.map((char, i) => {
      if (char === " ") return <span key={i} style={{ width: 40 }} />;
      const rise = progress(frame, 12 + i * 1.2, 14);
      const breathe = Math.sin(((frame - 12) / 60) * Math.PI * 2 - i * 0.42);
      return (
        <span key={i} style={{ display: "inline-block", overflow: "hidden", height: WORD_SIZE }}>
          <span
            style={{
              ...display(WORD_SIZE, 93.5 + 31.5 * breathe, 800, { lineHeight: 1 }),
              display: "inline-block",
              transform: `translateY(${(1 - rise) * 105}%)`,
            }}
          >
            {char}
          </span>
        </span>
      );
    })}
  </div>
);

const Subtitle = ({ frame }: { frame: number }) => {
  const reach = 220 * progress(frame, 30, 16);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 40 }}>
      <span style={{ width: reach, height: 2, backgroundColor: COLORS.signal }} />
      <Typed
        text={SUBTITLE}
        frame={frame}
        start={30}
        style={mono(24, { letterSpacing: "0.32em", marginRight: "-0.32em" })}
      />
      <span style={{ width: reach, height: 2, backgroundColor: COLORS.signal }} />
    </div>
  );
};

const Callout = ({ frame, start, lines, style }: { frame: number; start: number; lines: string[]; style: CSSProperties }) => (
  <div style={{ position: "absolute", display: "flex", gap: 14, opacity: progress(frame, start, 4), ...style }}>
    <span style={{ width: 9, height: 9, marginTop: 3, backgroundColor: COLORS.signal }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {lines.map((line, i) => (
        <Typed
          key={line}
          text={line}
          frame={frame}
          start={start + i * 3}
          perFrame={3}
          style={mono(15, { opacity: i === 0 ? 0.9 : 0.5 })}
        />
      ))}
    </div>
  </div>
);

/** 30–105: the boot dot pops, the "KH" monogram slams in with RGB-split ghosts, the subtitle letters rise and breathe. */
export const Title = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;

  const wave = progress(frame, 0, 16);
  const echo = progress(frame, 3, 18);
  const dotOpacity = 1 - progress(frame, 1, 4);

  const slam = pop(frame, fps, 2);
  const scale = lerp(2.6, 1, slam) * (1 + frame * 0.0007);
  const blur = Math.max(0, 1 - slam) * 16;
  const hit = frame >= BEAT ? beatPulse(frame, 1.6) : 0;
  const split = 6 + Math.max(0, 1 - slam) * 140 + hit * 28;
  const shake = frame >= 5 ? 16 * Math.exp(-(frame - 5) / 3) : 0;
  const shakeX = (random(`title-sx-${frame}`) - 0.5) * 2 * shake;
  const shakeY = (random(`title-sy-${frame}`) - 0.5) * 2 * shake;
  const beatIndex = Math.floor(frame / BEAT);
  const sliceTop = 12 + Math.floor(random(`title-slice-${beatIndex}`) * 66);
  const sliceShift = hit * 64 * (random(`title-dir-${beatIndex}`) > 0.5 ? 1 : -1);

  const monogram = display(MONOGRAM_SIZE, 125, 900, { lineHeight: 0.8, letterSpacing: "-0.03em" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <LayoutGrid frame={frame} width={width} height={height} />

      <div
        style={{
          position: "absolute",
          left: cx - 640,
          top: cy - 640,
          width: 1280,
          height: 1280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.signal}40 0%, transparent 62%)`,
          opacity: progress(frame, 2, 6) * (0.5 + hit * 0.5),
        }}
      />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle
          cx={cx}
          cy={cy}
          r={lerp(10, 1100, wave)}
          fill="none"
          stroke={COLORS.signal}
          strokeWidth={lerp(70, 0, wave)}
        />
        <circle cx={cx} cy={cy} r={lerp(10, 900, echo)} fill="none" stroke={COLORS.bone} strokeWidth={lerp(6, 0, echo)} />
        {dotOpacity > 0 ? (
          <circle cx={cx} cy={cy} r={lerp(10, 80, progress(frame, 0, 4))} fill={COLORS.signal} opacity={dotOpacity} />
        ) : null}
      </svg>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${shakeX}px, ${shakeY}px)`,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${scale})`,
            opacity: progress(frame, 2, 2),
            filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
          }}
        >
          <div style={{ ...monogram, color: COLORS.signal, position: "absolute", inset: 0, transform: `translateX(${-split}px)`, mixBlendMode: "screen" }}>
            {MONOGRAM}
          </div>
          <div style={{ ...monogram, color: COLORS.cobalt, position: "absolute", inset: 0, transform: `translateX(${split}px)`, mixBlendMode: "screen" }}>
            {MONOGRAM}
          </div>
          <div style={{ ...monogram, position: "relative" }}>{MONOGRAM}</div>
          {hit > 0.05 ? (
            <div
              style={{
                ...monogram,
                position: "absolute",
                inset: 0,
                clipPath: `inset(${sliceTop}% 0 ${100 - sliceTop - 9}% 0)`,
                transform: `translateX(${sliceShift}px)`,
              }}
            >
              {MONOGRAM}
            </div>
          ) : null}
        </div>
        <Word frame={frame} />
        <Subtitle frame={frame} />
      </AbsoluteFill>

      <Callout frame={frame} start={20} lines={["FIG. 01 — SLAM", "SPRING  k180 · c12 · m0.6"]} style={{ right: 120, top: 190 }} />
      <Callout frame={frame} start={26} lines={["FIG. 02 — BREATHE", "VAR AXIS  wdth 62—125"]} style={{ left: 120, bottom: 150 }} />
    </AbsoluteFill>
  );
};
