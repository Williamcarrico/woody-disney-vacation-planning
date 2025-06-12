"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Search,
    Filter,
    MapPin,
    Star,
    Utensils,
    DollarSign,
    Sparkles,
    AlertTriangle,
    Upload,
    Database,
    BarChart3} from 'lucide-react'

import {
    DisneyRestaurant,
    ServiceType,
    PriceRange,
    DisneyLocation} from '@/types/dining'

import { RestaurantService } from '@/lib/firebase/restaurant-service'
import { bulkImporter } from '@/scripts/import-restaurants'

interface RestaurantManagerProps {
    onRestaurantSelect?: (restaurant: DisneyRestaurant) => void
    allowManagement?: boolean
    compact?: boolean
}

interface DatabaseStats {
    total: number
    byLocation: Record<string, number>
    byServiceType: Record<string, number>
    byPriceRange: Record<string, number>
    characterDining: number
    signatureDining: number
    averageRating: number
}

export function RestaurantManager({
    onRestaurantSelect,
    allowManagement = false}: RestaurantManagerProps) {
    const [restaurants, setRestaurants] = useState<DisneyRestaurant[]>([])
    const [filteredRestaurants, setFilteredRestaurants] = useState<DisneyRestaurant[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedLocation, setSelectedLocation] = useState<DisneyLocation | 'all'>('all')
    const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all')
    const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | 'all'>('all')
    const [showCharacterDining, setShowCharacterDining] = useState(false)
    const [showSignatureDining, setShowSignatureDining] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [stats, setStats] = useState<DatabaseStats | null>(null)
    const [importProgress, setImportProgress] = useState<string | null>(null)

    const restaurantService = useMemo(() => RestaurantService.getInstance(), [])

    const loadRestaurants = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const result = await restaurantService.getRestaurants()
            setRestaurants(result.restaurants)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load restaurants')
        } finally {
            setLoading(false)
        }
    }, [restaurantService])

    const loadStats = useCallback(async () => {
        try {
            const dbStats = await restaurantService.getRestaurantStats()
            setStats(dbStats)
        } catch (err) {
            console.error('Failed to load stats:', err)
        }
    }, [restaurantService])

    const applyFilters = useCallback(() => {
        let filtered = [...restaurants]

        // Search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(restaurant =>
                restaurant.name.toLowerCase().includes(query) ||
                restaurant.description.toLowerCase().includes(query) ||
                restaurant.location.areaName.toLowerCase().includes(query) ||
                restaurant.cuisineTypes.some(cuisine => cuisine.toLowerCase().includes(query)) ||
                restaurant.tags.some(tag => tag.toLowerCase().includes(query))
            )
        }

        // Location filter
        if (selectedLocation !== 'all') {
            filtered = filtered.filter(restaurant => restaurant.location.parkId === selectedLocation)
        }

        // Service type filter
        if (selectedServiceType !== 'all') {
            filtered = filtered.filter(restaurant => restaurant.serviceType === selectedServiceType)
        }

        // Price range filter
        if (selectedPriceRange !== 'all') {
            filtered = filtered.filter(restaurant => restaurant.priceRange === selectedPriceRange)
        }

        // Character dining filter
        if (showCharacterDining) {
            filtered = filtered.filter(restaurant => restaurant.characterDining?.hasCharacterDining)
        }

        // Signature dining filter
        if (showSignatureDining) {
            filtered = filtered.filter(restaurant =>
                restaurant.serviceType === ServiceType.SIGNATURE_DINING ||
                restaurant.serviceType === ServiceType.FINE_DINING ||
                restaurant.diningPlanInfo.isSignatureDining
            )
        }

        setFilteredRestaurants(filtered)
    }, [
        restaurants,
        searchQuery,
        selectedLocation,
        selectedServiceType,
        selectedPriceRange,
        showCharacterDining,
        showSignatureDining
    ])

    useEffect(() => {
        loadRestaurants()
        loadStats()
    }, [loadRestaurants, loadStats])

    useEffect(() => {
        applyFilters()
    }, [applyFilters])

    const handleImportData = async (file: File) => {
        try {
            setImportProgress('Reading file...')
            const fileContent = await file.text()

            // Type the parsed JSON properly
            let jsonData: unknown
            try {
                jsonData = JSON.parse(fileContent)
            } catch (parseError) {
                throw new Error('Invalid JSON file format')
            }

            setImportProgress('Importing restaurants...')
            const result = await bulkImporter.importFromData(jsonData, {
                batchSize: 25,
                validateData: true,
                logProgress: false
            })

            if (result.success) {
                setImportProgress(`Successfully imported ${result.totalImported} restaurants!`)
                await loadRestaurants()
                await loadStats()
                setTimeout(() => setImportProgress(null), 3000)
            } else {
                setImportProgress(`Import failed: ${result.errors.length} errors`)
                setTimeout(() => setImportProgress(null), 5000)
            }
        } catch (err) {
            setImportProgress(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setTimeout(() => setImportProgress(null), 5000)
        }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && file.type === 'application/json') {
            handleImportData(file)
        } else {
            alert('Please select a valid JSON file')
        }
        // Reset input
        event.target.value = ''
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedLocation('all')
        setSelectedServiceType('all')
        setSelectedPriceRange('all')
        setShowCharacterDining(false)
        setShowSignatureDining(false)
    }

    const getPriceRangeDisplay = (priceRange: PriceRange): string => {
        switch (priceRange) {
            case PriceRange.BUDGET: return '$ (Under $15)'
            case PriceRange.MODERATE: return '$$ ($15-35)'
            case PriceRange.EXPENSIVE: return '$$$ ($36-60)'
            case PriceRange.LUXURY: return '$$$$ ($60+)'
            default: return priceRange
        }
    }

    const getLocationDisplay = (location: DisneyLocation): string => {
        return location.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Type-safe checkbox handlers
    const handleCharacterDiningChange = (checked: boolean | 'indeterminate') => {
        setShowCharacterDining(checked === true)
    }

    const handleSignatureDiningChange = (checked: boolean | 'indeterminate') => {
        setShowSignatureDining(checked === true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="spinner animate-spin w-8 h-8 rounded-full mx-auto mb-4"></div>
                    <p>Loading restaurants...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Restaurants</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={loadRestaurants}>Try Again</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Disney Restaurant Database</h2>
                    <p className="text-gray-600">
                        {filteredRestaurants.length} of {restaurants.length} restaurants
                    </p>
                </div>

                {allowManagement && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="import-file"
                        />
                        <label htmlFor="import-file">
                            <Button variant="outline" asChild>
                                <span>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Import JSON
                                </span>
                            </Button>
                        </label>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Import Progress */}
            {importProgress && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <div className="spinner animate-spin w-4 h-4 rounded-full"></div>
                            <span>{importProgress}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Database className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Character</p>
                                    <p className="text-2xl font-bold">{stats.characterDining}</p>
                                </div>
                                <Sparkles className="w-8 h-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Signature</p>
                                    <p className="text-2xl font-bold">{stats.signatureDining}</p>
                                </div>
                                <Star className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                    <p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || 'N/A'}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Filters</span>
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Location</Label>
                                <Select value={selectedLocation} onValueChange={(value: DisneyLocation | 'all') => setSelectedLocation(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        {Object.values(DisneyLocation).map(location => (
                                            <SelectItem key={location} value={location}>
                                                {getLocationDisplay(location)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Service Type</Label>
                                <Select value={selectedServiceType} onValueChange={(value: ServiceType | 'all') => setSelectedServiceType(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {Object.values(ServiceType).map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Price Range</Label>
                                <Select value={selectedPriceRange} onValueChange={(value: PriceRange | 'all') => setSelectedPriceRange(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Prices</SelectItem>
                                        {Object.values(PriceRange).map(range => (
                                            <SelectItem key={range} value={range}>
                                                {getPriceRangeDisplay(range)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="character-dining"
                                    checked={showCharacterDining}
                                    onCheckedChange={handleCharacterDiningChange}
                                />
                                <Label htmlFor="character-dining">Character Dining Only</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="signature-dining"
                                    checked={showSignatureDining}
                                    onCheckedChange={handleSignatureDiningChange}
                                />
                                <Label htmlFor="signature-dining">Signature Dining Only</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search restaurants, cuisine, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Restaurant List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                    <Card
                        key={restaurant.id}
                        className={`cursor-pointer hover:shadow-lg transition-shadow ${onRestaurantSelect ? 'hover:border-blue-300' : ''}`}
                        onClick={() => onRestaurantSelect?.(restaurant)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg leading-tight mb-1">
                                        {restaurant.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {restaurant.shortDescription || restaurant.description.substring(0, 100) + '...'}
                                    </CardDescription>
                                </div>
                                {restaurant.averageRating && (
                                    <div className="flex items-center ml-2">
                                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                        <span className="text-sm font-medium">{restaurant.averageRating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {restaurant.location.areaName}
                            </div>

                            <div className="flex items-center text-sm text-gray-600">
                                <Utensils className="w-4 h-4 mr-2" />
                                {restaurant.cuisineTypes.slice(0, 2).join(', ')}
                                {restaurant.cuisineTypes.length > 2 && ` +${restaurant.cuisineTypes.length - 2}`}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-gray-600">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {restaurant.priceRange}
                                </div>
                                <Badge variant={restaurant.serviceType === ServiceType.SIGNATURE_DINING ? "default" : "secondary"}>
                                    {restaurant.serviceType}
                                </Badge>
                            </div>

                            {restaurant.characterDining?.hasCharacterDining && (
                                <Badge variant="outline" className="text-purple-600 border-purple-300">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Character Dining
                                </Badge>
                            )}

                            <div className="flex flex-wrap gap-1">
                                {restaurant.specialFeatures.slice(0, 3).map((feature) => (
                                    <Badge key={feature} variant="outline" className="text-xs">
                                        {feature.replace(/_/g, ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No results */}
            {filteredRestaurants.length === 0 && restaurants.length > 0 && (
                <div className="text-center py-12">
                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}

            {/* Empty state */}
            {restaurants.length === 0 && (
                <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No restaurants in database</h3>
                    <p className="text-gray-600 mb-4">
                        {allowManagement
                            ? "Import restaurant data using the 'Import JSON' button above"
                            : "Restaurant data is being loaded..."
                        }
                    </p>
                </div>
            )}
        </div>
    )
}