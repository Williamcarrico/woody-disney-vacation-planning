"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Home, Calendar, Activity, Trophy, PieChart, Settings,
    Sparkles, Clock, MapPin, Star
} from "lucide-react"

// Dashboard Components
import SmartRecommendationsDashboard from "@/components/dashboard/SmartRecommendationsDashboard"
import ParkDashboard from "@/components/dashboard/ParkDashboard"
import LocationAnalytics from "@/components/dashboard/LocationAnalytics"
import TripOverview from "@/components/dashboard/TripOverview"

// Loading States
import { DashboardContentSkeleton } from "@/components/dashboard/DashboardSkeleton"

// Types
interface DashboardContentProps {
    userId: string
    initialTab?: string
    vacations?: any[]
    currentVacation?: any
    achievements?: any[]
}

export default function DashboardContent({
    userId,
    initialTab = "overview",
    vacations = [],
    currentVacation,
    achievements = []
}: DashboardContentProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState(initialTab)

    // Update URL when tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        router.push(`/dashboard?${params.toString()}`, { scroll: false })
    }

    // Sync tab with URL
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab')
        if (tabFromUrl && tabFromUrl !== activeTab) {
            setActiveTab(tabFromUrl)
        }
    }, [searchParams])

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="planning" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Planning</span>
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Live</span>
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="hidden sm:inline">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <PieChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6">
                    {/* Current Trip Summary */}
                    {currentVacation ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        Current Trip
                                    </span>
                                    <Badge variant="default">Active</Badge>
                                </CardTitle>
                                <CardDescription>
                                    {currentVacation.name}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {new Date(currentVacation.startDate).toLocaleDateString()} -
                                            {new Date(currentVacation.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {currentVacation.resort && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{currentVacation.resort}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {currentVacation.partySize || 1} Guests
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Active Trip</CardTitle>
                                <CardDescription>
                                    Start planning your magical Disney vacation today!
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Create a new vacation to unlock personalized recommendations,
                                    group planning features, and real-time updates.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Smart Recommendations */}
                    <Suspense fallback={<DashboardContentSkeleton />}>
                        <SmartRecommendationsDashboard
                            vacationId={currentVacation?.id || "default"}
                        />
                    </Suspense>
                </div>
            </TabsContent>

            {/* Planning Tab */}
            <TabsContent value="planning" className="space-y-6">
                <Suspense fallback={<DashboardContentSkeleton />}>
                    <TripOverview vacationId={currentVacation?.id || "default"} />
                </Suspense>
            </TabsContent>

            {/* Live Data Tab */}
            <TabsContent value="live" className="space-y-6">
                <Suspense fallback={<DashboardContentSkeleton />}>
                    <ParkDashboard />
                </Suspense>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            Your Achievements
                        </CardTitle>
                        <CardDescription>
                            Unlock magical milestones and earn rewards
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {achievements.length > 0 ? (
                            <div className="grid gap-4">
                                {achievements.map((achievement: any) => (
                                    <div key={achievement.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <Trophy className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{achievement.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {achievement.description}
                                            </p>
                                        </div>
                                        {achievement.isCompleted && (
                                            <Badge variant="default">Completed</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Start exploring to unlock achievements!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
                <Suspense fallback={<DashboardContentSkeleton />}>
                    <LocationAnalytics vacationId={currentVacation?.id || "default"} />
                </Suspense>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Settings</CardTitle>
                        <CardDescription>
                            Customize your dashboard experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Settings content coming soon...
                        </p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}