'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import DisneyWorldTimeline from '@/components/parks/DisneyWorldTimeline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
    Calendar,
    Users,
    DollarSign,
    TrendingUp,
    Building,
    Utensils,
    Car,
    Star,
    BarChart3,
    Castle,
    Plane,
    Train,
    Ship,
    Zap,
    Trophy,
    Target,
    Activity
} from 'lucide-react'

// Magic UI Components
import { NumberTicker } from '@/components/magicui/number-ticker'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { SparklesText } from '@/components/magicui/sparkles-text'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { Meteors } from '@/components/magicui/meteors'
import { Particles } from '@/components/magicui/particles'
import { NeonGradientCard } from '@/components/magicui/neon-gradient-card'
import { ShineBorder } from '@/components/magicui/shine-border'
import { WordRotate } from '@/components/magicui/word-rotate'
import { TypingAnimation } from '@/components/magicui/typing-animation'

// Enhanced data structures for interactive features
const keyStats = [
    { label: 'Years of Magic', value: 54, icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Resort Hotels', value: 36, icon: Building, color: 'from-blue-500 to-cyan-500' },
    { label: 'Dining Venues', value: 300, icon: Utensils, color: 'from-green-500 to-emerald-500' },
    { label: 'Cast Members', value: 77000, icon: Users, color: 'from-orange-500 to-red-500' },
    { label: 'Daily Revenue (M)', value: 35, icon: DollarSign, color: 'from-yellow-500 to-amber-500' },
    { label: 'Annual Visitors (M)', value: 58.7, icon: TrendingUp, color: 'from-indigo-500 to-purple-500' }
]

const parkData = [
    { name: 'Magic Kingdom', rides: 20, opened: 1971, icon: Castle, color: 'bg-gradient-to-br from-purple-600 to-pink-600' },
    { name: 'EPCOT', rides: 10, opened: 1982, icon: Zap, color: 'bg-gradient-to-br from-blue-600 to-cyan-600' },
    { name: 'Hollywood Studios', rides: 9, opened: 1989, icon: Star, color: 'bg-gradient-to-br from-red-600 to-orange-600' },
    { name: 'Animal Kingdom', rides: 8, opened: 1998, icon: Trophy, color: 'bg-gradient-to-br from-green-600 to-emerald-600' }
]

const transportationData = [
    { name: 'Monorail System', capacity: 150000, icon: Train, description: '13.6 miles of track, 12 trains' },
    { name: 'Bus Fleet', capacity: 490, icon: Car, description: '3rd largest fleet in Florida' },
    { name: 'Boat Services', capacity: 32, icon: Ship, description: 'Ferries, launches, and water taxis' },
    { name: 'Disney Skyliner', capacity: 300, icon: Plane, description: 'Aerial gondola system' }
]

const revenueStreams = [
    { category: 'Park Admissions', percentage: 35, amount: 11.375, color: 'bg-purple-500' },
    { category: 'Hotels & Resorts', percentage: 30, amount: 9.75, color: 'bg-blue-500' },
    { category: 'Food & Beverage', percentage: 20, amount: 6.5, color: 'bg-green-500' },
    { category: 'Merchandise', percentage: 15, amount: 4.875, color: 'bg-orange-500' }
]

// Type definitions
interface StatData {
    label: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
}

interface ParkData {
    name: string
    rides: number
    opened: number
    icon: React.ComponentType<{ className?: string }>
    color: string
}

interface TransportData {
    name: string
    capacity: number
    icon: React.ComponentType<{ className?: string }>
    description: string
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const StatCard = ({ stat, index }: { stat: StatData, index: number }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 200)
        return () => clearTimeout(timer)
    }, [index])

    return (
        <MagicCard className="relative overflow-hidden group">
            <div className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">
                    {isVisible && (
                        <NumberTicker
                            value={stat.value}
                            className="text-foreground"
                            decimalPlaces={stat.label.includes('Revenue') ? 1 : 0}
                        />
                    )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </div>
            <BorderBeam size={100} duration={8} />
        </MagicCard>
    )
}

const ParkCard = ({ park, index }: { park: ParkData, index: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="relative"
    >
        <NeonGradientCard className="h-full">
            <div className="p-6 text-center h-full flex flex-col justify-between">
                <div>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${park.color} flex items-center justify-center`}>
                        <park.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{park.name}</h3>
                    <div className="text-2xl font-bold text-primary mb-2">
                        <NumberTicker value={park.rides} />+ Rides
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    Opened {park.opened}
                </div>
            </div>
        </NeonGradientCard>
    </motion.div>
)

const TransportationCard = ({ transport, index }: { transport: TransportData, index: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.15, duration: 0.6 }}
    >
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <transport.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg">{transport.name}</h3>
                            <p className="text-sm text-muted-foreground">{transport.description}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">
                                <NumberTicker value={transport.capacity} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {transport.name === 'Monorail System' ? 'Daily Guests' :
                                    transport.name === 'Bus Fleet' ? 'Vehicles' :
                                        transport.name === 'Disney Skyliner' ? 'Gondolas' : 'Vessels'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </ShineBorder>
        </Card>
    </motion.div>
)

const RevenueChart = () => (
    <div className="space-y-4">
        {revenueStreams.map((stream, index) => (
            <motion.div
                key={stream.category}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "100%" }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="space-y-2"
            >
                <div className="flex justify-between items-center">
                    <span className="font-medium">{stream.category}</span>
                    <span className="text-sm text-muted-foreground">
                        ${stream.amount}B ({stream.percentage}%)
                    </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stream.percentage}%` }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 1, ease: "easeOut" }}
                        className={`h-full ${stream.color} rounded-full relative`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                </div>
            </motion.div>
        ))}
    </div>
)

export default function DisneyWorldHistoryPage() {
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    const [activeTab, setActiveTab] = useState('overview')

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <Particles
                    className="absolute inset-0"
                    quantity={50}
                    ease={80}
                    color="#6366f1"
                    refresh={false}
                />
            </div>

            {/* Hero Section */}
            <motion.section
                className="relative z-10 min-h-screen flex items-center justify-center"
                style={{ y, opacity }}
            >
                <div className="container max-w-6xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="space-y-8"
                    >
                        <div className="relative">
                            <SparklesText className="text-6xl md:text-8xl font-bold">
                                Walt Disney World
                            </SparklesText>
                            <div className="mt-4">
                                <AnimatedGradientText className="text-2xl md:text-4xl">
                                    Resort History
                                </AnimatedGradientText>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                        >
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                                Since opening in 1971, Walt Disney World has grown to become the most visited vacation resort in the world.
                                Explore the comprehensive operational history and statistics of this magnificent destination.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5, duration: 0.6 }}
                            className="flex flex-wrap justify-center gap-4 mt-8"
                        >
                            <WordRotate
                                words={["Magical", "Innovative", "Immersive", "Unforgettable"]}
                                className="text-4xl font-bold text-primary"
                            />
                            <span className="text-4xl font-bold">Experience</span>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating meteors */}
                <Meteors number={20} />
            </motion.section>

            {/* Main Content */}
            <div className="relative z-10 bg-background/95 backdrop-blur-sm">
                <div className="container max-w-7xl mx-auto py-16 px-4">

                    {/* Key Statistics */}
                    <motion.section
                        className="mb-20"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="text-center mb-12">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl md:text-5xl font-bold mb-4"
                            >
                                By the Numbers
                            </motion.h2>
                            <p className="text-xl text-muted-foreground">
                                The scale and impact of Walt Disney World Resort
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {keyStats.map((stat, index) => (
                                <StatCard key={stat.label} stat={stat} index={index} />
                            ))}
                        </div>
                    </motion.section>

                    {/* Interactive Tabs */}
                    <motion.section
                        className="mb-20"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
                                <TabsTrigger value="overview" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="parks" className="flex items-center gap-2">
                                    <Castle className="w-4 h-4" />
                                    Parks
                                </TabsTrigger>
                                <TabsTrigger value="transportation" className="flex items-center gap-2">
                                    <Car className="w-4 h-4" />
                                    Transport
                                </TabsTrigger>
                                <TabsTrigger value="revenue" className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Revenue
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Card className="relative overflow-hidden">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5" />
                                                Historical Timeline
                                            </CardTitle>
                                            <CardDescription>
                                                Key milestones in Disney World&apos;s evolution
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <DisneyWorldTimeline />
                                        </CardContent>
                                        <BorderBeam size={200} duration={10} />
                                    </Card>

                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Resort Growth</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span>Hotel Rooms</span>
                                                        <span className="font-bold">30,000+</span>
                                                    </div>
                                                    <Progress value={90} className="h-2" />

                                                    <div className="flex justify-between items-center">
                                                        <span>Occupancy Rate</span>
                                                        <span className="font-bold">94%</span>
                                                    </div>
                                                    <Progress value={94} className="h-2" />

                                                    <div className="flex justify-between items-center">
                                                        <span>DVC Units</span>
                                                        <span className="font-bold">3,300+</span>
                                                    </div>
                                                    <Progress value={75} className="h-2" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Operational Scale</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-4 text-center">
                                                    <div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            <NumberTicker value={54} />
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Total Rides</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-primary">
                                                            <NumberTicker value={25} />K
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Acres</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="parks" className="space-y-8">
                                <div className="text-center mb-8">
                                    <motion.h3
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="text-3xl font-bold mb-4"
                                    >
                                        Four Magical Theme Parks
                                    </motion.h3>
                                    <p className="text-muted-foreground">
                                        Each park offers unique experiences and attractions
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {parkData.map((park, index) => (
                                        <ParkCard key={park.name} park={park} index={index} />
                                    ))}
                                </div>

                                <Card className="mt-8">
                                    <CardHeader>
                                        <CardTitle>Attraction Capacity & Throughput</CardTitle>
                                        <CardDescription>
                                            How Disney manages millions of guests efficiently
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-2">Attraction</th>
                                                        <th className="text-left p-2">Capacity/Hour</th>
                                                        <th className="text-left p-2">Type</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-2">Pirates of the Caribbean</td>
                                                        <td className="p-2 font-semibold">2,600</td>
                                                        <td className="p-2">
                                                            <Badge variant="secondary">Boat Ride</Badge>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-2">Haunted Mansion</td>
                                                        <td className="p-2 font-semibold">2,000+</td>
                                                        <td className="p-2">
                                                            <Badge variant="secondary">Omnimover</Badge>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-2">Carousel of Progress</td>
                                                        <td className="p-2 font-semibold">3,600</td>
                                                        <td className="p-2">
                                                            <Badge variant="secondary">Theater</Badge>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2">TRON Lightcycle/Run</td>
                                                        <td className="p-2 font-semibold">1,680</td>
                                                        <td className="p-2">
                                                            <Badge variant="secondary">Coaster</Badge>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="transportation" className="space-y-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-3xl font-bold mb-4">
                                        Transportation Network
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Moving 150,000+ guests daily across the resort
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {transportationData.map((transport, index) => (
                                        <TransportationCard key={transport.name} transport={transport} index={index} />
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Monorail System Details</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Track Length</span>
                                                    <span className="font-semibold">13.6 miles</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Train Fleet</span>
                                                    <span className="font-semibold">12 trains</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Passenger Capacity</span>
                                                    <span className="font-semibold">364-365 per train</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Top Speed</span>
                                                    <span className="font-semibold">40 mph</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Disney Skyliner</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between">
                                                    <span>Gondola Cabins</span>
                                                    <span className="font-semibold">~300</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Capacity per Cabin</span>
                                                    <span className="font-semibold">10 guests</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Operating Speed</span>
                                                    <span className="font-semibold">11 mph</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Hourly Capacity</span>
                                                    <span className="font-semibold">4,500 guests/hour</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="revenue" className="space-y-8">
                                <div className="text-center mb-8">
                                    <TypingAnimation
                                        text="Financial Performance"
                                        className="text-3xl font-bold mb-4"
                                    />
                                    <p className="text-muted-foreground">
                                        $32.5 billion in Parks, Experiences and Products revenue (FY2023)
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Revenue Breakdown</CardTitle>
                                            <CardDescription>
                                                Annual revenue streams by category
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RevenueChart />
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Key Financial Metrics</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span>Daily Revenue</span>
                                                        <span className="text-2xl font-bold text-green-600">
                                                            $<NumberTicker value={35} />M
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between items-center">
                                                        <span>Per Guest Spending</span>
                                                        <span className="text-xl font-semibold">
                                                            $<NumberTicker value={175} />
                                                        </span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between items-center">
                                                        <span>Hotel Revenue/Night</span>
                                                        <span className="text-xl font-semibold">
                                                            $<NumberTicker value={8} />M+
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Ticket Price Evolution</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span>1971</span>
                                                        <span className="font-semibold">$3.50</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>1985</span>
                                                        <span className="font-semibold">~$21</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>2005</span>
                                                        <span className="font-semibold">~$59</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>2024</span>
                                                        <span className="font-semibold">$109-$189</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </motion.section>

                    {/* Staffing Section */}
                    <motion.section
                        className="mb-20"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card className="relative overflow-hidden">
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl mb-4">
                                    Cast Member Excellence
                                </CardTitle>
                                <CardDescription className="text-lg">
                                    77,000 Cast Members creating magic every day
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Users className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold mb-2">
                                            <NumberTicker value={77000} />
                                        </div>
                                        <p className="text-muted-foreground">Total Cast Members</p>
                                        <p className="text-sm mt-2">Largest single-site employer in the US</p>
                                    </div>

                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <DollarSign className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold mb-2">
                                            $<NumberTicker value={18} />
                                        </div>
                                        <p className="text-muted-foreground">Starting Wage/Hour</p>
                                        <p className="text-sm mt-2">Reaching $20 by 2026</p>
                                    </div>

                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                            <Target className="w-10 h-10 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold mb-2">
                                            <NumberTicker value={45000} />
                                        </div>
                                        <p className="text-muted-foreground">Union Members</p>
                                        <p className="text-sm mt-2">Service Trades Council Union</p>
                                    </div>
                                </div>
                            </CardContent>
                            <Meteors number={15} />
                        </Card>
                    </motion.section>

                    {/* Footer */}
                    <motion.footer
                        className="text-center py-8 border-t"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-sm text-muted-foreground">
                            Source information: Walt Disney World operational statistics and data drawn from official reports and credible analyses,
                            including MagicGuides, TouringPlans, DisneyFoodBlog, historical accounts, Disney earnings calls, and news releases.
                        </p>
                    </motion.footer>
                </div>
            </div>
        </div>
    )
}