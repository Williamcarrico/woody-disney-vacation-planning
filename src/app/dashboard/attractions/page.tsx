"use client"

import { useState } from "react"
import { attractions } from "@/lib/utils/attractionData"
import { Attraction, AttractionType, Park } from "@/types/attraction"
import AttractionCard from "@/components/attractions/AttractionCard"
import AttractionDetail from "@/components/attractions/AttractionDetail"
import AttractionFilterBar from "@/components/attractions/AttractionFilterBar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ParkingMeter as ParkIcon, Sparkles, Ticket } from "lucide-react"

export default function AttractionsPage() {
    // State for filters
    const [selectedPark, setSelectedPark] = useState<Park | "all">("all")
    const [selectedType, setSelectedType] = useState<AttractionType | "all">("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [showMap, setShowMap] = useState(false)
    const [maxWaitTime, setMaxWaitTime] = useState(120)
    const [accessibilityFilters, setAccessibilityFilters] = useState<string[]>([])
    const [heightFilters, setHeightFilters] = useState<string[]>([])

    // State for selected attraction
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null)

    // Filter attractions based on selected filters
    const filteredAttractions = attractions.filter(attraction => {
        // Park filter
        const matchesPark = selectedPark === "all" || attraction.park === selectedPark

        // Type filter
        const matchesType = selectedType === "all" || attraction.attractionType.includes(selectedType)

        // Search filter
        const matchesSearch =
            searchTerm === "" ||
            attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attraction.description.toLowerCase().includes(searchTerm.toLowerCase())

        // Accessibility filters
        let matchesAccessibility = true
        if (accessibilityFilters.includes("wheelchairAccessible")) {
            matchesAccessibility = matchesAccessibility &&
                attraction.accessibilityInfo.wheelchairAccessible === "May Remain in Wheelchair/ECV"
        }
        if (accessibilityFilters.includes("serviceAnimals")) {
            matchesAccessibility = matchesAccessibility &&
                attraction.accessibilityInfo.serviceAnimalsAllowed
        }
        if (accessibilityFilters.includes("assistiveListening")) {
            matchesAccessibility = matchesAccessibility &&
                attraction.accessibilityInfo.hasAssistiveListening
        }

        // Height filters
        let matchesHeight = true
        if (heightFilters.length > 0) {
            if (heightFilters.includes("anyHeight")) {
                matchesHeight = !attraction.heightRequirement
            }
            if (heightFilters.includes("under40") && attraction.heightRequirement) {
                matchesHeight = matchesHeight ||
                    (attraction.heightRequirement.min !== undefined && attraction.heightRequirement.min <= 40)
            }
            if (heightFilters.includes("under48") && attraction.heightRequirement) {
                matchesHeight = matchesHeight ||
                    (attraction.heightRequirement.min !== undefined && attraction.heightRequirement.min <= 48)
            }
        }

        return matchesPark && matchesType && matchesSearch && matchesAccessibility &&
            (heightFilters.length === 0 || matchesHeight)
    })

    // Group attractions by park
    const magicKingdomAttractions = filteredAttractions.filter(
        attraction => attraction.park === Park.MagicKingdom
    )
    const epcotAttractions = filteredAttractions.filter(
        attraction => attraction.park === Park.Epcot
    )
    const hollywoodStudiosAttractions = filteredAttractions.filter(
        attraction => attraction.park === Park.HollywoodStudios
    )
    const animalKingdomAttractions = filteredAttractions.filter(
        attraction => attraction.park === Park.AnimalKingdom
    )
    const disneySpringsMallAttractions = filteredAttractions.filter(
        attraction => attraction.park === Park.DisneySpringsMall
    )
    const waterParkAttractions = filteredAttractions.filter(
        attraction =>
            attraction.park === Park.TyphoonLagoon ||
            attraction.park === Park.BlizzardBeach
    )

    // Add attraction to itinerary (placeholder function)
    const handleAddToItinerary = (attraction: Attraction) => {
        console.log("Adding to itinerary:", attraction.name)
        // This would connect to your actual itinerary system
    }

    // Park section component to avoid repetition
    const ParkSection = ({
        title,
        attractions,
        icon
    }: {
        title: string,
        attractions: Attraction[],
        icon: React.ReactNode
    }) => {
        if (attractions.length === 0) return null

        return (
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    {icon}
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <span className="text-sm font-medium text-muted-foreground ml-2">
                        ({attractions.length} attractions)
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attractions.map((attraction) => (
                        <AttractionCard
                            key={attraction.id}
                            attraction={attraction}
                            isOperating={true} // You would get this from your live data
                            waitTime={Math.floor(Math.random() * 90)} // Simulating random wait times
                            onSelect={() => setSelectedAttraction(attraction)}
                            onAddToItinerary={() => handleAddToItinerary(attraction)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Disney World Attractions
                    </h1>
                    <p className="text-lg text-white/90 max-w-3xl">
                        Explore all the magical attractions, shows, and experiences across Walt Disney World Resort.
                        From thrilling rides to captivating shows, find your next adventure here.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AttractionFilterBar
                    selectedPark={selectedPark}
                    setSelectedPark={setSelectedPark}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showMap={showMap}
                    setShowMap={setShowMap}
                    maxWaitTime={maxWaitTime}
                    setMaxWaitTime={setMaxWaitTime}
                    accessibilityFilters={accessibilityFilters}
                    setAccessibilityFilters={setAccessibilityFilters}
                    heightFilters={heightFilters}
                    setHeightFilters={setHeightFilters}
                />

                <Separator className="my-8" />

                {filteredAttractions.length === 0 ? (
                    <div className="text-center py-20">
                        <Ticket className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            No Attractions Found
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Try adjusting your filters or search terms to find Disney attractions.
                        </p>
                    </div>
                ) : showMap ? (
                    <div className="h-[600px] w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <ParkIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                                Interactive Map Coming Soon
                            </h3>
                            <p className="text-gray-500 max-w-md mt-2">
                                Our interactive map is currently under development. You&apos;ll soon be able to explore
                                attractions on an interactive Disney World map!
                            </p>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-8">
                            <TabsTrigger value="all">All Parks</TabsTrigger>
                            <TabsTrigger value="magic-kingdom">Magic Kingdom</TabsTrigger>
                            <TabsTrigger value="epcot">EPCOT</TabsTrigger>
                            <TabsTrigger value="hollywood-studios">Hollywood Studios</TabsTrigger>
                            <TabsTrigger value="animal-kingdom">Animal Kingdom</TabsTrigger>
                            <TabsTrigger value="disney-springs">Disney Springs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-12">
                            <ParkSection
                                title="Magic Kingdom"
                                attractions={magicKingdomAttractions}
                                icon={<Sparkles className="h-6 w-6 text-blue-500" />}
                            />
                            <ParkSection
                                title="EPCOT"
                                attractions={epcotAttractions}
                                icon={<Sparkles className="h-6 w-6 text-violet-500" />}
                            />
                            <ParkSection
                                title="Hollywood Studios"
                                attractions={hollywoodStudiosAttractions}
                                icon={<Sparkles className="h-6 w-6 text-red-500" />}
                            />
                            <ParkSection
                                title="Animal Kingdom"
                                attractions={animalKingdomAttractions}
                                icon={<Sparkles className="h-6 w-6 text-green-500" />}
                            />
                            <ParkSection
                                title="Disney Springs"
                                attractions={disneySpringsMallAttractions}
                                icon={<Sparkles className="h-6 w-6 text-amber-500" />}
                            />
                            <ParkSection
                                title="Water Parks"
                                attractions={waterParkAttractions}
                                icon={<Sparkles className="h-6 w-6 text-cyan-500" />}
                            />
                        </TabsContent>

                        <TabsContent value="magic-kingdom">
                            <ParkSection
                                title="Magic Kingdom"
                                attractions={magicKingdomAttractions}
                                icon={<Sparkles className="h-6 w-6 text-blue-500" />}
                            />
                        </TabsContent>

                        <TabsContent value="epcot">
                            <ParkSection
                                title="EPCOT"
                                attractions={epcotAttractions}
                                icon={<Sparkles className="h-6 w-6 text-violet-500" />}
                            />
                        </TabsContent>

                        <TabsContent value="hollywood-studios">
                            <ParkSection
                                title="Hollywood Studios"
                                attractions={hollywoodStudiosAttractions}
                                icon={<Sparkles className="h-6 w-6 text-red-500" />}
                            />
                        </TabsContent>

                        <TabsContent value="animal-kingdom">
                            <ParkSection
                                title="Animal Kingdom"
                                attractions={animalKingdomAttractions}
                                icon={<Sparkles className="h-6 w-6 text-green-500" />}
                            />
                        </TabsContent>

                        <TabsContent value="disney-springs">
                            <ParkSection
                                title="Disney Springs"
                                attractions={disneySpringsMallAttractions}
                                icon={<Sparkles className="h-6 w-6 text-amber-500" />}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Attraction Detail Dialog */}
            <Dialog open={selectedAttraction !== null} onOpenChange={(open) => !open && setSelectedAttraction(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden">
                    {selectedAttraction && (
                        <AttractionDetail
                            attraction={selectedAttraction}
                            isOperating={true}
                            waitTime={Math.floor(Math.random() * 90)}
                            onAddToItinerary={() => handleAddToItinerary(selectedAttraction)}
                            onBack={() => setSelectedAttraction(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}