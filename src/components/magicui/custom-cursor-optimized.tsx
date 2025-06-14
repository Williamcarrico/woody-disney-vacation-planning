'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { Sparkles, Star } from 'lucide-react'

interface FairyDustParticle {
  id: number
  x: number
  y: number
  life: number
  maxLife: number
  velocity: { x: number; y: number }
  size: number
  color: string
  sparkle: boolean
}

const MAX_PARTICLES = 30 // Reduced from 50 for better performance
const TRAIL_LENGTH = 10 // Reduced trail length

export const CustomCursorOptimized = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'magical' | 'sparkle' | 'fairy'>('default')
  const [isMounted, setIsMounted] = useState(false)
  const [fairyDust, setFairyDust] = useState<FairyDustParticle[]>([])
  const [mouseTrail, setMouseTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const trailIdRef = useRef(0)
  const animationIdRef = useRef<number>()
  const lastUpdateRef = useRef(0)
  const throttleInterval = 16 // ~60fps
  
  const springConfig = useMemo(() => ({ damping: 30, stiffness: 800 }), [])
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Memoized fairy dust colors palette
  const fairyColors = useMemo(() => [
    '#FFD700', '#FF69B4', '#87CEEB', '#DDA0DD', '#F0E68C',
    '#FFB6C1', '#E6E6FA', '#FFEFD5', '#B0E0E6', '#F5F5DC'
  ], [])

  // Optimized particle creation with object pooling concept
  const createFairyDustParticle = useCallback((x: number, y: number): FairyDustParticle => {
    return {
      id: Math.random(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      life: 60,
      maxLife: 60,
      velocity: {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3 - 1
      },
      size: Math.random() * 4 + 2,
      color: fairyColors[Math.floor(Math.random() * fairyColors.length)],
      sparkle: Math.random() > 0.7
    }
  }, [fairyColors])

  // Throttled animation frame for better performance
  const updateParticles = useCallback(() => {
    const now = performance.now()
    if (now - lastUpdateRef.current < throttleInterval) {
      animationIdRef.current = requestAnimationFrame(updateParticles)
      return
    }
    lastUpdateRef.current = now

    setFairyDust(prev => 
      prev
        .map(particle => ({
          ...particle,
          life: particle.life - 1,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          velocity: {
            ...particle.velocity,
            y: particle.velocity.y + 0.05 // gravity
          }
        }))
        .filter(particle => particle.life > 0)
    )

    // Clean up old trail points
    setMouseTrail(prev => prev.slice(-TRAIL_LENGTH))

    animationIdRef.current = requestAnimationFrame(updateParticles)
  }, [throttleInterval])

  // Optimized mouse move handler with throttling
  const moveCursor = useCallback((e: MouseEvent) => {
    const now = performance.now()
    if (now - lastUpdateRef.current < 8) return // Throttle to ~120fps
    
    cursorX.set(e.clientX)
    cursorY.set(e.clientY)
    
    // Add to trail with length limit
    setMouseTrail(prev => {
      const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: trailIdRef.current++ }]
      return newTrail.slice(-TRAIL_LENGTH)
    })

    // Create fairy dust particles on movement (reduced frequency)
    if (cursorVariant === 'fairy' && Math.random() > 0.8) {
      const newParticle = createFairyDustParticle(e.clientX, e.clientY)
      setFairyDust(prev => [...prev, newParticle].slice(-MAX_PARTICLES))
    }
  }, [cursorX, cursorY, cursorVariant, createFairyDustParticle])

  // Memoized event handlers
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false)
  }, [])

  const handleMouseDown = useCallback(() => {
    setCursorVariant('sparkle')
    
    // Create burst particles (reduced number)
    const burstParticles = Array.from({ length: 8 }, (_, i) => 
      createFairyDustParticle(cursorX.get(), cursorY.get())
    )
    setFairyDust(prev => [...prev, ...burstParticles].slice(-MAX_PARTICLES))
  }, [createFairyDustParticle, cursorX, cursorY])

  const handleMouseUp = useCallback(() => {
    setCursorVariant(isHovering ? 'magical' : 'fairy')
  }, [isHovering])

  // Mount effect
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Main effect with proper cleanup
  useEffect(() => {
    if (!isMounted) return

    // Start animation loop
    animationIdRef.current = requestAnimationFrame(updateParticles)

    // Add event listeners with passive option for better performance
    window.addEventListener('mousemove', moveCursor, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { capture: true, passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { capture: true, passive: true })
    document.addEventListener('mousedown', handleMouseDown, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })

    return () => {
      // Clean up animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      // Remove event listeners
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isMounted, moveCursor, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, updateParticles])

  // Don't render on server or when not visible
  if (!isMounted || !isVisible) return null

  // Memoized variants to prevent recreation
  const variants = useMemo(() => ({
    default: {
      scale: 1,
      rotate: 0,
      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.8), rgba(255, 105, 180, 0.4))',
    },
    magical: {
      scale: 1.8,
      rotate: [0, 360],
      background: 'radial-gradient(circle, rgba(255, 105, 180, 0.9), rgba(156, 64, 255, 0.6), rgba(255, 170, 64, 0.4))',
    },
    sparkle: {
      scale: 2.2,
      rotate: [0, 180, 360],
      background: 'radial-gradient(circle, rgba(255, 170, 64, 1), rgba(255, 105, 180, 0.8))',
    },
    fairy: {
      scale: [1, 1.2, 1],
      rotate: 0,
      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.7), rgba(221, 160, 221, 0.5), rgba(135, 206, 235, 0.3))',
    }
  }), [])

  return (
    <>
      {/* Hide default cursor */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>

      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={cursorVariant}
        variants={variants}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          mass: 0.8,
          rotate: { duration: 2, repeat: Infinity, ease: "linear" }
        }}
      >
        <div className="relative w-8 h-8 rounded-full backdrop-blur-sm border border-white/30 shadow-lg">
          <div className="absolute inset-1 rounded-full bg-white/20" />
          
          {/* Center sparkle */}
          {(cursorVariant === 'magical' || cursorVariant === 'sparkle') && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360, scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mouse trail - optimized with fewer elements */}
      <AnimatePresence>
        {mouseTrail.slice(-5).map((point, index) => (
          <motion.div
            key={point.id}
            className="pointer-events-none fixed w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-yellow-300 z-[9998]"
            style={{
              left: point.x - 4,
              top: point.y - 4,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          />
        ))}
      </AnimatePresence>

      {/* Fairy dust particles - optimized rendering */}
      <AnimatePresence>
        {fairyDust.map((particle) => (
          <motion.div
            key={particle.id}
            className="pointer-events-none fixed z-[9997] mix-blend-screen"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: particle.life / particle.maxLife,
              scale: particle.life / particle.maxLife,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.1 }}
          >
            {particle.sparkle && (
              <Star className="w-full h-full text-white" style={{ filter: 'drop-shadow(0 0 2px white)' }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  )
}

export default CustomCursorOptimized