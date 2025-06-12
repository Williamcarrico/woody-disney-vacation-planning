'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, Star, Rocket, Eye, Cpu } from 'lucide-react'

interface HolographicDisplayProps {
    theme: 'day' | 'night'
    className?: string
}

interface HoloData {
    id: string
    icon: React.ReactNode
    title: string
    value: string
    trend: 'up' | 'down' | 'stable'
    color: string
}

export default function HolographicDisplay({ theme, className = '' }: HolographicDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isScanning, setIsScanning] = useState(false)

    const holoData: HoloData[] = [
        {
            id: 'ai-insights',
            icon: <Brain className="w-6 h-6" />,
            title: 'AI Insights',
            value: '98.7%',
            trend: 'up',
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'neural-activity',
            icon: <Zap className="w-6 h-6" />,
            title: 'Neural Activity',
            value: '2.4M ops/s',
            trend: 'up',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'user-satisfaction',
            icon: <Star className="w-6 h-6" />,
            title: 'User Satisfaction',
            value: '4.9/5',
            trend: 'stable',
            color: 'from-yellow-500 to-orange-500'
        },
        {
            id: 'performance',
            icon: <Rocket className="w-6 h-6" />,
            title: 'Performance',
            value: '99.9%',
            trend: 'up',
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 'vision-processing',
            icon: <Eye className="w-6 h-6" />,
            title: 'Vision Processing',
            value: '1.2TB/s',
            trend: 'up',
            color: 'from-indigo-500 to-purple-500'
        },
        {
            id: 'quantum-compute',
            icon: <Cpu className="w-6 h-6" />,
            title: 'Quantum Compute',
            value: '847 qubits',
            trend: 'up',
            color: 'from-pink-500 to-red-500'
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % holoData.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [holoData.length])

    useEffect(() => {
        const scanInterval = setInterval(() => {
            setIsScanning(true)
            setTimeout(() => setIsScanning(false), 1000)
        }, 8000)

        return () => clearInterval(scanInterval)
    }, [])

    const currentData = holoData[currentIndex]

    return (
        <motion.div
            className={`relative overflow-hidden rounded-2xl border ${className} ${theme === 'night'
                ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                : 'bg-gradient-to-br from-blue-50/50 to-purple-50/30 border-blue-300/30'
                }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
        >
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 opacity-20">
                <div className={`w-full h-full ${theme === 'night'
                    ? 'bg-purple-500/10 [background-image:linear-gradient(#8b5cf640_1px,transparent_1px),linear-gradient(90deg,#8b5cf640_1px,transparent_1px)] [background-size:20px_20px]'
                    : 'bg-blue-500/10 [background-image:linear-gradient(#3b82f640_1px,transparent_1px),linear-gradient(90deg,#3b82f640_1px,transparent_1px)] [background-size:20px_20px]'
                    }`} />
            </div>

            {/* Scanning Line */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        className={`absolute inset-x-0 h-0.5 ${theme === 'night'
                            ? 'bg-cyan-400 [box-shadow:0_0_20px_#22d3ee]'
                            : 'bg-blue-500 [box-shadow:0_0_20px_#3b82f6]'
                            } shadow-lg`}
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: '100%', opacity: [0, 1, 1, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="relative z-10 p-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className={`text-sm font-medium ${theme === 'night' ? 'text-cyan-300' : 'text-blue-600'
                        }`}>
                        HOLOGRAPHIC DISPLAY
                    </h3>
                    <div className="flex space-x-1">
                        {holoData.map((_, index) => (
                            <motion.div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full ${index === currentIndex
                                    ? (theme === 'night' ? 'bg-cyan-400' : 'bg-blue-500')
                                    : (theme === 'night' ? 'bg-gray-600' : 'bg-gray-300')
                                    }`}
                                animate={{
                                    scale: index === currentIndex ? 1.2 : 1,
                                    opacity: index === currentIndex ? 1 : 0.5
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Data Display */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentData.id}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        {/* Icon */}
                        <motion.div
                            className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${currentData.color} text-white mb-4 shadow-lg ${theme === 'night'
                                ? '[box-shadow:0_10px_30px_rgba(139,92,246,0.3)]'
                                : '[box-shadow:0_10px_30px_rgba(59,130,246,0.3)]'
                                }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                            {currentData.icon}
                        </motion.div>

                        {/* Title */}
                        <h4 className={`text-lg font-semibold mb-2 ${theme === 'night' ? 'text-white' : 'text-gray-900'
                            }`}>
                            {currentData.title}
                        </h4>

                        {/* Value */}
                        <motion.div
                            className={`text-3xl font-bold mb-2 bg-gradient-to-r ${currentData.color} bg-clip-text text-transparent`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {currentData.value}
                        </motion.div>

                        {/* Trend Indicator */}
                        <motion.div
                            className="flex items-center justify-center space-x-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className={`w-2 h-2 rounded-full ${currentData.trend === 'up' ? 'bg-green-500' :
                                currentData.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                                } animate-pulse`} />
                            <span className={`text-xs ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {currentData.trend === 'up' ? 'Trending Up' :
                                    currentData.trend === 'down' ? 'Trending Down' : 'Stable'}
                            </span>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Holographic Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner Brackets */}
                    {[
                        'top-2 left-2',
                        'top-2 right-2',
                        'bottom-2 left-2',
                        'bottom-2 right-2'
                    ].map((position, index) => (
                        <motion.div
                            key={index}
                            className={`absolute ${position} w-4 h-4 border-2 ${theme === 'night' ? 'border-cyan-400' : 'border-blue-500'
                                } [border-width:2px_0_0_2px] [transform:rotate(${index * 90}deg)]`}
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.2
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Ambient Glow */}
            <div className={`absolute inset-0 rounded-2xl ${theme === 'night'
                ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)]'
                : 'shadow-[0_0_50px_rgba(59,130,246,0.2)]'
                } pointer-events-none`} />
        </motion.div>
    )
}