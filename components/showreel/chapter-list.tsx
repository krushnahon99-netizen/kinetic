import type { MouseEvent, RefObject } from "react";
import { cn } from "@/lib/utils";
import type { SceneId } from "@/remotion/lib/theme";
import { CHAPTERS, timecode } from "./chapters";

type ChapterListProps = {
  activeScene: SceneId;
  sceneProgressRef: RefObject<HTMLSpanElement | null>;
  onSelect: (scene: SceneId, event: MouseEvent<HTMLButtonElement>) => void;
};

export function ChapterList({ activeScene, sceneProgressRef, onSelect }: ChapterListProps) {
  return (
    <section aria-labelledby="scene-index-title">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <h2 id="scene-index-title">Scene index</h2>
        <p>Select to jump</p>
      </div>
      <ol>
        {CHAPTERS.map((chapter) => {
          const isActive = chapter.id === activeScene;
          return (
            <li key={chapter.id} className="border-b border-border">
              <button
                type="button"
                onClick={(event) => onSelect(chapter.id, event)}
                aria-current={isActive ? "true" : undefined}
                className="group relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1.5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal sm:grid-cols-[7.5rem_13rem_minmax(0,1fr)]"
              >
                <span
                  className={cn(
                    "flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors sm:order-2",
                    isActive ? "text-bone" : "text-muted-foreground group-hover:text-bone",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("size-1.5 shrink-0 transition-colors", isActive ? "bg-signal" : "bg-bone/20")}
                  />
                  {chapter.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground sm:order-1">
                  {timecode(chapter.from)}
                </span>
                <span
                  className={cn(
                    "col-span-2 text-pretty text-sm leading-relaxed transition-colors sm:order-3 sm:col-span-1",
                    isActive ? "text-bone/85" : "text-muted-foreground",
                  )}
                >
                  {chapter.technique}
                </span>
                {isActive ? (
                  <span
                    ref={sceneProgressRef}
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-px h-px origin-left bg-signal"
                    style={{ transform: "scaleX(0)" }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
