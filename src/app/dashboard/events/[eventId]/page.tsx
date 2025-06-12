import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { annualEvents } from '@/lib/data/annual-events'
import { formatDate, formatDateRange } from '@/lib/utils/date-utils'
import { isEpcotFestival, isHolidayEvent, isRunDisneyEvent } from '@/types/events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Calendar, Ticket, MapPin, Music, Info, ExternalLink } from 'lucide-react'
import { AsyncPageProps, extractParam } from '@/lib/utils/next-params'

interface EventPageProps extends AsyncPageProps<{ eventId: string }> {}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const eventId = await extractParam(params, 'eventId');
    const event = annualEvents.find(event => event.id === eventId)

    if (!event) {
        return {
            title: 'Event Not Found',
            description: 'The requested event could not be found.'
        }
    }

    return {
        title: `${event.name} - Walt Disney World Event`,
        description: event.description.slice(0, 160),
    }
}

export default async function EventPage({ params }: EventPageProps) {
    const eventId = await extractParam(params, 'eventId');
    const event = annualEvents.find(event => event.id === eventId)

    if (!event) {
        notFound()
    }

    const isActive = event.isActive
    const hasStarted = event.currentYearStartDate && new Date(event.currentYearStartDate) <= new Date()
    const hasEnded = event.currentYearEndDate && new Date(event.currentYearEndDate) < new Date()
    const isHappening = hasStarted && !hasEnded

    const getCategoryLabel = () => {
        switch (event.category) {
            case 'HOLIDAY':
                if (isHolidayEvent(event)) {
                    return `${event.holidayType.charAt(0) + event.holidayType.slice(1).toLowerCase()} Event`
                }
                return 'Holiday Event'
            case 'FESTIVAL': return 'Festival'
            case 'AFTER_HOURS': return 'After Hours'
            case 'MARATHON': return 'runDisney'
            case 'SPECIAL': return 'Special Event'
            default: return 'Event'
        }
    }

    const getBadgeVariant = (): "default" | "destructive" | "secondary" | "outline" => {
        switch (event.category) {
            case 'HOLIDAY': return 'destructive'
            case 'FESTIVAL': return 'default'
            case 'AFTER_HOURS': return 'secondary'
            case 'MARATHON': return 'outline'
            case 'SPECIAL': return 'secondary'
            default: return 'secondary'
        }
    }

    const getLocationLabel = (): string => {
        switch (event.location) {
            case 'MAGIC_KINGDOM': return 'Magic Kingdom'
            case 'EPCOT': return 'EPCOT'
            case 'HOLLYWOOD_STUDIOS': return "Hollywood Studios"
            case 'ANIMAL_KINGDOM': return "Animal Kingdom"
            case 'TYPHOON_LAGOON': return "Typhoon Lagoon"
            case 'BLIZZARD_BEACH': return "Blizzard Beach"
            case 'DISNEY_SPRINGS': return "Disney Springs"
            case 'MULTIPLE': return "Multiple Locations"
            default: return "Unknown Location"
        }
    }

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="pl-0">
                    <Link href="/events">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to events
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant={getBadgeVariant()}>{getCategoryLabel()}</Badge>
                            {isActive && (
                                isHappening
                                    ? <Badge variant="default">Now Active</Badge>
                                    : <Badge variant="secondary">Coming Soon</Badge>
                            )}
                            {!isActive && <Badge variant="secondary">Past Event</Badge>}
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>

                        <div className="flex items-center text-muted-foreground mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{getLocationLabel()}</span>
                            <span className="mx-2">•</span>
                            <span>Running since {event.yearStart}</span>
                        </div>
                    </div>

                    {event.images && event.images.length > 0 && (
                        <div className="relative w-full h-80 lg:h-[400px] rounded-lg overflow-hidden">
                            <Image
                                src={event.images[0].url}
                                alt={event.images[0].alt || `${event.name} event image`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <div className="prose max-w-none">
                        <p className="text-lg">{event.description}</p>

                        <h2>Event Schedule</h2>
                        {event.currentYearStartDate && event.currentYearEndDate ? (
                            <div className="flex items-center my-4 p-4 bg-secondary/20 rounded-lg">
                                <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {formatDateRange(
                                            new Date(event.currentYearStartDate),
                                            new Date(event.currentYearEndDate)
                                        )}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {isHappening
                                            ? 'Event is currently running'
                                            : hasEnded
                                                ? 'Event has ended for this year'
                                                : 'Event has not started yet'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p>Event dates for the current year have not been announced yet.</p>
                        )}

                        {/* Special event features */}
                        {isHolidayEvent(event) && event.specialEntertainment && (
                            <>
                                <h2>Special Entertainment</h2>
                                <ul>
                                    {event.specialEntertainment.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {isEpcotFestival(event) && event.features && (
                            <>
                                <h2>Festival Highlights</h2>
                                <ul>
                                    {event.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {isRunDisneyEvent(event) && event.raceTypes && (
                            <>
                                <h2>Race Events</h2>
                                <ul>
                                    {event.raceTypes.map((raceType, index) => (
                                        <li key={index}>{raceType}</li>
                                    ))}
                                </ul>

                                {event.coursePath && (
                                    <>
                                        <h2>Course Path</h2>
                                        <p>The race course runs through: {event.coursePath.join(', ')}</p>
                                    </>
                                )}

                                {event.registrationDate && (
                                    <div className="p-4 bg-secondary/20 rounded-lg my-4">
                                        <h3 className="text-base font-medium mt-0">Registration Information</h3>
                                        <p className="mb-0">Registration opens on {formatDate(new Date(event.registrationDate))}</p>
                                    </div>
                                )}
                            </>
                        )}

                        {isEpcotFestival(event) && event.concertSeries && (
                            <div className="flex items-center p-4 bg-secondary/20 rounded-lg my-4">
                                <Music className="h-5 w-5 mr-3 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-medium mb-0">{event.concertSeries}</p>
                                    <p className="text-sm text-muted-foreground mb-0">
                                        Live performances throughout the festival
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow">
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-semibold">Event Details</h3>

                            <div className="space-y-3">
                                {event.currentYearStartDate && event.currentYearEndDate && (
                                    <div className="flex gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                                        <div>
                                            <p className="font-medium">Event Dates</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(new Date(event.currentYearStartDate))} - {formatDate(new Date(event.currentYearEndDate))}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">{getLocationLabel()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Ticket className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="font-medium">Admission</p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.ticketRequired
                                                ? `Separate ticket required${event.price ? ` • From $${event.price}` : ''}`
                                                : 'Included with park admission'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="font-medium">Event History</p>
                                        <p className="text-sm text-muted-foreground">Running since {event.yearStart}</p>
                                    </div>
                                </div>
                            </div>

                            {event.url && (
                                <Button className="w-full mt-4" asChild>
                                    <Link href={event.url} target="_blank" rel="noopener noreferrer">
                                        Visit Official Page
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Additional info cards can go here */}
                </div>
            </div>
        </div>
    )
}