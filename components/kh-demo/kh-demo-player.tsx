"use client";

import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { CornerMarks } from "@/components/showreel/corner-marks";
import { KH_DEMO, KhDemo } from "@/remotion/kh-demo";
import { VIDEO } from "@/remotion/lib/theme";
import type { KhFillMode } from "@/remotion/scenes/kh-fill";
import { CueSheet } from "./cue-sheet";
import { DemoSpec } from "./demo-spec";
import { FILL_OPTIONS, RUN_UP_FRAME, cueAt, type CueId } from "./fill-options";
import { FillSwitcher } from "./fill-switcher";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export function KhDemoPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const cueProgressRef = useRef<HTMLSpanElement>(null);
  const [fill, setFill] = useState<KhFillMode>("both");
  const [activeCue, setActiveCue] = useState<CueId>("runUp");
  const prefersReducedMotion = usePrefersReducedMotion();
  const isClient = prefersReducedMotion !== null;
  const inputProps = useMemo(() => ({ fill }), [fill]);
  const option = FILL_OPTIONS.find((candidate) => candidate.id === fill) ?? FILL_OPTIONS[0];

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate: CallbackListener<"frameupdate"> = ({ detail: { frame } }) => {
      const reelFrame = KH_DEMO.from + frame;
      const cue = cueAt(reelFrame);
      setActiveCue(cue.id);
      // Written straight to the DOM so the per-frame progress line never re-renders the list.
      cueProgressRef.current?.style.setProperty(
        "transform",
        `scaleX(${(reelFrame - cue.from + 1) / (cue.to - cue.from)})`,
      );
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    return () => player.removeEventListener("frameupdate", onFrameUpdate);
  }, [isClient]);

  const selectFill = (next: KhFillMode) => {
    setFill(next);
    // While playing, restart at the run-up so the new fill plays from its first frame. While paused, stay on the
    // current frame, so the fills can be compared frame by frame.
    if (playerRef.current?.isPlaying()) playerRef.current.seekTo(RUN_UP_FRAME);
  };

  const jumpToCue = (reelFrame: number, event: MouseEvent<HTMLButtonElement>) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(reelFrame - KH_DEMO.from);
    player.play(event);
  };

  return (
    <>
      <FillSwitcher value={fill} onChange={selectFill} />

      <figure className="relative mt-8">
        <CornerMarks />
        <div className="aspect-video w-full overflow-hidden bg-ink ring-1 ring-border">
          {isClient ? (
            <Player
              ref={playerRef}
              component={KhDemo}
              inputProps={inputProps}
              durationInFrames={KH_DEMO.durationInFrames}
              fps={VIDEO.fps}
              compositionWidth={VIDEO.width}
              compositionHeight={VIDEO.height}
              autoPlay={!prefersReducedMotion}
              // An unmuted Player waits for its AudioContext to resume, which browsers block until a
              // user gesture, so an unmuted autoplay sits on frame 0. Start muted; viewers can unmute.
              initiallyMuted
              controls
              loop
              clickToPlay
              doubleClickToFullscreen
              style={{ width: "100%" }}
            />
          ) : null}
        </div>
        <figcaption className="sr-only">
          {`KH fill demo, fill ${option.index} (${option.label}): the last 4 seconds of the reel with the new ending. Switch fills with the buttons above.`}
        </figcaption>
      </figure>

      <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <DemoSpec />
        <CueSheet notes={option.notes} activeCue={activeCue} cueProgressRef={cueProgressRef} onSelect={jumpToCue} />
      </div>
    </>
  );
}
