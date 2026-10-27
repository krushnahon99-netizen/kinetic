const TECHNIQUES = [
  {
    title: 'Beat grid',
    scene: 'Every scene',
    body: '120 BPM at 30 fps puts a beat every 15 frames. Every cut, hit and color flip lands on that grid.',
  },
  {
    title: 'Variable type',
    scene: 'Kinetic type',
    body: "Archivo's width axis is animated from 62 to 125 every frame, and ghost copies sampled 0.9 frames apart fake the motion blur.",
  },
  {
    title: 'Clean morphs',
    scene: 'Shape',
    body: 'Circle, square, triangle and star are sampled at the same 120 angles, so each morph is a per-point blend with no artifacts.',
  },
  {
    title: 'Deterministic particles',
    scene: 'Generative',
    body: 'Three hundred particles ride a noise flow field that is simulated once and cached, so any frame can render on its own.',
  },
  {
    title: 'Infinite zoom',
    scene: 'Depth',
    body: 'Tunnel frames scale 1.32× per step, so the zoom loops seamlessly while a CSS 3D type cube turns one face per beat.',
  },
  {
    title: 'Frozen-frame montage',
    scene: 'Recap',
    body: "A 3×3 wall of real frames from earlier scenes, frozen with Remotion's Freeze and flipped in a ripple from the center.",
  },
] as const

const LABEL = 'font-mono text-[11px] tracking-[0.12em] uppercase'

export function Techniques() {
  return (
    <section
      id="process"
      aria-labelledby="process-title"
      className="mx-auto max-w-7xl scroll-mt-6 px-5 py-20 md:px-10 md:py-28"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={`${LABEL} flex items-center gap-2 text-muted-foreground`}>
            <span aria-hidden="true" className="size-2 bg-signal" />
            Fig. 08 — Process
          </p>
          <h2
            id="process-title"
            className="mt-4 text-[length:clamp(2.5rem,8vw,5rem)] leading-[0.9] font-extrabold tracking-[-0.02em] uppercase [font-stretch:125%]"
          >
            Under the hood
          </h2>
        </div>
        <p className="max-w-sm leading-relaxed text-pretty text-muted-foreground">
          Built in React with Remotion. Every move is a pure function of the frame number, so the
          reel renders the same in your browser and to MP4.
        </p>
      </div>

      <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {TECHNIQUES.map((technique, index) => (
          <li key={technique.title} className="flex flex-col bg-background p-6 md:p-8">
            <div className={`${LABEL} flex items-center justify-between gap-4 text-muted-foreground`}>
              <span className="text-signal tabular-nums">{String(index + 1).padStart(2, '0')}</span>
              <span className="flex items-center gap-2">
                <span aria-hidden="true" className="size-1.5 bg-cobalt" />
                {technique.scene}
              </span>
            </div>
            <h3 className="mt-10 text-xl font-bold tracking-[-0.01em] md:text-2xl">
              {technique.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{technique.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
