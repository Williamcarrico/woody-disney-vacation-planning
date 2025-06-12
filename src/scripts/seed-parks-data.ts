/**
 * Script to seed Firebase Firestore with static Disney park data
 *
 * Run with: npx tsx src/scripts/seed-parks-data.ts
 */

import { ParksService } from '../lib/firebase/parks-service.js'
import { magicKingdom, epcot, hollywoodStudios, animalKingdom } from '../lib/data/detailed-parks.js'

async function seedParksData() {
    console.log('🌟 Starting Disney Parks data seeding...\n')

    try {
        const parksService = ParksService.getInstance()

        // Array of all parks to seed
        const parksToSeed = [magicKingdom, epcot, hollywoodStudios, animalKingdom]

        console.log(`📊 Seeding ${parksToSeed.length} Disney parks to Firebase...\n`)

        // Batch create all parks
        await parksService.batchCreateParks(parksToSeed)

        console.log('✅ Successfully seeded all parks to Firebase!\n')

        // Display summary for each park
        const seededParks = await parksService.getAllParks()

        for (const park of seededParks) {
            const stats = await parksService.getParkStats(park.id)
            console.log(`\n🏰 ${park.name} (${park.abbreviation})`)
            console.log(`   📍 Location: ${park.location.address}`)
            console.log(`   🎢 Attractions: ${stats?.totalAttractions || 0}`)
            console.log(`   🍽️  Dining: ${stats?.totalDining || 0}`)
            console.log(`   🏞️  Lands: ${stats?.totalLands || 0}`)
            console.log(`   ⚡ Lightning Lane: ${stats?.lightningLaneAttractions || 0}`)
            console.log(`   ⭐ Must-Do: ${stats?.mustDoAttractions || 0}`)
        }

        console.log('\n🎉 All done! Disney parks data has been successfully seeded to Firebase.')

    } catch (error) {
        console.error('❌ Error seeding parks data:', error)
        process.exit(1)
    }
}

// Helper function to display usage
function displayUsage() {
    console.log(`
🏰 Disney Parks Data Seeder

Usage: npx tsx src/scripts/seed-parks-data.ts [options]

Options:
  --force    Overwrite existing park data
  --help     Show this help message

Examples:
  npx tsx src/scripts/seed-parks-data.ts
  npx tsx src/scripts/seed-parks-data.ts --force
`)
}

// Main execution
if (process.argv.includes('--help')) {
    displayUsage()
    process.exit(0)
}

// Run the seeding process
seedParksData().catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
})