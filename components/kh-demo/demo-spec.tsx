import { DEMO_SPEC } from "./fill-options";

export function DemoSpec() {
  return (
    <section aria-labelledby="demo-spec-title" className="flex flex-col gap-8">
      <div>
        <h2
          id="demo-spec-title"
          className="border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Spec sheet
        </h2>
        <dl className="divide-y divide-border">
          {DEMO_SPEC.map(({ term, detail }) => (
            <div key={term} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{term}</dt>
              <dd className="text-right text-sm">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <p className="inline-flex w-fit items-center gap-2.5 rounded-full border border-signal px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
          Not in the reel yet
        </p>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          The homepage video and the MP4 download stay as they are until one fill is picked.
        </p>
      </div>
    </section>
  );
}
