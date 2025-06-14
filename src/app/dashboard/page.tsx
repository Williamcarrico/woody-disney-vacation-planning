import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/firebase/auth-session-server"
import { firebaseDataManager } from "@/lib/firebase/firebase-data-manager"
import { Metadata } from "next"

// Enhanced Disney-themed components
import EnhancedDashboardHeader from "@/components/dashboard/enhanced/EnhancedDashboardHeader"
import MagicalStatsGrid from "@/components/dashboard/enhanced/MagicalStatsGrid"
import DisneyQuickActions from "@/components/dashboard/enhanced/DisneyQuickActions"
import {
    ImmersiveWeatherWidget,
    DisneyEventsCalendar,
    MagicalAchievements,
    EnchantedVacationOverview,
    DisneyParkRecommendations,
    MagicalNotifications,
    DisneyActivityFeed,
    FloatingMagicElements,
    DisneyCountdownTimer,
    InteractiveParkMap,
    MagicalPersonalizedDashboard
} from "@/components/dashboard/enhanced/placeholder-components"

// Loading Components
import {
    EnhancedDashboardSkeleton,
    MagicalStatsSkeleton,
    DisneyActionsSkeleton,
    ImmersiveWeatherSkeleton,
    DisneyEventsSkeleton,
    MagicalAchievementsSkeleton
} from "@/components/dashboard/enhanced/DisneySkeletons"

// Error Boundary
import { DisneyErrorBoundary } from "@/components/dashboard/enhanced/DisneyErrorBoundary"

// Firebase Types
import { FirebaseUser, FirebaseVacation } from "@/lib/firebase/collections"

// Types
export interface DashboardPageProps {
    searchParams?: { [key: string]: string | string[] | undefined }
}

// Enhanced type definitions with Disney theming
interface WeatherData {
    data: {
        values: {
            temperature: number
            weatherCode: number
            humidity: number
            windSpeed: number
            cloudCover?: number
            precipitationProbability?: number
            uvIndex?: number
            visibility?: number
        }
    }
}

interface EnhancedUserStats {
    totalVacations: number
    totalItineraries: number
    accountAge: number
    totalSpent: number
    favoriteDestination: string
    magicalMoments: number
    daysUntilNextTrip: number
    favoritePark: string
    totalAttractionsExperienced: number
    disneyMilesEarned: number
    totalPhotosShared: number
    favoriteCharacter: string
    totalMagicalHours: number
}

interface DisneyEventData {
    id: string
    title: string
    date: string
    type: 'fastpass' | 'dining' | 'show' | 'parade' | 'fireworks' | 'meet-greet' | 'special-event'
    location?: string
    parkId?: string
    icon?: string
    magicalLevel?: 'standard' | 'premium' | 'magical' | 'legendary'
    countdown?: string
    reminderSet?: boolean
}

interface MagicalAchievement {
    id: string
    title: string
    description: string
    unlocked: boolean
    unlockedAt?: string
    category: 'explorer' | 'planner' | 'adventurer' | 'collector' | 'socializer' | 'master'
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    progress?: number
    maxProgress?: number
    magicalReward?: string
    sparkleEffect?: boolean
}

interface EnhancedUserData {
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
        magicalMoments: number
        totalPhotosShared: number
        favoritePark: string
        totalAttractionsExperienced: number
        disneyMilesEarned: number
        totalMagicalHours: number
    } | null
    personalizedRecommendations?: {
        suggestedPark: string
        recommendedTime: string
        magicalTip: string
        weatherBasedSuggestion: string
    }
}

// Helper function to convert Firebase Timestamp to string
function convertVacationDates(vacation: FirebaseVacation | null): {
    id: string
    name: string
    startDate: string
    endDate: string
    resort?: string
    daysUntilTrip?: number
    magicalLevel?: 'standard' | 'premium' | 'deluxe' | 'grand'
} | null {
    if (!vacation) return null

    const startDate = vacation.startDate.toDate()
    const now = new Date()
    const daysUntilTrip = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return {
        id: vacation.id,
        name: vacation.name,
        startDate: startDate.toISOString(),
        endDate: vacation.endDate.toDate().toISOString(),
        resort: vacation.accommodations?.resortName,
        daysUntilTrip: daysUntilTrip > 0 ? daysUntilTrip : 0,
        magicalLevel: vacation.accommodations?.roomType === 'Deluxe Villa' ? 'grand' : 
                     vacation.accommodations?.roomType === 'Deluxe' ? 'deluxe' : 
                     vacation.accommodations?.roomType === 'Moderate' ? 'premium' : 'standard'
    }
}

export const metadata: Metadata = {
    title: "WaltWise - Your Magical Disney Dashboard",
    description: "Experience the magic of Disney vacation planning with your personalized dashboard featuring real-time updates, magical insights, and enchanted trip planning tools.",
    openGraph: {
        title: "WaltWise - Magical Disney Dashboard",
        description: "Plan your perfect Disney vacation with magical insights, real-time updates, and enchanted recommendations",
        images: ["/images/magical-dashboard-preview.png"]
    },
    keywords: ["Disney", "vacation", "dashboard", "WaltWise", "magical", "planning", "Walt Disney World", "Disneyland", "trip planner", "magical experience"]
}

// Enable dynamic rendering for real-time magical updates
export const dynamic = 'force-dynamic'

// Enhanced server-side data fetching with Disney magic
async function getEnhancedUserData(userId: string): Promise<EnhancedUserData> {
    try {
        const [user, vacations, currentVacation, activitySummary] = await Promise.all([
            firebaseDataManager.users.getUserById(userId),
            firebaseDataManager.vacations.getVacationsByUserId(userId),
            firebaseDataManager.vacations.getCurrentVacation(userId),
            firebaseDataManager.getUserActivitySummary(userId)
        ])

        // Generate personalized recommendations based on user data
        const personalizedRecommendations = await generatePersonalizedRecommendations(userId, activitySummary)

        return {
            user,
            vacations: vacations.vacations || [],
            currentVacation,
            activitySummary: activitySummary ? {
                ...activitySummary,
                magicalMoments: Math.floor(Math.random() * 50) + 20, // Simulated magical moments
                totalPhotosShared: Math.floor(Math.random() * 200) + 50,
                favoritePark: 'Magic Kingdom', // This would come from actual data
                totalAttractionsExperienced: Math.floor(Math.random() * 150) + 25,
                disneyMilesEarned: Math.floor(Math.random() * 10000) + 1000,
                totalMagicalHours: Math.floor(Math.random() * 500) + 100
            } : null,
            personalizedRecommendations
        }
    } catch (error) {
        console.error("Error fetching enhanced user data:", error)
        return {
            user: null,
            vacations: [],
            currentVacation: null,
            activitySummary: null
        }
    }
}

async function generatePersonalizedRecommendations(userId: string, activitySummary: any) {
    // This would be enhanced with AI/ML in production
    const recommendations = {
        suggestedPark: "Magic Kingdom",
        recommendedTime: "Early Morning (8:00 AM)",
        magicalTip: "Visit during Extra Magic Hours for shorter wait times!",
        weatherBasedSuggestion: "Perfect weather for outdoor attractions today!"
    }
    return recommendations
}

async function getEnhancedWeatherData(): Promise<WeatherData | null> {
    try {
        // Enhanced weather data with more details for Disney theming
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/weather/realtime?location=Orlando,FL&enhanced=true`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!response.ok) throw new Error('Failed to fetch weather')

        const data = await response.json() as WeatherData
        return data
    } catch (error) {
        console.error("Error fetching enhanced weather:", error)
        return null
    }
}

async function getEnhancedUserStats(userId: string): Promise<EnhancedUserStats | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/stats?userId=${userId}&enhanced=true`, {
            next: { revalidate: 300 },
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch enhanced stats')

        const data = await response.json() as EnhancedUserStats
        return data
    } catch (error) {
        console.error("Error fetching enhanced user stats:", error)
        return null
    }
}

async function getDisneyEvents(userId: string): Promise<DisneyEventData[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/events?userId=${userId}&upcoming=true&limit=10&disneyThemed=true`, {
            next: { revalidate: 180 },
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch Disney events')

        const data = await response.json() as DisneyEventData[]
        return data
    } catch (error) {
        console.error("Error fetching Disney events:", error)
        return []
    }
}

async function getMagicalAchievements(userId: string): Promise<MagicalAchievement[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/achievements?userId=${userId}&magical=true`, {
            next: { revalidate: 600 },
            headers: {
                'Cookie': `session=${await getCurrentUser().then(u => u?.decodedClaims?.session || '')}`
            }
        })

        if (!response.ok) throw new Error('Failed to fetch magical achievements')

        const data = await response.json() as MagicalAchievement[]
        return data
    } catch (error) {
        console.error("Error fetching magical achievements:", error)
        return []
    }
}

export default async function EnhancedDashboardPage({ searchParams }: DashboardPageProps) {
    // Get authenticated user
    const user = await getCurrentUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch all enhanced data in parallel
    const [userData, weatherData, statsData, eventsData, achievementsData]: [
        EnhancedUserData,
        WeatherData | null,
        EnhancedUserStats | null,
        DisneyEventData[],
        MagicalAchievement[]
    ] = await Promise.all([
        getEnhancedUserData(user.uid),
        getEnhancedWeatherData(),
        getEnhancedUserStats(user.uid),
        getDisneyEvents(user.uid),
        getMagicalAchievements(user.uid)
    ])

    // Extract active tab from search params
    const activeTab = (searchParams?.tab && typeof searchParams.tab === 'string')
        ? searchParams.tab
        : 'magical-overview'

    // Convert vacation dates for enhanced component compatibility
    const convertedCurrentVacation = convertVacationDates(userData.currentVacation)

    return (
        <DisneyErrorBoundary>
            {/* Enhanced Background with Disney Magic */}
            <div className="min-h-screen relative overflow-hidden">
                {/* Magical Background Layers */}
                <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 opacity-95" />
                <div className="fixed inset-0 bg-[url('/images/disney-castle-silhouette.svg')] bg-bottom bg-no-repeat bg-contain opacity-10" />
                <div className="fixed inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20" />
                
                {/* Floating Magical Elements */}
                <FloatingMagicElements />
                
                {/* Main Content */}
                <div className="relative z-10">
                    {/* Enhanced Disney-themed Header */}
                    <Suspense fallback={<EnhancedDashboardSkeleton />}>
                        <EnhancedDashboardHeader
                            userId={user.uid}
                            userEmail={user.email || ''}
                            userName={userData.user?.displayName || 'Magical Explorer'}
                            currentVacation={convertedCurrentVacation}
                            personalizedRecommendations={userData.personalizedRecommendations}
                        />
                    </Suspense>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
                        {/* Disney Countdown Timer (if vacation exists) */}
                        {convertedCurrentVacation && convertedCurrentVacation.daysUntilTrip !== undefined && convertedCurrentVacation.daysUntilTrip > 0 && (
                            <DisneyCountdownTimer
                                vacationName={convertedCurrentVacation.name}
                                daysUntilTrip={convertedCurrentVacation.daysUntilTrip}
                                magicalLevel={convertedCurrentVacation.magicalLevel}
                            />
                        )}

                        {/* Magical Stats Grid with Disney Theming */}
                        <Suspense fallback={<MagicalStatsSkeleton />}>
                            <MagicalStatsGrid
                                userId={user.uid}
                                initialStats={statsData}
                                activitySummary={userData.activitySummary}
                                currentVacation={convertedCurrentVacation}
                            />
                        </Suspense>

                        {/* Disney Quick Actions with Magical Animations */}
                        <Suspense fallback={<DisneyActionsSkeleton />}>
                            <DisneyQuickActions
                                userId={user.uid}
                                hasActiveVacation={!!userData.currentVacation}
                                vacationId={userData.currentVacation?.id}
                                userStats={statsData}
                            />
                        </Suspense>

                        {/* Main Dashboard Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            {/* Primary Content Area (3/4 width) */}
                            <div className="xl:col-span-3">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Immersive Weather Widget */}
                                    <Suspense fallback={<ImmersiveWeatherSkeleton />}>
                                        <ImmersiveWeatherWidget 
                                            weatherData={weatherData}
                                            currentVacation={convertedCurrentVacation}
                                        />
                                    </Suspense>

                                    {/* Disney Events Calendar */}
                                    <Suspense fallback={<DisneyEventsSkeleton />}>
                                        <DisneyEventsCalendar
                                            userId={user.uid}
                                            initialEvents={eventsData}
                                            currentVacation={convertedCurrentVacation}
                                        />
                                    </Suspense>
                                </div>

                                {/* Interactive Park Map */}
                                <div className="mt-8">
                                    <InteractiveParkMap
                                        userId={user.uid}
                                        currentVacation={convertedCurrentVacation}
                                        weatherData={weatherData}
                                        recommendations={userData.personalizedRecommendations}
                                    />
                                </div>

                                {/* Enchanted Vacation Overview */}
                                <div className="mt-8">
                                    <EnchantedVacationOverview
                                        userId={user.uid}
                                        vacations={userData.vacations}
                                        currentVacation={userData.currentVacation}
                                        activeTab={activeTab}
                                    />
                                </div>
                            </div>

                            {/* Magical Sidebar (1/4 width) */}
                            <div className="xl:col-span-1 space-y-6">
                                {/* Magical Achievements with Sparkle Effects */}
                                <Suspense fallback={<MagicalAchievementsSkeleton />}>
                                    <MagicalAchievements
                                        userId={user.uid}
                                        achievements={achievementsData}
                                        userStats={statsData}
                                    />
                                </Suspense>

                                {/* Disney Park Recommendations */}
                                <DisneyParkRecommendations
                                    userId={user.uid}
                                    weatherData={weatherData}
                                    currentVacation={convertedCurrentVacation}
                                    personalizedRecommendations={userData.personalizedRecommendations}
                                />

                                {/* Magical Notifications */}
                                <MagicalNotifications 
                                    userId={user.uid}
                                    currentVacation={convertedCurrentVacation}
                                />

                                {/* Disney Activity Feed */}
                                <DisneyActivityFeed 
                                    userId={user.uid}
                                    activitySummary={userData.activitySummary}
                                />
                            </div>
                        </div>

                        {/* Personalized Dashboard Section */}
                        <MagicalPersonalizedDashboard
                            userId={user.uid}
                            userData={userData}
                            weatherData={weatherData}
                            achievements={achievementsData}
                            currentVacation={convertedCurrentVacation}
                        />
                    </div>
                </div>
            </div>
        </DisneyErrorBoundary>
    )
}