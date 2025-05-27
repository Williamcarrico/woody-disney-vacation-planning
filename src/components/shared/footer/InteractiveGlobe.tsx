'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface InteractiveGlobeProps {
    theme: 'day' | 'night'
}

export default function InteractiveGlobe({ theme }: InteractiveGlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [rotation, setRotation] = useState(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = Math.min(centerX, centerY) - 20

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Globe base
            const gradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 0, centerX, centerY, radius)
            if (theme === 'night') {
                gradient.addColorStop(0, 'rgba(147, 51, 234, 0.8)')
                gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.6)')
                gradient.addColorStop(1, 'rgba(30, 41, 59, 0.9)')
            } else {
                gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
                gradient.addColorStop(0.7, 'rgba(147, 197, 253, 0.6)')
                gradient.addColorStop(1, 'rgba(99, 102, 241, 0.9)')
            }

            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.fill()

            // Rotating lines (latitude/longitude)
            ctx.strokeStyle = theme === 'night' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'
            ctx.lineWidth = 1

            // Latitude lines
            for (let i = 1; i < 6; i++) {
                const y = centerY + (radius * 0.8 * Math.cos((i * Math.PI) / 6)) * Math.sin(rotation * 0.01)
                ctx.beginPath()
                ctx.ellipse(centerX, y, radius * 0.9, radius * 0.2, 0, 0, Math.PI * 2)
                ctx.stroke()
            }

            // Longitude lines
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4 + rotation * 0.01
                ctx.beginPath()
                ctx.ellipse(centerX, centerY, radius * 0.3, radius * 0.9, angle, 0, Math.PI * 2)
                ctx.stroke()
            }

            // Glowing dots (representing locations)
            const dots = [
                { x: 0.3, y: 0.2 }, { x: -0.4, y: -0.1 }, { x: 0.2, y: -0.3 },
                { x: -0.2, y: 0.4 }, { x: 0.5, y: 0.1 }, { x: -0.3, y: -0.4 }
            ]

            dots.forEach((dot, index) => {
                const phase = rotation * 0.02 + index
                const x = centerX + dot.x * radius * Math.cos(phase)
                const y = centerY + dot.y * radius * Math.sin(phase * 0.7)
                const size = 3 + Math.sin(phase) * 1.5

                ctx.fillStyle = theme === 'night'
                    ? `rgba(251, 146, 60, ${0.7 + Math.sin(phase) * 0.3})`
                    : `rgba(236, 72, 153, ${0.7 + Math.sin(phase) * 0.3})`
                ctx.beginPath()
                ctx.arc(x, y, size, 0, Math.PI * 2)
                ctx.fill()

                // Glow effect
                ctx.shadowBlur = 10
                ctx.shadowColor = theme === 'night' ? '#fb923c' : '#ec4899'
                ctx.fill()
                ctx.shadowBlur = 0
            })

            setRotation(prev => prev + 1)
        }

        const interval = setInterval(animate, 50)
        return () => clearInterval(interval)
    }, [theme, rotation])

    return (
        <motion.div
            className="w-full h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            <motion.canvas
                ref={canvasRef}
                width={200}
                height={180}
                className="cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
            />
        </motion.div>
    )
}