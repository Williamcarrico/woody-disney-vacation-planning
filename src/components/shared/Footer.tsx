'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    Heart, Shield, Globe, ChevronRight, Castle, Sun, Moon, Users, Camera,
    Award, Twitter, Instagram, Facebook, Youtube, Mail, ArrowUp,
    MapPin, Clock, Zap, Sparkles, ExternalLink,
    Settings, Share2, MessageCircle, Code, Palette, Rocket,
    FileText, Eye, Cookie, Gavel, Lightbulb, Cpu, Database, Cloud,
    Calendar, Utensils, DollarSign, TreePine, ShoppingBag, Book,
    HelpCircle, User, LayoutDashboard
} from 'lucide-react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// Magic UI Components
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { Particles } from '@/components/magicui/particles'
import { BlurFade } from '@/components/magicui/blur-fade'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Meteors } from '@/components/magicui/meteors'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { Marquee } from '@/components/magicui/marquee'

// UI Components
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Types
interface NavigationLink {
    name: string
    href: string
    icon?: React.ReactNode
    badge?: 'hot' | 'new' | 'live' | 'beta'
    external?: boolean
}

interface NavigationSection {
    title: string
    icon: React.ReactNode
    links: NavigationLink[]
}

interface SocialPlatform {
    name: string
    icon: React.ReactNode
    href: string
    color: string
    followers?: string
}

interface TechStack {
    name: string
    icon: React.ReactNode
    category: 'frontend' | 'backend' | 'database' | 'cloud'
    color: string
}

interface Statistic {
    label: string
    value: number
    suffix?: string
    icon: React.ReactNode
    color: string
}

// Theme hook with system preference detection
function useTheme() {
    const [theme, setTheme] = useState<'day' | 'night' | 'system'>('system')
    const [systemTheme, setSystemTheme] = useState<'day' | 'night'>('day')

    useEffect(() => {
        // Detect system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setSystemTheme(mediaQuery.matches ? 'night' : 'day')

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'night' : 'day')
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const activeTheme = theme === 'system' ? systemTheme : theme

    return { theme, setTheme, activeTheme }
}

// Enhanced Badge component
function EnhancedBadge({ type, children }: { type: 'hot' | 'new' | 'live' | 'beta', children: React.ReactNode }) {
    const styles = {
        hot: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25',
        new: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
        live: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25',
        beta: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/25'
    }

    return (
        <motion.span
            whileHover={{ scale: 1.1 }}
            className={`px-2 py-1 text-xs rounded-full font-medium ${styles[type]} backdrop-blur-sm`}
        >
            {children}
        </motion.span>
    )
}

// Newsletter Subscription Component with enhanced error handling
function NewsletterSubscription() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubscribe = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Enhanced API simulation with potential failure
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate 95% success rate
                    if (Math.random() > 0.05) {
                        resolve(true)
                    } else {
                        reject(new Error('Network error'))
                    }
                }, 1000 + Math.random() * 1000) // 1-2 second delay
            })

            setIsLoading(false)
            setIsSubscribed(true)
            setEmail('')

            toast.success('Successfully subscribed to newsletter!', {
                description: 'You&apos;ll receive Disney planning tips and updates.',
                duration: 5000,
            })
        } catch (err) {
            setIsLoading(false)
            const errorMessage = err instanceof Error ? err.message : 'Subscription failed'
            setError(errorMessage)

            toast.error('Subscription failed', {
                description: 'Please try again in a moment.',
                duration: 4000,
            })
        }
    }, [email])

    if (isSubscribed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                </motion.div>
                <h4 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                    Welcome to the Magic Circle!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    You&apos;re now subscribed to our exclusive Disney planning insights.
                </p>
            </motion.div>
        )
    }

    return (
        <NeonGradientCard className="relative overflow-hidden">
            <Meteors number={15} />
            <div className="relative z-10 p-6">
                <div className="text-center mb-4">
                    <SparklesText className="text-xl font-bold mb-2" sparklesCount={6}>
                        Stay Magical
                    </SparklesText>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Get exclusive Disney planning tips, insider secrets, and special offers.
                    </p>
                </div>

                <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="relative">
                        <Input
                            type="email"
                            placeholder="Enter your magical email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (error) setError(null) // Clear error on typing
                            }}
                            className={`pr-24 bg-white/50 dark:bg-black/50 backdrop-blur-sm transition-all duration-300 ${error
                                ? 'border-red-500/50 focus:border-red-500/70'
                                : 'border-white/20 focus:border-purple-500/50'
                                }`}
                            required
                            aria-invalid={!!error}
                            aria-describedby={error ? "email-error" : undefined}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Sparkles className={`w-4 h-4 transition-colors ${error ? 'text-red-500' : 'text-purple-500'
                                }`} />
                        </div>
                    </div>

                    {/* Error display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                id="email-error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-400 text-xs px-1"
                                role="alert"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ShimmerButton
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full"
                        shimmerColor="from-purple-400 via-violet-400 to-indigo-400"
                    >
                        {isLoading ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Sparkles className="w-4 h-4 mr-2" />
                            </motion.div>
                        ) : (
                            <Mail className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? 'Joining the Magic...' : 'Join the Magic'}
                    </ShimmerButton>
                </form>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                    No spam, just magical content. Unsubscribe anytime.
                </p>
            </div>
        </NeonGradientCard>
    )
}

// Quick Actions Component
function QuickActions() {
    const actions = [
        {
            name: 'Share WaltWise',
            icon: <Share2 className="w-4 h-4" />,
            color: 'from-blue-500 to-cyan-500',
            action: () => {
                if (navigator.share) {
                    navigator.share({
                        title: 'WaltWise - Disney Vacation Planner',
                        text: 'Plan your magical Disney vacation with AI-powered insights',
                        url: window.location.origin
                    })
                } else {
                    navigator.clipboard.writeText(window.location.origin)
                    toast.success('Link copied to clipboard!')
                }
            }
        },
        {
            name: 'Send Feedback',
            icon: <MessageCircle className="w-4 h-4" />,
            color: 'from-green-500 to-emerald-500',
            action: () => {
                // Open feedback modal or redirect
                toast.info('Feedback form coming soon!')
            }
        },
        {
            name: 'Request Feature',
            icon: <Lightbulb className="w-4 h-4" />,
            color: 'from-yellow-500 to-orange-500',
            action: () => {
                // Open feature request form
                toast.info('Feature request form coming soon!')
            }
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-3">
            {actions.map((action, index) => (
                <BlurFade key={action.name} delay={index * 0.1}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                        className={`w-full p-3 rounded-lg bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 font-medium`}
                    >
                        {action.icon}
                        {action.name}
                    </motion.button>
                </BlurFade>
            ))}
        </div>
    )
}

// Statistics Component with memoization for performance
const StatsSection = React.memo(function StatsSection() {
    const stats: Statistic[] = React.useMemo(() => [
        { label: 'Happy Families', value: 50000, suffix: '+', icon: <Users className="w-5 h-5" />, color: 'text-blue-500' },
        { label: 'Trips Planned', value: 25000, suffix: '+', icon: <MapPin className="w-5 h-5" />, color: 'text-green-500' },
        { label: 'Hours Saved', value: 100000, suffix: '+', icon: <Clock className="w-5 h-5" />, color: 'text-purple-500' },
        { label: 'Magic Created', value: 99.9, suffix: '%', icon: <Sparkles className="w-5 h-5" />, color: 'text-yellow-500' },
    ], [])

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <BlurFade key={stat.label} delay={index * 0.1}>
                    <MagicCard className="p-4 text-center border-0 bg-white/5 backdrop-blur-sm" gradientColor="from-purple-500/10 to-pink-500/10">
                        <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r from-white/10 to-white/5 mb-2 ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">
                            <NumberTicker value={stat.value} />
                            {stat.suffix}
                        </div>
                        <div className="text-xs text-gray-300">{stat.label}</div>
                    </MagicCard>
                </BlurFade>
            ))}
        </div>
    )
})

export default function Footer() {
    const { theme, setTheme, activeTheme } = useTheme()
    const { scrollYProgress } = useScroll()
    const opacity = useTransform(scrollYProgress, [0.8, 1], [0, 1])
    const [showScrollToTop, setShowScrollToTop] = useState(false)

    // Navigation sections with enhanced structure
    const navigationSections: NavigationSection[] = [
        {
            title: 'Planning Tools',
            icon: <Calendar className="w-5 h-5" />,
            links: [
                { name: 'Trip Planner', href: '/dashboard/planning', icon: <MapPin className="w-4 h-4" /> },
                { name: 'Live Wait Times', href: '/parks/wait-times', badge: 'live', icon: <Clock className="w-4 h-4" /> },
                { name: 'Genie+ Strategy', href: '/dashboard/genie', badge: 'hot', icon: <Zap className="w-4 h-4" /> },
                { name: 'Dining Finder', href: '/dining', icon: <Utensils className="w-4 h-4" /> },
                { name: 'Budget Calculator', href: '/budget', icon: <DollarSign className="w-4 h-4" /> },
            ]
        },
        {
            title: 'Theme Parks',
            icon: <Castle className="w-5 h-5" />,
            links: [
                { name: 'Magic Kingdom', href: '/parks/magic-kingdom', icon: <Castle className="w-4 h-4" /> },
                { name: 'EPCOT', href: '/parks/epcot', icon: <Globe className="w-4 h-4" /> },
                { name: 'Hollywood Studios', href: '/parks/hollywood-studios', icon: <Camera className="w-4 h-4" /> },
                { name: 'Animal Kingdom', href: '/parks/animal-kingdom', icon: <TreePine className="w-4 h-4" /> },
                { name: 'Disney Springs', href: '/dashboard/disneysprings', icon: <ShoppingBag className="w-4 h-4" /> },
            ]
        },
        {
            title: 'Resources',
            icon: <Book className="w-5 h-5" />,
            links: [
                { name: 'Weather Forecast', href: '/weather', icon: <Sun className="w-4 h-4" /> },
                { name: 'Tips & Tricks', href: '/tips-tricks', badge: 'new', icon: <Lightbulb className="w-4 h-4" /> },
                { name: 'Annual Passes', href: '/annual-passes', icon: <Award className="w-4 h-4" /> },
                { name: 'FAQ', href: '/faq', icon: <HelpCircle className="w-4 h-4" /> },
                { name: 'Contact Support', href: '/contact', icon: <MessageCircle className="w-4 h-4" /> },
            ]
        },
        {
            title: 'Account & Legal',
            icon: <User className="w-5 h-5" />,
            links: [
                { name: 'My Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
                { name: 'Privacy Policy', href: '/legal/privacy', icon: <Shield className="w-4 h-4" /> },
                { name: 'Terms of Service', href: '/legal/terms', icon: <FileText className="w-4 h-4" /> },
                { name: 'Cookie Policy', href: '/legal/cookies', icon: <Cookie className="w-4 h-4" /> },
                { name: 'Technology', href: '/legal/technology', icon: <Code className="w-4 h-4" /> },
            ]
        }
    ]

    // Enhanced social platforms with follower counts
    const socialPlatforms: SocialPlatform[] = [
        {
            name: 'Twitter',
            icon: <Twitter className="w-5 h-5" />,
            href: 'https://twitter.com/waltwise',
            color: 'hover:text-blue-400',
            followers: '25.2K'
        },
        {
            name: 'Instagram',
            icon: <Instagram className="w-5 h-5" />,
            href: 'https://instagram.com/waltwise',
            color: 'hover:text-pink-400',
            followers: '48.7K'
        },
        {
            name: 'YouTube',
            icon: <Youtube className="w-5 h-5" />,
            href: 'https://youtube.com/waltwise',
            color: 'hover:text-red-400',
            followers: '127K'
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            href: 'https://facebook.com/waltwise',
            color: 'hover:text-blue-600',
            followers: '91.3K'
        }
    ]

    // Technology stack showcase
    const techStack: TechStack[] = [
        { name: 'Next.js', icon: <Code className="w-4 h-4" />, category: 'frontend', color: 'text-gray-900 dark:text-white' },
        { name: 'React', icon: <Cpu className="w-4 h-4" />, category: 'frontend', color: 'text-blue-500' },
        { name: 'TypeScript', icon: <FileText className="w-4 h-4" />, category: 'frontend', color: 'text-blue-600' },
        { name: 'Firebase', icon: <Database className="w-4 h-4" />, category: 'backend', color: 'text-orange-500' },
        { name: 'Vercel', icon: <Cloud className="w-4 h-4" />, category: 'cloud', color: 'text-black dark:text-white' },
        { name: 'Tailwind', icon: <Palette className="w-4 h-4" />, category: 'frontend', color: 'text-cyan-500' },
    ]

    // Track scroll position
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollToTop(window.scrollY > 500)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <motion.footer
            style={{ opacity }}
            className={`relative overflow-hidden ${activeTheme === 'night'
                ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white'
                : 'bg-gradient-to-b from-gray-50 via-white to-gray-100 text-gray-900'
                } transition-colors duration-700`}
        >
            {/* Animated background particles */}
            <div className="absolute inset-0">
                <Particles
                    className="absolute inset-0"
                    quantity={activeTheme === 'night' ? 80 : 40}
                    ease={80}
                    color={activeTheme === 'night' ? '#8b5cf6' : '#3b82f6'}
                    refresh
                />
            </div>

            {/* Background decoration with enhanced gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${activeTheme === 'night' ? 'bg-purple-500' : 'bg-blue-500'
                    }`} />
                <div className={`absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 ${activeTheme === 'night' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 ${activeTheme === 'night' ? 'bg-pink-500' : 'bg-indigo-500'
                    }`} />
            </div>

            <div className="relative container mx-auto px-6 py-20">
                {/* Header section with enhanced branding */}
                <div className="text-center mb-20">
                    <BlurFade delay={0.1}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-4 mb-8"
                        >
                            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-2xl">
                                <BorderBeam size={100} duration={8} delay={0} />
                                <Castle className="w-12 h-12" />
                            </div>
                            <div className="text-left">
                                <SparklesText className="text-4xl font-bold" sparklesCount={8}>
                                    WaltWise
                                </SparklesText>
                                <AnimatedGradientText>
                                    <span className="text-sm">Powered by Magic & AI</span>
                                </AnimatedGradientText>
                            </div>
                        </motion.div>
                    </BlurFade>

                    <BlurFade delay={0.2}>
                        <p className={`text-lg max-w-3xl mx-auto leading-relaxed ${activeTheme === 'night' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            Your intelligent Disney vacation companion, creating magical memories through
                            personalized planning, real-time insights, and collaborative tools.
                        </p>
                    </BlurFade>

                    {/* Statistics section */}
                    <BlurFade delay={0.3}>
                        <div className="mt-12">
                            <StatsSection />
                        </div>
                    </BlurFade>
                </div>

                {/* Main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
                    {/* Navigation sections */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {navigationSections.slice(0, 3).map((section, sectionIndex) => (
                                <BlurFade key={section.title} delay={0.4 + sectionIndex * 0.1}>
                                    <MagicCard className="p-6 border-0 bg-white/5 backdrop-blur-sm h-full" gradientColor="from-purple-500/10 to-pink-500/10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={`p-2 rounded-lg ${activeTheme === 'night' ? 'bg-white/10' : 'bg-gray-100'
                                                }`}>
                                                {section.icon}
                                            </div>
                                            <h3 className="text-lg font-semibold">{section.title}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {section.links.map((link) => (
                                                <li key={link.name}>
                                                    <Link
                                                        href={link.href}
                                                        className={`flex items-center justify-between group p-2 rounded-lg transition-all duration-300 ${activeTheme === 'night'
                                                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <span className="flex items-center gap-3">
                                                            {link.icon}
                                                            {link.name}
                                                            {link.badge && <EnhancedBadge type={link.badge}>{link.badge}</EnhancedBadge>}
                                                            {link.external && <ExternalLink className="w-3 h-3" />}
                                                        </span>
                                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </MagicCard>
                                </BlurFade>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar with newsletter and quick actions */}
                    <div className="space-y-8">
                        <BlurFade delay={0.7}>
                            <NewsletterSubscription />
                        </BlurFade>

                        <BlurFade delay={0.8}>
                            <div>
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Rocket className="w-5 h-5" />
                                    Quick Actions
                                </h4>
                                <QuickActions />
                            </div>
                        </BlurFade>
                    </div>
                </div>

                {/* Legal & Account section in a separate row */}
                <BlurFade delay={0.9}>
                    <div className="mb-16">
                        <MagicCard className="p-6 border-0 bg-white/5 backdrop-blur-sm" gradientColor="from-blue-500/10 to-purple-500/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-lg ${activeTheme === 'night' ? 'bg-white/10' : 'bg-gray-100'
                                    }`}>
                                    {navigationSections[3].icon}
                                </div>
                                <h3 className="text-lg font-semibold">{navigationSections[3].title}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {navigationSections[3].links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${activeTheme === 'night'
                                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        {link.icon}
                                        <span className="text-sm">{link.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </MagicCard>
                    </div>
                </BlurFade>

                {/* Technology showcase */}
                <BlurFade delay={1.0}>
                    <div className="mb-16">
                        <h3 className="text-xl font-semibold mb-6 text-center flex items-center justify-center gap-2">
                            <Code className="w-6 h-6" />
                            Built with Modern Technology
                        </h3>
                        <Marquee pauseOnHover className="[--duration:40s]">
                            {techStack.map((tech, _index) => (
                                <TooltipProvider key={tech.name}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className={`flex items-center gap-2 mx-4 px-4 py-2 rounded-full border ${activeTheme === 'night' ? 'border-white/20 bg-white/5' : 'border-gray-200 bg-white'
                                                } ${tech.color}`}>
                                                {tech.icon}
                                                <span className="font-medium">{tech.name}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Category: {tech.category}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </Marquee>
                    </div>
                </BlurFade>

                {/* Social media section with enhanced design */}
                <BlurFade delay={1.1}>
                    <div className="text-center mb-16">
                        <h3 className="text-2xl font-semibold mb-8 flex items-center justify-center gap-2">
                            <Heart className="w-6 h-6 text-red-500" />
                            Join Our Magical Community
                        </h3>
                        <div className="flex justify-center gap-6">
                            {socialPlatforms.map((platform, _index) => (
                                <motion.div key={platform.name} className="text-center">
                                    <motion.a
                                        href={platform.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1, y: -4 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`block p-4 rounded-2xl ${activeTheme === 'night' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                                            } transition-all shadow-lg hover:shadow-xl ${platform.color}`}
                                    >
                                        {platform.icon}
                                    </motion.a>
                                    <div className="mt-2">
                                        <div className="text-sm font-medium">{platform.name}</div>
                                        <div className={`text-xs ${activeTheme === 'night' ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            {platform.followers} followers
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </BlurFade>

                {/* Bottom section with enhanced layout */}
                <div className={`pt-8 border-t ${activeTheme === 'night' ? 'border-white/10' : 'border-gray-200'
                    }`}>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Copyright */}
                        <div className={`text-sm text-center lg:text-left ${activeTheme === 'night' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                            <div className="mb-2">
                                © {new Date().getFullYear()} WaltWise. All rights reserved.
                            </div>
                            <div className="text-xs">
                                Made with ❤️ for Disney families worldwide
                            </div>
                        </div>

                        {/* Theme toggle and controls */}
                        <div className="flex items-center gap-4">
                            {/* Theme selector */}
                            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTheme('day')}
                                                className={`p-2 rounded-lg transition-all ${theme === 'day' ? 'bg-white/20 text-yellow-500' : 'text-gray-400'
                                                    }`}
                                            >
                                                <Sun className="w-5 h-5" />
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent>Light theme</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTheme('night')}
                                                className={`p-2 rounded-lg transition-all ${theme === 'night' ? 'bg-white/20 text-purple-400' : 'text-gray-400'
                                                    }`}
                                            >
                                                <Moon className="w-5 h-5" />
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent>Dark theme</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setTheme('system')}
                                                className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-white/20 text-blue-400' : 'text-gray-400'
                                                    }`}
                                            >
                                                <Settings className="w-5 h-5" />
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent>System theme</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Back to top button */}
                            <AnimatePresence>
                                {showScrollToTop && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <RainbowButton
                                            onClick={scrollToTop}
                                            className="p-3 rounded-full"
                                        >
                                            <ArrowUp className="w-5 h-5" />
                                        </RainbowButton>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Enhanced disclaimer */}
                    <BlurFade delay={1.2}>
                        <div className={`mt-8 p-6 rounded-2xl ${activeTheme === 'night' ? 'bg-white/5' : 'bg-gray-50'
                            } border border-opacity-10`}>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Shield className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold">Legal Disclaimer</span>
                                </div>
                                <p className={`text-xs leading-relaxed ${activeTheme === 'night' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    WaltWise is an independent service and is not affiliated with, endorsed by, or sponsored by
                                    The Walt Disney Company or Walt Disney World Resort. Disney, Walt Disney World, and all related
                                    characters, names, marks, and logos are trademarks and copyrights of The Walt Disney Company.
                                    All other trademarks are the property of their respective owners.
                                </p>
                                <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                                    <Link href="/legal/privacy" className="hover:underline flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Privacy Policy
                                    </Link>
                                    <Link href="/legal/terms" className="hover:underline flex items-center gap-1">
                                        <Gavel className="w-3 h-3" />
                                        Terms of Service
                                    </Link>
                                    <Link href="/legal/cookies" className="hover:underline flex items-center gap-1">
                                        <Cookie className="w-3 h-3" />
                                        Cookie Policy
                                    </Link>
                                    <Link href="/legal/technology" className="hover:underline flex items-center gap-1">
                                        <Code className="w-3 h-3" />
                                        Technology Disclosure
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </BlurFade>
                </div>
            </div>
        </motion.footer>
    )
}