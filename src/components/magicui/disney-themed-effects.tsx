"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Castle, Star, Sparkles, Heart } from "lucide-react"

/**
 * Disney Castle floating animation
 */
interface FloatingCastleProps {
    className?: string
    size?: number
}

export function FloatingCastle({ className, size = 100 }: FloatingCastleProps) {
    return (
        <motion.div
            className={cn("relative", className)}
            animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            <motion.div
                className="relative"
                whileHover={{
                    scale: 1.1,
                    filter: "drop-shadow(0 0 20px rgba(143,223,255,0.5))"
                }}
                transition={{ duration: 0.3 }}
            >
                <Castle 
                    size={size}
                    className="text-primary drop-shadow-lg"
                />
                
                {/* Magical sparkles around castle */}
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
                            top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 180, 360]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}

/**
 * Magic wand cursor trail
 */
export function MagicWandTrail() {
    const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
    const trailId = useRef(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const newPoint = {
                x: e.clientX,
                y: e.clientY,
                id: trailId.current++
            }

            setTrail(prev => {
                const newTrail = [newPoint, ...prev].slice(0, 8)
                return newTrail
            })
        }

        document.addEventListener("mousemove", handleMouseMove)
        
        // Clean up old trail points
        const cleanup = setInterval(() => {
            setTrail(prev => prev.slice(0, 6))
        }, 100)

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            clearInterval(cleanup)
        }
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            <AnimatePresence>
                {trail.map((point, index) => (
                    <motion.div
                        key={point.id}
                        className="absolute"
                        style={{
                            left: point.x - 2,
                            top: point.y - 2
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ 
                            scale: 1 - (index * 0.1),
                            opacity: 1 - (index * 0.15)
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

/**
 * Fireworks explosion effect
 */
interface FireworksProps {
    trigger: boolean
    onComplete?: () => void
    className?: string
}

export function Fireworks({ trigger, onComplete, className }: FireworksProps) {
    const [explosions, setExplosions] = useState<Array<{ x: number; y: number; id: number; color: string }>>([])

    useEffect(() => {
        if (trigger) {
            const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#a0e7e5"]
            const newExplosions = Array.from({ length: 3 }, (_, i) => ({
                x: Math.random() * 100,
                y: Math.random() * 60 + 20,
                id: Date.now() + i,
                color: colors[Math.floor(Math.random() * colors.length)]
            }))

            setExplosions(newExplosions)

            setTimeout(() => {
                setExplosions([])
                onComplete?.()
            }, 2000)
        }
    }, [trigger, onComplete])

    return (
        <div className={cn("fixed inset-0 pointer-events-none z-40", className)}>
            <AnimatePresence>
                {explosions.map((explosion) => (
                    <div
                        key={explosion.id}
                        className="absolute"
                        style={{
                            left: `${explosion.x}%`,
                            top: `${explosion.y}%`
                        }}
                    >
                        {/* Main explosion */}
                        <motion.div
                            className="absolute w-4 h-4 rounded-full"
                            style={{ backgroundColor: explosion.color }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 8, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                        
                        {/* Sparks */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{ backgroundColor: explosion.color }}
                                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                animate={{
                                    scale: [0, 1, 0],
                                    x: Math.cos((i * Math.PI * 2) / 12) * 100,
                                    y: Math.sin((i * Math.PI * 2) / 12) * 100,
                                    opacity: [1, 1, 0]
                                }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeOut",
                                    delay: 0.1
                                }}
                            />
                        ))}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    )
}

/**
 * Disney character celebration
 */
interface CelebrationProps {
    active: boolean
    character?: "mickey" | "castle" | "star"
    className?: string
}

export function Celebration({ active, character = "star", className }: CelebrationProps) {
    const icons = {
        mickey: "🐭",
        castle: "🏰",
        star: "⭐"
    }

    return (
        <AnimatePresence>
            {active && (
                <div className={cn("fixed inset-0 pointer-events-none z-30", className)}>
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-4xl"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`
                            }}
                            initial={{
                                scale: 0,
                                rotate: 0,
                                opacity: 0,
                                y: 100
                            }}
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: 360,
                                opacity: [0, 1, 0],
                                y: [100, -50, -100]
                            }}
                            exit={{
                                scale: 0,
                                opacity: 0
                            }}
                            transition={{
                                duration: 3,
                                delay: i * 0.1,
                                ease: "easeOut"
                            }}
                        >
                            {icons[character]}
                        </motion.div>
                    ))}
                </div>
            )}
        </AnimatePresence>
    )
}

/**
 * Magical loading spinner
 */
interface MagicalLoadingProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function MagicalLoading({ size = "md", className }: MagicalLoadingProps) {
    const sizes = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-16 h-16"
    }

    return (
        <div className={cn("relative", sizes[size], className)}>
            {/* Outer ring */}
            <motion.div
                className="absolute inset-0 border-4 border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            
            {/* Inner ring */}
            <motion.div
                className="absolute inset-2 border-4 border-secondary/40 border-t-secondary rounded-full"
                animate={{ rotate: -360 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            
            {/* Center sparkle */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
            
            {/* Orbiting stars */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2"
                    style={{
                        left: "50%",
                        top: "50%",
                        transformOrigin: "0 0"
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5
                    }}
                >
                    <div 
                        className="w-1 h-1 bg-yellow-400 rounded-full"
                        style={{
                            transform: `translate(${20 + i * 5}px, -1px)`
                        }}
                    />
                </motion.div>
            ))}
        </div>
    )
}

/**
 * Success celebration with Disney magic
 */
interface SuccessCelebrationProps {
    show: boolean
    message?: string
    onComplete?: () => void
}

export function SuccessCelebration({ show, message = "Success!", onComplete }: SuccessCelebrationProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onComplete?.()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [show, onComplete])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Background overlay */}
                    <motion.div
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    
                    {/* Success message */}
                    <motion.div
                        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                    >
                        {/* Magical aura */}
                        <motion.div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-secondary/20"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        
                        <div className="relative z-10 text-center">
                            {/* Success icon */}
                            <motion.div
                                className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <motion.div
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                >
                                    ✓
                                </motion.div>
                            </motion.div>
                            
                            {/* Message */}
                            <motion.h3
                                className="text-xl font-bold mb-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {message}
                            </motion.h3>
                            
                            <motion.p
                                className="text-muted-foreground"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Magic is in the details! ✨
                            </motion.p>
                        </div>
                        
                        {/* Floating hearts */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute text-red-500"
                                style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    top: `${20 + Math.random() * 60}%`
                                }}
                                animate={{
                                    y: [0, -20, -40],
                                    opacity: [0, 1, 0],
                                    scale: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 2,
                                    delay: 0.5 + i * 0.2,
                                    ease: "easeOut"
                                }}
                            >
                                <Heart className="w-4 h-4 fill-current" />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}