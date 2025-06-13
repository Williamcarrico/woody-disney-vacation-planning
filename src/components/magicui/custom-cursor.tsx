'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [cursorVariant, setCursorVariant] = useState<'default' | 'magical' | 'sparkle'>('default')
  const [isMounted, setIsMounted] = useState(false)
  
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16)
      cursorY.set(e.clientY - 16)
      setIsVisible(true)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target
      
      // Enhanced type guard to check if target is an Element with closest method
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
        // Check for interactive elements
        const isButton = target.closest('button') !== null
        const isLink = target.closest('a') !== null
        const isRoleButton = target.closest('[role="button"]') !== null
        const isSparkleZone = target.closest('.sparkle-zone') !== null
        
        if (isButton || isLink || isRoleButton) {
          setIsHovering(true)
          setCursorVariant('magical')
        } else if (isSparkleZone) {
          setCursorVariant('sparkle')
        } else {
          setIsHovering(false)
          setCursorVariant('default')
        }
      } catch (error) {
        // Silently handle any remaining closest() errors
        console.warn('CustomCursor: Element interaction error:', error)
        setIsHovering(false)
        setCursorVariant('default')
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
      setCursorVariant('default')
    }

    const handleMouseDown = () => {
      setCursorVariant('sparkle')
    }

    const handleMouseUp = () => {
      setCursorVariant(isHovering ? 'magical' : 'default')
    }

    // Add passive listeners for better performance
    window.addEventListener('mousemove', moveCursor, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { capture: true, passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { capture: true, passive: true })
    document.addEventListener('mousedown', handleMouseDown, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('mouseenter', handleMouseEnter, true)
      document.removeEventListener('mouseleave', handleMouseLeave, true)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cursorX, cursorY, isHovering, isMounted])

  // Don't render on server or if not mounted
  if (!isMounted || !isVisible) return null

  const variants = {
    default: {
      scale: 1,
      rotate: 0,
      background: 'linear-gradient(45deg, #9c40ff, #ffaa40)',
    },
    magical: {
      scale: 1.5,
      rotate: 180,
      background: 'linear-gradient(45deg, #ff69b4, #9c40ff, #ffaa40)',
    },
    sparkle: {
      scale: 0.8,
      rotate: 360,
      background: 'linear-gradient(45deg, #ffaa40, #ff69b4)',
    }
  }

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed z-[9999] h-8 w-8 rounded-full mix-blend-difference"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        animate={variants[cursorVariant]}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      />

      {/* Cursor trail */}
      <motion.div
        className="pointer-events-none fixed z-[9998] h-6 w-6 rounded-full opacity-50 blur-sm"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          background: 'radial-gradient(circle, rgba(156, 64, 255, 0.6), rgba(255, 170, 64, 0.3))',
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{ delay: 0.1 }}
      />

      {/* Magic particles */}
      {cursorVariant === 'magical' && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="pointer-events-none fixed z-[9997] h-1 w-1 rounded-full bg-yellow-400"
              style={{
                left: cursorXSpring,
                top: cursorYSpring,
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 6) * 20,
                y: Math.sin((i * Math.PI * 2) / 6) * 20,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </>
      )}

      {/* Sparkle effect */}
      {cursorVariant === 'sparkle' && (
        <motion.div
          className="pointer-events-none fixed z-[9997]"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
        >
          <Sparkles className="h-4 w-4 text-yellow-400" />
        </motion.div>
      )}
    </>
  )
}