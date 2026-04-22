'use client'

import { useEffect, useRef } from 'react'

const CELL = 40
const OPACITY = 0.045
const SHIFT_INTERVAL = 1800  // ms between column shifts

interface Column {
  offset: number       // current y offset (0 to CELL)
  target: number       // target offset
  speed: number        // px per frame for smooth slide
  nextShift: number    // timestamp for next shift
}

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // One column entry per grid column
    const cols: Column[] = []
    const buildCols = () => {
      const count = Math.ceil(canvas.width / CELL) + 1
      cols.length = 0
      for (let i = 0; i < count; i++) {
        cols.push({
          offset: 0,
          target: 0,
          speed: 0.4 + Math.random() * 0.4,
          nextShift: Date.now() + Math.random() * SHIFT_INTERVAL,
        })
      }
    }
    buildCols()
    window.addEventListener('resize', buildCols)

    // Rainbow colors for subtle tint on grid lines
    const RAINBOW = ['#00f5ff','#a855f7','#ff00ff','#00ff85','#f59e0b','#3b82f6']

    let raf: number
    let frame = 0

    const tick = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const now = Date.now()

      // Update column offsets
      cols.forEach(col => {
        // Slide toward target
        if (col.offset !== col.target) {
          const diff = col.target - col.offset
          const step = Math.sign(diff) * Math.min(col.speed, Math.abs(diff))
          col.offset += step
          if (Math.abs(col.offset - col.target) < 0.1) col.offset = col.target
        }

        // Schedule next shift
        if (now >= col.nextShift && col.offset === col.target) {
          col.target = (col.target + CELL) % CELL
          col.nextShift = now + SHIFT_INTERVAL * (0.6 + Math.random() * 1.4)
        }
      })

      // Draw vertical lines (per-column shifted)
      cols.forEach((col, ci) => {
        const x = ci * CELL
        const color = RAINBOW[ci % RAINBOW.length]
        ctx.strokeStyle = color
        ctx.lineWidth = 1
        ctx.globalAlpha = OPACITY

        // Draw vertical line segments shifted by col.offset
        ctx.beginPath()
        let y = col.offset % CELL - CELL
        while (y < canvas.height + CELL) {
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + CELL)
          y += CELL
        }
        ctx.stroke()
      })

      // Draw horizontal lines (static, one color cycles slowly)
      const hColor = RAINBOW[Math.floor(frame / 120) % RAINBOW.length]
      ctx.strokeStyle = hColor
      ctx.globalAlpha = OPACITY
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let y = 0; y < canvas.height + CELL; y += CELL) {
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
      }
      ctx.stroke()

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', buildCols)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
