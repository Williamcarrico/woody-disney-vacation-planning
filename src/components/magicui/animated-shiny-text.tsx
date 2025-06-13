'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedShinyTextProps {
  children: React.ReactNode
  className?: string
  shimmerWidth?: number
}

export const AnimatedShinyText: React.FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <div className={cn("relative inline-block overflow-hidden", className)}>
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -top-2 -bottom-2"
        style={{
          background: `linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.8) 50%,
            transparent 75%
          )`,
          width: `${shimmerWidth}%`,
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 1,
        }}
      />
      
      {/* Background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black, transparent)',
        }}
      />
    </div>
  )
}