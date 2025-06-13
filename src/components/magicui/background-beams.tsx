'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BackgroundBeamsProps {
  className?: string
}

export const BackgroundBeams: React.FC<BackgroundBeamsProps> = ({ className }) => {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867", 
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
    "M-345 -229C-345 -229 -277 176 187 303C651 430 719 835 719 835"
  ]

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip)">
          <g opacity="0.4">
            {paths.map((path, index) => (
              <motion.path
                key={index}
                d={path}
                stroke={`url(#gradient-${index})`}
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{
                  pathLength: 0,
                  opacity: 0
                }}
                animate={{
                  pathLength: 1,
                  opacity: [0, 1, 0.5, 1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </g>
        </g>
        
        <defs>
          <clipPath id="clip">
            <rect width="100%" height="100%" />
          </clipPath>
          
          {paths.map((_, index) => (
            <linearGradient
              key={index}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#9c40ff" stopOpacity="0" />
              <stop offset="50%" stopColor="#9c40ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffaa40" stopOpacity="0" />
            </linearGradient>
          ))}
          
          {/* Additional animated beams */}
          <radialGradient id="beamGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9c40ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff69b4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffaa40" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Additional light beams */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full opacity-20"
            style={{
              top: `${10 + i * 8}%`,
              background: 'linear-gradient(90deg, transparent, #9c40ff, transparent)',
              transformOrigin: 'left center',
            }}
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-purple-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Ambient glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}