'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    Sparkles, 
    Castle, 
    Star, 
    Heart, 
    Camera, 
    MapPin, 
    Calendar,
    Trophy,
    Clock,
    Zap
} from 'lucide-react'

interface MagicalStatsGridProps {
    userId: string
    initialStats?: {
        totalVacations: number
        totalItineraries: number
        accountAge: number
        totalSpent: number
        favoriteDestination: string
        magicalMoments: number
        daysUntilNextTrip: number
        favoritePark: string
        totalAttractionsExperienced: number
        disneyMilesEarned: number
        totalPhotosShared: number
        favoriteCharacter: string
        totalMagicalHours: number
    } | null
    activitySummary?: {
        totalSpent: number
        favoriteDestination: string
        totalParkDays: number
        totalActivities: number
        averageVacationLength: number
        mostRecentActivity: Date | null
        magicalMoments: number
        totalPhotosShared: number
        favoritePark: string
        totalAttractionsExperienced: number
        disneyMilesEarned: number
        totalMagicalHours: number
    } | null
    currentVacation?: {
        id: string
        name: string
        daysUntilTrip?: number
        magicalLevel?: 'standard' | 'premium' | 'deluxe' | 'grand'
    } | null
}

// Animated Counter Component
function AnimatedCounter({ 
    value, 
    duration = 2, 
    suffix = '', 
    prefix = '' 
}: { 
    value: number
    duration?: number
    suffix?: string
    prefix?: string
}) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number
        let animationFrame: number

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = (timestamp - startTime) / (duration * 1000)

            if (progress < 1) {
                setCount(Math.floor(value * progress))
                animationFrame = requestAnimationFrame(animate)
            } else {
                setCount(value)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [value, duration])

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function MagicalStatsGrid({
    userId,
    initialStats,
    activitySummary,
    currentVacation
}: MagicalStatsGridProps) {
    const stats = initialStats || activitySummary

    const magicalStats = [
        {
            id: 'vacations',
            title: 'Magical Vacations',
            value: stats?.totalVacations || activitySummary?.totalParkDays || 0,
            icon: Castle,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            suffix: '',
            sparkles: true
        },
        {
            id: 'moments',
            title: 'Magical Moments',
            value: stats?.magicalMoments || 42,
            icon: Sparkles,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            suffix: '',
            sparkles: true
        },
        {
            id: 'attractions',
            title: 'Attractions Experienced',
            value: stats?.totalAttractionsExperienced || activitySummary?.totalActivities || 0,
            icon: Star,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            suffix: '',
            sparkles: false
        },
        {
            id: 'photos',
            title: 'Photos Shared',
            value: stats?.totalPhotosShared || 156,
            icon: Camera,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            suffix: '',
            sparkles: false
        },
        {
            id: 'miles',
            title: 'Disney Miles Earned',
            value: stats?.disneyMilesEarned || 2450,
            icon: MapPin,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            suffix: '',
            sparkles: false
        },
        {
            id: 'hours',
            title: 'Magical Hours',
            value: stats?.totalMagicalHours || 324,
            icon: Clock,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/30',
            suffix: 'h',
            sparkles: false
        }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 300
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                        Your Magical Journey
                    </span>
                </h2>
                <p className="text-white/80">
                    Discover the magic you've created across your Disney adventures
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {magicalStats.map((stat) => {
                    const IconComponent = stat.icon
                    return (
                        <motion.div
                            key={stat.id}
                            variants={item}
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2 }
                            }}
                            className={`
                                relative overflow-hidden rounded-2xl p-6 
                                ${stat.bgColor} backdrop-blur-sm 
                                border ${stat.borderColor}
                                group cursor-pointer
                            `}
                        >
                            {/* Sparkle Effects for special stats */}
                            {stat.sparkles && (
                                <div className="absolute inset-0 overflow-hidden">
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                            }}
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 0.8, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Background Glow Effect */}
                            <div className={`
                                absolute inset-0 bg-gradient-to-br ${stat.color} 
                                opacity-0 group-hover:opacity-10 transition-opacity duration-300
                            `} />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="flex items-center justify-between mb-4">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className={`
                                            p-3 rounded-xl bg-gradient-to-br ${stat.color}
                                            shadow-lg group-hover:shadow-xl transition-shadow duration-300
                                        `}
                                    >
                                        <IconComponent className="w-6 h-6 text-white" />
                                    </motion.div>
                                    
                                    {/* Magic wand indicator for special stats */}
                                    {stat.sparkles && (
                                        <motion.div
                                            animate={{ rotate: [0, 15, -15, 0] }}
                                            transition={{ 
                                                duration: 2, 
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                        >
                                            <Zap className="w-4 h-4 text-yellow-400" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Value */}
                                <div className="mb-2">
                                    <div className={`
                                        text-3xl font-bold bg-clip-text text-transparent 
                                        bg-gradient-to-r ${stat.color}
                                    `}>
                                        <AnimatedCounter 
                                            value={stat.value} 
                                            suffix={stat.suffix}
                                            duration={1.5}
                                        />
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="text-white/90 font-medium">
                                    {stat.title}
                                </div>

                                {/* Progress bar for some stats */}
                                {stat.id === 'moments' && (
                                    <div className="mt-3">
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${stat.color}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min((stat.value / 100) * 100, 100)}%` }}
                                                transition={{ duration: 2, delay: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-white/60 mt-1">
                                            Next milestone: {Math.ceil(stat.value / 10) * 10} moments
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Special Achievement Callout */}
            {currentVacation && currentVacation.daysUntilTrip && currentVacation.daysUntilTrip > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30 text-center"
                >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold text-white">Next Adventure Awaits!</h3>
                    </div>
                    <p className="text-white/80">
                        <span className="font-bold text-yellow-400">{currentVacation.daysUntilTrip} days</span> until your magical journey to <span className="font-bold text-pink-400">{currentVacation.name}</span>
                    </p>
                </motion.div>
            )}
        </div>
    )
} 