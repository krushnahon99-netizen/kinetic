import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { beatPulse, pop, tween } from "../lib/easing";
import { COLORS, LETTERBOX } from "../lib/theme";

export const INSET = 40;
const ARM = 44;

/** How far the marks sit outside their rest position: they spring in during the boot, then kick 5 px inward on every beat. */
export const cropOffset = (frame: number, fps: number) => (1 - pop(frame, fps, 1)) * 90 - beatPulse(frame) * 5;

/** Corner marks that snap in during the boot and kick inward on every beat. */
export const CropMarks = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const offset = cropOffset(frame, fps);
  const opacity = tween(frame, [0, 3], [0, 1]);

  const corners = [
    { x: INSET, y: LETTERBOX + INSET, sx: 1, sy: 1 },
    { x: width - INSET, y: LETTERBOX + INSET, sx: -1, sy: 1 },
    { x: INSET, y: height - LETTERBOX - INSET, sx: 1, sy: -1 },
    { x: width - INSET, y: height - LETTERBOX - INSET, sx: -1, sy: -1 },
  ];

  return (
    <AbsoluteFill style={{ mixBlendMode: "difference", opacity, pointerEvents: "none" }}>
      <svg width={width} height={height}>
        {corners.map((corner) => {
          const x = corner.x - corner.sx * offset;
          const y = corner.y - corner.sy * offset;
          return (
            <path
              key={`${corner.sx}${corner.sy}`}
              d={`M ${x} ${y + corner.sy * ARM} L ${x} ${y} L ${x + corner.sx * ARM} ${y}`}
              stroke={COLORS.bone}
              strokeWidth={2}
              fill="none"
              strokeLinecap="square"
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
