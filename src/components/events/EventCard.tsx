'use client'

import { AnnualEvent, isEpcotFestival, isHolidayEvent, isRunDisneyEvent } from '@/types/events'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, Clock, Ticket, InfoIcon, MapPin, Music, Utensils, Sparkles, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils/date-utils'

interface EventCardProps {
    event: AnnualEvent
    variant?: 'default' | 'compact'
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
    const isCompact = variant === 'compact'
    const hasStarted = event.currentYearStartDate && new Date(event.currentYearStartDate) <= new Date()
    const hasEnded = event.currentYearEndDate && new Date(event.currentYearEndDate) < new Date()
    const isHappening = hasStarted && !hasEnded

    // Get badge color based on event category
    const getBadgeVariant = () => {
        switch (event.category) {
            case 'HOLIDAY': return 'destructive'
            case 'FESTIVAL': return 'default'
            case 'AFTER_HOURS': return 'purple'
            case 'MARATHON': return 'yellow'
            case 'SPECIAL': return 'blue'
            default: return 'secondary'
        }
    }

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

    return (
        <Card className={cn(
            "overflow-hidden",
            isCompact ? "h-full" : ""
        )}>
            <div className="relative">
                {event.images && event.images.length > 0 && (
                    <div className="relative w-full h-48">
                        <Image
                            src={event.images[0].url}
                            alt={event.images[0].alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {isHappening && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                                Now Active
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge variant={getBadgeVariant()}>{getCategoryLabel()}</Badge>
                    <Badge variant="outline" className="text-xs">Since {event.yearStart}</Badge>
                </div>
                <CardTitle className="mt-2 text-xl">{event.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location === 'MAGIC_KINGDOM' && 'Magic Kingdom'}
                    {event.location === 'EPCOT' && 'EPCOT'}
                    {event.location === 'HOLLYWOOD_STUDIOS' && "Hollywood Studios"}
                    {event.location === 'ANIMAL_KINGDOM' && "Animal Kingdom"}
                    {event.location === 'TYPHOON_LAGOON' && "Typhoon Lagoon"}
                    {event.location === 'BLIZZARD_BEACH' && "Blizzard Beach"}
                    {event.location === 'DISNEY_SPRINGS' && "Disney Springs"}
                    {event.location === 'MULTIPLE' && "Multiple Locations"}
                </CardDescription>
            </CardHeader>

            <CardContent className="pb-4">
                {!isCompact && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {event.description}
                    </p>
                )}

                <div className="space-y-2">
                    {event.currentYearStartDate && event.currentYearEndDate && (
                        <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                                {formatDate(new Date(event.currentYearStartDate))} - {formatDate(new Date(event.currentYearEndDate))}
                            </span>
                        </div>
                    )}

                    {event.ticketRequired && (
                        <div className="flex items-center text-sm">
                            <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>
                                Separate Ticket Required
                                {event.price && ` • From $${event.price}`}
                            </span>
                        </div>
                    )}

                    {/* Special features based on event type */}
                    {isEpcotFestival(event) && event.concertSeries && (
                        <div className="flex items-center text-sm">
                            <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event.concertSeries}</span>
                        </div>
                    )}

                    {isEpcotFestival(event) && event.marketplaces && (
                        <div className="flex items-center text-sm">
                            <Utensils className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event.marketplaces} Global Marketplaces</span>
                        </div>
                    )}

                    {isRunDisneyEvent(event) && event.raceTypes && (
                        <div className="flex items-center text-sm">
                            <Sparkles className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event.raceTypes.slice(0, 3).join(', ')}{event.raceTypes.length > 3 ? '...' : ''}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className={cn(
                "flex justify-between",
                isCompact ? "pt-0" : ""
            )}>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/events/${event.id}`}>
                        <InfoIcon className="h-4 w-4 mr-2" />
                        Details
                    </Link>
                </Button>

                {event.url && (
                    <Button variant="default" size="sm" asChild>
                        <Link href={event.url} target="_blank" rel="noopener noreferrer">
                            Visit Official Page
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}