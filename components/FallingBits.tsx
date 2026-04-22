'use client'

import { useEffect, useRef } from 'react'

const COLORS = [
  '#00f5ff', // cyan
  '#ff00ff', // magenta
  '#00ff85', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // gold
  '#ff6b35', // orange
  '#ff3399', // pink
]

interface Bit {
  x: number
  y: number
  size: number
  speed: number
  color: string
  alpha: number
  fadeRate: number
}

function spawnBit(width: number): Bit {
  return {
    x: Math.random() * width,
    y: -8,
    size: 3 + Math.floor(Math.random() * 5) * 2, // odd pixel sizes: 3,5,7,9
    speed: 0.6 + Math.random() * 2.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.6 + Math.random() * 0.4,
    fadeRate: 0.003 + Math.random() * 0.008,
  }
}

export default function FallingBits({ height = 200 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const bits: Bit[] = []

    // Seed initial bits spread across the canvas
    for (let i = 0; i < 60; i++) {
      const b = spawnBit(canvas.width)
      b.y = Math.random() * canvas.height  // start scattered, not all at top
      bits.push(b)
    }

    let raf: number

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new bits to maintain density
      if (bits.length < 80 && Math.random() < 0.4) {
        bits.push(spawnBit(canvas.width))
      }

      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i]
        b.y += b.speed
        b.alpha -= b.fadeRate

        if (b.alpha <= 0 || b.y > canvas.height + b.size) {
          // Replace with fresh bit at the top
          bits[i] = spawnBit(canvas.width)
          continue
        }

        ctx.globalAlpha = b.alpha
        ctx.fillStyle = b.color
        ctx.shadowBlur = 6
        ctx.shadowColor = b.color
        ctx.fillRect(b.x, b.y, b.size, b.size)
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
