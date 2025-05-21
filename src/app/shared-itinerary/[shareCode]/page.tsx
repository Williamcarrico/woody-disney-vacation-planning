import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { itineraries } from '@/db/schema/itineraries'
import { eq } from 'drizzle-orm'
import { format } from 'date-fns'
import {
    Calendar,
    MapPin,
    Users,
    Star,
    Info,
    Pin
} from 'lucide-react'
import Link from 'next/link'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/components/ui/tabs'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import ItineraryDayView from '@/components/itinerary/ItineraryDayView'

export const metadata: Metadata = {
    title: 'Shared Itinerary',
    description: 'View a shared Disney vacation itinerary',
}

interface SharedItineraryPageProps {
    params: {
        shareCode: string
    }
}

// Define the type for park day activities
interface Activity {
    id?: string
    name: string
    type: string
    startTime: string
    endTime: string
    location?: string
    description?: string
    waitTime?: number
    walkingTime?: number
    notes?: string
}

// Define the type for park days
interface ParkDay {
    date: string
    parkId: string
    activities: Activity[]
}

export default async function SharedItineraryPage({ params }: SharedItineraryPageProps) {
    const { shareCode } = params

    // Fetch itinerary from database using the share code
    const itinerary = await db.query.itineraries.findFirst({
        where: eq(itineraries.shareCode, shareCode)
    })

    if (!itinerary || !itinerary.isShared) {
        return notFound()
    }

    // Get the start and end date from the itinerary
    const dates = itinerary.parkDays.map((day: ParkDay) => new Date(day.date))
    const startDate = dates.length ? dates.reduce((a: Date, b: Date) => a < b ? a : b) : new Date()
    const endDate = dates.length ? dates.reduce((a: Date, b: Date) => a > b ? a : b) : new Date()

    // Get total activities
    const totalActivities = itinerary.parkDays.reduce(
        (sum: number, day: ParkDay) => sum + day.activities.length,
        0
    )

    // Sort park days by date
    const sortedParkDays = [...itinerary.parkDays].sort((a: ParkDay, b: ParkDay) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return (
        <div className="container mx-auto py-8">
            <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Shared Itinerary</AlertTitle>
                <AlertDescription>
                    You&apos;re viewing a shared Disney vacation itinerary. Want to create your own?{' '}
                    <Link href="/dashboard/itinerary" className="font-medium underline underline-offset-4">
                        Sign in or create an account
                    </Link>
                </AlertDescription>
            </Alert>

            <div className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{itinerary.tripName}</h1>
                        <p className="text-muted-foreground flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/itinerary">
                                <Pin className="h-4 w-4 mr-2" />
                                Clone This Itinerary
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trip Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Dates</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Parks</p>
                                    <p className="text-sm text-muted-foreground">
                                        {itinerary.parkDays.length} days planned
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Activities</p>
                                    <p className="text-sm text-muted-foreground">
                                        {totalActivities} total activities
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Party</p>
                                    <p className="text-sm text-muted-foreground">
                                        {itinerary.preferences.partySize || '?'} people
                                        {itinerary.preferences.hasChildren && ' • With children'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" asChild>
                                <Link href="/dashboard/itinerary">
                                    Create Your Own
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Main content */}
                <div className="lg:col-span-3">
                    <Tabs defaultValue="day-by-day">
                        <TabsList className="mb-4">
                            <TabsTrigger value="day-by-day">Day by Day</TabsTrigger>
                            <TabsTrigger value="full-schedule">Full Schedule</TabsTrigger>
                        </TabsList>

                        <TabsContent value="day-by-day" className="space-y-6">
                            {sortedParkDays.map((day: ParkDay, index: number) => (
                                <ItineraryDayView
                                    key={`${day.date}-${index}`}
                                    day={day}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent value="full-schedule">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Complete Itinerary</CardTitle>
                                    <CardDescription>
                                        View the entire trip at a glance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {sortedParkDays.map((day: ParkDay, index: number) => (
                                            <div key={`${day.date}-${index}`} className="space-y-3">
                                                <h3 className="font-semibold flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                                                    <Badge className="ml-3">{day.parkId}</Badge>
                                                </h3>

                                                <div className="space-y-2">
                                                    {day.activities.map((activity: Activity, i: number) => (
                                                        <div key={`${activity.id || i}`} className="flex items-center text-sm">
                                                            <div className="w-20 flex-shrink-0 text-muted-foreground">
                                                                {format(new Date(`${day.date}T${activity.startTime}`), 'h:mm a')}
                                                            </div>
                                                            <div className="font-medium">{activity.name}</div>
                                                            {activity.waitTime && (
                                                                <Badge variant="outline" className="ml-2 text-xs">
                                                                    {activity.waitTime} min wait
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {index < sortedParkDays.length - 1 && <Separator />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}