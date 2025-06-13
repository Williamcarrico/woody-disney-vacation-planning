'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OrbitingCirclesProps {
  className?: string
  children?: React.ReactNode
  reverse?: boolean
  duration?: number
  delay?: number
  radius?: number
  path?: boolean
}

export const OrbitingCircles: React.FC<OrbitingCirclesProps> = ({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true,
}) => {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <circle
            className="stroke-black/10 stroke-1 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      )}

      <motion.div
        className={cn(
          "absolute flex h-full w-full transform-gpu items-center justify-center",
          className
        )}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          rotate: reverse ? -360 : 360,
        }}
        transition={{
          duration: duration,
          ease: "linear",
          repeat: Infinity,
          delay: delay,
        }}
      >
        <motion.div
          className="flex h-full w-full items-center justify-center"
          style={{
            transform: `translate(${radius}px, 0px)`,
          }}
          animate={{
            rotate: reverse ? 360 : -360,
          }}
          transition={{
            duration: duration,
            ease: "linear",
            repeat: Infinity,
            delay: delay,
          }}
        >
          <div className="relative flex h-fit w-fit items-center justify-center rounded-full border bg-black/10 backdrop-blur-md dark:bg-white/10">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}