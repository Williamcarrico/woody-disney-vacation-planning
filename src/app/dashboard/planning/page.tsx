"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbLink,
    BreadcrumbPage
} from "@/components/ui/breadcrumb"
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// Components
import ItineraryPlanner from "@/components/itinerary/ItineraryPlanner"
import { ItineraryList } from "@/components/itinerary/ItineraryList"
import VacationCalendar from "@/components/calendar/VacationCalendar"
import VacationParty from "@/components/group/VacationParty"
import TripBudgetTracker from "@/components/budget/TripBudgetTracker"
import { WeatherForecastWidget } from "@/components/weather"
import '@/components/weather/animations.css'
import WaitTimesDashboard from "@/components/attractions/WaitTimesDashboard"
import ParkHoursDisplay from "@/components/parks/ParkHoursDisplay"
import { RecommendationEngine } from "@/components/optimizer/recommendation-engine/recommendation-engine"
import TripOverview from "@/components/dashboard/TripOverview"
import DisneyGeniePlanner from "@/components/planning/DisneyGeniePlanner"
import { Suspense } from "react"

// Icons
import {
    Calendar as CalendarIcon,
    Users,
    DollarSign,
    ListChecks,
    Wand2,
    RefreshCw,
    CloudSun,
    Clock,
    Map,
    Sparkles,
    Smartphone,
    BarChart3,
    LayoutDashboard,
    Zap,
    ClipboardList,
    ChevronRight,
    Star,
    Camera,
    Share2,
    Settings,
    MapPin,
    Moon,
    Minimize,
    Download,
    Plus,
    Minus,
    Check,
    Calendar,
    Target,
    Utensils,
    ArrowUp,
    ArrowDown,
    ChevronDown,
    CloudRain,
    SunIcon,
    Lightbulb
} from "lucide-react"

// Enhanced loading spinner component
const MagicalSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }

    return (
        <div className="relative">
            <motion.div
                className={`${sizeClasses[size]} border-t-primary rounded-full border-primary/20`}
                style={{ borderWidth: '4px' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <motion.div
                className={`absolute inset-0 ${sizeClasses[size]} border-r-yellow-400 rounded-full border-yellow-400/20`}
                style={{ borderWidth: '2px' }}
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
            <motion.div
                className="absolute inset-1/2 w-1 h-1 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
        </div>
    )
}

// Enhanced tab trigger with animations
const AnimatedTabTrigger = ({ value, children, icon: Icon, isActive }: {
    value: string
    children: React.ReactNode
    icon: React.ComponentType<{ className?: string }>
    isActive?: boolean
}) => (
    <TabsTrigger
        value={value}
        className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center group transition-all duration-300 hover:bg-primary/5"
    >
        <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Icon className="h-4 w-4 mr-2 transition-colors group-hover:text-primary" />
            {children}
        </motion.div>
        <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-yellow-400 to-primary"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
                scaleX: isActive ? 1 : 0,
                opacity: isActive ? 1 : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        />
    </TabsTrigger>
)

// Enhanced card component with hover effects
const MagicalCard = ({ children, className = "", ...props }: {
    children: React.ReactNode
    className?: string
} & React.ComponentProps<typeof Card>) => (
    <motion.div
        whileHover={{
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        transition={{ duration: 0.2 }}
    >
        <Card className={`backdrop-blur-sm bg-card/95 border-border/50 ${className}`} {...props}>
            {children}
        </Card>
    </motion.div>
)

// Progress indicator component
const ProgressIndicator = ({ value, label }: {
    value: number
    label: string
}) => (
    <div className="space-y-2">
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}%</span>
        </div>
        <Progress value={value} className="h-2" />
    </div>
)

// Quick action button component
const QuickActionButton = ({ icon: Icon, label, onClick, variant = "outline" }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick: () => void
    variant?: "outline" | "default" | "secondary"
}) => (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
            variant={variant}
            size="sm"
            onClick={onClick}
            className="h-auto py-3 px-4 flex flex-col items-center gap-2 min-w-[80px]"
        >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
        </Button>
    </motion.div>
)

// Stats card component
const StatsCard = ({ icon: Icon, title, value, change, trend }: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    value: string | number
    change?: string
    trend?: "up" | "down" | "neutral"
}) => {
    const trendColors = {
        up: "text-green-600",
        down: "text-red-600",
        neutral: "text-muted-foreground"
    }

    const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus

    return (
        <MagicalCard>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {change && (
                            <div className={`flex items-center text-sm ${trendColors[trend || "neutral"]}`}>
                                <TrendIcon className="h-3 w-3 mr-1" />
                                {change}
                            </div>
                        )}
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </MagicalCard>
    )
}

export default function PlanningDashboardPage({ params }: { readonly params?: { readonly vacationId?: string } }) {
    const vacationId = params?.vacationId || "vacation123"
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [notifications] = useState(3)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isCompactView, setIsCompactView] = useState(false)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [refreshInterval, setRefreshInterval] = useState([30])

    // Scroll-based animations
    const { scrollY } = useScroll()
    const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])
    const headerScale = useTransform(scrollY, [0, 100], [1, 0.98])

    // Default date range for budget tracking
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    // Refresh handler
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsRefreshing(false)
    }, [])

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(handleRefresh, refreshInterval[0] * 1000)
        return () => clearInterval(interval)
    }, [autoRefresh, refreshInterval, handleRefresh])

    // Quick actions
    const quickActions = [
        { icon: Plus, label: "Add Event", onClick: () => setActiveTab("calendar") },
        { icon: MapPin, label: "Find Parks", onClick: () => setActiveTab("wait-times") },
        { icon: Utensils, label: "Book Dining", onClick: () => setActiveTab("wizard") },
        { icon: Camera, label: "Memories", onClick: () => { } },
        { icon: Share2, label: "Share Trip", onClick: () => { } },
        { icon: Download, label: "Export", onClick: () => { } }
    ]

    // Trip stats
    const tripStats = [
        { icon: Calendar, title: "Days Left", value: "12", change: "-1 day", trend: "down" as const },
        { icon: DollarSign, title: "Budget Used", value: "68%", change: "+5%", trend: "up" as const },
        { icon: Clock, title: "Avg Wait", value: "25min", change: "-8min", trend: "down" as const },
        { icon: Star, title: "Satisfaction", value: "4.8", change: "+0.2", trend: "up" as const }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0]
                    }}
                    transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }}
                />
            </div>

            <div className="container py-6 space-y-6 relative z-10">
                <Breadcrumb className="mb-4">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Vacation Planning</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Enhanced Header Section */}
                <motion.div
                    style={{ opacity: headerOpacity, scale: headerScale }}
                    className="relative"
                >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-6">
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
                                    Disney Vacation Planner
                                </h1>
                                <p className="text-lg text-muted-foreground mt-2">
                                    Create magical memories with our AI-powered planning experience
                                </p>
                            </motion.div>

                            {/* Quick Stats */}
                            <motion.div
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                {tripStats.map((stat, index) => (
                                    <motion.div
                                        key={stat.title}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <StatsCard {...stat} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Enhanced Controls */}
                        <motion.div
                            className="flex flex-col gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {/* Settings Panel */}
                            <MagicalCard className="p-4 min-w-[280px]">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold flex items-center">
                                            <Settings className="h-4 w-4 mr-2" />
                                            Quick Settings
                                        </h3>
                                        <Badge variant="outline" className="text-xs">
                                            {notifications} alerts
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm flex items-center">
                                                <Moon className="h-4 w-4 mr-2" />
                                                Dark Mode
                                            </label>
                                            <Switch
                                                checked={isDarkMode}
                                                onCheckedChange={setIsDarkMode}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="text-sm flex items-center">
                                                <Minimize className="h-4 w-4 mr-2" />
                                                Compact View
                                            </label>
                                            <Switch
                                                checked={isCompactView}
                                                onCheckedChange={setIsCompactView}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <label className="text-sm flex items-center">
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Auto Refresh
                                            </label>
                                            <Switch
                                                checked={autoRefresh}
                                                onCheckedChange={setAutoRefresh}
                                            />
                                        </div>

                                        {autoRefresh && (
                                            <div className="space-y-2">
                                                <label className="text-xs text-muted-foreground">
                                                    Refresh Interval: {refreshInterval[0]}s
                                                </label>
                                                <Slider
                                                    value={refreshInterval}
                                                    onValueChange={setRefreshInterval}
                                                    max={120}
                                                    min={10}
                                                    step={10}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </MagicalCard>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-10 px-3"
                                                disabled={isRefreshing}
                                                onClick={handleRefresh}
                                            >
                                                {isRefreshing ? (
                                                    <MagicalSpinner size="sm" />
                                                ) : (
                                                    <RefreshCw className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Refresh all data</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="default" size="sm" className="h-10">
                                            <Smartphone className="h-4 w-4 mr-2" />
                                            Mobile App
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Get Mobile App</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download for iOS
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="h-4 w-4 mr-2" />
                                            Download for Android
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share Trip Link
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions Bar */}
                    <motion.div
                        className="flex flex-wrap gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-lg border"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2 mr-4">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="font-medium">Quick Actions:</span>
                        </div>
                        {quickActions.map((action, index) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            >
                                <QuickActionButton {...action} />
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Trip Overview with enhanced animations */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <Suspense fallback={<TripOverviewSkeleton />}>
                    <TripOverview vacationId={vacationId} />
                </Suspense>
            </motion.div>

            {/* Enhanced Main Dashboard Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
            >
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="border-b sticky top-0 bg-background/95 backdrop-blur-xl z-20 pb-0">
                        <ScrollArea className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b-0 px-0 h-auto overflow-x-auto flex-nowrap bg-transparent">
                                <AnimatedTabTrigger value="dashboard" icon={LayoutDashboard} isActive={activeTab === "dashboard"}>
                                    Overview
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="wizard" icon={Wand2} isActive={activeTab === "wizard"}>
                                    AI Planner
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="calendar" icon={CalendarIcon} isActive={activeTab === "calendar"}>
                                    Calendar
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="itineraries" icon={ListChecks} isActive={activeTab === "itineraries"}>
                                    Itineraries
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="party" icon={Users} isActive={activeTab === "party"}>
                                    Party
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="budget" icon={DollarSign} isActive={activeTab === "budget"}>
                                    Budget
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="wait-times" icon={Clock} isActive={activeTab === "wait-times"}>
                                    Wait Times
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="genie-plus" icon={Zap} isActive={activeTab === "genie-plus"}>
                                    Genie+
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="weather" icon={CloudSun} isActive={activeTab === "weather"}>
                                    Weather
                                </AnimatedTabTrigger>
                                <AnimatedTabTrigger value="optimize" icon={Sparkles} isActive={activeTab === "optimize"}>
                                    AI Optimize
                                </AnimatedTabTrigger>
                            </TabsList>
                        </ScrollArea>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Dashboard Overview Tab */}
                        <TabsContent key="dashboard" value="dashboard" className="space-y-6 mt-0">
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Enhanced Overview Grid */}
                                <div className={`grid gap-6 ${isCompactView ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                                    <MagicalCard>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-medium flex items-center">
                                                <Map className="h-5 w-5 mr-2 text-primary" />
                                                Park Hours
                                                <Badge variant="secondary" className="ml-auto text-xs">Live</Badge>
                                            </CardTitle>
                                            <CardDescription>Today&apos;s operating hours</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                                <ParkHoursDisplay compact />
                                            </Suspense>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="ghost" size="sm" className="w-full justify-between group">
                                                View Complete Schedule
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardFooter>
                                    </MagicalCard>

                                    <MagicalCard>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-medium flex items-center">
                                                <Clock className="h-5 w-5 mr-2 text-primary" />
                                                Wait Times
                                                <Badge variant="secondary" className="ml-auto text-xs">Real-time</Badge>
                                            </CardTitle>
                                            <CardDescription>Popular attractions right now</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                                <WaitTimesDashboard compact />
                                            </Suspense>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="ghost" size="sm" className="w-full justify-between group">
                                                View All Wait Times
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardFooter>
                                    </MagicalCard>

                                    <MagicalCard>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-medium flex items-center">
                                                <CloudSun className="h-5 w-5 mr-2 text-primary" />
                                                Weather Forecast
                                                <Badge variant="secondary" className="ml-auto text-xs">5-day</Badge>
                                            </CardTitle>
                                            <CardDescription>Orlando weather outlook</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                                <WeatherForecastWidget
                                                    location="Orlando, FL"
                                                    units="imperial"
                                                    showForecast={true}
                                                    daysToShow={3}
                                                />
                                            </Suspense>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="ghost" size="sm" className="w-full justify-between group" onClick={() => setActiveTab('weather')}>
                                                View Extended Forecast
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardFooter>
                                    </MagicalCard>
                                </div>

                                {/* Enhanced Main Content Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <MagicalCard>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-medium flex items-center">
                                                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                                                    Your Trip Timeline
                                                    <Badge variant="secondary" className="ml-auto text-xs">Interactive</Badge>
                                                </CardTitle>
                                                <CardDescription>Upcoming activities and reservations</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                                                    <ScrollArea className="h-[350px]">
                                                        <VacationCalendar vacationId={vacationId} view="schedule" />
                                                    </ScrollArea>
                                                </Suspense>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="ghost" size="sm" className="w-full justify-between group" onClick={() => setActiveTab('calendar')}>
                                                    View Full Calendar
                                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </CardFooter>
                                        </MagicalCard>

                                        {/* Progress Tracking */}
                                        <MagicalCard>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-medium flex items-center">
                                                    <Target className="h-5 w-5 mr-2 text-primary" />
                                                    Planning Progress
                                                </CardTitle>
                                                <CardDescription>Complete your vacation setup</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <ProgressIndicator value={85} label="Trip Details" />
                                                <ProgressIndicator value={60} label="Dining Reservations" />
                                                <ProgressIndicator value={40} label="Activity Planning" />
                                                <ProgressIndicator value={90} label="Budget Setup" />
                                            </CardContent>
                                        </MagicalCard>
                                    </div>

                                    <div className="space-y-6">
                                        <MagicalCard>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-medium flex items-center">
                                                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                                                    AI Recommendations
                                                    <Badge variant="secondary" className="ml-auto text-xs">Smart</Badge>
                                                </CardTitle>
                                                <CardDescription>Personalized for your trip</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                                                    <RecommendationEngine
                                                        userPreferences={{ userId: vacationId }}
                                                        allItems={[]}
                                                        maxRecommendations={4}
                                                    />
                                                </Suspense>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="ghost" size="sm" className="w-full justify-between group" onClick={() => setActiveTab('optimize')}>
                                                    View All Recommendations
                                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </Button>
                                            </CardFooter>
                                        </MagicalCard>

                                        <MagicalCard>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-medium flex items-center">
                                                    <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                                                    Next Steps
                                                </CardTitle>
                                                <CardDescription>Complete your planning</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {[
                                                        { task: "Complete your party details", priority: "Essential", completed: false },
                                                        { task: "Add dining reservations", priority: "Recommended", completed: true },
                                                        { task: "Set budget parameters", priority: "Optional", completed: false },
                                                        { task: "Review AI optimized itinerary", priority: "Recommended", completed: false },
                                                        { task: "Download mobile companion", priority: "Optional", completed: false }
                                                    ].map((item, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="flex items-center justify-between py-2 border-b last:border-b-0"
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <motion.div
                                                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                                                                        }`}
                                                                    whileHover={{ scale: 1.1 }}
                                                                >
                                                                    {item.completed && <Check className="h-2 w-2 text-white" />}
                                                                </motion.div>
                                                                <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                                    {item.task}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant={item.priority === "Essential" ? "default" : "outline"}
                                                                className="text-xs"
                                                            >
                                                                {item.priority}
                                                            </Badge>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Planning Checklist
                                                </Button>
                                            </CardFooter>
                                        </MagicalCard>
                                    </div>
                                </div>

                                {/* Enhanced Pro Tip Alert */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <Alert className="bg-gradient-to-r from-primary/10 via-yellow-400/10 to-primary/10 border-primary/20 relative overflow-hidden">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                            animate={{ x: [-100, 400] }}
                                            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 5 }}
                                        />
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <AlertTitle className="text-lg">✨ Pro Tip</AlertTitle>
                                        <AlertDescription className="text-base">
                                            Use our AI Optimization tool to automatically generate the perfect itinerary based on predicted crowd levels, wait times, and your preferences.
                                            <Button variant="link" className="p-0 h-auto ml-2 text-primary" onClick={() => setActiveTab('optimize')}>
                                                Try it now →
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Planning Wizard Tab */}
                        <TabsContent key="wizard" value="wizard" className="space-y-6 mt-0">
                            <motion.div
                                key="wizard"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <ItineraryPlanner />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Calendar Tab */}
                        <TabsContent key="calendar" value="calendar" className="space-y-6 mt-0">
                            <motion.div
                                key="calendar"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <VacationCalendar vacationId={vacationId} />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Itineraries Tab */}
                        <TabsContent key="itineraries" value="itineraries" className="space-y-6 mt-0">
                            <motion.div
                                key="itineraries"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <ItineraryList vacationId={vacationId} onCreateNew={() => { }} />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Party Tab */}
                        <TabsContent key="party" value="party" className="space-y-6 mt-0">
                            <motion.div
                                key="party"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <VacationParty vacationId={vacationId} />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Budget Tab */}
                        <TabsContent key="budget" value="budget" className="space-y-6 mt-0">
                            <motion.div
                                key="budget"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <TripBudgetTracker
                                        vacationId={vacationId}
                                        startDate={startDate}
                                        endDate={endDate}
                                    />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Wait Times Tab */}
                        <TabsContent key="wait-times" value="wait-times" className="space-y-6 mt-0">
                            <motion.div
                                key="wait-times"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <WaitTimesDashboard vacationId={vacationId} />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Genie+ Tab */}
                        <TabsContent key="genie-plus" value="genie-plus" className="space-y-6 mt-0">
                            <motion.div
                                key="genie-plus"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <DisneyGeniePlanner vacationId={vacationId} />
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Weather Tab */}
                        <TabsContent key="weather" value="weather" className="space-y-6 mt-0">
                            <motion.div
                                key="weather"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <MagicalCard>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <CloudSun className="h-5 w-5 mr-2 text-primary" />
                                                    Orlando Weather
                                                </CardTitle>
                                                <CardDescription>Walt Disney World Resort</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <WeatherForecastWidget
                                                    location="Orlando, FL"
                                                    units="imperial"
                                                    daysToShow={5}
                                                    className="w-full"
                                                />
                                            </CardContent>
                                        </MagicalCard>

                                        <MagicalCard>
                                            <CardHeader>
                                                <CardTitle className="flex items-center">
                                                    <CloudSun className="h-5 w-5 mr-2 text-primary" />
                                                    Anaheim Weather
                                                </CardTitle>
                                                <CardDescription>Disneyland Resort</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <WeatherForecastWidget
                                                    location="Anaheim, CA"
                                                    units="imperial"
                                                    daysToShow={5}
                                                    className="w-full"
                                                />
                                            </CardContent>
                                        </MagicalCard>
                                    </div>

                                    {/* Enhanced Weather Tips */}
                                    <MagicalCard>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                                                Weather Planning Tips
                                            </CardTitle>
                                            <CardDescription>Make the most of your Disney vacation regardless of weather</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <motion.div
                                                    className="space-y-3"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <div className="flex items-center">
                                                        <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
                                                        <h3 className="text-lg font-medium">Rainy Day Tips</h3>
                                                    </div>
                                                    <ul className="space-y-2 text-muted-foreground">
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Pack ponchos instead of umbrellas
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Wear waterproof shoes
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Plan indoor attractions
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Lines are typically shorter on rainy days
                                                        </li>
                                                    </ul>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-3"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="flex items-center">
                                                        <SunIcon className="h-5 w-5 mr-2 text-orange-500" />
                                                        <h3 className="text-lg font-medium">Hot Weather Tips</h3>
                                                    </div>
                                                    <ul className="space-y-2 text-muted-foreground">
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Stay hydrated with water bottles
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Take afternoon breaks during peak heat
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Use cooling towels and hats
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Schedule water rides for hot afternoons
                                                        </li>
                                                    </ul>
                                                </motion.div>

                                                <motion.div
                                                    className="space-y-3"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="flex items-center">
                                                        <Smartphone className="h-5 w-5 mr-2 text-primary" />
                                                        <h3 className="text-lg font-medium">Weather Resources</h3>
                                                    </div>
                                                    <ul className="space-y-2 text-muted-foreground">
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Check real-time radar in our app
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Set weather alerts for your trip
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Download our mobile app for updates
                                                        </li>
                                                        <li className="flex items-start">
                                                            <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                                                            Check ride closures during storms
                                                        </li>
                                                    </ul>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </MagicalCard>
                                </Suspense>
                            </motion.div>
                        </TabsContent>

                        {/* Enhanced Optimize Tab */}
                        <TabsContent key="optimize" value="optimize" className="space-y-6 mt-0">
                            <motion.div
                                key="optimize"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Suspense fallback={
                                    <div className="h-64 flex items-center justify-center">
                                        <MagicalSpinner size="lg" />
                                    </div>
                                }>
                                    <RecommendationEngine
                                        userPreferences={{ userId: vacationId }}
                                        allItems={[]}
                                    />
                                </Suspense>
                            </motion.div>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </motion.div>
        </div>
    )
}

// Enhanced skeleton component for the Trip Overview
function TripOverviewSkeleton() {
    return (
        <motion.div
            className="w-full p-6 border rounded-lg bg-card/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Skeleton className="h-20 w-full rounded-lg" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}