'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function FloatingParticles() {
    const [particles, setParticles] = useState<Array<{
        id: number
        x: number
        y: number
        size: number
        delay: number
        duration: number
        animationX: number
    }>>([])

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        const generatedParticles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            delay: Math.random() * 5,
            duration: Math.random() * 10 + 10,
            animationX: Math.random() * 20 - 10, // Pre-calculate animation X value
        }))
        setParticles(generatedParticles)
    }, [])

    // Don't render anything during SSR
    if (particles.length === 0) {
        return null
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-gradient-to-r from-violet-400/20 to-fuchsia-400/20 blur-sm"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, particle.animationX, 0],
                        opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}