import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { preload } from 'react-dom'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 — Motion Design Reel 2026',
  description:
    'A 15-second motion design showreel in eight scenes, cut to a 120 BPM grid. Every frame is a React component rendered with Remotion.',
  generator: 'v0.app',
  twitter: {
    card: 'summary_large_image',
  },
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
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
