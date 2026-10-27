import type { CSSProperties } from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { tween } from "../lib/easing";
import { BEAT, COLORS, LETTERBOX, MONO_STACK, SCENES, sceneAt } from "../lib/theme";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/+<>";
const SIDE = 40;

const mono: CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: 17,
  fontVariationSettings: "'wght' 500",
  letterSpacing: "0.14em",
  lineHeight: 1,
  color: COLORS.bone,
  whiteSpace: "pre",
};

const row: CSSProperties = {
  position: "absolute",
  left: SIDE,
  right: SIDE,
  height: LETTERBOX,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const centered: CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
};

const pad = (value: number) => String(value).padStart(2, "0");

const timecode = (frame: number, fps: number) => {
  const seconds = Math.floor(frame / fps);
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}:${pad(frame % fps)}`;
};

const typeOn = (text: string, frame: number, start: number, perFrame = 2) =>
  text.slice(0, Math.max(0, Math.floor((frame - start) * perFrame)));

/** Characters resolve left to right out of random glyphs whenever the section changes. */
const scramble = (text: string, frame: number, start: number) => {
  const elapsed = frame - start;
  return Array.from(text)
    .map((char, i) => {
      if (char === " " || elapsed >= 3 + i * 0.55) return char;
      return GLYPHS[Math.floor(random(`hud-${start}-${i}-${frame}`) * GLYPHS.length)];
    })
    .join("");
};

export const Hud = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scene = SCENES[sceneAt(frame)];
  const activeBeat = Math.floor(frame / BEAT) % 4;
  const recOn = frame % fps < 20;
  const opacity = tween(frame, [0, 4], [0, 1]) * tween(frame, [438, 446], [1, 0]);
  const reel = frame / (durationInFrames - 1);

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      <div style={{ ...row, top: 0 }}>
        <span style={mono}>{typeOn("v0 — MOTION REEL 2026", frame, 2)}</span>
        <span style={{ ...mono, ...centered, opacity: 0.45 }}>
          {typeOn("1920×1080 · 30 FPS · 120 BPM", frame, 6)}
        </span>
        <span style={mono}>
          <span style={{ opacity: 0.45 }}>TC </span>
          {timecode(frame, fps)}
        </span>
      </div>

      <div style={{ ...row, bottom: 0 }}>
        <span style={mono}>{scramble(scene.label, frame, scene.from)}</span>
        <div style={{ ...centered, width: 360, height: 2, backgroundColor: "rgba(242, 239, 232, 0.18)" }}>
          <div style={{ width: `${reel * 100}%`, height: "100%", backgroundColor: COLORS.signal }} />
        </div>
        <span style={{ ...mono, display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((beat) => (
              <span
                key={beat}
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: beat === activeBeat ? COLORS.signal : "rgba(242, 239, 232, 0.25)",
                }}
              />
            ))}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                backgroundColor: COLORS.signal,
                opacity: recOn ? 1 : 0.15,
              }}
            />
            REC
          </span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
