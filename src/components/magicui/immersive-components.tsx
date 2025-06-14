"use client"

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef, useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

/**
 * 3D Holographic Card with advanced visual effects
 */
interface HolographicCardProps {
    children: React.ReactNode
    className?: string
    intensity?: number
    enableHologram?: boolean
    enableParallax?: boolean
    glowColor?: string
}

export function HolographicCard({
    children,
    className,
    intensity = 1,
    enableHologram = true,
    enableParallax = true,
    glowColor = "#8B5CF6"
}: HolographicCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const { theme } = useTheme()

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)

    const springConfig = { stiffness: 300, damping: 30 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)
    const rotateXSpring = useSpring(rotateX, springConfig)
    const rotateYSpring = useSpring(rotateY, springConfig)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const mouseX = e.clientX - centerX
        const mouseY = e.clientY - centerY

        // 3D rotation based on mouse position
        const rotateXValue = (mouseY / rect.height) * 25 * intensity
        const rotateYValue = (mouseX / rect.width) * 25 * intensity

        rotateX.set(rotateXValue)
        rotateY.set(rotateYValue)

        // Parallax effect
        if (enableParallax) {
            x.set(mouseX * 0.1)
            y.set(mouseY * 0.1)
        }
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
        rotateX.set(0)
        rotateY.set(0)
    }

    return (
        <motion.div
            ref={ref}
            className={cn("relative perspective-1000", className)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                transformStyle: "preserve-3d"
            }}
        >
            {/* Main card */}
            <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20"
                style={{
                    rotateX: rotateXSpring,
                    rotateY: rotateYSpring,
                    transformStyle: "preserve-3d"
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
            >
                {/* Holographic overlay */}
                {enableHologram && (
                    <motion.div
                        className="absolute inset-0 opacity-0"
                        style={{
                            background: `linear-gradient(
                                135deg,
                                transparent 0%,
                                rgba(255, 255, 255, 0.1) 25%,
                                transparent 50%,
                                rgba(255, 255, 255, 0.1) 75%,
                                transparent 100%
                            )`,
                            backgroundSize: "200% 200%"
                        }}
                        animate={{
                            backgroundPosition: isHovered ? ["0% 0%", "100% 100%"] : "0% 0%",
                            opacity: isHovered ? [0, 0.8, 0] : 0
                        }}
                        transition={{
                            duration: 2,
                            repeat: isHovered ? Infinity : 0,
                            ease: "linear"
                        }}
                    />
                )}

                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        boxShadow: `0 0 0 1px ${glowColor}20, 0 0 20px ${glowColor}30, 0 0 40px ${glowColor}20`
                    }}
                    animate={{
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Scanning line effect */}
                <motion.div
                    className="absolute inset-0 opacity-0"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            transparent 0%,
                            ${glowColor}40 50%,
                            transparent 100%
                        )`,
                        width: "200%",
                        height: "2px",
                        top: "50%"
                    }}
                    animate={{
                        x: isHovered ? ["-100%", "100%"] : "-100%",
                        opacity: isHovered ? [0, 1, 0] : 0
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: isHovered ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                />

                {/* Content with 3D depth */}
                <motion.div
                    className="relative z-10 p-6"
                    style={{
                        transform: "translateZ(20px)"
                    }}
                >
                    {children}
                </motion.div>

                {/* Edge highlights */}
                <div className="absolute inset-0 rounded-2xl border border-white/10" />
                <div className="absolute inset-1 rounded-2xl border border-white/5" />
            </motion.div>

            {/* Floating particles around card */}
            {isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 rounded-full"
                            style={{
                                backgroundColor: glowColor,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                                y: [0, -50],
                                x: [0, (Math.random() - 0.5) * 100]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

/**
 * Immersive 3D Scene Container
 */
interface Scene3DContainerProps {
    children: React.ReactNode
    className?: string
    enableFog?: boolean
    enableLighting?: boolean
    cameraDistance?: number
}

export function Scene3DContainer({
    children,
    className,
    enableFog = true,
    enableLighting = true,
    cameraDistance = 1000
}: Scene3DContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height

        setMousePosition({ x, y })
    }, [])

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove)
        return () => document.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    const sceneRotateX = mousePosition.y * 10
    const sceneRotateY = mousePosition.x * 10

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            style={{
                perspective: `${cameraDistance}px`,
                perspectiveOrigin: "center center"
            }}
        >
            {/* Fog overlay */}
            {enableFog && (
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40" />
                </div>
            )}

            {/* Lighting effects */}
            {enableLighting && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Key light */}
                    <motion.div
                        className="absolute w-96 h-96 rounded-full opacity-20"
                        style={{
                            background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
                            left: "20%",
                            top: "20%",
                            filter: "blur(20px)"
                        }}
                        animate={{
                            x: mousePosition.x * 50,
                            y: mousePosition.y * 50
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    
                    {/* Fill light */}
                    <motion.div
                        className="absolute w-64 h-64 rounded-full opacity-10"
                        style={{
                            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
                            right: "20%",
                            bottom: "30%",
                            filter: "blur(30px)"
                        }}
                        animate={{
                            x: -mousePosition.x * 30,
                            y: -mousePosition.y * 30
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                </div>
            )}

            {/* 3D Scene */}
            <motion.div
                className="relative w-full h-full"
                style={{
                    transformStyle: "preserve-3d",
                    rotateX: sceneRotateX,
                    rotateY: sceneRotateY
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </div>
    )
}

/**
 * Floating Element with physics-based animation
 */
interface FloatingElementProps {
    children: React.ReactNode
    className?: string
    floatDistance?: number
    floatDuration?: number
    rotationEnabled?: boolean
    depthLevel?: number
}

export function FloatingElement({
    children,
    className,
    floatDistance = 20,
    floatDuration = 4,
    rotationEnabled = false,
    depthLevel = 0
}: FloatingElementProps) {
    const translateZ = depthLevel * 50

    return (
        <motion.div
            className={cn("relative", className)}
            style={{
                transformStyle: "preserve-3d",
                transform: `translateZ(${translateZ}px)`
            }}
            animate={{
                y: [-floatDistance, floatDistance, -floatDistance],
                rotateZ: rotationEnabled ? [0, 5, -5, 0] : 0
            }}
            transition={{
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
            }}
            whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
            }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Magical Portal Effect
 */
interface MagicalPortalProps {
    isOpen: boolean
    onClose?: () => void
    children: React.ReactNode
    portalColor?: string
    className?: string
}

export function MagicalPortal({
    isOpen,
    onClose,
    children,
    portalColor = "#8B5CF6",
    className
}: MagicalPortalProps) {
    const { theme } = useTheme()

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Portal rings */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border-2"
                            style={{
                                borderColor: `${portalColor}${Math.floor((1 - i * 0.2) * 255).toString(16).padStart(2, '0')}`,
                                width: `${(i + 1) * 100}px`,
                                height: `${(i + 1) * 100}px`
                            }}
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{
                                scale: [0, 1.2, 1],
                                rotate: 360,
                                borderColor: [
                                    `${portalColor}00`,
                                    `${portalColor}80`,
                                    `${portalColor}40`
                                ]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}

                    {/* Portal energy */}
                    <motion.div
                        className="absolute rounded-full"
                        style={{
                            width: "300px",
                            height: "300px",
                            background: `radial-gradient(circle, ${portalColor}20 0%, transparent 70%)`
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    {/* Floating energy particles */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: portalColor,
                                left: `${45 + Math.random() * 10}%`,
                                top: `${45 + Math.random() * 10}%`
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                x: [0, (Math.random() - 0.5) * 200],
                                y: [0, (Math.random() - 0.5) * 200],
                                opacity: [0, 1, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.1,
                                ease: "easeOut"
                            }}
                        />
                    ))}

                    {/* Content */}
                    <motion.div
                        className="relative z-10 max-w-lg w-full mx-4"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 20
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/**
 * Depth-of-Field Effect Container
 */
interface DepthOfFieldProps {
    children: React.ReactNode
    className?: string
    focalDistance?: number
    blurIntensity?: number
    enableAutoFocus?: boolean
}

export function DepthOfField({
    children,
    className,
    focalDistance = 0,
    blurIntensity = 5,
    enableAutoFocus = true
}: DepthOfFieldProps) {
    const [focusPoint, setFocusPoint] = useState({ x: 50, y: 50 })
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!enableAutoFocus || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        setFocusPoint({ x, y })
    }, [enableAutoFocus])

    useEffect(() => {
        if (enableAutoFocus) {
            document.addEventListener('mousemove', handleMouseMove)
            return () => document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [enableAutoFocus, handleMouseMove])

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", className)}
            style={{
                perspective: "1000px"
            }}
        >
            {/* Depth layers */}
            {Array.from({ length: 5 }).map((_, i) => {
                const depth = (i - 2) * 100 // -200 to 200
                const distanceFromFocus = Math.abs(depth - focalDistance)
                const blurAmount = Math.min(distanceFromFocus / 50 * blurIntensity, blurIntensity)

                return (
                    <motion.div
                        key={i}
                        className="absolute inset-0"
                        style={{
                            transform: `translateZ(${depth}px)`,
                            filter: `blur(${blurAmount}px)`,
                            opacity: 1 - (distanceFromFocus / 300)
                        }}
                        animate={{
                            filter: `blur(${blurAmount}px)`
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {i === 2 && children} {/* Middle layer contains main content */}
                    </motion.div>
                )
            })}

            {/* Focus indicator */}
            {enableAutoFocus && (
                <motion.div
                    className="absolute w-20 h-20 border-2 border-white/50 rounded-full pointer-events-none"
                    style={{
                        left: `${focusPoint.x}%`,
                        top: `${focusPoint.y}%`,
                        transform: "translate(-50%, -50%)"
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
        </div>
    )
}

/**
 * Cinematic Transition Effect
 */
interface CinematicTransitionProps {
    isVisible: boolean
    type?: 'fade' | 'slide' | 'zoom' | 'rotate' | 'magical'
    direction?: 'up' | 'down' | 'left' | 'right' | 'center'
    duration?: number
    children: React.ReactNode
    className?: string
}

export function CinematicTransition({
    isVisible,
    type = 'fade',
    direction = 'center',
    duration = 0.8,
    children,
    className
}: CinematicTransitionProps) {
    const getTransitionVariants = () => {
        const variants = {
            fade: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            },
            slide: {
                initial: {
                    x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
                    y: direction === 'up' ? -100 : direction === 'down' ? 100 : 0,
                    opacity: 0
                },
                animate: { x: 0, y: 0, opacity: 1 },
                exit: {
                    x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
                    y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
                    opacity: 0
                }
            },
            zoom: {
                initial: { scale: 0, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0, opacity: 0 }
            },
            rotate: {
                initial: { rotate: 180, scale: 0, opacity: 0 },
                animate: { rotate: 0, scale: 1, opacity: 1 },
                exit: { rotate: -180, scale: 0, opacity: 0 }
            },
            magical: {
                initial: {
                    scale: 0,
                    rotate: 360,
                    opacity: 0,
                    filter: "blur(10px) hue-rotate(180deg)"
                },
                animate: {
                    scale: 1,
                    rotate: 0,
                    opacity: 1,
                    filter: "blur(0px) hue-rotate(0deg)"
                },
                exit: {
                    scale: 0,
                    rotate: -360,
                    opacity: 0,
                    filter: "blur(10px) hue-rotate(180deg)"
                }
            }
        }

        return variants[type]
    }

    const variants = getTransitionVariants()

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    className={cn("relative", className)}
                    initial={variants.initial}
                    animate={variants.animate}
                    exit={variants.exit}
                    transition={{
                        duration,
                        ease: type === 'magical' ? [0.68, -0.55, 0.265, 1.55] : "easeInOut"
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}