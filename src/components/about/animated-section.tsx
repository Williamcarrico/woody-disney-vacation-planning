'use client'

import { motion } from 'framer-motion'

interface AnimatedSectionProps {
    children: React.ReactNode
    delay?: number
    className?: string
}

export function AnimatedSection({
    children,
    delay = 0,
    className = ""
}: AnimatedSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: 0.8,
                delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.section>
    )
}