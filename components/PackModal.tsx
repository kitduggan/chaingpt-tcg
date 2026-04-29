'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getRandomPack, RARITY_COLORS, ALL_CARDS, type Card } from '@/lib/cards'
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { parseEventLogs } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract'

type Stage = 'idle' | 'ripping' | 'god-reveal' | 'revealed'

interface PackOrigin { x: number; y: number; scale: number }

interface PackModalProps {
  open: boolean
  packIndex: number
  packOrigin: PackOrigin | null
  onClose: () => void
}

const packVariants = {
  initial: (o: PackOrigin | null) => o
    ? { x: o.x, y: o.y, scale: o.scale, opacity: 1 }
    : { x: 0, y: 40, scale: 0.5, opacity: 0 },
  animate: { x: 0, y: 0, scale: 1, opacity: 1 },
  exit: (o: PackOrigin | null) => ({
    x: o ? o.x * 0.55 : 0,
    y: o ? o.y * 0.55 : 30,
    scale: 0.3,
    opacity: 0,
    transition: { duration: 0.28, ease: 'easeIn' as const },
  }),
}

const TOP_CLIP    = 'polygon(0% 0%, 100% 0%, 100% 16%, 0% 7%)'
const BOTTOM_CLIP = 'polygon(0% 7%, 100% 16%, 100% 100%, 0% 100%)'

const CARD_POSITIONS = [
  { x: -300, y: -60, rotate: -18 },
  { x: 0,    y: -90, rotate: 0   },
  { x: 300,  y: -60, rotate: 18  },
]

// Wider fan for 5-card God Pack
const GOD_CARD_POSITIONS = [
  { x: -360, y: -38, rotate: -22 },
  { x: -182, y: -62, rotate: -11 },
  { x: 0,    y: -78, rotate: 0   },
  { x: 182,  y: -62, rotate: 11  },
  { x: 360,  y: -38, rotate: 22  },
]

const SPARKLE_DIRS = [
  { tx: '-80px', ty: '-90px' }, { tx: '80px',  ty: '-90px' },
  { tx: '-110px',ty: '0px'   }, { tx: '110px', ty: '0px'   },
  { tx: '-80px', ty: '90px'  }, { tx: '80px',  ty: '90px'  },
  { tx: '-30px', ty: '-110px'}, { tx: '30px',  ty: '-110px'},
  { tx: '-30px', ty: '110px' }, { tx: '30px',  ty: '110px' },
]

// God Pack sparkle positions — radiating outward in a circle
const GOD_SPARKS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const dist = 130 + (i % 4) * 35
  return {
    x: Math.round(Math.cos(angle) * dist),
    y: Math.round(Math.sin(angle) * dist),
    color: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#f59e0b' : '#fef08a',
    size: i % 5 === 0 ? 9 : 5,
    delay: i * 0.06,
  }
})

function GodPackOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[250] flex flex-col items-center justify-center pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Dark base */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Gold radial burst */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.55) 0%, rgba(245,158,11,0.2) 35%, rgba(245,158,11,0.05) 60%, transparent 75%)',
        }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.3, 1.05], opacity: [0, 1, 0.75] }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Horizontal shimmer sweep */}
      <motion.div
        className="absolute inset-y-0 pointer-events-none"
        style={{
          width: '55%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), rgba(245,158,11,0.3), rgba(255,255,255,0.08), transparent)',
        }}
        initial={{ x: '-100vw' }}
        animate={{ x: '200vw' }}
        transition={{ duration: 1.1, delay: 0.3, ease: 'easeInOut' }}
      />

      {/* Radiating sparkles — anchored to screen center independently */}
      {GOD_SPARKS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            width: s.size, height: s.size,
            background: s.color,
            top: '50%', left: '50%',
            marginTop: -(s.size / 2),
            marginLeft: -(s.size / 2),
            boxShadow: `0 0 6px ${s.color}`,
          }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{ x: [0, s.x], y: [0, s.y], scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, delay: s.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.7 }}
        />
      ))}

      {/* Text block — separate from sparkles so centering is clean */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <motion.p
          className="god-pack-text font-pixel select-none"
          style={{ fontSize: 'clamp(34px, 7vw, 72px)', color: '#f59e0b' }}
          initial={{ scale: 0.25, opacity: 0 }}
          animate={{ scale: [0.25, 1.18, 1], opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          GOD PACK!
        </motion.p>

        <motion.p
          className="legendary-shimmer font-pixel text-[9px] tracking-[0.3em] select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
        >
          LEGENDARY PULL
        </motion.p>

        <motion.div
          className="mt-1 px-4 py-1.5 rounded-full"
          style={{
            background: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.4)',
            boxShadow: '0 0 20px rgba(245,158,11,0.2)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-pixel text-[8px] text-[#fef08a]">4 RARES + 1 MYTHIC</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

function MythicAura({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Pulsing glow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: '0 0 30px #f59e0b, 0 0 70px #f59e0b80, 0 0 120px #f59e0b40',
          animation: 'mythicPulse 1.4s ease-in-out infinite',
          zIndex: 1,
        }}
      />

      {/* Flying sparkles */}
      {SPARKLE_DIRS.map((dir, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            width: 6, height: 6,
            marginTop: -3, marginLeft: -3,
            borderRadius: 1,
            background: i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#f59e0b' : '#fef08a',
            ['--tx' as string]: dir.tx,
            ['--ty' as string]: dir.ty,
            animation: `sparkleFloat 1s ease-out ${(i * 0.08).toFixed(2)}s infinite`,
            zIndex: 2,
          }}
        />
      ))}

      {/* Card */}
      <div className="relative" style={{ zIndex: 3 }}>
        {children}
      </div>
    </div>
  )
}

function HoloCard({ card, color, onExpand }: { card: Card; color: string; onExpand: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [gloss, setGloss] = useState({ x: 50, y: 50 })
  const [held, setHeld] = useState(false)

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width
    const dy = (e.clientY - r.top)  / r.height
    setTilt({ x: (dy - 0.5) * -22, y: (dx - 0.5) * 22 })
    setGloss({ x: dx * 100, y: dy * 100 })
  }

  const onLeave = () => {
    setTilt({ x: 0, y: 0 })
    setHeld(false)
  }

  return (
    <div
      ref={ref}
      style={{ perspective: '700px', cursor: held ? 'grabbing' : 'grab' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onMouseDown={() => setHeld(true)}
      onMouseUp={() => setHeld(false)}
      onClick={(e) => { e.stopPropagation(); onExpand() }}
    >
      <div
        className="w-full rounded-xl overflow-hidden relative"
        style={{
          aspectRatio: '2/3',
          border: `2px solid ${color}60`,
          boxShadow: `0 0 24px ${color}50, 0 8px 32px rgba(0,0,0,0.6)`,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: held ? 'none' : 'transform 0.35s ease-out',
          transformStyle: 'preserve-3d',
        }}
      >
        <img src={card.image} alt={card.name} className="w-full h-full object-cover" draggable={false} />

        {/* Holographic overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at ${gloss.x}% ${gloss.y}%, rgba(255,0,255,0.12) 0%, rgba(0,245,255,0.09) 30%, rgba(0,255,133,0.07) 55%, transparent 80%)`,
            mixBlendMode: 'overlay',
          }}
        />
        {/* Shine strip */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${100 + gloss.x * 0.6}deg, transparent 30%, rgba(255,255,255,0.12) 47%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.12) 53%, transparent 70%)`,
            mixBlendMode: 'screen',
          }}
        />
        {/* Initial sheen sweep */}
        <div
          className="card-sheen absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(105deg, transparent 30%, ${color}55 50%, white 55%, ${color}55 60%, transparent 70%)`,
            width: '60%',
          }}
        />
      </div>
    </div>
  )
}

export default function PackModal({ open, packIndex, packOrigin, onClose }: PackModalProps) {
  const [stage, setStage]         = useState<Stage>('idle')
  const [cards, setCards]         = useState<Card[]>([])
  const [isGodPack, setIsGodPack] = useState(false)
  const [lightbox, setLightbox]   = useState<Card | null>(null)
  const [arrived, setArrived]     = useState(false)
  const [minting, setMinting]     = useState(false)
  const [mintError, setMintError] = useState<string | null>(null)

  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!open) {
      setStage('idle')
      setCards([])
      setIsGodPack(false)
      setLightbox(null)
      setArrived(false)
      setMinting(false)
      setMintError(null)
    }
  }, [open])

  const handleClose = () => {
    setStage('idle')
    setTimeout(onClose, 50)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && handleClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleClose])

  const handlePackClick = async () => {
    if (stage !== 'idle' || minting) return
    setMintError(null)

    // ── Demo mode (no wallet connected) ─────────────────────────────────────
    if (!isConnected) {
      const result = getRandomPack()
      setCards(result.cards)
      setIsGodPack(result.isGodPack)
      setStage('ripping')
      if (result.isGodPack) {
        setTimeout(() => setStage('god-reveal'), 480)
        setTimeout(() => setStage('revealed'), 2800)
      } else {
        setTimeout(() => setStage('revealed'), 600)
      }
      return
    }

    // ── Blockchain mint path ─────────────────────────────────────────────────
    setStage('ripping') // start rip animation immediately
    setMinting(true)

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'mintPack',
      })

      if (!publicClient) throw new Error('No network client')
      const receipt = await publicClient.waitForTransactionReceipt({ hash })

      const logs = parseEventLogs({
        abi: CONTRACT_ABI,
        eventName: 'PackMinted',
        logs: receipt.logs,
      })

      const cardTypeIds = logs[0]?.args?.cardTypes
      if (!cardTypeIds || cardTypeIds.length === 0) throw new Error('No cards in receipt')

      const mintedCards = Array.from(cardTypeIds)
        .map(id => ALL_CARDS.find(c => c.id === id))
        .filter((c): c is Card => !!c)

      setCards(mintedCards)
      setIsGodPack(false)
      setMinting(false)
      setStage('revealed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // Ignore user-rejected / cancelled transactions
      if (!msg.toLowerCase().includes('rejected') && !msg.toLowerCase().includes('denied') && !msg.toLowerCase().includes('cancelled')) {
        setMintError('Mint failed. Make sure you have BNB for gas.')
      }
      setMinting(false)
      setStage('idle')
    }
  }

  const positions = isGodPack ? GOD_CARD_POSITIONS : CARD_POSITIONS
  // Cards are slightly smaller in god pack so all 5 fit
  const cardWidth = isGodPack ? 'min(26vw, 158px)' : 'min(36vw, 220px)'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[200]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-[201] flex items-center justify-center" onClick={handleClose}>

            {/* Cards fanning out */}
            <AnimatePresence>
              {stage === 'revealed' && positions.map((pos, i) => {
                const card = cards[i]
                if (!card) return null
                const color = card.color ?? RARITY_COLORS[card.rarity]
                const isHolo = card.rarity === 'Rare' || card.rarity === 'Mythic'

                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ x: 0, y: 60, rotate: 0, opacity: 0, scale: 0.4 }}
                    animate={{ x: pos.x, y: pos.y, rotate: pos.rotate, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.3, y: 40, transition: { duration: 0.15 } }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 160, damping: 18 }}
                    style={{ width: cardWidth, zIndex: 202 + i }}
                    onClick={e => e.stopPropagation()}
                  >
                    <motion.div
                      whileHover={{ y: -10, scale: 1.04 }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                    >
                      {card.rarity === 'Mythic' ? (
                        <MythicAura>
                          <div
                            className="w-full rounded-xl overflow-hidden bg-[#0d0d18] cursor-pointer"
                            style={{ aspectRatio: '2/3', border: `2px solid ${color}`, boxShadow: `0 0 24px ${color}80` }}
                            onClick={() => setLightbox(card)}
                          >
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                          </div>
                        </MythicAura>
                      ) : (
                        <div
                          className={`w-full rounded-xl overflow-hidden bg-[#0d0d18] flex flex-col relative ${card.image ? 'cursor-pointer' : ''}`}
                          style={{
                            aspectRatio: '2/3',
                            border: `2px solid ${color}60`,
                            boxShadow: `0 0 24px ${color}50, 0 8px 32px rgba(0,0,0,0.6)`,
                          }}
                          onClick={card.image ? () => setLightbox(card) : undefined}
                        >
                          {card.image ? (
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-2">
                              <span className="font-pixel text-[6px] text-center leading-tight" style={{ color }}>
                                {card.name ?? '?'}
                              </span>
                              <span className="font-ui text-[8px] text-gray-500 text-center">{card.rarity}</span>
                            </div>
                          )}
                          {isHolo && (
                            <div
                              className="card-sheen absolute inset-0 pointer-events-none"
                              style={{
                                background: `linear-gradient(105deg, transparent 30%, ${color}55 50%, white 55%, ${color}55 60%, transparent 70%)`,
                                width: '60%',
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* Rarity label for holo cards */}
                      {isHolo && (
                        <motion.p
                          className="font-pixel text-center mt-2 leading-tight text-white"
                          style={{ fontSize: '11px', textShadow: `0 0 12px ${color}, 0 0 24px ${color}` }}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 0.5 }}
                        >
                          {card.rarity.toUpperCase()}!
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* God Pack overlay */}
            <AnimatePresence>
              {stage === 'god-reveal' && <GodPackOverlay />}
            </AnimatePresence>

            {/* Pack */}
            <motion.div
              className="relative"
              style={{ width: 'min(72vw, 360px)' }}
              variants={packVariants}
              custom={packOrigin}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              onAnimationComplete={(def) => {
                if (def === 'animate') setArrived(true)
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Glow burst on entrance */}
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                initial={{ opacity: 1, scale: 1.6 }}
                animate={{ opacity: 0, scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.4) 0%, transparent 70%)', zIndex: -1 }}
              />

              {/* Float wrapper */}
              <motion.div
                animate={arrived && stage === 'idle' ? { y: [0, -10, 0] } : { y: 0 }}
                transition={arrived && stage === 'idle'
                  ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0 }}
              >
                {/* Bottom piece — fades out after god pack rip */}
                <motion.img
                  src="/pack.png"
                  alt="Card Pack"
                  className="w-full h-auto"
                  style={{ clipPath: BOTTOM_CLIP }}
                  animate={isGodPack && (stage === 'god-reveal' || stage === 'revealed') ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  draggable={false}
                />

                {/* Top piece — flies off on rip */}
                <motion.img
                  src="/pack.png"
                  alt=""
                  className="absolute inset-0 w-full h-auto cursor-pointer"
                  style={{ clipPath: TOP_CLIP, transformOrigin: 'bottom right' }}
                  animate={
                    stage === 'ripping' || stage === 'god-reveal' || stage === 'revealed'
                      ? { x: 260, y: -90, rotate: 28, opacity: 0 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1 }
                  }
                  transition={
                    stage === 'ripping' || stage === 'god-reveal' || stage === 'revealed'
                      ? { duration: 0.32, ease: [0.4, 0, 1, 1] }
                      : { duration: 0 }
                  }
                  onClick={handlePackClick}
                  draggable={false}
                />

                {stage === 'idle' && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-end pb-8 cursor-pointer"
                    onClick={handlePackClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span
                      className="font-pixel text-[8px] text-[#00f5ff]"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      style={{ textShadow: '0 0 10px #00f5ff' }}
                    >
                      TAP TO OPEN
                    </motion.span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Minting indicator */}
            <AnimatePresence>
              {minting && (
                <motion.div
                  className="fixed bottom-10 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p
                    className="font-pixel text-[8px] text-[#00f5ff]"
                    style={{ textShadow: '0 0 10px #00f5ff', animation: 'pulse 1.4s ease-in-out infinite' }}
                  >
                    MINTING ON CHAIN...
                  </p>
                  <p className="font-ui text-xs text-gray-500">Confirm in your wallet</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mint error */}
            <AnimatePresence>
              {mintError && (
                <motion.div
                  className="fixed bottom-10 left-0 right-0 text-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="font-pixel text-[8px] text-red-400">{mintError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Close hint */}
            <AnimatePresence>
              {stage === 'revealed' && (
                <motion.p
                  className="fixed bottom-10 left-0 right-0 text-center font-ui text-xs text-gray-500 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Click anywhere to close · ESC
                </motion.p>
              )}
            </AnimatePresence>
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
                  style={{ width: 'min(70vw, 380px)' }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  onClick={e => e.stopPropagation()}
                >
                  {(lightbox.rarity === 'Rare' || lightbox.rarity === 'Mythic') ? (
                    <HoloCard
                      card={lightbox}
                      color={lightbox.color ?? RARITY_COLORS[lightbox.rarity]}
                      onExpand={() => {}}
                    />
                  ) : (
                    <img
                      src={lightbox.image}
                      alt={lightbox.name}
                      className="w-full rounded-2xl object-contain"
                      style={{ boxShadow: `0 0 60px ${lightbox.color ?? RARITY_COLORS[lightbox.rarity]}80` }}
                    />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
