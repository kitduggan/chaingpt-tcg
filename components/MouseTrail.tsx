'use client'

import { useEffect, useRef } from 'react'

interface Pixel {
  x: number
  y: number
  size: number
  alpha: number
}

export default function MouseTrail() {
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

    const img = new Image()
    img.src = '/cgpt-icon.png'

    const pixels: Pixel[] = []
    let lastX = 0, lastY = 0

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      if (Math.abs(dx) + Math.abs(dy) < 8) return
      lastX = e.clientX
      lastY = e.clientY

      pixels.push({
        x: e.clientX + (Math.random() - 0.5) * 12,
        y: e.clientY + (Math.random() - 0.5) * 12,
        size: 14 + Math.floor(Math.random() * 3) * 4, // 14, 18, or 22px
        alpha: 0.4 + Math.random() * 0.25,
      })
    }

    window.addEventListener('mousemove', onMouseMove)

    let raf: number
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = pixels.length - 1; i >= 0; i--) {
        const p = pixels[i]
        p.alpha -= 0.03
        p.y += 0.4  // drift down slightly

        if (p.alpha <= 0) {
          pixels.splice(i, 1)
          continue
        }

        ctx.globalAlpha = p.alpha
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(img, Math.floor(p.x), Math.floor(p.y), p.size, p.size)
      }

      ctx.globalAlpha = 1
      ctx.shadowBlur = 0
      raf = requestAnimationFrame(tick)
    }

    img.onload = () => { raf = requestAnimationFrame(tick) }
    if (img.complete) raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
    />
  )
}
