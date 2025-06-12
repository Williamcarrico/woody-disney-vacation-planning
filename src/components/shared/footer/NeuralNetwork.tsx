'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface NeuralNetworkProps {
    theme: 'day' | 'night'
    className?: string
}

export default function NeuralNetwork({ theme, className = '' }: NeuralNetworkProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio
            canvas.height = canvas.offsetHeight * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Neural network nodes
        const nodes: Array<{ x: number; y: number; connections: number[]; activity: number }> = []
        const nodeCount = 20

        // Initialize nodes
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                connections: [],
                activity: Math.random()
            })
        }

        // Create connections
        nodes.forEach((node, i) => {
            const connectionCount = Math.floor(Math.random() * 3) + 1
            for (let j = 0; j < connectionCount; j++) {
                const targetIndex = Math.floor(Math.random() * nodeCount)
                if (targetIndex !== i && !node.connections.includes(targetIndex)) {
                    node.connections.push(targetIndex)
                }
            }
        })

        let animationId: number

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

            // Update node activity
            nodes.forEach(node => {
                node.activity += (Math.random() - 0.5) * 0.1
                node.activity = Math.max(0, Math.min(1, node.activity))
            })

            // Draw connections
            nodes.forEach(node => {
                node.connections.forEach(connectionIndex => {
                    const target = nodes[connectionIndex]
                    if (!target) return

                    const activity = (node.activity + target.activity) / 2
                    const alpha = activity * 0.6

                    ctx.beginPath()
                    ctx.moveTo(node.x, node.y)
                    ctx.lineTo(target.x, target.y)

                    if (theme === 'night') {
                        ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`
                    } else {
                        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
                    }

                    ctx.lineWidth = activity * 2
                    ctx.stroke()
                })
            })

            // Draw nodes
            nodes.forEach(node => {
                ctx.beginPath()
                ctx.arc(node.x, node.y, 3 + node.activity * 4, 0, Math.PI * 2)

                if (theme === 'night') {
                    ctx.fillStyle = `rgba(168, 85, 247, ${0.8 + node.activity * 0.2})`
                } else {
                    ctx.fillStyle = `rgba(99, 102, 241, ${0.8 + node.activity * 0.2})`
                }

                ctx.fill()

                // Glow effect
                ctx.beginPath()
                ctx.arc(node.x, node.y, 8 + node.activity * 6, 0, Math.PI * 2)

                if (theme === 'night') {
                    ctx.fillStyle = `rgba(168, 85, 247, ${node.activity * 0.1})`
                } else {
                    ctx.fillStyle = `rgba(99, 102, 241, ${node.activity * 0.1})`
                }

                ctx.fill()
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationId)
        }
    }, [theme])

    return (
        <motion.div
            className={`relative overflow-hidden rounded-xl ${className}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full"
            />

            {/* Overlay gradient */}
            <div className={`absolute inset-0 pointer-events-none ${theme === 'night'
                ? 'bg-gradient-to-t from-purple-900/20 to-transparent'
                : 'bg-gradient-to-t from-blue-100/20 to-transparent'
                }`} />

            {/* AI Label */}
            <motion.div
                className="absolute top-2 left-2 px-2 py-1 rounded-md backdrop-blur-sm bg-white/10 border border-white/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
            >
                <span className={`text-xs font-medium ${theme === 'night' ? 'text-purple-300' : 'text-blue-600'
                    }`}>
                    AI Neural Network
                </span>
            </motion.div>
        </motion.div>
    )
}