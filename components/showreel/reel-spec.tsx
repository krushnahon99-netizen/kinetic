import { ArrowDownToLine } from "lucide-react";
import { DownloadLink } from "./download-link";

const SPEC = [
  { term: "Runtime", detail: "00:15 · 450 frames" },
  { term: "Format", detail: "1920×1080 · 30 fps" },
  { term: "Tempo", detail: "120 BPM, cut on the beat" },
  { term: "Type", detail: "Archivo variable, JetBrains Mono" },
  { term: "Engine", detail: "Remotion 4.0 · React 19" },
];

export function ReelSpec() {
  return (
    <section aria-labelledby="spec-sheet-title" className="flex flex-col gap-8">
      <div>
        <h2
          id="spec-sheet-title"
          className="border-b border-border pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Spec sheet
        </h2>
        <dl className="divide-y divide-border">
          {SPEC.map(({ term, detail }) => (
            <div key={term} className="flex items-baseline justify-between gap-4 py-3.5">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">{term}</dt>
              <dd className="text-right text-sm">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <DownloadLink className="group flex items-center justify-between gap-3 bg-signal px-5 py-4 font-mono text-sm font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
          Download MP4
          <ArrowDownToLine
            aria-hidden="true"
            className="size-4 motion-safe:transition-transform motion-safe:group-hover:translate-y-0.5"
          />
        </DownloadLink>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">H.264 · 1080p · 15 s</p>
      </div>
    </section>
  );
}
