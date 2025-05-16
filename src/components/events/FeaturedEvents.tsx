'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnnualEvent } from '@/types/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/date-utils'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel'
import EventCard from './EventCard'

interface FeaturedEventsProps {
    events: AnnualEvent[]
    title?: string
    showViewAll?: boolean
}

export default function FeaturedEvents({
    events,
    title = "Upcoming Walt Disney World Events",
    showViewAll = true
}: FeaturedEventsProps) {
    const [activeTab, setActiveTab] = useState('current')
    const [filteredEvents, setFilteredEvents] = useState<AnnualEvent[]>([])

    useEffect(() => {
        const now = new Date()

        if (activeTab === 'current') {
            setFilteredEvents(
                events.filter(event => {
                    if (!event.currentYearStartDate || !event.currentYearEndDate) return false
                    const startDate = new Date(event.currentYearStartDate)
                    const endDate = new Date(event.currentYearEndDate)
                    return startDate <= now && now <= endDate
                })
            )
        } else if (activeTab === 'upcoming') {
            setFilteredEvents(
                events
                    .filter(event => {
                        if (!event.currentYearStartDate) return false
                        const startDate = new Date(event.currentYearStartDate)
                        return startDate > now
                    })
                    .sort((a, b) => {
                        const aDate = new Date(a.currentYearStartDate!)
                        const bDate = new Date(b.currentYearStartDate!)
                        return aDate.getTime() - bDate.getTime()
                    })
                    .slice(0, 6)
            )
        } else {
            // Show all events for the 'all' tab, limited to 6
            setFilteredEvents(events.slice(0, 6))
        }
    }, [events, activeTab])

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground mt-1">
                        Discover magical seasonal celebrations at Walt Disney World
                    </p>
                </div>

                <div className="w-full sm:w-auto flex justify-between items-center">
                    <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="current">Current</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {showViewAll && (
                        <Button variant="ghost" size="sm" asChild className="ml-2">
                            <Link href="/events">
                                View all
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {filteredEvents.length > 0 ? (
                <Carousel
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true
                    }}
                >
                    <CarouselContent>
                        {filteredEvents.map(event => (
                            <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <EventCard event={event} variant="compact" />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="text-xl font-medium">No events found</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        {activeTab === 'current'
                            ? 'There are no active events right now. Check back soon for upcoming events.'
                            : activeTab === 'upcoming'
                                ? 'There are no upcoming events scheduled at this time.'
                                : 'No events are currently available.'}
                    </p>
                    {activeTab !== 'all' && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setActiveTab('all')}
                        >
                            View all events
                        </Button>
                    )}
                </div>
            )}
        </section>
    )
}