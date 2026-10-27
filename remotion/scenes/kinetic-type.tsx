import type { ReactNode } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01, expoOut, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS } from "../lib/theme";
import { display, mono } from "../lib/type";

type Pose = { x: number; y: number; skew: number; scale: number; wdth: number; tracking: number };

type Palette = { fg: string; accent: string };

type KineticWord = {
  text: string;
  bg: string;
  fg: string;
  accent: string;
  note: string;
  pose: (t: number, fps: number) => Pose;
  letterY?: (t: number, i: number) => number;
  Detail: (props: Palette & { t: number }) => ReactNode;
};

const SIZE = 300;
const GHOSTS = 6;
const GHOST_STEP = 0.9;
const REST: Pose = { x: 0, y: 0, skew: 0, scale: 1, wdth: 96, tracking: 0 };

const Ruler = ({ t, fg, accent }: Palette & { t: number }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 44 }}>
    {Array.from({ length: BEAT }, (_, j) => {
      const lit = j <= t;
      return (
        <span
          key={j}
          style={{ width: 4, height: lit ? 44 : 18, backgroundColor: lit ? accent : fg, opacity: lit ? 1 : 0.3 }}
        />
      );
    })}
  </div>
);

const Tracking = ({ t, fg, accent }: Palette & { t: number }) => (
  <div style={{ display: "flex", gap: lerp(64, 10, progress(t, 0, 11)) }}>
    {Array.from({ length: 8 }, (_, j) => (
      <span key={j} style={{ width: 16, height: 44, backgroundColor: j === 7 ? accent : fg }} />
    ))}
  </div>
);

const Curve = ({ t, fg, accent }: Palette & { t: number }) => {
  const w = 260;
  const h = 96;
  const u = clamp01(t / 14);
  const x = u * w;
  const y = h - expoOut(u) * h;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path
        d={`M 0 ${h} C ${0.16 * w} 0 ${0.3 * w} 0 ${w} 0`}
        fill="none"
        stroke={fg}
        strokeOpacity={0.55}
        strokeWidth={3}
      />
      <line x1={x} x2={x} y1={0} y2={h} stroke={fg} strokeOpacity={0.25} strokeWidth={2} />
      <circle cx={x} cy={y} r={10} fill={accent} />
    </svg>
  );
};

const Meter = ({ t, fg, accent }: Palette & { t: number }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 72 }}>
    {Array.from({ length: 16 }, (_, j) => {
      const level = Math.abs(Math.sin((t / 7.5) * Math.PI + j * 0.7)) * (0.35 + random(`meter-${j}`) * 0.65);
      return (
        <span key={j} style={{ width: 14, height: 8 + level * 64, backgroundColor: j % 4 === 0 ? accent : fg }} />
      );
    })}
  </div>
);

const WORDS: KineticWord[] = [
  {
    text: "TIMING.",
    bg: COLORS.bone,
    fg: COLORS.ink,
    accent: COLORS.signal,
    note: "6 FRAMES · HARD STOP",
    pose: (t) => {
      const p = progress(t, 0, 6);
      return {
        ...REST,
        x: lerp(1900, 0, p),
        skew: lerp(-34, 0, p),
        scale: 1 + Math.max(0, t) * 0.0025,
        wdth: lerp(125, 92, p),
      };
    },
    Detail: Ruler,
  },
  {
    text: "SPACING.",
    bg: COLORS.signal,
    fg: COLORS.ink,
    accent: COLORS.bone,
    note: "TRACKING +0.50 → −0.02 EM",
    pose: (t) => {
      const p = progress(t, 0, 11);
      return { ...REST, y: lerp(-760, 0, progress(t, 0, 7)), wdth: lerp(62, 84, p), tracking: lerp(0.5, -0.02, p) };
    },
    Detail: Tracking,
  },
  {
    text: "EASING.",
    bg: COLORS.ink,
    fg: COLORS.bone,
    accent: COLORS.signal,
    note: "CUBIC-BEZIER(.16, 1, .3, 1)",
    pose: (t) => {
      const p = progress(t, 0, 14);
      return { ...REST, x: lerp(-1900, 0, p), skew: lerp(30, 0, p), wdth: lerp(125, 96, p) };
    },
    Detail: Curve,
  },
  {
    text: "RHYTHM.",
    bg: COLORS.cobalt,
    fg: COLORS.bone,
    accent: COLORS.signal,
    note: "120 BPM · 8TH-NOTE BOUNCE",
    pose: (t, fps) => {
      const s = pop(t, fps);
      return { ...REST, scale: lerp(3.2, 1, s), wdth: lerp(125, 100, s) };
    },
    letterY: (t, i) => -Math.abs(Math.sin((t / 7.5) * Math.PI + i * 0.55)) * 44 * progress(t, 2, 5),
    Detail: Meter,
  },
];

const distance = (a: Pose, b: Pose) =>
  Math.abs(a.x - b.x) +
  Math.abs(a.y - b.y) +
  Math.abs(a.scale - b.scale) * 600 +
  Math.abs(a.tracking - b.tracking) * 900;

const WordLayer = ({
  word,
  pose,
  t,
  color,
  opacity = 1,
}: {
  word: KineticWord;
  pose: Pose;
  t: number;
  color: string;
  opacity?: number;
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity }}>
    <div
      style={{
        ...display(SIZE, pose.wdth, 900, { color, lineHeight: 1 }),
        display: "flex",
        transform: `translate(${pose.x}px, ${pose.y}px) skewX(${pose.skew}deg) scale(${pose.scale})`,
      }}
    >
      {Array.from(word.text).map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginLeft: i === 0 ? 0 : pose.tracking * SIZE,
            transform: word.letterY ? `translateY(${word.letterY(t, i)}px)` : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  </AbsoluteFill>
);

/** 105–165: one word per beat on a flipping background, each word demonstrating itself, with ghost-copy motion blur. */
export const KineticType = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const index = Math.min(WORDS.length - 1, Math.floor(frame / BEAT));
  const word = WORDS[index];
  const t = frame - index * BEAT;
  const pose = word.pose(t, fps);

  const ghosts = Array.from({ length: GHOSTS }, (_, k) => {
    const ghostT = t - (k + 1) * GHOST_STEP;
    return { k, ghostT, pose: word.pose(ghostT, fps) };
  }).filter((ghost) => distance(ghost.pose, pose) > 2);

  const reveal = progress(t, 2, 5);

  return (
    <AbsoluteFill style={{ backgroundColor: word.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 540 - 320,
          transform: `translateX(${-120 - t * 38}px)`,
          ...display(640, 62, 900, {
            color: "transparent",
            WebkitTextStroke: `2px ${word.fg}`,
            opacity: 0.16,
            lineHeight: 1,
          }),
        }}
      >
        {`${word.text} ${word.text}`}
      </div>

      {ghosts
        .slice()
        .reverse()
        .map((ghost) => (
          <WordLayer
            key={ghost.k}
            word={word}
            pose={ghost.pose}
            t={ghost.ghostT}
            color={word.accent}
            opacity={0.55 * (1 - ghost.k / (GHOSTS + 1))}
          />
        ))}
      <WordLayer word={word} pose={pose} t={t} color={word.fg} />

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          bottom: 120,
          height: 96,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 24}px)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 420 }}>
          <span style={mono(15, { color: word.fg, opacity: 0.6 })}>{`WORD 0${index + 1} / 04`}</span>
          <span style={mono(20, { color: word.fg })}>{word.text.replace(".", "")}</span>
        </div>
        <word.Detail t={t} fg={word.fg} accent={word.accent} />
        <div style={{ display: "flex", justifyContent: "flex-end", width: 420 }}>
          <span style={mono(15, { color: word.fg, opacity: 0.8 })}>{word.note}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
