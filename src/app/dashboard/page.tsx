"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { format } from "date-fns"

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Magic UI Components
import { MagicCard } from "@/components/magicui/magic-card"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { SparklesText } from "@/components/magicui/sparkles-text"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { BlurFade } from "@/components/magicui/blur-fade"
import { WarpBackground } from "@/components/magicui/warp-background"
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card"
import { Meteors } from "@/components/magicui/meteors"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { TypingAnimation } from "@/components/magicui/typing-animation"

// Icons
import {
    Home,
    Calendar,
    Clock,
    MapPin,
    Star,
    Users,
    Camera,
    Utensils,
    Zap,
    Activity,
    Trophy,
    PieChart,
    Settings,
    DollarSign,
    Footprints,
    Sparkles,
    ArrowUp,
    ArrowDown,
    ArrowRight,
    Plus,
    MessageSquare,
    Bell,
    Info,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    TrendingUp,
    Crown,
    Route,
    Hotel,
    Wallet,
    Sun,
    Cloud,
    CloudRain,
    Thermometer,
    Wind,
    Eye,
    Droplets,
    Target,
    Map,
    PartyPopper
} from "lucide-react"

// Dashboard Components
import SmartRecommendationsDashboard from "@/components/dashboard/SmartRecommendationsDashboard"
import ParkDashboard from "@/components/dashboard/ParkDashboard"
import LocationAnalytics from "@/components/dashboard/LocationAnalytics"
import TripOverview from "@/components/dashboard/TripOverview"

// Utility
import { cn } from "@/lib/utils"

// Types
interface DashboardStats {
    totalVisits: number
    upcomingReservations: number
    completedAttractions: number
    totalSpent: number
    averageWaitTime: number
    stepsWalked: number
    photosCapture: number
    magicMoments: number
    friendsConnected: number
    achievementsUnlocked: number
}

interface QuickAction {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    href: string
    color: string
    gradient: string
    isNew?: boolean
    isTrending?: boolean
    isPremium?: boolean
}

interface UpcomingEvent {
    id: string
    title: string
    time: string
    location: string
    type: 'reservation' | 'fastpass' | 'show' | 'event'
    status: 'confirmed' | 'pending' | 'cancelled'
    participants?: number
}

interface Achievement {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    progress: number
    maxProgress: number
    isCompleted: boolean
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    unlockedAt?: Date
}

interface WeatherData {
    current: {
        temperature: number
        condition: string
        humidity: number
        windSpeed: number
        uvIndex: number
        feelsLike: number
    }
    forecast: Array<{
        date: string
        high: number
        low: number
        condition: string
        precipitation: number
    }>
}

// Mock Data
const mockStats: DashboardStats = {
    totalVisits: 12,
    upcomingReservations: 8,
    completedAttractions: 47,
    totalSpent: 2847,
    averageWaitTime: 23,
    stepsWalked: 28547,
    photosCapture: 156,
    magicMoments: 23,
    friendsConnected: 6,
    achievementsUnlocked: 15
}

const quickActions: QuickAction[] = [
    {
        id: 'planning',
        title: 'Trip Planner',
        description: 'Plan your perfect Disney day',
        icon: <Calendar className="h-6 w-6" />,
        href: '/dashboard/planning',
        color: 'bg-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        isTrending: true
    },
    {
        id: 'optimizer',
        title: 'Route Optimizer',
        description: 'Optimize your park route',
        icon: <Route className="h-6 w-6" />,
        href: '/dashboard/optimizer',
        color: 'bg-purple-500',
        gradient: 'from-purple-500 to-pink-500',
        isNew: true
    },
    {
        id: 'dining',
        title: 'Dining Reservations',
        description: 'Find and book restaurants',
        icon: <Utensils className="h-6 w-6" />,
        href: '/dashboard/dining',
        color: 'bg-orange-500',
        gradient: 'from-orange-500 to-red-500'
    },
    {
        id: 'attractions',
        title: 'Wait Times',
        description: 'Live attraction wait times',
        icon: <Clock className="h-6 w-6" />,
        href: '/dashboard/attractions',
        color: 'bg-green-500',
        gradient: 'from-green-500 to-emerald-500'
    },
    {
        id: 'group',
        title: 'Group Planning',
        description: 'Plan with friends & family',
        icon: <Users className="h-6 w-6" />,
        href: '/dashboard/group',
        color: 'bg-indigo-500',
        gradient: 'from-indigo-500 to-blue-500'
    },
    {
        id: 'budget',
        title: 'Budget Tracker',
        description: 'Track vacation expenses',
        icon: <Wallet className="h-6 w-6" />,
        href: '/budget',
        color: 'bg-yellow-500',
        gradient: 'from-yellow-500 to-orange-500'
    },
    {
        id: 'resorts',
        title: 'Resort Hotels',
        description: 'Explore Disney resorts',
        icon: <Hotel className="h-6 w-6" />,
        href: '/dashboard/resorts',
        color: 'bg-teal-500',
        gradient: 'from-teal-500 to-cyan-500'
    },
    {
        id: 'genie',
        title: 'Genie+ Planning',
        description: 'Lightning Lane optimization',
        icon: <Zap className="h-6 w-6" />,
        href: '/dashboard/genie',
        color: 'bg-violet-500',
        gradient: 'from-violet-500 to-purple-500',
        isPremium: true
    }
]

const upcomingEvents: UpcomingEvent[] = [
    {
        id: '1',
        title: "Be Our Guest Restaurant",
        time: "12:30 PM",
        location: "Magic Kingdom",
        type: 'reservation',
        status: 'confirmed',
        participants: 4
    },
    {
        id: '2',
        title: "Space Mountain",
        time: "2:15 PM",
        location: "Magic Kingdom",
        type: 'fastpass',
        status: 'confirmed'
    },
    {
        id: '3',
        title: "Festival of the Lion King",
        time: "4:00 PM",
        location: "Animal Kingdom",
        type: 'show',
        status: 'pending'
    },
    {
        id: '4',
        title: "EPCOT After Hours",
        time: "7:00 PM",
        location: "EPCOT",
        type: 'event',
        status: 'confirmed',
        participants: 2
    }
]

const achievements: Achievement[] = [
    {
        id: '1',
        title: 'First Timer',
        description: 'Complete your first Disney attraction',
        icon: <Star className="h-5 w-5" />,
        progress: 1,
        maxProgress: 1,
        isCompleted: true,
        rarity: 'common',
        unlockedAt: new Date('2024-01-15')
    },
    {
        id: '2',
        title: 'Park Hopper',
        description: 'Visit all 4 Disney World parks in one day',
        icon: <Map className="h-5 w-5" />,
        progress: 3,
        maxProgress: 4,
        isCompleted: false,
        rarity: 'epic'
    },
    {
        id: '3',
        title: 'Magic Collector',
        description: 'Collect 50 Disney pins',
        icon: <Crown className="h-5 w-5" />,
        progress: 32,
        maxProgress: 50,
        isCompleted: false,
        rarity: 'rare'
    },
    {
        id: '4',
        title: 'Legendary Explorer',
        description: 'Experience every attraction at Disney World',
        icon: <Trophy className="h-5 w-5" />,
        progress: 47,
        maxProgress: 200,
        isCompleted: false,
        rarity: 'legendary'
    }
]

const mockWeather: WeatherData = {
    current: {
        temperature: 78,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        uvIndex: 6,
        feelsLike: 82
    },
    forecast: [
        { date: 'Today', high: 82, low: 68, condition: 'Partly Cloudy', precipitation: 20 },
        { date: 'Tomorrow', high: 85, low: 71, condition: 'Sunny', precipitation: 5 },
        { date: 'Wednesday', high: 79, low: 66, condition: 'Thunderstorms', precipitation: 80 },
        { date: 'Thursday', high: 81, low: 69, condition: 'Partly Cloudy', precipitation: 15 },
        { date: 'Friday', high: 84, low: 72, condition: 'Sunny', precipitation: 0 }
    ]
}

// Component Functions
function StatCard({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = "bg-primary/10",
    delay = 0
}: {
    title: string
    value: number | string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: string
    delay?: number
}) {
    return (
        <BlurFade delay={delay}>
            <MagicCard className="p-6 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                                {typeof value === 'number' ? (
                                    <NumberTicker value={value} />
                                ) : (
                                    value
                                )}
                            </p>
                            {trend && trendValue && (
                                <div className={cn(
                                    "flex items-center text-xs font-medium",
                                    trend === 'up' && "text-green-600",
                                    trend === 'down' && "text-red-600",
                                    trend === 'neutral' && "text-muted-foreground"
                                )}>
                                    {trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                                    {trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                                    {trendValue}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={cn("p-3 rounded-lg", color)}>
                        {icon}
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </MagicCard>
        </BlurFade>
    )
}

function QuickActionCard({ action, delay = 0 }: { action: QuickAction; delay?: number }) {
    return (
        <BlurFade delay={delay}>
            <NeonGradientCard className="relative group cursor-pointer overflow-hidden">
                <MagicCard className="h-full border-0 bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-sm">
                    <CardContent className="p-6 relative">
                        {action.isPremium && <Meteors number={10} />}
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                                "p-3 rounded-lg bg-gradient-to-r",
                                action.gradient
                            )}>
                                <div className="text-white">
                                    {action.icon}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {action.isNew && (
                                    <Badge variant="secondary" className="text-xs">
                                        New
                                    </Badge>
                                )}
                                {action.isTrending && (
                                    <Badge variant="outline" className="text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Trending
                                    </Badge>
                                )}
                                {action.isPremium && (
                                    <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Premium
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-4 group-hover:bg-primary/10 transition-colors"
                            asChild
                        >
                            <a href={action.href} className="flex items-center justify-center gap-2">
                                Open
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </Button>
                        {action.isPremium && <BorderBeam size={250} duration={12} delay={9} />}
                    </CardContent>
                </MagicCard>
            </NeonGradientCard>
        </BlurFade>
    )
}

function UpcomingEventCard({ event, delay = 0 }: { event: UpcomingEvent; delay?: number }) {
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'reservation': return <Utensils className="h-4 w-4" />
            case 'fastpass': return <Zap className="h-4 w-4" />
            case 'show': return <Star className="h-4 w-4" />
            case 'event': return <PartyPopper className="h-4 w-4" />
            default: return <Calendar className="h-4 w-4" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
            case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
            case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
        }
    }

    return (
        <BlurFade delay={delay}>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10">
                    {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{event.title}</h4>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(event.status))}>
                            {event.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.time}
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                        </div>
                        {event.participants && (
                            <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.participants}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BlurFade>
    )
}

function AchievementCard({ achievement, delay = 0 }: { achievement: Achievement; delay?: number }) {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-900/50'
            case 'rare': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/50'
            case 'epic': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/50'
            case 'legendary': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/50'
            default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/50'
        }
    }

    const progressPercentage = (achievement.progress / achievement.maxProgress) * 100

    return (
        <BlurFade delay={delay}>
            <MagicCard className={cn("p-6 relative", getRarityColor(achievement.rarity))}>
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-background/80">
                        {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            {achievement.isCompleted && (
                                <Badge variant="default" className="text-xs bg-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complete
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">
                                    {achievement.progress}/{achievement.maxProgress}
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>
                        {achievement.unlockedAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Unlocked {format(achievement.unlockedAt, 'MMM d, yyyy')}
                            </p>
                        )}
                    </div>
                </div>
                {achievement.rarity === 'legendary' && <BorderBeam size={250} duration={15} delay={5} />}
            </MagicCard>
        </BlurFade>
    )
}

function WeatherWidget({ weather }: { weather: WeatherData }) {
    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />
            case 'partly cloudy': return <Cloud className="h-6 w-6 text-gray-500" />
            case 'thunderstorms': return <CloudRain className="h-6 w-6 text-blue-500" />
            default: return <Sun className="h-6 w-6 text-yellow-500" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {getWeatherIcon(weather.current.condition)}
                    Weather
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <div className="text-3xl font-bold">{weather.current.temperature}°F</div>
                    <div className="text-sm text-muted-foreground">{weather.current.condition}</div>
                    <div className="text-xs text-muted-foreground">
                        Feels like {weather.current.feelsLike}°F
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>{weather.current.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <span>{weather.current.windSpeed} mph</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-orange-500" />
                        <span>UV {weather.current.uvIndex}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        <span>{weather.current.feelsLike}°F</span>
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <h4 className="font-medium text-sm">5-Day Forecast</h4>
                    {weather.forecast.map((day, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{day.date}</span>
                            <div className="flex items-center gap-2">
                                {getWeatherIcon(day.condition)}
                                <span>{day.high}°/{day.low}°</span>
                                <span className="text-blue-500">{day.precipitation}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Loading Components
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </div>
        </div>
    )
}

// Main Dashboard Component
export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("overview")
    const [isLoading, setIsLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500)
        return () => clearTimeout(timer)
    }, [])

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const greeting = useMemo(() => {
        const hour = currentTime.getHours()
        if (hour < 12) return "Good morning"
        if (hour < 17) return "Good afternoon"
        return "Good evening"
    }, [currentTime])

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <DashboardSkeleton />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header Section */}
            <BlurFade delay={0.1}>
                <WarpBackground className="relative overflow-hidden">
                    <div className="relative z-10 text-center py-12">
                        <SparklesText className="text-4xl md:text-5xl font-bold mb-4">
                            {greeting}, {'Disney Explorer'}!
                        </SparklesText>
                        <TypingAnimation
                            className="text-xl text-muted-foreground mb-6"
                            text="Welcome to your magical Disney dashboard"
                            duration={50}
                        />
                        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{format(currentTime, 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{format(currentTime, 'h:mm a')}</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Walt Disney World Resort</span>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <ShimmerButton className="bg-gradient-to-r from-blue-500 to-purple-500">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Plan Your Day
                            </ShimmerButton>
                            <RainbowButton>
                                <Zap className="h-4 w-4 mr-2" />
                                Lightning Lane
                            </RainbowButton>
                            <Button variant="outline" className="backdrop-blur-sm">
                                <Camera className="h-4 w-4 mr-2" />
                                PhotoPass
                            </Button>
                        </div>
                    </div>
                </WarpBackground>
            </BlurFade>

            {/* Stats Overview */}
            <section>
                <BlurFade delay={0.2}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        Your Disney Stats
                    </h2>
                </BlurFade>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Visits"
                        value={mockStats.totalVisits}
                        icon={<MapPin className="h-5 w-5" />}
                        trend="up"
                        trendValue="+2 this year"
                        color="bg-blue-500/10"
                        delay={0.3}
                    />
                    <StatCard
                        title="Upcoming Reservations"
                        value={mockStats.upcomingReservations}
                        icon={<Calendar className="h-5 w-5" />}
                        trend="neutral"
                        trendValue="Next: Today 12:30 PM"
                        color="bg-green-500/10"
                        delay={0.35}
                    />
                    <StatCard
                        title="Attractions Completed"
                        value={mockStats.completedAttractions}
                        icon={<Star className="h-5 w-5" />}
                        trend="up"
                        trendValue="+5 this trip"
                        color="bg-purple-500/10"
                        delay={0.4}
                    />
                    <StatCard
                        title="Total Spent"
                        value={`$${mockStats.totalSpent.toLocaleString()}`}
                        icon={<DollarSign className="h-5 w-5" />}
                        trend="up"
                        trendValue="+$247 today"
                        color="bg-orange-500/10"
                        delay={0.45}
                    />
                    <StatCard
                        title="Average Wait Time"
                        value={`${mockStats.averageWaitTime} min`}
                        icon={<Clock className="h-5 w-5" />}
                        trend="down"
                        trendValue="-5 min from yesterday"
                        color="bg-teal-500/10"
                        delay={0.5}
                    />
                    <StatCard
                        title="Steps Walked"
                        value={mockStats.stepsWalked.toLocaleString()}
                        icon={<Footprints className="h-5 w-5" />}
                        trend="up"
                        trendValue="+12,547 today"
                        color="bg-red-500/10"
                        delay={0.55}
                    />
                    <StatCard
                        title="Photos Captured"
                        value={mockStats.photosCapture}
                        icon={<Camera className="h-5 w-5" />}
                        trend="up"
                        trendValue="+23 today"
                        color="bg-pink-500/10"
                        delay={0.6}
                    />
                    <StatCard
                        title="Magic Moments"
                        value={mockStats.magicMoments}
                        icon={<Sparkles className="h-5 w-5" />}
                        trend="up"
                        trendValue="+3 this trip"
                        color="bg-yellow-500/10"
                        delay={0.65}
                    />
                </div>
            </section>

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <BlurFade delay={0.7}>
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="planning" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Planning
                        </TabsTrigger>
                        <TabsTrigger value="live" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Live Data
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Achievements
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                </BlurFade>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                    {/* Quick Actions */}
                    <section>
                        <BlurFade delay={0.1}>
                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Quick Actions
                            </h3>
                        </BlurFade>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <QuickActionCard
                                    key={action.id}
                                    action={action}
                                    delay={0.1 + index * 0.05}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Upcoming Events */}
                        <div className="lg:col-span-2 space-y-6">
                            <BlurFade delay={0.3}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Today&apos;s Schedule
                                        </CardTitle>
                                        <CardDescription>
                                            Your upcoming reservations and plans
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {upcomingEvents.map((event, index) => (
                                            <UpcomingEventCard
                                                key={event.id}
                                                event={event}
                                                delay={0.1 + index * 0.05}
                                            />
                                        ))}
                                        <Button variant="outline" className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Event
                                        </Button>
                                    </CardContent>
                                </Card>
                            </BlurFade>

                            {/* Smart Recommendations */}
                            <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                                <SmartRecommendationsDashboard
                                    vacationId="vacation123"
                                    className="mt-6"
                                />
                            </Suspense>
                        </div>

                        {/* Right Column - Weather & Quick Info */}
                        <div className="space-y-6">
                            <BlurFade delay={0.4}>
                                <WeatherWidget weather={mockWeather} />
                            </BlurFade>

                            <BlurFade delay={0.5}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Your Party
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3 mb-4">
                                            <Avatar>
                                                <AvatarImage src="/avatars/user.jpg" />
                                                <AvatarFallback>
                                                    DE
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">Disney Explorer</p>
                                                <p className="text-sm text-muted-foreground">Trip Leader</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Connected Friends</span>
                                                <span className="font-medium">{mockStats.friendsConnected}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Shared Photos</span>
                                                <span className="font-medium">89</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Group Messages</span>
                                                <span className="font-medium">247</span>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full mt-4">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Open Group Chat
                                        </Button>
                                    </CardContent>
                                </Card>
                            </BlurFade>

                            <BlurFade delay={0.6}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="h-5 w-5" />
                                            Notifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium">Lightning Lane Available</p>
                                                <p className="text-muted-foreground">Space Mountain - 2:15 PM</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium">Reservation Confirmed</p>
                                                <p className="text-muted-foreground">Be Our Guest - 12:30 PM</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium">Weather Alert</p>
                                                <p className="text-muted-foreground">Rain expected at 3 PM</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </BlurFade>
                        </div>
                    </div>
                </TabsContent>

                {/* Planning Tab */}
                <TabsContent value="planning" className="space-y-6">
                    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                        <TripOverview vacationId="vacation123" />
                    </Suspense>
                </TabsContent>

                {/* Live Data Tab */}
                <TabsContent value="live" className="space-y-6">
                    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                        <ParkDashboard />
                    </Suspense>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements" className="space-y-6">
                    <BlurFade delay={0.1}>
                        <div className="text-center py-8">
                            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                            <h2 className="text-2xl font-bold mb-2">Your Disney Achievements</h2>
                            <p className="text-muted-foreground">
                                Track your magical milestones and unlock special rewards
                            </p>
                        </div>
                    </BlurFade>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((achievement, index) => (
                            <AchievementCard
                                key={achievement.id}
                                achievement={achievement}
                                delay={0.1 + index * 0.05}
                            />
                        ))}
                    </div>

                    <BlurFade delay={0.5}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Achievement Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Achievements Unlocked</span>
                                        <span className="font-bold">{mockStats.achievementsUnlocked}/50</span>
                                    </div>
                                    <Progress value={(mockStats.achievementsUnlocked / 50) * 100} />
                                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                                        <div>
                                            <p className="font-bold text-gray-500">Common</p>
                                            <p>8/20</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-blue-500">Rare</p>
                                            <p>5/15</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-500">Epic</p>
                                            <p>2/10</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-yellow-500">Legendary</p>
                                            <p>0/5</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </BlurFade>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
                        <LocationAnalytics vacationId="vacation123" />
                    </Suspense>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <BlurFade delay={0.1}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Dashboard Settings
                                </CardTitle>
                                <CardDescription>
                                    Customize your dashboard experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Notifications</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Wait time alerts</span>
                                                <Button variant="outline" size="sm">Configure</Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Reservation reminders</span>
                                                <Button variant="outline" size="sm">Configure</Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Weather updates</span>
                                                <Button variant="outline" size="sm">Configure</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Display</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Theme</span>
                                                <Button variant="outline" size="sm">Change</Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Language</span>
                                                <Button variant="outline" size="sm">English</Button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Time zone</span>
                                                <Button variant="outline" size="sm">EST</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </BlurFade>
                </TabsContent>
            </Tabs>
        </div>
    )
}