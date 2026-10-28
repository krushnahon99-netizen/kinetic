import type { Metadata } from 'next'
import { DemoHeader } from '@/components/kh-demo/demo-header'
import { DemoIntro } from '@/components/kh-demo/demo-intro'
import { KhDemoPlayer } from '@/components/kh-demo/kh-demo-player'
import { SiteFooter } from '@/components/showreel/site-footer'

export const metadata: Metadata = {
  title: 'KH fill demo — Krushna Hon',
  description:
    'Three text-mask endings for Krushna Hon’s motion design reel: the reel’s own clips, orange liquid, or both, inside a giant KH.',
  robots: { index: false, follow: false },
}

export default function KhDemoPage() {
  return (
    <>
      <DemoHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <DemoIntro />
        <KhDemoPlayer />
      </main>
      <SiteFooter />
    </>
  )
}
