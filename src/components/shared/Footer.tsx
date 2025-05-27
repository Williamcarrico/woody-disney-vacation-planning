'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
    Calendar, Sparkles, Heart, Shield, Globe,
    ChevronRight, Wand2, Castle,
    Sun, Moon, Users,
    Map, Camera, Ticket, Hotel
} from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { APP_NAME, APP_FULL_NAME } from '@/lib/utils/constants'

// Lazy load heavy components
const ParticleField = dynamic(() => import('./footer/ParticleField'), { ssr: false })
const InteractiveGlobe = dynamic(() => import('./footer/InteractiveGlobe'), { ssr: false })

// Types
interface UserPreferences {
    favoriteParks: string[]
    plannedVisitSeason: 'summer' | 'winter' | 'spring' | 'fall'
    groupType: 'family' | 'couple' | 'solo' | 'friends'
    interests: string[]
}

interface NavigationLink {
    name: string
    href: string
    hot?: boolean
    new?: boolean
    ai?: boolean
    live?: boolean
    save?: boolean
}

interface NavigationSection {
    title: string
    icon: React.ReactNode
    priority: number
    links: NavigationLink[]
}

// AI-powered personalization hook
const usePersonalizedContent = () => {
    const [userPreferences] = useState<UserPreferences>({
        favoriteParks: ['Magic Kingdom'],
        plannedVisitSeason: 'summer',
        groupType: 'family',
        interests: ['attractions', 'dining']
    })

    // Simulated AI recommendations based on user behavior
    const getRecommendations = useCallback((): string[] => {
        const recommendations: Record<string, string[]> = {
            summer: ['Beat the Heat Tips', 'Water Park Guide', 'Early Morning Strategies'],
            winter: ['Holiday Events', 'Festival of Lights', 'Special Dining'],
            spring: ['Flower Festival Guide', 'Spring Break Tips', 'Easter Events'],
            fall: ['Halloween Events', 'Food & Wine Festival', 'Cooler Weather Tips']
        }

        const seasonal = recommendations[userPreferences.plannedVisitSeason] || []
        const groupRecs = userPreferences.groupType === 'family'
            ? ['Kid-Friendly Attractions', 'Character Dining', 'Stroller Tips']
            : ['Romantic Dining', 'Adult Experiences', 'Special Tours']

        return [...seasonal.slice(0, 2), ...groupRecs.slice(0, 1)]
    }, [userPreferences])

    return { userPreferences, recommendations: getRecommendations() }
}

// 3D floating element component
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 150 }
    const x = useSpring(mouseX, springConfig)
    const y = useSpring(mouseY, springConfig)

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        mouseX.set((e.clientX - centerX) * 0.1)
        mouseY.set((e.clientY - centerY) * 0.1)
    }

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
                mouseX.set(0)
                mouseY.set(0)
            }}
            style={{ x, y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.8, type: "spring" }}
        >
            {children}
        </motion.div>
    )
}

export default function Footer() {
    const footerRef = useRef<HTMLDivElement>(null)
    const [theme, setTheme] = useState<'day' | 'night'>('day')
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
    const { scrollYProgress } = useScroll({
        target: footerRef,
        offset: ["start end", "end end"]
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])
    const { userPreferences, recommendations } = usePersonalizedContent()

    // Dynamic theme based on time
    useEffect(() => {
        const hour = new Date().getHours()
        setTheme(hour >= 6 && hour < 18 ? 'day' : 'night')
    }, [])

    // Interactive navigation sections with AI-powered ordering
    const navigationSections: NavigationSection[] = [
        {
            title: 'Explore Parks',
            icon: <Castle className="w-5 h-5" />,
            priority: userPreferences.interests.includes('attractions') ? 1 : 2,
            links: [
                { name: 'Magic Kingdom', href: '/parks/magic-kingdom', hot: true },
                { name: 'EPCOT', href: '/parks/epcot' },
                { name: 'Hollywood Studios', href: '/parks/hollywood-studios' },
                { name: 'Animal Kingdom', href: '/parks/animal-kingdom' },
                { name: 'Park Hours', href: '/parks/hours', new: true }
            ]
        },
        {
            title: 'Plan Your Visit',
            icon: <Calendar className="w-5 h-5" />,
            priority: 0,
            links: [
                { name: 'Trip Planner AI', href: '/dashboard/planning', ai: true },
                { name: 'Crowd Calendar', href: '/dashboard/crowds' },
                { name: 'Weather Forecast', href: '/weather', live: true },
                { name: 'Packing Lists', href: '/planning/packing' },
                { name: 'Transportation', href: '/planning/transport' }
            ]
        },
        {
            title: 'Experiences',
            icon: <Sparkles className="w-5 h-5" />,
            priority: userPreferences.interests.includes('dining') ? 0 : 3,
            links: [
                { name: 'Dining Reservations', href: '/dining', hot: true },
                { name: 'Lightning Lanes', href: '/dashboard/genie' },
                { name: 'Special Events', href: '/events' },
                { name: 'PhotoPass', href: '/photos' },
                { name: 'Tours & Extras', href: '/experiences/tours' }
            ]
        },
        {
            title: 'Stay & Save',
            icon: <Hotel className="w-5 h-5" />,
            priority: 4,
            links: [
                { name: 'Resort Hotels', href: '/dashboard/resorts' },
                { name: 'Vacation Packages', href: '/packages', save: true },
                { name: 'Annual Passes', href: '/annual-passes' },
                { name: 'Special Offers', href: '/offers', hot: true },
                { name: 'Disney Springs', href: '/dashboard/disneysprings' }
            ]
        }
    ].sort((a, b) => a.priority - b.priority)

    return (
        <motion.footer
            ref={footerRef}
            style={{ opacity }}
            className={`relative overflow-hidden ${theme === 'night'
                ? 'bg-gradient-to-b from-slate-900 via-purple-950/20 to-black'
                : 'bg-gradient-to-b from-blue-50 via-purple-50/30 to-white'
                } transition-colors duration-1000`}
        >
            {/* Animated particle background */}
            <div className="absolute inset-0 pointer-events-none">
                <ParticleField theme={theme} />
            </div>

            {/* Gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className={`absolute -top-40 -left-40 w-80 h-80 rounded-full blur-3xl ${theme === 'night' ? 'bg-gradient-orb-night-1' : 'bg-gradient-orb-day-1'
                        }`}
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl ${theme === 'night' ? 'bg-gradient-orb-night-2' : 'bg-gradient-orb-day-2'
                        }`}
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 1.3, 1]
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 5
                    }}
                />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-16">
                {/* AI Recommendations Bar */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 p-6 rounded-2xl backdrop-blur-lg bg-white/10 dark:bg-black/10 border border-white/20"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                            <Wand2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className={`text-lg font-semibold ${theme === 'night' ? 'text-white' : 'text-gray-900'
                            }`}>
                            AI-Powered Recommendations for You
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {recommendations.map((rec: string, index: number) => (
                            <motion.button
                                key={rec}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/30 text-sm hover:border-white/60 transition-all"
                            >
                                {rec}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Brand section with 3D logo */}
                    <motion.div
                        className="lg:col-span-4"
                        style={{ scale }}
                    >
                        <FloatingElement>
                            <Link href="/" className="inline-block group">
                                <div className="relative">
                                    {/* 3D Logo Container */}
                                    <motion.div
                                        className="relative w-24 h-24 mb-6 preserve-3d"
                                        whileHover={{ rotateY: 180 }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        {/* Front face */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center backface-hidden">
                                            <Castle className="w-12 h-12 text-white" />
                                        </div>
                                        {/* Back face */}
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 shadow-2xl flex items-center justify-center backface-hidden rotate-y-180">
                                            <Sparkles className="w-12 h-12 text-white" />
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        className={`text-3xl font-bold mb-3 ${theme === 'night' ? 'text-white' : 'text-gray-900'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {APP_NAME}
                                    </motion.h2>
                                </div>
                            </Link>
                        </FloatingElement>

                        <p className={`text-lg mb-6 ${theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            Your AI-powered Disney vacation planner. Create magical memories with personalized itineraries and real-time insights.
                        </p>

                        {/* Voice Assistant Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md transition-all ${isVoiceEnabled
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 border border-white/30'
                                }`}
                        >
                            <div className="relative">
                                <div className={`w-2 h-2 rounded-full ${isVoiceEnabled ? 'bg-white' : 'bg-gray-400'
                                    }`} />
                                {isVoiceEnabled && (
                                    <motion.div
                                        className="absolute inset-0 w-2 h-2 rounded-full bg-white"
                                        animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                )}
                            </div>
                            <span className="font-medium">
                                {isVoiceEnabled ? 'Voice Assistant Active' : 'Enable Voice Commands'}
                            </span>
                        </motion.button>

                        {/* Interactive Globe */}
                        <div className="mt-8 h-48">
                            <InteractiveGlobe theme={theme} />
                        </div>
                    </motion.div>

                    {/* Dynamic Navigation Grid */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {navigationSections.map((section, sectionIndex) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: sectionIndex * 0.1,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    className="group"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <motion.div
                                            className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm group-hover:from-purple-500 group-hover:to-pink-500 transition-all"
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <div className="text-purple-600 group-hover:text-white transition-colors">
                                                {section.icon}
                                            </div>
                                        </motion.div>
                                        <h3 className={`font-semibold ${theme === 'night' ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {section.title}
                                        </h3>
                                    </div>

                                    <ul className="space-y-2">
                                        {section.links.map((link, linkIndex) => (
                                            <li key={link.name}>
                                                <motion.div
                                                    initial={{ x: -20, opacity: 0 }}
                                                    whileInView={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: linkIndex * 0.05 }}
                                                >
                                                    <Link
                                                        href={link.href}
                                                        className={`group/link flex items-center justify-between py-2 px-3 -mx-3 rounded-lg hover:bg-white/10 transition-all ${theme === 'night' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {link.name}
                                                            {link.hot && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white animate-pulse">
                                                                    HOT
                                                                </span>
                                                            )}
                                                            {link.new && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500 text-white">
                                                                    NEW
                                                                </span>
                                                            )}
                                                            {link.ai && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                                                    AI
                                                                </span>
                                                            )}
                                                            {link.live && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white flex items-center gap-1">
                                                                    <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                                                    LIVE
                                                                </span>
                                                            )}
                                                            {link.save && (
                                                                <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500 text-black">
                                                                    SAVE
                                                                </span>
                                                            )}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                    </Link>
                                                </motion.div>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        {/* Interactive Stats Grid */}
                        <motion.div
                            className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4"
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {[
                                { label: 'Active Users', value: '2.5M+', icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
                                { label: 'Trips Planned', value: '10M+', icon: <Map className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
                                { label: 'Photos Shared', value: '50M+', icon: <Camera className="w-5 h-5" />, color: 'from-orange-500 to-red-500' },
                                { label: 'Money Saved', value: '$100M+', icon: <Ticket className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' }
                            ].map((stat, index) => (
                                <FloatingElement key={stat.label} delay={index * 0.1}>
                                    <motion.div
                                        className="relative p-6 rounded-2xl backdrop-blur-md bg-white/5 border border-white/20 overflow-hidden group"
                                        whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.4)' }}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                        <div className="relative z-10">
                                            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-3`}>
                                                {stat.icon}
                                            </div>
                                            <motion.div
                                                className={`text-2xl font-bold mb-1 ${theme === 'night' ? 'text-white' : 'text-gray-900'}`}
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                transition={{ duration: 1 }}
                                            >
                                                {stat.value}
                                            </motion.div>
                                            <div className={`text-sm ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    </motion.div>
                                </FloatingElement>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    className="mt-16 pt-8 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center gap-6">
                            {[
                                { icon: <Shield className="w-5 h-5" />, text: 'Secure Booking' },
                                { icon: <Heart className="w-5 h-5" />, text: 'Trusted by Millions' },
                                { icon: <Globe className="w-5 h-5" />, text: 'Available Worldwide' }
                            ].map((badge, index) => (
                                <motion.div
                                    key={badge.text}
                                    className="flex items-center gap-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: index * 0.1, type: "spring" }}
                                >
                                    <div className={`p-2 rounded-full ${theme === 'night' ? 'bg-white/10' : 'bg-gray-100'
                                        }`}>
                                        <div className="text-purple-500">
                                            {badge.icon}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium ${theme === 'night' ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {badge.text}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Theme Switcher */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
                            className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {theme === 'day' ? (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Sun className="w-5 h-5 text-yellow-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Moon className="w-5 h-5 text-purple-400" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <span className={theme === 'night' ? 'text-white' : 'text-gray-900'}>
                                {theme === 'day' ? 'Day Mode' : 'Night Mode'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Copyright and Legal */}
                    <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm">
                        <motion.p
                            className={theme === 'night' ? 'text-gray-400' : 'text-gray-600'}
                            whileHover={{ scale: 1.02 }}
                        >
                            © {new Date().getFullYear()} {APP_FULL_NAME}. Creating magic through technology.
                        </motion.p>

                        <div className="flex items-center gap-6">
                            <Link
                                href="/support/privacy"
                                className={`hover:text-purple-500 transition-colors ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/support/terms"
                                className={`hover:text-purple-500 transition-colors ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                            >
                                Terms of Service
                            </Link>
                            <Link
                                href="/support/accessibility"
                                className={`hover:text-purple-500 transition-colors ${theme === 'night' ? 'text-gray-400' : 'text-gray-600'
                                    }`}
                            >
                                Accessibility
                            </Link>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <motion.p
                        className={`mt-6 text-xs text-center ${theme === 'night' ? 'text-gray-500' : 'text-gray-500'
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        transition={{ delay: 1 }}
                    >
                        {APP_FULL_NAME} is an independent service and is not affiliated with, endorsed by, or sponsored by The Walt Disney Company or its affiliates.
                    </motion.p>
                </motion.div>
            </div>

            {/* Decorative bottom wave */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </motion.footer>
    )
}