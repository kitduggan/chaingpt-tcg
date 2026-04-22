'use client'

import { useEffect, useRef } from 'react'

const ICON_SIZE = 28

const STAR_COLORS = ['#00f5ff', '#ff00ff', '#00ff85', '#f59e0b', '#a855f7', '#3b82f6', '#ff6b35']

// Pre-render a 5-pointed star at low-res then scale up = pixelated star shape
function makeStarCanvas(color: string, lowRes = 10): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = lowRes
  c.height = lowRes
  const ctx = c.getContext('2d')!
  const cx = lowRes / 2, cy = lowRes / 2
  const outerR = lowRes * 0.46
  const innerR = lowRes * 0.19
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.shadowBlur = 2
  ctx.shadowColor = color
  ctx.fill()
  return c
}

type SpriteType = 'icon' | 'star' | 'sparkle'

interface Sprite {
  x: number
  y: number
  speed: number
  alpha: number
  scale: number
  type: SpriteType
  color: string
  starCanvas?: HTMLCanvasElement
}

function spawnSprite(canvasWidth: number): Sprite {
  const margin = 110
  const side = Math.random() < 0.5 ? 'left' : 'right'
  const x = side === 'left'
    ? Math.random() * margin
    : canvasWidth - margin - ICON_SIZE + Math.random() * margin * 0.5
  const type: SpriteType = Math.random() < 0.45 ? 'icon' : Math.random() < 0.6 ? 'star' : 'sparkle'
  const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
  return {
    x,
    y: -ICON_SIZE,
    speed: 0.4 + Math.random() * 1.0,
    alpha: 0.2 + Math.random() * 0.3,
    scale: 0.6 + Math.random() * 0.7,
    type,
    color,
    starCanvas: type !== 'icon' ? makeStarCanvas(color) : undefined,
  }
}


export default function SideSprites() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.src = '/cgpt-icon.png'

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const sprites: Sprite[] = []

    for (let i = 0; i < 18; i++) {
      const s = spawnSprite(canvas.width)
      s.y = Math.random() * canvas.height
      sprites.push(s)
    }

    let raf: number

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (sprites.length < 22 && Math.random() < 0.02) {
        sprites.push(spawnSprite(canvas.width))
      }

      for (let i = sprites.length - 1; i >= 0; i--) {
        const s = sprites[i]
        s.y += s.speed

        if (s.y > canvas.height + ICON_SIZE) {
          sprites[i] = spawnSprite(canvas.width)
          continue
        }

        ctx.globalAlpha = s.alpha

        if (s.type === 'icon') {
          const size = ICON_SIZE * s.scale
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(img, s.x, s.y, size, size)
        } else if (s.starCanvas) {
          const size = (s.type === 'star' ? 22 : 16) * s.scale
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(s.starCanvas, s.x, s.y, size, size)
        }
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    img.onload = () => { raf = requestAnimationFrame(tick) }
    if (img.complete) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
