import type { CSSProperties } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { expoIn, lerp, progress, tween } from "../lib/easing";
import { COLORS, LETTERBOX, SCENES } from "../lib/theme";
import { display, mono, typedLength } from "../lib/type";
import { INSET, cropOffset } from "./crop-marks";

const NAME = Array.from("KRUSHNA HON");
const PRE = "CREATED BY";
const SIZE = 184;
const BUG_SCALE = 24 / SIZE;
/** Distance from the corner of the top-right crop mark to the bug's top-right corner. */
const GAP = 18;
const ARC = 110;
const LAUNCH = SCENES.title.from;
const LOCK = LAUNCH + 8;
const GHOSTS = [1, 2, 3, 4, 5, 6];
const CUTS = [SCENES.kinetic, SCENES.shape, SCENES.generative, SCENES.depth, SCENES.montage, SCENES.finale].map(
  (scene) => scene.from,
);

const linear = (t: number) => t;

type Video = { width: number; height: number; fps: number };

type Pose = {
  x: number;
  y: number;
  ax: number;
  ay: number;
  scale: number;
  skew: number;
  wdth: number;
  tracking: number;
};

/** Where the anchor point sits at (fractional) frame f: home above the boot line, then an arc into the top-right bracket. */
const pathAt = (f: number, { width, height, fps }: Video) => {
  const fly = progress(f, LAUNCH, 13);
  const crouch = progress(f, LAUNCH - 5, 5, expoIn) * (1 - fly);
  const offset = cropOffset(f, fps);
  const fromX = width / 2;
  const fromY = height / 2 - 96 + crouch * 14;
  const dx = width - INSET - GAP + offset - fromX;
  const dy = LETTERBOX + INSET + GAP - offset - fromY;
  const bulge = (Math.sin(Math.PI * fly) * ARC) / Math.hypot(dx, dy);
  return { fly, crouch, x: fromX + dx * fly + dy * bulge, y: fromY + dy * fly - dx * bulge };
};

const poseAt = (f: number, video: Video): Pose => {
  const { fly, crouch, x, y } = pathAt(f, video);
  const shrink = progress(f, LAUNCH, 11);
  const speed = x - pathAt(f - 0.5, video).x;
  return {
    x,
    y,
    ax: lerp(0.5, 1, fly),
    ay: lerp(0.5, 0, fly),
    scale: lerp(1, BUG_SCALE, shrink),
    skew: f < LAUNCH + 14 ? Math.max(-18, Math.min(18, -speed * 0.09)) : 0,
    wdth: lerp(62, 125, progress(f, 3, 12)) - 33 * crouch,
    tracking: lerp(-0.01, 0.05, shrink),
  };
};

/**
 * Pins the anchor (ax, ay), a fraction of the element's own box, to (x, y) and scales around it,
 * so the name can travel from centered to top-right-aligned without measuring the text.
 */
const placement = ({ x, y, ax, ay, scale, skew }: Pose): CSSProperties => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "max-content",
  transformOrigin: `${ax * 100}% ${ay * 100}%`,
  transform: `translate(${x}px, ${y}px) translate(${-ax * 100}%, ${-ay * 100}%) scale(${scale}) skewX(${skew}deg)`,
});

const NameRow = ({
  f,
  wdth,
  tracking,
  color,
  style,
}: {
  f: number;
  wdth: number;
  tracking: number;
  color: string;
  style?: CSSProperties;
}) => (
  <div style={{ display: "flex", fontSize: SIZE, ...style }}>
    {NAME.map((char, i) => {
      const marginRight = i < NAME.length - 1 ? `${tracking}em` : 0;
      if (char === " ") return <span key={i} style={{ width: "0.24em", marginRight }} />;
      const rise = progress(f, 3 + i * 0.6, 8);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            height: SIZE,
            marginRight,
            clipPath: rise < 1 ? "inset(-50% -50% 0 -50%)" : undefined,
          }}
        >
          <span
            style={{
              ...display(SIZE, wdth, 900, { lineHeight: 1, color }),
              display: "inline-block",
              transform: rise < 1 ? `translateY(${(1 - rise) * 105}%)` : undefined,
            }}
          >
            {char}
          </span>
        </span>
      );
    })}
  </div>
);

const CreatedBy = ({ frame }: { frame: number }) => {
  const typed = typedLength(PRE, frame, 4, 1.7);
  const deleted = typedLength(PRE, frame, 20, 2.5);
  const busy = (typed > 0 && typed < PRE.length) || deleted > 0;
  const caretOn = frame >= 4 && deleted < PRE.length && (busy || Math.floor(frame / 3) % 2 === 0);
  return (
    <div
      style={{
        position: "absolute",
        left: 8,
        bottom: "100%",
        marginBottom: 4,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={mono(26, { letterSpacing: "0.42em", opacity: 0.8 })}>{PRE.slice(0, typed - deleted)}</span>
      {caretOn ? <span style={{ width: 13, height: 28, backgroundColor: COLORS.signal }} /> : null}
    </div>
  );
};

/** A Signal frame that contracts onto the bug as it locks into the bracket. */
const LockFrame = ({ frame, scale }: { frame: number; scale: number }) => (
  <div
    style={{
      position: "absolute",
      inset: -lerp(28, 8, progress(frame, LOCK, 7)) / scale,
      border: `${2 / scale}px solid ${COLORS.signal}`,
      opacity: 1 - tween(frame, [LOCK + 2, LOCK + 9], [0, 1], linear),
    }}
  />
);

/**
 * 3–30: "CREATED BY KRUSHNA HON" rises out of the boot line and unfolds on the width axis. 30: the drop flings the
 * name along an arc into the top-right crop mark, where it stays as a bug until the reel fades out.
 */
export const Credit = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const video = { width, height, fps };
  const pose = poseAt(frame, video);

  const fly = progress(frame, LAUNCH, 13);
  const charge = progress(frame, LAUNCH - 5, 5, expoIn) * (1 - fly);
  const cutHit = Math.max(0, ...CUTS.map((cut) => (frame >= cut ? Math.exp(-(frame - cut) / 2.2) : 0)));
  const split = 24 * (1 - progress(frame, 3, 14)) + 16 * charge + 10 * Math.sin(Math.PI * fly) + 5 * cutHit;
  const splitLocal = split / pose.scale;

  const ghostFade = 1 - progress(frame, LAUNCH + 3, 9, linear);
  const ghosts =
    frame > LAUNCH && ghostFade > 0
      ? GHOSTS.map((k) => ({ k, f: frame - k * 0.8 })).filter((ghost) => ghost.f >= LAUNCH)
      : [];

  return (
    <AbsoluteFill
      style={{ mixBlendMode: "difference", opacity: tween(frame, [438, 446], [1, 0]), pointerEvents: "none" }}
    >
      {ghosts.map(({ k, f }) => {
        const ghost = poseAt(f, video);
        return (
          <div key={k} style={{ ...placement(ghost), opacity: 0.45 * (1 - k / 7) * ghostFade }}>
            <NameRow f={f} wdth={ghost.wdth} tracking={ghost.tracking} color={COLORS.signal} />
          </div>
        );
      })}

      <div style={placement(pose)}>
        {split > 0.25 ? (
          <>
            <NameRow
              f={frame}
              wdth={pose.wdth}
              tracking={pose.tracking}
              color={COLORS.signal}
              style={{ position: "absolute", inset: 0, transform: `translateX(${-splitLocal}px)`, mixBlendMode: "screen" }}
            />
            <NameRow
              f={frame}
              wdth={pose.wdth}
              tracking={pose.tracking}
              color={COLORS.cobalt}
              style={{ position: "absolute", inset: 0, transform: `translateX(${splitLocal}px)`, mixBlendMode: "screen" }}
            />
          </>
        ) : null}
        <NameRow f={frame} wdth={pose.wdth} tracking={pose.tracking} color={COLORS.bone} style={{ position: "relative" }} />
        {frame < LAUNCH ? <CreatedBy frame={frame} /> : null}
        {frame >= LOCK && frame < LOCK + 10 ? <LockFrame frame={frame} scale={pose.scale} /> : null}
      </div>
    </AbsoluteFill>
  );
};
