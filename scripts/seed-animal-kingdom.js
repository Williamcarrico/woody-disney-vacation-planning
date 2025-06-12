const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  Timestamp,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Animal Kingdom data
const animalKingdomData = {
  id: "ak",
  name: "Disney's Animal Kingdom",
  abbreviation: "DAK",
  description:
    "A zoological theme park celebrating the natural world with thrilling adventures, exotic animals, and immersive lands including Pandora - The World of Avatar",
  opened: "1998-04-22",
  theme: "Nature, Conservation, and Adventure",
  size: {
    acres: 580,
    hectares: 235,
  },
  location: {
    latitude: 28.358,
    longitude: -81.59,
    address: "2901 Osceola Parkway, Lake Buena Vista, FL 32830",
  },
  operatingHours: {
    typical: {
      monday: { open: "08:00", close: "20:00" },
      tuesday: { open: "08:00", close: "20:00" },
      wednesday: { open: "08:00", close: "20:00" },
      thursday: { open: "08:00", close: "20:00" },
      friday: { open: "08:00", close: "21:00" },
      saturday: { open: "08:00", close: "21:00" },
      sunday: { open: "08:00", close: "20:00" },
    },
    extendedEvening: true,
    earlyEntry: true,
    specialEvents: ["Disney After Hours", "Earth Day Celebrations"],
  },
  lands: [
    {
      id: "oasis",
      name: "The Oasis",
      description:
        "Lush garden pathways featuring exotic plants and animals leading to Discovery Island",
      theme: "Tropical Gardens",
      attractions: ["oasis-exhibits"],
      dining: ["rainforest-cafe"],
      shops: ["garden-gate-gifts"],
    },
    {
      id: "discovery-island",
      name: "Discovery Island",
      description: "The park's hub centered around the iconic Tree of Life",
      theme: "Nature's Wonders",
      attractions: ["tree-life-theater", "discovery-island-trails"],
      dining: [
        "flame-tree-bbq",
        "pizzafari",
        "tiffins",
        "nomad-lounge",
        "isle-java",
      ],
      shops: ["island-mercantile", "discovery-trading-company"],
    },
    {
      id: "pandora",
      name: "Pandora - The World of Avatar",
      description:
        "Journey to the alien moon from James Cameron's Avatar with floating mountains and bioluminescent forests",
      theme: "Alien World of Pandora",
      attractions: ["flight-passage", "navi-river"],
      dining: ["satuli-canteen", "pongu-pongu"],
      shops: ["windtraders", "colors-of-moara"],
    },
    {
      id: "africa",
      name: "Africa",
      description:
        "Authentic recreation of an East African village with live animals and cultural experiences",
      theme: "African Village and Savanna",
      attractions: [
        "kilimanjaro-safari",
        "gorilla-falls",
        "wildlife-express",
        "animation-experience",
      ],
      dining: ["tusker-house", "harambe-market", "dawa-bar", "tamu-tamu"],
      shops: ["mombasa-marketplace", "zuri-sweets"],
    },
    {
      id: "asia",
      name: "Asia",
      description:
        "Journey through the villages and jungles of Asia with thrilling attractions",
      theme: "Asian Villages and Mythology",
      attractions: [
        "expedition-everest",
        "kali-river",
        "maharajah-jungle",
        "feathered-friends",
      ],
      dining: ["yak-yeti", "yak-yeti-qs", "mr-kamal", "drinkwallah"],
      shops: ["bhaktapur-market", "mandala-gifts"],
    },
    {
      id: "dinoland-usa",
      name: "DinoLand U.S.A.",
      description:
        "Travel back to the age of dinosaurs (closing 2025 for Tropical Americas retheme)",
      theme: "Dinosaurs and Paleontology",
      attractions: ["dinosaur", "triceratop-spin", "boneyard", "fossil-fun"],
      dining: ["restaurantosaurus", "dino-diner"],
      shops: ["chester-hesters", "dino-treasures"],
    },
  ],
  transportation: {
    parkingLot: true,
    monorail: false,
    boat: false,
    bus: true,
    skyliner: false,
    walkable: false,
    resortAccess: {
      bus: ["All Disney resorts"],
    },
  },
  parkingInfo: {
    available: true,
    standard: {
      cost: "$30 per day",
      location: "Large parking lot with named sections",
    },
    preferred: {
      cost: "$50-55 per day",
      location: "Closer to entrance - worth it due to lot size",
    },
    trams: true,
    tips: [
      "Very large parking lot - remember your section",
      "Trams essential due to distance",
      "Arrive early for closer parking",
      "Consider preferred parking to save walking",
    ],
  },
};

async function seedAnimalKingdom() {
  console.log("🌟 Starting Animal Kingdom data seeding...\n");

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Create the document with timestamp
    const now = Timestamp.now();
    const parkDoc = {
      ...animalKingdomData,
      createdAt: now,
      updatedAt: now,
    };

    // Add to Firestore
    const parkRef = doc(db, "parks", animalKingdomData.id);
    await setDoc(parkRef, parkDoc);

    console.log("✅ Successfully seeded Animal Kingdom data to Firebase!");
    console.log(
      `🏰 ${animalKingdomData.name} (${animalKingdomData.abbreviation})`
    );
    console.log(`📍 Location: ${animalKingdomData.location.address}`);
    console.log(`🏞️ Lands: ${animalKingdomData.lands.length}`);
    console.log(
      "🎉 Animal Kingdom is now available in your Disney vacation planning app!"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Animal Kingdom data:", error);
    process.exit(1);
  }
}

// Run the seeding function
seedAnimalKingdom();
