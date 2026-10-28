import { useId, type CSSProperties, type ReactNode } from "react";
import { AbsoluteFill, Easing, Freeze, random, useCurrentFrame } from "remotion";
import { expoIn, expoOut, lerp, progress } from "../lib/easing";
import { COLORS, DISPLAY_STACK, LETTERBOX, VIDEO, axes } from "../lib/theme";
import { mono } from "../lib/type";
import { FlashFrame } from "../transitions/flash";
import { DOT, LOCK_Y } from "./finale";
import { CLIPS, COLS, INNER, PICTURE_H, PICTURE_W, ROWS, STEP_X, STEP_Y, TILE_H, TILE_W } from "./montage";

export type KhFillMode = "clips" | "liquid" | "both";

/** Global frames the fill replaces: the montage's second half, the whip-pan and the finale's collapse. */
export const KH_FILL = { from: 360, duration: 30 } as const;

/* Local timeline, 0 = global 360 (impact + zap). Every hit is an existing soundtrack hit. */
const STROBE = 7; // 367: strobe ticks, the clips cut every 2 frames
const PUSH = 15; // 375: whip whoosh, the letters get shoved sideways
const FLOOD = 22; // 382: clips mode floods Signal
const SHRINK = 24; // 384: KH starts shrinking into the dot
const FULL = 26; // 386: the letters are full
const LAST = 29; // 389: a dot; the finale's seal pops from it at 390

const POUR_START: Record<KhFillMode, number | null> = { clips: null, liquid: 2, both: PUSH };

/*
 * Archivo at wdth 125 / wght 900, in font units (1000 per em): K advance 988 with ink x 74–968, H ink x 74–935,
 * caps 0–688, ascender 878, descender 210. Both glyphs are single contours, so a text stroke draws a clean outline.
 */
const SIZE = 908;
const EM = SIZE / 1000;
/** K's ink starts on the reel's 120 px margin, so H's ink ends at 1800. */
const LEFT = 120 - 74 * EM;
const BASE_Y = 843;
const CAP_Y = BASE_Y - 688 * EM;
/** Top of the line box: with line-height 1 the baseline sits 834 units below it. */
const TOP = BASE_Y - 834 * EM;
const CX = VIDEO.width / 2;
const CY = (BASE_Y + CAP_Y) / 2;
/** Middle of the gutter between K's ink (968) and H's ink (988 + 74). */
const GAP_X = LEFT + ((968 + 988 + 74) / 2) * EM;
const EMPTY_Y = BASE_Y + 30;
const BRIM_Y = CAP_Y - 48;

const DEEP = "#B83819";
const POUR = Easing.bezier(0.33, 0, 0.2, 1);
const quadIn = Easing.in(Easing.quad);
const SHOVE = 40;
const SPRING_W = (2 * Math.PI) / 9;

const SURFACE_XS = Array.from({ length: 78 }, (_, i) => 40 + i * 24);
const BUBBLES = Array.from({ length: 28 }, (_, i) => ({
  x: 150 + random(`kh-bubble-x-${i}`) * 1620,
  r: 4 + random(`kh-bubble-r-${i}`) * 9,
  speed: 14 + random(`kh-bubble-v-${i}`) * 16,
  born: random(`kh-bubble-b-${i}`),
  wobble: random(`kh-bubble-w-${i}`) * Math.PI * 2,
}));
const LINES = Array.from({ length: 36 }, (_, i) => ({
  angle: (i / 36) * Math.PI * 2 + (random(`kh-line-a-${i}`) - 0.5) * 0.15,
  start: 700 + random(`kh-line-r-${i}`) * 520,
  length: 120 + random(`kh-line-l-${i}`) * 240,
  signal: i % 4 === 0,
}));

const mod = (n: number, m: number) => ((n % m) + m) % m;

const polar = (r: number, angle: number) => ({ x: CX + Math.cos(angle) * r, y: LOCK_Y + Math.sin(angle) * r });

/** Wind-up to the right (370–375), then a snap left on the whoosh that springs back to rest by about 384. */
const shoveX = (frame: number) => {
  if (frame < PUSH) return SHOVE * progress(frame, PUSH - 5, 5, Easing.inOut(Easing.quad));
  const u = frame - PUSH;
  return Math.exp(-u / 3.2) * (SHOVE * Math.cos(SPRING_W * u) - 111 * Math.sin(SPRING_W * u));
};

/** Surface slope (positive = right side higher): the liquid lags the letters, so it leans left during the wind-up,
 * piles up on the right when they snap left, then sloshes out. */
const slosh = (frame: number) => {
  if (frame < PUSH) return -0.03 * Math.sin(Math.PI * progress(frame, PUSH - 5, 5, Easing.linear));
  const u = frame - PUSH;
  return 0.085 * Math.exp(-u / 6) * Math.cos((2 * Math.PI * u) / 11);
};

const surfaceY = (x: number, frame: number, level: number, phase = 0) => {
  const agitation = frame < PUSH ? 1 : 1 + 1.4 * Math.exp(-(frame - PUSH) / 5);
  const waves =
    9 * Math.sin(x * 0.0105 - frame * 0.62 + phase) +
    5 * Math.sin(x * 0.023 + frame * 0.95 + 1.3 + phase) +
    3 * Math.sin(x * 0.041 - frame * 1.4 + 0.4 + phase * 2);
  return level - slosh(frame) * (x - CX) + agitation * waves;
};

const fillLevel = (frame: number, start: number) => {
  const fill = progress(frame, start, FULL - start, POUR);
  return { fill, level: lerp(EMPTY_Y, BRIM_Y, fill) };
};

const surfacePath = (frame: number, level: number, phase: number) =>
  `M ${SURFACE_XS.map((x) => `${x} ${surfaceY(x, frame, level, phase).toFixed(1)}`).join(" L ")}`;

const CLOSE_PATH = ` L ${SURFACE_XS[SURFACE_XS.length - 1]} 1200 L ${SURFACE_XS[0]} 1200 Z`;

const KhText = ({ style }: { style: CSSProperties }) => (
  <div
    style={{
      position: "absolute",
      left: LEFT,
      top: TOP,
      fontFamily: DISPLAY_STACK,
      fontSize: SIZE,
      fontVariationSettings: axes(125, 900),
      fontKerning: "none",
      lineHeight: 1,
      whiteSpace: "pre",
      ...style,
    }}
  >
    KH
  </div>
);

/** A full-frame layer that moves with the letters (camera pull-back, push, shrink). */
const LetterSpace = ({ transform, style, children }: { transform: string; style?: CSSProperties; children: ReactNode }) => (
  <AbsoluteFill style={{ transform, transformOrigin: `${CX}px ${CY}px`, ...style }}>{children}</AbsoluteFill>
);

/** The reel's own clips on the montage's 3×3 grid, seen through the letters. Parallax: it pulls back and shoves less. */
const ClipWall = ({
  frame,
  mode,
  pull,
  shove,
  smearId,
}: {
  frame: number;
  mode: KhFillMode;
  pull: number;
  shove: number;
  smearId: string;
}) => {
  const holding = mode === "both" && frame >= PUSH;
  const strobing = frame >= STROBE && !holding;
  const step = holding ? 1 + Math.ceil((PUSH - STROBE) / 2) : strobing ? 1 + Math.floor((frame - STROBE) / 2) : 0;
  const since = holding ? frame - PUSH : strobing ? (frame - STROBE) % 2 : frame;
  const smear = 36 * (progress(frame, PUSH - 3, 3, expoIn) - progress(frame, PUSH, 5, expoOut));

  const tiles: ReactNode[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const clip = CLIPS[mod(row * 3 + col * 2 + step * 7 + 3, CLIPS.length)];
      const { Scene } = clip;
      tiles.push(
        <div
          key={`${row}:${col}`}
          style={{
            position: "absolute",
            left: col * STEP_X,
            top: row * STEP_Y,
            width: TILE_W,
            height: TILE_H,
            overflow: "hidden",
            backgroundColor: COLORS.ink,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: TILE_W / 2 - (VIDEO.width / 2) * INNER,
              top: TILE_H / 2 - (VIDEO.height / 2) * INNER,
              width: VIDEO.width,
              height: VIDEO.height,
              transform: `scale(${INNER})`,
              transformOrigin: "0 0",
            }}
          >
            <Freeze frame={clip.frame + since}>
              <Scene />
            </Freeze>
          </div>
          {since === 0 && step > 0 ? (
            <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.bone, opacity: 0.2 }} />
          ) : null}
        </div>,
      );
    }
  }

  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
        <filter id={smearId} x="-10%" y="0%" width="120%" height="100%">
          <feGaussianBlur stdDeviation={`${smear.toFixed(1)} 0`} />
        </filter>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: LETTERBOX,
          width: PICTURE_W,
          height: PICTURE_H,
          transform: `translateX(${(shove * 0.35).toFixed(2)}px) scale(${lerp(1.5, 1, pull)}) rotate(${lerp(-3, 0, pull)}deg)`,
          filter: smear > 0.5 ? `url(#${smearId})` : undefined,
        }}
      >
        {tiles}
      </div>
    </>
  );
};

/** Signal liquid in letter space: a darker back wave, the front wave with a Bone meniscus, and rising bubbles. */
const Liquid = ({ frame, start }: { frame: number; start: number }) => {
  if (frame < start) return null;
  const { level } = fillLevel(frame, start);
  const front = surfacePath(frame, level, 0);

  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={surfacePath(frame, level - 14, 2.1) + CLOSE_PATH} fill={DEEP} />
      <path d={front + CLOSE_PATH} fill={COLORS.signal} />
      <path d={front} fill="none" stroke={COLORS.bone} strokeOpacity={0.5} strokeWidth={4} strokeLinejoin="round" />
      {BUBBLES.map((bubble, i) => {
        const born = start + bubble.born * (FULL - start);
        if (frame < born) return null;
        const x = bubble.x + 6 * Math.sin(frame * 0.7 + bubble.wobble);
        const y = BASE_Y + 24 - bubble.speed * (frame - born);
        if (y - bubble.r < surfaceY(x, frame, level) + 4) return null;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={bubble.r}
            fill={COLORS.bone}
            fillOpacity={0.14}
            stroke={COLORS.bone}
            strokeOpacity={0.5}
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
};

/** Faint measuring marks every 10 % of the cap height, like a graduated glass (liquid mode only). */
const Graduations = () => (
  <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 9 }, (_, i) => {
      const y = lerp(BASE_Y, CAP_Y, (i + 1) / 10);
      return (
        <line key={i} x1={0} x2={VIDEO.width} y1={y} y2={y} stroke={COLORS.bone} strokeOpacity={i === 4 ? 0.2 : 0.09} strokeWidth={2} />
      );
    })}
  </svg>
);

/** Fill % in the gutter between K and H, riding the surface. */
const Readout = ({ frame, start, transform }: { frame: number; start: number; transform: string }) => {
  if (frame < start) return null;
  const { fill, level } = fillLevel(frame, start);
  const y = Math.min(BASE_Y, Math.max(CAP_Y, surfaceY(GAP_X, frame, level)));

  return (
    <LetterSpace transform={transform} style={{ opacity: 1 - progress(frame, SHRINK, 2) }}>
      <div style={{ position: "absolute", left: GAP_X - 26, top: y - 1.5, width: 52, height: 3, backgroundColor: COLORS.signal }} />
      <div
        style={mono(18, {
          position: "absolute",
          left: GAP_X - 60,
          top: y - 32,
          width: 120,
          textAlign: "center",
          letterSpacing: "0.12em",
        })}
      >
        {`${String(Math.round(fill * 100)).padStart(3, "0")}%`}
      </div>
    </LetterSpace>
  );
};

/** 384–389: speed lines and a Signal ring converge on the dot the finale's seal pops from. */
const Implode = ({ frame }: { frame: number }) => {
  if (frame < SHRINK) return null;
  const t = progress(frame, SHRINK, LAST - SHRINK, expoIn);

  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{ position: "absolute", inset: 0 }}>
      {LINES.map((line, i) => {
        const inner = lerp(line.start, 0, t);
        const a = polar(inner, line.angle);
        const b = polar(inner + line.length * (1 - 0.9 * t), line.angle);
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={line.signal ? COLORS.signal : COLORS.bone}
            strokeWidth={line.signal ? 4 : 2.5}
            strokeLinecap="round"
            opacity={0.8 * (1 - t ** 6)}
          />
        );
      })}
      <circle cx={CX} cy={LOCK_Y} r={lerp(1150, DOT, t)} fill="none" stroke={COLORS.signal} strokeWidth={lerp(2, 18, t)} />
      <circle cx={CX} cy={LOCK_Y} r={lerp(3, DOT, progress(frame, LAST - 2, 2))} fill={COLORS.signal} opacity={progress(frame, LAST - 3, 2)} />
    </svg>
  );
};

/**
 * 360–390 (follow-up 4 demo): a Signal flash cuts to a giant "KH" stencil over the montage's clip wall. The camera
 * pulls back, the clips strobe, the letters get shoved on the whoosh while Signal liquid sloshes up inside them,
 * then KH shrinks into the dot the finale's seal pops from. The mask is plain CSS blending: white KH on black
 * multiplied over the content, then Ink lightened in, so outside the letters is exactly Ink.
 */
export const KhFill = ({ mode }: { mode: KhFillMode }) => {
  const frame = useCurrentFrame();
  const smearId = `kh-fill-smear-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const pourStart = POUR_START[mode];

  const pull = progress(frame, 0, 12, expoOut);
  const shove = shoveX(frame);
  const shrink = progress(frame, SHRINK, LAST - SHRINK, expoIn);
  const scale = lerp(2.4, 1, pull) * lerp(1, 0.015, shrink);
  const letters = `translate(${shove.toFixed(2)}px, ${lerp(0, LOCK_Y - CY, shrink).toFixed(2)}px) rotate(${lerp(-6, 0, pull).toFixed(3)}deg) scale(${scale.toFixed(4)})`;
  const outline = (mode === "liquid" ? 1 : 0.6) * (1 - progress(frame, SHRINK, 3));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ isolation: "isolate", backgroundColor: COLORS.ink }}>
        {mode === "liquid" ? null : <ClipWall frame={frame} mode={mode} pull={pull} shove={shove} smearId={smearId} />}
        {mode === "clips" ? (
          <AbsoluteFill style={{ backgroundColor: COLORS.signal, opacity: progress(frame, FLOOD, FULL - FLOOD, quadIn) }} />
        ) : null}
        {pourStart === null ? null : (
          <LetterSpace transform={letters}>
            <Liquid frame={frame} start={pourStart} />
            {mode === "liquid" ? <Graduations /> : null}
          </LetterSpace>
        )}
        <AbsoluteFill style={{ backgroundColor: "#000", mixBlendMode: "multiply" }}>
          <LetterSpace transform={letters}>
            <KhText style={{ color: "#fff" }} />
          </LetterSpace>
        </AbsoluteFill>
        <AbsoluteFill style={{ backgroundColor: COLORS.ink, mixBlendMode: "lighten" }} />
      </AbsoluteFill>

      {outline > 0.01 ? (
        <LetterSpace transform={letters} style={{ opacity: outline }}>
          <KhText style={{ color: "transparent", WebkitTextStroke: `3px ${COLORS.bone}` }} />
        </LetterSpace>
      ) : null}
      {pourStart === null ? null : <Readout frame={frame} start={pourStart} transform={letters} />}
      <Implode frame={frame} />
      <FlashFrame at={0} color={COLORS.signal} />
    </AbsoluteFill>
  );
};
