"use client"

import { useState } from "react"
import { resorts } from "@/lib/utils/resortData"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResortCategory } from "@/types/resort"
import ResortCategorySection from "@/components/resorts/ResortCategorySection"
import ResortHero from "@/components/resorts/ResortHero"
import ResortFilterBar from "@/components/resorts/ResortFilterBar"
import ResortMap from "@/components/resorts/ResortMap"

export default function ResortsPage() {
    const [activeCategory, setActiveCategory] = useState<ResortCategory | "all">("all")
    const [showMap, setShowMap] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredResorts = resorts.filter(resort => {
        const matchesCategory = activeCategory === "all" || resort.category === activeCategory
        const matchesSearch = searchTerm === "" ||
            resort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resort.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resort.longDescription.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesCategory && matchesSearch
    })

    const valueResorts = filteredResorts.filter(resort => resort.category === ResortCategory.Value)
    const moderateResorts = filteredResorts.filter(resort => resort.category === ResortCategory.Moderate)
    const deluxeResorts = filteredResorts.filter(resort => resort.category === ResortCategory.Deluxe)
    const deluxeVillaResorts = filteredResorts.filter(resort => resort.category === ResortCategory.DeluxeVilla)
    const campgroundResorts = filteredResorts.filter(resort => resort.category === ResortCategory.Campground)

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <ResortHero />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Disney World Resorts</h1>

                    <ResortFilterBar
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        showMap={showMap}
                        setShowMap={setShowMap}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    {showMap ? (
                        <ResortMap resorts={filteredResorts} />
                    ) : (
                        <Tabs defaultValue="all" className="w-full"
                            onValueChange={(value) => setActiveCategory(value as ResortCategory | "all")}>
                            <TabsList className="grid grid-cols-6 max-w-3xl mb-8">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value={ResortCategory.Value}>Value</TabsTrigger>
                                <TabsTrigger value={ResortCategory.Moderate}>Moderate</TabsTrigger>
                                <TabsTrigger value={ResortCategory.Deluxe}>Deluxe</TabsTrigger>
                                <TabsTrigger value={ResortCategory.DeluxeVilla}>Villas</TabsTrigger>
                                <TabsTrigger value={ResortCategory.Campground}>Campground</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-12">
                                {valueResorts.length > 0 && <ResortCategorySection
                                    title="Value Resorts"
                                    description="Immersive theming, playful experiences, and budget-friendly options for families"
                                    resorts={valueResorts}
                                />}

                                {moderateResorts.length > 0 && <ResortCategorySection
                                    title="Moderate Resorts"
                                    description="Enchanting themes, enhanced amenities, and a perfect balance of comfort and value"
                                    resorts={moderateResorts}
                                />}

                                {deluxeResorts.length > 0 && <ResortCategorySection
                                    title="Deluxe Resorts"
                                    description="Premium accommodations, exceptional dining, and extraordinary service with signature Disney elegance"
                                    resorts={deluxeResorts}
                                />}

                                {deluxeVillaResorts.length > 0 && <ResortCategorySection
                                    title="Deluxe Villas"
                                    description="Spacious home-like accommodations with multiple bedrooms and full kitchens"
                                    resorts={deluxeVillaResorts}
                                />}

                                {campgroundResorts.length > 0 && <ResortCategorySection
                                    title="Campgrounds"
                                    description="Rustic charm with modern amenities in a natural setting"
                                    resorts={campgroundResorts}
                                />}
                            </TabsContent>

                            <TabsContent value={ResortCategory.Value}>
                                <ResortCategorySection
                                    title="Value Resorts"
                                    description="Immersive theming, playful experiences, and budget-friendly options for families"
                                    resorts={valueResorts}
                                />
                            </TabsContent>

                            <TabsContent value={ResortCategory.Moderate}>
                                <ResortCategorySection
                                    title="Moderate Resorts"
                                    description="Enchanting themes, enhanced amenities, and a perfect balance of comfort and value"
                                    resorts={moderateResorts}
                                />
                            </TabsContent>

                            <TabsContent value={ResortCategory.Deluxe}>
                                <ResortCategorySection
                                    title="Deluxe Resorts"
                                    description="Premium accommodations, exceptional dining, and extraordinary service with signature Disney elegance"
                                    resorts={deluxeResorts}
                                />
                            </TabsContent>

                            <TabsContent value={ResortCategory.DeluxeVilla}>
                                <ResortCategorySection
                                    title="Deluxe Villas"
                                    description="Spacious home-like accommodations with multiple bedrooms and full kitchens"
                                    resorts={deluxeVillaResorts}
                                />
                            </TabsContent>

                            <TabsContent value={ResortCategory.Campground}>
                                <ResortCategorySection
                                    title="Campgrounds"
                                    description="Rustic charm with modern amenities in a natural setting"
                                    resorts={campgroundResorts}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </div>
        </div>
    )
}