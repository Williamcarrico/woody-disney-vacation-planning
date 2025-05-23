'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface InteractiveCardProps {
    children: ReactNode
    className?: string
}

export function InteractiveCard({ children, className = "" }: InteractiveCardProps) {
    return (
        <motion.div
            className={`
                relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-slate-800/40 to-slate-900/60
                border border-slate-700/50 backdrop-blur-xl
                shadow-2xl shadow-black/20
                ${className}
            `}
            whileHover={{
                scale: 1.02,
                rotateY: 5,
                rotateX: 5,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
            }}
            style={{
                transformStyle: "preserve-3d",
                perspective: 1000,
            }}
        >
            {/* Animated border gradient */}
            <motion.div
                className="absolute inset-0 rounded-3xl opacity-0 bg-gradient-to-r from-violet-500/50 via-fuchsia-500/50 to-cyan-500/50"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '1px' }}
            >
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90" />
            </motion.div>

            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-cyan-500/10 opacity-0 blur-xl"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}