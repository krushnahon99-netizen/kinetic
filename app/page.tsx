import { Hero } from '@/components/hero'
import { ShowreelPlayer } from '@/components/showreel-player'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Techniques } from '@/components/techniques'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <section aria-label="Showreel" className="mx-auto max-w-7xl px-5 md:px-10">
          <ShowreelPlayer />
        </section>
        <Techniques />
      </main>
      <SiteFooter />
    </>
  )
}
