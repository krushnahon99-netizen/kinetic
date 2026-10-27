import { ArrowDownToLine } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-4 font-mono text-[11px] uppercase tracking-[0.2em] sm:px-6 lg:px-8">
        <p className="flex items-center gap-2.5 text-bone">
          <span aria-hidden="true" className="size-2 bg-signal" />
          v0 — Motion reel 2026
        </p>
        <p className="hidden text-muted-foreground md:block">1920×1080 · 30 fps · 120 BPM</p>
        <a
          href="/showreel/showreel.mp4"
          download
          className="flex items-center gap-2 text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
        >
          Download
          <ArrowDownToLine aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </header>
  );
}
