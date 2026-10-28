import { Composition } from "remotion";
import { ContactSheet } from "./contact-sheet";
import { VIDEO } from "./lib/theme";
import { Showreel } from "./showreel";

export const RemotionRoot = () => (
  <>
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Composition
      id="ContactSheet"
      component={ContactSheet}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{ frames: [15, 45, 70, 100] }}
    />
  </>
);
