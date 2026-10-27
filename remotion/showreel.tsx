import { AbsoluteFill } from "remotion";
import { ensureFonts } from "./lib/fonts";
import { COLORS } from "./lib/theme";
import { CropMarks } from "./overlays/crop-marks";
import { Grain } from "./overlays/grain";
import { Hud } from "./overlays/hud";
import { Letterbox } from "./overlays/letterbox";

ensureFonts();

export const Showreel = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.ink, overflow: "hidden" }}>
    <CropMarks />
    <Letterbox />
    <Hud />
    <Grain />
  </AbsoluteFill>
);
