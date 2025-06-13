'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  spotlightSize?: number
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className,
  spotlightColor = "rgba(156, 64, 255, 0.4)",
  spotlightSize = 300
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setMousePosition({ x, y })
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <div
      ref={cardRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: isHovering
            ? `radial-gradient(${spotlightSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 40%)`
            : 'transparent',
        }}
        animate={{
          opacity: isHovering ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Border glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background: isHovering
            ? `radial-gradient(${spotlightSize * 0.8}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 60%)`
            : 'transparent',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          padding: '1px',
        }}
        animate={{
          opacity: isHovering ? 0.8 : 0,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Additional glow particles */}
      {isHovering && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-purple-400"
              style={{
                left: mousePosition.x - 2,
                top: mousePosition.y - 2,
              }}
              animate={{
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                opacity: [1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}