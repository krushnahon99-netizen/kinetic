export function Hero() {
  return (
    <section className="grid gap-x-8 gap-y-6 pb-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end lg:pb-12">
      <div className="flex flex-col gap-5 lg:col-span-8">
        <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal motion-safe:animate-pulse" />
          Showreel — selected work 2024—2026
        </p>
        <h1 className="text-balance text-[2.5rem] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] font-stretch-semi-expanded sm:text-6xl lg:text-7xl">
          Motion,
          <br />
          made of code<span className="text-signal">.</span>
        </h1>
      </div>
      <p className="max-w-md text-pretty leading-relaxed text-muted-foreground lg:col-span-4 lg:justify-self-end">
        A 15-second reel in eight scenes, cut to a 120 BPM grid. Every frame is a React component, rendered live in
        your browser by Remotion. No After Effects, no stock footage.
      </p>
    </section>
  );
}
