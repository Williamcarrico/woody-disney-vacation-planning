"use client"

import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowDownIcon,
    ArrowUpIcon,
    SearchIcon,
    StarIcon,
    XCircleIcon
} from "lucide-react"

interface Attraction {
    id: string
    name: string
    waitTime: number
    type: 'RIDE' | 'SHOW' | 'MEET_AND_GREET'
    tags: string[]
}

interface OptimizerFormData {
    priorityAttractions: string[]
    excludedAttractions: string[]
    [key: string]: unknown
}

interface AttractionPreferencesSectionProps {
    form: UseFormReturn<OptimizerFormData>
    parkId: string
}

// Sample attractions data - in a real app, you would fetch this from an API based on parkId
const SAMPLE_ATTRACTIONS: Record<string, Attraction[]> = {
    'magic-kingdom': [
        { id: 'mk-1', name: 'Space Mountain', waitTime: 45, type: 'RIDE', tags: ['thrill', 'indoor', 'iconic'] },
        { id: 'mk-2', name: 'Seven Dwarfs Mine Train', waitTime: 75, type: 'RIDE', tags: ['family', 'outdoor', 'popular'] },
        { id: 'mk-3', name: 'Peter Pan\'s Flight', waitTime: 60, type: 'RIDE', tags: ['family', 'indoor', 'classic'] },
        { id: 'mk-4', name: 'Big Thunder Mountain Railroad', waitTime: 35, type: 'RIDE', tags: ['thrill', 'outdoor'] },
        { id: 'mk-5', name: 'Haunted Mansion', waitTime: 30, type: 'RIDE', tags: ['family', 'indoor', 'iconic'] },
        { id: 'mk-6', name: 'Pirates of the Caribbean', waitTime: 25, type: 'RIDE', tags: ['family', 'indoor', 'classic'] },
        { id: 'mk-7', name: 'Jungle Cruise', waitTime: 40, type: 'RIDE', tags: ['family', 'outdoor', 'classic'] },
        { id: 'mk-8', name: 'Splash Mountain', waitTime: 50, type: 'RIDE', tags: ['thrill', 'outdoor', 'water'] },
        { id: 'mk-9', name: 'It\'s a Small World', waitTime: 20, type: 'RIDE', tags: ['family', 'indoor', 'classic'] },
        { id: 'mk-10', name: 'Mickey\'s PhilharMagic', waitTime: 15, type: 'SHOW', tags: ['family', 'indoor', '3D'] },
        { id: 'mk-11', name: 'Meet Mickey at Town Square Theater', waitTime: 30, type: 'MEET_AND_GREET', tags: ['character', 'indoor'] },
        { id: 'mk-12', name: 'Buzz Lightyear\'s Space Ranger Spin', waitTime: 25, type: 'RIDE', tags: ['family', 'indoor', 'interactive'] },
    ],
    'epcot': [
        { id: 'ep-1', name: 'Guardians of the Galaxy: Cosmic Rewind', waitTime: 85, type: 'RIDE', tags: ['thrill', 'indoor', 'new'] },
        { id: 'ep-2', name: 'Test Track', waitTime: 70, type: 'RIDE', tags: ['thrill', 'outdoor', 'fast'] },
        { id: 'ep-3', name: 'Soarin\' Around the World', waitTime: 60, type: 'RIDE', tags: ['family', 'indoor', 'scenic'] },
        { id: 'ep-4', name: 'Frozen Ever After', waitTime: 65, type: 'RIDE', tags: ['family', 'indoor', 'water'] },
        { id: 'ep-5', name: 'Remy\'s Ratatouille Adventure', waitTime: 75, type: 'RIDE', tags: ['family', 'indoor', 'new'] },
        { id: 'ep-6', name: 'Mission: SPACE', waitTime: 30, type: 'RIDE', tags: ['thrill', 'indoor', 'intense'] },
        { id: 'ep-7', name: 'Spaceship Earth', waitTime: 25, type: 'RIDE', tags: ['family', 'indoor', 'classic'] },
        { id: 'ep-8', name: 'The Seas with Nemo & Friends', waitTime: 15, type: 'RIDE', tags: ['family', 'indoor', 'slow'] },
    ],
    'hollywood-studios': [
        { id: 'hs-1', name: 'Star Wars: Rise of the Resistance', waitTime: 90, type: 'RIDE', tags: ['thrill', 'indoor', 'immersive'] },
        { id: 'hs-2', name: 'Millennium Falcon: Smugglers Run', waitTime: 65, type: 'RIDE', tags: ['thrill', 'indoor', 'interactive'] },
        { id: 'hs-3', name: 'Slinky Dog Dash', waitTime: 80, type: 'RIDE', tags: ['family', 'outdoor', 'rollercoaster'] },
        { id: 'hs-4', name: 'Toy Story Mania!', waitTime: 60, type: 'RIDE', tags: ['family', 'indoor', 'interactive'] },
        { id: 'hs-5', name: 'Mickey & Minnie\'s Runaway Railway', waitTime: 70, type: 'RIDE', tags: ['family', 'indoor', 'new'] },
        { id: 'hs-6', name: 'Tower of Terror', waitTime: 55, type: 'RIDE', tags: ['thrill', 'indoor', 'drop'] },
        { id: 'hs-7', name: 'Rock \'n\' Roller Coaster', waitTime: 60, type: 'RIDE', tags: ['thrill', 'indoor', 'fast'] },
    ],
    'animal-kingdom': [
        { id: 'ak-1', name: 'Avatar Flight of Passage', waitTime: 90, type: 'RIDE', tags: ['thrill', 'indoor', 'immersive'] },
        { id: 'ak-2', name: 'Na\'vi River Journey', waitTime: 75, type: 'RIDE', tags: ['family', 'indoor', 'scenic'] },
        { id: 'ak-3', name: 'Expedition Everest', waitTime: 55, type: 'RIDE', tags: ['thrill', 'outdoor', 'rollercoaster'] },
        { id: 'ak-4', name: 'Kilimanjaro Safaris', waitTime: 45, type: 'RIDE', tags: ['family', 'outdoor', 'animals'] },
        { id: 'ak-5', name: 'Dinosaur', waitTime: 35, type: 'RIDE', tags: ['thrill', 'indoor', 'intense'] },
        { id: 'ak-6', name: 'Kali River Rapids', waitTime: 40, type: 'RIDE', tags: ['family', 'outdoor', 'water'] },
        { id: 'ak-7', name: 'Festival of the Lion King', waitTime: 30, type: 'SHOW', tags: ['family', 'indoor', 'music'] },
        { id: 'ak-8', name: 'Finding Nemo: The Big Blue... and Beyond!', waitTime: 30, type: 'SHOW', tags: ['family', 'indoor', 'music'] },
    ],
}

export default function AttractionPreferencesSection({ form, parkId }: AttractionPreferencesSectionProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [attractionFilter, setAttractionFilter] = useState("all")
    const [parkAttractions, setParkAttractions] = useState<Attraction[]>([])

    // Set park attractions when parkId changes
    useEffect(() => {
        if (parkId && SAMPLE_ATTRACTIONS[parkId as keyof typeof SAMPLE_ATTRACTIONS]) {
            setParkAttractions(SAMPLE_ATTRACTIONS[parkId as keyof typeof SAMPLE_ATTRACTIONS])

            // Reset priority and excluded attractions when the park changes
            form.setValue("priorityAttractions", [])
            form.setValue("excludedAttractions", [])
        } else {
            setParkAttractions([])
        }
    }, [parkId, form])

    // Get current selected attractions
    const priorityAttractions = form.watch("priorityAttractions") || []
    const excludedAttractions = form.watch("excludedAttractions") || []

    // Add or remove from priority attractions
    const togglePriorityAttraction = (attractionId: string) => {
        const current = [...priorityAttractions]
        const index = current.indexOf(attractionId)

        // Remove from excluded if it's there
        let newExcluded = [...excludedAttractions]
        if (newExcluded.includes(attractionId)) {
            newExcluded = newExcluded.filter(id => id !== attractionId)
            form.setValue("excludedAttractions", newExcluded)
        }

        // Toggle in priority
        if (index === -1) {
            current.push(attractionId)
        } else {
            current.splice(index, 1)
        }

        form.setValue("priorityAttractions", current)
    }

    // Add or remove from excluded attractions
    const toggleExcludedAttraction = (attractionId: string) => {
        const current = [...excludedAttractions]
        const index = current.indexOf(attractionId)

        // Remove from priority if it's there
        let newPriority = [...priorityAttractions]
        if (newPriority.includes(attractionId)) {
            newPriority = newPriority.filter(id => id !== attractionId)
            form.setValue("priorityAttractions", newPriority)
        }

        // Toggle in excluded
        if (index === -1) {
            current.push(attractionId)
        } else {
            current.splice(index, 1)
        }

        form.setValue("excludedAttractions", current)
    }

    // Filter attractions based on search term and filter
    const filteredAttractions = parkAttractions.filter(attraction => {
        // Filter by search term
        const matchesSearch = searchTerm === "" ||
            attraction.name.toLowerCase().includes(searchTerm.toLowerCase())

        // Filter by type
        const matchesType = attractionFilter === "all" ||
            (attractionFilter === "rides" && attraction.type === "RIDE") ||
            (attractionFilter === "shows" && attraction.type === "SHOW") ||
            (attractionFilter === "character" && attraction.type === "MEET_AND_GREET")

        return matchesSearch && matchesType
    })

    if (!parkId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Attraction Preferences</CardTitle>
                    <CardDescription>
                        Please select a park first to customize your attraction preferences.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Attraction Preferences</CardTitle>
                <CardDescription>
                    Choose which attractions you want to prioritize or skip.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="select">
                    <TabsList className="mb-4">
                        <TabsTrigger value="select">Select Attractions</TabsTrigger>
                        <TabsTrigger value="priority">Priority ({priorityAttractions.length})</TabsTrigger>
                        <TabsTrigger value="excluded">Skip ({excludedAttractions.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="select">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search attractions..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex">
                                    <Button
                                        variant={attractionFilter === "all" ? "default" : "outline"}
                                        className="rounded-r-none"
                                        onClick={() => setAttractionFilter("all")}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={attractionFilter === "rides" ? "default" : "outline"}
                                        className="rounded-none border-x-0"
                                        onClick={() => setAttractionFilter("rides")}
                                    >
                                        Rides
                                    </Button>
                                    <Button
                                        variant={attractionFilter === "shows" ? "default" : "outline"}
                                        className="rounded-none border-r-0"
                                        onClick={() => setAttractionFilter("shows")}
                                    >
                                        Shows
                                    </Button>
                                    <Button
                                        variant={attractionFilter === "character" ? "default" : "outline"}
                                        className="rounded-l-none"
                                        onClick={() => setAttractionFilter("character")}
                                    >
                                        Character
                                    </Button>
                                </div>
                            </div>

                            {filteredAttractions.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No attractions found for your search criteria.
                                </div>
                            ) : (
                                <div className="border rounded-lg divide-y">
                                    {filteredAttractions.map((attraction) => (
                                        <div
                                            key={attraction.id}
                                            className="flex items-center justify-between p-3 hover:bg-muted/50"
                                        >
                                            <div className="flex flex-col">
                                                <div className="font-medium">{attraction.name}</div>
                                                <div className="flex items-center mt-1 space-x-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {attraction.type === 'RIDE' ? 'Ride' :
                                                            attraction.type === 'SHOW' ? 'Show' :
                                                                attraction.type === 'MEET_AND_GREET' ? 'Character' :
                                                                    'Attraction'}
                                                    </Badge>
                                                    {attraction.tags.slice(0, 2).map((tag: string) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ~{attraction.waitTime} min wait
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={priorityAttractions.includes(attraction.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => togglePriorityAttraction(attraction.id)}
                                                    className="gap-1"
                                                >
                                                    <StarIcon className="h-4 w-4" />
                                                    Priority
                                                </Button>
                                                <Button
                                                    variant={excludedAttractions.includes(attraction.id) ? "destructive" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleExcludedAttraction(attraction.id)}
                                                    className="gap-1"
                                                >
                                                    <XCircleIcon className="h-4 w-4" />
                                                    Skip
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="priority">
                        {priorityAttractions.length === 0 ? (
                            <div className="text-center p-8 border rounded-lg">
                                <StarIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <h3 className="font-medium">No Priority Attractions</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Select attractions to prioritize in your itinerary.
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {priorityAttractions.map((id: string, index: number) => {
                                    const attraction = parkAttractions.find(a => a.id === id)
                                    if (!attraction) return null

                                    return (
                                        <div key={id} className="flex items-center justify-between p-3">
                                            <div className="flex items-center">
                                                <Badge className="mr-2">{index + 1}</Badge>
                                                <div>
                                                    <div className="font-medium">{attraction.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ~{attraction.waitTime} min wait
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {index > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newPriority = [...priorityAttractions]
                                                            const temp = newPriority[index]
                                                            newPriority[index] = newPriority[index - 1]
                                                            newPriority[index - 1] = temp
                                                            form.setValue("priorityAttractions", newPriority)
                                                        }}
                                                    >
                                                        <ArrowUpIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {index < priorityAttractions.length - 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            const newPriority = [...priorityAttractions]
                                                            const temp = newPriority[index]
                                                            newPriority[index] = newPriority[index + 1]
                                                            newPriority[index + 1] = temp
                                                            form.setValue("priorityAttractions", newPriority)
                                                        }}
                                                    >
                                                        <ArrowDownIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => togglePriorityAttraction(id)}
                                                >
                                                    <XCircleIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="excluded">
                        {excludedAttractions.length === 0 ? (
                            <div className="text-center p-8 border rounded-lg">
                                <XCircleIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                <h3 className="font-medium">No Excluded Attractions</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Select attractions you want to skip in your itinerary.
                                </p>
                            </div>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {excludedAttractions.map((id: string) => {
                                    const attraction = parkAttractions.find(a => a.id === id)
                                    if (!attraction) return null

                                    return (
                                        <div key={id} className="flex items-center justify-between p-3">
                                            <div>
                                                <div className="font-medium">{attraction.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attraction.type === 'RIDE' ? 'Ride' :
                                                        attraction.type === 'SHOW' ? 'Show' :
                                                            attraction.type === 'MEET_AND_GREET' ? 'Character' :
                                                                'Attraction'}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleExcludedAttraction(id)}
                                            >
                                                <XCircleIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}