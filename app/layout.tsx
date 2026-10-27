import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { preload } from 'react-dom'
import './globals.css'

const title = 'v0 — Motion Designer · Reel 2026'
const description =
  'A 15-second motion design showreel: kinetic type, shape morphs, generative particles and CSS 3D, built frame by frame in React with Remotion.'

export const metadata: Metadata = {
  title,
  description,
  generator: 'v0.app',
  openGraph: { title, description, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b0b0c',
}

const FONT_FILES = [
  '/showreel/fonts/Archivo-Variable.ttf',
  '/showreel/fonts/JetBrainsMono-Variable.ttf',
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  for (const href of FONT_FILES) {
    preload(href, { as: 'font', type: 'font/ttf', crossOrigin: 'anonymous' })
  }

  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
