#!/usr/bin/env ts-node

/**
 * Disney Springs Data Setup Script
 *
 * This script initializes the Firebase database with comprehensive Disney Springs data.
 * Run this script once to populate the database with all locations, metadata, and operational information.
 *
 * Usage:
 * 1. Make sure Firebase is configured in your project
 * 2. Set up your Firebase credentials
 * 3. Run: npx ts-node src/scripts/setup-disney-springs.ts
 */

import { initializeFirebaseWithDisneySpringsData } from './initializeDisneySpringsData'

async function main() {
    console.log('🏰 Starting Disney Springs data setup...')
    console.log('This will populate your Firebase database with comprehensive Disney Springs data.')

    try {
        // Initialize Firebase with the comprehensive Disney Springs data
        const transformedData = await initializeFirebaseWithDisneySpringsData()

        console.log('✅ Disney Springs data setup completed successfully!')
        console.log('\n📊 Data Summary:')
        console.log(`   📍 Metadata: ${transformedData.metadata.name}`)
        console.log(`   🕒 Operational Info: Parking, Transportation, Hours`)
        console.log(`   🏘️  Districts: ${Object.keys(transformedData.districts).length}`)
        console.log(`   🏪 Shopping Locations: ${transformedData.districts.marketplace.shopping.length + transformedData.districts.theLanding.shopping.length + transformedData.districts.townCenter.shopping.length + transformedData.districts.westSide.shopping.length}`)
        console.log(`   🍽️  Dining Locations: ${transformedData.districts.marketplace.dining.length + transformedData.districts.theLanding.dining.length + transformedData.districts.townCenter.dining.length + transformedData.districts.westSide.dining.length}`)
        console.log(`   🎭 Entertainment Locations: ${transformedData.districts.marketplace.entertainment.length + transformedData.districts.theLanding.entertainment.length + transformedData.districts.townCenter.entertainment.length + transformedData.districts.westSide.entertainment.length}`)
        console.log(`   🎉 Events: ${transformedData.events.seasonal.length + transformedData.events.regular.length}`)

        console.log('\n🚀 Your Disney Springs Firebase database is now ready!')
        console.log('You can now use the Disney Springs components in your application.')

    } catch (error) {
        console.error('❌ Error setting up Disney Springs data:')
        console.error(error)
        process.exit(1)
    }
}

// Run the setup if this script is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
}

export { main as setupDisneySpringsData }