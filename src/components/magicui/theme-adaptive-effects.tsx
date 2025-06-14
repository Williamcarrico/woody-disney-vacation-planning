"use client"

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { useTheme } from "next-themes"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Theme-adaptive particle system that changes behavior based on current theme
 */
interface ThemeAdaptiveParticlesProps {
    count?: number
    className?: string
    enableInteraction?: boolean
    mouseInfluence?: number
}

export function ThemeAdaptiveParticles({
    count = 50,
    className,
    enableInteraction = true,
    mouseInfluence = 100
}: ThemeAdaptiveParticlesProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        
        if (enableInteraction) {
            const handleMouseMove = (e: MouseEvent) => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect()
                    mouseX.set(e.clientX - rect.left)
                    mouseY.set(e.clientY - rect.top)
                }
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            return () => document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [enableInteraction, mouseX, mouseY])

    if (!mounted) return null

    const getThemeConfig = () => {
        switch (theme) {
            case 'light':
                return {
                    colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
                    shapes: ['circle', 'star', 'heart'],
                    animationStyle: 'gentle',
                    size: { min: 2, max: 6 },
                    opacity: { min: 0.3, max: 0.7 },
                    speed: { min: 2, max: 5 }
                }
            case 'dark':
                return {
                    colors: ['#60A5FA', '#A78BFA', '#F472B6', '#FBBF24'],
                    shapes: ['circle', 'diamond', 'glow'],
                    animationStyle: 'mystical',
                    size: { min: 3, max: 8 },
                    opacity: { min: 0.4, max: 0.9 },
                    speed: { min: 1, max: 4 }
                }
            default:
                return {
                    colors: ['#DC2626', '#EAB308', '#2563EB'],
                    shapes: ['circle', 'star', 'sparkle'],
                    animationStyle: 'magical',
                    size: { min: 2, max: 7 },
                    opacity: { min: 0.4, max: 0.8 },
                    speed: { min: 2, max: 6 }
                }
        }
    }

    const config = getThemeConfig()

    return (
        <div ref={containerRef} className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
            {Array.from({ length: count }).map((_, i) => {
                const color = config.colors[i % config.colors.length]
                const shape = config.shapes[i % config.shapes.length]
                const size = Math.random() * (config.size.max - config.size.min) + config.size.min
                const initialX = Math.random() * 100
                const initialY = Math.random() * 100
                const animationDuration = Math.random() * (config.speed.max - config.speed.min) + config.speed.min

                const xInfluence = useTransform(
                    mouseX,
                    [0, 1000],
                    enableInteraction ? [-mouseInfluence, mouseInfluence] : [0, 0]
                )
                
                const yInfluence = useTransform(
                    mouseY,
                    [0, 1000], 
                    enableInteraction ? [-mouseInfluence, mouseInfluence] : [0, 0]
                )

                return (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${initialX}%`,
                            top: `${initialY}%`,
                            x: xInfluence,
                            y: yInfluence
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [config.opacity.min, config.opacity.max, config.opacity.min],
                            scale: [0.8, 1.2, 0.8],
                            rotate: shape === 'star' ? [0, 360] : shape === 'diamond' ? [0, 180] : [0, 0]
                        }}
                        transition={{
                            duration: animationDuration,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: config.animationStyle === 'gentle' ? 'easeInOut' : 
                                  config.animationStyle === 'mystical' ? [0.4, 0, 0.6, 1] : 
                                  'linear'
                        }}
                    >
                        {shape === 'circle' && (
                            <div
                                className="rounded-full"
                                style={{
                                    width: size,
                                    height: size,
                                    backgroundColor: color,
                                    boxShadow: theme === 'dark' ? `0 0 ${size * 2}px ${color}` : 'none'
                                }}
                            />
                        )}
                        {shape === 'star' && (
                            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        )}
                        {shape === 'heart' && (
                            <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        )}
                        {shape === 'diamond' && (
                            <div
                                style={{
                                    width: size,
                                    height: size,
                                    backgroundColor: color,
                                    transform: 'rotate(45deg)',
                                    boxShadow: theme === 'dark' ? `0 0 ${size * 3}px ${color}` : 'none'
                                }}
                            />
                        )}
                        {shape === 'sparkle' && (
                            <div
                                className="relative"
                                style={{
                                    width: size,
                                    height: size
                                }}
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                                        filter: 'blur(1px)'
                                    }}
                                />
                                <div
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        width: size / 3,
                                        height: size / 3,
                                        backgroundColor: color,
                                        borderRadius: '50%'
                                    }}
                                />
                            </div>
                        )}
                        {shape === 'glow' && (
                            <div
                                style={{
                                    width: size,
                                    height: size,
                                    background: `radial-gradient(circle, ${color}80 0%, ${color}40 40%, transparent 70%)`,
                                    borderRadius: '50%',
                                    filter: 'blur(2px)'
                                }}
                            />
                        )}
                    </motion.div>
                )
            })}
        </div>
    )
}

/**
 * Dynamic background that adapts to theme and user interactions
 */
interface DynamicThemeBackgroundProps {
    className?: string
    intensity?: 'subtle' | 'medium' | 'dramatic'
    enableParallax?: boolean
}

export function DynamicThemeBackground({
    className,
    intensity = 'medium',
    enableParallax = true
}: DynamicThemeBackgroundProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const scrollY = useMotionValue(0)

    useEffect(() => {
        setMounted(true)
        
        if (enableParallax) {
            const handleScroll = () => scrollY.set(window.scrollY)
            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }
    }, [enableParallax, scrollY])

    if (!mounted) return null

    const parallaxY1 = useTransform(scrollY, [0, 1000], [0, -200])
    const parallaxY2 = useTransform(scrollY, [0, 1000], [0, -400])
    const parallaxY3 = useTransform(scrollY, [0, 1000], [0, -600])

    const getThemeGradients = () => {
        const intensityMap = {
            subtle: { opacity: 0.3, blur: 'blur-sm' },
            medium: { opacity: 0.5, blur: 'blur-md' },
            dramatic: { opacity: 0.7, blur: 'blur-lg' }
        }

        const config = intensityMap[intensity]

        switch (theme) {
            case 'light':
                return {
                    primary: `bg-gradient-to-br from-blue-400/[${config.opacity}] via-purple-400/[${config.opacity}] to-pink-400/[${config.opacity}]`,
                    secondary: `bg-gradient-to-tr from-indigo-300/[${config.opacity}] to-purple-300/[${config.opacity}]`,
                    accent: `bg-gradient-to-bl from-rose-300/[${config.opacity}] to-orange-300/[${config.opacity}]`,
                    blur: config.blur
                }
            case 'dark':
                return {
                    primary: `bg-gradient-to-br from-purple-600/[${config.opacity}] via-blue-600/[${config.opacity}] to-indigo-600/[${config.opacity}]`,
                    secondary: `bg-gradient-to-tr from-slate-700/[${config.opacity}] to-gray-700/[${config.opacity}]`,
                    accent: `bg-gradient-to-bl from-violet-600/[${config.opacity}] to-purple-600/[${config.opacity}]`,
                    blur: config.blur
                }
            default:
                return {
                    primary: `bg-gradient-to-br from-red-500/[${config.opacity}] via-yellow-500/[${config.opacity}] to-blue-500/[${config.opacity}]`,
                    secondary: `bg-gradient-to-tr from-red-400/[${config.opacity}] to-blue-400/[${config.opacity}]`,
                    accent: `bg-gradient-to-bl from-yellow-400/[${config.opacity}] to-red-400/[${config.opacity}]`,
                    blur: config.blur
                }
        }
    }

    const gradients = getThemeGradients()

    return (
        <div className={cn("fixed inset-0 -z-50 overflow-hidden", className)}>
            {/* Primary gradient layer */}
            <motion.div
                style={{ y: parallaxY1 }}
                className={cn(
                    "absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%]",
                    gradients.primary,
                    gradients.blur
                )}
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Secondary gradient layer */}
            <motion.div
                style={{ y: parallaxY2 }}
                className={cn(
                    "absolute inset-0 w-[110%] h-[110%] -top-[5%] -left-[5%]",
                    gradients.secondary,
                    gradients.blur
                )}
                animate={{
                    rotate: [360, 0],
                    scale: [1.2, 1, 1.2]
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Accent gradient layer */}
            <motion.div
                style={{ y: parallaxY3 }}
                className={cn(
                    "absolute inset-0 w-[100%] h-[100%]",
                    gradients.accent,
                    gradients.blur
                )}
                animate={{
                    rotate: [0, -360],
                    scale: [1, 1.3, 1]
                }}
                transition={{
                    duration: 80,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Theme-adaptive particles */}
            <ThemeAdaptiveParticles 
                count={intensity === 'subtle' ? 15 : intensity === 'medium' ? 25 : 40}
                enableInteraction={true}
                mouseInfluence={50}
            />
        </div>
    )
}

/**
 * Smart loading animation that adapts to theme and context
 */
interface SmartLoadingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    context?: 'page' | 'component' | 'inline' | 'overlay'
    message?: string
    className?: string
}

export function SmartLoading({
    size = 'md',
    context = 'component',
    message,
    className
}: SmartLoadingProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const sizeMap = {
        sm: { spinner: 'w-4 h-4', container: 'p-2', text: 'text-xs' },
        md: { spinner: 'w-8 h-8', container: 'p-4', text: 'text-sm' },
        lg: { spinner: 'w-12 h-12', container: 'p-6', text: 'text-base' },
        xl: { spinner: 'w-16 h-16', container: 'p-8', text: 'text-lg' }
    }

    const contextMap = {
        page: 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        component: 'absolute inset-0 bg-background/60 backdrop-blur-sm',
        inline: 'relative',
        overlay: 'fixed inset-0 bg-black/50 backdrop-blur-md z-50'
    }

    const config = sizeMap[size]

    const getThemeColors = () => {
        switch (theme) {
            case 'light':
                return ['#3B82F6', '#8B5CF6', '#EC4899']
            case 'dark':
                return ['#60A5FA', '#A78BFA', '#F472B6']
            default:
                return ['#DC2626', '#EAB308', '#2563EB']
        }
    }

    const colors = getThemeColors()

    return (
        <div className={cn(
            contextMap[context],
            'flex items-center justify-center',
            config.container,
            className
        )}>
            <div className="flex flex-col items-center space-y-4">
                {/* Adaptive spinner */}
                <div className={cn("relative", config.spinner)}>
                    {/* Outer ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-transparent"
                        style={{
                            borderTopColor: colors[0],
                            borderRightColor: colors[1],
                            borderBottomColor: colors[2]
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Inner ring */}
                    <motion.div
                        className="absolute inset-1 rounded-full border-2 border-transparent"
                        style={{
                            borderTopColor: colors[2],
                            borderLeftColor: colors[0]
                        }}
                        animate={{ rotate: -360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                    
                    {/* Center pulse */}
                    <motion.div
                        className="absolute inset-2 rounded-full"
                        style={{ backgroundColor: colors[1] }}
                        animate={{
                            scale: [0.8, 1.2, 0.8],
                            opacity: [0.7, 1, 0.7]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                {/* Loading message */}
                {message && (
                    <motion.p
                        className={cn(
                            "text-center text-muted-foreground font-medium",
                            config.text
                        )}
                        animate={{
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        {message}
                    </motion.p>
                )}

                {/* Loading dots */}
                <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors[i] }}
                            animate={{
                                y: [-5, 0, -5],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Context-aware notification system with theme adaptation
 */
interface ThemeNotificationProps {
    type?: 'success' | 'error' | 'warning' | 'info' | 'magical'
    title: string
    description?: string
    duration?: number
    onClose?: () => void
    className?: string
}

export function ThemeNotification({
    type = 'info',
    title,
    description,
    duration = 5000,
    onClose,
    className
}: ThemeNotificationProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        setMounted(true)
        
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(() => onClose?.(), 300)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    if (!mounted) return null

    const getTypeConfig = () => {
        const baseConfig = {
            success: { 
                colors: theme === 'dark' ? ['#22C55E', '#16A34A'] : ['#10B981', '#059669'],
                icon: '✓',
                bgOpacity: theme === 'dark' ? 'bg-green-900/20' : 'bg-green-50',
                borderColor: theme === 'dark' ? 'border-green-500/30' : 'border-green-200'
            },
            error: { 
                colors: theme === 'dark' ? ['#EF4444', '#DC2626'] : ['#F87171', '#EF4444'],
                icon: '✕',
                bgOpacity: theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50',
                borderColor: theme === 'dark' ? 'border-red-500/30' : 'border-red-200'
            },
            warning: { 
                colors: theme === 'dark' ? ['#F59E0B', '#D97706'] : ['#FBBF24', '#F59E0B'],
                icon: '⚠',
                bgOpacity: theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50',
                borderColor: theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-200'
            },
            info: { 
                colors: theme === 'dark' ? ['#3B82F6', '#2563EB'] : ['#60A5FA', '#3B82F6'],
                icon: 'ℹ',
                bgOpacity: theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50',
                borderColor: theme === 'dark' ? 'border-blue-500/30' : 'border-blue-200'
            },
            magical: { 
                colors: theme === 'dark' ? ['#A855F7', '#8B5CF6'] : ['#C084FC', '#A855F7'],
                icon: '✨',
                bgOpacity: theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50',
                borderColor: theme === 'dark' ? 'border-purple-500/30' : 'border-purple-200'
            }
        }

        return baseConfig[type]
    }

    const config = getTypeConfig()

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                        "fixed top-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg",
                        config.bgOpacity,
                        config.borderColor,
                        "backdrop-blur-sm",
                        className
                    )}
                >
                    <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <motion.div
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{
                                background: `linear-gradient(135deg, ${config.colors[0]}, ${config.colors[1]})`
                            }}
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: type === 'magical' ? [0, 5, -5, 0] : 0
                            }}
                            transition={{
                                duration: type === 'magical' ? 2 : 1,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            {config.icon}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-foreground">
                                {title}
                            </h4>
                            {description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => {
                                setVisible(false)
                                setTimeout(() => onClose?.(), 300)
                            }}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span className="sr-only">Close</span>
                            ✕
                        </button>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                        className="absolute bottom-0 left-0 h-1 rounded-b-lg"
                        style={{
                            background: `linear-gradient(90deg, ${config.colors[0]}, ${config.colors[1]})`
                        }}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: duration / 1000, ease: "linear" }}
                    />

                    {/* Magical sparkles for magical type */}
                    {type === 'magical' && (
                        <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 bg-purple-400 rounded-full"
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                    }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                        rotate: [0, 360]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}