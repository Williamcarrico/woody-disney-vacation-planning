/**
 * Disney Restaurant Database - Usage Examples
 *
 * This file demonstrates how to use the comprehensive Disney restaurant database system
 * including importing data, using the Firebase service, and implementing the UI components
 */

import {
    RestaurantService,
    restaurantImporter,
    bulkImporter,
    importRestaurantsFromFile,
    importRestaurantsFromData
} from '@/lib/firebase/restaurant-service'
import { DisneyRestaurant, DisneyLocation, ServiceType, PriceRange } from '@/types/dining'

// Example JSON data structure for importing
const exampleRestaurantData = {
    "metadata": {
        "total_locations": 6,
        "last_updated": "2024-01-01",
        "data_sources": ["Disney Official Website", "TouringPlans", "AllEars.net"],
        "note": "Comprehensive Disney World dining database with 220+ restaurants"
    },
    "locations": {
        "magic_kingdom": {
            "name": "Magic Kingdom",
            "total_restaurants": 50,
            "areas": ["Main Street", "Fantasyland", "Tomorrowland", "Frontierland", "Adventureland", "Liberty Square"],
            "restaurants": [
                {
                    "name": "Be Our Guest Restaurant",
                    "description": "Dining inside Beast's Castle with French-inspired cuisine",
                    "location": {
                        "area": "Fantasyland",
                        "park": "magic_kingdom",
                        "coordinates": { "latitude": 28.4211, "longitude": -81.5812 }
                    },
                    "cuisine_types": ["french-inspired"],
                    "service_type": "table-service",
                    "price_range": "$$$",
                    "dining_experience": "themed",
                    "meal_periods": ["lunch", "dinner"],
                    "pricing": {
                        "lunch": { "adult": 62, "child": 37 },
                        "dinner": { "adult": 68, "child": 40 }
                    },
                    "reservation_info": {
                        "accepts_reservations": true,
                        "requires_reservations": true,
                        "advance_days": 60,
                        "difficulty": "extremely-difficult",
                        "tips": ["Book exactly 60 days in advance", "Very popular restaurant"]
                    },
                    "dining_plan": {
                        "accepts": true,
                        "credits_required": 1,
                        "signature": false,
                        "eligible_plans": ["dining-plan", "deluxe-dining"]
                    },
                    "special_features": ["themed-dining", "allergy-friendly"],
                    "mobile_ordering": false,
                    "popular_items": ["The Grey Stuff", "Filet of Beef"],
                    "is_popular": true,
                    "average_rating": 4.3
                }
                // More restaurants...
            ]
        }
        // More locations...
    }
}

/**
 * Example 1: Import restaurants from JSON data
 */
export async function example1_ImportFromData() {
    console.log('Example 1: Importing restaurants from data object')

    try {
        const result = await importRestaurantsFromData(exampleRestaurantData, {
            batchSize: 25,
            validateData: true,
            skipExisting: true,
            logProgress: true
        })

        console.log('Import Result:', {
            success: result.success,
            imported: result.totalImported,
            errors: result.totalErrors,
            duration: `${(result.duration / 1000).toFixed(2)}s`
        })

        return result
    } catch (error) {
        console.error('Import failed:', error)
        throw error
    }
}

/**
 * Example 2: Import restaurants from JSON file
 */
export async function example2_ImportFromFile() {
    console.log('Example 2: Importing restaurants from JSON file')

    try {
        // First, do a dry run to see what would be imported
        const dryRunResult = await importRestaurantsFromFile('./disney-restaurants.json', {
            dryRun: true,
            logProgress: true
        })

        console.log('Dry Run Result:', dryRunResult)

        // Then do the actual import
        const result = await importRestaurantsFromFile('./disney-restaurants.json', {
            batchSize: 50,
            validateData: true,
            skipExisting: true,
            logProgress: true
        })

        return result
    } catch (error) {
        console.error('File import failed:', error)
        throw error
    }
}

/**
 * Example 3: Use RestaurantService for basic operations
 */
export async function example3_BasicRestaurantOperations() {
    console.log('Example 3: Basic restaurant operations')

    const restaurantService = RestaurantService.getInstance()

    try {
        // Get all restaurants
        console.log('Getting all restaurants...')
        const { restaurants } = await restaurantService.getRestaurants()
        console.log(`Found ${restaurants.length} restaurants`)

        // Get restaurants by location
        console.log('Getting Magic Kingdom restaurants...')
        const mkRestaurants = await restaurantService.getRestaurantsByLocation(DisneyLocation.MAGIC_KINGDOM)
        console.log(`Found ${mkRestaurants.length} Magic Kingdom restaurants`)

        // Get character dining restaurants
        console.log('Getting character dining restaurants...')
        const characterRestaurants = await restaurantService.getCharacterDiningRestaurants()
        console.log(`Found ${characterRestaurants.length} character dining restaurants`)

        // Get signature dining restaurants
        console.log('Getting signature dining restaurants...')
        const signatureRestaurants = await restaurantService.getSignatureDiningRestaurants()
        console.log(`Found ${signatureRestaurants.length} signature dining restaurants`)

        // Get popular restaurants
        console.log('Getting popular restaurants...')
        const popularRestaurants = await restaurantService.getPopularRestaurants()
        console.log(`Found ${popularRestaurants.length} popular restaurants`)

        // Search restaurants
        console.log('Searching for "castle" restaurants...')
        const searchResults = await restaurantService.searchRestaurants('castle', 10)
        console.log(`Found ${searchResults.length} restaurants matching "castle"`)

        return {
            total: restaurants.length,
            byLocation: mkRestaurants.length,
            character: characterRestaurants.length,
            signature: signatureRestaurants.length,
            popular: popularRestaurants.length,
            searchResults: searchResults.length
        }
    } catch (error) {
        console.error('Restaurant operations failed:', error)
        throw error
    }
}

/**
 * Example 4: Advanced filtering and searching
 */
export async function example4_AdvancedFiltering() {
    console.log('Example 4: Advanced filtering and searching')

    const restaurantService = RestaurantService.getInstance()

    try {
        // Complex filter example
        const advancedFilters = {
            parkIds: [DisneyLocation.MAGIC_KINGDOM, DisneyLocation.EPCOT],
            serviceTypes: [ServiceType.TABLE_SERVICE, ServiceType.SIGNATURE_DINING],
            priceRanges: [PriceRange.EXPENSIVE, PriceRange.LUXURY],
            hasCharacterDining: true,
            rating: 4.0,
            searchQuery: 'princess'
        }

        console.log('Applying advanced filters:', advancedFilters)
        const { restaurants } = await restaurantService.getRestaurants(advancedFilters, 20)

        console.log(`Found ${restaurants.length} restaurants matching criteria:`)
        restaurants.forEach(restaurant => {
            console.log(`- ${restaurant.name} (${restaurant.location.areaName}) - ${restaurant.averageRating || 'N/A'} stars`)
        })

        return restaurants
    } catch (error) {
        console.error('Advanced filtering failed:', error)
        throw error
    }
}

/**
 * Example 5: Real-time subscriptions
 */
export async function example5_RealtimeSubscriptions() {
    console.log('Example 5: Setting up real-time subscriptions')

    const restaurantService = RestaurantService.getInstance()

    try {
        // Subscribe to a specific restaurant
        console.log('Setting up subscription for Be Our Guest Restaurant...')
        const unsubscribeRestaurant = restaurantService.subscribeToRestaurant(
            'be-our-guest-restaurant',
            (restaurant) => {
                if (restaurant) {
                    console.log('Restaurant updated:', restaurant.name, restaurant.updatedAt)
                } else {
                    console.log('Restaurant not found or deleted')
                }
            }
        )

        // Subscribe to character dining restaurants
        console.log('Setting up subscription for character dining restaurants...')
        const unsubscribeList = restaurantService.subscribeToRestaurants(
            { hasCharacterDining: true },
            (restaurants) => {
                console.log(`Character dining restaurants updated: ${restaurants.length} restaurants`)
                restaurants.forEach(restaurant => {
                    console.log(`- ${restaurant.name}: ${restaurant.characterDining?.characters?.join(', ') || 'No characters listed'}`)
                })
            },
            10
        )

        // Return unsubscribe functions for cleanup
        return {
            unsubscribeRestaurant,
            unsubscribeList
        }
    } catch (error) {
        console.error('Subscription setup failed:', error)
        throw error
    }
}

/**
 * Example 6: Database statistics and management
 */
export async function example6_DatabaseStatistics() {
    console.log('Example 6: Getting database statistics')

    const restaurantService = RestaurantService.getInstance()

    try {
        // Get comprehensive statistics
        const stats = await restaurantService.getRestaurantStats()

        console.log('Database Statistics:')
        console.log('==================')
        console.log(`Total Restaurants: ${stats.total}`)
        console.log(`Character Dining: ${stats.characterDining}`)
        console.log(`Signature Dining: ${stats.signatureDining}`)
        console.log(`Average Rating: ${stats.averageRating?.toFixed(2) || 'N/A'}`)

        console.log('\nBy Location:')
        Object.entries(stats.byLocation).forEach(([location, count]) => {
            console.log(`  ${location}: ${count} restaurants`)
        })

        console.log('\nBy Service Type:')
        Object.entries(stats.byServiceType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count} restaurants`)
        })

        console.log('\nBy Price Range:')
        Object.entries(stats.byPriceRange).forEach(([range, count]) => {
            console.log(`  ${range}: ${count} restaurants`)
        })

        return stats
    } catch (error) {
        console.error('Statistics retrieval failed:', error)
        throw error
    }
}

/**
 * Example 7: Restaurant data conversion and validation
 */
export async function example7_DataConversion() {
    console.log('Example 7: Converting and validating restaurant data')

    try {
        // Example raw restaurant data from your JSON
        const rawRestaurant = {
            name: "Space 220 Restaurant",
            description: "Space-themed fine dining with views of Earth from 220 miles above",
            location: {
                area: "Future World",
                park: "epcot",
                coordinates: { latitude: 28.3747, longitude: -81.5494 }
            },
            cuisine_types: ["american", "international"],
            service_type: "signature-dining",
            price_range: "$$$$",
            dining_experience: "themed",
            meal_periods: ["lunch", "dinner"],
            reservation_info: {
                accepts_reservations: true,
                requires_reservations: true,
                advance_days: 60,
                difficulty: "extremely-difficult"
            },
            dining_plan: {
                accepts: true,
                credits_required: 2,
                signature: true
            },
            special_features: ["themed-dining", "interactive-experience"],
            average_rating: 4.6,
            is_popular: true,
            is_new: true
        }

        // Convert to DisneyRestaurant format
        console.log('Converting raw data to DisneyRestaurant format...')
        const convertedRestaurant = restaurantImporter.convertRawToRestaurant(rawRestaurant)

        // Validate the converted restaurant
        console.log('Validating converted restaurant...')
        const validation = restaurantImporter.validateRestaurant(convertedRestaurant)

        console.log('Conversion Result:')
        console.log('================')
        console.log(`Name: ${convertedRestaurant.name}`)
        console.log(`ID: ${convertedRestaurant.id}`)
        console.log(`Location: ${convertedRestaurant.location.areaName}`)
        console.log(`Service Type: ${convertedRestaurant.serviceType}`)
        console.log(`Price Range: ${convertedRestaurant.priceRange}`)
        console.log(`Validation: ${validation.isValid ? 'PASSED' : 'FAILED'}`)

        if (!validation.isValid) {
            console.log('Validation Errors:', validation.errors)
        }

        return { convertedRestaurant, validation }
    } catch (error) {
        console.error('Data conversion failed:', error)
        throw error
    }
}

/**
 * Example 8: Batch operations and performance optimization
 */
export async function example8_BatchOperations() {
    console.log('Example 8: Batch operations and performance optimization')

    const restaurantService = RestaurantService.getInstance()

    try {
        // Create sample restaurants for batch operations
        const sampleRestaurants: DisneyRestaurant[] = [
            {
                id: 'test-restaurant-1',
                name: 'Test Restaurant 1',
                description: 'A test restaurant for batch operations',
                location: {
                    latitude: 28.4200,
                    longitude: -81.5800,
                    areaName: 'Test Area',
                    parkId: DisneyLocation.MAGIC_KINGDOM
                },
                cuisineTypes: ['american'],
                serviceType: ServiceType.QUICK_SERVICE,
                priceRange: PriceRange.MODERATE,
                diningExperience: 'casual',
                mealPeriods: ['lunch'],
                operatingHours: {
                    'Monday': '9:00 AM - 9:00 PM'
                },
                reservationInfo: {
                    acceptsReservations: false,
                    requiresReservations: false,
                    advanceReservationDays: 0,
                    reservationDifficulty: 'easy',
                    walkUpsAccepted: true
                },
                diningPlanInfo: {
                    acceptsDiningPlan: true,
                    participating: true,
                    creditsRequired: 1,
                    isSignatureDining: false,
                    eligiblePlans: []
                },
                specialFeatures: [],
                mobileOrdering: true,
                dietaryAccommodations: [],
                tags: ['test'],
                popularItems: [],
                chefSpecialities: [],
                ambiance: ['casual'],
                accessibility: [],
                isPopular: false,
                searchKeywords: ['test'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
            // Add more test restaurants as needed...
        ]

        console.log(`Batch saving ${sampleRestaurants.length} restaurants...`)
        const startTime = Date.now()

        // Batch save restaurants
        await restaurantService.batchSaveRestaurants(sampleRestaurants)

        const duration = Date.now() - startTime
        console.log(`Batch save completed in ${duration}ms`)

        // Test cache performance
        console.log('Testing cache performance...')
        const cacheStartTime = Date.now()

        // First call (should hit database)
        await restaurantService.getRestaurant('test-restaurant-1')
        const firstCallTime = Date.now() - cacheStartTime

        // Second call (should hit cache)
        const cacheStartTime2 = Date.now()
        await restaurantService.getRestaurant('test-restaurant-1')
        const secondCallTime = Date.now() - cacheStartTime2

        console.log(`First call (database): ${firstCallTime}ms`)
        console.log(`Second call (cache): ${secondCallTime}ms`)
        console.log(`Cache speedup: ${(firstCallTime / secondCallTime).toFixed(2)}x`)

        // Cleanup test data
        console.log('Cleaning up test data...')
        for (const restaurant of sampleRestaurants) {
            await restaurantService.deleteRestaurant(restaurant.id)
        }

        return {
            batchSaveDuration: duration,
            cacheSpeedup: firstCallTime / secondCallTime
        }
    } catch (error) {
        console.error('Batch operations failed:', error)
        throw error
    }
}

/**
 * Example 9: Complete workflow - Import, Manage, and Query
 */
export async function example9_CompleteWorkflow() {
    console.log('Example 9: Complete workflow demonstration')

    try {
        console.log('Step 1: Import restaurant data...')
        const importResult = await example1_ImportFromData()

        console.log('Step 2: Get database statistics...')
        const stats = await example6_DatabaseStatistics()

        console.log('Step 3: Perform advanced filtering...')
        const filteredRestaurants = await example4_AdvancedFiltering()

        console.log('Step 4: Test batch operations...')
        const batchResults = await example8_BatchOperations()

        console.log('\nWorkflow Summary:')
        console.log('================')
        console.log(`Imported: ${importResult.totalImported} restaurants`)
        console.log(`Total in database: ${stats.total} restaurants`)
        console.log(`Character dining: ${stats.characterDining} restaurants`)
        console.log(`Advanced filter results: ${filteredRestaurants.length} restaurants`)
        console.log(`Cache performance: ${batchResults.cacheSpeedup.toFixed(2)}x speedup`)

        return {
            import: importResult,
            stats,
            filtered: filteredRestaurants,
            performance: batchResults
        }
    } catch (error) {
        console.error('Complete workflow failed:', error)
        throw error
    }
}

// Export all examples
export const restaurantExamples = {
    example1_ImportFromData,
    example2_ImportFromFile,
    example3_BasicRestaurantOperations,
    example4_AdvancedFiltering,
    example5_RealtimeSubscriptions,
    example6_DatabaseStatistics,
    example7_DataConversion,
    example8_BatchOperations,
    example9_CompleteWorkflow
}

// Usage instructions
export const usageInstructions = `
Disney Restaurant Database System - Usage Instructions
===================================================

This comprehensive system provides everything needed to manage Disney World restaurant data:

1. IMPORTING DATA:
   - Use importRestaurantsFromFile() for JSON files
   - Use importRestaurantsFromData() for JavaScript objects
   - Supports both single restaurants and full database structures

2. FIREBASE SERVICE:
   - RestaurantService provides full CRUD operations
   - Real-time subscriptions for live updates
   - Advanced filtering and search capabilities
   - Automatic caching for performance

3. DATA CONVERSION:
   - RestaurantImporter handles JSON to TypeScript conversion
   - Automatic field mapping and validation
   - Support for multiple JSON formats

4. UI COMPONENTS:
   - RestaurantManager provides complete restaurant browser
   - Built-in filtering, searching, and management
   - Real-time updates and statistics

5. GETTING STARTED:
   const restaurantService = RestaurantService.getInstance()
   const restaurants = await restaurantService.getRestaurants()

6. IMPORTING YOUR DATA:
   const result = await importRestaurantsFromFile('./your-data.json')

7. USING THE UI:
   <RestaurantManager
     onRestaurantSelect={(restaurant) => console.log(restaurant)}
     allowManagement={true}
   />

For complete examples, run any of the example functions in this file.
`