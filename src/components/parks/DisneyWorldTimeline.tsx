'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar, Home, Waves, Sparkles, MapPin, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Define the types for our timeline items
type TimelineItemType =
    | 'theme-park'
    | 'resort'
    | 'water-park'
    | 'other'

interface TimelineItemNote {
    id: number
    text: string
}

interface TimelineItem {
    id: string
    name: string
    openingDate: string
    type: TimelineItemType
    status?: 'open' | 'closed'
    closingDate?: string
    notes?: TimelineItemNote[]
}

// Category data
const CATEGORIES = {
    'theme-park': {
        label: 'Theme Parks',
        icon: <MapPin className="h-4 w-4" />,
        color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    'resort': {
        label: 'Resorts & Hotels',
        icon: <Home className="h-4 w-4" />,
        color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    'water-park': {
        label: 'Water Parks',
        icon: <Waves className="h-4 w-4" />,
        color: 'bg-cyan-100 text-cyan-800 border-cyan-200'
    },
    'other': {
        label: 'Other Properties',
        icon: <Sparkles className="h-4 w-4" />,
        color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
}

// Decade filter options
const DECADES = [
    { label: 'All Years', value: 'all' },
    { label: '1970s', value: '1970' },
    { label: '1980s', value: '1980' },
    { label: '1990s', value: '1990' },
    { label: '2000s', value: '2000' },
    { label: '2010s', value: '2010' },
    { label: '2020s', value: '2020' }
]

// Disney World Timeline Data
const timelineData: TimelineItem[] = [
    // Theme Parks
    {
        id: 'magic-kingdom',
        name: 'Magic Kingdom',
        openingDate: 'October 1, 1971',
        type: 'theme-park',
        status: 'open'
    },
    {
        id: 'epcot',
        name: 'Epcot',
        openingDate: 'October 1, 1982',
        type: 'theme-park',
        status: 'open',
        notes: [
            { id: 1, text: 'Formerly known as EPCOT Center.' },
            { id: 2, text: '"Center" was dropped from the "EPCOT" name, and letters were lowercased in December 1993.' }
        ]
    },
    {
        id: 'hollywood-studios',
        name: 'Hollywood Studios',
        openingDate: 'May 1, 1989',
        type: 'theme-park',
        status: 'open',
        notes: [
            { id: 1, text: 'Formerly known as Disney MGM Studios.' },
            { id: 2, text: 'Renamed Disney\'s Hollywood Studios on January 7, 2008.' }
        ]
    },
    {
        id: 'animal-kingdom',
        name: 'Animal Kingdom',
        openingDate: 'April 22, 1998',
        type: 'theme-park',
        status: 'open'
    },

    // Resort Hotels
    {
        id: 'contemporary-resort',
        name: 'Contemporary Resort',
        openingDate: 'October 1, 1971',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Demolition of Northern Garden Wing at Contemporary Resort was completed in Spring of 2007 for construction of the "Bay Lake Tower", a DVC resort.' }
        ]
    },
    {
        id: 'polynesian-village-resort',
        name: 'Polynesian Village Resort',
        openingDate: 'October 1, 1971',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Opened as the Polynesian Village Resort.' },
            { id: 2, text: '"Village" was dropped from the name in 1985.' },
            { id: 3, text: 'On May 2, 2014, it was announced that the resort would revert to the Disney\'s Polynesian Village Resort name while expanding further to include Disney Vacation Club (DVC) accommodations as well as enhanced resort amenities.' },
            { id: 4, text: 'April 1, 2015, The DVC accommodations opened: Bora Bora Bunglows, Moorea, Tokelau and Pago Pago.' },
            { id: 5, text: 'Disney Vacation Club\'s Island Tower at Disney\'s Polynesian Villas & Bungalows, opened on December 17, 2024.' }
        ]
    },
    {
        id: 'fort-wilderness',
        name: 'Fort Wilderness Resort and Campground',
        openingDate: 'November 19, 1971',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'shades-of-green',
        name: 'Shades of Green',
        openingDate: 'December 1973',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Built as the Golf Resort December 1973.' },
            { id: 2, text: 'Became the Disney Inn February 1, 1986.' },
            { id: 3, text: 'Became Shades of Green February 1, 1994 for military and DOD personnel only.' }
        ]
    },
    {
        id: 'grand-floridian',
        name: 'Grand Floridian Resort & Spa',
        openingDate: 'June 28, 1988',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Formerly known as the Grand Floridian Beach Resort.' },
            { id: 2, text: 'In 1997 the name was changed to Grand Floridian Resort & Spa.' }
        ]
    },
    {
        id: 'caribbean-beach-resort',
        name: 'Caribbean Beach Resort',
        openingDate: 'October 1, 1988',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'swan-hotel',
        name: 'Swan Hotel',
        openingDate: 'November 22, 1989',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Operated by Westin Hotels.' }
        ]
    },
    {
        id: 'dolphin-hotel',
        name: 'Dolphin Hotel',
        openingDate: 'June 4, 1990',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Operated by Sheraton Hotels.' }
        ]
    },
    {
        id: 'yacht-club-resort',
        name: 'Yacht Club Resort',
        openingDate: 'November 5, 1990',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'beach-club-resort',
        name: 'Beach Club Resort',
        openingDate: 'November 19, 1990',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'port-orleans-resort',
        name: 'Port Orleans Resort',
        openingDate: 'May 17, 1991',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Merged with Dixie Landings Resort April 1, 2001.' },
            { id: 2, text: 'Dixie Landings Resort opened February 2, 1992 and was adjacent to Port Orleans.' },
            { id: 3, text: 'The combined resort will be known as the Port Orleans Resort, with the Port Orleans section to be known as the French Quarter and the Dixie Landings section will be known as Riverside.' }
        ]
    },
    {
        id: 'old-key-west-resort',
        name: 'Old Key West Resort',
        openingDate: 'October 1, 1991',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'First Disney Vacation Club Resort Property at WDW.' },
            { id: 2, text: 'Originally the Vacation Club Resort.' },
            { id: 3, text: 'Disney Vacation Club started December 20, 1991.' },
            { id: 4, text: 'Renamed Old Key West Resort January 1996.' }
        ]
    },
    {
        id: 'all-star-resort',
        name: 'All-Star Resort',
        openingDate: 'April 29, 1994',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Three distinct themed sections: (a) All-Star Sports opened April 29, 1994; (b) All-Star Music Resort opened November 1, 1994; (c) All-Star Movies Resort opened January 15, 1999.' },
            { id: 2, text: 'Previously operated as three individual resorts, but now operates as a single resort.' }
        ]
    },
    {
        id: 'wilderness-lodge',
        name: 'Wilderness Lodge',
        openingDate: 'May 28, 1994',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'boardwalk-inn',
        name: 'BoardWalk Inn',
        openingDate: 'July 1, 1996',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'boardwalk-villas',
        name: 'BoardWalk Villas',
        openingDate: 'July 1, 1996',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: '2nd Disney Vacation Club Resort Property at WDW.' }
        ]
    },
    {
        id: 'coronado-springs-resort',
        name: 'Coronado Springs Resort',
        openingDate: 'August 1, 1997',
        type: 'resort',
        status: 'open'
    },
    {
        id: 'boulder-ridge-villas',
        name: 'Boulder Ridge Villas at Wilderness Lodge',
        openingDate: 'January 1, 2001',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: '3rd Disney Vacation Club Resort Property at WDW.' },
            { id: 2, text: 'On May 24, 2016, Disney Vacation Club announced a new name for the Villas at Disney\'s Wilderness Lodge. The Resort\'s new name will be Boulder Ridge Villas at Disney\'s Wilderness Lodge.' }
        ]
    },
    {
        id: 'animal-kingdom-lodge',
        name: 'Animal Kingdom Lodge',
        openingDate: 'April 16, 2001',
        type: 'resort',
        status: 'open'
    },

    // Water Parks
    {
        id: 'river-country',
        name: 'River Country',
        openingDate: 'June 20, 1976',
        type: 'water-park',
        status: 'closed',
        closingDate: 'January 20, 2005',
        notes: [
            { id: 1, text: 'Ceased operation on September 1, 2001 and was closed on January 20, 2005.' }
        ]
    },
    {
        id: 'typhoon-lagoon',
        name: 'Typhoon Lagoon',
        openingDate: 'June 1, 1989',
        type: 'water-park',
        status: 'open'
    },
    {
        id: 'blizzard-beach',
        name: 'Blizzard Beach',
        openingDate: 'April 1, 1995',
        type: 'water-park',
        status: 'open'
    },

    // Other Properties
    {
        id: 'discovery-island',
        name: 'Discovery Island',
        openingDate: 'April 7, 1974',
        type: 'other',
        status: 'closed',
        closingDate: 'April 8, 1999',
        notes: [
            { id: 1, text: 'Located in Bay Lake, east of the Magic Kingdom.' },
            { id: 2, text: 'Originally Treasure Island opening April 7, 1974.' },
            { id: 3, text: 'Became Discovery Island April 1, 1977.' },
            { id: 4, text: 'Closed April 8, 1999.' }
        ]
    },
    {
        id: 'disney-springs',
        name: 'Disney Springs',
        openingDate: 'March 22, 1975',
        type: 'other',
        status: 'open',
        notes: [
            { id: 1, text: 'Shopping, dining and entertainment complex with four distinct neighborhoods: a. Marketplace; b. Landing; c. West Side; d. Town Center.' },
            { id: 2, text: 'Formerly Downtown Disney, Pleasure Island and the Marketplace.' },
            { id: 3, text: 'Named Disney Springs on September 30, 2015 and to be completed in 2016.' }
        ]
    },
    {
        id: 'celebration',
        name: 'Town of Celebration',
        openingDate: 'Established 1994',
        type: 'other',
        status: 'open',
        notes: [
            { id: 1, text: 'First residents moved in June 18, 1996.' },
            { id: 2, text: 'De-annexed from the Reedy Creek Improvement District. (Date unknown)' }
        ]
    },
    {
        id: 'wedding-pavilion',
        name: 'Fairy Tale Wedding Pavilion',
        openingDate: 'July 15, 1995',
        type: 'other',
        status: 'open'
    },
    {
        id: 'speedway',
        name: 'Speedway',
        openingDate: 'November 28, 1995',
        type: 'other',
        status: 'open',
        notes: [
            { id: 1, text: 'Home of the Richard Petty Driving Experience.' }
        ]
    },
    {
        id: 'fantasia-gardens',
        name: 'Fantasia Gardens Miniature Golf',
        openingDate: 'May 20, 1996',
        type: 'other',
        status: 'open'
    },
    {
        id: 'wide-world-of-sports',
        name: 'Wide World of Sports Complex',
        openingDate: 'March 28, 1997',
        type: 'other',
        status: 'open',
        notes: [
            { id: 1, text: 'On November 5, 2009, Disney announced that the complex would be renamed "ESPN Wide World of Sports Complex". It will open in the Spring of 2010.' }
        ]
    },
    {
        id: 'disneyquest-wdw',
        name: 'DisneyQuest WDW',
        openingDate: 'June 19, 1998',
        type: 'other',
        status: 'closed',
        notes: [
            { id: 1, text: 'Located in West Side at Downtown Disney. Had been scheduled to close December 31, 2007, but as of 2009, the attraction remains open.' }
        ]
    },
    {
        id: 'winter-summerland',
        name: 'Winter Summerland Miniature Golf',
        openingDate: 'April 1999',
        type: 'other',
        status: 'open'
    },
    {
        id: 'golden-oak',
        name: 'Golden Oak Residential Area',
        openingDate: '2012',
        type: 'other',
        status: 'open',
        notes: [
            { id: 1, text: 'Luxury residential community, featuring homes designed by the Walt Disney Company.' }
        ]
    },
    {
        id: 'star-wars-galactic-starcruiser',
        name: 'Star Wars: Galactic Starcruiser Resort',
        openingDate: 'March 1, 2022',
        type: 'resort',
        status: 'closed',
        closingDate: 'September 30, 2023',
        notes: [
            { id: 1, text: 'Star Wars-themed luxury hotel built near Disney\'s Hollywood Studios at the Walt Disney World Resort.' },
            { id: 2, text: 'The hotel accompanies the Star Wars: Galaxy\'s Edge themed area in Disney\'s Hollywood Studios.' },
            { id: 3, text: 'Closed due to poor profits on September 30, 2023.' }
        ]
    },
    {
        id: 'disney-lakeshore-lodge',
        name: 'Disney Lakeshore Lodge',
        openingDate: 'Scheduled to Open 2027',
        type: 'resort',
        status: 'open',
        notes: [
            { id: 1, text: 'Nature Resort on Bay Lake.' },
            { id: 2, text: 'To be built on the old River Country site.' },
            { id: 3, text: '12th DVC resort at WDW and 16th overall DVC resort.' },
            { id: 4, text: 'Originally called Reflections - A Disney Lakeside Lodge, but on November 26, 2024 the name was change to Disney Lakeshore Lodge.' },
            { id: 5, text: 'Delayed to 2027.' }
        ]
    }
]

export default function DisneyWorldTimeline() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedDecade, setSelectedDecade] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

    // Helper function to check if a date belongs to a decade
    const isInDecade = (dateStr: string, decade: string): boolean => {
        if (decade === 'all') return true

        // Handle special cases like "Scheduled to Open 2027"
        if (dateStr.includes(decade)) return true

        // Parse normal dates
        try {
            const date = new Date(dateStr)
            const year = date.getFullYear()
            const decadeStart = parseInt(decade)
            return year >= decadeStart && year < decadeStart + 10
        } catch {
            return false
        }
    }

    // Filter timeline items based on category, decade, and search query
    const filteredItems = timelineData.filter(item => {
        // Category filter
        const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory

        // Decade filter
        const matchesDecade = isInDecade(item.openingDate, selectedDecade)

        // Search filter - match name or notes
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch = searchQuery === '' ||
            item.name.toLowerCase().includes(searchLower) ||
            item.notes?.some(note => note.text.toLowerCase().includes(searchLower))

        return matchesCategory && matchesDecade && matchesSearch
    })

    // Sort items by opening date (oldest first)
    const sortedItems = [...filteredItems].sort((a, b) => {
        // Handle special cases like "Scheduled to Open 2027"
        const getYear = (dateStr: string): number => {
            if (dateStr.includes('Scheduled')) {
                const match = dateStr.match(/\d{4}/)
                return match ? parseInt(match[0]) : 9999
            }
            try {
                return new Date(dateStr).getTime()
            } catch {
                return 9999
            }
        }

        return getYear(a.openingDate) - getYear(b.openingDate)
    })

    // Toggle expanded state for an item
    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // Expand all items
    const expandAll = () => {
        const expanded: Record<string, boolean> = {}
        timelineData.forEach(item => {
            if (item.notes && item.notes.length > 0) {
                expanded[item.id] = true
            }
        })
        setExpandedItems(expanded)
    }

    // Collapse all items
    const collapseAll = () => {
        setExpandedItems({})
    }

    // Get correct color class based on item type
    const getTypeColorClass = (type: TimelineItemType) => {
        return CATEGORIES[type].color
    }

    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Walt Disney World Timeline
                </CardTitle>
                <CardDescription>
                    A chronological timeline of Walt Disney World parks, resorts, and attractions from 1971 to present.
                </CardDescription>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="flex-1 relative">
                        <Input
                            placeholder="Search timeline..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9"
                        />
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="flex-1">
                        <Select value={selectedDecade} onValueChange={setSelectedDecade}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select decade" />
                            </SelectTrigger>
                            <SelectContent>
                                {DECADES.map(decade => (
                                    <SelectItem key={decade.value} value={decade.value}>
                                        {decade.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs
                    defaultValue="all"
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="mt-4"
                >
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="theme-park" className="flex items-center gap-1">
                            {CATEGORIES['theme-park'].icon}
                            Parks
                        </TabsTrigger>
                        <TabsTrigger value="resort" className="flex items-center gap-1">
                            {CATEGORIES['resort'].icon}
                            Resorts
                        </TabsTrigger>
                        <TabsTrigger value="water-park" className="flex items-center gap-1">
                            {CATEGORIES['water-park'].icon}
                            Water Parks
                        </TabsTrigger>
                        <TabsTrigger value="other" className="flex items-center gap-1">
                            {CATEGORIES['other'].icon}
                            Other
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                        {sortedItems.length} items found
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={expandAll}
                            className="text-xs"
                        >
                            Expand All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={collapseAll}
                            className="text-xs"
                        >
                            Collapse All
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="relative">
                        {/* Vertical timeline line */}
                        <div className="absolute left-[22px] top-0 bottom-0 w-[2px] bg-gray-200" />

                        {/* Timeline items */}
                        <div className="space-y-6">
                            {sortedItems.length > 0 ? (
                                sortedItems.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(index * 0.05, 1) }}
                                        className="relative pl-12"
                                    >
                                        {/* Timeline node */}
                                        <div
                                            className={`absolute left-[15px] w-[16px] h-[16px] rounded-full z-10 border-2 top-6 ${item.status === 'closed' ? 'bg-white border-gray-400' : 'bg-white border-blue-500'
                                                }`}
                                        />

                                        {/* Content card */}
                                        <div className={`
                                            border rounded-lg p-4
                                            ${item.status === 'closed' ? 'border-gray-300 bg-gray-50' : 'border-gray-200 bg-white'}
                                        `}>
                                            <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getTypeColorClass(item.type)} font-medium flex items-center gap-1`}
                                                    >
                                                        {CATEGORIES[item.type].icon}
                                                        {CATEGORIES[item.type].label}
                                                    </Badge>
                                                    {item.status === 'closed' && (
                                                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                                                            Closed
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {item.openingDate}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-semibold">
                                                {item.name}
                                            </h3>

                                            {item.closingDate && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Closed: {item.closingDate}
                                                </p>
                                            )}

                                            {item.notes && item.notes.length > 0 && (
                                                <div className="mt-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleExpanded(item.id)}
                                                        className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium underline"
                                                    >
                                                        {expandedItems[item.id] ? 'Hide notes' : 'Show notes'}
                                                    </Button>

                                                    {expandedItems[item.id] && (
                                                        <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc pl-5">
                                                            {item.notes.map(note => (
                                                                <li key={note.id}>{note.text}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    <p>No timeline items match your filters.</p>
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            setSelectedCategory('all')
                                            setSelectedDecade('all')
                                            setSearchQuery('')
                                        }}
                                        className="mt-2"
                                    >
                                        Reset filters
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}