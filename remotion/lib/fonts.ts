import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { FONTS } from "./theme";

let requested = false;

/**
 * Registers the variable fonts once. Skipped on the server because Next.js also
 * evaluates this module during SSR, where FontFace does not exist.
 */
export const ensureFonts = () => {
  if (requested || typeof window === "undefined") return;
  requested = true;

  loadFont({
    family: FONTS.display,
    url: staticFile("showreel/fonts/Archivo-Variable.ttf"),
    weight: "100 900",
    stretch: "62% 125%",
    format: "truetype",
  });
  loadFont({
    family: FONTS.mono,
    url: staticFile("showreel/fonts/JetBrainsMono-Variable.ttf"),
    weight: "100 800",
    format: "truetype",
  });
};
