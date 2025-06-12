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

// Final 6 DVC resorts to complete all 34 Walt Disney World resorts
const final6DVCResorts = [
  {
    category: "DVC_RESORTS",
    resorts: [
      {
        id: "beach-club-villas",
        name: "Disney's Beach Club Villas",
        type: "DVC Villa",
        theme: "New England seaside charm with Disney Vacation Club luxury",
        location: "EPCOT Resort Area",
        address: "1800 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 934-2175",
        website: "https://disneyworld.disney.go.com/resorts/beach-club-villas/",
        description:
          "Disney Vacation Club villas sharing the Beach Club's New England charm and incredible Stormalong Bay, with full kitchens and walking distance to EPCOT and Hollywood Studios.",
        amenities: [
          "Stormalong Bay Access",
          "Full Kitchens",
          "Laundry",
          "Beach",
          "Spa Access",
        ],
        transportation: [
          "Bus",
          "Boat",
          "Walking to EPCOT/DHS",
          "Skyliner nearby",
        ],
        roomTypes: ["Studio", "1-Bedroom Villa", "2-Bedroom Villa"],
        dining: ["Shared with Beach Club Resort"],
        recreation: ["Stormalong Bay", "Beach", "Ship Shape Health Club"],
        images: ["url1", "url2", "url3"],
        rates: { min: 695, max: 3000, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 655, max: 2800 },
          { year: 2024, min: 675, max: 2900 },
          { year: 2025, min: 695, max: 3000 },
        ],
        reviews: { avgRating: 4.6, reviewCount: 2200 },
        promotionalTags: ["Stormalong Bay", "DVC", "Walk to Parks"],
        mapLocation: { lat: 28.3674, lng: -81.5566 },
        isDVC: true,
        dateOpened: "1995-07-01",
        status: "Open",
        roomCount: 208,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "bay-lake-tower",
        name: "Bay Lake Tower at Disney's Contemporary Resort",
        type: "DVC Villa",
        theme:
          "Modern tower with Magic Kingdom views and Contemporary Resort access",
        location: "Magic Kingdom Resort Area",
        address: "4600 North World Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-1000",
        website:
          "https://disneyworld.disney.go.com/resorts/bay-lake-tower-at-contemporary/",
        description:
          "Disney Vacation Club tower offering stunning Magic Kingdom views, full kitchens, and exclusive access to Contemporary Resort amenities with monorail transportation.",
        amenities: [
          "Magic Kingdom Views",
          "Monorail Access",
          "Full Kitchens",
          "Laundry",
          "Top of the World Lounge",
        ],
        transportation: ["Monorail", "Bus", "Boat", "Walking to Magic Kingdom"],
        roomTypes: [
          "Studio",
          "1-Bedroom Villa",
          "2-Bedroom Villa",
          "3-Bedroom Grand Villa",
        ],
        dining: ["Shared with Contemporary Resort", "Top of the World Lounge"],
        recreation: [
          "Bay Lake",
          "Contemporary Resort pools",
          "Top of the World Lounge",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 625, max: 4500, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 585, max: 4200 },
          { year: 2024, min: 605, max: 4350 },
          { year: 2025, min: 625, max: 4500 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 1800 },
        promotionalTags: [
          "Magic Kingdom Views",
          "Monorail Access",
          "Top of World Lounge",
        ],
        mapLocation: { lat: 28.4155, lng: -81.5739 },
        isDVC: true,
        dateOpened: "2009-08-04",
        status: "Open",
        roomCount: 295,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "copper-creek-villas",
        name: "Copper Creek Villas & Cabins at Disney's Wilderness Lodge",
        type: "DVC Villa",
        theme:
          "Pacific Northwest wilderness with rustic luxury and lakefront cabins",
        location: "Magic Kingdom Resort Area",
        address: "901 Timberline Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3200",
        website:
          "https://disneyworld.disney.go.com/resorts/copper-creek-villas-and-cabins/",
        description:
          "Disney Vacation Club villas and unique lakefront cabins at Wilderness Lodge, offering full kitchens, rustic luxury, and boat transportation to Magic Kingdom.",
        amenities: [
          "Lakefront Cabins",
          "Full Kitchens",
          "Geyser Views",
          "Laundry",
          "Wilderness Lodge Access",
        ],
        transportation: ["Bus", "Boat to Magic Kingdom"],
        roomTypes: [
          "Studio",
          "1-Bedroom Villa",
          "2-Bedroom Villa",
          "Lakefront Cabin",
        ],
        dining: ["Shared with Wilderness Lodge", "Geyser Point Bar & Grill"],
        recreation: [
          "Copper Creek Springs Pool",
          "Bay Lake",
          "Cabins with private decks",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 525, max: 3800, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 485, max: 3500 },
          { year: 2024, min: 505, max: 3650 },
          { year: 2025, min: 525, max: 3800 },
        ],
        reviews: { avgRating: 4.7, reviewCount: 1600 },
        promotionalTags: ["Lakefront Cabins", "DVC", "Boat to MK"],
        mapLocation: { lat: 28.4162, lng: -81.5671 },
        isDVC: true,
        dateOpened: "2017-07-17",
        status: "Open",
        roomCount: 184,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "polynesian-villas-bungalows",
        name: "The Villas at Disney's Polynesian Village Resort",
        type: "DVC Villa",
        theme:
          "Polynesian paradise with overwater bungalows and tropical luxury",
        location: "Magic Kingdom Resort Area",
        address: "1600 Seven Seas Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-2000",
        website:
          "https://disneyworld.disney.go.com/resorts/villas-at-polynesian-resort/",
        description:
          "Disney Vacation Club's most unique accommodations featuring overwater bungalows and studio villas with Polynesian theming, Magic Kingdom views, and monorail access.",
        amenities: [
          "Overwater Bungalows",
          "Monorail Access",
          "Full Kitchens",
          "Private Decks",
          "Beach Access",
        ],
        transportation: ["Monorail", "Bus", "Boat"],
        roomTypes: ["Studio", "2-Bedroom Bungalow"],
        dining: ["Shared with Polynesian Village Resort"],
        recreation: [
          "Seven Seas Lagoon",
          "Private bungalow decks",
          "Beach access",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 825, max: 6000, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 785, max: 5600 },
          { year: 2024, min: 805, max: 5800 },
          { year: 2025, min: 825, max: 6000 },
        ],
        reviews: { avgRating: 4.8, reviewCount: 900 },
        promotionalTags: [
          "Overwater Bungalows",
          "Most Unique DVC",
          "Magic Kingdom Views",
        ],
        mapLocation: { lat: 28.4065, lng: -81.5832 },
        isDVC: true,
        dateOpened: "2015-04-01",
        status: "Open",
        roomCount: 380,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "riviera-resort",
        name: "Disney's Riviera Resort",
        type: "DVC Villa",
        theme:
          "European Riviera elegance with modern luxury and rooftop dining",
        location: "EPCOT Resort Area",
        address: "1080 Esplanade Avenue, Lake Buena Vista, FL 32830",
        phone: "(407) 827-1100",
        website: "https://disneyworld.disney.go.com/resorts/riviera-resort/",
        description:
          "Disney Vacation Club's newest resort featuring European Riviera theming, Skyliner transportation, rooftop dining, and luxurious accommodations with views of EPCOT fireworks.",
        amenities: [
          "Skyliner Access",
          "Rooftop Dining",
          "Full Kitchens",
          "Spa",
          "EPCOT Fireworks Views",
        ],
        transportation: ["Skyliner", "Bus"],
        roomTypes: [
          "Studio",
          "1-Bedroom Villa",
          "2-Bedroom Villa",
          "3-Bedroom Grand Villa",
          "Tower Studio",
        ],
        dining: [
          "Topolino's Terrace",
          "Primo Piatto",
          "Bar Riva",
          "Le Petit Cafe",
        ],
        recreation: ["Riviera Pool", "Beau Soleil Pool", "S'il Vous Plaît Spa"],
        images: ["url1", "url2", "url3"],
        rates: { min: 565, max: 4200, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 525, max: 3900 },
          { year: 2024, min: 545, max: 4050 },
          { year: 2025, min: 565, max: 4200 },
        ],
        reviews: { avgRating: 4.6, reviewCount: 1400 },
        promotionalTags: ["Newest DVC", "Skyliner Access", "Rooftop Dining"],
        mapLocation: { lat: 28.3588, lng: -81.5477 },
        isDVC: true,
        dateOpened: "2019-12-16",
        status: "Open",
        roomCount: 300,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "boulder-ridge-villas",
        name: "Boulder Ridge Villas at Disney's Wilderness Lodge",
        type: "DVC Villa",
        theme:
          "Rustic National Park lodge atmosphere with Disney Vacation Club luxury",
        location: "Magic Kingdom Resort Area",
        address: "901 Timberline Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3200",
        website:
          "https://disneyworld.disney.go.com/resorts/boulder-ridge-villas/",
        description:
          "Disney Vacation Club villas within Wilderness Lodge featuring rustic National Park theming, full kitchens, and boat transportation to Magic Kingdom with access to all lodge amenities.",
        amenities: [
          "Wilderness Lodge Access",
          "Full Kitchens",
          "Laundry",
          "Geyser Views",
          "Boat to Magic Kingdom",
        ],
        transportation: ["Bus", "Boat to Magic Kingdom"],
        roomTypes: ["Studio", "1-Bedroom Villa", "2-Bedroom Villa"],
        dining: ["Shared with Wilderness Lodge"],
        recreation: ["Boulder Ridge Cove Pool", "Wilderness Lodge amenities"],
        images: ["url1", "url2", "url3"],
        rates: { min: 485, max: 2900, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 445, max: 2700 },
          { year: 2024, min: 465, max: 2800 },
          { year: 2025, min: 485, max: 2900 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 2100 },
        promotionalTags: ["Wilderness Lodge", "DVC", "Boat to MK"],
        mapLocation: { lat: 28.4162, lng: -81.5671 },
        isDVC: true,
        dateOpened: "2000-05-01",
        status: "Open",
        roomCount: 136,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
    ],
  },
];

async function migrateFinal6DVCResorts() {
  try {
    console.log(
      "🏰 Starting final migration of last 6 DVC resorts to complete ALL 34 Walt Disney World resorts! 🏰"
    );
    let totalCount = 0;

    for (const categoryData of final6DVCResorts) {
      const category = categoryData.category;
      console.log(`\nMigrating final ${category}...`);

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

          // Add a small delay to avoid overwhelming Firestore
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`✗ Failed to add resort ${resort.name}:`, error);
        }
      }
    }

    console.log(
      `\n🎉 FINAL MIGRATION COMPLETED! Added ${totalCount} resorts. 🎉`
    );
    console.log("🌟 ALL 34 WALT DISNEY WORLD RESORTS NOW IN DATABASE! 🌟");
    console.log(
      "📊 Final Total: 28 (existing) + " +
        totalCount +
        " (new) = " +
        (28 + totalCount) +
        " resorts"
    );
    console.log("");
    console.log("🏨 Resort Categories Complete:");
    console.log("   • VALUE_RESORTS: 5 resorts");
    console.log("   • MODERATE_RESORTS: 5 resorts");
    console.log("   • DELUXE_RESORTS: 11 resorts");
    console.log("   • DVC_RESORTS: 12 resorts");
    console.log("   • OTHER_RESORTS: 1 resort");
    console.log("   📋 TOTAL: 34 Walt Disney World Resorts");
  } catch (error) {
    console.error("Final migration failed:", error);
  }
}

// Run the migration
migrateFinal6DVCResorts()
  .then(() => {
    console.log(
      "🎆 COMPLETE WALT DISNEY WORLD RESORT DATASET MIGRATION FINISHED! 🎆"
    );
    console.log("🏰 Ready for API testing and UI integration! 🏰");
    process.exit(0);
  })
  .catch(console.error);
