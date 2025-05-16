"use client"

import { ResortCategory } from "@/types/resort"
import { Search, Map, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ResortFilterBarProps {
    readonly activeCategory: ResortCategory | "all"
    readonly setActiveCategory: (category: ResortCategory | "all") => void
    readonly showMap: boolean
    readonly setShowMap: (show: boolean) => void
    readonly searchTerm: string
    readonly setSearchTerm: (term: string) => void
}

export default function ResortFilterBar({
    activeCategory,
    setActiveCategory,
    showMap,
    setShowMap,
    searchTerm,
    setSearchTerm
}: ResortFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <div className="relative w-full md:w-auto flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                    className="pl-10 pr-4 py-2 w-full"
                    placeholder="Search resorts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    variant={activeCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory("all")}
                >
                    All
                </Button>
                {Object.values(ResortCategory).map((category) => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </Button>
                ))}
            </div>

            <div className="flex gap-2">
                <Button
                    variant={showMap ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMap(true)}
                >
                    <Map size={18} className="mr-2" />
                    Map View
                </Button>
                <Button
                    variant={showMap ? "outline" : "default"}
                    size="sm"
                    onClick={() => setShowMap(false)}
                >
                    <Grid3X3 size={18} className="mr-2" />
                    Grid View
                </Button>
            </div>
        </div>
    )
}