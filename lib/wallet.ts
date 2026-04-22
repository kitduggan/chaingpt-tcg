// Mock wallet state — replace with RainbowKit useAccount() hook in production
// import { useAccount, useConnect, useDisconnect } from 'wagmi'

import { create } from 'zustand'

interface WalletStore {
  connected: boolean
  address: string | null
  connect: () => void
  disconnect: () => void
}

// Zustand store simulates wallet state without a real provider
// Swap this entire store for wagmi hooks when integrating RainbowKit
export const useWallet = create<WalletStore>((set) => ({
  connected: false,
  address: null,
  connect: () => set({ connected: true, address: '0xDEAD...BEEF' }),
  disconnect: () => set({ connected: false, address: null }),
}))
