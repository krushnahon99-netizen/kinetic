import type { MouseEvent, RefObject } from "react";
import { timecode } from "@/components/showreel/chapters";
import { cn } from "@/lib/utils";
import { CUES, type CueId } from "./fill-options";

type CueSheetProps = {
  notes: Record<CueId, string>;
  activeCue: CueId;
  cueProgressRef: RefObject<HTMLSpanElement | null>;
  onSelect: (reelFrame: number, event: MouseEvent<HTMLButtonElement>) => void;
};

export function CueSheet({ notes, activeCue, cueProgressRef, onSelect }: CueSheetProps) {
  return (
    <section aria-labelledby="cue-sheet-title">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <h2 id="cue-sheet-title">Cue sheet</h2>
        <p>Select to jump</p>
      </div>
      <ol>
        {CUES.map((cue) => {
          const isActive = cue.id === activeCue;
          return (
            <li key={cue.id} className="border-b border-border">
              <button
                type="button"
                onClick={(event) => onSelect(cue.from, event)}
                aria-current={isActive ? "true" : undefined}
                className="group relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1.5 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-signal sm:grid-cols-[7.5rem_7rem_minmax(0,1fr)]"
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
                  {cue.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground sm:order-1">
                  {timecode(cue.from)}
                </span>
                <span
                  className={cn(
                    "col-span-2 text-pretty text-sm leading-relaxed transition-colors sm:order-3 sm:col-span-1",
                    isActive ? "text-bone/85" : "text-muted-foreground",
                  )}
                >
                  {notes[cue.id]}
                </span>
                {isActive ? (
                  <span
                    ref={cueProgressRef}
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
