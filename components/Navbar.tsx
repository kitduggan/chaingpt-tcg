'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import WalletButton from './WalletButton'

export default function Navbar() {
  const path = usePathname()

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`font-ui text-sm transition-colors ${
        path === href
          ? 'text-[#00f5ff] border-b border-[#00f5ff]'
          : 'text-gray-400 hover:text-[#00f5ff]'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-[#00f5ff]/20 bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/">
          <img src="/logo-cropped.png" alt="ChainGPT TCG" className="h-8 w-auto" style={{ mixBlendMode: 'screen' }} />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/collection"
            className="font-ui text-xs bg-[#00f5ff] text-black font-semibold px-4 py-2 rounded hover:bg-[#00f5ff]/80 transition-colors"
          >
            View Cards
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}
