import type { ComponentType } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { ensureFonts } from "./lib/fonts";
import { COLORS, SCENES, type SceneId } from "./lib/theme";
import { CropMarks } from "./overlays/crop-marks";
import { Grain } from "./overlays/grain";
import { Hud } from "./overlays/hud";
import { Letterbox } from "./overlays/letterbox";
import { Boot } from "./scenes/boot";
import { KineticType } from "./scenes/kinetic-type";
import { Shape } from "./scenes/shape";
import { Title } from "./scenes/title";
import { FlashFrame } from "./transitions/flash";
import { Iris } from "./transitions/iris";
import { SlatWipe } from "./transitions/slat-wipe";
import { WhipPan } from "./transitions/whip-pan";

ensureFonts();

const SCENE_COMPONENTS: { id: SceneId; Component: ComponentType }[] = [
  { id: "boot", Component: Boot },
  { id: "title", Component: Title },
  { id: "kinetic", Component: KineticType },
  { id: "shape", Component: Shape },
];

export const Showreel = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
    {SCENE_COMPONENTS.map(({ id, Component }) => (
      <Sequence key={id} from={SCENES[id].from} durationInFrames={SCENES[id].duration} name={id}>
        <Component />
      </Sequence>
    ))}

    <SlatWipe at={SCENES.kinetic.from} color={COLORS.signal} />
    <FlashFrame at={SCENES.shape.from} color={COLORS.bone} />
    <FlashFrame at={SCENES.generative.from} color={COLORS.signal} />
    <Iris at={SCENES.depth.from} />
    <FlashFrame at={SCENES.montage.from} color={COLORS.cobalt} />
    <WhipPan at={SCENES.finale.from} />

    <CropMarks />
    <Letterbox />
    <Hud />
    <Grain />
  </AbsoluteFill>
);
