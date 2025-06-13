'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WavyBackgroundProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  children,
  className,
  containerClassName,
  colors = ["#9c40ff", "#ff69b4", "#ffaa40"],
  waveWidth = 50,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}) => {
  const waveColors = colors ?? ["#9c40ff", "#ff69b4", "#ffaa40"]
  const speedValue = speed === "fast" ? 8 : 15

  return (
    <div
      className={cn(
        "relative h-full w-full bg-slate-950 flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          className="absolute inset-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {waveColors.map((color, index) => (
              <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0" />
                <stop offset="50%" stopColor={color} stopOpacity={waveOpacity} />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            ))}
            <filter id="blur">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          
          {/* Wave 1 */}
          <motion.path
            d="M0,160 Q100,120 200,160 T400,160 L400,400 L0,400 Z"
            fill={`url(#gradient-0)`}
            filter="url(#blur)"
            animate={{
              d: [
                "M0,160 Q100,120 200,160 T400,160 L400,400 L0,400 Z",
                "M0,180 Q100,140 200,180 T400,180 L400,400 L0,400 Z",
                "M0,160 Q100,120 200,160 T400,160 L400,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: speedValue,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Wave 2 */}
          <motion.path
            d="M0,200 Q100,160 200,200 T400,200 L400,400 L0,400 Z"
            fill={`url(#gradient-1)`}
            filter="url(#blur)"
            animate={{
              d: [
                "M0,200 Q100,160 200,200 T400,200 L400,400 L0,400 Z",
                "M0,220 Q100,180 200,220 T400,220 L400,400 L0,400 Z",
                "M0,200 Q100,160 200,200 T400,200 L400,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: speedValue + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Wave 3 */}
          <motion.path
            d="M0,240 Q100,200 200,240 T400,240 L400,400 L0,400 Z"
            fill={`url(#gradient-2)`}
            filter="url(#blur)"
            animate={{
              d: [
                "M0,240 Q100,200 200,240 T400,240 L400,400 L0,400 Z",
                "M0,260 Q100,220 200,260 T400,260 L400,400 L0,400 Z",
                "M0,240 Q100,200 200,240 T400,240 L400,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: speedValue + 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Additional decorative waves */}
          <motion.path
            d="M0,80 Q100,40 200,80 T400,80 L400,400 L0,400 Z"
            fill="url(#gradient-0)"
            opacity="0.3"
            filter="url(#blur)"
            animate={{
              d: [
                "M0,80 Q100,40 200,80 T400,80 L400,400 L0,400 Z",
                "M0,100 Q100,60 200,100 T400,100 L400,400 L0,400 Z",
                "M0,80 Q100,40 200,80 T400,80 L400,400 L0,400 Z"
              ]
            }}
            transition={{
              duration: speedValue - 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </svg>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: waveColors[i % waveColors.length],
                opacity: 0.3,
              }}
              animate={{
                y: [-20, -80, -20],
                x: [0, Math.random() * 40 - 20, 0],
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: Math.random() * 4 + 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
      
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  )
}