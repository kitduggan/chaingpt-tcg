'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ALL_CARDS, RARITY_COLORS, type Card } from '@/lib/cards'
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'
import { getEarnedCards, removeEarnedCard, removeEarnedCards } from '@/lib/storage'

// ── Sub-components ────────────────────────────────────────────────────────────

function CardTile({ card, badge, onClick }: { card: Card; badge?: React.ReactNode; onClick: () => void }) {
  const color = card.color ?? RARITY_COLORS[card.rarity]
  return (
    <motion.div
      className="cursor-pointer flex flex-col items-center gap-3"
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={onClick}
    >
      <div className="relative w-full">
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
        {badge}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="font-pixel text-[8px] text-center leading-tight" style={{ color, textShadow: `0 0 8px ${color}` }}>
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function Collection() {
  const [lightbox, setLightbox]   = useState<Card | null>(null)
  const [mintingId, setMintingId] = useState<number | null>(null)
  const [mintingAll, setMintingAll] = useState(false)
  const [earnedIds, setEarnedIds]   = useState<number[]>([])

  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  // Load earned cards from localStorage whenever address changes
  useEffect(() => {
    setEarnedIds(address ? getEarnedCards(address) : [])
  }, [address])

  // Minted NFTs — read live from contract
  const { data: rawMinted, isLoading, refetch: refetchMinted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOwnedCardTypes',
    args: [address!],
    query: { enabled: !!address },
  })

  const mintedIds = new Set(rawMinted ? Array.from(rawMinted as readonly number[]) : [])

  // Count of each earned card type
  const earnedCounts = earnedIds.reduce<Record<number, number>>((acc, id) => {
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})

  const uniqueEarnedCards = ALL_CARDS.filter(c => earnedCounts[c.id])
  const mintedCards       = ALL_CARDS.filter(c => mintedIds.has(c.id))
  const allOwnedIds       = new Set([...earnedIds, ...Array.from(mintedIds)])
  const notOwned          = ALL_CARDS.filter(c => !allOwnedIds.has(c.id))
  const totalOwned        = allOwnedIds.size

  // ── Mint handlers ──────────────────────────────────────────────────────────

  const handleMintOne = async (cardTypeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!address || mintingId !== null || mintingAll) return
    setMintingId(cardTypeId)
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintCard',
        args: [cardTypeId],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      removeEarnedCard(address, cardTypeId)
      setEarnedIds(getEarnedCards(address))
      refetchMinted()
    } catch (err) {
      console.error('Mint failed:', err)
    } finally {
      setMintingId(null)
    }
  }

  const handleMintAll = async () => {
    if (!address || mintingId !== null || mintingAll || earnedIds.length === 0) return
    setMintingAll(true)
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintCards',
        args: [earnedIds as unknown as number[]],
      })
      await publicClient?.waitForTransactionReceipt({ hash })
      removeEarnedCards(address, earnedIds)
      setEarnedIds([])
      refetchMinted()
    } catch (err) {
      console.error('Mint all failed:', err)
    } finally {
      setMintingAll(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pt-14 pb-20">

      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-[8px] text-[#00f5ff]/50 tracking-widest mb-2">YOUR COLLECTION</p>
            <h1 className="font-pixel text-lg text-white" style={{ textShadow: '0 0 20px #00f5ff60' }}>
              MY CARDS
            </h1>
          </div>
          {isConnected && (
            <div className="flex flex-col items-end gap-1">
              <span className="font-ui text-sm text-gray-400">
                <span className="text-[#00ff85] font-bold text-base">{totalOwned}</span>
                <span className="text-gray-600"> / {ALL_CARDS.length} cards</span>
              </span>
              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00f5ff] to-[#00ff85] rounded-full transition-all duration-700"
                  style={{ width: `${(totalOwned / ALL_CARDS.length) * 100}%` }}
                />
              </div>
              <span className="font-pixel text-[7px] text-gray-600">
                {Math.round((totalOwned / ALL_CARDS.length) * 100)}% COMPLETE
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 flex flex-col gap-16">

        {/* Not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="font-pixel text-[9px] text-gray-500">CONNECT YOUR WALLET</p>
            <p className="font-ui text-sm text-gray-600">to see your card collection</p>
          </div>
        )}

        {/* Loading */}
        {isConnected && isLoading && (
          <div className="flex items-center justify-center py-24">
            <p className="font-pixel text-[9px] text-[#00f5ff] animate-pulse">LOADING COLLECTION...</p>
          </div>
        )}

        {isConnected && !isLoading && (
          <>
            {/* ── EARNED (ready to mint) ── */}
            {uniqueEarnedCards.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <h2 className="font-pixel text-[10px] text-[#00f5ff] tracking-widest">EARNED</h2>
                  <div className="flex-1 h-px bg-[#00f5ff]/20" />
                  <span className="font-pixel text-[7px] text-[#00f5ff]/60">{earnedIds.length} READY TO MINT</span>
                </div>

                <p className="font-ui text-xs text-gray-500 -mt-2">
                  Cards from your opened packs. Mint them as NFTs whenever you&apos;re ready.
                </p>

                <button
                  onClick={handleMintAll}
                  disabled={mintingAll || mintingId !== null}
                  className="self-start font-pixel text-[8px] px-5 py-2.5 rounded border border-[#00ff85] text-[#00ff85] hover:bg-[#00ff85]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ boxShadow: '0 0 12px #00ff8530' }}
                >
                  {mintingAll ? 'MINTING...' : `MINT ALL ${earnedIds.length} CARDS`}
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {uniqueEarnedCards.map((card, i) => {
                    const count = earnedCounts[card.id] ?? 0
                    const color = card.color ?? RARITY_COLORS[card.rarity]
                    const isMinting = mintingId === card.id
                    return (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex flex-col gap-2"
                      >
                        <CardTile
                          card={card}
                          onClick={() => setLightbox(card)}
                          badge={
                            count > 1 ? (
                              <div
                                className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                              >
                                <span className="font-pixel text-[7px] text-black">{count}</span>
                              </div>
                            ) : undefined
                          }
                        />
                        <button
                          onClick={(e) => handleMintOne(card.id, e)}
                          disabled={isMinting || mintingAll || mintingId !== null}
                          className="w-full font-pixel text-[7px] py-2 rounded border border-[#00f5ff]/60 text-[#00f5ff] hover:bg-[#00f5ff]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isMinting ? 'MINTING...' : 'MINT NFT'}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── MINTED NFTs ── */}
            {mintedCards.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <h2 className="font-pixel text-[10px] text-white tracking-widest">MINTED NFTs</h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="font-pixel text-[7px] text-[#00ff85]">{mintedCards.length} CARDS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {mintedCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <CardTile
                        card={card}
                        onClick={() => setLightbox(card)}
                        badge={
                          <div
                            className="absolute top-2 left-2 px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(245,158,11,0.9)', boxShadow: '0 0 8px #f59e0b80' }}
                          >
                            <span className="font-pixel text-[6px] text-black">NFT</span>
                          </div>
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {uniqueEarnedCards.length === 0 && mintedCards.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <p className="font-pixel text-[9px] text-gray-600">NO CARDS YET</p>
                <p className="font-ui text-sm text-gray-700">Open a pack on the home page to get started</p>
              </div>
            )}

            {/* ── NOT YET COLLECTED ── */}
            {notOwned.length > 0 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <h2 className="font-pixel text-[10px] text-gray-600 tracking-widest">NOT YET COLLECTED</h2>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="font-pixel text-[7px] text-gray-600">{notOwned.length} CARDS</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 opacity-40">
                  {notOwned.map(card => <LockedCard key={card.id} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              <p className="font-pixel text-[9px] text-center mt-4"
                style={{ color: lightbox.color ?? RARITY_COLORS[lightbox.rarity] }}>
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
