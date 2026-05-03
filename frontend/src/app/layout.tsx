import type { Metadata } from 'next'
import { IBM_Plex_Mono, Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'BobForge',
  description: 'Convert API documentation into secure, tested, and agent-ready MCP tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${geistMono.variable} font-sans`}>
        <div className="min-h-[100dvh] bg-[color:var(--bg)] text-[color:var(--text)]">
          {children}
        </div>
      </body>
    </html>
  )
}

// Made with Bob
