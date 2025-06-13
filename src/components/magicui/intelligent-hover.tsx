"use client"

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface IntelligentHoverProps {
    children: React.ReactNode
    className?: string
    hoverDepth?: number
    magnetStrength?: number
    enableMagnet?: boolean
    enableRipple?: boolean
    enableGradientFollow?: boolean
    borderRadius?: number
    shadowIntensity?: number
}

interface RippleEffect {
    x: number
    y: number
    id: number
}

export function IntelligentHover({
    children,
    className,
    hoverDepth = 10,
    magnetStrength = 0.15,
    enableMagnet = true,
    enableRipple = true,
    enableGradientFollow = true,
    borderRadius = 12,
    shadowIntensity = 0.2
}: IntelligentHoverProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [ripples, setRipples] = useState<RippleEffect[]>([])

    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)

    const springConfig = { stiffness: 150, damping: 25 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)
    const rotateXSpring = useSpring(rotateX, springConfig)
    const rotateYSpring = useSpring(rotateY, springConfig)

    const transform = useTransform(
        [xSpring, ySpring, rotateXSpring, rotateYSpring],
        ([x, y, rotateX, rotateY]) =>
            `translate3d(${x}px, ${y}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    )

    const shadowX = useTransform(xSpring, [-100, 100], [-50, 50])
    const shadowY = useTransform(ySpring, [-100, 100], [-50, 50])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        // Magnetic effect
        if (enableMagnet) {
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
            const maxDistance = 200

            if (distance < maxDistance) {
                const strength = (maxDistance - distance) / maxDistance
                x.set(distanceX * magnetStrength * strength)
                y.set(distanceY * magnetStrength * strength)
            }
        }

        // 3D tilt effect
        const tiltX = (distanceY / rect.height) * hoverDepth
        const tiltY = (distanceX / rect.width) * hoverDepth

        rotateX.set(-tiltX)
        rotateY.set(tiltY)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        x.set(0)
        y.set(0)
        rotateX.set(0)
        rotateY.set(0)
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!enableRipple || !ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const newRipple: RippleEffect = {
            x,
            y,
            id: Date.now()
        }

        setRipples(prev => [...prev, newRipple])

        // Remove ripple after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
        }, 600)
    }

    // Gradient follow effect
    const gradientX = useTransform(xSpring, [-100, 100], ["0%", "100%"])
    const gradientY = useTransform(ySpring, [-100, 100], ["0%", "100%"])

    return (
        <motion.div
            ref={ref}
            className={cn("relative cursor-pointer", className)}
            style={{
                transform,
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Dynamic shadow */}
            <motion.div
                className="absolute inset-0 rounded-lg opacity-0"
                style={{
                    background: `radial-gradient(circle at center, rgba(0,0,0,${shadowIntensity}), transparent 70%)`,
                    x: shadowX,
                    y: shadowY,
                    borderRadius
                }}
                animate={{
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Gradient follow background */}
            {enableGradientFollow && (
                <motion.div
                    className="absolute inset-0 rounded-lg opacity-0"
                    style={{
                        background: `radial-gradient(circle at ${gradientX} ${gradientY}, rgba(var(--primary), 0.1), transparent 50%)`,
                        borderRadius
                    }}
                    animate={{
                        opacity: isHovered ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Ripple effects */}
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            borderRadius: "50%"
                        }}
                        initial={{
                            width: 0,
                            height: 0,
                            opacity: 0.6,
                            x: "-50%",
                            y: "-50%"
                        }}
                        animate={{
                            width: 300,
                            height: 300,
                            opacity: 0
                        }}
                        exit={{
                            opacity: 0
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut"
                        }}
                        className="bg-white/20 dark:bg-white/10"
                    />
                ))}
            </AnimatePresence>

            {/* Content with subtle 3D lift */}
            <motion.div
                className="relative z-10"
                style={{
                    transform: "translateZ(20px)"
                }}
            >
                {children}
            </motion.div>

            {/* Ambient border glow */}
            <motion.div
                className="absolute inset-0 rounded-lg border border-transparent"
                style={{
                    background: `linear-gradient(135deg, rgba(var(--primary), 0.2), rgba(var(--secondary), 0.2))`,
                    borderRadius
                }}
                animate={{
                    opacity: isHovered ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.div>
    )
}

interface ContextAwareHoverProps {
    children: React.ReactNode
    className?: string
    context?: 'navigation' | 'action' | 'content' | 'interactive'
    intensity?: 'subtle' | 'medium' | 'dramatic'
}

export function ContextAwareHover({
    children,
    className,
    context = 'content',
    intensity = 'medium'
}: ContextAwareHoverProps) {
    const getHoverConfig = () => {
        const configs = {
            navigation: {
                hoverDepth: intensity === 'subtle' ? 3 : intensity === 'medium' ? 6 : 10,
                magnetStrength: 0.05,
                enableRipple: false,
                enableGradientFollow: true
            },
            action: {
                hoverDepth: intensity === 'subtle' ? 5 : intensity === 'medium' ? 10 : 15,
                magnetStrength: 0.1,
                enableRipple: true,
                enableGradientFollow: true
            },
            content: {
                hoverDepth: intensity === 'subtle' ? 2 : intensity === 'medium' ? 4 : 8,
                magnetStrength: 0.03,
                enableRipple: false,
                enableGradientFollow: false
            },
            interactive: {
                hoverDepth: intensity === 'subtle' ? 8 : intensity === 'medium' ? 12 : 18,
                magnetStrength: 0.15,
                enableRipple: true,
                enableGradientFollow: true
            }
        }

        return configs[context]
    }

    const config = getHoverConfig()

    return (
        <IntelligentHover
            className={className}
            {...config}
        >
            {children}
        </IntelligentHover>
    )
}