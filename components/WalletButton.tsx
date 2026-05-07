'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="font-ui text-xs bg-[#00f5ff] text-black font-semibold px-3 py-1.5 rounded whitespace-nowrap hover:bg-[#00f5ff]/80 transition-colors"
              >
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="font-ui text-xs border border-red-500 text-red-500 px-3 py-1.5 rounded whitespace-nowrap hover:bg-red-500/10 transition-colors"
              >
                Wrong Network
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="font-ui text-xs border border-[#00f5ff] text-[#00f5ff] px-3 py-1.5 rounded whitespace-nowrap hover:bg-[#00f5ff]/10 transition-colors"
              >
                {account.displayName}
              </button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
