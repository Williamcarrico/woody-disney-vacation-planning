"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface GlassMorphismProps {
    children: React.ReactNode
    className?: string
    intensity?: number
    enableTilt?: boolean
    enableGlow?: boolean
    glowColor?: string
    borderRadius?: string
}

export function GlassMorphism({
    children,
    className,
    intensity = 0.1,
    enableTilt = true,
    enableGlow = true,
    glowColor = "rgba(255, 255, 255, 0.2)",
    borderRadius = "16px"
}: GlassMorphismProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(
        mouseYSpring,
        [-0.5, 0.5],
        enableTilt ? ["17.5deg", "-17.5deg"] : ["0deg", "0deg"]
    )
    const rotateY = useTransform(
        mouseXSpring,
        [-0.5, 0.5],
        enableTilt ? ["-17.5deg", "17.5deg"] : ["0deg", "0deg"]
    )

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
                borderRadius
            }}
            className={cn(
                "relative overflow-hidden",
                className
            )}
        >
            {/* Glass background */}
            <div
                className="absolute inset-0 backdrop-blur-md bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10"
                style={{ borderRadius }}
            />

            {/* Glow effect */}
            {enableGlow && (
                <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                        background: `radial-gradient(
                            600px circle at ${useTransform(
                                mouseXSpring,
                                [-0.5, 0.5],
                                ["0%", "100%"]
                            )}% ${useTransform(
                                mouseYSpring,
                                [-0.5, 0.5],
                                ["0%", "100%"]
                            )}%,
                            ${glowColor},
                            transparent 40%
                        )`,
                        borderRadius
                    }}
                    animate={{
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    borderRadius
                }}
            />

            {/* Content */}
            <div
                className="relative z-10"
                style={{
                    transform: "translateZ(20px)"
                }}
            >
                {children}
            </div>

            {/* Subtle inner border */}
            <div
                className="absolute inset-0 border border-white/10 dark:border-white/5 pointer-events-none"
                style={{ borderRadius }}
            />
        </motion.div>
    )
}

interface NeuralNetworkBackgroundProps {
    className?: string
    nodeCount?: number
    connectionOpacity?: number
    animationSpeed?: number
}

export function NeuralNetworkBackground({
    className,
    nodeCount = 50,
    connectionOpacity = 0.1,
    animationSpeed = 0.5
}: NeuralNetworkBackgroundProps) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden", className)}>
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Nodes */}
                {Array.from({ length: nodeCount }).map((_, i) => (
                    <motion.circle
                        key={i}
                        cx={`${Math.random() * 100}%`}
                        cy={`${Math.random() * 100}%`}
                        r={Math.random() * 2 + 1}
                        fill="currentColor"
                        className="text-primary/20"
                        filter="url(#glow)"
                        initial={{ opacity: 0 }}
                        animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
                
                {/* Connections */}
                {Array.from({ length: nodeCount / 3 }).map((_, i) => (
                    <motion.line
                        key={i}
                        x1={`${Math.random() * 100}%`}
                        y1={`${Math.random() * 100}%`}
                        x2={`${Math.random() * 100}%`}
                        y2={`${Math.random() * 100}%`}
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-primary/10"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: Math.random() * 3,
                            ease: "linear"
                        }}
                    />
                ))}
            </svg>
        </div>
    )
}