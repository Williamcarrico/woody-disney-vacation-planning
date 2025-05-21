'use client'

import { useState } from 'react'
import { AnnualEvent } from '@/types/events'
import EventCard from './EventCard'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Calendar, Filter, Search } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface EventListProps {
    readonly events: AnnualEvent[]
    readonly title?: string
    readonly description?: string
}

export default function EventList({ events, title, description }: EventListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])
    const [currentTab, setCurrentTab] = useState('all')

    // Extract unique categories and locations
    const categories = [...new Set(events.map(event => event.category))]
    const locations = [...new Set(events.map(event => event.location))]

    // Filter events based on search query, category, location, and tab
    const filteredEvents = events.filter(event => {
        // Text search
        const matchesSearch = searchQuery === '' ||
            event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())

        // Category filter
        const matchesCategory = selectedCategories.length === 0 ||
            selectedCategories.includes(event.category)

        // Location filter
        const matchesLocation = selectedLocations.length === 0 ||
            selectedLocations.includes(event.location)

        // Tab filter
        const now = new Date()
        const startDate = event.currentYearStartDate ? new Date(event.currentYearStartDate) : null
        const endDate = event.currentYearEndDate ? new Date(event.currentYearEndDate) : null

        let matchesTab = true
        if (currentTab === 'current') {
            matchesTab = startDate !== null && endDate !== null &&
                startDate <= now && now <= endDate
        } else if (currentTab === 'upcoming') {
            matchesTab = startDate !== null && startDate > now
        } else if (currentTab === 'past') {
            matchesTab = endDate !== null && endDate < now
        }

        return matchesSearch && matchesCategory && matchesLocation && matchesTab
    })

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case 'HOLIDAY': return 'Holiday Event'
            case 'FESTIVAL': return 'Festival'
            case 'AFTER_HOURS': return 'After Hours'
            case 'MARATHON': return 'runDisney'
            case 'SPECIAL': return 'Special Event'
            case 'SEASONAL': return 'Seasonal'
            case 'CONCERT': return 'Concert'
            default: return category
        }
    }

    const getLocationLabel = (location: string) => {
        switch (location) {
            case 'MAGIC_KINGDOM': return 'Magic Kingdom'
            case 'EPCOT': return 'EPCOT'
            case 'HOLLYWOOD_STUDIOS': return 'Hollywood Studios'
            case 'ANIMAL_KINGDOM': return 'Animal Kingdom'
            case 'TYPHOON_LAGOON': return 'Typhoon Lagoon'
            case 'BLIZZARD_BEACH': return 'Blizzard Beach'
            case 'DISNEY_SPRINGS': return 'Disney Springs'
            case 'MULTIPLE': return 'Multiple Locations'
            default: return location
        }
    }

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        )
    }

    const toggleLocation = (location: string) => {
        setSelectedLocations(prev =>
            prev.includes(location)
                ? prev.filter(l => l !== location)
                : [...prev, location]
        )
    }

    const clearFilters = () => {
        setSelectedCategories([])
        setSelectedLocations([])
        setSearchQuery('')
    }

    return (
        <div className="space-y-6">
            {title && (
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
                    {description && <p className="text-muted-foreground mt-2">{description}</p>}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setCurrentTab}>
                    <TabsList>
                        <TabsTrigger value="all" className="flex gap-1 items-center">
                            <Calendar className="h-4 w-4" />
                            All Events
                        </TabsTrigger>
                        <TabsTrigger value="current" className="flex gap-1 items-center">
                            Current
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" className="flex gap-1 items-center">
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="past" className="flex gap-1 items-center">
                            Past
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-1 gap-2 md:justify-end">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Filter Events</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs">Category</DropdownMenuLabel>
                                {categories.map(category => (
                                    <DropdownMenuCheckboxItem
                                        key={category}
                                        checked={selectedCategories.includes(category)}
                                        onCheckedChange={() => toggleCategory(category)}
                                    >
                                        {getCategoryLabel(category)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs">Location</DropdownMenuLabel>
                                {locations.map(location => (
                                    <DropdownMenuCheckboxItem
                                        key={location}
                                        checked={selectedLocations.includes(location)}
                                        onCheckedChange={() => toggleLocation(location)}
                                    >
                                        {getLocationLabel(location)}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-center"
                                    onClick={clearFilters}
                                    disabled={selectedCategories.length === 0 && selectedLocations.length === 0 && searchQuery === ''}
                                >
                                    Clear Filters
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active filters */}
            {(selectedCategories.length > 0 || selectedLocations.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {selectedCategories.map(category => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1">
                            {getCategoryLabel(category)}
                            <button
                                className="ml-1 rounded-full hover:bg-secondary"
                                onClick={() => toggleCategory(category)}
                            >
                                <span className="sr-only">Remove</span>
                                <span aria-hidden="true" className="text-xs">×</span>
                            </button>
                        </Badge>
                    ))}

                    {selectedLocations.map(location => (
                        <Badge key={location} variant="secondary" className="flex items-center gap-1">
                            {getLocationLabel(location)}
                            <button
                                className="ml-1 rounded-full hover:bg-secondary"
                                onClick={() => toggleLocation(location)}
                            >
                                <span className="sr-only">Remove</span>
                                <span aria-hidden="true" className="text-xs">×</span>
                            </button>
                        </Badge>
                    ))}

                    {(selectedCategories.length > 0 || selectedLocations.length > 0) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={clearFilters}
                        >
                            Clear all
                        </Button>
                    )}
                </div>
            )}

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-medium mb-2">No events found</h3>
                    <p className="text-muted-foreground max-w-md">
                        We couldn&apos;t find any events matching your filters. Try adjusting your search or filters to see more events.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
