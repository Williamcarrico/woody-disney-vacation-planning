"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

interface DynamicBackgroundProps {
    className?: string
    variant?: 'sparkles' | 'aurora' | 'constellation' | 'magic-dust'
    intensity?: 'low' | 'medium' | 'high'
    interactive?: boolean
    enableParallax?: boolean
}

export function DynamicBackground({
    className,
    variant = 'sparkles',
    intensity = 'medium',
    interactive = true,
    enableParallax = true
}: DynamicBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const controls = useAnimation()
    
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Handle mouse movement for interactive effects
    useEffect(() => {
        if (!interactive) return

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            
            const rect = containerRef.current.getBoundingClientRect()
            const x = (e.clientX - rect.left) / rect.width
            const y = (e.clientY - rect.top) / rect.height
            
            setMousePosition({ x, y })
            mouseX.set(x)
            mouseY.set(y)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [interactive, mouseX, mouseY])

    // Configuration based on variant and intensity
    const getConfig = () => {
        const configs = {
            sparkles: {
                particleCount: intensity === 'low' ? 15 : intensity === 'medium' ? 30 : 50,
                colors: ['#FFD700', '#FFF8DC', '#FFFFE0', '#F0E68C'],
                size: { min: 1, max: 3 },
                speed: { min: 0.5, max: 2 }
            },
            aurora: {
                particleCount: intensity === 'low' ? 8 : intensity === 'medium' ? 15 : 25,
                colors: ['#00FFFF', '#FF69B4', '#DDA0DD', '#87CEEB'],
                size: { min: 2, max: 8 },
                speed: { min: 0.3, max: 1.5 }
            },
            constellation: {
                particleCount: intensity === 'low' ? 20 : intensity === 'medium' ? 40 : 60,
                colors: ['#FFFFFF', '#E6E6FA', '#B0C4DE', '#F0F8FF'],
                size: { min: 1, max: 2 },
                speed: { min: 0.1, max: 0.8 }
            },
            'magic-dust': {
                particleCount: intensity === 'low' ? 25 : intensity === 'medium' ? 45 : 70,
                colors: ['#FF69B4', '#DDA0DD', '#FFB6C1', '#F0E68C'],
                size: { min: 0.5, max: 2.5 },
                speed: { min: 0.8, max: 2.5 }
            }
        }
        return configs[variant]
    }

    const config = getConfig()

    // Render sparkles variant
    const renderSparkles = () => (
        <>
            {Array.from({ length: config.particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * (config.size.max - config.size.min) + config.size.min,
                        height: Math.random() * (config.size.max - config.size.min) + config.size.min,
                        backgroundColor: config.colors[Math.floor(Math.random() * config.colors.length)],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
                        filter: 'blur(0.5px)'
                    }}
                    animate={{
                        scale: [0.5, 1.5, 0.5],
                        opacity: [0.3, 1, 0.3],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 2
                    }}
                />
            ))}
        </>
    )

    // Render aurora variant
    const renderAurora = () => (
        <>
            {Array.from({ length: config.particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: Math.random() * (config.size.max - config.size.min) + config.size.min,
                        height: Math.random() * (config.size.max - config.size.min) + config.size.min,
                        background: `radial-gradient(circle, ${config.colors[Math.floor(Math.random() * config.colors.length)]}, transparent)`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        filter: 'blur(2px)',
                        mixBlendMode: 'screen'
                    }}
                    animate={{
                        x: [0, Math.random() * 200 - 100],
                        y: [0, Math.random() * 200 - 100],
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        duration: Math.random() * 8 + 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 3
                    }}
                />
            ))}
        </>
    )

    // Render constellation variant
    const renderConstellation = () => (
        <>
            {Array.from({ length: config.particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                >
                    <motion.div
                        className="w-1 h-1 bg-white rounded-full"
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                            duration: Math.random() * 4 + 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 4
                        }}
                        style={{
                            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
                            filter: 'blur(0.3px)'
                        }}
                    />
                    {/* Connection lines for constellation effect */}
                    {i < config.particleCount - 1 && Math.random() > 0.7 && (
                        <motion.div
                            className="absolute w-px bg-white/20"
                            style={{
                                height: Math.random() * 50 + 20,
                                transformOrigin: 'top',
                                rotate: Math.random() * 360
                            }}
                            animate={{
                                opacity: [0, 0.3, 0]
                            }}
                            transition={{
                                duration: Math.random() * 3 + 2,
                                repeat: Infinity,
                                delay: Math.random() * 2
                            }}
                        />
                    )}
                </motion.div>
            ))}
        </>
    )

    // Render magic dust variant
    const renderMagicDust = () => (
        <>
            {Array.from({ length: config.particleCount }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                    animate={{
                        x: [0, (Math.random() - 0.5) * 300],
                        y: [0, (Math.random() - 0.5) * 300],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: Math.random() * 10 + 8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 5
                    }}
                >
                    <motion.div
                        className="rounded-full"
                        style={{
                            width: Math.random() * (config.size.max - config.size.min) + config.size.min,
                            height: Math.random() * (config.size.max - config.size.min) + config.size.min,
                            backgroundColor: config.colors[Math.floor(Math.random() * config.colors.length)],
                            boxShadow: '0 0 6px currentColor'
                        }}
                        animate={{
                            scale: [0.5, 1, 0.5],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                            duration: Math.random() * 2 + 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>
            ))}
        </>
    )

    const renderVariant = () => {
        switch (variant) {
            case 'sparkles':
                return renderSparkles()
            case 'aurora':
                return renderAurora()
            case 'constellation':
                return renderConstellation()
            case 'magic-dust':
                return renderMagicDust()
            default:
                return renderSparkles()
        }
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute inset-0 overflow-hidden pointer-events-none",
                className
            )}
        >
            {/* Interactive gradient overlay */}
            {interactive && (
                <motion.div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(300px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 255, 255, 0.1), transparent 70%)`
                    }}
                />
            )}

            {/* Parallax layers */}
            {enableParallax && (
                <>
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
                        }}
                    >
                        {renderVariant()}
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 opacity-60"
                        style={{
                            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`
                        }}
                    >
                        {Array.from({ length: Math.floor(config.particleCount / 3) }).map((_, i) => (
                            <motion.div
                                key={`layer2-${i}`}
                                className="absolute rounded-full bg-white/40"
                                style={{
                                    width: Math.random() * 2 + 1,
                                    height: Math.random() * 2 + 1,
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    filter: 'blur(1px)'
                                }}
                                animate={{
                                    opacity: [0.2, 0.6, 0.2],
                                    scale: [0.8, 1.2, 0.8]
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                            />
                        ))}
                    </motion.div>
                </>
            )}

            {!enableParallax && renderVariant()}
        </div>
    )
}