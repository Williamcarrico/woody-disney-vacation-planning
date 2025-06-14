'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TracingBeamProps {
  children: React.ReactNode
  className?: string
}

export const TracingBeam: React.FC<TracingBeamProps> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"]
  })

  const [svgHeight, setSvgHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      setSvgHeight(ref.current.offsetHeight)
    }
  }, [children])

  const y1 = useTransform(scrollYProgress, [0, 0.8], [50, svgHeight])
  const y2 = useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200])
  const y3 = useTransform(scrollYProgress, [0, 1], [100, svgHeight - 100])

  // Convert MotionValue to number for SVG attributes
  const [y1Value, setY1Value] = useState(50)
  const [y2Value, setY2Value] = useState(50)
  const [y3Value, setY3Value] = useState(100)

  useEffect(() => {
    const unsubscribeY1 = y1.onChange(setY1Value)
    const unsubscribeY2 = y2.onChange(setY2Value)
    const unsubscribeY3 = y3.onChange(setY3Value)

    return () => {
      unsubscribeY1()
      unsubscribeY2()
      unsubscribeY3()
    }
  }, [y1, y2, y3])

  // Don't render SVG until we have valid dimensions
  const shouldRenderSvg = svgHeight > 0

  return (
    <motion.div ref={ref} className={cn("relative w-full max-w-4xl mx-auto h-full", className)}>
      <div className="absolute -left-4 md:-left-20 top-3">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow:
              scrollYProgress.get() > 0
                ? "none"
                : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          className="ml-[27px] h-4 w-4 rounded-full border border-neutral-200 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor: scrollYProgress.get() > 0 ? "#9c40ff" : "#ffffff",
              borderColor: scrollYProgress.get() > 0 ? "#9c40ff" : "#ffffff",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        {shouldRenderSvg && (
          <svg
            viewBox={`0 0 20 ${svgHeight}`}
            width="20"
            height={svgHeight}
            className=" ml-4 block"
            aria-hidden="true"
          >
            <motion.path
              d={`m 1 0 v -36 c 0,12 20,12 20,24 v 18 c 0,12 -20,12 -20,24 v ${svgHeight - 104} c 0,12 20,12 20,24 v 18 c 0,12 -20,12 -20,24 v 36`}
              fill="none"
              stroke="#9ca3af"
              strokeOpacity="0.16"
              transition={{
                duration: 10,
              }}
            ></motion.path>
            <motion.path
              d={`m 1 0 v -36 c 0,12 20,12 20,24 v 18 c 0,12 -20,12 -20,24 v ${svgHeight - 104} c 0,12 20,12 20,24 v 18 c 0,12 -20,12 -20,24 v 36`}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="1.25"
              className="motion-reduce:hidden"
              transition={{
                duration: 10,
              }}
              strokeDasharray="1 20"
              strokeLinecap="round"
              animate={{
                strokeDashoffset: [0, -40],
              }}
            ></motion.path>
            
            <defs>
              <linearGradient id="gradient" gradientUnits="userSpaceOnUse" x1="0" y1={y1Value} x2="0" y2={y2Value}>
                <stop stopColor="#9c40ff" stopOpacity="0"></stop>
                <stop stopColor="#9c40ff"></stop>
                <stop offset="0.325" stopColor="#ff69b4"></stop>
                <stop offset="1" stopColor="#ffaa40" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            
            {/* Glowing particles along the path */}
            <motion.circle
              r="2"
              fill="#9c40ff"
              cx="10"
              cy={y1Value}
              className="drop-shadow-lg"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="2s"
                repeatCount="indefinite"
              />
            </motion.circle>
            
            <motion.circle
              r="1.5"
              fill="#ff69b4"
              cx="10"
              cy={y3Value}
              className="drop-shadow-lg"
            >
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur="3s"
                repeatCount="indefinite"
                begin="1s"
              />
            </motion.circle>
          </svg>
        )}
      </div>
      <motion.div className="relative z-20">
        {children}
      </motion.div>
    </motion.div>
  )
}