import { KH_DEMO } from "@/remotion/kh-demo";
import { SCENES, VIDEO } from "@/remotion/lib/theme";
import { KH_FILL, KH_FILL_BEATS, type KhFillMode } from "@/remotion/scenes/kh-fill";

export type CueId = "runUp" | "stencil" | "whip" | "collapse" | "endCard";

type Cue = { id: CueId; label: string; from: number; to: number };

const FILL_END = KH_FILL.from + KH_FILL.duration;
const DEMO_END = KH_DEMO.from + KH_DEMO.durationInFrames;
const WHIP = KH_FILL.from + KH_FILL_BEATS.push;
const COLLAPSE = KH_FILL.from + KH_FILL_BEATS.shrink;

/** The demo's beats in reel frames. The boundaries are the same for every fill; only the notes differ. */
export const CUES: Cue[] = [
  { id: "runUp", label: "Run-up", from: KH_DEMO.from, to: KH_FILL.from },
  { id: "stencil", label: "Stencil", from: KH_FILL.from, to: WHIP },
  { id: "whip", label: "Whip", from: WHIP, to: COLLAPSE },
  { id: "collapse", label: "Collapse", from: COLLAPSE, to: FILL_END },
  { id: "endCard", label: "End card", from: FILL_END, to: DEMO_END },
];

export const cueAt = (reelFrame: number) => {
  let active = CUES[0];
  for (const cue of CUES) {
    if (cue.from <= reelFrame) active = cue;
  }
  return active;
};

/** Demo frame of the Cobalt flash into the montage, 0.5 s before the stencil. */
export const RUN_UP_FRAME = SCENES.montage.from - KH_DEMO.from;

const seconds = (frame: number) => (frame / VIDEO.fps).toFixed(1);

export const DEMO_SPEC = [
  { term: "Replaces", detail: `${seconds(KH_FILL.from)}–${seconds(FILL_END)} s · frames ${KH_FILL.from}–${FILL_END}` },
  { term: "Soundtrack", detail: "Unchanged, every hit lines up" },
  { term: "Hands off to", detail: `The end card's seal at ${seconds(FILL_END)} s` },
  { term: "Clip shown", detail: `${seconds(KH_DEMO.from)}–${seconds(DEMO_END)} s of the reel, looped` },
];

const AS_IN_REEL = {
  runUp: "As in the reel: the cube's last turn, then the Cobalt flash into the montage wall.",
  endCard: "As in the reel: the seal pops from the dot, then the rings, credits, hire pill and the letterbox close.",
};

const CLIP_STENCIL =
  "A Signal flash cuts to a giant KH with the reel's own clips inside. The camera pulls back, then the clips strobe every 2 frames.";
const LIQUID_COLLAPSE = "Full at 100 % as KH shrinks into the dot the end card's seal pops from.";

export type FillOption = {
  id: KhFillMode;
  index: string;
  label: string;
  summary: string;
  notes: Record<CueId, string>;
};

export const FILL_OPTIONS: FillOption[] = [
  {
    id: "clips",
    index: "01",
    label: "Reel clips",
    summary: "The reel's own scenes, seen through the letters.",
    notes: {
      ...AS_IN_REEL,
      stencil: CLIP_STENCIL,
      whip: "The whoosh shoves the letters sideways and smears the clips. They keep strobing, then flood orange.",
      collapse: "KH shrinks into the orange dot the end card's seal pops from.",
    },
  },
  {
    id: "liquid",
    index: "02",
    label: "Orange liquid",
    summary: "Signal orange pours in and sloshes on the whip.",
    notes: {
      ...AS_IN_REEL,
      stencil:
        "A Signal flash cuts to an empty KH outline with measuring marks. Orange liquid pours in, with a live % readout.",
      whip: "The whoosh shoves the letters sideways; the liquid sloshes against the walls and bubbles.",
      collapse: LIQUID_COLLAPSE,
    },
  },
  {
    id: "both",
    index: "03",
    label: "1 + 2",
    summary: "The clip wall first, then the liquid floods it.",
    notes: {
      ...AS_IN_REEL,
      stencil: CLIP_STENCIL,
      whip: "The whoosh shoves the letters sideways and orange liquid rises over the clips, with a live % readout.",
      collapse: LIQUID_COLLAPSE,
    },
  },
];
