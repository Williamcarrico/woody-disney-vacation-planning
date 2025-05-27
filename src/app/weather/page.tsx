import { Metadata } from 'next'
import { Suspense } from 'react'
import WeatherDashboard from '@/components/weather/WeatherDashboard'

export const metadata: Metadata = {
    title: 'Weather Forecast | Disney Vacation Planning',
    description: 'Get comprehensive weather forecasts for Disney World parks, Universal Studios, and Disney Springs. Plan your magical vacation with detailed weather insights, packing suggestions, and park-specific conditions.',
    keywords: [
        'Disney World weather',
        'Universal Studios weather',
        'Disney Springs weather',
        'Orlando weather forecast',
        'vacation weather planning',
        'theme park weather',
        'Florida weather',
        'Disney vacation planning'
    ],
    openGraph: {
        title: 'Weather Forecast | Disney Vacation Planning',
        description: 'Plan your magical Disney vacation with comprehensive weather forecasts and insights.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Weather Forecast | Disney Vacation Planning',
        description: 'Plan your magical Disney vacation with comprehensive weather forecasts and insights.',
    },
}

function WeatherSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-6">
                    {/* Header Skeleton */}
                    <div className="text-center space-y-4">
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-md" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mx-auto max-w-lg" />
                    </div>

                    {/* Main Content Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Current Weather Card */}
                        <div className="lg:col-span-2">
                            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        </div>

                        {/* Side Panel */}
                        <div className="space-y-4">
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        </div>
                    </div>

                    {/* Forecast Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function WeatherPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
            <Suspense fallback={<WeatherSkeleton />}>
                <WeatherDashboard />
            </Suspense>
        </div>
    )
}