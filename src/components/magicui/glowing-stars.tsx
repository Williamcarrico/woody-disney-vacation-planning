'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowingStarsProps {
  className?: string
  starCount?: number
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  color: string
}

export const GlowingStars: React.FC<GlowingStarsProps> = ({ 
  className,
  starCount = 50 
}) => {
  const [stars, setStars] = useState<Star[]>([])
  const [mounted, setMounted] = useState(false)

  const colors = [
    '#9c40ff', // purple
    '#ffaa40', // orange
    '#ff69b4', // pink
    '#00d4ff', // cyan
    '#ffd700', // gold
    '#ffffff', // white
  ]

  useEffect(() => {
    setMounted(true)
    const generateStars = () => {
      const newStars: Star[] = []
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          delay: Math.random() * 5,
          duration: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [starCount])

  if (!mounted) return null

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Main stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: star.color,
            filter: 'blur(0.5px)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0.7, 1, 0],
            scale: [0, 1, 1.2, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Twinkling effect overlay */}
      {stars.map((star) => (
        <motion.div
          key={`glow-${star.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 3}px`,
            height: `${star.size * 3}px`,
            background: `radial-gradient(circle, ${star.color}40 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: star.duration * 1.5,
            delay: star.delay + 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Shooting stars */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute h-0.5 w-20 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
            left: '-100px',
            top: `${Math.random() * 50 + 10}%`,
          }}
          animate={{
            x: ['0vw', '120vw'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 8 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Constellation lines */}
      <svg className="absolute inset-0 h-full w-full opacity-30">
        {stars.slice(0, 15).map((star, index) => {
          const nextStar = stars[index + 1]
          if (!nextStar) return null
          
          return (
            <motion.line
              key={`line-${index}`}
              x1={`${star.x}%`}
              y1={`${star.y}%`}
              x2={`${nextStar.x}%`}
              y2={`${nextStar.y}%`}
              stroke="url(#starGradient)"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 4,
                delay: index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )
        })}
        
        <defs>
          <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9c40ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#9c40ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffaa40" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Nebula effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(156, 64, 255, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 170, 64, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 105, 180, 0.2) 0%, transparent 50%)
          `,
        }}
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}