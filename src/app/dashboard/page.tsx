import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/firebase/auth-session-server"
import { firebaseDataManager } from "@/lib/firebase/firebase-data-manager"
import { Metadata } from "next"

// Server Components
import DashboardHeader from "@/components/dashboard/DashboardHeader"
import DashboardStats from "@/components/dashboard/DashboardStats"
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid"
import DashboardContent from "@/components/dashboard/DashboardContent"
import WeatherWidget from "@/components/dashboard/WeatherWidget"
import UpcomingEvents from "@/components/dashboard/UpcomingEvents"
import PartyOverview from "@/components/dashboard/PartyOverview"
import NotificationsPanel from "@/components/dashboard/NotificationsPanel"
import AchievementsOverview from "@/components/dashboard/AchievementsOverview"
import RecentActivity from "@/components/dashboard/RecentActivity"
import ParkRecommendations from "@/components/dashboard/ParkRecommendations"

// Client Components
import DashboardClientWrapper from "@/components/dashboard/DashboardClientWrapper"

// Loading Components
import {
    DashboardHeaderSkeleton,
    DashboardStatsSkeleton,
    QuickActionsSkeleton,
    DashboardContentSkeleton,
    WeatherSkeleton,
    EventsSkeleton,
    PartySkeleton
} from "@/components/dashboard/DashboardSkeleton"

// Error Boundary
import { DashboardErrorBoundary } from "@/components/dashboard/ErrorBoundary"

// Firebase Types
import { FirebaseUser, FirebaseVacation } from "@/lib/firebase/collections"

// Types
export interface DashboardPageProps {
    searchParams?: { [key: string]: string | string[] | undefined }
}

// Type definitions for API responses
interface WeatherData {
    data: {
        values: {
            temperature: number
            weatherCode: number
            humidity: number
            windSpeed: number
        }
    }
}

interface UserStats {
    totalVacations: number
    totalItineraries: number
    accountAge: number
    totalSpent: number
    favoriteDestination: string
}

interface EventData {
    id: string
    title: string
    date: string
    type: string
    location?: string
}

interface Achievement {
    id: string
    title: string
    description: string
    unlocked: boolean
    unlockedAt?: string
}

interface UserData {
    user: FirebaseUser | null
    vacations: FirebaseVacation[]
    currentVacation: FirebaseVacation | null
    activitySummary: {
        totalSpent: number
        favoriteDestination: string
        totalParkDays: number
        totalActivities: number
        averageVacationLength: number
        mostRecentActivity: Date | null
    } | null
}

// Helper function to convert Firebase Timestamp to string
function convertVacationDates(vacation: FirebaseVacation | null): {
    id: string
    name: string
    startDate: string
    endDate: string
    resort?: string
} | null {
    if (!vacation) return null

    return {
        id: vacation.id,
        name: vacation.name,
        startDate: vacation.startDate.toDate().toISOString(),
        endDate: vacation.endDate.toDate().toISOString(),
        resort: vacation.accommodations?.resortName
    }
}

export const metadata: Metadata = {
    title: "Dashboard | Disney Vacation Planner",
    description: "Your personalized Disney vacation dashboard with real-time updates, trip planning tools, and magical experiences.",
    openGraph: {
        title: "Disney Vacation Dashboard",
        description: "Plan your perfect Disney vacation with real-time updates and personalized recommendations",
        images: ["/images/dashboard-preview.png"]
    },
    keywords: ["Disney", "vacation", "dashboard", "planning", "Walt Disney World", "trip planner"]
}

// Enable dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

// Server-side data fetching functions
async function getUserData(userId: string): Promise<UserData> {
    try {
        const [user, vacations, currentVacation, activitySummary] = await Promise.all([
            firebaseDataManager.users.getUserById(userId),
            firebaseDataManager.vacations.getVacationsByUserId(userId),
            firebaseDataManager.vacations.getCurrentVacation(userId),
            firebaseDataManager.getUserActivitySummary(userId)
        ])

        return {
            user,
            vacations: vacations.vacations || [],
            currentVacation,
            activitySummary
        }
    } catch (error) {
        console.error("Error fetching user data:", error)
        return {
            user: null,
            vacations: [],
            currentVacation: null,
            activitySummary: null
        }
    }
}

async function getWeatherData(): Promise<WeatherData | null> {
    try {
        // Fetch weather for Walt Disney World location
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/weather/realtime?location=Orlando,FL`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!response.ok) throw new Error('Failed to fetch weather')

        const data = await response.json() as WeatherData
        return data
    } catch (error) {
        console.error("Error fetching weather:", error)
        return null
    }
}

async function getUserStats(userId: string): Promise<UserStats | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/stats?userId=${userId}`, {
            next: { revalidate: 300 }, // Cache for 5 minutes
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch stats')

        const data = await response.json() as UserStats
        return data
    } catch (error) {
        console.error("Error fetching user stats:", error)
        return null
    }
}

async function getUpcomingEvents(userId: string): Promise<EventData[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/events?userId=${userId}&upcoming=true&limit=10`, {
            next: { revalidate: 180 }, // Cache for 3 minutes
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch events')

        const data = await response.json() as EventData[]
        return data
    } catch (error) {
        console.error("Error fetching events:", error)
        return []
    }
}

async function getAchievements(userId: string): Promise<Achievement[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/achievements?userId=${userId}`, {
            next: { revalidate: 600 }, // Cache for 10 minutes
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch achievements')

        const data = await response.json() as Achievement[]
        return data
    } catch (error) {
        console.error("Error fetching achievements:", error)
        return []
    }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    // Get authenticated user
    const user = await getCurrentUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch all data in parallel with proper typing
    const [userData, weatherData, statsData, eventsData, achievementsData]: [
        UserData,
        WeatherData | null,
        UserStats | null,
        EventData[],
        Achievement[]
    ] = await Promise.all([
        getUserData(user.uid),
        getWeatherData(),
        getUserStats(user.uid),
        getUpcomingEvents(user.uid),
        getAchievements(user.uid)
    ])

    // Extract active tab from search params
    const activeTab = (searchParams?.tab && typeof searchParams.tab === 'string')
        ? searchParams.tab
        : 'overview'

    // Convert vacation dates for component compatibility
    const convertedCurrentVacation = convertVacationDates(userData.currentVacation)

    return (
        <DashboardErrorBoundary>
            <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
                {/* Dashboard Header with greeting, time, and quick stats */}
                <Suspense fallback={<DashboardHeaderSkeleton />}>
                    <DashboardHeader
                        userId={user.uid}
                        userEmail={user.email || ''}
                        userName={userData.user?.displayName || 'Explorer'}
                        currentVacation={convertedCurrentVacation}
                    />
                </Suspense>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
                    {/* Stats Overview Grid */}
                    <Suspense fallback={<DashboardStatsSkeleton />}>
                        <DashboardStats
                            userId={user.uid}
                            initialStats={statsData}
                            activitySummary={userData.activitySummary}
                        />
                    </Suspense>

                    {/* Quick Actions Grid */}
                    <Suspense fallback={<QuickActionsSkeleton />}>
                        <QuickActionsGrid
                            userId={user.uid}
                            hasActiveVacation={!!userData.currentVacation}
                            vacationId={userData.currentVacation?.id}
                        />
                    </Suspense>

                    {/* Main Content Area with Tabs */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (2/3 width on large screens) */}
                        <div className="lg:col-span-2">
                            <Suspense fallback={<DashboardContentSkeleton />}>
                                <DashboardContent
                                    userId={user.uid}
                                    initialTab={activeTab}
                                    vacations={userData.vacations}
                                    currentVacation={userData.currentVacation}
                                    achievements={achievementsData}
                                />
                            </Suspense>
                        </div>

                        {/* Sidebar (1/3 width on large screens) */}
                        <div className="space-y-6">
                            {/* Weather Widget */}
                            <Suspense fallback={<WeatherSkeleton />}>
                                <WeatherWidget weatherData={weatherData} />
                            </Suspense>

                            {/* Upcoming Events */}
                            <Suspense fallback={<EventsSkeleton />}>
                                <UpcomingEvents
                                    userId={user.uid}
                                    initialEvents={eventsData}
                                />
                            </Suspense>

                            {/* Party Overview */}
                            <Suspense fallback={<PartySkeleton />}>
                                <PartyOverview
                                    userId={user.uid}
                                    currentVacation={userData.currentVacation}
                                />
                            </Suspense>

                            {/* Notifications Panel */}
                            <NotificationsPanel userId={user.uid} />

                            {/* Recent Activity Feed */}
                            <RecentActivity userId={user.uid} />

                            {/* Park Recommendations */}
                            <ParkRecommendations
                                userId={user.uid}
                                weatherData={weatherData}
                            />
                        </div>
                    </div>

                    {/* Achievements Overview Section */}
                    <Suspense fallback={<DashboardContentSkeleton />}>
                        <AchievementsOverview
                            userId={user.uid}
                            achievements={achievementsData}
                        />
                    </Suspense>
                </div>

                {/* Client-side wrapper for real-time updates and interactions */}
                <DashboardClientWrapper
                    userId={user.uid}
                    currentVacation={userData.currentVacation}
                />
            </div>
        </DashboardErrorBoundary>
    )
}