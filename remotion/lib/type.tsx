import type { CSSProperties } from "react";
import { COLORS, DISPLAY_STACK, MONO_STACK, axes } from "./theme";

export const mono = (size: number, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: MONO_STACK,
  fontSize: size,
  fontVariationSettings: "'wght' 500",
  letterSpacing: "0.18em",
  lineHeight: 1,
  color: COLORS.bone,
  whiteSpace: "pre",
  ...extra,
});

export const display = (
  size: number,
  wdth: number,
  wght: number,
  extra: CSSProperties = {},
): CSSProperties => ({
  fontFamily: DISPLAY_STACK,
  fontSize: size,
  fontVariationSettings: axes(wdth, wght),
  lineHeight: 0.9,
  color: COLORS.bone,
  whiteSpace: "pre",
  ...extra,
});

export const typedLength = (text: string, frame: number, start: number, perFrame = 2) =>
  Math.min(text.length, Math.max(0, Math.floor((frame - start) * perFrame)));

/** Types `text` on while reserving its full width, so centered or right-aligned layouts never shift. */
export const Typed = ({
  text,
  frame,
  start,
  perFrame = 2,
  style,
}: {
  text: string;
  frame: number;
  start: number;
  perFrame?: number;
  style?: CSSProperties;
}) => {
  const count = typedLength(text, frame, start, perFrame);
  return (
    <span style={style}>
      {text.slice(0, count)}
      <span style={{ opacity: 0 }}>{text.slice(count)}</span>
    </span>
  );
};
