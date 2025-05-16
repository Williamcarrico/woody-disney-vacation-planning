"use client"

import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Map, List } from "lucide-react"
import { LocationCategory } from "@/types/disneysprings"

interface DisneySpringsFilterBarProps {
    readonly activeCategory: LocationCategory | "all"
    readonly setActiveCategory: Dispatch<SetStateAction<LocationCategory | "all">>
    readonly showMap: boolean
    readonly setShowMap: Dispatch<SetStateAction<boolean>>
    readonly searchTerm: string
    readonly setSearchTerm: Dispatch<SetStateAction<string>>
}

export default function DisneySpringsFilterBar({
    activeCategory,
    setActiveCategory,
    showMap,
    setShowMap,
    searchTerm,
    setSearchTerm
}: DisneySpringsFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex flex-wrap gap-2">
                <Button
                    onClick={() => setActiveCategory("all")}
                    variant={activeCategory === "all" ? "default" : "outline"}
                    size="sm"
                >
                    All
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Shopping)}
                    variant={activeCategory === LocationCategory.Shopping ? "default" : "outline"}
                    size="sm"
                >
                    Shopping
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Dining)}
                    variant={activeCategory === LocationCategory.Dining ? "default" : "outline"}
                    size="sm"
                >
                    Dining
                </Button>
                <Button
                    onClick={() => setActiveCategory(LocationCategory.Entertainment)}
                    variant={activeCategory === LocationCategory.Entertainment ? "default" : "outline"}
                    size="sm"
                >
                    Entertainment
                </Button>
            </div>

            <div className="flex w-full md:w-auto gap-4">
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search locations..."
                        className="pl-9 h-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMap(!showMap)}
                    className="flex items-center gap-2"
                >
                    {showMap ? (
                        <>
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">List View</span>
                        </>
                    ) : (
                        <>
                            <Map className="h-4 w-4" />
                            <span className="hidden sm:inline">Map View</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}