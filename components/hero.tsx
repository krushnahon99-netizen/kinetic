import { ArrowDown, Download } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ACTION = 'h-11 gap-2 px-4 font-mono text-xs tracking-[0.12em] uppercase'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto max-w-7xl px-5 pt-10 pb-8 md:px-10 md:pt-20 md:pb-12"
    >
      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
        <span aria-hidden="true" className="size-2 bg-signal" />
        Selected work 2024—2026
      </p>
      <h1
        id="hero-title"
        className="mt-5 text-[length:clamp(3.5rem,16vw,12rem)] leading-[0.82] tracking-[-0.02em] uppercase"
      >
        <span className="block font-extrabold [font-stretch:125%]">Motion</span>
        <span className="block font-light text-signal [font-stretch:62%] md:text-right">
          Designer
        </span>
      </h1>
      <div className="mt-8 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
        <p className="max-w-md text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Fifteen seconds of timing, spacing and rhythm. Every frame below is React code,
          rendered live in your browser.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/showreel/showreel.mp4"
            download="v0-motion-reel-2026.mp4"
            className={cn(buttonVariants(), ACTION)}
          >
            <Download aria-hidden="true" />
            Download MP4
          </a>
          <a href="#process" className={cn(buttonVariants({ variant: 'outline' }), ACTION)}>
            How it&apos;s made
            <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}
