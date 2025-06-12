"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    ResortListResponse,
    ResortQuery,
    validateResortQuery,
    DEFAULT_RESORT_QUERY,
    RESORT_CATEGORIES
} from "@/types/unified-resort"
import ResortCategorySection from "@/components/resorts/ResortCategorySection"
import ResortHero from "@/components/resorts/ResortHero"
import ResortMap from "@/components/resorts/ResortMap"
import { BlurFade } from "@/components/ui/blur-fade"
import { Particles } from "@/components/ui/particles"
import {
    Search,
    Map,
    Grid3X3,
    DollarSign,
    Utensils,
    Building,
    Sparkles,
    SlidersHorizontal,
    RefreshCw,
    AlertCircle,
    Wifi,
    WifiOff,
    Database,
    Cloud,
    HardDrive
} from "lucide-react"

import { useTheme } from "next-themes"

// Enhanced interfaces for better type safety
interface FilterState {
    category: string
    priceRange: [number, number]
    area: string
    amenities: string[]
    transportation: string[]
    sortBy: 'name' | 'price' | 'rating' | 'distance' | 'category'
    sortOrder: 'asc' | 'desc'
}

interface ViewState {
    mode: 'grid' | 'map' | 'comparison'
    showFilters: boolean
    showStats: boolean
    selectedResorts: string[]
}

// API Response interfaces with better error handling
interface ApiResponse<T = unknown> {
    success: boolean
    message?: string
    data?: T
    error?: {
        code: string
        message: string
        details?: unknown
    }
}

// Type guards for better runtime safety
function isValidPriceRange(value: unknown): value is [number, number] {
    return Array.isArray(value) && value.length === 2 &&
        typeof value[0] === 'number' && typeof value[1] === 'number'
}



function isValidSortBy(value: string): value is FilterState['sortBy'] {
    return ['name', 'price', 'rating', 'distance', 'category'].includes(value)
}

export default function ResortsPage() {
    const { theme } = useTheme()
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [resortData, setResortData] = useState<ResortListResponse | null>(null)
    const [isOnline, setIsOnline] = useState(true)
    const [retryCount, setRetryCount] = useState(0)

    // Advanced filter state with proper defaults
    const [filters, setFilters] = useState<FilterState>({
        category: "all",
        priceRange: [0, 2000],
        area: "all",
        amenities: [],
        transportation: [],
        sortBy: "name",
        sortOrder: "asc"
    })

    // View state management
    const [viewState, setViewState] = useState<ViewState>({
        mode: "grid",
        showFilters: false,
        showStats: true,
        selectedResorts: []
    })

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    // Fetch resorts from API with enhanced error handling and retry logic
    const fetchResorts = useCallback(async (retryAttempt = 0) => {
        setIsLoading(true)
        setError(null)

        try {
            // Build query parameters using validated schema
            const queryData: Partial<ResortQuery> = {
                ...DEFAULT_RESORT_QUERY,
                page: 1,
                limit: 50,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder,
                useCache: true
            }

            // Add filters to query
            if (filters.category !== "all") {
                // Map the filter category to the schema enum value
                const categoryMap: Record<string, typeof RESORT_CATEGORIES[keyof typeof RESORT_CATEGORIES]> = {
                    'value': RESORT_CATEGORIES.VALUE,
                    'moderate': RESORT_CATEGORIES.MODERATE,
                    'deluxe': RESORT_CATEGORIES.DELUXE,
                    'villa': RESORT_CATEGORIES.VILLA,
                    'campground': RESORT_CATEGORIES.CAMPGROUND
                }
                if (categoryMap[filters.category]) {
                    queryData.category = categoryMap[filters.category]
                }
            }
            if (filters.area !== "all") {
                queryData.area = filters.area
            }
            if (searchTerm.trim()) {
                queryData.search = searchTerm.trim()
            }
            if (filters.priceRange[0] > 0) {
                queryData.minPrice = filters.priceRange[0]
            }
            if (filters.priceRange[1] < 2000) {
                queryData.maxPrice = filters.priceRange[1]
            }
            if (filters.amenities.length > 0) {
                queryData.amenities = filters.amenities
            }

            // Validate query parameters
            const validatedQuery = validateResortQuery(queryData)
            const queryParams = new URLSearchParams()

            // Build query string from validated data
            Object.entries(validatedQuery).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        queryParams.append(key, value.join(','))
                    } else {
                        queryParams.append(key, String(value))
                    }
                }
            })

            const response = await fetch(`/api/resorts?${queryParams.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add timeout for better UX
                signal: AbortSignal.timeout(30000) // 30 second timeout
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json() as ApiResponse<ResortListResponse>

            if (!data.success) {
                throw new Error(data.error?.message || data.message || 'Failed to fetch resorts')
            }

            if (!data.data) {
                throw new Error('No data received from API')
            }

            setResortData(data.data)
            setRetryCount(0) // Reset retry count on success
        } catch (err) {
            console.error('Error fetching resorts:', err)

            let errorMessage = 'Failed to load resorts'

            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    errorMessage = 'Request timed out. Please try again.'
                } else if (err.message.includes('Failed to fetch')) {
                    errorMessage = 'Network error. Please check your connection.'
                } else {
                    errorMessage = err.message
                }
            }

            setError(errorMessage)

            // Implement exponential backoff for retries
            if (retryAttempt < 3 && isOnline) {
                const delay = Math.pow(2, retryAttempt) * 1000 // 1s, 2s, 4s
                setTimeout(() => {
                    setRetryCount(retryAttempt + 1)
                    fetchResorts(retryAttempt + 1)
                }, delay)
            }
        } finally {
            setIsLoading(false)
        }
    }, [searchTerm, filters, isOnline])

    // Initial load and refetch on filter changes with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchResorts()
        }, 300) // Debounce API calls

        return () => clearTimeout(timeoutId)
    }, [fetchResorts])

    // Memoized filtered and sorted resorts with better type safety
    const filteredResorts = useMemo(() => {
        if (!resortData?.resorts) return []

        let filtered = [...resortData.resorts]

        // Additional client-side filtering for amenities (if needed)
        if (filters.amenities.length > 0) {
            filtered = filtered.filter(resort =>
                filters.amenities.every(amenity =>
                    resort.amenities?.some(resortAmenity =>
                        resortAmenity.name.toLowerCase().includes(amenity.toLowerCase())
                    )
                )
            )
        }

        return filtered
    }, [resortData, filters])

    // Enhanced statistics calculations with error handling
    const stats = useMemo(() => {
        if (!resortData) {
            return {
                totalResorts: 0,
                avgPrice: 0,
                categoryDistribution: {},
                avgAmenities: 0,
                totalDining: 0,
                dataSource: 'unknown' as const
            }
        }

        const safeResorts = filteredResorts || []

        return {
            totalResorts: resortData.statistics.totalResorts,
            avgPrice: Math.round((resortData.statistics.priceRange.min + resortData.statistics.priceRange.max) / 2),
            categoryDistribution: resortData.statistics.byCategory,
            avgAmenities: safeResorts.length > 0
                ? safeResorts.reduce((sum, resort) => sum + (resort.amenities?.length || 0), 0) / safeResorts.length
                : 0,
            totalDining: safeResorts.reduce((sum, resort) => sum + (resort.dining?.length || 0), 0),
            dataSource: resortData.meta.dataSource
        }
    }, [resortData, filteredResorts])

    // Categorized resorts with proper type mapping
    const categorizedResorts = useMemo(() => {
        const resorts = filteredResorts || []

        return {
            value: resorts.filter(resort =>
                resort.category === RESORT_CATEGORIES.VALUE
            ),
            moderate: resorts.filter(resort =>
                resort.category === RESORT_CATEGORIES.MODERATE
            ),
            deluxe: resorts.filter(resort =>
                resort.category === RESORT_CATEGORIES.DELUXE
            ),
            villa: resorts.filter(resort =>
                resort.category === RESORT_CATEGORIES.VILLA
            ),
            campground: resorts.filter(resort =>
                resort.category === RESORT_CATEGORIES.CAMPGROUND
            )
        }
    }, [filteredResorts])

    // Enhanced filter change handler with validation
    const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
        setFilters(prev => {
            // Validate the value based on the key
            switch (key) {
                case 'priceRange':
                    if (isValidPriceRange(value)) {
                        return { ...prev, [key]: value }
                    }
                    break
                case 'category':
                case 'area':
                    if (typeof value === 'string') {
                        return { ...prev, [key]: value }
                    }
                    break
                case 'amenities':
                case 'transportation':
                    if (Array.isArray(value)) {
                        return { ...prev, [key]: value }
                    }
                    break
                case 'sortBy':
                    if (typeof value === 'string' && isValidSortBy(value)) {
                        return { ...prev, [key]: value }
                    }
                    break
                case 'sortOrder':
                    if (value === 'asc' || value === 'desc') {
                        return { ...prev, [key]: value }
                    }
                    break
                default:
                    break
            }
            return prev
        })
    }, [])

    // View state handlers
    const handleViewChange = useCallback((key: keyof ViewState, value: unknown) => {
        setViewState(prev => ({ ...prev, [key]: value }))
    }, [])

    // Utility functions for UI
    const getDataSourceIcon = (source: string) => {
        switch (source) {
            case 'firestore':
                return <Database className="h-4 w-4" />
            case 'static':
                return <HardDrive className="h-4 w-4" />
            case 'hybrid':
                return <Cloud className="h-4 w-4" />
            default:
                return <AlertCircle className="h-4 w-4" />
        }
    }

    const getDataSourceLabel = (source: string) => {
        switch (source) {
            case 'firestore':
                return 'Live Data'
            case 'static':
                return 'Cached Data'
            case 'hybrid':
                return 'Mixed Sources'
            default:
                return 'Unknown Source'
        }
    }

    // Loading state
    if (isLoading && !resortData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="mx-auto"
                            >
                                <RefreshCw className="h-12 w-12 text-blue-600" />
                            </motion.div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                Loading Disney Resorts
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Fetching the latest resort information...
                            </p>
                            {retryCount > 0 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    Retry attempt {retryCount}/3
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (error && !resortData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Card className="p-8 max-w-md w-full">
                            <div className="text-center space-y-4">
                                <div className="flex items-center justify-center">
                                    {isOnline ? (
                                        <AlertCircle className="h-12 w-12 text-red-500" />
                                    ) : (
                                        <WifiOff className="h-12 w-12 text-gray-500" />
                                    )}
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {isOnline ? 'Error Loading Resorts' : 'You\'re Offline'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {error}
                                </p>
                                <Button
                                    onClick={() => fetchResorts()}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Try Again
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
            <Particles
                className="absolute inset-0"
                quantity={100}
                ease={80}
                color={theme === 'dark' ? '#ffffff' : '#000000'}
                refresh
            />

            <div className="relative z-10">
                {/* Hero Section */}
                <ResortHero />

                <div className="container mx-auto px-4 py-8">
                    {/* Status Bar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    {isOnline ? (
                                        <Wifi className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <WifiOff className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                {resortData && (
                                    <div className="flex items-center space-x-2">
                                        {getDataSourceIcon(stats.dataSource)}
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {getDataSourceLabel(stats.dataSource)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                {isLoading && (
                                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                                )}
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {stats.totalResorts} resorts
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <BlurFade delay={0.2}>
                        <div className="mb-8 space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search resorts by name, location, or amenities..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20"
                                        />
                                    </div>
                                </div>

                                {/* View Toggle */}
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant={viewState.mode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleViewChange('mode', 'grid')}
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewState.mode === 'map' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleViewChange('mode', 'map')}
                                    >
                                        <Map className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewChange('showFilters', !viewState.showFilters)}
                                    >
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <AnimatePresence>
                                {viewState.showFilters && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {/* Category Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Category</label>
                                                <Select
                                                    value={filters.category}
                                                    onValueChange={(value) => handleFilterChange('category', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Categories</SelectItem>
                                                        <SelectItem value="value">Value Resorts</SelectItem>
                                                        <SelectItem value="moderate">Moderate Resorts</SelectItem>
                                                        <SelectItem value="deluxe">Deluxe Resorts</SelectItem>
                                                        <SelectItem value="villa">DVC Villas</SelectItem>
                                                        <SelectItem value="campground">Campgrounds</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Price Range */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">
                                                    Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                                                </label>
                                                <Slider
                                                    value={filters.priceRange}
                                                    onValueChange={(value) => handleFilterChange('priceRange', value)}
                                                    max={2000}
                                                    min={0}
                                                    step={50}
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* Sort Options */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Sort By</label>
                                                <Select
                                                    value={filters.sortBy}
                                                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="name">Name</SelectItem>
                                                        <SelectItem value="price">Price</SelectItem>
                                                        <SelectItem value="rating">Rating</SelectItem>
                                                        <SelectItem value="category">Category</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Sort Order */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Order</label>
                                                <Select
                                                    value={filters.sortOrder}
                                                    onValueChange={(value) => handleFilterChange('sortOrder', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="asc">Ascending</SelectItem>
                                                        <SelectItem value="desc">Descending</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </BlurFade>

                    {/* Statistics Dashboard */}
                    {viewState.showStats && (
                        <BlurFade delay={0.3}>
                            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20">
                                    <div className="flex items-center space-x-3">
                                        <Building className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Total Resorts</p>
                                            <p className="text-2xl font-bold">{stats.totalResorts}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20">
                                    <div className="flex items-center space-x-3">
                                        <DollarSign className="h-8 w-8 text-green-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Price</p>
                                            <p className="text-2xl font-bold">${stats.avgPrice}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20">
                                    <div className="flex items-center space-x-3">
                                        <Sparkles className="h-8 w-8 text-purple-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Avg. Amenities</p>
                                            <p className="text-2xl font-bold">{Math.round(stats.avgAmenities)}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20">
                                    <div className="flex items-center space-x-3">
                                        <Utensils className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">Dining Options</p>
                                            <p className="text-2xl font-bold">{stats.totalDining}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </BlurFade>
                    )}

                    {/* Main Content */}
                    <BlurFade delay={0.4}>
                        <Tabs value={viewState.mode} onValueChange={(value) => handleViewChange('mode', value)}>
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="grid" className="flex items-center space-x-2">
                                    <Grid3X3 className="h-4 w-4" />
                                    <span>Grid View</span>
                                </TabsTrigger>
                                <TabsTrigger value="map" className="flex items-center space-x-2">
                                    <Map className="h-4 w-4" />
                                    <span>Map View</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="grid" className="space-y-8">
                                {/* Value Resorts */}
                                {categorizedResorts.value.length > 0 && (
                                    <ResortCategorySection
                                        title="Value Resorts"
                                        description="Budget-friendly options with Disney magic"
                                        resorts={categorizedResorts.value}
                                    />
                                )}

                                {/* Moderate Resorts */}
                                {categorizedResorts.moderate.length > 0 && (
                                    <ResortCategorySection
                                        title="Moderate Resorts"
                                        description="Perfect balance of comfort and value"
                                        resorts={categorizedResorts.moderate}
                                    />
                                )}

                                {/* Deluxe Resorts */}
                                {categorizedResorts.deluxe.length > 0 && (
                                    <ResortCategorySection
                                        title="Deluxe Resorts"
                                        description="Premium accommodations and amenities"
                                        resorts={categorizedResorts.deluxe}
                                    />
                                )}

                                {/* DVC Villas */}
                                {categorizedResorts.villa.length > 0 && (
                                    <ResortCategorySection
                                        title="Disney Vacation Club Villas"
                                        description="Home away from home with Disney magic"
                                        resorts={categorizedResorts.villa}
                                    />
                                )}

                                {/* Campgrounds */}
                                {categorizedResorts.campground.length > 0 && (
                                    <ResortCategorySection
                                        title="Campgrounds"
                                        description="Outdoor adventure with Disney convenience"
                                        resorts={categorizedResorts.campground}
                                    />
                                )}

                                {/* No Results */}
                                {filteredResorts.length === 0 && (
                                    <div className="text-center py-12">
                                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            No resorts found
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            Try adjusting your search criteria or filters
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setSearchTerm("")
                                                setFilters({
                                                    category: "all",
                                                    priceRange: [0, 2000],
                                                    area: "all",
                                                    amenities: [],
                                                    transportation: [],
                                                    sortBy: "name",
                                                    sortOrder: "asc"
                                                })
                                            }}
                                            variant="outline"
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="map">
                                <ResortMap resorts={filteredResorts} />
                            </TabsContent>
                        </Tabs>
                    </BlurFade>

                    {/* Error Alert */}
                    {error && resortData && (
                        <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error} - Showing cached data.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </div>
    )
}