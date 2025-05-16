"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { attractions } from "@/lib/utils/attractionData"
import { Attraction } from "@/types/attraction"
import AttractionDetail from "@/components/attractions/AttractionDetail"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function AttractionDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [attraction, setAttraction] = useState<Attraction | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // In a real app, this would be an API call to fetch the attraction data
        const attractionId = params.attractionId as string
        const found = attractions.find(a => a.id === attractionId)

        // Simulate loading
        const timer = setTimeout(() => {
            setAttraction(found || null)
            setIsLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [params.attractionId])

    // Handle "Add to Itinerary" action
    const handleAddToItinerary = () => {
        if (!attraction) return
        console.log("Adding to itinerary:", attraction.name)
        // This would connect to your actual itinerary system
    }

    // Handle "Back" button click
    const handleBack = () => {
        router.back()
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-8">
                        <Button
                            variant="outline"
                            size="sm"
                            className="mb-4"
                            onClick={handleBack}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Attractions
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-72 w-full rounded-lg" />
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            </div>
        )
    }

    if (!attraction) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold mb-4">Attraction Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We couldn't find the attraction you're looking for.
                    </p>
                    <Button onClick={handleBack}>
                        Return to Attractions
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={handleBack}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Attractions
                    </Button>
                </div>

                <AttractionDetail
                    attraction={attraction}
                    isOperating={true}
                    waitTime={Math.floor(Math.random() * 90)}
                    onAddToItinerary={handleAddToItinerary}
                    onBack={handleBack}
                />

                {/* Additional information section could be added here */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">Similar Attractions</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Coming soon: Recommendations for similar attractions based on your interests.
                    </p>
                </div>
            </div>
        </div>
    )
}