import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import Providers from './providers'

const GridBackground = dynamic(() => import('@/components/GridBackground'), { ssr: false })

export const metadata: Metadata = {
  title: 'ChainGPT TCG Daily Onchain Card Game',
  description: 'Collect AI-powered trading cards on the blockchain. Open a free pack every day.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="crt bg-[#0a0a0f] min-h-screen antialiased">
        <GridBackground />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
