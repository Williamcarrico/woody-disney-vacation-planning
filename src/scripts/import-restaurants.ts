/**
 * Firebase Restaurant Bulk Import Script
 *
 * Script to import Disney restaurant data from JSON into Firebase Firestore
 * Handles large datasets efficiently with batch operations and error handling
 */

import { RestaurantService } from "@/lib/firebase/restaurant-service"
import { restaurantImporter } from "@/lib/data/restaurant-importer"
import { DisneyRestaurant, DisneyDiningDatabase } from "@/types/dining"

interface ImportOptions {
    batchSize?: number
    validateData?: boolean
    skipExisting?: boolean
    dryRun?: boolean
    logProgress?: boolean
}

interface ImportResult {
    success: boolean
    totalProcessed: number
    totalImported: number
    totalSkipped: number
    totalErrors: number
    errors: Array<{ restaurant: string; error: string }>
    stats: any
    duration: number
}

export class RestaurantBulkImporter {
    private restaurantService: RestaurantService
    private defaultOptions: ImportOptions = {
        batchSize: 50,
        validateData: true,
        skipExisting: false,
        dryRun: false,
        logProgress: true
    }

    constructor() {
        this.restaurantService = RestaurantService.getInstance()
    }

    /**
     * Import restaurants from JSON file
     */
    async importFromFile(filePath: string, options: ImportOptions = {}): Promise<ImportResult> {
        const mergedOptions = { ...this.defaultOptions, ...options }
        const startTime = Date.now()

        try {
            // Read and parse JSON file
            const fs = await import('fs/promises')
            const fileContent = await fs.readFile(filePath, 'utf-8')
            const jsonData = JSON.parse(fileContent)

            return await this.importFromData(jsonData, mergedOptions)
        } catch (error) {
            console.error('Error reading JSON file:', error)
            return {
                success: false,
                totalProcessed: 0,
                totalImported: 0,
                totalSkipped: 0,
                totalErrors: 1,
                errors: [{ restaurant: 'File Read', error: error instanceof Error ? error.message : 'Unknown error' }],
                stats: {},
                duration: Date.now() - startTime
            }
        }
    }

    /**
     * Import restaurants from data object
     */
    async importFromData(data: any, options: ImportOptions = {}): Promise<ImportResult> {
        const mergedOptions = { ...this.defaultOptions, ...options }
        const startTime = Date.now()

        const result: ImportResult = {
            success: false,
            totalProcessed: 0,
            totalImported: 0,
            totalSkipped: 0,
            totalErrors: 0,
            errors: [],
            stats: {},
            duration: 0
        }

        try {
            // Convert JSON data to restaurant objects
            let restaurants: DisneyRestaurant[] = []

            if (this.isDiningDatabase(data)) {
                // Handle full dining database structure
                restaurants = restaurantImporter.importFromDiningDatabase(data as DisneyDiningDatabase)
            } else if (Array.isArray(data)) {
                // Handle array of restaurants
                restaurants = restaurantImporter.importFromArray(data)
            } else if (data.restaurants && Array.isArray(data.restaurants)) {
                // Handle object with restaurants array
                restaurants = restaurantImporter.importFromArray(data.restaurants)
            } else {
                throw new Error('Invalid data format. Expected Disney dining database, array of restaurants, or object with restaurants array.')
            }

            if (mergedOptions.logProgress) {
                console.log(`🏰 Processing ${restaurants.length} restaurants for import...`)
            }

            // Get import statistics
            result.stats = restaurantImporter.getImportStats(restaurants)
            result.totalProcessed = restaurants.length

            if (mergedOptions.logProgress) {
                console.log('📊 Import Statistics:', result.stats)
            }

            // Validate data if requested
            if (mergedOptions.validateData) {
                restaurants = this.validateRestaurants(restaurants, result)
            }

            // Dry run - just show what would be imported
            if (mergedOptions.dryRun) {
                if (mergedOptions.logProgress) {
                    console.log('🔍 DRY RUN - No data will be imported')
                    console.log(`Would import ${restaurants.length} restaurants`)
                    this.logSampleRestaurants(restaurants)
                }
                result.success = true
                result.totalImported = restaurants.length
                result.duration = Date.now() - startTime
                return result
            }

            // Handle skip existing
            if (mergedOptions.skipExisting) {
                restaurants = await this.filterExistingRestaurants(restaurants, result, mergedOptions.logProgress)
            }

            // Import in batches
            await this.importInBatches(restaurants, result, mergedOptions)

            result.success = result.totalErrors === 0
            result.duration = Date.now() - startTime

            if (mergedOptions.logProgress) {
                this.logFinalResults(result)
            }

            return result

        } catch (error) {
            console.error('❌ Import failed:', error)
            result.totalErrors++
            result.errors.push({
                restaurant: 'Import Process',
                error: error instanceof Error ? error.message : 'Unknown error'
            })
            result.duration = Date.now() - startTime
            return result
        }
    }

    /**
     * Check if data is in Disney dining database format
     */
    private isDiningDatabase(data: any): boolean {
        return data &&
            typeof data === 'object' &&
            data.metadata &&
            data.locations &&
            typeof data.locations === 'object'
    }

    /**
     * Validate restaurants and remove invalid ones
     */
    private validateRestaurants(restaurants: DisneyRestaurant[], result: ImportResult): DisneyRestaurant[] {
        const validRestaurants: DisneyRestaurant[] = []

        restaurants.forEach(restaurant => {
            const validation = restaurantImporter.validateRestaurant(restaurant)
            if (validation.isValid) {
                validRestaurants.push(restaurant)
            } else {
                result.totalErrors++
                result.errors.push({
                    restaurant: restaurant.name || 'Unknown',
                    error: `Validation failed: ${validation.errors.join(', ')}`
                })
            }
        })

        if (result.totalErrors > 0) {
            console.warn(`⚠️  ${result.totalErrors} restaurants failed validation and will be skipped`)
        }

        return validRestaurants
    }

    /**
     * Filter out restaurants that already exist in the database
     */
    private async filterExistingRestaurants(
        restaurants: DisneyRestaurant[],
        result: ImportResult,
        logProgress?: boolean
    ): Promise<DisneyRestaurant[]> {
        const newRestaurants: DisneyRestaurant[] = []

        for (const restaurant of restaurants) {
            try {
                const existing = await this.restaurantService.getRestaurant(restaurant.id)
                if (existing) {
                    result.totalSkipped++
                    if (logProgress) {
                        console.log(`⏭️  Skipping existing restaurant: ${restaurant.name}`)
                    }
                } else {
                    newRestaurants.push(restaurant)
                }
            } catch (error) {
                // If error getting restaurant, assume it doesn't exist
                newRestaurants.push(restaurant)
            }
        }

        if (logProgress && result.totalSkipped > 0) {
            console.log(`📋 Skipped ${result.totalSkipped} existing restaurants`)
        }

        return newRestaurants
    }

    /**
     * Import restaurants in batches for better performance
     */
    private async importInBatches(
        restaurants: DisneyRestaurant[],
        result: ImportResult,
        options: ImportOptions
    ): Promise<void> {
        const batchSize = options.batchSize || 50

        for (let i = 0; i < restaurants.length; i += batchSize) {
            const batch = restaurants.slice(i, i + batchSize)
            const batchNumber = Math.floor(i / batchSize) + 1
            const totalBatches = Math.ceil(restaurants.length / batchSize)

            if (options.logProgress) {
                console.log(`🏗️  Processing batch ${batchNumber}/${totalBatches} (${batch.length} restaurants)...`)
            }

            try {
                await this.restaurantService.batchSaveRestaurants(batch)
                result.totalImported += batch.length

                if (options.logProgress) {
                    console.log(`✅ Batch ${batchNumber} completed successfully`)
                }
            } catch (error) {
                console.error(`❌ Batch ${batchNumber} failed:`, error)

                // Try importing individually to identify problematic restaurants
                for (const restaurant of batch) {
                    try {
                        await this.restaurantService.saveRestaurant(restaurant)
                        result.totalImported++
                    } catch (individualError) {
                        result.totalErrors++
                        result.errors.push({
                            restaurant: restaurant.name,
                            error: individualError instanceof Error ? individualError.message : 'Unknown error'
                        })
                    }
                }
            }

            // Small delay between batches to avoid overwhelming Firebase
            if (i + batchSize < restaurants.length) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        }
    }

    /**
     * Log sample restaurants for dry run
     */
    private logSampleRestaurants(restaurants: DisneyRestaurant[]): void {
        const sampleSize = Math.min(5, restaurants.length)
        console.log(`\n📋 Sample restaurants (showing ${sampleSize} of ${restaurants.length}):`);

        for (let i = 0; i < sampleSize; i++) {
            const restaurant = restaurants[i]
            console.log(`  ${i + 1}. ${restaurant.name} (${restaurant.location.areaName}) - ${restaurant.serviceType}`)
        }
        console.log()
    }

    /**
     * Log final import results
     */
    private logFinalResults(result: ImportResult): void {
        console.log('\n🎉 Import Completed!')
        console.log('='.repeat(50))
        console.log(`📊 Total Processed: ${result.totalProcessed}`)
        console.log(`✅ Successfully Imported: ${result.totalImported}`)
        console.log(`⏭️  Skipped: ${result.totalSkipped}`)
        console.log(`❌ Errors: ${result.totalErrors}`)
        console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(2)} seconds`)

        if (result.stats) {
            console.log('\n📈 Import Statistics:')
            console.log(`  Character Dining: ${result.stats.characterDining}`)
            console.log(`  Signature Dining: ${result.stats.signatureDining}`)
            console.log(`  By Location:`, Object.entries(result.stats.byLocation)
                .map(([location, count]) => `${location}: ${count}`)
                .join(', '))
        }

        if (result.errors.length > 0) {
            console.log('\n⚠️  Errors:')
            result.errors.forEach(error => {
                console.log(`  - ${error.restaurant}: ${error.error}`)
            })
        }
        console.log('='.repeat(50))
    }

    /**
     * Get current database statistics
     */
    async getDatabaseStats(): Promise<any> {
        try {
            return await this.restaurantService.getRestaurantStats()
        } catch (error) {
            console.error('Error getting database stats:', error)
            return null
        }
    }

    /**
     * Clear all restaurants from the database (use with caution!)
     */
    async clearDatabase(confirm: boolean = false): Promise<{ success: boolean; deletedCount: number }> {
        if (!confirm) {
            throw new Error('Database clear requires explicit confirmation. Pass confirm=true parameter.')
        }

        console.log('🗑️  Clearing restaurant database...')

        try {
            const { restaurants } = await this.restaurantService.getRestaurants()
            let deletedCount = 0

            for (const restaurant of restaurants) {
                await this.restaurantService.deleteRestaurant(restaurant.id)
                deletedCount++
            }

            console.log(`✅ Deleted ${deletedCount} restaurants`)
            return { success: true, deletedCount }
        } catch (error) {
            console.error('❌ Error clearing database:', error)
            return { success: false, deletedCount: 0 }
        }
    }
}

// Export convenience functions
export const bulkImporter = new RestaurantBulkImporter()

/**
 * Quick import from JSON file
 */
export async function importRestaurantsFromFile(
    filePath: string,
    options: ImportOptions = {}
): Promise<ImportResult> {
    return await bulkImporter.importFromFile(filePath, options)
}

/**
 * Quick import from data object
 */
export async function importRestaurantsFromData(
    data: any,
    options: ImportOptions = {}
): Promise<ImportResult> {
    return await bulkImporter.importFromData(data, options)
}

/**
 * Example usage:
 *
 * // Import from JSON file
 * const result = await importRestaurantsFromFile('./disney-restaurants.json', {
 *     batchSize: 25,
 *     validateData: true,
 *     skipExisting: true,
 *     logProgress: true
 * })
 *
 * // Dry run to see what would be imported
 * const dryRunResult = await importRestaurantsFromFile('./disney-restaurants.json', {
 *     dryRun: true
 * })
 *
 * // Import from data object
 * const dataResult = await importRestaurantsFromData(restaurantData, {
 *     batchSize: 50
 * })
 */