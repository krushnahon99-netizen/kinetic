import { AbsoluteFill, Freeze } from "remotion";
import { COLORS, MONO_STACK, VIDEO } from "./lib/theme";
import { ShowreelPicture } from "./showreel";

export type ContactSheetProps = { frames: number[] };

/**
 * Review tool: renders up to 9 frames of the reel in a single still, so one render shows a whole sequence.
 * pnpm exec remotion still remotion/index.ts ContactSheet /tmp/stills/sheet.png --props='{"frames":[15,70,130,195]}'
 */
export const ContactSheet = ({ frames }: ContactSheetProps) => {
  const columns = frames.length <= 4 ? 2 : 3;
  const scale = 1 / columns;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {frames.map((frame, i) => (
        <div
          key={`${frame}-${i}`}
          style={{
            position: "absolute",
            left: (i % columns) * VIDEO.width * scale,
            top: Math.floor(i / columns) * VIDEO.height * scale,
            width: VIDEO.width,
            height: VIDEO.height,
            overflow: "hidden",
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <Freeze frame={frame}>
            <ShowreelPicture />
          </Freeze>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              padding: "10px 18px",
              backgroundColor: COLORS.signal,
              color: COLORS.ink,
              fontFamily: MONO_STACK,
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            F{frame}
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
