import { cn } from '@/lib/utils'
import { SCENE_ORDER, SCENES, VIDEO, type SceneId } from '@/remotion/lib/theme'

const CHAPTERS: Record<SceneId, { title: string; cut: string }> = {
  boot: { title: 'Boot', cut: 'Match cut' },
  title: { title: 'Intro', cut: 'Slat wipe' },
  kinetic: { title: 'Kinetic type', cut: 'Flash' },
  shape: { title: 'Shape', cut: 'Flash' },
  generative: { title: 'Generative', cut: 'Iris' },
  depth: { title: 'Depth', cut: 'Flash' },
  montage: { title: 'Recap', cut: 'Whip-pan' },
  finale: { title: 'End card', cut: 'Fade out' },
}

const PROGRESS = {
  past: 'scaleX(1)',
  active: 'scaleX(var(--scene-progress, 0))',
  future: 'scaleX(0)',
} as const

const timecode = (frame: number) => {
  const seconds = String(Math.floor(frame / VIDEO.fps)).padStart(2, '0')
  const frames = String(frame % VIDEO.fps).padStart(2, '0')
  return `${seconds}:${frames}`
}

type SceneChaptersProps = {
  active: SceneId
  onSelect: (id: SceneId) => void
}

export function SceneChapters({ active, onSelect }: SceneChaptersProps) {
  const activeIndex = SCENE_ORDER.indexOf(active)

  return (
    <nav aria-label="Chapters">
      <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-4 lg:grid-cols-8">
        {SCENE_ORDER.map((id, index) => {
          const isActive = index === activeIndex
          const state = index < activeIndex ? 'past' : isActive ? 'active' : 'future'

          return (
            <li key={id} className="flex">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'relative flex w-full flex-col items-start gap-1 bg-background px-3 pt-3 pb-4 text-left transition-colors outline-none hover:bg-card focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-inset',
                  isActive && 'bg-card',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[11px] tracking-[0.12em] tabular-nums',
                    isActive ? 'text-signal' : 'text-muted-foreground',
                  )}
                >
                  {timecode(SCENES[id].from)}
                </span>
                <span className="text-sm font-semibold">{CHAPTERS[id].title}</span>
                <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                  <span aria-hidden="true">→ </span>
                  <span className="sr-only">, cut: </span>
                  {CHAPTERS[id].cut}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal"
                  style={{ transform: PROGRESS[state] }}
                />
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
