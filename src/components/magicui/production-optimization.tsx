"use client"

import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"

/**
 * Performance-optimized animation wrapper with reduced motion support
 */
interface OptimizedAnimationProps {
    children: React.ReactNode
    className?: string
    animationType?: 'fade' | 'slide' | 'scale' | 'rotate'
    triggerOnce?: boolean
    threshold?: number
    delay?: number
    duration?: number
    disabled?: boolean
}

export function OptimizedAnimation({
    children,
    className,
    animationType = 'fade',
    triggerOnce = true,
    threshold = 0.1,
    delay = 0,
    duration = 0.6,
    disabled = false
}: OptimizedAnimationProps) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { 
        once: triggerOnce, 
        margin: "-100px",
        amount: threshold
    })
    const prefersReducedMotion = useReducedMotion()

    // Memoize animation variants to prevent re-creation
    const variants = useMemo(() => {
        if (prefersReducedMotion || disabled) {
            return {
                initial: {},
                animate: {},
                exit: {}
            }
        }

        const animationMap = {
            fade: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            },
            slide: {
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -50 }
            },
            scale: {
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.8 }
            },
            rotate: {
                initial: { opacity: 0, rotate: 10 },
                animate: { opacity: 1, rotate: 0 },
                exit: { opacity: 0, rotate: -10 }
            }
        }

        return animationMap[animationType]
    }, [animationType, prefersReducedMotion, disabled])

    const transition = useMemo(() => ({
        duration: prefersReducedMotion ? 0.01 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: [0.4, 0, 0.2, 1]
    }), [duration, delay, prefersReducedMotion])

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={variants.initial}
            animate={isInView ? variants.animate : variants.initial}
            exit={variants.exit}
            transition={transition}
            style={{ willChange: 'auto' }}
        >
            {children}
        </motion.div>
    )
}

/**
 * Virtual scrolling component for large lists with animation support
 */
interface VirtualizedAnimatedListProps<T> {
    items: T[]
    renderItem: (item: T, index: number) => React.ReactNode
    itemHeight: number
    containerHeight: number
    className?: string
    overscan?: number
    enableAnimation?: boolean
}

export function VirtualizedAnimatedList<T>({
    items,
    renderItem,
    itemHeight,
    containerHeight,
    className,
    overscan = 5,
    enableAnimation = true
}: VirtualizedAnimatedListProps<T>) {
    const [scrollTop, setScrollTop] = useState(0)
    const prefersReducedMotion = useReducedMotion()

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )

    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex + 1).map((item, index) => ({
            item,
            index: startIndex + index
        }))
    }, [items, startIndex, endIndex])

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }, [])

    const totalHeight = items.length * itemHeight

    return (
        <div
            className={cn("overflow-auto", className)}
            style={{ height: containerHeight }}
            onScroll={handleScroll}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <AnimatePresence mode="popLayout">
                    {visibleItems.map(({ item, index }) => (
                        <motion.div
                            key={index}
                            className="absolute left-0 right-0"
                            style={{
                                top: index * itemHeight,
                                height: itemHeight
                            }}
                            initial={
                                enableAnimation && !prefersReducedMotion
                                    ? { opacity: 0, x: -20 }
                                    : false
                            }
                            animate={{ opacity: 1, x: 0 }}
                            exit={
                                enableAnimation && !prefersReducedMotion
                                    ? { opacity: 0, x: 20 }
                                    : false
                            }
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.2,
                                ease: "easeOut"
                            }}
                            layout={enableAnimation && !prefersReducedMotion}
                        >
                            {renderItem(item, index)}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}

/**
 * Lazy loading image component with optimized animations
 */
interface LazyImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    placeholder?: string
    onLoad?: () => void
    onError?: () => void
    enableAnimation?: boolean
}

export function LazyImage({
    src,
    alt,
    width,
    height,
    className,
    placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E",
    onLoad,
    onError,
    enableAnimation = true
}: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const [hasError, setHasError] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const prefersReducedMotion = useReducedMotion()

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observer.disconnect()
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px'
            }
        )

        if (imgRef.current) {
            observer.observe(imgRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const handleLoad = useCallback(() => {
        setIsLoaded(true)
        onLoad?.()
    }, [onLoad])

    const handleError = useCallback(() => {
        setHasError(true)
        onError?.()
    }, [onError])

    return (
        <div
            ref={imgRef}
            className={cn("relative overflow-hidden", className)}
            style={{ width, height }}
        >
            {/* Placeholder */}
            <motion.img
                src={placeholder}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                animate={{
                    opacity: isLoaded ? 0 : 1
                }}
                transition={{
                    duration: prefersReducedMotion ? 0 : 0.3
                }}
            />

            {/* Actual image */}
            {isInView && !hasError && (
                <motion.img
                    src={src}
                    alt={alt}
                    className="absolute inset-0 w-full h-full object-cover"
                    onLoad={handleLoad}
                    onError={handleError}
                    initial={
                        enableAnimation && !prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 1 }
                    }
                    animate={{
                        opacity: isLoaded ? 1 : 0
                    }}
                    transition={{
                        duration: prefersReducedMotion ? 0 : 0.5,
                        ease: "easeOut"
                    }}
                />
            )}

            {/* Loading shimmer effect */}
            {!isLoaded && !hasError && enableAnimation && !prefersReducedMotion && (
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            transparent 0%,
                            rgba(255, 255, 255, 0.4) 50%,
                            transparent 100%
                        )`,
                        backgroundSize: '200% 100%'
                    }}
                    animate={{
                        backgroundPosition: ['200% 0', '-200% 0']
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            )}

            {/* Error state */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Failed to load image
                    </span>
                </div>
            )}
        </div>
    )
}

/**
 * Resource-aware animation component that adapts to device capabilities
 */
interface AdaptiveAnimationProps {
    children: React.ReactNode
    className?: string
    fallback?: React.ReactNode
    lowPerformanceVariant?: React.ReactNode
}

export function AdaptiveAnimation({
    children,
    className,
    fallback,
    lowPerformanceVariant
}: AdaptiveAnimationProps) {
    const [performanceLevel, setPerformanceLevel] = useState<'high' | 'medium' | 'low'>('high')
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        const detectPerformance = () => {
            // Check device memory (if available)
            const memory = (navigator as any).deviceMemory
            
            // Check hardware concurrency
            const cores = navigator.hardwareConcurrency || 4
            
            // Check connection speed
            const connection = (navigator as any).connection
            const effectiveType = connection?.effectiveType || '4g'

            let score = 0

            // Memory scoring
            if (memory >= 8) score += 3
            else if (memory >= 4) score += 2
            else if (memory >= 2) score += 1

            // CPU scoring
            if (cores >= 8) score += 3
            else if (cores >= 4) score += 2
            else score += 1

            // Connection scoring
            if (effectiveType === '4g') score += 2
            else if (effectiveType === '3g') score += 1

            // Determine performance level
            if (score >= 7) setPerformanceLevel('high')
            else if (score >= 4) setPerformanceLevel('medium')
            else setPerformanceLevel('low')
        }

        detectPerformance()
    }, [])

    // Return appropriate component based on performance and accessibility
    if (prefersReducedMotion && fallback) {
        return <div className={className}>{fallback}</div>
    }

    if (performanceLevel === 'low' && lowPerformanceVariant) {
        return <div className={className}>{lowPerformanceVariant}</div>
    }

    if (performanceLevel === 'medium') {
        // Return simplified animations
        return (
            <motion.div
                className={className}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {children}
            </motion.div>
        )
    }

    // High performance - full animations
    return <div className={className}>{children}</div>
}

/**
 * Memory-efficient particle system
 */
interface EfficientParticlesProps {
    count?: number
    className?: string
    color?: string
    maxLifetime?: number
    enablePool?: boolean
}

export function EfficientParticles({
    count = 50,
    className,
    color = "#8B5CF6",
    maxLifetime = 5000,
    enablePool = true
}: EfficientParticlesProps) {
    const [particles, setParticles] = useState<Array<{
        id: number
        x: number
        y: number
        vx: number
        vy: number
        life: number
        maxLife: number
    }>>([])
    
    const particlePool = useRef<any[]>([])
    const animationFrame = useRef<number>()
    const lastTime = useRef<number>(0)
    const prefersReducedMotion = useReducedMotion()

    const createParticle = useCallback(() => {
        const particle = enablePool && particlePool.current.length > 0
            ? particlePool.current.pop()
            : {}

        Object.assign(particle, {
            id: Math.random(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 0,
            maxLife: Math.random() * maxLifetime + 1000
        })

        return particle
    }, [enablePool, maxLifetime])

    const updateParticles = useCallback((currentTime: number) => {
        if (prefersReducedMotion) return

        const deltaTime = currentTime - lastTime.current
        lastTime.current = currentTime

        setParticles(prevParticles => {
            const updatedParticles = prevParticles
                .map(particle => ({
                    ...particle,
                    x: particle.x + particle.vx * (deltaTime / 100),
                    y: particle.y + particle.vy * (deltaTime / 100),
                    life: particle.life + deltaTime
                }))
                .filter(particle => {
                    if (particle.life >= particle.maxLife) {
                        // Return to pool if enabled
                        if (enablePool) {
                            particlePool.current.push(particle)
                        }
                        return false
                    }
                    return true
                })

            // Add new particles if below count
            while (updatedParticles.length < count) {
                updatedParticles.push(createParticle())
            }

            return updatedParticles
        })

        animationFrame.current = requestAnimationFrame(updateParticles)
    }, [count, createParticle, enablePool, prefersReducedMotion])

    useEffect(() => {
        if (!prefersReducedMotion) {
            lastTime.current = performance.now()
            animationFrame.current = requestAnimationFrame(updateParticles)
        }

        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current)
            }
        }
    }, [updateParticles, prefersReducedMotion])

    // Initialize particles
    useEffect(() => {
        if (!prefersReducedMotion) {
            setParticles(Array.from({ length: count }, createParticle))
        }
    }, [count, createParticle, prefersReducedMotion])

    if (prefersReducedMotion) {
        return null
    }

    return (
        <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute w-1 h-1 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: color,
                        opacity: 1 - (particle.life / particle.maxLife),
                        transform: `scale(${1 - (particle.life / particle.maxLife)})`
                    }}
                />
            ))}
        </div>
    )
}

/**
 * Performance monitoring hook for development
 */
export function usePerformanceMonitor(componentName: string) {
    const renderCount = useRef(0)
    const startTime = useRef<number>()

    useEffect(() => {
        renderCount.current += 1
        startTime.current = performance.now()

        return () => {
            if (startTime.current && process.env.NODE_ENV === 'development') {
                const renderTime = performance.now() - startTime.current
                
                if (renderTime > 16) { // More than one frame at 60fps
                    console.warn(
                        `${componentName} render took ${renderTime.toFixed(2)}ms (render #${renderCount.current})`
                    )
                }
            }
        }
    })

    return {
        renderCount: renderCount.current,
        logPerformance: (label: string) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(`${componentName} ${label}: ${performance.now()}ms`)
            }
        }
    }
}

/**
 * Production-ready error boundary for animation components
 */
interface AnimationErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    onError?: (error: Error, errorInfo: any) => void
}

export class AnimationErrorBoundary extends React.Component<
    AnimationErrorBoundaryProps,
    { hasError: boolean }
> {
    constructor(props: AnimationErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Animation component error:', error, errorInfo)
        this.props.onError?.(error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 text-center text-muted-foreground">
                    Animation temporarily unavailable
                </div>
            )
        }

        return this.props.children
    }
}