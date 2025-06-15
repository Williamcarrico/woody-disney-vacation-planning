"use client"

import { useState, useCallback, memo } from "react"
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
import { withSelectiveMemo } from "@/lib/performance/optimization-utils"

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

// Memoized filter badge component
const FilterBadge = memo<{
    icon?: React.ReactNode;
    label: string;
    onRemove: () => void;
}>(
    function FilterBadge({ icon, label, onRemove }) {
        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                {icon}
                {label}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={onRemove}
                >
                    ×
                </Button>
            </Badge>
        );
    }
);

// Memoized advanced filters content
const AdvancedFiltersContent = memo<{
    maxWaitTime: number;
    accessibilityFilters: string[];
    heightFilters: string[];
    onMaxWaitTimeChange: (time: number) => void;
    onToggleAccessibilityFilter: (filter: string) => void;
    onToggleHeightFilter: (filter: string) => void;
    onReset: () => void;
    onClose: () => void;
}>(
    function AdvancedFiltersContent({
        maxWaitTime,
        accessibilityFilters,
        heightFilters,
        onMaxWaitTimeChange,
        onToggleAccessibilityFilter,
        onToggleHeightFilter,
        onReset,
        onClose,
    }) {
        const handleWaitTimeChange = useCallback((values: number[]) => {
            onMaxWaitTimeChange(values[0]);
        }, [onMaxWaitTimeChange]);

        return (
            <>
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
                        onValueChange={handleWaitTimeChange}
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
                            onCheckedChange={() => onToggleAccessibilityFilter("wheelchairAccessible")}
                        >
                            Wheelchair Accessible
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={accessibilityFilters.includes("serviceAnimals")}
                            onCheckedChange={() => onToggleAccessibilityFilter("serviceAnimals")}
                        >
                            Service Animals Allowed
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={accessibilityFilters.includes("assistiveListening")}
                            onCheckedChange={() => onToggleAccessibilityFilter("assistiveListening")}
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
                            onCheckedChange={() => onToggleHeightFilter("anyHeight")}
                        >
                            Any Height
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={heightFilters.includes("under40")}
                            onCheckedChange={() => onToggleHeightFilter("under40")}
                        >
                            Under 40&quot; (102cm)
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={heightFilters.includes("under48")}
                            onCheckedChange={() => onToggleHeightFilter("under48")}
                        >
                            Under 48&quot; (122cm)
                        </DropdownMenuCheckboxItem>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2 flex justify-between">
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Reset All
                    </Button>
                    <Button size="sm" onClick={onClose}>
                        <Check className="h-4 w-4 mr-1" /> Apply
                    </Button>
                </div>
            </>
        );
    }
);

export const OptimizedAttractionFilterBar = withSelectiveMemo(
    function OptimizedAttractionFilterBar({
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
        const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

        // Memoized callbacks
        const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
        }, [setSearchTerm]);

        const handleParkChange = useCallback((value: string) => {
            if (value === "all" || Object.values(Park).includes(value as Park)) {
                setSelectedPark(value as Park | "all");
            }
        }, [setSelectedPark]);

        const handleTypeChange = useCallback((value: string) => {
            if (value === "all" || Object.values(AttractionType).includes(value as AttractionType)) {
                setSelectedType(value as AttractionType | "all");
            }
        }, [setSelectedType]);

        const toggleMap = useCallback(() => {
            setShowMap(!showMap);
        }, [showMap, setShowMap]);

        const toggleAccessibilityFilter = useCallback((filter: string) => {
            if (accessibilityFilters.includes(filter)) {
                setAccessibilityFilters(accessibilityFilters.filter(f => f !== filter));
            } else {
                setAccessibilityFilters([...accessibilityFilters, filter]);
            }
        }, [accessibilityFilters, setAccessibilityFilters]);

        const toggleHeightFilter = useCallback((filter: string) => {
            if (heightFilters.includes(filter)) {
                setHeightFilters(heightFilters.filter(f => f !== filter));
            } else {
                setHeightFilters([...heightFilters, filter]);
            }
        }, [heightFilters, setHeightFilters]);

        const resetAllFilters = useCallback(() => {
            setAccessibilityFilters([]);
            setHeightFilters([]);
            setMaxWaitTime(120);
        }, [setAccessibilityFilters, setHeightFilters, setMaxWaitTime]);

        const closeAdvancedFilters = useCallback(() => {
            setIsAdvancedFiltersOpen(false);
        }, []);

        const resetMaxWaitTime = useCallback(() => {
            setMaxWaitTime(120);
        }, [setMaxWaitTime]);

        // Filter removal callbacks
        const removeWheelchairFilter = useCallback(() => {
            toggleAccessibilityFilter("wheelchairAccessible");
        }, [toggleAccessibilityFilter]);

        const removeServiceAnimalsFilter = useCallback(() => {
            toggleAccessibilityFilter("serviceAnimals");
        }, [toggleAccessibilityFilter]);

        const removeAnyHeightFilter = useCallback(() => {
            toggleHeightFilter("anyHeight");
        }, [toggleHeightFilter]);

        const removeUnder40Filter = useCallback(() => {
            toggleHeightFilter("under40");
        }, [toggleHeightFilter]);

        const removeUnder48Filter = useCallback(() => {
            toggleHeightFilter("under48");
        }, [toggleHeightFilter]);

        // Calculate total active filters
        const totalActiveFilters = accessibilityFilters.length + heightFilters.length;
        const hasActiveFilters = totalActiveFilters > 0 || maxWaitTime < 120;

        return (
            <div className="w-full space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search attractions..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Select value={selectedPark} onValueChange={handleParkChange}>
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

                        <Select value={selectedType} onValueChange={handleTypeChange}>
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
                            onClick={toggleMap}
                            size="icon"
                        >
                            <Map className="h-4 w-4" />
                        </Button>

                        <DropdownMenu open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                    {totalActiveFilters > 0 && (
                                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                            {totalActiveFilters}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80">
                                <AdvancedFiltersContent
                                    maxWaitTime={maxWaitTime}
                                    accessibilityFilters={accessibilityFilters}
                                    heightFilters={heightFilters}
                                    onMaxWaitTimeChange={setMaxWaitTime}
                                    onToggleAccessibilityFilter={toggleAccessibilityFilter}
                                    onToggleHeightFilter={toggleHeightFilter}
                                    onReset={resetAllFilters}
                                    onClose={closeAdvancedFilters}
                                />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Active filters display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-muted-foreground">Active Filters:</span>

                        {accessibilityFilters.includes("wheelchairAccessible") && (
                            <FilterBadge
                                icon={<Accessibility className="h-3 w-3" />}
                                label="Wheelchair Accessible"
                                onRemove={removeWheelchairFilter}
                            />
                        )}

                        {accessibilityFilters.includes("serviceAnimals") && (
                            <FilterBadge
                                label="Service Animals"
                                onRemove={removeServiceAnimalsFilter}
                            />
                        )}

                        {heightFilters.includes("anyHeight") && (
                            <FilterBadge
                                icon={<Ruler className="h-3 w-3" />}
                                label="Any Height"
                                onRemove={removeAnyHeightFilter}
                            />
                        )}

                        {heightFilters.includes("under40") && (
                            <FilterBadge
                                icon={<Baby className="h-3 w-3" />}
                                label='Under 40"'
                                onRemove={removeUnder40Filter}
                            />
                        )}

                        {heightFilters.includes("under48") && (
                            <FilterBadge
                                icon={<Baby className="h-3 w-3" />}
                                label='Under 48"'
                                onRemove={removeUnder48Filter}
                            />
                        )}

                        {maxWaitTime < 120 && (
                            <FilterBadge
                                icon={<Clock className="h-3 w-3" />}
                                label={`Max Wait: ${maxWaitTime} min`}
                                onRemove={resetMaxWaitTime}
                            />
                        )}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs ml-auto"
                            onClick={resetAllFilters}
                        >
                            Clear All
                        </Button>
                    </div>
                )}
            </div>
        );
    },
    ['selectedPark', 'selectedType', 'searchTerm', 'showMap', 'maxWaitTime']
);

export default OptimizedAttractionFilterBar;