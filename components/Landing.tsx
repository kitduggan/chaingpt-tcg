'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PackModal from './PackModal'

// Mock: track if today's pack was claimed (per-session only)
let sessionClaimed = false

type PackOrigin = { x: number; y: number; scale: number }

export default function Landing() {
  const [packOpen, setPackOpen] = useState(false)
  const [clickedPack, setClickedPack] = useState<number>(1)
  const [packOrigin, setPackOrigin] = useState<PackOrigin | null>(null)
  const [lightbox, setLightbox] = useState<{ img: string; name: string; rarity: string; color: string; label: string } | null>(null)

  const openPack = () => {
    setPackOrigin(null)
    setClickedPack(1)
    setPackOpen(true)
  }

  return (
    <div className="min-h-screen pt-14 flex flex-col items-center pb-16 relative overflow-hidden">

      {/* Top video banner */}
      {/* Logo */}
      <img
        src="/logo-cropped.png"
        alt="ChainGPT TCG"
        className="h-auto mt-8 mb-6"
        style={{ width: '100%', maxWidth: 932, mixBlendMode: 'screen' }}
      />

      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center gap-10">

        {/* RIP → REVEAL → COLLECT */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 w-full"
        >
          {[
            { verb: 'RIP',     desc: 'Open your free\npack every 12hrs', color: '#00f5ff', icon: '✦' },
            { verb: 'REVEAL',  desc: 'Discover common,\nrare & mythic', color: '#ff00ff', icon: '✦' },
            { verb: 'COLLECT', desc: 'Complete the full\nset of 20 cards',  color: '#f59e0b', icon: '✦' },
          ].map(({ verb, desc, color, icon }, i) => (
            <div key={verb} className="flex items-center gap-3">
              {/* Step */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.span
                  className="font-pixel text-base"
                  style={{ color, textShadow: `0 0 12px ${color}` }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6 }}
                >
                  {verb}
                </motion.span>
                <span className="font-ui text-sm text-gray-500 text-center leading-tight whitespace-pre-line">
                  {desc}
                </span>
              </div>

              {/* Arrow between steps */}
              {i < 2 && (
                <motion.span
                  className="font-pixel text-sm text-gray-700 mb-4"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.4 }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </motion.div>


        {/* Floating packs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex items-end justify-center gap-8"
        >
          {[0, 1, 2].map((i) => {
            const hide = packOpen && clickedPack === i
            return (
              <motion.div
                key={i}
                className="relative cursor-pointer"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                style={{ visibility: hide ? 'hidden' : 'visible', pointerEvents: hide ? 'none' : 'auto' }}
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  const modalW = Math.min(window.innerWidth * 0.72, 360)
                  setPackOrigin({
                    x: (rect.left + rect.width / 2) - window.innerWidth / 2,
                    y: (rect.top  + rect.height / 2) - window.innerHeight / 2,
                    scale: rect.width / modalW,
                  })
                  setClickedPack(i)
                  setPackOpen(true)
                }}
              >
                <img
                  src="/pack.png"
                  alt="Card Pack"
                  className="w-52 h-auto drop-shadow-[0_8px_24px_rgba(0,245,255,0.3)]"
                  draggable={false}
                />
              </motion.div>
            )
          })}
        </motion.div>

        {/* Pack claim CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={openPack}
            className="group relative font-pixel text-sm px-10 py-4 cursor-pointer select-none"
            style={{
              color: '#00f5ff',
              background: '#0a0a1a',
              border: 'none',
              outline: 'none',
              imageRendering: 'pixelated',
              boxShadow: `
                inset -4px -4px 0px #003a3a,
                inset 4px 4px 0px #00f5ff40,
                0 0 0 3px #00f5ff,
                0 0 0 6px #0a0a1a,
                0 0 0 8px #00f5ff30
              `,
              textShadow: '0 0 10px #00f5ff',
            }}
            onMouseDown={e => (e.currentTarget.style.boxShadow = `inset 4px 4px 0px #003a3a, inset -4px -4px 0px #00f5ff40, 0 0 0 3px #00f5ff, 0 0 0 6px #0a0a1a, 0 0 0 8px #00f5ff30`)}
            onMouseUp={e => (e.currentTarget.style.boxShadow = `inset -4px -4px 0px #003a3a, inset 4px 4px 0px #00f5ff40, 0 0 0 3px #00f5ff, 0 0 0 6px #0a0a1a, 0 0 0 8px #00f5ff30`)}
          >
            <span className="flex items-center justify-center gap-2">
              <span style={{ display: 'inline-block', transform: 'translateY(-3px)' }}>▶</span>
              <span>CLICK &amp; RIP!</span>
            </span>
          </button>
        </motion.div>


        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#ff00ff]/20 to-transparent" />

        {/* HOW TO PLAY */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full flex flex-col items-center gap-12"
        >
          {/* Section title */}
          <div className="flex flex-col items-center gap-3">
            <p className="font-pixel text-[8px] text-[#ff00ff]/60 tracking-widest">FIELD GUIDE</p>
            <h2 className="font-pixel text-lg text-white text-center leading-snug"
              style={{ textShadow: '0 0 20px #00f5ff80' }}>
              HOW TO PLAY
            </h2>
            <p className="font-ui text-sm text-gray-400 text-center max-w-lg">
              ChainGPT TCG is a free onchain collectible card game. Every 12 hours a new pack drops. Rip it open, discover what's inside, and work toward completing the full set of 20 cards.
            </p>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-4 w-full">
            {[
              { label: 'PACK TIMER',    value: '12 HRS',   color: '#00f5ff', icon: '⏱' },
              { label: 'TOTAL CARDS',   value: '20',        color: '#ff00ff', icon: '🃏' },
              { label: 'CARDS PER PACK',value: '3',         color: '#f59e0b', icon: '✦'  },
            ].map(({ label, value, color, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 rounded-xl py-5 px-3"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}25`,
                  boxShadow: `0 0 20px ${color}10`,
                }}
              >
                <span className="text-xl">{icon}</span>
                <span className="font-pixel text-base" style={{ color, textShadow: `0 0 10px ${color}` }}>{value}</span>
                <span className="font-pixel text-[7px] text-gray-500 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Rarity showcase */}
          <div className="flex flex-col items-center gap-6 w-full">
            <h3 className="font-pixel text-[10px] text-gray-400 tracking-widest">CARD RARITIES</h3>

            <div className="flex items-end justify-center gap-8 w-full">
              {/* Common × 2 */}
              {[
                { img: '/card-03-robotson-pool.png',   name: 'Mr. Robotson (Pool)', rarity: 'COMMON',   color: '#00f5ff', label: 'Most frequent. 15 unique cards.',   tilt: -6  },
                { img: '/card-mythic-showcase.png',    name: 'Golden Mr. Robotson', rarity: 'MYTHIC',   color: '#f59e0b', label: 'Ultra rare. 1 mythic card.',        tilt: 0   },
                { img: '/card-16-ilan.png',             name: 'Ilan',               rarity: 'RARE',     color: '#ff00ff', label: 'Rare pull. 4 team member cards.',   tilt: 6   },
              ].map(({ img, name, rarity, color, label, tilt }, i) => (
                <motion.div
                  key={name}
                  className="flex flex-col items-center gap-3 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.12 }}
                  style={{ rotate: `${tilt}deg` }}
                  onClick={() => setLightbox({ img, name, rarity, color, label })}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.06 }}
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        width: 'min(26vw, 150px)',
                        aspectRatio: '2/3',
                        border: `2px solid ${color}60`,
                        boxShadow: `0 0 20px ${color}40, 0 8px 24px rgba(0,0,0,0.5)`,
                      }}
                    >
                      <img src={img} alt={name} className="w-full h-full object-cover" draggable={false} />
                    </div>
                    <div className="flex flex-col items-center gap-1" style={{ transform: `rotate(${-tilt}deg)` }}>
                      <span className="font-pixel text-[8px]" style={{ color, textShadow: `0 0 8px ${color}` }}>
                        {rarity}
                      </span>
                      <span className="font-ui text-[10px] text-gray-500 text-center max-w-[120px] leading-tight">{label}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Goal banner */}
          <div
            className="w-full rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.05) 0%, rgba(255,0,255,0.05) 50%, rgba(245,158,11,0.05) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span className="font-pixel text-[8px] text-[#f59e0b]/70 tracking-widest">OBJECTIVE</span>
            <p className="font-pixel text-sm text-white leading-relaxed"
              style={{ textShadow: '0 0 16px rgba(245,158,11,0.4)' }}>
              COLLECT ALL 20 CARDS
            </p>
            <p className="font-ui text-xs text-gray-500 max-w-md">
              From common Mr. Robotson variants to ultra-rare team member cards and the elusive Golden Mr. Robotson Mythic. Complete your collection to prove you're a true ChainGPT OG.
            </p>
          </div>
        </motion.div>

      </div>

      <PackModal
        open={packOpen}
        packIndex={clickedPack}
        packOrigin={packOrigin}
        onClose={() => setPackOpen(false)}
      />

      {/* Rarity card lightbox */}
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
              className="relative flex flex-col items-center gap-4"
              style={{ width: 'min(70vw, 320px)' }}
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
                  border: `2px solid ${lightbox.color}80`,
                  boxShadow: `0 0 60px ${lightbox.color}60, 0 20px 60px rgba(0,0,0,0.7)`,
                }}
              >
                <img src={lightbox.img} alt={lightbox.name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="font-pixel text-[9px]" style={{ color: lightbox.color, textShadow: `0 0 10px ${lightbox.color}` }}>
                  {lightbox.rarity}
                </span>
                <span className="font-ui text-sm text-white">{lightbox.name}</span>
                <span className="font-ui text-xs text-gray-500">{lightbox.label}</span>
              </div>
              <p className="font-ui text-[10px] text-gray-600">tap anywhere to close</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
