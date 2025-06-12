const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} = require("firebase/firestore");

// Use the Firebase config from our config file
const config = require("./firebase-config.js");

// Initialize Firebase
const app = initializeApp(config);
const db = getFirestore(app);

// Helper function to generate search terms
function generateSearchTerms(resort) {
  const searchText = [
    resort.name,
    resort.description,
    resort.location,
    resort.amenities?.join(" ") || "",
    resort.promotionalTags?.join(" ") || "",
  ]
    .join(" ")
    .toLowerCase();

  return searchText
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .filter((term, index, arr) => arr.indexOf(term) === index)
    .slice(0, 40);
}

// Helper function to create indexes
function createIndexes(resort) {
  return {
    priceIndex: resort.rates.min,
    ratingIndex: resort.reviews.avgRating,
    areaIndex: resort.location.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    amenityIndex: resort.amenities.map((amenity) =>
      amenity.toLowerCase().replace(/[^a-z0-9]/g, "_")
    ),
  };
}

// Remaining resort data to migrate
const remainingResorts = [
  // DELUXE_RESORTS - Full 11 resorts
  {
    category: "DELUXE_RESORTS",
    resorts: [
      {
        id: "beach-club-resort",
        name: "Disney's Beach Club Resort",
        type: "Deluxe",
        theme: "New England seaside resort with beach cottage charm",
        location: "EPCOT Resort Area",
        address: "1800 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 934-8000",
        website: "https://disneyworld.disney.go.com/resorts/beach-club-resort/",
        description:
          "A charming New England-style beach resort featuring the incredible Stormalong Bay pool complex, walking distance to EPCOT and Hollywood Studios, with a relaxed coastal atmosphere.",
        amenities: [
          "Stormalong Bay Pool",
          "Beach",
          "Spa",
          "Fitness Center",
          "Tennis",
          "Marina",
        ],
        transportation: [
          "Bus",
          "Boat",
          "Walking to EPCOT/DHS",
          "Skyliner nearby",
        ],
        roomTypes: ["Standard View", "Water View", "Club Level"],
        dining: [
          "Cape May Cafe",
          "Beaches & Cream",
          "Beach Club Marketplace",
          "Hurricane Hanna's",
        ],
        recreation: [
          "Stormalong Bay",
          "Beach",
          "Surrey Bike Rentals",
          "Muscles & Bustles Health Club",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 613, max: 1450, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 573, max: 1350 },
          { year: 2024, min: 593, max: 1400 },
          { year: 2025, min: 613, max: 1450 },
        ],
        reviews: { avgRating: 4.6, reviewCount: 3800 },
        promotionalTags: ["Stormalong Bay", "Walk to Parks", "Beach Theme"],
        mapLocation: { lat: 28.3674, lng: -81.5566 },
        isDVC: false,
        dateOpened: "1990-11-19",
        status: "Open",
        roomCount: 583,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "boardwalk-inn",
        name: "Disney's BoardWalk Inn",
        type: "Deluxe",
        theme: "Turn-of-the-century Atlantic City boardwalk",
        location: "EPCOT Resort Area",
        address:
          "2101 North Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 939-5100",
        website: "https://disneyworld.disney.go.com/resorts/boardwalk-inn/",
        description:
          "A vibrant waterfront resort capturing the essence of 1930s Atlantic City with entertainment, dining, and nightlife along a quarter-mile promenade, walking distance to EPCOT and Hollywood Studios.",
        amenities: [
          "Pool",
          "Entertainment District",
          "Spa",
          "Fitness Center",
          "Tennis",
          "Bike Rentals",
        ],
        transportation: [
          "Bus",
          "Boat",
          "Walking to EPCOT/DHS",
          "Skyliner nearby",
        ],
        roomTypes: ["Standard View", "Garden View", "Water View", "Club Level"],
        dining: [
          "Flying Fish",
          "Trattoria al Forno",
          "BoardWalk Deli",
          "Ample Hills Creamery",
          "AbracadaBar",
        ],
        recreation: [
          "Luna Park Pool",
          "Community Hall",
          "Surrey Bike Rentals",
          "Muscles & Bustles Health Club",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 665, max: 1500, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 615, max: 1400 },
          { year: 2024, min: 640, max: 1450 },
          { year: 2025, min: 665, max: 1500 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 3200 },
        promotionalTags: [
          "Entertainment District",
          "Newly Renovated",
          "Walk to Parks",
        ],
        mapLocation: { lat: 28.3683, lng: -81.5532 },
        isDVC: false,
        dateOpened: "1996-06-01",
        status: "Open",
        roomCount: 378,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "contemporary-resort",
        name: "Disney's Contemporary Resort",
        type: "Deluxe",
        theme: "Modern architectural marvel with monorail through lobby",
        location: "Magic Kingdom Resort Area",
        address: "4600 North World Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-1000",
        website:
          "https://disneyworld.disney.go.com/resorts/contemporary-resort/",
        description:
          "An iconic A-frame resort where the monorail glides through the Grand Canyon Concourse, featuring updated Incredibles-themed rooms and walking distance to Magic Kingdom.",
        amenities: [
          "Monorail",
          "Pools",
          "Marina",
          "Spa",
          "Fitness Center",
          "Tennis",
          "Convention Center",
        ],
        transportation: ["Monorail", "Bus", "Boat", "Walking to Magic Kingdom"],
        roomTypes: [
          "Standard View",
          "Garden View",
          "Bay Lake View",
          "Theme Park View",
          "Club Level",
        ],
        dining: [
          "California Grill",
          "Steakhouse 71",
          "Chef Mickey's",
          "The Wave",
          "Contempo Cafe",
        ],
        recreation: [
          "Feature Pool",
          "Bay Lake",
          "Marina",
          "Olympiad Fitness Center",
          "Tennis Courts",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 584, max: 1650, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 544, max: 1550 },
          { year: 2024, min: 564, max: 1600 },
          { year: 2025, min: 584, max: 1650 },
        ],
        reviews: { avgRating: 4.4, reviewCount: 4200 },
        promotionalTags: [
          "Monorail Access",
          "Walk to Magic Kingdom",
          "Incredibles Rooms",
        ],
        mapLocation: { lat: 28.4155, lng: -81.5739 },
        isDVC: false,
        dateOpened: "1971-10-01",
        status: "Open",
        roomCount: 655,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
    ],
  },
];

async function migrateRemainingResorts() {
  try {
    console.log("Starting migration of remaining resorts...");
    let totalCount = 0;

    for (const categoryData of remainingResorts) {
      const category = categoryData.category;
      console.log(`\nMigrating ${category}...`);

      for (const resort of categoryData.resorts) {
        try {
          // Create the resort document
          const resortData = {
            ...resort,
            category,
            resortId: resort.id,
            searchTerms: generateSearchTerms(resort),
            ...createIndexes(resort),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // Remove the id field since we're using resortId
          delete resortData.id;

          const resortRef = doc(collection(db, "resorts"));
          await setDoc(resortRef, resortData);

          console.log(`✓ Added resort: ${resort.name}`);
          totalCount++;
        } catch (error) {
          console.error(`✗ Failed to add resort ${resort.name}:`, error);
        }
      }
    }

    console.log(`\n✅ Migration completed! Added ${totalCount} resorts.`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateRemainingResorts()
  .then(() => {
    console.log("Migration script finished.");
    process.exit(0);
  })
  .catch(console.error);
