'use client'

import { useEffect, useState } from 'react'
import { ALL_CARDS, RARITY_COLORS } from '@/lib/cards'

interface Pull {
  id: number
  user: string
  card: typeof ALL_CARDS[0]
  timestamp: string
}

const MOCK_USERS = ['0xAbcd', '0x1337', '0xDead', '0xBeef', '0xCafe', '0xF00d']

function generatePulls(count: number): Pull[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
    card: ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)],
    timestamp: `${Math.floor(Math.random() * 59) + 1}m ago`,
  }))
}

export default function RecentPulls() {
  const [pulls, setPulls] = useState<Pull[]>([])

  useEffect(() => {
    setPulls(generatePulls(6))
    // Simulate live feed — new pull every 8s
    const id = setInterval(() => {
      setPulls(prev => [
        {
          id: Date.now(),
          user: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)],
          card: ALL_CARDS[Math.floor(Math.random() * ALL_CARDS.length)],
          timestamp: 'just now',
        },
        ...prev.slice(0, 5),
      ])
    }, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-sm">
      <p className="font-pixel text-[9px] text-gray-500 mb-3 uppercase tracking-widest">
        Recent Pulls
      </p>
      <div className="space-y-2">
        {pulls.map(pull => (
          <div
            key={pull.id}
            className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded px-3 py-2"
          >
            <span className="font-ui text-xs text-gray-500">{pull.user}</span>
            <span
              className="font-pixel text-[7px]"
              style={{ color: RARITY_COLORS[pull.card.rarity] }}
            >
              {pull.card.name}
            </span>
            <span className="font-ui text-[10px] text-gray-600">{pull.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
