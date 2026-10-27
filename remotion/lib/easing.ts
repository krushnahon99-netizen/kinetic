import { Easing, interpolate, spring } from "remotion";
import { BEAT } from "./theme";

export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);
export const expoIn = Easing.bezier(0.7, 0, 0.84, 0);
export const expoInOut = Easing.bezier(0.87, 0, 0.13, 1);

export const OVERSHOOT = { damping: 12, stiffness: 180, mass: 0.6 } as const;

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

type EasingFn = (t: number) => number;

/** Clamped interpolate between two keyframes with an ease. */
export const tween = (
  frame: number,
  [start, end]: readonly [number, number],
  [from, to]: readonly [number, number],
  easing: EasingFn = expoOut,
) => interpolate(frame, [start, end], [from, to], { ...CLAMP, easing });

/** 0 → 1 over `duration` frames starting at `start`. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: EasingFn = expoOut,
) => tween(frame, [start, start + duration], [0, 1], easing);

/** Overshoot spring (0 → ~1.1 → 1) that starts at `delay`. */
export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: Math.max(0, frame - delay), fps, config: OVERSHOOT });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Sharp hit on every beat that decays before the next one (1 on the beat, ~0 by the next). */
export const beatPulse = (frame: number, decay = 3.2) =>
  frame < 0 ? 0 : Math.exp(-(frame % BEAT) / decay);
