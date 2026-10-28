import { cn } from "@/lib/utils";
import type { KhFillMode } from "@/remotion/scenes/kh-fill";
import { FILL_OPTIONS } from "./fill-options";

type FillSwitcherProps = {
  value: KhFillMode;
  onChange: (fill: KhFillMode) => void;
};

export function FillSwitcher({ value, onChange }: FillSwitcherProps) {
  return (
    <section aria-labelledby="fill-switcher-title">
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <h2 id="fill-switcher-title">Choose a fill</h2>
        <p className="hidden sm:block">Pause, then switch to compare one frame</p>
      </div>
      <div role="group" aria-labelledby="fill-switcher-title" className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {FILL_OPTIONS.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex flex-col gap-3 border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:gap-4 sm:p-5",
                isActive
                  ? "border-signal bg-signal text-ink"
                  : "border-border text-muted-foreground hover:border-bone/40 hover:text-bone",
              )}
            >
              <span className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
                {option.index}
                <span aria-hidden="true" className={cn("size-1.5 shrink-0", isActive ? "bg-ink" : "bg-bone/20")} />
              </span>
              <span className="text-balance text-base font-extrabold uppercase leading-none tracking-[-0.01em] font-stretch-semi-expanded sm:text-2xl">
                {option.label}
              </span>
              <span className={cn("hidden text-pretty text-sm leading-relaxed sm:block", isActive && "text-ink/80")}>
                {option.summary}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
