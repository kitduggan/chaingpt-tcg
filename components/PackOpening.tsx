'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { getRandomPack, RARITY_COLORS, RARITY_GRADIENT } from '@/lib/cards'
import Card from './Card'
import ParticleBurst from './ParticleBurst'

interface FlipState {
  flipped: boolean
  burst: boolean
}

const CARD_BACK_GRADIENT = 'from-[#0d1a2d] via-[#0a0f1a] to-[#0d1a2d]'

export default function PackOpening() {
  const router = useRouter()
  const [pack] = useState(() => getRandomPack().cards)
  const [states, setStates] = useState<FlipState[]>([
    { flipped: false, burst: false },
    { flipped: false, burst: false },
    { flipped: false, burst: false },
  ])
  const [allRevealed, setAllRevealed] = useState(false)

  const flip = (i: number) => {
    if (states[i].flipped) return
    const next = states.map((s, idx) =>
      idx === i ? { flipped: true, burst: true } : s
    )
    setStates(next)
    setTimeout(() => {
      setStates(prev => prev.map((s, idx) => idx === i ? { ...s, burst: false } : s))
    }, 900)
    if (next.every(s => s.flipped)) setAllRevealed(true)
  }

  return (
    <div className="min-h-screen pt-14 flex flex-col items-center justify-center px-4">
      <h1 className="font-pixel text-sm neon-cyan mb-2 text-center">PACK OPENING</h1>
      <p className="font-ui text-sm text-gray-500 mb-12">Click each card to reveal</p>

      {/* Cards row */}
      <div className="flex gap-6 md:gap-10 items-center justify-center mb-12">
        {pack.map((card, i) => (
          <div key={i} className="relative perspective" style={{ width: 176, height: 272 }}>
            {/* Particle burst overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-visible">
              <ParticleBurst color={RARITY_COLORS[card.rarity]} active={states[i].burst} />
            </div>

            {/* Flip container */}
            <div
              className={`card-inner w-full h-full cursor-pointer ${states[i].flipped ? 'flipped' : ''}`}
              onClick={() => flip(i)}
            >
              {/* Card back (shown before flip) */}
              <div className="card-face w-full h-full">
                <motion.div
                  className={`w-full h-full rounded-xl border-2 border-[#00f5ff]/40 bg-gradient-to-b ${CARD_BACK_GRADIENT} flex flex-col items-center justify-center gap-3 overflow-hidden`}
                  animate={{ boxShadow: ['0 0 12px #00f5ff40', '0 0 28px #00f5ff80', '0 0 12px #00f5ff40'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {/* ChainGPT logo placeholder */}
                  <div className="w-16 h-16 rounded-full border-2 border-[#00f5ff]/60 flex items-center justify-center">
                    <span className="font-pixel text-[8px] neon-cyan text-center leading-tight">
                      CGT<br />TCG
                    </span>
                  </div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#00f5ff] to-transparent" />
                  <p className="font-pixel text-[6px] text-[#00f5ff]/50">TAP TO REVEAL</p>

                  {/* Scanline shimmer on back */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(0,245,255,0.03) 6px,rgba(0,245,255,0.03) 12px)',
                    }}
                  />
                </motion.div>
              </div>

              {/* Card front (revealed after flip) */}
              <div className="card-back-face w-full h-full">
                <div
                  className="w-full h-full rounded-xl overflow-hidden"
                  style={{ boxShadow: states[i].flipped ? `0 0 32px ${RARITY_COLORS[card.rarity]}80` : 'none' }}
                >
                  <Card card={card} owned size="lg" animate={false} />
                </div>
              </div>
            </div>

            {/* Unrevealed index label */}
            {!states[i].flipped && (
              <div className="absolute -bottom-7 left-0 right-0 text-center">
                <span className="font-ui text-xs text-gray-600">Card {i + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revealed card names */}
      <div className="flex gap-6 md:gap-10 mb-10 h-8">
        {pack.map((card, i) => (
          <div key={i} style={{ width: 176 }} className="text-center">
            <AnimatePresence>
              {states[i].flipped && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-pixel text-[7px]"
                  style={{ color: RARITY_COLORS[card.rarity] }}
                >
                  {card.rarity.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* CTA after all revealed */}
      <AnimatePresence>
        {allRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <p className="font-pixel text-[9px] text-gray-400">Pack complete!</p>
            <button
              onClick={() => router.push('/collection')}
              className="font-pixel text-[9px] px-6 py-3 rounded border-2 border-[#00ff85] text-[#00ff85] hover:bg-[#00ff85]/10 transition-colors"
              style={{ boxShadow: '0 0 16px #00ff8540' }}
            >
              ADD TO COLLECTION →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
