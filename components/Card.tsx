'use client'

import { motion } from 'framer-motion'
import { Card as CardType, RARITY_COLORS, Rarity } from '@/lib/cards'

interface CardProps {
  card: CardType
  owned?: boolean
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const SIZES = {
  sm: { card: 'w-28 h-40', name: 'text-[6px]', tag: 'text-[5px]' },
  md: { card: 'w-36 h-52', name: 'text-[7px]', tag: 'text-[6px]' },
  lg: { card: 'w-48 h-68', name: 'text-[8px]', tag: 'text-[7px]' },
}

const RARITY_SHADOW: Record<Rarity, string> = {
  Common:   'hover:shadow-[0_0_16px_#00f5ff]',
  Rare: 'hover:shadow-[0_0_24px_#ff00ff]',
  Mythic:   'hover:shadow-[0_0_36px_#f59e0b]',
}

const RARITY_STATIC_SHADOW: Record<Rarity, string> = {
  Common:   '',
  Rare: 'shadow-[0_0_12px_#ff00ff40]',
  Mythic:   'shadow-[0_0_28px_#f59e0b80]',
}

const RARITY_GRADIENT: Record<Rarity, string> = {
  Common:   'from-[#0d1a2a] to-[#0a0a0f]',
  Rare: 'from-[#1a0a1a] to-[#0a0a0f]',
  Mythic:   'from-[#1a1000] to-[#0a0a0f]',
}

export default function Card({ card, owned = true, size = 'md', animate = true }: CardProps) {
  const s = SIZES[size]
  const color = RARITY_COLORS[card.rarity]

  const Wrapper = animate ? motion.div : 'div'
  const wrapperProps = animate
    ? { whileHover: { scale: 1.06 }, transition: { type: 'spring', stiffness: 300, damping: 20 } }
    : {}

  return (
    // @ts-ignore — motion.div / div union
    <Wrapper {...wrapperProps} className="cursor-pointer">
      <div
        className={`
          ${s.card} rounded-xl
          ${RARITY_SHADOW[card.rarity]} ${RARITY_STATIC_SHADOW[card.rarity]}
          transition-shadow duration-300 overflow-hidden flex flex-col
          bg-[#0d0d18] relative
        `}
      >
        {/* Art area */}
        <div className={`flex-1 bg-gradient-to-b ${RARITY_GRADIENT[card.rarity]} relative`}>
          {!owned ? (
            <div className="absolute inset-0 bg-[#0a0a0f]/80 flex items-center justify-center">
              <span className="text-3xl text-gray-600 font-pixel">?</span>
            </div>
          ) : (
            <>
              {/* Pixel art character placeholder */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="grid grid-cols-4 gap-0.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: i % 3 === 0 ? color : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
              {/* Product tag top-right */}
              <span
                className="absolute top-1.5 right-1.5 font-pixel text-[5px] px-1 py-0.5 rounded"
                style={{ background: color + '33', color, border: `1px solid ${color}50` }}
              >
                {card.product}
              </span>
              {/* Mythic animated shimmer */}
              {card.rarity === 'Mythic' && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg,transparent 30%,rgba(245,158,11,0.15) 50%,transparent 70%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 2s linear infinite',
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Card info */}
        <div className="px-2 py-2 bg-[#0d0d18] border-t border-white/5">
          {owned ? (
            <p className={`font-pixel ${s.name} leading-tight mb-1.5`} style={{ color }}>
              {card.name}
            </p>
          ) : (
            <p className={`font-pixel ${s.name} text-gray-600 leading-tight mb-1.5`}>
              {'???' }
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className={`font-pixel ${s.tag} text-gray-500`}>{card.product}</span>
            <span className={`font-pixel ${s.tag}`} style={{ color }}>
              {card.rarity.toUpperCase().slice(0, 3)}
            </span>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
