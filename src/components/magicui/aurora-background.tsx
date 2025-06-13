'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AuroraBackgroundProps {
  children?: React.ReactNode
  className?: string
  showRadialGradient?: boolean
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className,
  showRadialGradient = true,
}) => {
  return (
    <div
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none
            absolute -inset-[10px] opacity-50 will-change-transform`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      
      {/* Custom Aurora Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(156, 64, 255, 0.3), transparent),
              radial-gradient(ellipse 60% 80% at 80% 60%, rgba(255, 105, 180, 0.3), transparent),
              radial-gradient(ellipse 90% 70% at 40% 80%, rgba(255, 170, 64, 0.2), transparent)
            `,
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Dancing aurora bands */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(45deg, 
                rgba(156, 64, 255, 0.4) 0%,
                transparent 30%,
                rgba(255, 105, 180, 0.3) 60%,
                transparent 100%
              )
            `,
            transform: 'skewY(-10deg)',
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(-45deg, 
                transparent 0%,
                rgba(255, 170, 64, 0.3) 40%,
                transparent 70%,
                rgba(156, 64, 255, 0.2) 100%
              )
            `,
            transform: 'skewY(10deg)',
          }}
          animate={{
            x: ['100%', '-100%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        {/* Shimmering particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#9c40ff', '#ff69b4', '#ffaa40'][i % 3],
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}