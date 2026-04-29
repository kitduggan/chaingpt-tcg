'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_CARDS, RARITY_COLORS, type Card } from '@/lib/cards'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

function CollectionCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const color = card.color ?? RARITY_COLORS[card.rarity]
  return (
    <motion.div
      className="cursor-pointer flex flex-col items-center gap-3"
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={onClick}
    >
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          border: `2px solid ${color}60`,
          boxShadow: `0 0 20px ${color}40, 0 12px 40px rgba(0,0,0,0.6)`,
        }}
      >
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" draggable={false} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-pixel text-[8px] text-center leading-tight"
          style={{ color, textShadow: `0 0 8px ${color}` }}
        >
          {card.rarity.toUpperCase()}
        </span>
        <span className="font-ui text-xs text-gray-300 text-center leading-tight">{card.name}</span>
      </div>
    </motion.div>
  )
}

function LockedCard() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: '2/3', background: '#0d0d18', border: '2px solid #ffffff08' }}
      >
        <span className="font-pixel text-2xl text-gray-700">?</span>
      </div>
      <span className="font-pixel text-[7px] text-gray-700">LOCKED</span>
    </div>
  )
}

export default function Collection() {
  const [lightbox, setLightbox] = useState<Card | null>(null)
  const { address, isConnected } = useAccount()

  const { data: rawCardTypes, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOwnedCardTypes',
    args: [address!],
    query: { enabled: !!address },
  })

  // Deduplicate: owning 3 copies of card #5 counts as 1 collected
  const ownedIds = new Set(rawCardTypes ? Array.from(rawCardTypes as readonly number[]) : [])

  const owned   = ALL_CARDS.filter(c =>  ownedIds.has(c.id))
  const unowned = ALL_CARDS.filter(c => !ownedIds.has(c.id))
  const ownedCount = owned.length

  return (
    <div className="min-h-screen pt-14 pb-20">

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-[8px] text-[#00f5ff]/50 tracking-widest mb-2">YOUR COLLECTION</p>
            <h1 className="font-pixel text-lg text-white" style={{ textShadow: '0 0 20px #00f5ff60' }}>
              CARD COLLECTION
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="font-ui text-sm text-gray-400">
              <span className="text-[#00ff85] font-bold text-base">{ownedCount}</span>
              <span className="text-gray-600"> / {ALL_CARDS.length} cards</span>
            </span>
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00f5ff] to-[#00ff85] rounded-full transition-all duration-700"
                style={{ width: `${(ownedCount / ALL_CARDS.length) * 100}%` }}
              />
            </div>
            <span className="font-pixel text-[7px] text-gray-600">
              {Math.round((ownedCount / ALL_CARDS.length) * 100)}% COMPLETE
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 flex flex-col gap-16">

        {/* Not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="font-pixel text-[9px] text-gray-500">CONNECT YOUR WALLET</p>
            <p className="font-ui text-sm text-gray-600">to see your on-chain card collection</p>
          </div>
        )}

        {/* Loading */}
        {isConnected && isLoading && (
          <div className="flex items-center justify-center py-24">
            <p
              className="font-pixel text-[9px] text-[#00f5ff]"
              style={{ animation: 'pulse 1.4s ease-in-out infinite' }}
            >
              LOADING COLLECTION...
            </p>
          </div>
        )}

        {/* Cards */}
        {isConnected && !isLoading && (
          <>
            {/* Owned */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <h2 className="font-pixel text-[10px] text-white tracking-widest">COLLECTED</h2>
                <div className="flex-1 h-px bg-white/10" />
                <span className="font-pixel text-[7px] text-[#00ff85]">{ownedCount} CARDS</span>
              </div>

              {owned.length === 0 ? (
                <p className="font-ui text-sm text-gray-600 text-center py-10">
                  No cards yet — open a pack!
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {owned.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <CollectionCard card={card} onClick={() => setLightbox(card)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Locked */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <h2 className="font-pixel text-[10px] text-gray-600 tracking-widest">NOT YET COLLECTED</h2>
                <div className="flex-1 h-px bg-white/5" />
                <span className="font-pixel text-[7px] text-gray-600">{unowned.length} CARDS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 opacity-40">
                {unowned.map(card => (
                  <LockedCard key={card.id} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              className="relative"
              style={{ width: 'min(70vw, 340px)' }}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '2/3',
                  border: `2px solid ${(lightbox.color ?? RARITY_COLORS[lightbox.rarity])}80`,
                  boxShadow: `0 0 60px ${(lightbox.color ?? RARITY_COLORS[lightbox.rarity])}60`,
                }}
              >
                <img src={lightbox.image} alt={lightbox.name} className="w-full h-full object-cover" />
              </div>
              <p
                className="font-pixel text-[9px] text-center mt-4"
                style={{ color: lightbox.color ?? RARITY_COLORS[lightbox.rarity] }}
              >
                {lightbox.name}
              </p>
              <p className="font-ui text-xs text-gray-500 text-center mt-1">{lightbox.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
