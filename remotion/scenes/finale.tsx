import { useId } from "react";
import { AbsoluteFill, Easing, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FigCaption } from "../lib/caption";
import { beatPulse, expoIn, expoOut, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS, LETTERBOX, MONO_STACK } from "../lib/theme";
import { Typed, display, mono } from "../lib/type";

const POP = BEAT;
const SUB = BEAT * 2;
/** Downbeat of the last bar (global 420). */
const HIRE = BEAT * 3;

/** Lockup center; sits a little above the picture center so the pill row below balances it. */
const LOCK_Y = 484;
const CIRCLE = 320;
const DOT = 12;
const RING_R = 214;
const RING_SIZE = 15;
const RING_TEXT = "MOTION DESIGN REEL 2026 — SELECTED WORK 2024—2026 — ".repeat(2);
const RING_SPACING = (2 * Math.PI * RING_R) / RING_TEXT.length - RING_SIZE * 0.6;
const TICKS = 72;
const WALL_COLORS = [COLORS.bone, COLORS.signal, COLORS.ink, COLORS.cobalt];
const quadIn = Easing.in(Easing.quad);

const LINES = Array.from({ length: 48 }, (_, i) => ({
  angle: (i / 48) * Math.PI * 2 + (random(`finale-a-${i}`) - 0.5) * 0.12,
  start: 640 + random(`finale-r-${i}`) * 640,
  delay: random(`finale-d-${i}`) * 4,
  length: 120 + random(`finale-l-${i}`) * 280,
  signal: i % 6 === 0,
}));

const CREDITS = [
  ["DIRECTION", "v0"],
  ["DESIGN", "v0"],
  ["MOTION", "v0"],
  ["CODE", "REMOTION 4.0"],
] as const;
const ROLE_WIDTH = Math.max(...CREDITS.map(([role]) => role.length)) + 2;

const polar = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + Math.cos(angle) * r,
  y: cy + Math.sin(angle) * r,
});

/** 0–15: the montage wall, speed lines and a Signal ring all get sucked into a single dot at the lockup center. */
const Collapse = ({ frame, width, height }: { frame: number; width: number; height: number }) => {
  if (frame > POP) return null;
  const cx = width / 2;
  const squeeze = progress(frame, 0, POP - 1, quadIn);
  const ring = progress(frame, 0, POP - 1, expoIn);
  const pictureH = height - LETTERBOX * 2;
  const tileW = (width - 20) / 3;
  const tileH = (pictureH - 20) / 3;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: LETTERBOX,
          width,
          height: pictureH,
          transformOrigin: `${cx}px ${LOCK_Y - LETTERBOX}px`,
          transform: `scale(${Math.max(0.001, 0.9 * (1 - squeeze))}) rotate(${lerp(-12, 150, squeeze)}deg)`,
          opacity: 1 - progress(frame, POP - 3, 3),
        }}
      >
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: col * (tileW + 10),
                top: row * (tileH + 10),
                width: tileW,
                height: tileH,
                backgroundColor: WALL_COLORS[(row + col) % 4],
                boxShadow: `inset 0 0 0 3px ${COLORS.bone}66`,
              }}
            />
          );
        })}
      </div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {LINES.map((line, i) => {
          const t = progress(frame, line.delay, POP - 1 - line.delay, expoIn);
          const inner = lerp(line.start, 0, t);
          const a = polar(cx, LOCK_Y, inner, line.angle);
          const b = polar(cx, LOCK_Y, inner + line.length * (1 - 0.9 * t), line.angle);
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
              opacity={0.75 * (1 - t ** 6)}
            />
          );
        })}
        <circle cx={cx} cy={LOCK_Y} r={lerp(1150, DOT, ring)} fill="none" stroke={COLORS.signal} strokeWidth={lerp(2, 18, ring)} />
        <circle cx={cx} cy={LOCK_Y} r={lerp(3, DOT, progress(frame, 8, 6))} fill={COLORS.signal} opacity={progress(frame, 6, 3)} />
      </svg>
    </>
  );
};

/** Dial, rotating ring type and orbit rings around the lockup circle. */
const Rings = ({ frame, fps, cx, uid }: { frame: number; fps: number; cx: number; uid: string }) => {
  const since = frame - POP;
  const kick = [SUB, HIRE, HIRE + BEAT].reduce((sum, beat) => sum + pop(frame, fps, beat) * 14, 0);
  const ringReveal = progress(frame, POP + 4, 20);
  const dialReveal = progress(frame, POP + 2, 16);
  const orbit = progress(frame, POP, 20);
  const circumference = 2 * Math.PI * RING_R;
  const sweep = (since * 6 * Math.PI) / 180 - Math.PI / 2;
  const hand = [polar(cx, LOCK_Y, 236, sweep), polar(cx, LOCK_Y, 270, sweep)];

  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <path
          id={`${uid}-ring`}
          d={`M ${cx} ${LOCK_Y - RING_R} a ${RING_R} ${RING_R} 0 1 1 0 ${2 * RING_R} a ${RING_R} ${RING_R} 0 1 1 0 ${-2 * RING_R}`}
        />
        <mask id={`${uid}-reveal`}>
          <circle
            cx={cx}
            cy={LOCK_Y}
            r={RING_R + 6}
            fill="none"
            stroke="#fff"
            strokeWidth={56}
            strokeDasharray={circumference + 60}
            strokeDashoffset={(1 - ringReveal) * (circumference + 60)}
            transform={`rotate(-90 ${cx} ${LOCK_Y})`}
          />
        </mask>
      </defs>

      <g opacity={orbit} transform={`translate(${cx} ${LOCK_Y}) scale(${lerp(0.82, 1, orbit)})`}>
        <circle r={300} fill="none" stroke={COLORS.bone} strokeOpacity={0.2} strokeWidth={1.5} strokeDasharray="3 9" transform={`rotate(${since * 0.4})`} />
        <circle r={420} fill="none" stroke={COLORS.bone} strokeOpacity={0.08} strokeWidth={1} />
        <circle r={560} fill="none" stroke={COLORS.bone} strokeOpacity={0.14} strokeWidth={1.5} strokeDasharray="1 13" transform={`rotate(${-since * 0.25})`} />
      </g>

      <g transform={`rotate(${-since * 0.3 - kick * 0.6} ${cx} ${LOCK_Y})`}>
        {Array.from({ length: TICKS }, (_, i) => {
          if (i / TICKS >= dialReveal) return null;
          const major = i % 6 === 0;
          const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const a = polar(cx, LOCK_Y, major ? 244 : 252, angle);
          const b = polar(cx, LOCK_Y, 262, angle);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={COLORS.bone}
              strokeOpacity={major ? 0.6 : 0.28}
              strokeWidth={major ? 2 : 1.5}
            />
          );
        })}
      </g>
      {dialReveal > 0.2 ? (
        <line x1={hand[0].x} y1={hand[0].y} x2={hand[1].x} y2={hand[1].y} stroke={COLORS.signal} strokeWidth={3} strokeLinecap="round" />
      ) : null}

      <g transform={`rotate(${since * 0.5 + kick} ${cx} ${LOCK_Y})`} mask={`url(#${uid}-reveal)`}>
        <text
          fill={COLORS.bone}
          fillOpacity={0.85}
          style={{ fontFamily: MONO_STACK, fontSize: RING_SIZE, fontVariationSettings: "'wght' 500", letterSpacing: RING_SPACING }}
        >
          <textPath href={`#${uid}-ring`}>{RING_TEXT}</textPath>
        </text>
      </g>
    </svg>
  );
};

const HirePill = ({ frame, fps }: { frame: number; fps: number }) => {
  if (frame < HIRE) return null;
  const grow = pop(frame, fps, HIRE);
  const fill = 1 - progress(frame, HIRE, 8);
  const blinkOn = (frame - HIRE) % BEAT < 8;
  const inverted = fill > 0.5;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 30px 16px 24px",
        border: `2px solid ${COLORS.signal}`,
        borderRadius: 999,
        backgroundColor: COLORS.ink,
        overflow: "hidden",
        transform: `scale(${lerp(0.4, 1, grow)})`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundColor: COLORS.signal, opacity: fill }} />
      <span
        style={{
          position: "relative",
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: inverted ? COLORS.ink : COLORS.signal,
          opacity: blinkOn ? 1 : 0.15,
          boxShadow: blinkOn && !inverted ? `0 0 16px ${COLORS.signal}` : undefined,
        }}
      />
      <span
        style={mono(20, {
          position: "relative",
          letterSpacing: "0.24em",
          marginRight: "-0.24em",
          color: inverted ? COLORS.ink : COLORS.bone,
        })}
      >
        AVAILABLE FOR HIRE
      </span>
    </div>
  );
};

/**
 * 375–450: everything collapses into a dot that pops into the Signal "v0" seal (390), the ring type and dial wind
 * on, captions and credits type in (405), the hire pill lands on the last downbeat (420) and the letterbox closes.
 */
export const Finale = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const uid = `finale-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const cx = width / 2;

  const popped = frame >= POP;
  const grow = pop(frame, fps, POP);
  const hit = frame >= SUB ? beatPulse(frame, 2.4) : 0;
  const circleScale = popped ? lerp(DOT / (CIRCLE / 2), 1, grow) * (1 + 0.045 * hit) : 0;

  const wave = progress(frame, POP, 18);
  const echo = progress(frame, POP + 3, 20);
  const shake = popped ? 12 * Math.exp(-(frame - POP) / 3) : 0;
  const shakeX = (random(`finale-sx-${frame}`) - 0.5) * 2 * shake;
  const shakeY = (random(`finale-sy-${frame}`) - 0.5) * 2 * shake;
  const pushIn = 1 + 0.06 * progress(frame, 52, 20, expoIn);

  const rise = progress(frame, POP + 2, 12);
  const stretch = progress(frame, POP + 3, 16);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Collapse frame={frame} width={width} height={height} />

      {popped ? (
        <AbsoluteFill
          style={{
            transformOrigin: `${cx}px ${LOCK_Y}px`,
            transform: `translate(${shakeX}px, ${shakeY}px) scale(${pushIn})`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: cx - 640,
              top: LOCK_Y - 640,
              width: 1280,
              height: 1280,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${COLORS.signal}38 0%, transparent 60%)`,
              opacity: progress(frame, POP, 6) * (0.55 + 0.45 * hit),
            }}
          />

          <Rings frame={frame} fps={fps} cx={cx} uid={uid} />

          <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
            <circle cx={cx} cy={LOCK_Y} r={lerp(CIRCLE / 2, 1150, wave)} fill="none" stroke={COLORS.bone} strokeWidth={lerp(30, 0, wave)} />
            <circle cx={cx} cy={LOCK_Y} r={lerp(CIRCLE / 2, 950, echo)} fill="none" stroke={COLORS.signal} strokeWidth={lerp(8, 0, echo)} />
          </svg>

          <div
            style={{
              position: "absolute",
              left: cx - CIRCLE / 2,
              top: LOCK_Y - CIRCLE / 2,
              width: CIRCLE,
              height: CIRCLE,
              borderRadius: "50%",
              backgroundColor: COLORS.signal,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${circleScale})`,
              boxShadow: `0 0 ${60 + 50 * hit}px ${COLORS.signal}66`,
            }}
          >
            <span
              style={{
                ...display(156, lerp(62, 125, stretch), 900, { color: COLORS.ink, lineHeight: 1, letterSpacing: "-0.02em" }),
                display: "inline-block",
                transform: `translateY(${(1 - rise) * 120}%)`,
              }}
            >
              v0
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: LOCK_Y + 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 36,
            }}
          >
            <HirePill frame={frame} fps={fps} />
            {frame >= HIRE ? (
              <Typed text="→ v0.app" frame={frame} start={HIRE + 4} perFrame={1.5} style={mono(20, { letterSpacing: "0.2em" })} />
            ) : null}
          </div>
        </AbsoluteFill>
      ) : null}

      <FigCaption frame={frame} start={SUB} lines={["FIG. 07 — END CARD", "THANKS FOR WATCHING"]} style={{ left: 120, top: LOCK_Y - 19 }} />

      <div
        style={{
          position: "absolute",
          right: 120,
          top: LOCK_Y - 51,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          opacity: progress(frame, SUB + 2, 6, expoOut),
        }}
      >
        {CREDITS.map(([role, name], i) => {
          const start = SUB + 2 + i * 3;
          return (
            <div key={role} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 9, height: 9, backgroundColor: COLORS.signal, opacity: progress(frame, start, 3) }} />
              <Typed text={role.padEnd(ROLE_WIDTH)} frame={frame} start={start} perFrame={3} style={mono(15, { opacity: 0.45 })} />
              <Typed text={name} frame={frame} start={start + 3} perFrame={3} style={mono(15, { opacity: 0.95 })} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
