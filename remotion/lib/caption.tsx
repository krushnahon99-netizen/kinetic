import type { CSSProperties, ReactNode } from "react";
import { progress } from "./easing";
import { COLORS } from "./theme";
import { Typed, mono } from "./type";

/** Left-side figure caption: Signal square, typed mono lines (first bright, rest dim), optional live lines below. */
export const FigCaption = ({
  frame,
  start,
  lines,
  style,
  children,
}: {
  frame: number;
  start: number;
  lines: string[];
  style?: CSSProperties;
  children?: ReactNode;
}) => (
  <div style={{ position: "absolute", display: "flex", gap: 14, opacity: progress(frame, start, 6), ...style }}>
    <span style={{ width: 9, height: 9, marginTop: 3, backgroundColor: COLORS.signal }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {lines.map((line, i) => (
        <Typed
          key={i}
          text={line}
          frame={frame}
          start={start + i * 4}
          perFrame={3}
          style={mono(15, { opacity: i === 0 ? 0.9 : 0.5 })}
        />
      ))}
      {children}
    </div>
  </div>
);

/** Right-side numbered state list; the active row lights up in Signal. */
export const StateList = ({
  frame,
  start,
  items,
  active,
  style,
}: {
  frame: number;
  start: number;
  items: string[];
  active: number;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 14,
      opacity: progress(frame, start, 6),
      ...style,
    }}
  >
    {items.map((name, i) => {
      const on = i === active;
      return (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={mono(16, { color: on ? COLORS.signal : COLORS.bone, opacity: on ? 1 : 0.35 })}>
            {`0${i + 1}  ${name}`}
          </span>
          <span
            style={{
              width: 10,
              height: 10,
              backgroundColor: on ? COLORS.signal : "transparent",
              border: `1.5px solid ${on ? COLORS.signal : `${COLORS.bone}59`}`,
            }}
          />
        </div>
      );
    })}
  </div>
);
