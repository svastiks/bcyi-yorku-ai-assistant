import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AI Content Assistant',
  description: 'AI-powered content assistant for newsletters, blog posts, donor emails, and social media',
  icons: {
    icon: [
      {
        url: '/icons/aorta-heart.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icons/aorta-heart.png',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          {children}
          {process.env.NODE_ENV === 'production' ? <Analytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  )
}
