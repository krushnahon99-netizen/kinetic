import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FigCaption, StateList } from "../lib/caption";
import { beatPulse, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS } from "../lib/theme";

type Pt = readonly [number, number];

const POINTS = 120;
const NAMES = ["CIRCLE", "SQUARE", "TRIANGLE", "STAR"];
const MORPHS = [1, 2, 3];

const angleAt = (k: number) => -Math.PI / 2 + (k / POINTS) * Math.PI * 2;

const polygon = (count: number, radius: (i: number) => number, offset = 0): Pt[] =>
  Array.from({ length: count }, (_, i) => {
    const a = -Math.PI / 2 + offset + (i / count) * Math.PI * 2;
    return [Math.cos(a) * radius(i), Math.sin(a) * radius(i)] as const;
  });

/** Distance from the origin to the polygon outline along angle `a` (polygons here are star-shaped around the origin). */
const rayHit = (poly: Pt[], a: number) => {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const ex = bx - ax;
    const ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (ax * ey - ay * ex) / den;
    const u = (ax * dy - ay * dx) / den;
    if (t > 0 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, t);
  }
  return best;
};

const sample = (poly: Pt[]) => Array.from({ length: POINTS }, (_, k) => rayHit(poly, angleAt(k)));

/** Every shape is sampled at the same 120 angles, so morphing is a per-point radius lerp with no point-matching artifacts. */
const SHAPES = [
  Array.from({ length: POINTS }, () => 250),
  sample(polygon(4, () => 320, Math.PI / 4)),
  sample(polygon(3, () => 330)),
  sample(polygon(10, (i) => (i % 2 === 0 ? 340 : 140))),
];

const radiiAt = (frame: number, fps: number) => {
  const mix = MORPHS.map((s) => pop(frame, fps, s * BEAT));
  return SHAPES[0].map((r0, k) => {
    let r = r0;
    for (let s = 1; s < SHAPES.length; s++) r = lerp(r, SHAPES[s][k], mix[s - 1]);
    return r;
  });
};

const rotationAt = (frame: number, fps: number) =>
  frame * 0.5 + MORPHS.reduce((sum, s) => sum + 90 * pop(frame, fps, s * BEAT), 0);

const scaleAt = (frame: number, fps: number) => pop(frame, fps) * (1 + 0.06 * beatPulse(frame));

const shapePath = (frame: number, fps: number, cx: number, cy: number) => {
  const radii = radiiAt(frame, fps);
  const scale = scaleAt(frame, fps);
  const rot = (rotationAt(frame, fps) * Math.PI) / 180;
  return `${radii
    .map((r, k) => {
      const a = angleAt(k) + rot;
      return `${k === 0 ? "M" : "L"} ${(cx + Math.cos(a) * r * scale).toFixed(1)} ${(cy + Math.sin(a) * r * scale).toFixed(1)}`;
    })
    .join(" ")} Z`;
};

const ORBITS = [
  { rx: 600, ry: 140, tilt: -16, speed: 0.07, phase: 0.4, size: 14, color: COLORS.bone, kind: "dot" },
  { rx: 480, ry: 230, tilt: 24, speed: -0.055, phase: 2.2, size: 22, color: COLORS.cobalt, kind: "square" },
  { rx: 690, ry: 110, tilt: 5, speed: 0.045, phase: 4.1, size: 20, color: COLORS.signal, kind: "ring" },
] as const;

const Satellites = ({ frame, cx, cy, front }: { frame: number; cx: number; cy: number; front: boolean }) => (
  <>
    {ORBITS.map((orbit, i) => {
      const theta = orbit.phase + frame * orbit.speed;
      if (Math.sin(theta) > 0 !== front) return null;
      const tilt = (orbit.tilt * Math.PI) / 180;
      const lx = Math.cos(theta) * orbit.rx;
      const ly = Math.sin(theta) * orbit.ry;
      const x = cx + lx * Math.cos(tilt) - ly * Math.sin(tilt);
      const y = cy + lx * Math.sin(tilt) + ly * Math.cos(tilt);
      const size = orbit.size * (front ? 1 : 0.7) * progress(frame, 4 + i * 2, 8);
      if (orbit.kind === "dot") return <circle key={i} cx={x} cy={y} r={size / 2} fill={orbit.color} />;
      if (orbit.kind === "ring")
        return <circle key={i} cx={x} cy={y} r={size / 2} fill="none" stroke={orbit.color} strokeWidth={4} />;
      return (
        <rect
          key={i}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          fill={orbit.color}
          transform={`rotate(${frame * 6} ${x} ${y})`}
        />
      );
    })}
  </>
);

const DotGrid = ({ frame, width, height }: { frame: number; width: number; height: number }) => {
  const cx = width / 2;
  const cy = height / 2;
  const cell = width / 16;
  const rowHeight = (height - 120) / 9;
  return (
    <>
      {Array.from({ length: 16 * 9 }, (_, n) => {
        const x = (n % 16) * cell + cell / 2;
        const y = 60 + Math.floor(n / 16) * rowHeight + rowHeight / 2;
        const d = Math.hypot(x - cx, y - cy);
        let energy = 0;
        for (let k = 0; k < 4; k++) {
          const age = frame - k * BEAT;
          if (age < 0) continue;
          energy += Math.exp(-(((d - age * 75) / 90) ** 2)) * Math.exp(-age / 22);
        }
        const level = Math.min(1, energy);
        return (
          <circle
            key={n}
            cx={x}
            cy={y}
            r={2.5 + level * 9}
            fill={level > 0.55 ? COLORS.signal : COLORS.bone}
            opacity={(0.2 + level * 0.8) * progress(frame, 0, 6)}
          />
        );
      })}
    </>
  );
};

/** 165–225: a 120-point polar morph (circle → square → triangle → star) on each beat, satellites, rippling dot grid. */
export const Shape = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const active = Math.min(NAMES.length - 1, Math.floor(frame / BEAT));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <DotGrid frame={frame} width={width} height={height} />
        {ORBITS.map((orbit, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={orbit.rx}
            ry={orbit.ry}
            fill="none"
            stroke={COLORS.bone}
            strokeOpacity={0.22}
            strokeWidth={1.5}
            strokeDasharray="4 10"
            strokeDashoffset={-frame * 2}
            transform={`rotate(${orbit.tilt} ${cx} ${cy})`}
            opacity={progress(frame, 2 + i * 2, 10)}
          />
        ))}
        <Satellites frame={frame} cx={cx} cy={cy} front={false} />
        <path d={shapePath(frame - 8, fps, cx, cy)} fill="none" stroke={COLORS.cobalt} strokeWidth={4} />
        <path d={shapePath(frame - 4, fps, cx, cy)} fill="none" stroke={COLORS.bone} strokeWidth={3} />
        <path d={shapePath(frame, fps, cx, cy)} fill={COLORS.signal} />
        <Satellites frame={frame} cx={cx} cy={cy} front />
      </svg>

      <FigCaption
        frame={frame}
        start={6}
        lines={["FIG. 03 — PATH MORPH", "120 PTS · POLAR LERP"]}
        style={{ left: 120, top: cy - 30 }}
      />
      <StateList frame={frame} start={8} items={NAMES} active={active} style={{ right: 120, top: cy - 78 }} />
    </AbsoluteFill>
  );
};
