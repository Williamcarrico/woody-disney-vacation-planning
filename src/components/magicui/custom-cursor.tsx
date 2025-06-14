'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface CustomCursorProps {
  enabled?: boolean
  respectReducedMotion?: boolean
  accessibilityMode?: boolean
}

export const CustomCursor = ({ 
  enabled = true, 
  respectReducedMotion = true,
  accessibilityMode = false 
}: CustomCursorProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'magical' | 'sparkle' | 'fairy'>('default')
  const [isMounted, setIsMounted] = useState(false)
  const [fairyDust, setFairyDust] = useState<FairyDustParticle[]>([])
  const [mouseTrail, setMouseTrail] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)
  const [lastInteractionType, setLastInteractionType] = useState<'mouse' | 'keyboard' | null>(null)
  
  const prefersReducedMotion = useReducedMotion()
  const shouldDisableCursor = !enabled || (respectReducedMotion && prefersReducedMotion) || accessibilityMode || isKeyboardUser
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const trailIdRef = useRef(0)
  const animationIdRef = useRef<number>()
  const keyboardTimeoutRef = useRef<NodeJS.Timeout>()
  
  const springConfig = { damping: 30, stiffness: 800 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Fairy dust colors palette
  const fairyColors = [
    '#FFD700', // Gold
    '#FF69B4', // Hot Pink  
    '#87CEEB', // Sky Blue
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#FFB6C1', // Light Pink
    '#E6E6FA', // Lavender
    '#FFEFD5', // Papaya Whip
    '#B0E0E6', // Powder Blue
    '#F5F5DC'  // Beige
  ]

  // Create fairy dust particle with performance optimization
  const createFairyDustParticle = useCallback((x: number, y: number): FairyDustParticle => ({
    id: Math.random(),
    x,
    y,
    life: 0,
    maxLife: Math.random() * 3000 + 2000, // 2-5 seconds
    velocity: {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2 - 1, // Slight upward bias
    },
    size: Math.random() * 4 + 2,
    color: fairyColors[Math.floor(Math.random() * fairyColors.length)],
    sparkle: Math.random() > 0.7, // 30% chance to sparkle
  }), [])

  // Enhanced keyboard usage detection with better accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // More comprehensive keyboard detection
      const keyboardKeys = [
        'Tab', 'Enter', 'Space', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete', 'Backspace'
      ]
      
      if (keyboardKeys.includes(e.key) || e.key.startsWith('F') || e.altKey || e.ctrlKey || e.metaKey) {
        setIsKeyboardUser(true)
        setLastInteractionType('keyboard')
        
        // Reset keyboard timeout
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current)
        }
        
        // Only show cursor again after prolonged mouse usage
        keyboardTimeoutRef.current = setTimeout(() => {
          if (lastInteractionType === 'mouse') {
            setIsKeyboardUser(false)
          }
        }, 2000)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Only switch to mouse mode if there's actual movement
      if (e.movementX !== 0 || e.movementY !== 0) {
        setLastInteractionType('mouse')
        
        // Only disable keyboard mode after sustained mouse movement
        if (keyboardTimeoutRef.current) {
          clearTimeout(keyboardTimeoutRef.current)
        }
        
        keyboardTimeoutRef.current = setTimeout(() => {
          setIsKeyboardUser(false)
        }, 500)
      }
    }

    const handleFocusIn = () => {
      setIsKeyboardUser(true)
      setLastInteractionType('keyboard')
    }

    // Add proper event listeners with capture for better detection
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('focusin', handleFocusIn, { capture: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('focusin', handleFocusIn, { capture: true })
      
      if (keyboardTimeoutRef.current) {
        clearTimeout(keyboardTimeoutRef.current)
      }
    }
  }, [lastInteractionType])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Optimized animation loop with performance improvements
  useEffect(() => {
    if (!isMounted || shouldDisableCursor) return

    const updateFairyDust = () => {
      setFairyDust(prevDust => {
        const updatedDust = prevDust
          .map(particle => ({
            ...particle,
            life: particle.life + 16, // Assuming 60fps
            x: particle.x + particle.velocity.x,
            y: particle.y + particle.velocity.y,
            velocity: {
              x: particle.velocity.x * 0.98, // Slow down over time
              y: particle.velocity.y * 0.98 + 0.02, // Add gravity
            }
          }))
          .filter(particle => particle.life < particle.maxLife)
        
        // Limit particles for performance
        return updatedDust.slice(0, 30)
      })
      
      if (!shouldDisableCursor) {
        animationIdRef.current = requestAnimationFrame(updateFairyDust)
      }
    }

    animationIdRef.current = requestAnimationFrame(updateFairyDust)
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isMounted, shouldDisableCursor])

  useEffect(() => {
    if (!isMounted || shouldDisableCursor) return

    const moveCursor = (e: MouseEvent) => {
      const x = e.clientX - 16
      const y = e.clientY - 16
      
      cursorX.set(x)
      cursorY.set(y)
      setIsVisible(true)

      // Throttled mouse trail for performance
      const newPoint = { x: e.clientX, y: e.clientY, id: trailIdRef.current++ }
      setMouseTrail(prev => [newPoint, ...prev].slice(0, 8)) // Reduced trail length

      // Generate fairy dust particles on movement (reduced frequency)
      if ((cursorVariant === 'fairy' || cursorVariant === 'magical') && Math.random() > 0.85) {
        const newParticles = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () =>
          createFairyDustParticle(e.clientX, e.clientY)
        )
        setFairyDust(prev => [...prev, ...newParticles].slice(-30)) // Reduced max particles
      }
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target
      
      const isElementWithClosest = (obj: EventTarget | null): obj is Element => {
        return obj !== null && 
               typeof obj === 'object' && 
               'nodeType' in obj && 
               obj.nodeType === Node.ELEMENT_NODE &&
               'closest' in obj &&
               typeof (obj as Element).closest === 'function'
      }
      
      if (!isElementWithClosest(target)) {
        return
      }
      
      try {
        const isButton = target.closest('button') !== null
        const isLink = target.closest('a') !== null
        const isRoleButton = target.closest('[role="button"]') !== null
        const isInteractive = target.closest('[tabindex]') !== null
        const isSparkleZone = target.closest('.sparkle-zone') !== null
        const isFairyZone = target.closest('.fairy-zone') !== null
        
        if (isButton || isLink || isRoleButton || isInteractive) {
          setIsHovering(true)
          setCursorVariant('magical')
        } else if (isSparkleZone) {
          setCursorVariant('sparkle')
        } else if (isFairyZone) {
          setCursorVariant('fairy')
        } else {
          setIsHovering(false)
          setCursorVariant('fairy') // Default to fairy mode for artistic effect
        }
      } catch (error) {
        console.warn('CustomCursor: Element interaction error:', error)
        setIsHovering(false)
        setCursorVariant('default')
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      setCursorVariant('default')
    }

    const handleMouseDown = (e: MouseEvent) => {
      // Create burst effect on click
      if (cursorVariant !== 'default') {
        const burstParticles = Array.from({ length: 5 }, () =>
          createFairyDustParticle(e.clientX, e.clientY)
        )
        setFairyDust(prev => [...prev, ...burstParticles].slice(-30))
      }
    }

    const handleMouseUp = () => {
      // Reset cursor scale after click
    }

    const handleMouseOut = () => {
      setIsVisible(false)
    }

    // Use passive listeners for better performance
    document.addEventListener('mousemove', moveCursor, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true, capture: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    document.addEventListener('mousedown', handleMouseDown, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })
    document.addEventListener('mouseout', handleMouseOut, { passive: true })

    return () => {
      document.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseenter', handleMouseEnter, { capture: true })
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [cursorX, cursorY, isMounted, shouldDisableCursor, cursorVariant, createFairyDustParticle])

  // Don't render if should be disabled
  if (!isMounted || shouldDisableCursor) {
    return null
  }

  return (
    <>
      {/* Screen reader announcement for accessibility */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {isKeyboardUser ? 'Keyboard navigation mode active' : 'Mouse interaction mode active'}
      </div>

      {/* Cursor container with proper accessibility attributes */}
      <div 
        className="fixed inset-0 pointer-events-none z-[9999]"
        role="presentation"
        aria-hidden="true"
      >
        <AnimatePresence>
          {isVisible && (
            <>
              {/* Main cursor */}
              <motion.div
                className={cn(
                  'fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference',
                  {
                    'bg-white': cursorVariant === 'default',
                    'bg-gradient-to-r from-red-500 to-blue-500': cursorVariant === 'magical',
                    'bg-gradient-to-r from-yellow-400 to-pink-500': cursorVariant === 'sparkle',
                    'bg-gradient-to-r from-purple-400 to-pink-500': cursorVariant === 'fairy',
                  }
                )}
                style={{
                  x: cursorXSpring,
                  y: cursorYSpring,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isHovering ? 1.5 : 1, 
                  opacity: 1,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  opacity: { duration: 0.2 }
                }}
              />

              {/* Cursor icon overlay */}
              {(cursorVariant === 'magical' || cursorVariant === 'sparkle') && (
                <motion.div
                  className="fixed top-0 left-0 pointer-events-none z-[10000]"
                  style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {cursorVariant === 'magical' && (
                    <Sparkles className="w-4 h-4 text-white translate-x-2 translate-y-2" />
                  )}
                  {cursorVariant === 'sparkle' && (
                    <Star className="w-4 h-4 text-white translate-x-2 translate-y-2" />
                  )}
                </motion.div>
              )}

              {/* Optimized mouse trail */}
              {mouseTrail.slice(0, 6).map((point, index) => (
                <motion.div
                  key={point.id}
                  className="fixed w-2 h-2 bg-white rounded-full pointer-events-none mix-blend-difference"
                  style={{
                    left: point.x - 4,
                    top: point.y - 4,
                  }}
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ 
                    scale: 0.3 - (index * 0.05), 
                    opacity: 0.8 - (index * 0.15) 
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}

              {/* Optimized fairy dust particles */}
              {fairyDust.slice(0, 20).map((particle) => (
                <motion.div
                  key={particle.id}
                  className="fixed pointer-events-none rounded-full"
                  style={{
                    left: particle.x - particle.size / 2,
                    top: particle.y - particle.size / 2,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    opacity: Math.max(0, 1 - (particle.life / particle.maxLife)),
                  }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: particle.sparkle ? [1, 1.5, 1] : 1,
                  }}
                  transition={{ 
                    scale: { 
                      duration: 0.5, 
                      repeat: particle.sparkle ? Infinity : 0,
                      repeatType: 'reverse' 
                    } 
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default CustomCursor