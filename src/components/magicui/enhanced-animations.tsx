"use client"

import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion"
import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Enhanced Magic Card with sophisticated hover effects
 */
interface EnhancedMagicCardProps {
    children: React.ReactNode
    className?: string
    glowColor?: string
    hoverScale?: number
    rotateOnHover?: boolean
}

export function EnhancedMagicCard({
    children,
    className,
    glowColor = "#8fdfff",
    hoverScale = 1.02,
    rotateOnHover = false
}: EnhancedMagicCardProps) {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-xl border bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-sm shadow-lg",
                className
            )}
            whileHover={{
                scale: hoverScale,
                rotateY: rotateOnHover ? 5 : 0,
                boxShadow: `0 20px 40px -10px ${glowColor}40`
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            style={{
                transformStyle: "preserve-3d"
            }}
        >
            {/* Animated border gradient */}
            <motion.div
                className="absolute inset-0 rounded-xl opacity-50"
                style={{
                    background: `linear-gradient(45deg, ${glowColor}20, transparent, ${glowColor}20)`
                }}
                animate={{
                    background: [
                        `linear-gradient(45deg, ${glowColor}20, transparent, ${glowColor}20)`,
                        `linear-gradient(225deg, ${glowColor}20, transparent, ${glowColor}20)`,
                        `linear-gradient(45deg, ${glowColor}20, transparent, ${glowColor}20)`
                    ]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            {/* Content */}
            <div className="relative z-10 p-6">
                {children}
            </div>
            
            {/* Sparkle effects on hover */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    )
}

/**
 * Floating Action Button with magnetic effect
 */
interface FloatingActionButtonProps {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    magneticStrength?: number
}

export function FloatingActionButton({
    children,
    onClick,
    className,
    magneticStrength = 20
}: FloatingActionButtonProps) {
    const ref = useRef<HTMLButtonElement>(null)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return
        
        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        
        const deltaX = (e.clientX - centerX) / magneticStrength
        const deltaY = (e.clientY - centerY) / magneticStrength
        
        ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`
    }

    const handleMouseLeave = () => {
        if (!ref.current) return
        ref.current.style.transform = "translate(0px, 0px) scale(1)"
    }

    return (
        <motion.button
            ref={ref}
            className={cn(
                "relative group overflow-hidden rounded-full bg-gradient-to-r from-primary to-secondary p-4 shadow-lg transition-all duration-300",
                className
            )}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
            }}
        >
            {/* Ripple effect */}
            <motion.div
                className="absolute inset-0 rounded-full bg-white"
                initial={{ scale: 0, opacity: 0.5 }}
                whileTap={{
                    scale: 2,
                    opacity: 0,
                    transition: { duration: 0.4 }
                }}
            />
            
            {/* Icon */}
            <motion.div
                className="relative z-10"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        </motion.button>
    )
}

/**
 * Reveal animation wrapper
 */
interface RevealProps {
    children: React.ReactNode
    direction?: "up" | "down" | "left" | "right"
    delay?: number
    once?: boolean
    className?: string
}

export function Reveal({
    children,
    direction = "up",
    delay = 0,
    once = true,
    className
}: RevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once })
    const controls = useAnimation()

    const directions = {
        up: { y: 50, opacity: 0 },
        down: { y: -50, opacity: 0 },
        left: { x: 50, opacity: 0 },
        right: { x: -50, opacity: 0 }
    }

    useEffect(() => {
        if (isInView) {
            controls.start({
                x: 0,
                y: 0,
                opacity: 1,
                transition: {
                    duration: 0.6,
                    delay,
                    ease: [0.4, 0, 0.2, 1]
                }
            })
        }
    }, [isInView, controls, delay])

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={directions[direction]}
            animate={controls}
        >
            {children}
        </motion.div>
    )
}

/**
 * Staggered children animation
 */
interface StaggeredProps {
    children: React.ReactNode
    stagger?: number
    className?: string
}

export function Staggered({ children, stagger = 0.1, className }: StaggeredProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: stagger,
                delayChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10
            }
        }
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            {Array.isArray(children) ? 
                children.map((child, index) => (
                    <motion.div key={index} variants={itemVariants}>
                        {child}
                    </motion.div>
                )) :
                <motion.div variants={itemVariants}>
                    {children}
                </motion.div>
            }
        </motion.div>
    )
}

/**
 * Morphing shape background
 */
export function MorphingBackground({ className }: { className?: string }) {
    return (
        <div className={cn("absolute inset-0 -z-10", className)}>
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8fdfff" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="#9c40ff" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ffaa40" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                
                <motion.path
                    d="M0,100 C50,50 100,150 200,100 C300,50 400,150 500,100 L500,300 L0,300 Z"
                    fill="url(#morphGradient)"
                    animate={{
                        d: [
                            "M0,100 C50,50 100,150 200,100 C300,50 400,150 500,100 L500,300 L0,300 Z",
                            "M0,150 C100,50 150,200 250,100 C350,50 450,150 500,120 L500,300 L0,300 Z",
                            "M0,120 C80,80 120,180 220,120 C320,80 380,180 500,100 L500,300 L0,300 Z",
                            "M0,100 C50,50 100,150 200,100 C300,50 400,150 500,100 L500,300 L0,300 Z"
                        ]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </svg>
        </div>
    )
}

/**
 * Particle field background
 */
interface ParticleFieldProps {
    particleCount?: number
    className?: string
}

export function ParticleField({ particleCount = 50, className }: ParticleFieldProps) {
    return (
        <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
            {[...Array(particleCount)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/20 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 1, 0.2],
                        scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Interactive cursor glow effect
 */
export function CursorGlow() {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return
            
            ref.current.style.left = `${e.clientX}px`
            ref.current.style.top = `${e.clientY}px`
        }

        document.addEventListener("mousemove", handleMouseMove)
        return () => document.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <motion.div
            ref={ref}
            className="fixed w-96 h-96 pointer-events-none -z-10"
            style={{
                background: "radial-gradient(circle, rgba(143,223,255,0.15) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        />
    )
}

/**
 * Text reveal animation
 */
interface TextRevealProps {
    text: string
    className?: string
    delay?: number
}

export function TextReveal({ text, className, delay = 0 }: TextRevealProps) {
    const words = text.split(" ")

    return (
        <motion.div
            className={className}
            initial="hidden"
            animate="visible"
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: 0.1,
                        delayChildren: delay
                    }
                }
            }}
        >
            {words.map((word, index) => (
                <motion.span
                    key={index}
                    className="inline-block mr-2"
                    variants={{
                        hidden: { y: 50, opacity: 0 },
                        visible: {
                            y: 0,
                            opacity: 1,
                            transition: {
                                type: "spring",
                                stiffness: 100,
                                damping: 10
                            }
                        }
                    }}
                >
                    {word}
                </motion.span>
            ))}
        </motion.div>
    )
}