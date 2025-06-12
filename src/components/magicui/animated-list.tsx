'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedListProps {
    children: ReactNode
    className?: string
    delay?: number
    duration?: number
}

export function AnimatedList({
    children,
    className,
    delay = 0.1,
    duration = 0.5
}: AnimatedListProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <AnimatePresence>
                {Array.isArray(children) ? (
                    children.map((child, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{
                                duration,
                                delay: index * delay,
                                ease: 'easeOut'
                            }}
                        >
                            {child}
                        </motion.div>
                    ))
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                            duration,
                            delay,
                            ease: 'easeOut'
                        }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}