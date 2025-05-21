import { Metadata } from 'next'
import ItineraryPlanner from '@/components/itinerary/ItineraryPlanner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
    title: 'Itinerary Builder',
    description: 'Create a personalized Disney itinerary for your vacation',
}

export default function ItineraryPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Itinerary Builder</h1>
                <p className="text-muted-foreground mt-2">
                    Plan your Disney vacation day-by-day with our optimized itinerary builder
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Your Itinerary</CardTitle>
                    <CardDescription>
                        Build a custom itinerary based on your preferences, party size, and target attractions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ItineraryPlanner />
                </CardContent>
            </Card>
        </div>
    )
}