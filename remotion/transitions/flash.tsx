import { AbsoluteFill, useCurrentFrame } from "remotion";

const LEVELS = [1, 0.5, 0.18];

/** Full-frame color hit on the cut frame (`at`, global), decaying over the next two frames. */
export const FlashFrame = ({ at, color }: { at: number; color: string }) => {
  const frame = useCurrentFrame();
  const level = LEVELS[frame - at];
  if (level === undefined) return null;

  return <AbsoluteFill style={{ backgroundColor: color, opacity: level, pointerEvents: "none" }} />;
};
