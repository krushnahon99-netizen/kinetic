'use client'

import { Player, type PlayerRef } from '@remotion/player'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { SceneChapters } from '@/components/scene-chapters'
import { BEAT, SCENES, VIDEO, sceneAt, type SceneId } from '@/remotion/lib/theme'
import { Showreel } from '@/remotion/showreel'

const PLAYER_STYLE: CSSProperties = {
  width: '100%',
  aspectRatio: `${VIDEO.width} / ${VIDEO.height}`,
}

const SPECS = [
  `${VIDEO.width}×${VIDEO.height}`,
  `${VIDEO.fps} fps`,
  `${(60 * VIDEO.fps) / BEAT} BPM`,
  `${VIDEO.durationInFrames} frames`,
]

const LABEL = 'font-mono text-[11px] tracking-[0.12em] uppercase'

export function ShowreelPlayer() {
  const playerRef = useRef<PlayerRef>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<SceneId>('boot')

  useEffect(() => {
    const player = playerRef.current
    if (!player) return

    const onFrame = ({ detail }: { detail: { frame: number } }) => {
      const id = sceneAt(detail.frame)
      const { from, duration } = SCENES[id]
      timelineRef.current?.style.setProperty(
        '--scene-progress',
        String((detail.frame - from + 1) / duration),
      )
      setActive(id)
    }

    player.addEventListener('frameupdate', onFrame)
    return () => player.removeEventListener('frameupdate', onFrame)
  }, [])

  const jumpTo = (id: SceneId) => {
    playerRef.current?.seekTo(SCENES[id].from)
    playerRef.current?.play()
  }

  return (
    <div className="flex flex-col gap-6">
      <figure className="overflow-hidden rounded-md border border-border bg-card">
        <figcaption
          className={`${LABEL} flex items-center justify-between gap-4 border-b border-border px-3 py-2.5 text-muted-foreground`}
        >
          <span>
            <span className="sr-only">Motion design showreel, </span>
            REEL_2026.MOV
          </span>
          <span className="flex items-center gap-2 text-foreground">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-signal motion-safe:animate-blink"
            />
            Live render
          </span>
        </figcaption>
        <Player
          ref={playerRef}
          component={Showreel}
          durationInFrames={VIDEO.durationInFrames}
          fps={VIDEO.fps}
          compositionWidth={VIDEO.width}
          compositionHeight={VIDEO.height}
          controls
          loop
          autoPlay
          style={PLAYER_STYLE}
        />
        <ul
          aria-label="Video specs"
          className={`${LABEL} flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-3 py-2.5 text-muted-foreground`}
        >
          {SPECS.map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>
      </figure>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className={LABEL}>Chapters</h2>
          <p className={`${LABEL} text-muted-foreground`}>Timecode ss:ff · click to jump</p>
        </div>
        <div ref={timelineRef}>
          <SceneChapters active={active} onSelect={jumpTo} />
        </div>
      </div>
    </div>
  )
}
