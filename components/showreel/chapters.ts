import { SCENE_ORDER, SCENES, VIDEO, type SceneId } from "@/remotion/lib/theme";

const TECHNIQUES: Record<SceneId, string> = {
  boot: "Crop marks snap in, a path draws edge to edge and “Created by Krushna Hon” rises out of it on the width axis, then the line collapses to a dot.",
  title: "The drop flings the name into the top-right corner, where it stays. A spring-overshoot slam with RGB-split ghosts; letters rise out of masks while the width axis breathes 62→125.",
  kinetic: "One word per beat. Skew-and-stretch poses trail six ghost copies as fake motion blur.",
  shape: "Circle, square, triangle, star: one 120-ray radial morph, with satellites depth-sorted on tilted orbits.",
  generative: "300 particles in a noise flow field lock into a ring on the downbeat, bloom into a rose, then collapse.",
  depth: "A self-similar infinite-zoom tunnel and a CSS 3D type cube turning MAKE, IT, MOVE.",
  montage: "A 3×3 wall of live frozen frames from earlier scenes ripple-flips, then a flash cuts to a giant KH stencil with the reel’s own clips strobing inside.",
  finale: "A whoosh shoves the letters sideways as orange liquid sloshes up over the clips, with a live % readout. Once full, KH collapses into a seal: text on a path, a ticking dial and a hire pill on the last downbeat.",
};

const pad = (value: number) => String(value).padStart(2, "0");

/** SMPTE timecode (HH:MM:SS:FF), the same format as the reel's HUD. */
export const timecode = (frame: number) => {
  const seconds = Math.floor(frame / VIDEO.fps);
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frame % VIDEO.fps)}`;
};

export const CHAPTERS = SCENE_ORDER.map((id) => ({
  id,
  label: SCENES[id].label,
  from: SCENES[id].from,
  technique: TECHNIQUES[id],
}));
