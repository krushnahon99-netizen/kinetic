import type { CSSProperties } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FigCaption, StateList } from "../lib/caption";
import { clamp01, expoIn, lerp, pop, progress } from "../lib/easing";
import { BEAT, COLORS, LETTERBOX, MONO_STACK, VIDEO } from "../lib/theme";
import { display, mono } from "../lib/type";

const RATIO = 1.32;
const LOG_RATIO = Math.log(RATIO);
const MIN_SCALE = 0.025;
const MAX_SCALE = 2.6;
const TWIST = 6;
const HALF_W = VIDEO.width / 2;
const HALF_H = VIDEO.height / 2 - LETTERBOX;
const ARM = 140;
const CUBE = 400;
const PERSPECTIVE = 1400;
const LAND = BEAT;
const STATES = ["APPROACH", "MAKE", "IT", "MOVE"];

const BRACKETS = [
  `M${-HALF_W} ${-HALF_H + ARM}V${-HALF_H}H${-HALF_W + ARM}`,
  `M${HALF_W - ARM} ${-HALF_H}H${HALF_W}V${-HALF_H + ARM}`,
  `M${HALF_W} ${HALF_H - ARM}V${HALF_H}H${HALF_W - ARM}`,
  `M${-HALF_W + ARM} ${HALF_H}H${-HALF_W}V${HALF_H - ARM}`,
].join("");

const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

const GRID = `linear-gradient(${COLORS.ink}40 2px, transparent 2px), linear-gradient(90deg, ${COLORS.ink}40 2px, transparent 2px)`;

const FACES = [
  { word: "MAKE", yaw: 0, background: COLORS.bone, color: COLORS.ink, wdth: 62, size: 168, tag: "01/03" },
  { word: "IT", yaw: 90, background: COLORS.signal, color: COLORS.ink, wdth: 125, size: 250, tag: "02/03" },
  { word: "MOVE", yaw: 180, background: COLORS.ink, color: COLORS.bone, wdth: 62, size: 168, tag: "03/03" },
  { word: "v0", yaw: -90, background: COLORS.cobalt, color: COLORS.bone, wdth: 100, size: 220, tag: "REEL" },
] as const;

const mod = (n: number, m: number) => ((n % m) + m) % m;

const signed = (value: number, digits: number) =>
  `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(0).padStart(digits, "0")}`;

/** Log-depth of the tunnel: a slow drift, a lurch on every beat, then a rush into the cut. */
const zoomPhase = (frame: number, fps: number) =>
  frame * 0.065 +
  0.7 * (pop(frame, fps, LAND) + pop(frame, fps, 2 * BEAT) + pop(frame, fps, 3 * BEAT)) +
  4.6 * progress(frame, 48, 12, expoIn);

/**
 * Infinite zoom: frame `id` has scale RATIO^(id + phase), so the series is self-similar and wraps seamlessly. Each frame
 * twists with depth, and the four corner rails connect the frames into a spiral wireframe.
 */
const Tunnel = ({ frame, fps, width, height }: { frame: number; fps: number; width: number; height: number }) => {
  const cx = width / 2;
  const cy = height / 2;
  const phase = zoomPhase(frame, fps);
  const first = Math.ceil(Math.log(MIN_SCALE) / LOG_RATIO - phase);
  const last = Math.floor(Math.log(MAX_SCALE) / LOG_RATIO - phase);
  const rings = Array.from({ length: Math.max(0, last - first + 1) }, (_, n) => {
    const id = first + n;
    const depth = id + phase;
    return { id, scale: Math.exp(depth * LOG_RATIO), rotation: depth * TWIST };
  });
  const rails = CORNERS.map(([sx, sy]) =>
    rings
      .map(({ scale, rotation }, n) => {
        const a = (rotation * Math.PI) / 180;
        const x = sx * HALF_W * scale;
        const y = sy * HALF_H * scale;
        const px = cx + x * Math.cos(a) - y * Math.sin(a);
        const py = cy + x * Math.sin(a) + y * Math.cos(a);
        return `${n === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`;
      })
      .join(""),
  );

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      {rails.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={COLORS.bone} strokeOpacity={0.16} strokeWidth={1.5} />
      ))}
      {rings.map(({ id, scale, rotation }) => {
        const color = mod(id, 4) === 0 ? COLORS.signal : COLORS.bone;
        const opacity = clamp01((scale - MIN_SCALE) / (MIN_SCALE * 2.5)) * Math.min(1, 0.3 + 0.7 * Math.sqrt(scale));
        const strokeWidth = 1 + 3 * Math.min(1.4, scale);
        return (
          <g
            key={id}
            transform={`translate(${cx} ${cy}) rotate(${rotation.toFixed(2)}) scale(${scale.toFixed(4)})`}
            opacity={opacity}
          >
            {mod(id, 2) === 1 ? (
              <path d={BRACKETS} fill="none" stroke={color} strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke" />
            ) : (
              <rect
                x={-HALF_W}
                y={-HALF_H}
                width={HALF_W * 2}
                height={HALF_H * 2}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            )}
            <text x={-HALF_W + 30} y={-HALF_H + 56} fill={color} fontFamily={MONO_STACK} fontSize={30} letterSpacing={5}>
              {`#${String(300 + id).padStart(4, "0")}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Slams in from deep in the tunnel on the downbeat, turns a face per beat (MAKE → IT → MOVE), then flies at the lens. */
const cubePose = (frame: number, fps: number) => {
  const approach = progress(frame, 1, LAND - 1, expoIn);
  const after = frame - LAND;
  const recoil = after >= 0 ? Math.exp(-after / 4) * Math.cos(after * 0.8) : 0;
  const kick = (at: number, amount: number) => (frame >= at ? amount * Math.exp(-(frame - at) / 3) : 0);
  const exit = progress(frame, 50, 10, expoIn);
  return {
    z: lerp(-4200, 0, approach) + 900 * exit,
    rotY:
      (after < 0 ? 360 * (1 - approach) : -18 * recoil) -
      90 * (pop(frame, fps, 2 * BEAT) + pop(frame, fps, 3 * BEAT)),
    rotX: lerp(48, -16, approach) - 4 * Math.sin(frame * 0.07) - 56 * exit,
    rotZ: 3 * Math.sin(frame * 0.05),
    scale: 1 + kick(LAND, 0.1) + kick(2 * BEAT, 0.05) + kick(3 * BEAT, 0.05),
  };
};

type CubePose = ReturnType<typeof cubePose>;

const faceStyle = (transform: string, extra: CSSProperties = {}): CSSProperties => ({
  position: "absolute",
  inset: 0,
  transform,
  backfaceVisibility: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  ...extra,
});

const Cube = ({ pose, width, height }: { pose: CubePose; width: number; height: number }) => {
  const topLight = clamp01(Math.sin((-pose.rotX * Math.PI) / 180));
  const transform = [
    `translateZ(${(pose.z - CUBE / 2).toFixed(1)}px)`,
    `rotateZ(${pose.rotZ.toFixed(2)}deg)`,
    `rotateX(${pose.rotX.toFixed(2)}deg)`,
    `rotateY(${pose.rotY.toFixed(2)}deg)`,
    `scale3d(${pose.scale.toFixed(3)}, ${pose.scale.toFixed(3)}, ${pose.scale.toFixed(3)})`,
  ].join(" ");

  return (
    <AbsoluteFill style={{ perspective: PERSPECTIVE }}>
      <div
        style={{
          position: "absolute",
          left: width / 2 - CUBE / 2,
          top: height / 2 - CUBE / 2,
          width: CUBE,
          height: CUBE,
          transformStyle: "preserve-3d",
          transform,
        }}
      >
        {FACES.map((face) => {
          const facing = Math.cos(((face.yaw + pose.rotY) * Math.PI) / 180);
          return (
            <div
              key={face.word}
              style={faceStyle(`rotateY(${face.yaw}deg) translateZ(${CUBE / 2}px)`, {
                backgroundColor: face.background,
                boxShadow: `inset 0 0 0 3px ${face.color}`,
              })}
            >
              <span style={display(face.size, face.wdth, 860, { color: face.color, lineHeight: 1 })}>{face.word}</span>
              <span style={mono(13, { position: "absolute", left: 20, top: 20, color: face.color, opacity: 0.7 })}>
                {face.tag}
              </span>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: COLORS.ink,
                  opacity: 0.55 * (1 - clamp01(facing)),
                }}
              />
            </div>
          );
        })}
        <div
          style={faceStyle(`rotateX(90deg) translateZ(${CUBE / 2}px)`, {
            backgroundColor: COLORS.signal,
            backgroundImage: GRID,
            backgroundSize: "50px 50px",
          })}
        >
          {/* The cube ends on its back face (rotY −180) as it flies at the lens, so the lid label is flipped to read upright there. */}
          <span style={mono(16, { color: COLORS.ink, transform: "rotate(180deg)" })}>04 — DEPTH</span>
          <div
            style={{ position: "absolute", inset: 0, backgroundColor: COLORS.ink, opacity: 0.3 * (1 - topLight) }}
          />
        </div>
        <div style={faceStyle(`rotateX(-90deg) translateZ(${CUBE / 2}px)`, { backgroundColor: COLORS.ink })} />
      </div>
    </AbsoluteFill>
  );
};

/** 285–345: CSS 3D. A twisting infinite-zoom tunnel of frames around a type cube "MAKE / IT / MOVE". */
export const Depth = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const pose = cubePose(frame, fps);
  const active = Math.min(STATES.length - 1, Math.floor(frame / BEAT));

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      <Tunnel frame={frame} fps={fps} width={width} height={height} />
      <Cube pose={pose} width={width} height={height} />

      <FigCaption
        frame={frame}
        start={6}
        lines={["FIG. 05 — Z-SPACE", "CSS 3D · PERSP 1400"]}
        style={{ left: 120, top: height / 2 - 30 }}
      >
        <span style={mono(15, { opacity: 0.5 * progress(frame, 12, 4) })}>
          {`ROT.Y ${signed(pose.rotY, 3)}°  Z ${signed(pose.z, 4)}`}
        </span>
      </FigCaption>
      <StateList frame={frame} start={8} items={STATES} active={active} style={{ right: 120, top: height / 2 - 78 }} />
    </AbsoluteFill>
  );
};
