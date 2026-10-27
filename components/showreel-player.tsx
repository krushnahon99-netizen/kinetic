"use client";

import { Player, type CallbackListener, type PlayerRef } from "@remotion/player";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChapterList } from "@/components/showreel/chapter-list";
import { CornerMarks } from "@/components/showreel/corner-marks";
import { SCENES, VIDEO, sceneAt, type SceneId } from "@/remotion/lib/theme";
import { Showreel } from "@/remotion/showreel";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => null;

type ShowreelPlayerProps = {
  aside: ReactNode;
};

export function ShowreelPlayer({ aside }: ShowreelPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const sceneProgressRef = useRef<HTMLSpanElement>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("boot");
  // null during SSR and hydration, so the Player mounts once on the client with autoPlay already decided.
  const prefersReducedMotion = useSyncExternalStore<boolean | null>(
    subscribeToReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const isClient = prefersReducedMotion !== null;

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate: CallbackListener<"frameupdate"> = ({ detail: { frame } }) => {
      const scene = sceneAt(frame);
      const { from, duration } = SCENES[scene];
      setActiveScene(scene);
      // Written straight to the DOM so the per-frame progress line never re-renders the list.
      sceneProgressRef.current?.style.setProperty("transform", `scaleX(${(frame - from + 1) / duration})`);
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    return () => player.removeEventListener("frameupdate", onFrameUpdate);
  }, [isClient]);

  const jumpToScene = (scene: SceneId, event: MouseEvent<HTMLButtonElement>) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(SCENES[scene].from);
    player.play(event);
  };

  return (
    <>
      <figure className="relative">
        <CornerMarks />
        <div className="aspect-video w-full overflow-hidden bg-ink ring-1 ring-border">
          {isClient ? (
            <Player
              ref={playerRef}
              component={Showreel}
              durationInFrames={VIDEO.durationInFrames}
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
          v0 motion design reel: 15 seconds in eight scenes. Use the player controls or the scene index below to
          navigate.
        </figcaption>
      </figure>

      <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        {aside}
        <ChapterList activeScene={activeScene} sceneProgressRef={sceneProgressRef} onSelect={jumpToScene} />
      </div>
    </>
  );
}
