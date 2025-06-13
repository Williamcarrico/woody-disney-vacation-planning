'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextShimmerProps {
  children: React.ReactNode
  className?: string
  duration?: number
  spread?: number
}

export const TextShimmer: React.FC<TextShimmerProps> = ({
  children,
  className,
  duration = 2,
  spread = 2,
}) => {
  return (
    <motion.div
      className={cn(
        "relative inline-block overflow-hidden",
        className
      )}
      style={{
        background: `linear-gradient(
          110deg,
          transparent 25%,
          rgba(156, 64, 255, 0.8) 50%,
          rgba(255, 170, 64, 0.8) 52%,
          transparent 75%
        )`,
        backgroundSize: `${spread * 100}% 100%`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
      }}
      animate={{
        backgroundPosition: ['-200% 0%', '200% 0%'],
      }}
      transition={{
        duration: duration,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      <span className="relative z-10">
        {children}
      </span>
      
      {/* Fallback text for browsers that don't support background-clip: text */}
      <span 
        className="absolute inset-0 z-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent"
        aria-hidden="true"
      >
        {children}
      </span>
    </motion.div>
  )
}