"use client"

import { useState } from "react"
import { disneySpringsLocations } from "@/lib/utils/disneySpringsData"
import { LocationCategory } from "@/types/disneysprings"
import DisneySpringsHero from "@/components/disneysprings/DisneySpringsHero"
import DisneySpringsFilterBar from "@/components/disneysprings/DisneySpringsFilterBar"
import DisneySpringsLocationCategory from "@/components/disneysprings/DisneySpringsCategory"
import DisneySpringsMap from "@/components/disneysprings/DisneySpringsMap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DisneySpringsPage() {
    const [activeCategory, setActiveCategory] = useState<LocationCategory | "all">("all")
    const [showMap, setShowMap] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredLocations = disneySpringsLocations.filter(location => {
        const matchesCategory = activeCategory === "all" || location.category === activeCategory
        const matchesSearch = searchTerm === "" ||
            location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            location.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesCategory && matchesSearch
    })

    const filteredShoppingLocations = filteredLocations.filter(
        location => location.category === LocationCategory.Shopping
    )

    const filteredDiningLocations = filteredLocations.filter(
        location => location.category === LocationCategory.Dining
    )

    const filteredEntertainmentLocations = filteredLocations.filter(
        location => location.category === LocationCategory.Entertainment
    )

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <DisneySpringsHero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Disney Springs</h1>

                    <DisneySpringsFilterBar
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        showMap={showMap}
                        setShowMap={setShowMap}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    {showMap ? (
                        <DisneySpringsMap locations={filteredLocations} />
                    ) : (
                        <Tabs defaultValue="all" className="w-full"
                            onValueChange={(value) => setActiveCategory(value as LocationCategory | "all")}>
                            <TabsList className="grid grid-cols-4 max-w-md mb-8">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Shopping}>Shopping</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Dining}>Dining</TabsTrigger>
                                <TabsTrigger value={LocationCategory.Entertainment}>Entertainment</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-12">
                                {filteredShoppingLocations.length > 0 &&
                                    <DisneySpringsLocationCategory
                                        title="Shopping"
                                        description="From world-class boutiques to one-of-a-kind treasures, Disney Springs offers a variety of shopping experiences."
                                        locations={filteredShoppingLocations}
                                    />
                                }

                                {filteredDiningLocations.length > 0 &&
                                    <DisneySpringsLocationCategory
                                        title="Dining"
                                        description="Savor a diverse range of dining options, from quick bites to signature restaurants by award-winning chefs."
                                        locations={filteredDiningLocations}
                                    />
                                }

                                {filteredEntertainmentLocations.length > 0 &&
                                    <DisneySpringsLocationCategory
                                        title="Entertainment & Experiences"
                                        description="Enjoy live performances, unique experiences, and family-friendly attractions throughout Disney Springs."
                                        locations={filteredEntertainmentLocations}
                                    />
                                }
                            </TabsContent>

                            <TabsContent value={LocationCategory.Shopping}>
                                <DisneySpringsLocationCategory
                                    title="Shopping"
                                    description="From world-class boutiques to one-of-a-kind treasures, Disney Springs offers a variety of shopping experiences."
                                    locations={filteredShoppingLocations}
                                />
                            </TabsContent>

                            <TabsContent value={LocationCategory.Dining}>
                                <DisneySpringsLocationCategory
                                    title="Dining"
                                    description="Savor a diverse range of dining options, from quick bites to signature restaurants by award-winning chefs."
                                    locations={filteredDiningLocations}
                                />
                            </TabsContent>

                            <TabsContent value={LocationCategory.Entertainment}>
                                <DisneySpringsLocationCategory
                                    title="Entertainment & Experiences"
                                    description="Enjoy live performances, unique experiences, and family-friendly attractions throughout Disney Springs."
                                    locations={filteredEntertainmentLocations}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    )
}