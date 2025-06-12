#!/usr/bin/env ts-node

/**
 * Data Migration Script for Walt Disney World Resort Data
 *
 * This script migrates the comprehensive Walt Disney World resort data
 * from JSON format into Firebase/Firestore collections with proper
 * structure, search indexes, and categorization.
 */

import { initializeApp } from 'firebase/app'
import {
    getFirestore,
    collection,
    doc,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore'

// Firebase configuration - Update with your project config
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Walt Disney World Resort Data
const resortData = {
    "VALUE_RESORTS": [
        {
            "resortId": "all-star-movies-resort",
            "name": "Disney's All-Star Movies Resort",
            "type": "Value",
            "theme": "Movies",
            "location": "Animal Kingdom Resort Area",
            "address": "1901 W Buena Vista Dr, Bay Lake, FL 32830",
            "phone": "(407) 939-7000",
            "website": "https://disneyworld.disney.go.com/resorts/all-star-movies-resort/",
            "description": "Step into the magical world of Disney movies at this value resort featuring themed sections celebrating beloved films.",
            "amenities": [
                "2 outdoor pools",
                "Food court dining",
                "Disney gift shop",
                "Laundry facilities",
                "Game arcade",
                "Playground",
                "Self-parking"
            ],
            "transportation": [
                "Disney bus service",
                "Resort monorail access"
            ],
            "roomTypes": [
                "Standard rooms with 2 double beds",
                "Preferred rooms near amenities"
            ],
            "dining": [
                "World Premiere Food Court",
                "Silver Screen Pool Bar"
            ],
            "recreation": [
                "2 themed pools",
                "Playground",
                "Movies under the stars"
            ],
            "images": [
                "https://example.com/all-star-movies-1.jpg",
                "https://example.com/all-star-movies-2.jpg"
            ],
            "rates": {
                "min": 120,
                "max": 180,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 115, "max": 175 },
                { "year": 2022, "min": 110, "max": 165 }
            ],
            "reviews": {
                "avgRating": 4.1,
                "reviewCount": 1850
            },
            "promotionalTags": [
                "Family Friendly",
                "Budget Conscious",
                "Movie Magic"
            ],
            "mapLocation": {
                "lat": 28.3590,
                "lng": -81.5901
            },
            "isDVC": false,
            "dateOpened": "1999-05-01",
            "status": "Open",
            "roomCount": 1920,
            "category": "VALUE_RESORTS"
        },
        {
            "resortId": "all-star-music-resort",
            "name": "Disney's All-Star Music Resort",
            "type": "Value",
            "theme": "Music",
            "location": "Animal Kingdom Resort Area",
            "address": "1801 W Buena Vista Dr, Bay Lake, FL 32830",
            "phone": "(407) 939-6000",
            "website": "https://disneyworld.disney.go.com/resorts/all-star-music-resort/",
            "description": "Experience the rhythm and melody of music at this value resort featuring musical-themed sections and giant instruments.",
            "amenities": [
                "2 outdoor pools",
                "Food court dining",
                "Disney gift shop",
                "Laundry facilities",
                "Game arcade",
                "Playground",
                "Self-parking"
            ],
            "transportation": [
                "Disney bus service"
            ],
            "roomTypes": [
                "Standard rooms with 2 double beds",
                "Family suites (sleeps up to 6)"
            ],
            "dining": [
                "Intermission Food Court",
                "Singing Spirits Pool Bar"
            ],
            "recreation": [
                "2 themed pools",
                "Playground",
                "Movies under the stars"
            ],
            "images": [
                "https://example.com/all-star-music-1.jpg",
                "https://example.com/all-star-music-2.jpg"
            ],
            "rates": {
                "min": 125,
                "max": 185,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 120, "max": 180 },
                { "year": 2022, "min": 115, "max": 170 }
            ],
            "reviews": {
                "avgRating": 4.2,
                "reviewCount": 1720
            },
            "promotionalTags": [
                "Family Friendly",
                "Budget Conscious",
                "Musical Magic"
            ],
            "mapLocation": {
                "lat": 28.3580,
                "lng": -81.5895
            },
            "isDVC": false,
            "dateOpened": "1994-11-22",
            "status": "Open",
            "roomCount": 1604,
            "category": "VALUE_RESORTS"
        }
    ],
    "MODERATE_RESORTS": [
        {
            "resortId": "port-orleans-french-quarter",
            "name": "Disney's Port Orleans Resort - French Quarter",
            "type": "Moderate",
            "theme": "New Orleans French Quarter",
            "location": "Disney Springs Resort Area",
            "address": "2201 Orleans Dr, Orlando, FL 32830",
            "phone": "(407) 934-5000",
            "website": "https://disneyworld.disney.go.com/resorts/port-orleans-resort-french-quarter/",
            "description": "Experience the charm and romance of New Orleans' French Quarter with cobblestone streets, wrought-iron balconies, and Southern hospitality.",
            "amenities": [
                "Themed pool with waterslide",
                "Table service restaurant",
                "Quick service dining",
                "Disney gift shop",
                "Fitness center",
                "Laundry facilities",
                "Marina with boat rentals",
                "Self-parking"
            ],
            "transportation": [
                "Disney bus service",
                "Boat service to Disney Springs"
            ],
            "roomTypes": [
                "Standard rooms with 2 queen beds",
                "King bed rooms available",
                "Connecting rooms available"
            ],
            "dining": [
                "Boatwright's Dining Hall",
                "Sassagoula Floatworks and Food Factory",
                "Mardi Grogs Pool Bar"
            ],
            "recreation": [
                "Doubloon Lagoon themed pool",
                "Boat rentals",
                "Fishing",
                "Playground",
                "Movies under the stars"
            ],
            "images": [
                "https://example.com/port-orleans-fq-1.jpg",
                "https://example.com/port-orleans-fq-2.jpg"
            ],
            "rates": {
                "min": 245,
                "max": 385,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 235, "max": 375 },
                { "year": 2022, "min": 225, "max": 360 }
            ],
            "reviews": {
                "avgRating": 4.4,
                "reviewCount": 2150
            },
            "promotionalTags": [
                "Romantic",
                "Southern Charm",
                "Boat Transportation"
            ],
            "mapLocation": {
                "lat": 28.3692,
                "lng": -81.5342
            },
            "isDVC": false,
            "dateOpened": "1991-05-17",
            "status": "Open",
            "roomCount": 1008,
            "category": "MODERATE_RESORTS"
        }
    ],
    "DELUXE_RESORTS": [
        {
            "resortId": "grand-floridian-resort-spa",
            "name": "Disney's Grand Floridian Resort & Spa",
            "type": "Deluxe",
            "theme": "Victorian Elegance",
            "location": "Magic Kingdom Resort Area",
            "address": "4401 Floridian Way, Bay Lake, FL 32830",
            "phone": "(407) 824-3000",
            "website": "https://disneyworld.disney.go.com/resorts/grand-floridian-resort-and-spa/",
            "description": "Experience Victorian elegance and luxury at Disney's flagship resort, featuring world-class dining, spa services, and monorail access to Magic Kingdom.",
            "amenities": [
                "Multiple themed pools",
                "Full-service spa",
                "Multiple signature restaurants",
                "Concierge services",
                "Fitness center",
                "Marina with boat rentals",
                "Wedding pavilion",
                "Monorail access",
                "Valet parking"
            ],
            "transportation": [
                "Resort monorail",
                "Boat service to Magic Kingdom",
                "Disney bus service"
            ],
            "roomTypes": [
                "Standard resort view rooms",
                "Lagoon view rooms",
                "Theme park view rooms",
                "Club level rooms",
                "One-bedroom suites",
                "Presidential suite"
            ],
            "dining": [
                "Victoria & Albert's",
                "Narcoossee's",
                "1900 Park Fare",
                "Grand Floridian Café",
                "Gasparilla Island Grill"
            ],
            "recreation": [
                "Beach pool with zero-entry",
                "Courtyard pool",
                "Beach volleyball",
                "Boat rentals",
                "Fishing excursions",
                "Spa services"
            ],
            "images": [
                "https://example.com/grand-floridian-1.jpg",
                "https://example.com/grand-floridian-2.jpg"
            ],
            "rates": {
                "min": 650,
                "max": 1200,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 625, "max": 1150 },
                { "year": 2022, "min": 600, "max": 1100 }
            ],
            "reviews": {
                "avgRating": 4.7,
                "reviewCount": 3200
            },
            "promotionalTags": [
                "Luxury",
                "Victorian Elegance",
                "Signature Dining",
                "Monorail Access"
            ],
            "mapLocation": {
                "lat": 28.4111,
                "lng": -81.5866
            },
            "isDVC": false,
            "dateOpened": "1988-06-28",
            "status": "Open",
            "roomCount": 867,
            "category": "DELUXE_RESORTS"
        }
    ],
    "DVC_RESORTS": [
        {
            "resortId": "bay-lake-tower-dvc",
            "name": "Bay Lake Tower at Disney's Contemporary Resort",
            "type": "DVC Villa",
            "theme": "Modern Contemporary",
            "location": "Magic Kingdom Resort Area",
            "address": "4600 N World Dr, Bay Lake, FL 32830",
            "phone": "(407) 824-1000",
            "website": "https://disneyworld.disney.go.com/resorts/bay-lake-tower-at-contemporary-resort/",
            "description": "Experience modern luxury with stunning views of Magic Kingdom and Bay Lake at this Disney Vacation Club resort.",
            "amenities": [
                "Rooftop deck with Magic Kingdom views",
                "DVC member lounge",
                "Access to Contemporary Resort amenities",
                "Monorail access",
                "Multiple pools",
                "Marina",
                "Fitness center",
                "Valet parking"
            ],
            "transportation": [
                "Resort monorail",
                "Walking path to Magic Kingdom",
                "Disney bus service"
            ],
            "roomTypes": [
                "Studio villas",
                "One-bedroom villas",
                "Two-bedroom villas",
                "Three-bedroom grand villas"
            ],
            "dining": [
                "Top of the World Lounge (DVC member exclusive)",
                "Access to Contemporary Resort dining"
            ],
            "recreation": [
                "Cove Pool",
                "Access to Contemporary pools",
                "Marina activities",
                "Rooftop observation deck"
            ],
            "images": [
                "https://example.com/bay-lake-tower-1.jpg",
                "https://example.com/bay-lake-tower-2.jpg"
            ],
            "rates": {
                "min": 550,
                "max": 950,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 525, "max": 925 },
                { "year": 2022, "min": 500, "max": 875 }
            ],
            "reviews": {
                "avgRating": 4.6,
                "reviewCount": 1450
            },
            "promotionalTags": [
                "DVC",
                "Magic Kingdom Views",
                "Modern Luxury",
                "Monorail Access"
            ],
            "mapLocation": {
                "lat": 28.4156,
                "lng": -81.5757
            },
            "isDVC": true,
            "dateOpened": "2009-08-04",
            "status": "Open",
            "roomCount": 295,
            "category": "DVC_RESORTS"
        }
    ],
    "OTHER_RESORTS": [
        {
            "resortId": "shades-of-green",
            "name": "Shades of Green",
            "type": "Military Resort",
            "theme": "Golf Resort",
            "location": "Magic Kingdom Resort Area",
            "address": "1950 W Magnolia Palm Dr, Bay Lake, FL 32830",
            "phone": "(407) 824-3400",
            "website": "https://www.shadesofgreen.org/",
            "description": "An Armed Forces Recreation Center exclusively for military personnel and their families, featuring golf courses and resort amenities.",
            "amenities": [
                "2 championship golf courses",
                "Multiple dining options",
                "Fitness center",
                "Pool complex",
                "Tennis courts",
                "Game room",
                "Gift shop",
                "Self-parking"
            ],
            "transportation": [
                "Disney bus service",
                "Resort shuttle service"
            ],
            "roomTypes": [
                "Standard guest rooms",
                "Family rooms",
                "Suites"
            ],
            "dining": [
                "Evergreens Sports Bar & Grill",
                "Magnolia Café",
                "Express Café",
                "Garden Gallery"
            ],
            "recreation": [
                "Magnolia Golf Course",
                "Palm Golf Course",
                "Pool complex with waterslide",
                "Tennis courts",
                "Fitness center"
            ],
            "images": [
                "https://example.com/shades-of-green-1.jpg",
                "https://example.com/shades-of-green-2.jpg"
            ],
            "rates": {
                "min": 150,
                "max": 250,
                "currency": "USD"
            },
            "historicalRates": [
                { "year": 2023, "min": 145, "max": 240 },
                { "year": 2022, "min": 140, "max": 230 }
            ],
            "reviews": {
                "avgRating": 4.3,
                "reviewCount": 890
            },
            "promotionalTags": [
                "Military Exclusive",
                "Golf Resort",
                "Family Friendly"
            ],
            "mapLocation": {
                "lat": 28.4089,
                "lng": -81.5734
            },
            "isDVC": false,
            "dateOpened": "1994-02-01",
            "status": "Open",
            "roomCount": 586,
            "eligibility": "Active and retired military, DoD civilians, and their families",
            "category": "OTHER_RESORTS"
        }
    ]
}

// Helper function to generate search terms
function generateSearchTerms(resort: any): string[] {
    const terms = new Set<string>()

    // Add name variations
    const nameWords = resort.name.toLowerCase().split(' ')
    nameWords.forEach(word => {
        if (word.length > 2) terms.add(word)
    })

    // Add theme terms
    if (resort.theme) {
        const themeWords = resort.theme.toLowerCase().split(' ')
        themeWords.forEach(word => {
            if (word.length > 2) terms.add(word)
        })
    }

    // Add location terms
    const locationWords = resort.location.toLowerCase().split(' ')
    locationWords.forEach(word => {
        if (word.length > 2) terms.add(word)
    })

    // Add amenities
    resort.amenities.forEach((amenity: string) => {
        const amenityWords = amenity.toLowerCase().split(' ')
        amenityWords.forEach(word => {
            if (word.length > 2) terms.add(word)
        })
    })

    // Add promotional tags
    resort.promotionalTags.forEach((tag: string) => {
        const tagWords = tag.toLowerCase().split(' ')
        tagWords.forEach(word => {
            if (word.length > 2) terms.add(word)
        })
    })

    return Array.from(terms)
}

// Helper function to map category to type
function mapCategoryToType(category: string): string {
    switch (category) {
        case 'VALUE_RESORTS':
            return 'Value'
        case 'MODERATE_RESORTS':
            return 'Moderate'
        case 'DELUXE_RESORTS':
            return 'Deluxe'
        case 'DVC_RESORTS':
            return 'DVC Villa'
        case 'OTHER_RESORTS':
            return 'Military Resort'
        default:
            return 'Value'
    }
}

async function migrateResortData() {
    console.log('🏰 Starting Walt Disney World Resort data migration...')

    try {
        const batch = writeBatch(db)
        const resortsCollection = collection(db, 'resorts')
        const categoriesCollection = collection(db, 'resortCategories')
        const statsCollection = collection(db, 'resortStats')

        let totalResorts = 0
        const categoryStats: Record<string, number> = {}
        let totalRating = 0
        let totalReviews = 0

        // Process each category
        for (const [categoryKey, resorts] of Object.entries(resortData)) {
            console.log(`📝 Processing ${categoryKey}: ${resorts.length} resorts`)

            categoryStats[categoryKey] = resorts.length
            totalResorts += resorts.length

            // Process each resort in the category
            for (const resort of resorts) {
                const resortDoc = doc(resortsCollection)

                // Generate search and filter indexes
                const searchTerms = generateSearchTerms(resort)
                const areaIndex = resort.location.toLowerCase().replace(/\s+/g, '_')
                const amenityIndex = resort.amenities.map((a: string) => a.toLowerCase().replace(/\s+/g, '_'))

                const resortData = {
                    ...resort,
                    type: mapCategoryToType(categoryKey),
                    searchTerms,
                    areaIndex,
                    amenityIndex,
                    priceIndex: resort.rates.min,
                    ratingIndex: resort.reviews.avgRating,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                }

                batch.set(resortDoc, resortData)

                // Accumulate stats
                totalRating += resort.reviews.avgRating * resort.reviews.reviewCount
                totalReviews += resort.reviews.reviewCount

                console.log(`  ✅ Added: ${resort.name}`)
            }
        }

        // Create category documents
        const categories = [
            {
                categoryId: 'VALUE_RESORTS',
                name: 'Value Resorts',
                description: 'Budget-friendly accommodations with Disney theming and amenities',
                priceRange: { min: 120, max: 200 },
                resortCount: categoryStats.VALUE_RESORTS || 0,
                features: ['Food court dining', 'Themed pools', 'Disney transportation'],
                targetAudience: ['Budget-conscious families', 'First-time visitors']
            },
            {
                categoryId: 'MODERATE_RESORTS',
                name: 'Moderate Resorts',
                description: 'Mid-tier resorts with enhanced theming and table service dining',
                priceRange: { min: 240, max: 400 },
                resortCount: categoryStats.MODERATE_RESORTS || 0,
                features: ['Table service dining', 'Themed pools with slides', 'Boat transportation'],
                targetAudience: ['Families seeking upgraded amenities', 'Couples']
            },
            {
                categoryId: 'DELUXE_RESORTS',
                name: 'Deluxe Resorts',
                description: 'Luxury accommodations with premium locations and amenities',
                priceRange: { min: 650, max: 1200 },
                resortCount: categoryStats.DELUXE_RESORTS || 0,
                features: ['Multiple signature restaurants', 'Spa services', 'Monorail/boat access'],
                targetAudience: ['Luxury travelers', 'Special occasions']
            },
            {
                categoryId: 'DVC_RESORTS',
                name: 'Disney Vacation Club Resorts',
                description: 'Villa-style accommodations for Disney Vacation Club members',
                priceRange: { min: 550, max: 950 },
                resortCount: categoryStats.DVC_RESORTS || 0,
                features: ['Villa accommodations', 'Kitchen facilities', 'Member exclusives'],
                targetAudience: ['DVC members', 'Extended stays', 'Large families']
            },
            {
                categoryId: 'OTHER_RESORTS',
                name: 'Other Resorts',
                description: 'Specialized resorts with unique eligibility requirements',
                priceRange: { min: 150, max: 250 },
                resortCount: categoryStats.OTHER_RESORTS || 0,
                features: ['Golf courses', 'Military exclusive', 'Special access'],
                targetAudience: ['Military families', 'Golf enthusiasts']
            }
        ]

        for (const category of categories) {
            const categoryDoc = doc(categoriesCollection)
            batch.set(categoryDoc, {
                ...category,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })
        }

        // Create stats document
        const statsDoc = doc(statsCollection)
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0

        batch.set(statsDoc, {
            totalResorts,
            lastUpdated: new Date().toISOString(),
            dataSource: 'Walt Disney World Resort Data Migration',
            categories: {
                value: categoryStats.VALUE_RESORTS || 0,
                moderate: categoryStats.MODERATE_RESORTS || 0,
                deluxe: categoryStats.DELUXE_RESORTS || 0,
                dvc: categoryStats.DVC_RESORTS || 0,
                other: categoryStats.OTHER_RESORTS || 0
            },
            averageRating: Math.round(averageRating * 10) / 10,
            priceRanges: {
                overall: { min: 120, max: 1200 },
                byCategory: {
                    VALUE_RESORTS: { min: 120, max: 200 },
                    MODERATE_RESORTS: { min: 240, max: 400 },
                    DELUXE_RESORTS: { min: 650, max: 1200 },
                    DVC_RESORTS: { min: 550, max: 950 },
                    OTHER_RESORTS: { min: 150, max: 250 }
                }
            },
            popularAmenities: [
                { name: 'Pool', count: totalResorts, percentage: 100 },
                { name: 'Disney Transportation', count: totalResorts, percentage: 100 },
                { name: 'Dining', count: totalResorts, percentage: 100 },
                { name: 'Gift Shop', count: Math.floor(totalResorts * 0.9), percentage: 90 },
                { name: 'Fitness Center', count: Math.floor(totalResorts * 0.6), percentage: 60 }
            ],
            locationDistribution: {
                'Magic Kingdom Resort Area': 3,
                'Animal Kingdom Resort Area': 2,
                'Disney Springs Resort Area': 1,
                'Epcot Resort Area': 0,
                'Hollywood Studios Resort Area': 0
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })

        // Commit the batch
        await batch.commit()

        console.log('🎉 Migration completed successfully!')
        console.log(`📊 Migrated ${totalResorts} resorts across ${Object.keys(categoryStats).length} categories`)
        console.log(`⭐ Average rating: ${Math.round(averageRating * 10) / 10}`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        throw error
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateResortData()
        .then(() => {
            console.log('✅ Migration script completed')
            process.exit(0)
        })
        .catch((error) => {
            console.error('💥 Migration script failed:', error)
            process.exit(1)
        })
}

export { migrateResortData }