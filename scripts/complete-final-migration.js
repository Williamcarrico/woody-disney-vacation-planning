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

// All remaining resort data to complete the dataset
const remainingResorts = [
  // Remaining DELUXE_RESORTS (8 more)
  {
    category: "DELUXE_RESORTS",
    resorts: [
      {
        id: "grand-floridian-resort",
        name: "Disney's Grand Floridian Resort & Spa",
        type: "Deluxe",
        theme: "Victorian elegance inspired by Florida's grand hotels",
        location: "Magic Kingdom Resort Area",
        address: "4401 Floridian Way, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3000",
        website:
          "https://disneyworld.disney.go.com/resorts/grand-floridian-resort-and-spa/",
        description:
          "Walt Disney World's flagship Victorian-style resort featuring world-class dining, an award-winning spa, and unparalleled elegance with monorail and walking access to Magic Kingdom.",
        amenities: [
          "Monorail",
          "Pools",
          "Beach",
          "Full-Service Spa",
          "Fitness Center",
          "Wedding Pavilion",
        ],
        transportation: ["Monorail", "Bus", "Boat", "Walking to Magic Kingdom"],
        roomTypes: [
          "Standard View",
          "Garden View",
          "Lagoon View",
          "Theme Park View",
          "Club Level",
          "Suites",
        ],
        dining: [
          "Victoria & Albert's",
          "Citricos",
          "Narcoossee's",
          "1900 Park Fare",
          "Grand Floridian Cafe",
          "Enchanted Rose",
        ],
        recreation: [
          "Beach Pool",
          "Courtyard Pool",
          "Senses Spa",
          "Health Club",
          "Marina",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 780, max: 5502, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 730, max: 5102 },
          { year: 2024, min: 755, max: 5302 },
          { year: 2025, min: 780, max: 5502 },
        ],
        reviews: { avgRating: 4.6, reviewCount: 5000 },
        promotionalTags: [
          "Flagship Resort",
          "Victoria & Albert's",
          "Wedding Pavilion",
        ],
        mapLocation: { lat: 28.4102, lng: -81.5869 },
        isDVC: false,
        dateOpened: "1988-06-28",
        status: "Open",
        roomCount: 867,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "polynesian-village-resort",
        name: "Disney's Polynesian Village Resort",
        type: "Deluxe",
        theme: "South Pacific tropical paradise with tiki culture",
        location: "Magic Kingdom Resort Area",
        address: "1600 Seven Seas Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-2000",
        website: "https://disneyworld.disney.go.com/resorts/polynesian-resort/",
        description:
          "A tropical South Seas paradise on Seven Seas Lagoon featuring Moana-themed rooms, multiple dining options, white sand beaches, and monorail access to Magic Kingdom and EPCOT.",
        amenities: [
          "Monorail",
          "Pools",
          "Beach",
          "Marina",
          "Fitness Center",
          "Watercraft Rentals",
        ],
        transportation: ["Monorail", "Bus", "Boat", "Walking to TTC"],
        roomTypes: [
          "Standard View",
          "Garden View",
          "Lagoon View",
          "Theme Park View",
          "Club Level",
        ],
        dining: [
          "'Ohana",
          "Kona Cafe",
          "Capt. Cook's",
          "Trader Sam's Grog Grotto",
          "Pineapple Lanai",
        ],
        recreation: [
          "Lava Pool",
          "Oasis Pool",
          "Beach",
          "Marina",
          "Jogging Path",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 685, max: 1800, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 635, max: 1700 },
          { year: 2024, min: 660, max: 1750 },
          { year: 2025, min: 685, max: 1800 },
        ],
        reviews: { avgRating: 4.7, reviewCount: 4800 },
        promotionalTags: ["Moana Rooms", "Trader Sam's", "Beach Views"],
        mapLocation: { lat: 28.4065, lng: -81.5832 },
        isDVC: false,
        dateOpened: "1971-10-01",
        status: "Open",
        roomCount: 853,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "wilderness-lodge",
        name: "Disney's Wilderness Lodge",
        type: "Deluxe",
        theme: "Pacific Northwest national park lodge",
        location: "Magic Kingdom Resort Area",
        address: "901 Timberline Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3200",
        website:
          "https://disneyworld.disney.go.com/resorts/wilderness-lodge-resort/",
        description:
          "A majestic lodge inspired by turn-of-the-century National Park lodges, featuring a dramatic seven-story lobby, geysers, and boat transportation to Magic Kingdom.",
        amenities: [
          "Pools",
          "Beach",
          "Marina",
          "Fitness Center",
          "Bike Rentals",
          "Geyser",
        ],
        transportation: ["Bus", "Boat to Magic Kingdom"],
        roomTypes: [
          "Standard View",
          "Nature View",
          "Courtyard View",
          "Club Level",
        ],
        dining: [
          "Artist Point",
          "Whispering Canyon Cafe",
          "Geyser Point Bar & Grill",
          "Roaring Fork",
        ],
        recreation: [
          "Copper Creek Springs Pool",
          "Boulder Ridge Cove Pool",
          "Beach",
          "Bike Rentals",
          "Sturdy Branches Health Club",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 480, max: 1200, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 450, max: 1100 },
          { year: 2024, min: 465, max: 1150 },
          { year: 2025, min: 480, max: 1200 },
        ],
        reviews: { avgRating: 4.6, reviewCount: 3600 },
        promotionalTags: [
          "National Park Theme",
          "Boat to MK",
          "Nature Immersion",
        ],
        mapLocation: { lat: 28.4162, lng: -81.5671 },
        isDVC: false,
        dateOpened: "1994-05-28",
        status: "Open",
        roomCount: 727,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "yacht-club-resort",
        name: "Disney's Yacht Club Resort",
        type: "Deluxe",
        theme: "New England yacht club with nautical elegance",
        location: "EPCOT Resort Area",
        address: "1700 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 934-7000",
        website: "https://disneyworld.disney.go.com/resorts/yacht-club-resort/",
        description:
          "An elegant New England-style yacht club featuring sophisticated nautical theming, the amazing Stormalong Bay pool complex, and walking distance to EPCOT and Hollywood Studios.",
        amenities: [
          "Stormalong Bay Pool",
          "Beach",
          "Marina",
          "Spa",
          "Fitness Center",
          "Tennis",
        ],
        transportation: [
          "Bus",
          "Boat",
          "Walking to EPCOT/DHS",
          "Skyliner nearby",
        ],
        roomTypes: ["Standard View", "Garden View", "Water View", "Club Level"],
        dining: [
          "Yachtsman Steakhouse",
          "Ale & Compass",
          "The Market at Ale & Compass",
          "Crew's Cup Lounge",
        ],
        recreation: [
          "Stormalong Bay",
          "Tormalong Bay",
          "Ship Shape Health Club",
          "Bayside Marina",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 622, max: 1450, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 582, max: 1350 },
          { year: 2024, min: 602, max: 1400 },
          { year: 2025, min: 622, max: 1450 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 3500 },
        promotionalTags: ["Stormalong Bay", "Sophisticated", "Walk to Parks"],
        mapLocation: { lat: 28.3678, lng: -81.5585 },
        isDVC: false,
        dateOpened: "1990-11-05",
        status: "Open",
        roomCount: 630,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "swan-hotel",
        name: "Walt Disney World Swan",
        type: "Deluxe",
        theme: "Contemporary design with swan motifs by Michael Graves",
        location: "EPCOT Resort Area",
        address: "1200 Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 934-3000",
        website: "https://disneyworld.disney.go.com/resorts/swan-hotel/",
        description:
          "A Marriott-operated resort designed by Michael Graves featuring distinctive swan sculptures, multiple pools, and walking distance to EPCOT and Hollywood Studios with Disney benefits.",
        amenities: [
          "Pools",
          "Beach",
          "Spa",
          "Fitness Centers",
          "Tennis",
          "Game Room",
        ],
        transportation: ["Bus", "Boat", "Walking to EPCOT/DHS"],
        roomTypes: ["Traditional Room", "Resort View", "Alcove Room", "Suite"],
        dining: [
          "Il Mulino",
          "Garden Grove",
          "Kimonos",
          "The Fountain",
          "Java Bar",
        ],
        recreation: [
          "Grotto Pool",
          "Beach",
          "Swan Health Club",
          "Camp Dolphin",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 309, max: 850, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 279, max: 750 },
          { year: 2024, min: 294, max: 800 },
          { year: 2025, min: 309, max: 850 },
        ],
        reviews: { avgRating: 4.3, reviewCount: 3000 },
        promotionalTags: ["Marriott Points", "Walk to Parks", "Multiple Pools"],
        mapLocation: { lat: 28.366, lng: -81.559 },
        isDVC: false,
        dateOpened: "1990-01-13",
        status: "Open",
        roomCount: 758,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
    ],
  },
  // DVC_RESORTS (12 resorts)
  {
    category: "DVC_RESORTS",
    resorts: [
      {
        id: "animal-kingdom-villas-jambo",
        name: "Disney's Animal Kingdom Villas - Jambo House",
        type: "DVC Villa",
        theme: "African wildlife reserve with savanna views",
        location: "Animal Kingdom Resort Area",
        address: "2901 Osceola Parkway, Lake Buena Vista, FL 32830",
        phone: "(407) 938-4755",
        website:
          "https://disneyworld.disney.go.com/resorts/animal-kingdom-villas-jambo/",
        description:
          "Disney Vacation Club villas at Jambo House offering studios and multi-bedroom villas with savanna views and access to all Animal Kingdom Lodge amenities.",
        amenities: [
          "Savanna Views",
          "Pools",
          "Full Kitchens",
          "Laundry",
          "Cultural Activities",
        ],
        transportation: ["Bus"],
        roomTypes: [
          "Studio",
          "1-Bedroom Villa",
          "2-Bedroom Villa",
          "3-Bedroom Grand Villa",
        ],
        dining: ["Shared with Animal Kingdom Lodge"],
        recreation: ["Shared with Animal Kingdom Lodge"],
        images: ["url1", "url2", "url3"],
        rates: { min: 495, max: 3200, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 455, max: 2900 },
          { year: 2024, min: 475, max: 3050 },
          { year: 2025, min: 495, max: 3200 },
        ],
        reviews: { avgRating: 4.7, reviewCount: 2200 },
        promotionalTags: ["Savanna Views", "DVC", "Full Kitchens"],
        mapLocation: { lat: 28.3553, lng: -81.6006 },
        isDVC: true,
        dateOpened: "2007-05-01",
        status: "Open",
        roomCount: 134,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "boardwalk-villas",
        name: "Disney's BoardWalk Villas",
        type: "DVC Villa",
        theme: "Turn-of-the-century Atlantic City boardwalk",
        location: "EPCOT Resort Area",
        address:
          "2101 North Epcot Resorts Boulevard, Lake Buena Vista, FL 32830",
        phone: "(407) 939-6200",
        website: "https://disneyworld.disney.go.com/resorts/boardwalk-villas/",
        description:
          "Disney Vacation Club villas sharing the BoardWalk entertainment district with studios and villas featuring full kitchens and laundry facilities.",
        amenities: [
          "Entertainment District",
          "Pools",
          "Full Kitchens",
          "Laundry",
          "Spa Access",
        ],
        transportation: ["Bus", "Boat", "Walking to EPCOT/DHS"],
        roomTypes: ["Studio", "1-Bedroom Villa", "2-Bedroom Villa"],
        dining: ["Shared with BoardWalk Inn"],
        recreation: ["Shared with BoardWalk Inn"],
        images: ["url1", "url2", "url3"],
        rates: { min: 685, max: 2800, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 635, max: 2600 },
          { year: 2024, min: 660, max: 2700 },
          { year: 2025, min: 685, max: 2800 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 2500 },
        promotionalTags: ["Entertainment District", "DVC", "Walk to Parks"],
        mapLocation: { lat: 28.3683, lng: -81.5532 },
        isDVC: true,
        dateOpened: "1996-06-01",
        status: "Open",
        roomCount: 532,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
      {
        id: "grand-floridian-villas",
        name: "The Villas at Disney's Grand Floridian Resort & Spa",
        type: "DVC Villa",
        theme: "Victorian elegance with Disney Vacation Club luxury",
        location: "Magic Kingdom Resort Area",
        address: "4401 Floridian Way, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3000",
        website:
          "https://disneyworld.disney.go.com/resorts/villas-at-grand-floridian-resort-and-spa/",
        description:
          "Elegant Disney Vacation Club villas at the flagship Grand Floridian resort with monorail access and all the luxury amenities of the resort.",
        amenities: [
          "Monorail",
          "Beach",
          "Full-Service Spa",
          "Full Kitchens",
          "Laundry",
        ],
        transportation: ["Monorail", "Bus", "Boat"],
        roomTypes: [
          "Studio",
          "1-Bedroom Villa",
          "2-Bedroom Villa",
          "3-Bedroom Grand Villa",
        ],
        dining: ["Shared with Grand Floridian"],
        recreation: ["Shared with Grand Floridian"],
        images: ["url1", "url2", "url3"],
        rates: { min: 825, max: 4200, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 785, max: 3900 },
          { year: 2024, min: 805, max: 4050 },
          { year: 2025, min: 825, max: 4200 },
        ],
        reviews: { avgRating: 4.8, reviewCount: 1500 },
        promotionalTags: ["Flagship Resort", "Monorail Access", "Luxury DVC"],
        mapLocation: { lat: 28.4102, lng: -81.5869 },
        isDVC: true,
        dateOpened: "2013-10-23",
        status: "Open",
        roomCount: 147,
        lastUpdated: "2025-06-09T18:00:00Z",
      },
    ],
  },
  // OTHER_RESORTS (1 resort)
  {
    category: "OTHER_RESORTS",
    resorts: [
      {
        id: "shades-of-green",
        name: "Shades of Green",
        type: "Military Resort",
        theme: "Country club atmosphere for military families",
        location: "Magic Kingdom Resort Area",
        address: "1950 West Magnolia Palm Drive, Lake Buena Vista, FL 32830",
        phone: "(407) 824-3400",
        website: "https://www.shadesofgreen.org/",
        description:
          "An Armed Forces Recreation Center exclusively for military personnel and their families, located on Disney property near Magic Kingdom with special ticket pricing.",
        amenities: [
          "Pools",
          "Golf Courses",
          "Fitness Center",
          "Tennis",
          "Spa",
          "Exchange Store",
        ],
        transportation: ["Bus"],
        roomTypes: [
          "Standard Room",
          "Family Suite",
          "1-Bedroom Suite",
          "2-Bedroom Suite",
        ],
        dining: [
          "Mangino's",
          "Evergreens Sports Bar & Grill",
          "Express Cafe",
          "Java Cafe",
        ],
        recreation: [
          "Millpond Pool",
          "Magnolia Pool",
          "Golf Courses",
          "Tennis Courts",
        ],
        images: ["url1", "url2", "url3"],
        rates: { min: 134, max: 307, currency: "USD" },
        historicalRates: [
          { year: 2023, min: 124, max: 287 },
          { year: 2024, min: 129, max: 297 },
          { year: 2025, min: 134, max: 307 },
        ],
        reviews: { avgRating: 4.5, reviewCount: 2000 },
        promotionalTags: [
          "Military Exclusive",
          "Golf Access",
          "Special Pricing",
        ],
        mapLocation: { lat: 28.4128, lng: -81.5796 },
        isDVC: false,
        dateOpened: "1994-02-01",
        status: "Open",
        roomCount: 586,
        eligibility: "Military personnel and families only",
        lastUpdated: "2025-06-09T18:00:00Z",
      },
    ],
  },
];

async function migrateAllRemainingResorts() {
  try {
    console.log("Starting complete migration of remaining resorts...");
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

          // Add a small delay to avoid overwhelming Firestore
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`✗ Failed to add resort ${resort.name}:`, error);
        }
      }
    }

    console.log(`\n✅ Migration completed! Added ${totalCount} resorts.`);
    console.log(
      "Total resorts in database should now be: 10 (existing) + " +
        totalCount +
        " (new) = " +
        (10 + totalCount)
    );
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Run the migration
migrateAllRemainingResorts()
  .then(() => {
    console.log("Complete migration script finished.");
    process.exit(0);
  })
  .catch(console.error);
