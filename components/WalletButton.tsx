'use client'

// Real integration: replace useWallet() calls with useAccount/useConnect/useDisconnect from wagmi
// and wrap with <WagmiConfig> + <RainbowKitProvider> in layout.tsx
import { useWallet } from '@/lib/wallet'

export default function WalletButton() {
  const { connected, address, connect, disconnect } = useWallet()

  return connected ? (
    <button
      onClick={disconnect}
      className="font-ui text-xs border border-[#00f5ff] text-[#00f5ff] px-3 py-2 rounded hover:bg-[#00f5ff]/10 transition-colors"
    >
      {address}
    </button>
  ) : (
    <button
      onClick={connect}
      className="font-ui text-xs bg-[#00f5ff] text-black font-semibold px-4 py-2 rounded hover:bg-[#00f5ff]/80 transition-colors"
    >
      Connect Wallet
    </button>
  )
}
