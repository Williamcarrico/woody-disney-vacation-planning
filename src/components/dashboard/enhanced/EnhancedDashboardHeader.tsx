'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles, Star, Crown, MapPin, Calendar, Wand2 } from 'lucide-react'

interface EnhancedDashboardHeaderProps {
    userId: string
    userEmail: string
    userName: string
    currentVacation?: {
        id: string
        name: string
        startDate: string
        endDate: string
        resort?: string
        daysUntilTrip?: number
        magicalLevel?: 'standard' | 'premium' | 'deluxe' | 'grand'
    } | null
    personalizedRecommendations?: {
        suggestedPark: string
        recommendedTime: string
        magicalTip: string
        weatherBasedSuggestion: string
    }
}

export default function EnhancedDashboardHeader({
    userId,
    userEmail,
    userName,
    currentVacation,
    personalizedRecommendations
}: EnhancedDashboardHeaderProps) {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [showMagicalTip, setShowMagicalTip] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        // Show magical tip after 3 seconds
        const tipTimer = setTimeout(() => setShowMagicalTip(true), 3000)
        return () => clearTimeout(tipTimer)
    }, [])

    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 17) return "Good Afternoon"
        return "Good Evening"
    }

    const getMagicalLevelIcon = (level?: string) => {
        switch (level) {
            case 'grand': return <Crown className="w-6 h-6 text-yellow-400" />
            case 'deluxe': return <Star className="w-6 h-6 text-purple-400" />
            case 'premium': return <Sparkles className="w-6 h-6 text-blue-400" />
            default: return <Wand2 className="w-6 h-6 text-pink-400" />
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className="relative overflow-hidden">
            {/* Magical Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-pink-900/90 backdrop-blur-sm" />
            
            {/* Animated Sparkles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Welcome Section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-4"
                        >
                            {/* Greeting */}
                            <div className="flex items-center space-x-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="w-8 h-8 text-yellow-400" />
                                </motion.div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400">
                                        {getGreeting()}, {userName}!
                                    </span>
                                </h1>
                            </div>

                            {/* Current Time & Date */}
                            <div className="flex items-center space-x-6 text-white/90">
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                    <span className="text-lg font-medium">{formatTime(currentTime)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-pink-400" />
                                    <span className="text-lg">{formatDate(currentTime)}</span>
                                </div>
                            </div>

                            {/* Vacation Info */}
                            {currentVacation && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {getMagicalLevelIcon(currentVacation.magicalLevel)}
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    {currentVacation.name}
                                                </h3>
                                                {currentVacation.resort && (
                                                    <div className="flex items-center space-x-2 text-white/80">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{currentVacation.resort}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {currentVacation.daysUntilTrip !== undefined && currentVacation.daysUntilTrip > 0 && (
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-yellow-400">
                                                    {currentVacation.daysUntilTrip}
                                                </div>
                                                <div className="text-sm text-white/80">
                                                    {currentVacation.daysUntilTrip === 1 ? 'day' : 'days'} to go!
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Magical Tip Section */}
                    <div className="lg:col-span-1">
                        <AnimatePresence>
                            {showMagicalTip && personalizedRecommendations && (
                                <motion.div
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                    transition={{ duration: 0.6 }}
                                    className="bg-gradient-to-br from-yellow-400/20 to-pink-400/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30"
                                >
                                    <div className="flex items-start space-x-3">
                                        <motion.div
                                            animate={{ 
                                                rotate: [0, 10, -10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{ 
                                                duration: 2, 
                                                repeat: Infinity,
                                                repeatDelay: 3
                                            }}
                                        >
                                            <Wand2 className="w-6 h-6 text-yellow-400 mt-1" />
                                        </motion.div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-2">
                                                ✨ Magical Tip
                                            </h4>
                                            <p className="text-white/90 text-sm leading-relaxed">
                                                {personalizedRecommendations.magicalTip}
                                            </p>
                                            <div className="mt-3 pt-3 border-t border-white/20">
                                                <p className="text-xs text-white/80">
                                                    Recommended: Visit <span className="font-medium text-yellow-400">
                                                        {personalizedRecommendations.suggestedPark}
                                                    </span> at <span className="font-medium text-pink-400">
                                                        {personalizedRecommendations.recommendedTime}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Bottom Magical Border */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400"
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}
            />
        </div>
    )
} 