import { Composition } from "remotion";
import { VIDEO } from "./lib/theme";
import { Showreel } from "./showreel";

export const RemotionRoot = () => (
  <Composition
    id="Showreel"
    component={Showreel}
    durationInFrames={VIDEO.durationInFrames}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
