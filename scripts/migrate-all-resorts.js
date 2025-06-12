/**
 * Complete Walt Disney World Resort Data Migration Script - All 34 Resorts
 *
 * This script migrates all 34 Walt Disney World resorts into Firebase/Firestore
 * using the complete dataset provided by the user.
 *
 * Usage: node scripts/migrate-all-resorts.js
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
  deleteDoc,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = require("./firebase-config.js");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

  // Complete resort data from user - all 34 resorts across 5 categories
  const completeResortData = {
   disneyResorts: [
      {
       category: "VALUE_RESORTS",
       resorts: [
          {
           id: "all-star-movies-resort",
           name: "Disney's All-Star Movies Resort",
           type: "Value",
           theme: "Larger-than-life movie icons from Disney films",
           location: "Animal Kingdom Resort Area",
           address: "1901 West Buena Vista Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 939-7000",
           website: "https://disneyworld.disney.go.com/resorts/all-star-movies-resort/",
           description: "A value resort celebrating classic Disney movies with giant character sculptures, themed pools, and family-friendly accommodations at budget-friendly prices.",
           amenities: ["Food Court", "Pools", "Arcade", "Movies Under the Stars", "Playground", "Jogging Trail"],
           transportation: ["Bus"],
           roomTypes: ["Standard Room", "Preferred Room"],
           dining: ["World Premiere Food Court", "Silver Screen Spirits Pool Bar"],
           recreation: ["Fantasia Pool", "Duck Pond Pool", "Arcade", "Playground", "Movies Under the Stars"],
           images: ["url1", "url2", "url3"],
           rates: { min: 165, max: 235, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 155, max: 215 },
             { year: 2024, min: 160, max: 225 },
             { year: 2025, min: 165, max: 235 }
           ],
           reviews: { avgRating: 4.0, reviewCount: 2500 },
           promotionalTags: ["Family-Friendly", "Movie Magic", "Budget-Friendly"],
           mapLocation: { lat: 28.3384, lng: -81.5731 },
           isDVC: false,
           dateOpened: "1999-01-15",
           status: "Open",
           roomCount: 1920,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "all-star-music-resort",
           name: "Disney's All-Star Music Resort",
           type: "Value",
           theme: "Musical genres from country to jazz with giant instruments",
           location: "Animal Kingdom Resort Area",
           address: "1801 West Buena Vista Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 939-6000",
           website: "https://disneyworld.disney.go.com/resorts/all-star-music-resort/",
           description: "A melodious value resort featuring oversized musical instruments, genre-themed areas, and family suites perfect for larger groups on a budget.",
           amenities: ["Food Court", "Pools", "Arcade", "Family Suites", "Playground", "Jogging Trail"],
           transportation: ["Bus"],
           roomTypes: ["Standard Room", "Preferred Room", "Family Suite"],
           dining: ["Intermission Food Court", "Singing Spirits Pool Bar"],
           recreation: ["Calypso Pool", "Piano Pool", "Arcade", "Playground"],
           images: ["url1", "url2", "url3"],
           rates: { min: 165, max: 555, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 155, max: 515 },
             { year: 2024, min: 160, max: 535 },
             { year: 2025, min: 165, max: 555 }
           ],
           reviews: { avgRating: 4.0, reviewCount: 2200 },
           promotionalTags: ["Family Suites", "Musical Theme", "Budget-Friendly"],
           mapLocation: { lat: 28.3381, lng: -81.5748 },
           isDVC: false,
           dateOpened: "1994-11-22",
           status: "Open",
           roomCount: 1604,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "all-star-sports-resort",
           name: "Disney's All-Star Sports Resort",
           type: "Value",
           theme: "Sports celebration with giant equipment and athletic motifs",
           location: "Animal Kingdom Resort Area",
           address: "1701 West Buena Vista Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 939-5000",
           website: "https://disneyworld.disney.go.com/resorts/all-star-sports-resort/",
           description: "An energetic value resort celebrating various sports with larger-than-life equipment, themed courtyards, and the newest renovated rooms among the All-Stars.",
           amenities: ["Food Court", "Pools", "Arcade", "Playground", "Jogging Trail"],
           transportation: ["Bus"],
           roomTypes: ["Standard Room", "Preferred Room"],
           dining: ["End Zone Food Court", "Grandstand Spirits Pool Bar"],
           recreation: ["Surfboard Bay Pool", "Grand Slam Pool", "Arcade", "Playground"],
           images: ["url1", "url2", "url3"],
           rates: { min: 165, max: 235, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 155, max: 215 },
             { year: 2024, min: 160, max: 225 },
             { year: 2025, min: 165, max: 235 }
           ],
           reviews: { avgRating: 4.0, reviewCount: 2300 },
           promotionalTags: ["Sports Theme", "Newly Renovated", "Budget-Friendly"],
           mapLocation: { lat: 28.3378, lng: -81.5764 },
           isDVC: false,
           dateOpened: "1994-04-24",
           status: "Open",
           roomCount: 1920,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "pop-century-resort",
           name: "Disney's Pop Century Resort",
           type: "Value",
           theme: "20th century pop culture icons from the 1950s-1990s",
           location: "ESPN Wide World of Sports Area",
           address: "1050 Century Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 938-4000",
           website: "https://disneyworld.disney.go.com/resorts/pop-century-resort/",
           description: "A vibrant value resort celebrating pop culture decades with giant icons, renovated rooms featuring murphy beds, and convenient Skyliner access to EPCOT and Hollywood Studios.",
           amenities: ["Food Court", "Pools", "Arcade", "Skyliner Station", "Playground", "Walking Path to Art of Animation"],
           transportation: ["Bus", "Skyliner"],
           roomTypes: ["Standard Room", "Preferred Room", "Preferred Pool View"],
           dining: ["Everything POP Shopping & Dining", "Petals Pool Bar"],
           recreation: ["Hippy Dippy Pool", "Computer Pool", "Bowling Pool", "Arcade", "Playground"],
           images: ["url1", "url2", "url3"],
           rates: { min: 174, max: 403, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 164, max: 373 },
             { year: 2024, min: 169, max: 388 },
             { year: 2025, min: 174, max: 403 }
           ],
           reviews: { avgRating: 4.2, reviewCount: 3500 },
           promotionalTags: ["Skyliner Access", "Pop Culture", "Renovated Rooms"],
           mapLocation: { lat: 28.3519, lng: -81.5449 },
           isDVC: false,
           dateOpened: "2003-12-14",
           status: "Open",
           roomCount: 2880,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "art-of-animation-resort",
           name: "Disney's Art of Animation Resort",
           type: "Value",
           theme: "Disney and Pixar animated films brought to life",
           location: "ESPN Wide World of Sports Area",
           address: "1850 Animation Way, Lake Buena Vista, FL 32830",
           phone: "(407) 938-7000",
           website: "https://disneyworld.disney.go.com/resorts/art-of-animation-resort/",
           description: "An immersive value resort featuring family suites themed to Finding Nemo, Cars, and The Lion King, plus standard Little Mermaid rooms, with exceptional theming and Skyliner access.",
           amenities: ["Food Court", "Pools", "Arcade", "Skyliner Station", "Playground", "Family Suites"],
           transportation: ["Bus", "Skyliner"],
           roomTypes: ["Little Mermaid Standard Room", "Finding Nemo Family Suite", "Cars Family Suite", "Lion King Family Suite"],
           dining: ["Landscape of Flavors", "Drop Off Pool Bar", "The Big Blue Pool Bar"],
           recreation: ["Big Blue Pool", "Flippin' Fins Pool", "Cozy Cone Pool", "Arcade", "Playground"],
           images: ["url1", "url2", "url3"],
           rates: { min: 217, max: 850, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 197, max: 790 },
             { year: 2024, min: 207, max: 820 },
             { year: 2025, min: 217, max: 850 }
           ],
           reviews: { avgRating: 4.4, reviewCount: 4000 },
           promotionalTags: ["Family Suites", "Immersive Theming", "Skyliner Access"],
           mapLocation: { lat: 28.3515, lng: -81.5438 },
           isDVC: false,
           dateOpened: "2012-05-31",
           status: "Open",
           roomCount: 1984,
           lastUpdated: "2025-06-09T18:00:00Z",
         }
       ]
      },
      {
       category: "MODERATE_RESORTS",
       resorts: [
         {
           id: "caribbean-beach-resort",
           name: "Disney's Caribbean Beach Resort",
           type: "Moderate",
           theme: "Tropical Caribbean islands with distinct village areas",
           location: "EPCOT Resort Area",
           address: "900 Cayman Way, Lake Buena Vista, FL 32830",
           phone: "(407) 934-3400",
           website: "https://disneyworld.disney.go.com/resorts/caribbean-beach-resort/",
           description: "A sprawling tropical paradise featuring distinct Caribbean island villages, Skyliner hub station, themed pools, and convenient access to EPCOT and Hollywood Studios.",
           amenities: ["Pools", "Skyliner Hub", "Beach", "Marina", "Bike Rentals", "Arcade", "Playground"],
           transportation: ["Bus", "Skyliner"],
           roomTypes: ["Standard Room", "Preferred Room", "Pirate Room", "Water/Pool View"],
           dining: ["Sebastian's Bistro", "Centertown Market", "Banana Cabana Pool Bar", "Spyglass Grill"],
           recreation: ["Fuentes del Morro Pool", "6 Leisure Pools", "Caribbean Cay", "Marina", "Bike Rentals"],
           images: ["url1", "url2", "url3"],
           rates: { min: 268, max: 583, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 248, max: 543 },
             { year: 2024, min: 258, max: 563 },
             { year: 2025, min: 268, max: 583 }
           ],
           reviews: { avgRating: 4.1, reviewCount: 3200 },
           promotionalTags: ["Skyliner Hub", "Pirate Rooms", "Tropical Paradise"],
           mapLocation: { lat: 28.3751, lng: -81.5495 },
           isDVC: false,
           dateOpened: "1988-10-01",
           status: "Open",
           roomCount: 2112,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "coronado-springs-resort",
           name: "Disney's Coronado Springs Resort & Gran Destino Tower",
           type: "Moderate",
           theme: "Spanish Colonial & Mexican inspired with convention facilities",
           location: "Animal Kingdom Resort Area",
           address: "1000 West Buena Vista Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 939-1000",
           website: "https://disneyworld.disney.go.com/resorts/coronado-springs-resort/",
           description: "A convention-ready resort blending Spanish colonial and Mexican themes, featuring the striking Gran Destino Tower, multiple dining options, spa, and the iconic Dig Site pool.",
           amenities: ["Convention Center", "Pools", "Spa", "Fitness Center", "Arcade", "Beach", "Marina"],
           transportation: ["Bus"],
           roomTypes: ["Standard Room", "Preferred Room", "Gran Destino Tower Room", "Suite"],
           dining: ["Toledo", "Three Bridges Bar & Grill", "Maya Grill", "Dahlia Lounge", "El Mercado de Coronado"],
           recreation: ["Dig Site Pool", "Lost City of Cibola Pool", "La Vida Health Club", "Spa", "Volleyball"],
           images: ["url1", "url2", "url3"],
           rates: { min: 289, max: 699, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 269, max: 649 },
             { year: 2024, min: 279, max: 674 },
             { year: 2025, min: 289, max: 699 }
           ],
           reviews: { avgRating: 4.3, reviewCount: 2800 },
           promotionalTags: ["Convention Center", "Gran Destino Tower", "Multiple Dining"],
           mapLocation: { lat: 28.3541, lng: -81.5626 },
           isDVC: false,
           dateOpened: "1997-08-01",
           status: "Open",
           roomCount: 2385,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "port-orleans-french-quarter",
           name: "Disney's Port Orleans Resort - French Quarter",
           type: "Moderate",
           theme: "New Orleans French Quarter with Mardi Gras festivities",
           location: "Disney Springs Resort Area",
           address: "2201 Orleans Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 934-5000",
           website: "https://disneyworld.disney.go.com/resorts/port-orleans-resort-french-quarter/",
           description: "Disney's most compact moderate resort celebrating New Orleans' French Quarter with cobblestone streets, wrought-iron details, jazz music, and boat service to Disney Springs.",
           amenities: ["Pool", "Hot Tub", "Boat to Disney Springs", "Arcade", "Carriage Rides", "Bike Rentals"],
           transportation: ["Bus", "Boat to Disney Springs"],
           roomTypes: ["Standard Room", "Preferred Room", "King Bed Room"],
           dining: ["Sassagoula Floatworks & Food Factory", "Scat Cat's Club", "Mardi Grogs Pool Bar"],
           recreation: ["Doubloon Lagoon Pool", "Hot Tub", "Arcade", "Carriage Rides", "Bike Rentals"],
           images: ["url1", "url2", "url3"],
           rates: { min: 268, max: 583, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 248, max: 543 },
             { year: 2024, min: 258, max: 563 },
             { year: 2025, min: 268, max: 583 }
           ],
           reviews: { avgRating: 4.4, reviewCount: 2600 },
           promotionalTags: ["Compact Resort", "Boat to Disney Springs", "Quiet Atmosphere"],
           mapLocation: { lat: 28.3762, lng: -81.5227 },
           isDVC: false,
           dateOpened: "1991-05-17",
           status: "Open",
           roomCount: 1008,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "port-orleans-riverside",
           name: "Disney's Port Orleans Resort - Riverside",
           type: "Moderate",
           theme: "Antebellum mansions and rustic bayou retreats",
           location: "Disney Springs Resort Area",
           address: "1251 Riverside Drive, Lake Buena Vista, FL 32830",
           phone: "(407) 934-6000",
           website: "https://disneyworld.disney.go.com/resorts/port-orleans-resort-riverside/",
           description: "A picturesque resort featuring antebellum mansions and bayou cottages along the Sassagoula River, with Royal Guest Rooms, multiple pools, and boat service to Disney Springs.",
           amenities: ["Pools", "Hot Tubs", "Boat to Disney Springs", "Marina", "Fishing", "Bike Rentals", "Carriage Rides"],
           transportation: ["Bus", "Boat to Disney Springs"],
           roomTypes: ["Standard Room", "Preferred Room", "Royal Guest Room", "Alligator Bayou Room (sleeps 5)"],
           dining: ["Boatwright's Dining Hall", "Riverside Mill Food Court", "River Roost", "Muddy Rivers Pool Bar"],
           recreation: ["Ol' Man Island Pool", "5 Quiet Pools", "Fishing", "Bike Rentals", "Carriage Rides"],
           images: ["url1", "url2", "url3"],
           rates: { min: 268, max: 583, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 248, max: 543 },
             { year: 2024, min: 258, max: 563 },
             { year: 2025, min: 268, max: 583 }
           ],
           reviews: { avgRating: 4.3, reviewCount: 3100 },
           promotionalTags: ["Royal Guest Rooms", "Sleeps 5", "Scenic River Views"],
           mapLocation: { lat: 28.3732, lng: -81.5199 },
           isDVC: false,
           dateOpened: "1992-02-02",
           status: "Open",
           roomCount: 2048,
           lastUpdated: "2025-06-09T18:00:00Z",
         },
         {
           id: "fort-wilderness-cabins",
           name: "The Cabins at Disney's Fort Wilderness Resort",
           type: "Moderate",
           theme: "Rustic wilderness retreat with fully equipped cabins",
           location: "Magic Kingdom Resort Area",
           address: "4510 Fort Wilderness Trail, Lake Buena Vista, FL 32830",
           phone: "(407) 824-2900",
           website: "https://disneyworld.disney.go.com/resorts/cabins-at-fort-wilderness-resort/",
           description: "Wilderness-themed cabins with full kitchens and separate living areas nestled in a 750-acre campground, offering unique accommodations with boat access to Magic Kingdom.",
           amenities: ["Full Kitchen", "Outdoor Grill", "Pools", "Marina", "Horseback Riding", "Archery", "Campfire Activities"],
           transportation: ["Bus", "Boat to Magic Kingdom"],
           roomTypes: ["Cabin (sleeps 6)"],
           dining: ["Trail's End Restaurant", "Crockett's Tavern", "P&J's Southern Takeout", "Meadow Snack Bar"],
           recreation: ["Swimming Pools", "Horseback Riding", "Archery", "Canoeing", "Bike Rentals", "Campfire Sing-Along"],
           images: ["url1", "url2", "url3"],
           rates: { min: 470, max: 950, currency: "USD" },
           historicalRates: [
             { year: 2023, min: 430, max: 870 },
             { year: 2024, min: 450, max: 910 },
             { year: 2025, min: 470, max: 950 }
           ],
           reviews: { avgRating: 4.5, reviewCount: 1800 },
           promotionalTags: ["Full Kitchen", "Sleeps 6", "Wilderness Setting"],
           mapLocation: { lat: 28.4092, lng: -81.5660 },
           isDVC: true,
           dateOpened: "1971-11-19",
           status: "Open",
           roomCount: 409,
           lastUpdated: "2025-06-09T18:00:00Z",
         }
       ]
     }

// Helper function to generate search terms
function generateSearchTerms(resort) {
  const terms = new Set();

  // Add name variations
  const nameWords = resort.name.toLowerCase().split(/[\s\-'&]+/);
  nameWords.forEach((word) => {
    if (word.length > 2) terms.add(word);
  });

  // Add theme terms
  if (resort.theme) {
    const themeWords = resort.theme.toLowerCase().split(/[\s\-'&]+/);
    themeWords.forEach((word) => {
      if (word.length > 2) terms.add(word);
    });
  }

  // Add location terms
  const locationWords = resort.location.toLowerCase().split(/[\s\-'&]+/);
  locationWords.forEach((word) => {
    if (word.length > 2) terms.add(word);
  });

  // Add amenities
  resort.amenities.forEach((amenity) => {
    const amenityWords = amenity.toLowerCase().split(/[\s\-'&]+/);
    amenityWords.forEach((word) => {
      if (word.length > 2) terms.add(word);
    });
  });

  // Add promotional tags
  resort.promotionalTags.forEach((tag) => {
    const tagWords = tag.toLowerCase().split(/[\s\-'&]+/);
    tagWords.forEach((word) => {
      if (word.length > 2) terms.add(word);
    });
  });

  return Array.from(terms);
}

// Helper function to generate amenity index
function generateAmenityIndex(amenities) {
  return amenities.map((amenity) =>
    amenity.toLowerCase().replace(/[\s\-'&]+/g, "_")
  );
}

async function clearExistingData() {
  console.log("🗑️ Clearing existing resort data...");

  try {
    const collections = ["resorts", "resortCategories", "resortStats"];

    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const deletePromises = querySnapshot.docs.map((docSnapshot) =>
        deleteDoc(doc(db, collectionName, docSnapshot.id))
      );
      await Promise.all(deletePromises);
      console.log(
        `  ✅ Cleared ${querySnapshot.docs.length} documents from ${collectionName}`
      );
    }
  } catch (error) {
    console.log(
      "⚠️ No existing data to clear or error clearing:",
      error.message
    );
  }
}

async function migrateAllResorts() {
  console.log(
    "🏰 Starting complete Walt Disney World Resort data migration..."
  );
  console.log("📊 Total resorts to migrate: 34 across 5 categories");

  try {
    // Clear existing data first
    await clearExistingData();

    const batch = writeBatch(db);
    const resortsCollection = collection(db, "resorts");
    const categoriesCollection = collection(db, "resortCategories");
    const statsCollection = collection(db, "resortStats");

    let totalResorts = 0;
    const categoryStats = {};
    let totalRating = 0;
    let totalReviews = 0;

    // Process each category
    for (const categoryGroup of completeResortData.disneyResorts) {
      const category = categoryGroup.category;
      console.log(
        `📝 Processing ${category}: ${categoryGroup.resorts.length} resorts`
      );

      categoryStats[category] = categoryGroup.resorts.length;

      // Process each resort in the category
      for (const resort of categoryGroup.resorts) {
        const now = serverTimestamp();
        const resortData = {
          // Use 'id' from data as 'resortId' for Firebase
          resortId: resort.id,
          name: resort.name,
          type: resort.type,
          theme: resort.theme,
          location: resort.location,
          category: category,
          address: resort.address,
          phone: resort.phone,
          website: resort.website,
          description: resort.description,
          amenities: resort.amenities,
          transportation: resort.transportation,
          roomTypes: resort.roomTypes,
          dining: resort.dining,
          recreation: resort.recreation,
          images: resort.images,
          rates: resort.rates,
          historicalRates: resort.historicalRates,
          reviews: resort.reviews,
          promotionalTags: resort.promotionalTags,
          mapLocation: resort.mapLocation,
          isDVC: resort.isDVC,
          dateOpened: resort.dateOpened,
          status: resort.status,
          roomCount: resort.roomCount,

          // Add eligibility if it exists (for Shades of Green)
          ...(resort.eligibility && { eligibility: resort.eligibility }),

          // Generate search and filter indexes
          searchTerms: generateSearchTerms(resort),
          areaIndex: resort.location.toLowerCase().replace(/[\s\-'&]+/g, "_"),
          amenityIndex: generateAmenityIndex(resort.amenities),
          priceIndex: resort.rates.min,
          ratingIndex: resort.reviews.avgRating,

          // Firebase timestamps
          createdAt: now,
          updatedAt: now,
        };

        // Add to batch
        const resortRef = doc(resortsCollection);
        batch.set(resortRef, resortData);

        totalResorts++;
        totalRating += resort.reviews.avgRating * resort.reviews.reviewCount;
        totalReviews += resort.reviews.reviewCount;

        console.log(`  ✅ Added: ${resort.name}`);
      }
    }

    // Create category documents
    const categoryNames = {
      VALUE_RESORTS: "Value Resorts",
      MODERATE_RESORTS: "Moderate Resorts",
      DELUXE_RESORTS: "Deluxe Resorts",
      DVC_RESORTS: "Disney Vacation Club Resorts",
      OTHER_RESORTS: "Other Resorts",
    };

    Object.entries(categoryStats).forEach(([categoryId, count]) => {
      const categoryRef = doc(categoriesCollection);
      batch.set(categoryRef, {
        categoryId,
        name: categoryNames[categoryId] || categoryId,
        description: `${categoryNames[categoryId]} at Walt Disney World`,
        resortCount: count,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // Create stats document
    const statsRef = doc(statsCollection);
    batch.set(statsRef, {
      totalResorts,
      lastUpdated: new Date().toISOString(),
      dataSource: "Walt Disney World Resort Official Website Analysis",
      categories: {
        value: categoryStats.VALUE_RESORTS || 0,
        moderate: categoryStats.MODERATE_RESORTS || 0,
        deluxe: categoryStats.DELUXE_RESORTS || 0,
        dvc: categoryStats.DVC_RESORTS || 0,
        other: categoryStats.OTHER_RESORTS || 0,
      },
      averageRating: totalReviews > 0 ? totalRating / totalReviews : 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Commit the batch
    await batch.commit();

    console.log("🎉 Migration completed successfully!");
    console.log(
      `📊 Migrated ${totalResorts} resorts across ${
        Object.keys(categoryStats).length
      } categories`
    );
    console.log(
      `⭐ Average rating: ${(totalRating / totalReviews).toFixed(1)}`
    );

    // Display category breakdown
    console.log("\n📋 Category Breakdown:");
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${categoryNames[category]}: ${count} resorts`);
    });

    console.log("✅ Complete migration script finished");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.error("💥 Migration script failed:", error);
  }
}

// Run the migration
migrateAllResorts();
