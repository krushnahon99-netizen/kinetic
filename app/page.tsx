import { ShowreelPlayer } from '@/components/showreel-player'
import { Hero } from '@/components/showreel/hero'
import { ReelSpec } from '@/components/showreel/reel-spec'
import { SiteFooter } from '@/components/showreel/site-footer'
import { SiteHeader } from '@/components/showreel/site-header'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <Hero />
        <ShowreelPlayer aside={<ReelSpec />} />
      </main>
      <SiteFooter />
    </>
  )
}
