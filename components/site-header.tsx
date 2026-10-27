import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] uppercase"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-signal font-sans text-[11px] font-extrabold tracking-normal text-ink normal-case [font-stretch:125%]">
            v0
          </span>
          Motion Reel 2026
        </Link>
        <p className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-signal motion-safe:animate-blink"
          />
          Available for hire
        </p>
      </div>
    </header>
  )
}
