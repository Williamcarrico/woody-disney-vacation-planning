'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ParticleFieldProps {
    theme: 'day' | 'night'
}

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
}

export default function ParticleField({ theme }: ParticleFieldProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const animationRef = useRef<number | undefined>(undefined)
    const particlesRef = useRef<Particle[]>([])

    useEffect(() => {
        if (!containerRef.current) return

        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        const particleCount = 50

        // Initialize particles
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        }))

        const animate = () => {
            particlesRef.current = particlesRef.current.map(particle => {
                const { x: currentX, y: currentY, speedX, speedY } = particle

                let x = currentX + speedX
                let y = currentY + speedY

                // Wrap around edges
                if (x < 0) x = rect.width
                if (x > rect.width) x = 0
                if (y < 0) y = rect.height
                if (y > rect.height) y = 0

                return { ...particle, x, y }
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
            {particlesRef.current.map((particle, index) => (
                <motion.div
                    key={index}
                    className={`absolute rounded-full ${theme === 'night'
                        ? 'bg-purple-400'
                        : 'bg-blue-400'
                        }`}
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        opacity: particle.opacity
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Magic sparkles effect */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {[...Array(20)].map((_, i) => (
                    <motion.circle
                        key={`sparkle-${i}`}
                        r="1"
                        fill={theme === 'night' ? '#e9d5ff' : '#93c5fd'}
                        filter="url(#glow)"
                        initial={{
                            cx: Math.random() * 100 + '%',
                            cy: Math.random() * 100 + '%',
                            opacity: 0
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 2, 0]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}