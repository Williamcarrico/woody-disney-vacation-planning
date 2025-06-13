"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface Particle {
    id: number
    x: number
    y: number
    size: number
    color: string
    velocity: { x: number; y: number }
    life: number
    maxLife: number
    type: 'sparkle' | 'star' | 'pixie' | 'magic'
}

interface AdvancedParticlesProps {
    count?: number
    colors?: string[]
    enableInteraction?: boolean
    className?: string
    mouseInfluence?: number
    emissionRate?: number
    particleLife?: number
}

export function AdvancedParticles({
    count = 50,
    colors = ['#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#F0E68C'],
    enableInteraction = true,
    className,
    mouseInfluence = 150,
    emissionRate = 0.1,
    particleLife = 8000
}: AdvancedParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [particles, setParticles] = useState<Particle[]>([])
    const [isVisible, setIsVisible] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const animationRef = useRef<number>()

    // Create particle
    const createParticle = (x?: number, y?: number): Particle => {
        const canvas = canvasRef.current
        if (!canvas) return {} as Particle

        const types: Particle['type'][] = ['sparkle', 'star', 'pixie', 'magic']
        const type = types[Math.floor(Math.random() * types.length)]
        
        return {
            id: Math.random(),
            x: x ?? Math.random() * canvas.width,
            y: y ?? Math.random() * canvas.height,
            size: Math.random() * 4 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            life: particleLife,
            maxLife: particleLife,
            type
        }
    }

    // Draw particle based on type
    const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
        const alpha = particle.life / particle.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.shadowBlur = 15
        ctx.shadowColor = particle.color

        const x = particle.x
        const y = particle.y
        const size = particle.size

        switch (particle.type) {
            case 'sparkle':
                // Draw sparkle
                ctx.beginPath()
                ctx.arc(x, y, size, 0, Math.PI * 2)
                ctx.fill()
                
                // Add sparkle lines
                ctx.strokeStyle = particle.color
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.moveTo(x - size * 2, y)
                ctx.lineTo(x + size * 2, y)
                ctx.moveTo(x, y - size * 2)
                ctx.lineTo(x, y + size * 2)
                ctx.stroke()
                break

            case 'star':
                // Draw star
                ctx.beginPath()
                const spikes = 5
                const step = Math.PI / spikes
                let rot = Math.PI / 2 * 3
                ctx.moveTo(x, y - size)
                for (let i = 0; i < spikes; i++) {
                    ctx.lineTo(x + Math.cos(rot) * size, y + Math.sin(rot) * size)
                    rot += step
                    ctx.lineTo(x + Math.cos(rot) * size * 0.5, y + Math.sin(rot) * size * 0.5)
                    rot += step
                }
                ctx.lineTo(x, y - size)
                ctx.closePath()
                ctx.fill()
                break

            case 'pixie':
                // Draw pixie dust
                ctx.beginPath()
                ctx.arc(x, y, size * 0.8, 0, Math.PI * 2)
                ctx.fill()
                
                // Add trailing effect
                ctx.globalAlpha = alpha * 0.5
                ctx.beginPath()
                ctx.arc(x - particle.velocity.x * 3, y - particle.velocity.y * 3, size * 0.5, 0, Math.PI * 2)
                ctx.fill()
                break

            case 'magic':
                // Draw magic circle
                ctx.beginPath()
                ctx.arc(x, y, size, 0, Math.PI * 2)
                ctx.fill()
                
                // Add inner glow
                ctx.globalAlpha = alpha * 0.3
                ctx.beginPath()
                ctx.arc(x, y, size * 2, 0, Math.PI * 2)
                ctx.fill()
                break
        }

        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
    }

    // Update particles
    const updateParticles = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        setParticles(prev => {
            const updated = prev.map(particle => {
                // Update position
                particle.x += particle.velocity.x
                particle.y += particle.velocity.y

                // Update life
                particle.life -= 16

                // Bounce off edges
                if (particle.x <= 0 || particle.x >= canvas.width) {
                    particle.velocity.x *= -0.8
                }
                if (particle.y <= 0 || particle.y >= canvas.height) {
                    particle.velocity.y *= -0.8
                }

                // Mouse interaction
                if (enableInteraction) {
                    const dx = mouseX.get() - particle.x
                    const dy = mouseY.get() - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    
                    if (distance < mouseInfluence) {
                        const force = (mouseInfluence - distance) / mouseInfluence
                        particle.velocity.x += (dx / distance) * force * 0.5
                        particle.velocity.y += (dy / distance) * force * 0.5
                    }
                }

                return particle
            })

            // Remove dead particles and add new ones
            const alive = updated.filter(p => p.life > 0)
            
            // Add new particles
            if (Math.random() < emissionRate && alive.length < count) {
                alive.push(createParticle())
            }

            return alive
        })
    }

    // Render particles
    const render = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach(particle => {
            drawParticle(ctx, particle)
        })

        animationRef.current = requestAnimationFrame(render)
    }

    // Handle mouse movement
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
    }

    // Handle resize
    const handleResize = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
    }

    // Initialize
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        handleResize()
        
        // Create initial particles
        const initialParticles = Array.from({ length: count }, () => createParticle())
        setParticles(initialParticles)
        setIsVisible(true)

        // Start animation
        const animate = () => {
            updateParticles()
            render()
        }
        
        animationRef.current = requestAnimationFrame(animate)

        // Event listeners
        window.addEventListener('resize', handleResize)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Update animation loop
    useEffect(() => {
        if (!isVisible) return

        const interval = setInterval(() => {
            updateParticles()
        }, 16)

        return () => clearInterval(interval)
    }, [isVisible, particles])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.canvas
                    ref={canvasRef}
                    className={cn(
                        "absolute inset-0 pointer-events-none",
                        enableInteraction && "pointer-events-auto",
                        className
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onMouseMove={enableInteraction ? handleMouseMove : undefined}
                    style={{
                        mixBlendMode: 'multiply'
                    }}
                />
            )}
        </AnimatePresence>
    )
}