import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { itineraries, type Itinerary } from '@/db/schema/itineraries'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { format } from 'date-fns'
import { AsyncPageProps, extractParam } from '@/lib/utils/next-params'
import {
    Calendar,
    ArrowLeft,
    MapPin,
    Users,
    Star
} from 'lucide-react'
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
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ItineraryDayView from '@/components/itinerary/ItineraryDayView'
import ShareItineraryButton from '@/components/itinerary/ShareItineraryButton'

export const metadata: Metadata = {
    title: 'Itinerary Details',
    description: 'View your Disney vacation itinerary details',
}

interface ItineraryPageProps extends AsyncPageProps<{ itineraryId: string }> {}

export default async function ItineraryPage({ params }: ItineraryPageProps) {
    const session = await auth()

    if (!session || !session.user) {
        return notFound()
    }

    const userId = session.user.id
    const itineraryId = await extractParam(params, 'itineraryId')

    // Fetch itinerary from database
    const itinerary = await db.query.itineraries.findFirst({
        where: eq(itineraries.id, itineraryId)
    })

    if (!itinerary || itinerary.userId !== userId) {
        return notFound()
    }

    // Get the start and end date from the itinerary
    const dates = itinerary.parkDays.map((day: Itinerary['parkDays'][0]) => new Date(day.date))
    const startDate = dates.length ? dates.reduce((a: Date, b: Date) => a < b ? a : b) : new Date()
    const endDate = dates.length ? dates.reduce((a: Date, b: Date) => a > b ? a : b) : new Date()

    // Get total activities
    const totalActivities = itinerary.parkDays.reduce(
        (sum: number, day: Itinerary['parkDays'][0]) => sum + day.activities.length,
        0
    )

    // Sort park days by date
    const sortedParkDays = [...itinerary.parkDays].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href="/dashboard/itinerary" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Itineraries
                </Link>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{itinerary.tripName}</h1>
                        <p className="text-muted-foreground flex items-center mt-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <Button variant="outline" asChild>
                            <Link href={`/dashboard/itinerary/${itineraryId}/edit`}>
                                Edit Itinerary
                            </Link>
                        </Button>
                        <ShareItineraryButton itineraryId={itineraryId} />
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

                            <Separator />

                            <div>
                                <p className="text-sm font-medium mb-2">Preferences</p>
                                <div className="flex flex-wrap gap-2">
                                    {itinerary.preferences.ridePreference && (
                                        <Badge variant="secondary" className="text-xs">
                                            {itinerary.preferences.ridePreference === 'thrill' ? 'Thrill Rides' :
                                                itinerary.preferences.ridePreference === 'family' ? 'Family Rides' :
                                                    'All Rides'}
                                        </Badge>
                                    )}

                                    {itinerary.preferences.walkingPace && (
                                        <Badge variant="secondary" className="text-xs">
                                            {itinerary.preferences.walkingPace.charAt(0).toUpperCase() +
                                                itinerary.preferences.walkingPace.slice(1)} Pace
                                        </Badge>
                                    )}

                                    {itinerary.preferences.useGeniePlus && (
                                        <Badge variant="secondary" className="text-xs">
                                            Genie+
                                        </Badge>
                                    )}

                                    {itinerary.preferences.hasStroller && (
                                        <Badge variant="secondary" className="text-xs">
                                            Stroller
                                        </Badge>
                                    )}

                                    {itinerary.preferences.mobilityConsiderations && (
                                        <Badge variant="secondary" className="text-xs">
                                            Mobility Considerations
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
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
                            {sortedParkDays.map((day, index) => (
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
                                        View your entire trip at a glance
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-8">
                                        {sortedParkDays.map((day, index) => (
                                            <div key={`${day.date}-${index}`} className="space-y-3">
                                                <h3 className="font-semibold flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                                                    <Badge className="ml-3">{day.parkId}</Badge>
                                                </h3>

                                                <div className="space-y-2">
                                                    {day.activities.map((activity: Itinerary['parkDays'][0]['activities'][0], i: number) => (
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