export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between md:px-10">
        <p>© 2026 v0 — Motion design reel</p>
        <p>
          Remotion 4.0 + Next.js 16 ·{' '}
          <a
            href="https://v0.app"
            className="text-foreground underline-offset-4 hover:text-signal hover:underline"
          >
            v0.app
          </a>
        </p>
      </div>
    </footer>
  )
}
