'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import Image from 'next/image'
import {
    Calendar,
    MapPin,
    Users,
    Sparkles,
    Clock,
    DollarSign,
    Star,
    Wand2,
    Hotel,
    Ticket,
    Utensils,
    Camera,
    Globe,
    Zap,
    Shield,
    Heart,
    Navigation,
    Compass,
    Rocket,
    Crown,
    Gem,
    Music,
    Sun,
    Cloud,
    Umbrella,
    Layers
} from 'lucide-react'

// MagicUI Components
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { AnimatedGridPattern } from '@/components/magicui/animated-grid-pattern'
import { AvatarCircles } from '@/components/magicui/avatar-circles'
import { BlurFade } from '@/components/magicui/blur-fade'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Confetti, ConfettiButton } from '@/components/magicui/confetti'
import { Marquee } from '@/components/magicui/marquee'
import { Meteors } from '@/components/magicui/meteors'
import { MorphingText } from '@/components/magicui/morphing-text'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Particles } from '@/components/magicui/particles'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { WordRotate } from '@/components/magicui/word-rotate'
import { BackgroundBeams } from '@/components/magicui/background-beams'
import { TextGenerateEffect } from '@/components/magicui/text-generate-effect'
import { GlowingStars } from '@/components/magicui/glowing-stars'
import { SpotlightCard } from '@/components/magicui/spotlight-card'
import { TracingBeam } from '@/components/magicui/tracing-beam'
import { WavyBackground } from '@/components/magicui/wavy-background'
import { AuroraBackground } from '@/components/magicui/aurora-background'
import { FloatingDock } from '@/components/magicui/floating-dock'
import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid'
import { Globe as GlobeMagic } from '@/components/magicui/globe'
import { Spotlight } from '@/components/magicui/spotlight'
import { OrbitingCircles } from '@/components/magicui/orbiting-circles'
import { DotPattern } from '@/components/magicui/dot-pattern'
import { TextShimmer } from '@/components/magicui/text-shimmer'
import { CustomCursor } from '@/components/magicui/custom-cursor'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

// Types
interface Feature {
    icon: React.ElementType
    title: string
    description: string
    color: string
    demo?: string
}

interface Testimonial {
    name: string
    role: string
    content: string
    rating: number
    avatar: string
    location: string
}

interface Statistic {
    value: number
    label: string
    suffix?: string
    icon: React.ElementType
}

interface ParkCard {
    name: string
    description: string
    highlights: string[]
    gradient: string
    icon: React.ElementType
    stats: { label: string; value: string }[]
}

interface TimelineEvent {
    time: string
    title: string
    description: string
    icon: React.ElementType
    color: string
}

interface PricingTier {
    name: string
    price: string
    description: string
    features: string[]
    highlighted?: boolean
    gradient: string
}

// Data
const features: Feature[] = [
    {
        icon: Calendar,
        title: "Smart Itinerary Planning",
        description: "AI-powered schedule optimization for maximum magic with minimal wait times",
        color: "from-purple-500 to-pink-500",
        demo: "Live optimization preview"
    },
    {
        icon: MapPin,
        title: "Real-Time Park Updates",
        description: "Live wait times, crowd levels, and attraction availability at your fingertips",
        color: "from-blue-500 to-cyan-500",
        demo: "Interactive park map"
    },
    {
        icon: Users,
        title: "Group Coordination",
        description: "Seamlessly plan and sync schedules with family and friends",
        color: "from-green-500 to-emerald-500",
        demo: "Group chat & planning"
    },
    {
        icon: DollarSign,
        title: "Budget Tracking",
        description: "Keep your vacation costs in check with intelligent spending insights",
        color: "from-yellow-500 to-orange-500",
        demo: "Expense dashboard"
    },
    {
        icon: Hotel,
        title: "Resort Recommendations",
        description: "Find the perfect Disney resort based on your preferences and budget",
        color: "from-indigo-500 to-purple-500",
        demo: "Resort comparison tool"
    },
    {
        icon: Ticket,
        title: "FastPass+ Strategy",
        description: "Optimize your FastPass selections for shorter lines at top attractions",
        color: "from-red-500 to-pink-500",
        demo: "Strategy generator"
    }
]

const testimonials: Testimonial[] = [
    {
        name: "Sarah Johnson",
        role: "Disney Enthusiast",
        content: "WaltWise transformed our Disney vacation! We saved hours of waiting and experienced 40% more attractions.",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=1",
        location: "Orlando, FL"
    },
    {
        name: "Mike Chen",
        role: "Parent of Three",
        content: "The group coordination feature was a lifesaver. Everyone knew where to be and when. Absolutely magical!",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=2",
        location: "San Francisco, CA"
    },
    {
        name: "Emily Rodriguez",
        role: "First-Time Visitor",
        content: "As a Disney newbie, WaltWise made me feel like a pro. The recommendations were spot-on!",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=3",
        location: "New York, NY"
    },
    {
        name: "David Park",
        role: "Annual Passholder",
        content: "Even as a frequent visitor, WaltWise showed me new ways to experience the parks. Incredible tool!",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=4",
        location: "Los Angeles, CA"
    }
]

const statistics: Statistic[] = [
    { value: 2500000, label: "Happy Visitors", suffix: "+", icon: Heart },
    { value: 85, label: "Time Saved", suffix: "%", icon: Clock },
    { value: 4.9, label: "User Rating", suffix: "/5", icon: Star },
    { value: 150, label: "Attractions Covered", suffix: "+", icon: MapPin }
]

const parkCards: ParkCard[] = [
    {
        name: "Magic Kingdom",
        description: "Where dreams come true in the most magical place on Earth",
        highlights: ["Space Mountain", "Seven Dwarfs Mine Train", "Haunted Mansion"],
        gradient: "from-blue-400 via-purple-500 to-pink-500",
        icon: Crown,
        stats: [
            { label: "Attractions", value: "40+" },
            { label: "Shows", value: "15+" },
            { label: "Dining", value: "30+" }
        ]
    },
    {
        name: "EPCOT",
        description: "Journey around the world and into the future",
        highlights: ["Guardians of the Galaxy", "Test Track", "Frozen Ever After"],
        gradient: "from-cyan-400 via-teal-500 to-green-500",
        icon: Globe,
        stats: [
            { label: "Countries", value: "11" },
            { label: "Attractions", value: "35+" },
            { label: "Festivals", value: "4" }
        ]
    },
    {
        name: "Hollywood Studios",
        description: "Step into the movies and television shows",
        highlights: ["Rise of the Resistance", "Tower of Terror", "Mickey's Runaway Railway"],
        gradient: "from-red-400 via-orange-500 to-yellow-500",
        icon: Camera,
        stats: [
            { label: "Shows", value: "20+" },
            { label: "Attractions", value: "25+" },
            { label: "Characters", value: "50+" }
        ]
    },
    {
        name: "Animal Kingdom",
        description: "Explore exotic lands and come face-to-face with wildlife",
        highlights: ["Avatar Flight of Passage", "Expedition Everest", "Kilimanjaro Safaris"],
        gradient: "from-green-400 via-emerald-500 to-teal-500",
        icon: Compass,
        stats: [
            { label: "Animals", value: "2000+" },
            { label: "Attractions", value: "20+" },
            { label: "Trails", value: "6" }
        ]
    }
]

const morphingWords = [
    "Magical",
    "Unforgettable",
    "Enchanting",
    "Extraordinary",
    "Spectacular"
]

const timelineEvents: TimelineEvent[] = [
    {
        time: "6 Months Before",
        title: "Book Your Resort",
        description: "Secure the perfect Disney resort with our AI recommendations",
        icon: Hotel,
        color: "from-purple-500 to-pink-500"
    },
    {
        time: "60 Days Before",
        title: "FastPass+ Selection",
        description: "Lock in your must-do attractions with optimized timing",
        icon: Ticket,
        color: "from-blue-500 to-cyan-500"
    },
    {
        time: "30 Days Before",
        title: "Dining Reservations",
        description: "Book character meals and signature dining experiences",
        icon: Utensils,
        color: "from-green-500 to-emerald-500"
    },
    {
        time: "Vacation Day",
        title: "Live Guidance",
        description: "Real-time updates and navigation throughout your magical day",
        icon: Navigation,
        color: "from-yellow-500 to-orange-500"
    }
]

const pricingTiers: PricingTier[] = [
    {
        name: "Explorer",
        price: "Free",
        description: "Perfect for first-time visitors",
        features: [
            "Basic itinerary planning",
            "Park wait times",
            "1 trip per year",
            "Community support"
        ],
        gradient: "from-gray-500 to-gray-700"
    },
    {
        name: "Adventurer",
        price: "$9.99/mo",
        description: "For families who visit annually",
        features: [
            "AI-powered optimization",
            "FastPass+ strategy",
            "Unlimited trips",
            "Group coordination",
            "Dining reservations",
            "Priority support"
        ],
        highlighted: true,
        gradient: "from-purple-500 to-pink-500"
    },
    {
        name: "Annual Pass",
        price: "$19.99/mo",
        description: "For the ultimate Disney fans",
        features: [
            "Everything in Adventurer",
            "VIP concierge service",
            "Early access features",
            "Custom magic bands",
            "Exclusive events",
            "API access"
        ],
        gradient: "from-yellow-500 to-orange-500"
    }
]

// Animated Castle SVG Component
const AnimatedCastle = React.memo(() => {
    return (
        <motion.svg
            viewBox="0 0 400 300"
            className="h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
        >
            <defs>
                <linearGradient id="castleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9c40ff" />
                    <stop offset="100%" stopColor="#ffaa40" />
                </linearGradient>
            </defs>

            {/* Castle Base */}
            <motion.rect
                x="100" y="150" width="200" height="100"
                fill="url(#castleGradient)"
                initial={{ y: 300 }}
                animate={{ y: 150 }}
                transition={{ duration: 1, delay: 0.5 }}
            />

            {/* Towers */}
            {[80, 150, 220, 290].map((x, i) => (
                <motion.g key={i}>
                    <motion.rect
                        x={x} y="100" width="40" height="100"
                        fill="url(#castleGradient)"
                        initial={{ y: 300 }}
                        animate={{ y: 100 }}
                        transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                    />
                    <motion.polygon
                        points={`${x},100 ${x + 20},60 ${x + 40},100`}
                        fill="#ffaa40"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 1.2 + i * 0.1 }}
                    />
                </motion.g>
            ))}

            {/* Stars */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.circle
                    key={i}
                    cx={Math.random() * 400}
                    cy={Math.random() * 100}
                    r="2"
                    fill="#ffffff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                        duration: 3,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                    }}
                />
            ))}

            {/* Fireworks */}
            <motion.circle
                cx="200"
                cy="50"
                r="5"
                fill="#ff69b4"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 10, 15], opacity: [1, 0.5, 0] }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                }}
            />
        </motion.svg>
    )
})
AnimatedCastle.displayName = 'AnimatedCastle'

// Floating Magic Particles Component
const FloatingMagicParticles = React.memo(() => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    if (dimensions.width === 0) return null

    return (
        <div className="pointer-events-none fixed inset-0 z-40">
            {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute h-1 w-1 rounded-full bg-purple-400"
                    initial={{
                        x: Math.random() * dimensions.width,
                        y: dimensions.height + 100,
                    }}
                    animate={{
                        y: -100,
                        transition: {
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        },
                    }}
                    style={{
                        left: `${Math.random() * 100}%`,
                    }}
                />
            ))}
        </div>
    )
})
FloatingMagicParticles.displayName = 'FloatingMagicParticles'

// Liquid Blob Animation Component
const LiquidBlob = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`relative ${className}`}>
            <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    )
}

// Interactive Feature Demo Component
const FeatureDemo = ({ feature }: { feature: Feature }) => {
    const [isActive, setIsActive] = useState(false)

    const demos = {
        "Live optimization preview": (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs">Space Mountain</span>
                    <span className="text-xs text-green-400">15 min</span>
                </div>
                <Progress value={25} className="h-2" />
                <div className="flex items-center justify-between">
                    <span className="text-xs">Thunder Mountain</span>
                    <span className="text-xs text-yellow-400">45 min</span>
                </div>
                <Progress value={75} className="h-2" />
            </div>
        ),
        "Interactive park map": (
            <div className="relative h-32 w-full rounded-lg bg-gradient-to-br from-green-400 to-blue-500 p-2">
                <div className="absolute top-2 left-2 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <div className="absolute top-8 right-4 h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                <div className="absolute bottom-4 left-1/2 h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                <span className="text-xs text-white">Live Locations</span>
            </div>
        ),
        "Group chat & planning": (
            <div className="space-y-2">
                <div className="rounded-lg bg-purple-500/20 p-2">
                    <p className="text-xs">Sarah: Meet at Space Mountain?</p>
                </div>
                <div className="rounded-lg bg-blue-500/20 p-2">
                    <p className="text-xs">Mike: On our way! ETA 5 min</p>
                </div>
            </div>
        ),
        "Expense dashboard": (
            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Tickets</span>
                    <span>$450</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span>Food</span>
                    <span>$120</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                    <span>Total</span>
                    <span>$570</span>
                </div>
            </div>
        ),
        "Resort comparison tool": (
            <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-purple-500/20 p-2 text-center">
                    <Crown className="mx-auto h-4 w-4" />
                    <p className="text-xs">Deluxe</p>
                </div>
                <div className="rounded bg-blue-500/20 p-2 text-center">
                    <Hotel className="mx-auto h-4 w-4" />
                    <p className="text-xs">Moderate</p>
                </div>
            </div>
        ),
        "Strategy generator": (
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xs">9:00 AM</span>
                    <Badge variant="secondary" className="text-xs">Seven Dwarfs</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs">11:00 AM</span>
                    <Badge variant="secondary" className="text-xs">Space Mountain</Badge>
                </div>
            </div>
        ),
    }

    return (
        <motion.div
            className="absolute inset-0 rounded-lg bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            onHoverStart={() => setIsActive(true)}
            onHoverEnd={() => setIsActive(false)}
            style={{ pointerEvents: isActive ? 'auto' : 'none' }}
        >
            <h4 className="mb-2 text-sm font-semibold text-white">Demo Preview</h4>
            {demos[feature.demo as keyof typeof demos] || <div>Demo coming soon!</div>}
        </motion.div>
    )
}

// Comparison Slider Component
const ComparisonSlider = () => {
    const [sliderValue, setSliderValue] = useState([50])

    return (
        <div className="relative h-64 w-full overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900">
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <Calendar className="mx-auto mb-2 h-12 w-12 text-gray-600" />
                            <h3 className="text-xl font-bold text-gray-400">Without WaltWise</h3>
                            <p className="text-sm text-gray-500">Manual planning, long waits</p>
                        </div>
                    </div>
                </div>

                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                    style={{ clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)` }}
                >
                    <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                            <Wand2 className="mx-auto mb-2 h-12 w-12 text-white" />
                            <h3 className="text-xl font-bold text-white">With WaltWise</h3>
                            <p className="text-sm text-gray-200">AI-optimized, skip the lines</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                max={100}
                step={1}
                className="absolute inset-y-0 left-0 right-0 z-10"
            />

            <div
                className="absolute top-0 bottom-0 z-20 w-1 bg-white"
                style={{ left: `${sliderValue[0]}%` }}
            >
                <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2">
                    <Layers className="h-4 w-4 text-gray-900" />
                </div>
            </div>
        </div>
    )
}

// 3D Card Component
const Card3D = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [rotateX, setRotateX] = useState(0)
    const [rotateY, setRotateY] = useState(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10
        setRotateX(rotateX)
        setRotateY(rotateY)
    }

    const handleMouseLeave = () => {
        setRotateX(0)
        setRotateY(0)
    }

    return (
        <div
            ref={cardRef}
            className={`group relative transition-all duration-200 ease-out ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </div>
    )
}

export default function LandingPage() {
    const [selectedPark, setSelectedPark] = useState<number>(0)
    const [showConfetti, _setShowConfetti] = useState(false)
    const [_activeTab, _setActiveTab] = useState("features")
    const [journeyProgress, setJourneyProgress] = useState(0)
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

    useEffect(() => {
        const interval = setInterval(() => {
            setSelectedPark((prev) => (prev + 1) % parkCards.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setJourneyProgress((prev) => (prev >= 100 ? 0 : prev + 1))
        }, 100)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Custom Cursor */}
            <CustomCursor />

            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 z-50 origin-left"
                style={{ scaleX }}
            />

            {/* Background Effects */}
            <div className="fixed inset-0">
                <AuroraBackground className="absolute inset-0 opacity-30" />
                <DotPattern
                    className="absolute inset-0 opacity-20"
                    cr={1}
                    cx={1}
                    cy={1}
                />
                <Particles
                    className="absolute inset-0"
                    quantity={100}
                    ease={80}
                    color="#ffffff"
                    size={0.5}
                />
            </div>

            {/* Floating Navigation Dock */}
            <FloatingDock
                items={[
                    { title: "Home", icon: <Crown className="h-5 w-5" />, href: "#home" },
                    { title: "Features", icon: <Sparkles className="h-5 w-5" />, href: "#features" },
                    { title: "Parks", icon: <MapPin className="h-5 w-5" />, href: "#parks" },
                    { title: "Pricing", icon: <DollarSign className="h-5 w-5" />, href: "#pricing" },
                    { title: "Start", icon: <Rocket className="h-5 w-5" />, href: "#start" },
                ]}
                desktopClassName="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
                mobileClassName="fixed bottom-4 right-4 z-50"
            />

            {/* Hero Section with Spotlight Effect */}
            <section id="home" className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
                <Spotlight
                    className="-top-40 left-0 md:left-60 md:-top-20"
                    fill="white"
                />

                {/* Liquid Blob Background */}
                <LiquidBlob className="absolute top-20 left-10 h-96 w-96 opacity-20" />
                <LiquidBlob className="absolute bottom-20 right-10 h-64 w-64 opacity-20" />

                {/* Animated Castle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="h-[600px] w-[800px]">
                        <AnimatedCastle />
                    </div>
                </div>

                {/* Orbiting Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <OrbitingCircles
                        className="h-[50px] w-[50px] border-none bg-transparent"
                        duration={20}
                        delay={0}
                        radius={300}
                    >
                        <Crown className="h-8 w-8 text-yellow-400" />
                    </OrbitingCircles>
                    <OrbitingCircles
                        className="h-[50px] w-[50px] border-none bg-transparent"
                        duration={20}
                        delay={5}
                        radius={300}
                    >
                        <Gem className="h-8 w-8 text-purple-400" />
                    </OrbitingCircles>
                    <OrbitingCircles
                        className="h-[50px] w-[50px] border-none bg-transparent"
                        duration={20}
                        delay={10}
                        radius={300}
                    >
                        <Star className="h-8 w-8 text-pink-400" />
                    </OrbitingCircles>
                    <OrbitingCircles
                        className="h-[30px] w-[30px] border-none bg-transparent"
                        duration={15}
                        delay={0}
                        radius={200}
                        reverse
                    >
                        <Music className="h-6 w-6 text-cyan-400" />
                    </OrbitingCircles>
                </div>

                <BlurFade delay={0.25} inView>
                    <div className="mb-8">
                        <AnimatedGradientText className="mb-4">
                            <span className="animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent">
                                ✨ New: AI-Powered Genie+ Optimization
                            </span>
                        </AnimatedGradientText>
                    </div>
                </BlurFade>

                <BlurFade delay={0.5} inView>
                    <motion.h1
                        className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                    >
                        <SparklesText
                            className="inline-block"
                            colors={{ first: "#9c40ff", second: "#ffaa40" }}
                        >
                            WaltWise
                        </SparklesText>
                    </motion.h1>
                </BlurFade>

                <BlurFade delay={0.75} inView>
                    <div className="mb-8 text-2xl text-gray-300 sm:text-3xl md:text-4xl">
                        <span>Plan Your </span>
                        <MorphingText
                            texts={morphingWords}
                            className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                        />
                        <span> Disney Vacation</span>
                    </div>
                </BlurFade>

                <BlurFade delay={1} inView>
                    <TextGenerateEffect
                        words="Experience more magic, wait less, and create memories that last a lifetime"
                        className="mb-12 max-w-2xl text-lg text-gray-400 sm:text-xl"
                    />
                </BlurFade>

                <BlurFade delay={1.25} inView>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <ConfettiButton
                            asChild
                            options={{
                                particleCount: 200,
                                spread: 70,
                                origin: { y: 0.6 }
                            }}
                        >
                            <RainbowButton className="px-8 py-6 text-lg font-semibold">
                                <Wand2 className="mr-2 h-5 w-5" />
                                Start Planning Magic
                            </RainbowButton>
                        </ConfettiButton>

                        <ShimmerButton
                            className="px-8 py-6 text-lg font-semibold"
                            shimmerColor="#ffffff"
                            background="rgba(255, 255, 255, 0.1)"
                        >
                            <Camera className="mr-2 h-5 w-5" />
                            View Demo
                        </ShimmerButton>
                    </div>
                </BlurFade>

                {showConfetti && (
                    <Confetti
                        className="absolute inset-0 z-50"
                        options={{
                            particleCount: 200,
                            spread: 70,
                            origin: { y: 0.6 }
                        }}
                    />
                )}

                <BlurFade delay={1.5} inView>
                    <div className="mt-12">
                        <p className="mb-4 text-sm text-gray-400">Trusted by Disney fans worldwide</p>
                        <AvatarCircles
                            numPeople={99}
                            avatarUrls={testimonials.map(t => ({
                                imageUrl: t.avatar,
                                profileUrl: "#"
                            }))}
                        />
                    </div>
                </BlurFade>

                {/* Animated Arrow */}
                <motion.div
                    className="absolute bottom-8"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Navigation className="h-8 w-8 text-white/50 rotate-180" />
                </motion.div>
            </section>

            {/* Interactive Statistics Section with 3D Cards */}
            <section className="relative z-10 py-20">
                <TracingBeam className="px-6">
                    <div className="container mx-auto px-4">
                        <BlurFade inView>
                            <h2 className="mb-12 text-center text-4xl font-bold text-white">
                                <TextShimmer
                                    className="text-4xl md:text-5xl"
                                    duration={2}
                                >
                                    The Magic in Numbers
                                </TextShimmer>
                            </h2>
                        </BlurFade>

                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {statistics.map((stat, index) => (
                                <BlurFade key={index} delay={0.1 * index} inView>
                                    <Card3D className="text-center">
                                        <NeonGradientCard
                                            className="relative h-full"
                                            neonColors={{
                                                firstColor: "#9c40ff",
                                                secondColor: "#ffaa40"
                                            }}
                                        >
                                            <div className="p-6">
                                                {React.createElement(stat.icon, { className: "mx-auto mb-4 h-8 w-8 text-purple-400" })}
                                                <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                                                    <NumberTicker
                                                        value={stat.value}
                                                        decimalPlaces={stat.label === "User Rating" ? 1 : 0}
                                                    />
                                                    <span className="text-purple-400">{stat.suffix}</span>
                                                </div>
                                                <p className="text-gray-400">{stat.label}</p>
                                            </div>
                                        </NeonGradientCard>
                                    </Card3D>
                                </BlurFade>
                            ))}
                        </div>
                    </div>
                </TracingBeam>
            </section>

            {/* Interactive Features Grid with Bento Layout */}
            <section id="features" className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <BlurFade inView>
                        <h2 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
                            Everything You Need for the
                            <WordRotate
                                words={["Perfect", "Magical", "Unforgettable", "Dream"]}
                                className="ml-2 inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                            />
                            Disney Trip
                        </h2>
                    </BlurFade>

                    <BlurFade delay={0.25} inView>
                        <p className="mb-16 text-center text-xl text-gray-400">
                            Powered by advanced AI and real-time data to maximize your Disney experience
                        </p>
                    </BlurFade>

                    {/* Comparison Slider */}
                    <BlurFade delay={0.5} inView>
                        <div className="mb-16 mx-auto max-w-2xl">
                            <h3 className="mb-6 text-center text-2xl font-bold text-white">See the Difference</h3>
                            <ComparisonSlider />
                        </div>
                    </BlurFade>

                    <BentoGrid className="mx-auto max-w-7xl">
                        {features.map((feature, index) => (
                            <BentoCard
                                key={index}
                                name={feature.title}
                                description={feature.description}
                                href="#"
                                cta="Learn more"
                                className={`group relative overflow-hidden ${index === 0 || index === 3 ? "md:col-span-2" : ""
                                    }`}
                                background={
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20`} />
                                }
                                Icon={feature.icon}
                            >
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-white/10 text-white">
                                        {feature.demo}
                                    </Badge>
                                </div>
                                {feature.demo && <FeatureDemo feature={feature} />}
                            </BentoCard>
                        ))}
                    </BentoGrid>
                </div>
            </section>

            {/* Interactive Journey Timeline */}
            <section className="relative z-10 py-20">
                <WavyBackground className="absolute inset-0 opacity-30" />
                <div className="container relative mx-auto px-4">
                    <BlurFade inView>
                        <h2 className="mb-16 text-center text-4xl font-bold text-white md:text-5xl">
                            Your Journey to
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Disney Magic
                            </span>
                        </h2>
                    </BlurFade>

                    <div className="mx-auto max-w-4xl">
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute left-8 top-0 h-full w-1 bg-white/10 md:left-1/2 md:-translate-x-1/2">
                                <motion.div
                                    className="absolute top-0 w-full bg-gradient-to-b from-purple-500 to-pink-500"
                                    style={{ height: `${journeyProgress}%` }}
                                />
                            </div>

                            {/* Timeline Events */}
                            {timelineEvents.map((event, index) => (
                                <BlurFade key={index} delay={0.1 * index} inView>
                                    <div className={`relative mb-12 flex items-center ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                                        }`}>
                                        <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:pl-8'
                                            }`}>
                                            <SpotlightCard
                                                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                                                spotlightColor="rgba(156, 64, 255, 0.5)"
                                            >
                                                <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${event.color} p-3`}>
                                                    {React.createElement(event.icon, { className: "h-6 w-6 text-white" })}
                                                </div>
                                                <h3 className="mb-1 text-xl font-semibold text-white">
                                                    {event.title}
                                                </h3>
                                                <p className="mb-2 text-sm text-purple-400">{event.time}</p>
                                                <p className="text-gray-400">{event.description}</p>
                                            </SpotlightCard>
                                        </div>

                                        {/* Center Point */}
                                        <div className="absolute left-8 h-4 w-4 rounded-full bg-purple-500 md:left-1/2 md:-translate-x-1/2">
                                            <div className="absolute inset-0 animate-ping rounded-full bg-purple-500" />
                                        </div>
                                    </div>
                                </BlurFade>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Parks Showcase with 3D Globe */}
            <section id="parks" className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <BlurFade inView>
                        <h2 className="mb-16 text-center text-4xl font-bold text-white md:text-5xl">
                            Plan Your Adventure Across All
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Four Disney Parks
                            </span>
                        </h2>
                    </BlurFade>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Globe Visualization */}
                        <div className="flex items-center justify-center">
                            <div className="relative h-[400px] w-full">
                                <GlobeMagic className="h-full w-full" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <Crown className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
                                        <h3 className="text-2xl font-bold text-white">Global Magic</h3>
                                        <p className="text-gray-400">Visitors from 150+ countries</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Park Cards */}
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedPark}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Card3D>
                                        <NeonGradientCard
                                            className="relative overflow-hidden"
                                            neonColors={{
                                                firstColor: "#9c40ff",
                                                secondColor: "#ffaa40"
                                            }}
                                        >
                                            <div className="relative z-10 p-8">
                                                <div className="mb-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`inline-flex rounded-lg bg-gradient-to-r ${parkCards[selectedPark].gradient} p-3`}>
                                                            {React.createElement(parkCards[selectedPark].icon, { className: "h-8 w-8 text-white" })}
                                                        </div>
                                                        <h3 className="text-3xl font-bold text-white">
                                                            {parkCards[selectedPark].name}
                                                        </h3>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {parkCards.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setSelectedPark(index)}
                                                                className={`h-2 w-2 rounded-full transition-all ${index === selectedPark
                                                                    ? 'w-8 bg-white'
                                                                    : 'bg-white/30 hover:bg-white/50'
                                                                    }`}
                                                                aria-label={`Go to park ${index + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="mb-6 text-lg text-gray-300">
                                                    {parkCards[selectedPark].description}
                                                </p>

                                                {/* Park Stats */}
                                                <div className="mb-6 grid grid-cols-3 gap-4">
                                                    {parkCards[selectedPark].stats.map((stat, idx) => (
                                                        <div key={idx} className="text-center">
                                                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                                                            <p className="text-sm text-gray-400">{stat.label}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mb-4">
                                                    <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-purple-400">
                                                        Must-Do Attractions
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {parkCards[selectedPark].highlights.map((highlight, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="secondary"
                                                                className="bg-white/10 text-white hover:bg-white/20"
                                                            >
                                                                <Sparkles className="mr-1 h-3 w-3" />
                                                                {highlight}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Separator className="my-6 bg-white/10" />

                                                <div className="flex items-center justify-between">
                                                    <Button
                                                        variant="ghost"
                                                        className="text-white hover:bg-white/10"
                                                        onClick={() => setSelectedPark((prev) => (prev - 1 + parkCards.length) % parkCards.length)}
                                                    >
                                                        ← Previous Park
                                                    </Button>
                                                    <Button
                                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                                    >
                                                        Explore {parkCards[selectedPark].name}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="text-white hover:bg-white/10"
                                                        onClick={() => setSelectedPark((prev) => (prev + 1) % parkCards.length)}
                                                    >
                                                        Next Park →
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 opacity-10">
                                                <div className={`h-full w-full bg-gradient-to-br ${parkCards[selectedPark].gradient}`} />
                                            </div>
                                            <Meteors number={20} />
                                        </NeonGradientCard>
                                    </Card3D>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Weather Widget Section */}
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <BlurFade inView>
                        <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h3 className="mb-6 text-center text-2xl font-bold text-white">
                                Perfect Weather for Magic
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { day: "Today", temp: "82°F", icon: Sun, condition: "Sunny" },
                                    { day: "Tomorrow", temp: "79°F", icon: Cloud, condition: "Partly Cloudy" },
                                    { day: "Thursday", temp: "77°F", icon: Umbrella, condition: "Light Rain" },
                                    { day: "Friday", temp: "84°F", icon: Sun, condition: "Clear" }
                                ].map((weather, idx) => (
                                    <div key={idx} className="text-center">
                                        <p className="mb-2 text-sm text-gray-400">{weather.day}</p>
                                        <weather.icon className="mx-auto mb-2 h-8 w-8 text-yellow-400" />
                                        <p className="text-xl font-bold text-white">{weather.temp}</p>
                                        <p className="text-xs text-gray-400">{weather.condition}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BlurFade>
                </div>
            </section>

            {/* Testimonials with Floating Animation */}
            <section className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <BlurFade inView>
                        <h2 className="mb-16 text-center text-4xl font-bold text-white md:text-5xl">
                            Magical Moments from
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Happy Visitors
                            </span>
                        </h2>
                    </BlurFade>

                    <div className="relative">
                        <Marquee pauseOnHover className="[--duration:40s]">
                            {testimonials.concat(testimonials).map((testimonial, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                                    transition={{ duration: 0.2 }}
                                    className="mx-4"
                                >
                                    <Card className="w-[350px] border-white/10 bg-white/5 backdrop-blur-sm">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <Image
                                                        src={testimonial.avatar}
                                                        alt={testimonial.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-12 w-12 rounded-full"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-white">
                                                        {testimonial.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-gray-400">
                                                        {testimonial.role} • {testimonial.location}
                                                    </CardDescription>
                                                </div>
                                                <div className="ml-auto flex">
                                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-300">&quot;{testimonial.content}&quot;</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </Marquee>

                        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-slate-900" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-slate-900" />
                    </div>
                </div>
            </section>

            {/* Pricing Section with Interactive Cards */}
            <section id="pricing" className="relative z-10 py-20">
                <BackgroundBeams className="absolute inset-0 opacity-30" />
                <div className="container relative mx-auto px-4">
                    <BlurFade inView>
                        <h2 className="mb-4 text-center text-4xl font-bold text-white md:text-5xl">
                            Choose Your
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Magic Level
                            </span>
                        </h2>
                    </BlurFade>

                    <BlurFade delay={0.25} inView>
                        <p className="mb-16 text-center text-xl text-gray-400">
                            Start free and upgrade as your Disney dreams grow
                        </p>
                    </BlurFade>

                    <div className="grid gap-8 md:grid-cols-3">
                        {pricingTiers.map((tier, index) => (
                            <BlurFade key={index} delay={0.1 * index} inView>
                                <Card3D>
                                    <motion.div
                                        whileHover={{ y: -10 }}
                                        className={`relative h-full overflow-hidden rounded-2xl border ${tier.highlighted
                                            ? 'border-purple-500 shadow-[0_0_30px_rgba(156,64,255,0.5)]'
                                            : 'border-white/10'
                                            } bg-white/5 backdrop-blur-sm`}
                                    >
                                        {tier.highlighted && (
                                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-center text-sm font-semibold text-white">
                                                Most Popular
                                            </div>
                                        )}

                                        <div className="p-8">
                                            <h3 className="mb-2 text-2xl font-bold text-white">{tier.name}</h3>
                                            <p className="mb-6 text-gray-400">{tier.description}</p>

                                            <div className="mb-6">
                                                <span className="text-4xl font-bold text-white">{tier.price}</span>
                                                {tier.price !== "Free" && <span className="text-gray-400">/month</span>}
                                            </div>

                                            <ul className="mb-8 space-y-3">
                                                {tier.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center text-gray-300">
                                                        <Sparkles className="mr-3 h-4 w-4 text-purple-400" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <Button
                                                className={`w-full ${tier.highlighted
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                                    : 'bg-white/10 hover:bg-white/20'
                                                    }`}
                                            >
                                                {tier.price === "Free" ? "Get Started" : "Subscribe Now"}
                                            </Button>
                                        </div>

                                        {tier.highlighted && <BorderBeam />}
                                    </motion.div>
                                </Card3D>
                            </BlurFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section with Multiple Effects */}
            <section id="start" className="relative z-10 py-20">
                <div className="container mx-auto px-4">
                    <div className="relative overflow-hidden rounded-3xl">
                        {/* Glowing Stars Background */}
                        <GlowingStars className="absolute inset-0" />

                        <div className="absolute inset-0">
                            <AnimatedGridPattern
                                numSquares={50}
                                maxOpacity={0.3}
                                className="h-full w-full"
                            />
                            <Meteors number={20} />
                        </div>

                        <div className="relative z-10 px-8 py-16 text-center md:px-16 md:py-24">
                            <BlurFade inView>
                                <motion.h2
                                    className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                                >
                                    Ready to Make Your
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400">
                                        Disney Dreams Come True?
                                    </span>
                                </motion.h2>
                            </BlurFade>

                            <BlurFade delay={0.25} inView>
                                <p className="mb-12 text-xl text-gray-300">
                                    Join millions of happy visitors who&apos;ve discovered the magic of stress-free Disney planning
                                </p>
                            </BlurFade>

                            <BlurFade delay={0.5} inView>
                                <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                                    <ConfettiButton asChild>
                                        <Button
                                            size="lg"
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-6 text-lg font-semibold hover:from-purple-600 hover:to-pink-600"
                                        >
                                            <Wand2 className="mr-2 h-5 w-5" />
                                            Get Started Free
                                        </Button>
                                    </ConfettiButton>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-white/20 bg-white/10 px-8 py-6 text-lg font-semibold text-white hover:bg-white/20"
                                    >
                                        <Clock className="mr-2 h-5 w-5" />
                                        Schedule Demo
                                    </Button>
                                </div>
                            </BlurFade>

                            <BlurFade delay={0.75} inView>
                                <p className="mt-8 text-sm text-gray-400">
                                    No credit card required • Free plan available • Cancel anytime
                                </p>
                            </BlurFade>

                            {/* Trust Badges */}
                            <BlurFade delay={1} inView>
                                <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-green-400" />
                                        <span className="text-gray-400">Bank-level Security</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-400" />
                                        <span className="text-gray-400">Real-time Updates</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-red-400" />
                                        <span className="text-gray-400">24/7 Support</span>
                                    </div>
                                </div>
                            </BlurFade>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating Magic Particles */}
            <FloatingMagicParticles />
        </div>
    )
}