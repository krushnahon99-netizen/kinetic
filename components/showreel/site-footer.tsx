export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-5">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-signal px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-signal motion-safe:animate-pulse" />
            Available for hire
          </p>
          <a
            href="https://github.com/krushnahon99-netizen"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] tracking-[0.2em] text-bone underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            <span aria-hidden="true">{"→ "}</span>
            github.com/krushnahon99-netizen
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Rendered with Remotion 4.0 · Next.js 16
        </p>
      </div>
    </footer>
  );
}
