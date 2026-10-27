import { noise3D } from "@remotion/noise";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FigCaption, StateList } from "../lib/caption";
import { expoIn, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS, VIDEO } from "../lib/theme";
import { mono } from "../lib/type";

const TAU = Math.PI * 2;
const COUNT = 300;
const PRE_ROLL = 12;
const LOCK = BEAT;
const FLOW_FRAMES = PRE_ROLL + LOCK + 2;
const FIELD_SCALE = 0.0016;
const SPIN_RATE = 0.02;
const TRAIL = 8;
const TRAIL_STEP = 0.75;
const RADII = [262, 290, 318];
const CX = VIDEO.width / 2;
const CY = VIDEO.height / 2;
const STATES = ["FLOW FIELD", "ATTRACTOR", "ROSE  k=5", "COLLAPSE"];

const TONES = { bone: COLORS.bone, signal: COLORS.signal, cobalt: COLORS.cobalt } as const;
type Tone = keyof typeof TONES;
const TONE_KEYS = Object.keys(TONES) as Tone[];

type Particle = { xs: Float64Array; ys: Float64Array; base: number; radius: number; tone: Tone };

/** Loose clockwise swirl around the center, bent by 3D simplex noise (x, y, time). */
const fieldAngle = (x: number, y: number, t: number) =>
  Math.atan2(y - CY, x - CX) +
  Math.PI / 2 +
  noise3D("reel-flow", x * FIELD_SCALE, y * FIELD_SCALE, t * 0.012) * 2.4;

let cache: Particle[] | null = null;

/**
 * Integrates the flow field once, deterministically, up to the lock frame (frames render out of order, so nothing can
 * accumulate between renders). Ring slots are assigned by each particle's angle at the lock, so the swarm gathers
 * radially instead of criss-crossing.
 */
const getParticles = () => {
  if (cache) return cache;
  const runs = Array.from({ length: COUNT }, (_, i) => {
    const xs = new Float64Array(FLOW_FRAMES);
    const ys = new Float64Array(FLOW_FRAMES);
    let x = -80 + random(`gen-x-${i}`) * (VIDEO.width + 160);
    let y = 70 + random(`gen-y-${i}`) * (VIDEO.height - 140);
    const speed = 7 + random(`gen-s-${i}`) * 8;
    for (let f = 0; f < FLOW_FRAMES; f++) {
      xs[f] = x;
      ys[f] = y;
      const a = fieldAngle(x, y, f - PRE_ROLL);
      x += Math.cos(a) * speed;
      y += Math.sin(a) * speed;
    }
    const roll = random(`gen-c-${i}`);
    const tone: Tone = roll < 0.14 ? "signal" : roll < 0.2 ? "cobalt" : "bone";
    const lockAngle = Math.atan2(ys[PRE_ROLL + LOCK] - CY, xs[PRE_ROLL + LOCK] - CX);
    return { xs, ys, tone, lockAngle };
  });
  const order = runs.map((_, i) => i).sort((a, b) => runs[a].lockAngle - runs[b].lockAngle);
  const particles = new Array<Particle>(COUNT);
  order.forEach((i, rank) => {
    particles[i] = {
      xs: runs[i].xs,
      ys: runs[i].ys,
      tone: runs[i].tone,
      base: -Math.PI + ((rank + 0.5) / COUNT) * TAU - LOCK * SPIN_RATE,
      radius: RADII[rank % RADII.length],
    };
  });
  cache = particles;
  return particles;
};

/** Everything shared by all particles at time `t`: lock-in, impact, rose petals (beat 2), inhale + collapse (beat 3). */
const ringState = (t: number, fps: number) => {
  const collapse = progress(t, 49, 10, expoIn);
  const impact = t >= LOCK ? Math.exp(-(t - LOCK) / 4) : 0;
  return {
    t,
    lock: progress(t, 2, LOCK - 2, expoIn),
    rose: 0.28 * pop(t, fps, 2 * BEAT),
    spin: t * SPIN_RATE + 0.8 * pop(t, fps, 2 * BEAT) + 3 * collapse * collapse,
    scale: (1 + 0.12 * impact) * (1 + 0.12 * progress(t, 3 * BEAT, 5)) * (1 - collapse),
  };
};

type RingState = ReturnType<typeof ringState>;

const positionAt = (p: Particle, s: RingState): readonly [number, number] => {
  const wobble = noise3D("reel-ring", Math.cos(p.base) * 1.4, Math.sin(p.base) * 1.4, s.t * 0.05) * 12;
  const r = (p.radius + wobble) * (1 + s.rose * Math.sin(5 * p.base)) * s.scale;
  const a = p.base + s.spin;
  const rx = CX + Math.cos(a) * r;
  const ry = CY + Math.sin(a) * r;
  if (s.lock >= 1) return [rx, ry];
  const fi = Math.min(FLOW_FRAMES - 1, Math.max(0, s.t + PRE_ROLL));
  const f0 = Math.floor(fi);
  const f1 = Math.min(FLOW_FRAMES - 1, f0 + 1);
  const u = fi - f0;
  return [lerp(lerp(p.xs[f0], p.xs[f1], u), rx, s.lock), lerp(lerp(p.ys[f0], p.ys[f1], u), ry, s.lock)];
};

const polyline = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y], k) => `${k === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");

/** Trails are the same particle sampled at earlier times; one tail path and one head path per color keeps the SVG small. */
const Swarm = ({ frame, fps }: { frame: number; fps: number }) => {
  const states = Array.from({ length: TRAIL }, (_, k) => ringState(frame - k * TRAIL_STEP, fps));
  const tails: Record<Tone, string[]> = { bone: [], signal: [], cobalt: [] };
  const heads: Record<Tone, string[]> = { bone: [], signal: [], cobalt: [] };
  for (const p of getParticles()) {
    const points = states.map((s) => positionAt(p, s));
    tails[p.tone].push(polyline(points));
    heads[p.tone].push(polyline(points.slice(0, 3)));
  }
  return (
    <>
      {TONE_KEYS.map((tone) => (
        <g key={tone} fill="none" stroke={TONES[tone]} strokeLinecap="round" strokeLinejoin="round">
          <path d={tails[tone].join("")} strokeWidth={1.6} strokeOpacity={0.38} />
          <path d={heads[tone].join("")} strokeWidth={3} />
        </g>
      ))}
    </>
  );
};

/** Debug-view glyphs of the field direction; they fade out as the swarm locks. */
const FieldGlyphs = ({ frame, lock }: { frame: number; lock: number }) => {
  const segments: string[] = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 28; col++) {
      const x = 68 + col * 66.4;
      const y = 112 + row * 71.3;
      const a = fieldAngle(x, y, frame);
      const dx = Math.cos(a) * 11;
      const dy = Math.sin(a) * 11;
      segments.push(`M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`);
    }
  }
  return (
    <path
      d={segments.join("")}
      fill="none"
      stroke={COLORS.bone}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeOpacity={0.2 * (1 - lock) * progress(frame, 0, 4)}
    />
  );
};

const Shockwave = ({
  frame,
  at,
  from,
  to,
  color,
  width,
  dash,
}: {
  frame: number;
  at: number;
  from: number;
  to: number;
  color: string;
  width: number;
  dash?: string;
}) => {
  if (frame < at || frame > at + 20) return null;
  const k = progress(frame, at, 20);
  return (
    <circle
      cx={CX}
      cy={CY}
      r={lerp(from, to, k)}
      fill="none"
      stroke={color}
      strokeWidth={width * (1 - k) + 0.5}
      strokeOpacity={1 - k}
      strokeDasharray={dash}
    />
  );
};

const Core = ({ frame }: { frame: number }) => {
  const shown = progress(frame, LOCK, 6);
  const core = progress(frame, 50, 9, expoIn);
  return (
    <>
      <path
        d={`M${CX - 14} ${CY}H${CX + 14}M${CX} ${CY - 14}V${CY + 14}`}
        stroke={COLORS.bone}
        strokeWidth={1.5}
        strokeOpacity={0.6 * shown * (1 - core)}
      />
      {core > 0 ? <circle cx={CX} cy={CY} r={4 + core * 40} fill={COLORS.signal} /> : null}
    </>
  );
};

/** 225–285: 300 particles in a noise3D flow field lock into a ring on the downbeat, bloom into a rose, then collapse. */
export const Generative = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const now = ringState(frame, fps);
  const active = Math.min(STATES.length - 1, Math.floor(frame / BEAT));
  const lockPct = String(Math.round(now.lock * 100)).padStart(3, " ");
  const radius = String(Math.round(RADII[1] * now.scale)).padStart(3, "0");

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <FieldGlyphs frame={frame} lock={now.lock} />
        <Shockwave frame={frame} at={LOCK} from={350} to={1050} color={COLORS.signal} width={6} />
        <Shockwave frame={frame} at={2 * BEAT} from={420} to={980} color={COLORS.bone} width={2.5} dash="6 12" />
        <Swarm frame={frame} fps={fps} />
        <Core frame={frame} />
      </svg>

      <FigCaption
        frame={frame}
        start={6}
        lines={["FIG. 04 — FLOW FIELD", "300 PTS · SIMPLEX 3D"]}
        style={{ left: 120, top: CY - 30 }}
      >
        <span style={mono(15, { opacity: 0.5 * progress(frame, 8, 4) })}>{`LOCK ${lockPct}%  R ${radius}`}</span>
      </FigCaption>
      <StateList frame={frame} start={8} items={STATES} active={active} style={{ right: 120, top: CY - 78 }} />
    </AbsoluteFill>
  );
};
