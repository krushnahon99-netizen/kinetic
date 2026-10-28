export function DemoIntro() {
  return (
    <section className="grid gap-x-8 gap-y-6 pb-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end lg:pb-12">
      <div className="flex flex-col gap-5 lg:col-span-8">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal motion-safe:animate-pulse" />
          Ending study — KH text mask
        </p>
        <h1 className="text-balance text-[2.5rem] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] font-stretch-semi-expanded sm:text-6xl lg:text-7xl">
          What fills
          <br />
          the KH<span className="text-signal">?</span>
        </h1>
      </div>
      <p className="max-w-md text-pretty leading-relaxed text-muted-foreground lg:col-span-4 lg:justify-self-end">
        At 12.0 s a giant KH stencil takes over the reel, then collapses into the dot the end card pops from at 13.0 s.
        Same soundtrack, same hits, three fills. Unmute to hear them land.
      </p>
    </section>
  );
}
