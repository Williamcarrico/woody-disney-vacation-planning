'use client'

import { motion } from 'framer-motion'
import { 
    Calendar, 
    MapPin, 
    Camera, 
    Star, 
    Ticket, 
    Clock, 
    Users, 
    Heart,
    Sparkles,
    Wand2
} from 'lucide-react'

interface DisneyQuickActionsProps {
    userId: string
    hasActiveVacation: boolean
    vacationId?: string
    userStats?: {
        totalVacations: number
        magicalMoments: number
        favoritePark: string
    } | null
}

export default function DisneyQuickActions({
    userId,
    hasActiveVacation,
    vacationId,
    userStats
}: DisneyQuickActionsProps) {
    const quickActions = [
        {
            id: 'plan-trip',
            title: 'Plan New Trip',
            description: 'Start your magical journey',
            icon: Calendar,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            sparkles: true,
            href: '/dashboard/vacation/new'
        },
        {
            id: 'view-parks',
            title: 'Explore Parks',
            description: 'Discover magical places',
            icon: MapPin,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            sparkles: false,
            href: '/dashboard/parks'
        },
        {
            id: 'reservations',
            title: 'Dining & FastPass',
            description: 'Book magical experiences',
            icon: Ticket,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/30',
            sparkles: true,
            href: '/dashboard/reservations'
        },
        {
            id: 'itinerary',
            title: 'My Itinerary',
            description: 'View your daily plans',
            icon: Clock,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/30',
            sparkles: false,
            href: hasActiveVacation ? `/dashboard/vacation/${vacationId}/itinerary` : '/dashboard/vacation/new'
        },
        {
            id: 'photos',
            title: 'PhotoPass',
            description: 'Capture the magic',
            icon: Camera,
            color: 'from-pink-500 to-rose-500',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/30',
            sparkles: false,
            href: '/dashboard/photos'
        },
        {
            id: 'party',
            title: 'My Party',
            description: 'Manage your group',
            icon: Users,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/30',
            sparkles: false,
            href: '/dashboard/party'
        },
        {
            id: 'favorites',
            title: 'Favorites',
            description: 'Your magical wishlist',
            icon: Heart,
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/30',
            sparkles: true,
            href: '/dashboard/favorites'
        },
        {
            id: 'achievements',
            title: 'Achievements',
            description: 'Unlock magical rewards',
            icon: Star,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            sparkles: true,
            href: '/dashboard/achievements'
        }
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
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
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Wand2 className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                            Quick Magical Actions
                        </span>
                    </h2>
                </div>
                <p className="text-white/80">
                    Take the next step in your Disney adventure
                </p>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {quickActions.map((action) => {
                    const IconComponent = action.icon
                    return (
                        <motion.a
                            key={action.id}
                            href={action.href}
                            variants={item}
                            whileHover={{ 
                                scale: 1.05,
                                y: -5,
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                relative overflow-hidden rounded-xl p-4 
                                ${action.bgColor} backdrop-blur-sm 
                                border ${action.borderColor}
                                group cursor-pointer text-center
                            `}
                        >
                            {/* Sparkle Effects for special actions */}
                            {action.sparkles && (
                                <div className="absolute inset-0 overflow-hidden">
                                    {[...Array(5)].map((_, i) => (
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
                                absolute inset-0 bg-gradient-to-br ${action.color} 
                                opacity-0 group-hover:opacity-10 transition-opacity duration-300
                            `} />

                            <div className="relative z-10">
                                {/* Icon */}
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                    className={`
                                        w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${action.color}
                                        shadow-lg group-hover:shadow-xl transition-shadow duration-300
                                        flex items-center justify-center
                                    `}
                                >
                                    <IconComponent className="w-6 h-6 text-white" />
                                </motion.div>

                                {/* Title */}
                                <div className="text-white font-medium text-sm mb-1">
                                    {action.title}
                                </div>

                                {/* Description */}
                                <div className="text-white/70 text-xs">
                                    {action.description}
                                </div>

                                {/* Special indicators */}
                                {action.sparkles && (
                                    <motion.div
                                        className="absolute top-2 right-2"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ 
                                            duration: 2, 
                                            repeat: Infinity,
                                            repeatDelay: 3
                                        }}
                                    >
                                        <Sparkles className="w-3 h-3 text-yellow-400" />
                                    </motion.div>
                                )}

                                {/* Active vacation indicator */}
                                {action.id === 'itinerary' && hasActiveVacation && (
                                    <div className="absolute top-2 left-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </motion.a>
                    )
                })}
            </motion.div>

            {/* Special Status Messages */}
            {hasActiveVacation && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 text-center"
                >
                    <div className="flex items-center justify-center space-x-2 mb-1">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="w-4 h-4 text-green-400" />
                        </motion.div>
                        <span className="text-white font-medium">Active Vacation Mode</span>
                    </div>
                    <p className="text-white/80 text-sm">
                        Your magical adventure is in progress! Access all vacation features above.
                    </p>
                </motion.div>
            )}

            {/* User Achievement Highlight */}
            {userStats && userStats.magicalMoments > 50 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 text-center"
                >
                    <div className="flex items-center justify-center space-x-2 mb-1">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <Star className="w-4 h-4 text-yellow-400" />
                        </motion.div>
                        <span className="text-white font-medium">Magic Master!</span>
                    </div>
                    <p className="text-white/80 text-sm">
                        You've unlocked special features with {userStats.magicalMoments} magical moments!
                    </p>
                </motion.div>
            )}
        </div>
    )
} 