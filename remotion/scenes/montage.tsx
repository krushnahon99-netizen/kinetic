import { useId, type CSSProperties, type ComponentType, type ReactNode } from "react";
import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { expoIn, expoInOut, expoOut, lerp, progress, tween } from "../lib/easing";
import { BEAT, COLORS, LETTERBOX, SCENES, VIDEO, type SceneId } from "../lib/theme";
import { mono } from "../lib/type";
import { Boot } from "./boot";
import { Depth } from "./depth";
import { Generative } from "./generative";
import { KineticType } from "./kinetic-type";
import { Shape } from "./shape";
import { Title } from "./title";

type Clip = { id: SceneId; Scene: ComponentType; frame: number };

type TileState = {
  clip: Clip;
  clipFrame: number;
  flipX: number;
  flipY: number;
  flash: number;
  flashColor: string;
};

const PICTURE_W = VIDEO.width;
const PICTURE_H = VIDEO.height - LETTERBOX * 2;
const COLS = 3;
const ROWS = 3;
const GUTTER = 10;
const TILE_W = (PICTURE_W - GUTTER * (COLS - 1)) / COLS;
const TILE_H = (PICTURE_H - GUTTER * (ROWS - 1)) / ROWS;
const STEP_X = TILE_W + GUTTER;
const STEP_Y = TILE_H + GUTTER;
/** Scale at which a scene's 1920×960 picture area covers one tile. */
const INNER = Math.max(TILE_W / PICTURE_W, TILE_H / PICTURE_H);
/** Wall scale at which the center tile fills the whole picture area (the opening frame). */
const ZOOM_IN = Math.max(PICTURE_W / TILE_W, PICTURE_H / TILE_H);

const CYCLE = 4;
const SYNC = BEAT;
const WHIP = 22;
const SWAP_FLASH = [0.85, 0.35, 0.1];
const SYNC_FLASH = [1, 0.55, 0.2];

const makeClip = (id: SceneId, Scene: ComponentType, frame: number): Clip => ({ id, Scene, frame });

/** Repeats title → kinetic → shape → generative → depth, so neighbouring indices never share a scene. */
const CLIPS: Clip[] = [
  makeClip("title", Title, 44),
  makeClip("kinetic", KineticType, 8),
  makeClip("shape", Shape, 22),
  makeClip("generative", Generative, 24),
  makeClip("depth", Depth, 50),
  makeClip("title", Title, 6),
  makeClip("kinetic", KineticType, 23),
  makeClip("shape", Shape, 37),
  makeClip("generative", Generative, 40),
  makeClip("depth", Depth, 24),
  makeClip("boot", Boot, 20),
  makeClip("kinetic", KineticType, 38),
  makeClip("shape", Shape, 52),
  makeClip("generative", Generative, 10),
  makeClip("depth", Depth, 38),
];

const mod = (n: number, m: number) => ((n % m) + m) % m;

const tileLabel = (id: SceneId) => {
  const [number, name] = SCENES[id].label.split(" — ");
  return `${number.slice(0, 2)} ${name}`;
};

/**
 * Content of the tile at (row, col) of the wall. `col` is the tile's logical column, so content travels with a
 * tile when its row slides. Before SYNC the tiles cut to a new clip every CYCLE frames in a ripple from the center;
 * on SYNC every tile flips to a Kinetic Type word (diagonal stripes of the four word colors); from WHIP the
 * clips strobe every 2 frames while the wall whips out.
 */
const tileState = (frame: number, row: number, col: number): TileState => {
  if (frame >= SYNC && frame < WHIP) {
    const t = frame - SYNC;
    const base = mod(row + col, 4) * BEAT + 5;
    return {
      clip: makeClip("kinetic", KineticType, base),
      clipFrame: base + t,
      flipX: lerp(-80, 0, progress(t, 0, 4, expoOut)),
      flipY: 0,
      flash: SYNC_FLASH[t] ?? 0,
      flashColor: COLORS.signal,
    };
  }

  if (frame >= WHIP) {
    const t = frame - WHIP;
    const clip = CLIPS[mod(row * 3 + col * 2 + Math.floor(t / 2) * 7 + 5, CLIPS.length)];
    return { clip, clipFrame: clip.frame + (t % 2), flipX: 0, flipY: 0, flash: t === 0 ? 0.25 : 0, flashColor: COLORS.bone };
  }

  const ripple = Math.abs(row - 1) + Math.abs(col - 1);
  const local = Math.max(0, frame - ripple);
  const step = Math.floor(local / CYCLE);
  const within = local - step * CYCLE;
  const clip = CLIPS[mod(row * 3 + col + step * 7, CLIPS.length)];
  const swapped = step > 0;
  return {
    clip,
    clipFrame: clip.frame + within,
    flipX: 0,
    flipY: swapped ? lerp(mod(row + col, 2) ? 72 : -72, 0, progress(within, 0, 3, expoOut)) : 0,
    flash: swapped ? (SWAP_FLASH[within] ?? 0) : 0,
    flashColor: COLORS.bone,
  };
};

const Chip = ({ children, style }: { children: ReactNode; style: CSSProperties }) => (
  <div
    style={{
      position: "absolute",
      top: 12,
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      backgroundColor: COLORS.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

const Tile = ({ x, y, state }: { x: number; y: number; state: TileState }) => {
  const { clip, clipFrame, flipX, flipY, flash, flashColor } = state;
  const { Scene } = clip;
  const turned = flipX !== 0 || flipY !== 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: TILE_W,
        height: TILE_H,
        overflow: "hidden",
        backgroundColor: COLORS.ink,
        transform: turned ? `perspective(1600px) rotateX(${flipX}deg) rotateY(${flipY}deg)` : undefined,
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
        <Freeze frame={clipFrame}>
          <Scene />
        </Freeze>
      </div>
      {flash > 0.01 ? (
        <div style={{ position: "absolute", inset: 0, backgroundColor: flashColor, opacity: flash }} />
      ) : null}
      <Chip style={{ left: 12 }}>
        <span style={{ width: 7, height: 7, backgroundColor: COLORS.signal }} />
        <span style={mono(12, { letterSpacing: "0.16em" })}>{tileLabel(clip.id)}</span>
      </Chip>
      <Chip style={{ right: 12 }}>
        <span style={mono(12, { letterSpacing: "0.16em", opacity: 0.6 })}>
          {`F${String(SCENES[clip.id].from + clipFrame).padStart(3, "0")}`}
        </span>
      </Chip>
    </div>
  );
};

/**
 * 345–375: the camera pulls back from the Depth shot to reveal it was one tile in a 3×3 wall of the reel. Tiles
 * flip to new clips in a ripple, sync to Kinetic Type stripes on the downbeat (360) while the rows slide, then the
 * wall whips left under a horizontal smear into the whip-pan cut.
 */
export const Montage = () => {
  const frame = useCurrentFrame();
  const smearId = `montage-smear-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const pull = progress(frame, 0, 12, expoOut);
  const scale = lerp(ZOOM_IN, 1, pull);
  const rotate = lerp(-6, 0, pull);
  const smear = tween(frame, [WHIP, 30], [0, 48], expoIn);
  const slide = progress(frame, SYNC, 7, expoInOut);

  const tiles: ReactNode[] = [];
  for (let row = 0; row < ROWS; row++) {
    const offset = (row % 2 === 0 ? -1 : 1) * STEP_X * slide + tween(frame, [WHIP + row, 30], [0, -2600], expoIn);
    const first = Math.ceil((-offset - TILE_W) / STEP_X);
    const last = Math.floor((PICTURE_W - offset) / STEP_X);
    for (let col = first; col <= last; col++) {
      tiles.push(<Tile key={`${row}:${col}`} x={col * STEP_X + offset} y={row * STEP_Y} state={tileState(frame, row, col)} />);
    }
  }

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
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
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          filter: smear > 0.5 ? `url(#${smearId})` : undefined,
        }}
      >
        {tiles}
      </div>
    </AbsoluteFill>
  );
};
