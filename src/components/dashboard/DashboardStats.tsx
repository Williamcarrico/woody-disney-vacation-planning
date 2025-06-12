import {
    MapPin, Calendar, Star, DollarSign, Clock, Footprints,
    Camera, Sparkles, ArrowUp, ArrowDown, TrendingUp,
    Zap, Users, Trophy, Activity
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Magic UI Components
import { MagicCard } from "@/components/magicui/magic-card"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { BlurFade } from "@/components/magicui/blur-fade"

// Utils
import { cn } from "@/lib/utils"

interface DashboardStatsProps {
    userId: string
    initialStats?: any
    activitySummary?: any
}

interface StatCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: string
    delay?: number
    prefix?: string
    suffix?: string
}

function StatCard({
    title,
    value,
    icon,
    trend,
    trendValue,
    color = "bg-primary/10",
    delay = 0,
    prefix = "",
    suffix = ""
}: StatCardProps) {
    return (
        <BlurFade delay={delay}>
            <MagicCard className="p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold">
                                {prefix}
                                {typeof value === 'number' ? (
                                    <NumberTicker value={value} />
                                ) : (
                                    value
                                )}
                                {suffix}
                            </p>
                            {trend && trendValue && (
                                <div className={cn(
                                    "flex items-center text-xs font-medium px-2 py-1 rounded-full",
                                    trend === 'up' && "text-green-600 bg-green-100 dark:bg-green-900/30",
                                    trend === 'down' && "text-red-600 bg-red-100 dark:bg-red-900/30",
                                    trend === 'neutral' && "text-muted-foreground bg-muted"
                                )}>
                                    {trend === 'up' && <ArrowUp className="h-3 w-3 mr-1" />}
                                    {trend === 'down' && <ArrowDown className="h-3 w-3 mr-1" />}
                                    {trend === 'neutral' && <TrendingUp className="h-3 w-3 mr-1" />}
                                    {trendValue}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={cn(
                        "p-3 rounded-lg transition-transform group-hover:scale-110",
                        color
                    )}>
                        {icon}
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </MagicCard>
        </BlurFade>
    )
}

async function fetchLatestStats(userId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/user/stats?userId=${userId}`,
            {
                next: { revalidate: 300 }, // Cache for 5 minutes
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch stats:', response.status)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching latest stats:', error)
        return null
    }
}

export default async function DashboardStats({
    userId,
    initialStats,
    activitySummary
}: DashboardStatsProps) {
    // Fetch fresh stats or use initial stats
    const stats = await fetchLatestStats(userId) || initialStats || {
        totalVisits: 0,
        upcomingReservations: 0,
        completedAttractions: 0,
        totalSpent: 0,
        averageWaitTime: 0,
        stepsWalked: 0,
        photosCapture: 0,
        magicMoments: 0,
        friendsConnected: 0,
        achievementsUnlocked: 0,
        budgetRemaining: 0,
        fastPassesUsed: 0,
        currentParkCapacity: 0,
        favoriteAttraction: "No visits yet"
    }

    // Calculate trends based on activitySummary if available
    const trends = {
        visits: activitySummary?.recentParkDays > 0 ? 'up' : 'neutral',
        visitsValue: activitySummary?.recentParkDays ? `+${activitySummary.recentParkDays} this month` : "No recent visits",

        attractions: stats.completedAttractions > 5 ? 'up' : 'neutral',
        attractionsValue: stats.completedAttractions > 0 ? `${stats.completedAttractions} today` : "Start exploring!",

        spending: stats.totalSpent > 100 ? 'up' : 'neutral',
        spendingValue: stats.totalSpent > 0 ? `$${stats.totalSpent.toFixed(2)} today` : "Track expenses",

        waitTime: stats.averageWaitTime < 30 ? 'down' : stats.averageWaitTime > 45 ? 'up' : 'neutral',
        waitTimeValue: stats.averageWaitTime > 0 ? `${stats.averageWaitTime} min avg` : "No waits yet",

        steps: stats.stepsWalked > 10000 ? 'up' : 'neutral',
        stepsValue: stats.stepsWalked > 0 ? `${(stats.stepsWalked / 1000).toFixed(1)}k today` : "Start walking!",

        photos: stats.photosCapture > 0 ? 'up' : 'neutral',
        photosValue: stats.photosCapture > 0 ? `+${stats.photosCapture} today` : "Capture memories",

        moments: stats.magicMoments > 0 ? 'up' : 'neutral',
        momentsValue: stats.magicMoments > 0 ? `+${stats.magicMoments} new` : "Make magic",

        capacity: stats.currentParkCapacity > 70 ? 'up' : stats.currentParkCapacity < 40 ? 'down' : 'neutral',
        capacityValue: `${stats.currentParkCapacity}% full`
    }

    return (
        <section className="space-y-6">
            <BlurFade delay={0.2}>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Your Disney Stats
                    </h2>
                    <Badge variant="outline" className="text-xs">
                        Live Updates
                    </Badge>
                </div>
            </BlurFade>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Park Visits"
                    value={stats.totalVisits}
                    icon={<MapPin className="h-5 w-5" />}
                    trend={trends.visits}
                    trendValue={trends.visitsValue}
                    color="bg-blue-500/10"
                    delay={0.3}
                />

                <StatCard
                    title="Upcoming Reservations"
                    value={stats.upcomingReservations}
                    icon={<Calendar className="h-5 w-5" />}
                    trend="neutral"
                    trendValue={stats.upcomingReservations > 0 ? "View all" : "Book now"}
                    color="bg-green-500/10"
                    delay={0.35}
                />

                <StatCard
                    title="Attractions Today"
                    value={stats.completedAttractions}
                    icon={<Star className="h-5 w-5" />}
                    trend={trends.attractions}
                    trendValue={trends.attractionsValue}
                    color="bg-purple-500/10"
                    delay={0.4}
                />

                <StatCard
                    title="Budget Remaining"
                    value={stats.budgetRemaining.toLocaleString()}
                    icon={<DollarSign className="h-5 w-5" />}
                    trend={trends.spending}
                    trendValue={trends.spendingValue}
                    prefix="$"
                    color="bg-orange-500/10"
                    delay={0.45}
                />

                <StatCard
                    title="Average Wait Time"
                    value={stats.averageWaitTime}
                    icon={<Clock className="h-5 w-5" />}
                    trend={trends.waitTime}
                    trendValue={trends.waitTimeValue}
                    suffix=" min"
                    color="bg-teal-500/10"
                    delay={0.5}
                />

                <StatCard
                    title="Steps Walked"
                    value={stats.stepsWalked.toLocaleString()}
                    icon={<Footprints className="h-5 w-5" />}
                    trend={trends.steps}
                    trendValue={trends.stepsValue}
                    color="bg-red-500/10"
                    delay={0.55}
                />

                <StatCard
                    title="Photos Captured"
                    value={stats.photosCapture}
                    icon={<Camera className="h-5 w-5" />}
                    trend={trends.photos}
                    trendValue={trends.photosValue}
                    color="bg-pink-500/10"
                    delay={0.6}
                />

                <StatCard
                    title="Magic Moments"
                    value={stats.magicMoments}
                    icon={<Sparkles className="h-5 w-5" />}
                    trend={trends.moments}
                    trendValue={trends.momentsValue}
                    color="bg-yellow-500/10"
                    delay={0.65}
                />

                <StatCard
                    title="Lightning Lanes Used"
                    value={stats.fastPassesUsed}
                    icon={<Zap className="h-5 w-5" />}
                    trend="neutral"
                    trendValue="Book more"
                    color="bg-violet-500/10"
                    delay={0.7}
                />

                <StatCard
                    title="Friends Connected"
                    value={stats.friendsConnected}
                    icon={<Users className="h-5 w-5" />}
                    trend="neutral"
                    trendValue="Invite friends"
                    color="bg-indigo-500/10"
                    delay={0.75}
                />

                <StatCard
                    title="Achievements"
                    value={stats.achievementsUnlocked}
                    icon={<Trophy className="h-5 w-5" />}
                    trend={stats.achievementsUnlocked > 0 ? 'up' : 'neutral'}
                    trendValue="View all"
                    color="bg-amber-500/10"
                    delay={0.8}
                />

                <StatCard
                    title="Park Capacity"
                    value={stats.currentParkCapacity}
                    icon={<Activity className="h-5 w-5" />}
                    trend={trends.capacity}
                    trendValue={trends.capacityValue}
                    suffix="%"
                    color="bg-cyan-500/10"
                    delay={0.85}
                />
            </div>

            {stats.favoriteAttraction && stats.favoriteAttraction !== "No visits yet" && (
                <BlurFade delay={0.9}>
                    <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        Your Favorite Attraction
                                    </p>
                                    <p className="text-xl font-bold flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        {stats.favoriteAttraction}
                                    </p>
                                </div>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                    Most Visited
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </BlurFade>
            )}
        </section>
    )
}