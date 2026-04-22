'use client'

import { useEffect, useState } from 'react'

function getSecondsUntilMidnightUTC() {
  const now = new Date()
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}

function fmt(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
}

export default function CountdownTimer() {
  const [secs, setSecs] = useState(getSecondsUntilMidnightUTC())

  useEffect(() => {
    const id = setInterval(() => setSecs(getSecondsUntilMidnightUTC()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="text-center">
      <p className="font-ui text-xs text-gray-500 mb-1 uppercase tracking-widest">Next pack in</p>
      <p className="font-pixel text-lg neon-green tabular-nums">{fmt(secs)}</p>
    </div>
  )
}
