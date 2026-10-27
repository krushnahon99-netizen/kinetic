export const COLORS = {
  ink: "#0B0B0C",
  bone: "#F2EFE8",
  signal: "#FF4D1F",
  cobalt: "#2B4DFF",
} as const;

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 450,
} as const;

/** 120 BPM at 30 fps: 1 beat = 15 frames, 1 bar = 60 frames. */
export const BEAT = 15;
export const BAR = BEAT * 4;

/** Height of the cinematic bars at the top and bottom. The picture area is 1920x960 (2:1). */
export const LETTERBOX = 60;

export const FONTS = {
  display: "Archivo",
  mono: "JetBrains Mono",
} as const;

export const DISPLAY_STACK = `"${FONTS.display}", "Arial Narrow", sans-serif`;
export const MONO_STACK = `"${FONTS.mono}", ui-monospace, monospace`;

export const SCENES = {
  boot: { from: 0, duration: 30, label: "00/04 — BOOT" },
  title: { from: 30, duration: 75, label: "00/04 — INTRO" },
  kinetic: { from: 105, duration: 60, label: "01/04 — KINETIC TYPE" },
  shape: { from: 165, duration: 60, label: "02/04 — SHAPE" },
  generative: { from: 225, duration: 60, label: "03/04 — GENERATIVE" },
  depth: { from: 285, duration: 60, label: "04/04 — DEPTH" },
  montage: { from: 345, duration: 30, label: "04/04 — RECAP" },
  finale: { from: 375, duration: 75, label: "END — AVAILABLE NOW" },
} as const;

export type SceneId = keyof typeof SCENES;

export const SCENE_ORDER: SceneId[] = [
  "boot",
  "title",
  "kinetic",
  "shape",
  "generative",
  "depth",
  "montage",
  "finale",
];

export const sceneAt = (frame: number): SceneId => {
  for (let i = SCENE_ORDER.length - 1; i >= 0; i--) {
    if (frame >= SCENES[SCENE_ORDER[i]].from) return SCENE_ORDER[i];
  }
  return "boot";
};

/** Archivo variable axes: wdth 62–125, wght 100–900. */
export const axes = (wdth: number, wght: number) =>
  `'wdth' ${wdth.toFixed(1)}, 'wght' ${Math.round(wght)}`;
