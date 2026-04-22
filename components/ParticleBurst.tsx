'use client'

import { useEffect, useRef } from 'react'

interface ParticleBurstProps {
  color: string
  active: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export default function ParticleBurst({ color, active }: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Spawn particles
    particlesRef.current = Array.from({ length: 40 }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 5
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.floor(Math.random() * 30),
        size: 2 + Math.random() * 4,
      }
    })

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15  // gravity
        p.vx *= 0.97
        p.life++

        const alpha = 1 - p.life / p.maxLife
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
        ctx.shadowBlur = 8
        ctx.shadowColor = color
        ctx.fill()
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, color])

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="absolute inset-0 pointer-events-none"
      style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
    />
  )
}
