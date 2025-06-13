'use client'

import React, { useEffect, useState } from 'react'
import { motion, stagger, useAnimate, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextGenerateEffectProps {
  words: string
  className?: string
  filter?: boolean
  duration?: number
  delay?: number
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({
  words,
  className,
  filter = true,
  duration = 0.5,
  delay = 0
}) => {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
  const wordsArray = words.split(' ')

  useEffect(() => {
    if (isInView) {
      animate(
        'span',
        {
          opacity: 1,
          filter: filter ? 'blur(0px)' : 'none',
        },
        {
          duration: duration,
          delay: stagger(0.1, { startDelay: delay }),
        }
      )
    }
  }, [isInView, animate, duration, delay, filter])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={cn(
                'opacity-0',
                filter && 'blur-sm'
              )}
              style={{
                filter: filter ? 'blur(10px)' : 'none',
              }}
            >
              {word}{' '}
            </motion.span>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div className={cn('font-bold', className)}>
      {renderWords()}
    </div>
  )
}