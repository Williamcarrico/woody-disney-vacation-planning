"use client"

import { useState } from "react"
import { AttractionType, Park } from "@/types/attraction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Filter,
    Map,
    Clock,
    Check,
    Ruler,
    Baby,
    Accessibility
} from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface AttractionFilterBarProps {
    readonly selectedPark: Park | "all"
    readonly setSelectedPark: (park: Park | "all") => void
    readonly selectedType: AttractionType | "all"
    readonly setSelectedType: (type: AttractionType | "all") => void
    readonly searchTerm: string
    readonly setSearchTerm: (term: string) => void
    readonly showMap: boolean
    readonly setShowMap: (show: boolean) => void
    readonly maxWaitTime: number
    readonly setMaxWaitTime: (time: number) => void
    readonly accessibilityFilters: string[]
    readonly setAccessibilityFilters: (filters: string[]) => void
    readonly heightFilters: string[]
    readonly setHeightFilters: (filters: string[]) => void
}

export default function AttractionFilterBar({
    selectedPark,
    setSelectedPark,
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    showMap,
    setShowMap,
    maxWaitTime,
    setMaxWaitTime,
    accessibilityFilters,
    setAccessibilityFilters,
    heightFilters,
    setHeightFilters
}: AttractionFilterBarProps) {
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

    // Helper function to toggle a filter in an array
    const toggleFilter = (array: string[], item: string, setter: (items: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item))
        } else {
            setter([...array, item])
        }
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search attractions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-3">
                    <Select
                        value={selectedPark}
                        onValueChange={(value: string) => {
                            if (value === "all" || Object.values(Park).includes(value as Park)) {
                                setSelectedPark(value as Park | "all");
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Park" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Parks</SelectItem>
                            {Object.values(Park).map(park => (
                                <SelectItem key={park} value={park}>{park}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedType}
                        onValueChange={(value: string) => {
                            if (value === "all" || Object.values(AttractionType).includes(value as AttractionType)) {
                                setSelectedType(value as AttractionType | "all");
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Attraction Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.values(AttractionType).map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant={showMap ? "default" : "outline"}
                        onClick={() => setShowMap(!showMap)}
                        size="icon"
                    >
                        <Map className="h-4 w-4" />
                    </Button>

                    <DropdownMenu open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                                {(accessibilityFilters.length > 0 || heightFilters.length > 0) && (
                                    <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                        {accessibilityFilters.length + heightFilters.length}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80">
                            <DropdownMenuLabel>Advanced Filters</DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <div className="p-2">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Wait Time (max {maxWaitTime} min)
                                </h4>
                                <Slider
                                    value={[maxWaitTime]}
                                    min={10}
                                    max={120}
                                    step={10}
                                    onValueChange={(values) => setMaxWaitTime(values[0])}
                                    className="py-4"
                                />
                            </div>

                            <DropdownMenuSeparator />

                            <div className="p-2">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Accessibility className="h-4 w-4" /> Accessibility
                                </h4>
                                <div className="space-y-2">
                                    <DropdownMenuCheckboxItem
                                        checked={accessibilityFilters.includes("wheelchairAccessible")}
                                        onCheckedChange={() => toggleFilter(
                                            accessibilityFilters,
                                            "wheelchairAccessible",
                                            setAccessibilityFilters
                                        )}
                                    >
                                        Wheelchair Accessible
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={accessibilityFilters.includes("serviceAnimals")}
                                        onCheckedChange={() => toggleFilter(
                                            accessibilityFilters,
                                            "serviceAnimals",
                                            setAccessibilityFilters
                                        )}
                                    >
                                        Service Animals Allowed
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={accessibilityFilters.includes("assistiveListening")}
                                        onCheckedChange={() => toggleFilter(
                                            accessibilityFilters,
                                            "assistiveListening",
                                            setAccessibilityFilters
                                        )}
                                    >
                                        Assistive Listening
                                    </DropdownMenuCheckboxItem>
                                </div>
                            </div>

                            <DropdownMenuSeparator />

                            <div className="p-2">
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                    <Ruler className="h-4 w-4" /> Height Requirements
                                </h4>
                                <div className="space-y-2">
                                    <DropdownMenuCheckboxItem
                                        checked={heightFilters.includes("anyHeight")}
                                        onCheckedChange={() => toggleFilter(heightFilters, "anyHeight", setHeightFilters)}
                                    >
                                        Any Height
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={heightFilters.includes("under40")}
                                        onCheckedChange={() => toggleFilter(heightFilters, "under40", setHeightFilters)}
                                    >
                                        Under 40&quot; (102cm)
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem
                                        checked={heightFilters.includes("under48")}
                                        onCheckedChange={() => toggleFilter(heightFilters, "under48", setHeightFilters)}
                                    >
                                        Under 48&quot; (122cm)
                                    </DropdownMenuCheckboxItem>
                                </div>
                            </div>

                            <DropdownMenuSeparator />

                            <div className="p-2 flex justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setAccessibilityFilters([])
                                        setHeightFilters([])
                                        setMaxWaitTime(120)
                                    }}
                                >
                                    Reset All
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setIsAdvancedFiltersOpen(false)}
                                >
                                    <Check className="h-4 w-4 mr-1" /> Apply
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Active filters display */}
            {(accessibilityFilters.length > 0 || heightFilters.length > 0) && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Active Filters:</span>

                    {accessibilityFilters.includes("wheelchairAccessible") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Accessibility className="h-3 w-3" />
                            Wheelchair Accessible
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFilter(accessibilityFilters, "wheelchairAccessible", setAccessibilityFilters)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    {accessibilityFilters.includes("serviceAnimals") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            Service Animals
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFilter(accessibilityFilters, "serviceAnimals", setAccessibilityFilters)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    {heightFilters.includes("anyHeight") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Ruler className="h-3 w-3" />
                            Any Height
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFilter(heightFilters, "anyHeight", setHeightFilters)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    {heightFilters.includes("under40") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Baby className="h-3 w-3" />
                            Under 40&quot;
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFilter(heightFilters, "under40", setHeightFilters)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    {heightFilters.includes("under48") && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Baby className="h-3 w-3" />
                            Under 48&quot;
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => toggleFilter(heightFilters, "under48", setHeightFilters)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    {maxWaitTime < 120 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Max Wait: {maxWaitTime} min
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => setMaxWaitTime(120)}
                            >
                                ×
                            </Button>
                        </Badge>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs ml-auto"
                        onClick={() => {
                            setAccessibilityFilters([])
                            setHeightFilters([])
                            setMaxWaitTime(120)
                        }}
                    >
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    )
}