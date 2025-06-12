const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "woody-vacation-planning-tool",
});

const db = admin.firestore();

async function setupInitialData() {
  console.log("Setting up initial Firestore data...");

  // Sample attractions data
  const attractions = [
    {
      id: "space-mountain",
      name: "Space Mountain",
      park: "Magic Kingdom",
      land: "Tomorrowland",
      type: "attraction",
      category: "thrill",
      height_requirement: 44,
      fastpass_available: true,
      single_rider: false,
      description: "An indoor roller coaster in complete darkness",
      wait_time_average: 45,
    },
    {
      id: "haunted-mansion",
      name: "Haunted Mansion",
      park: "Magic Kingdom",
      land: "Liberty Square",
      type: "attraction",
      category: "dark_ride",
      height_requirement: null,
      fastpass_available: true,
      single_rider: false,
      description: "A spooky boat ride through a haunted house",
      wait_time_average: 35,
    },
    {
      id: "pirates-caribbean",
      name: "Pirates of the Caribbean",
      park: "Magic Kingdom",
      land: "Adventureland",
      type: "attraction",
      category: "dark_ride",
      height_requirement: null,
      fastpass_available: true,
      single_rider: false,
      description: "A boat ride through pirate-infested waters",
      wait_time_average: 25,
    },
    {
      id: "frozen-ever-after",
      name: "Frozen Ever After",
      park: "EPCOT",
      land: "World Showcase - Norway",
      type: "attraction",
      category: "dark_ride",
      height_requirement: null,
      fastpass_available: true,
      single_rider: false,
      description: "A boat ride through the kingdom of Arendelle",
      wait_time_average: 60,
    },
    {
      id: "flight-of-passage",
      name: "Avatar Flight of Passage",
      park: "Animal Kingdom",
      land: "Pandora",
      type: "attraction",
      category: "simulator",
      height_requirement: 44,
      fastpass_available: true,
      single_rider: false,
      description: "Fly on the back of a banshee over Pandora",
      wait_time_average: 90,
    },
  ];

  // Add attractions to Firestore
  for (const attraction of attractions) {
    await db.collection("attractions").doc(attraction.id).set(attraction);
    console.log(`Added attraction: ${attraction.name}`);
  }

  // Sample user data
  const sampleUser = {
    uid: "user123",
    displayName: "Disney Explorer",
    email: "explorer@example.com",
    photoURL: null,
    currentVacationId: "vacation123",
    currentVacation: {
      id: "vacation123",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      partySize: 4,
      resortName: "Disney's Grand Floridian Resort",
      ticketType: "Park Hopper Plus",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("users").doc("user123").set(sampleUser);
  console.log("Added sample user");

  // Sample user preferences
  const userPreferences = {
    userId: "user123",
    favoriteParks: ["Magic Kingdom", "EPCOT"],
    dietaryRestrictions: [],
    accessibilityNeeds: [],
    waitTimeNotifications: true,
    reservationNotifications: true,
    weatherNotifications: true,
    socialNotifications: true,
    budget: 1000,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("userPreferences").doc("user123").set(userPreferences);
  console.log("Added user preferences");

  // Sample park visits
  const parkVisits = [
    {
      userId: "user123",
      parkName: "Magic Kingdom",
      visitDate: admin.firestore.Timestamp.fromDate(new Date("2024-01-15")),
      duration: 8,
      satisfaction: 9,
      notes: "Amazing day at Magic Kingdom!",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      userId: "user123",
      parkName: "EPCOT",
      visitDate: admin.firestore.Timestamp.fromDate(new Date("2024-01-16")),
      duration: 7,
      satisfaction: 8,
      notes: "Great food and culture experience",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const visit of parkVisits) {
    await db.collection("parkVisits").add(visit);
  }
  console.log("Added park visits");

  // Sample attraction visits
  const attractionVisits = [
    {
      userId: "user123",
      attractionId: "space-mountain",
      attractionName: "Space Mountain",
      parkName: "Magic Kingdom",
      visitDate: admin.firestore.Timestamp.fromDate(new Date("2024-01-15")),
      waitTime: 45,
      rating: 5,
      status: "COMPLETED",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      userId: "user123",
      attractionId: "haunted-mansion",
      attractionName: "Haunted Mansion",
      parkName: "Magic Kingdom",
      visitDate: admin.firestore.Timestamp.fromDate(new Date("2024-01-15")),
      waitTime: 30,
      rating: 4,
      status: "COMPLETED",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const visit of attractionVisits) {
    await db.collection("attractionVisits").add(visit);
  }
  console.log("Added attraction visits");

  // Sample reservations
  const reservations = [
    {
      userId: "user123",
      reservationType: "DINING",
      restaurantName: "Be Our Guest Restaurant",
      reservationTime: admin.firestore.Timestamp.fromDate(
        new Date("2024-01-16T12:30:00")
      ),
      partySize: 4,
      status: "CONFIRMED",
      confirmationNumber: "BOG-123456",
      notes: "Birthday celebration for Emma",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      userId: "user123",
      reservationType: "DINING",
      restaurantName: "Chef Mickey's",
      reservationTime: admin.firestore.Timestamp.fromDate(
        new Date("2024-01-17T08:30:00")
      ),
      partySize: 4,
      status: "CONFIRMED",
      confirmationNumber: "CM-789123",
      notes: "Character breakfast",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const reservation of reservations) {
    await db.collection("reservations").add(reservation);
  }
  console.log("Added reservations");

  // Sample achievements
  const achievements = [
    {
      userId: "user123",
      achievementId: "first-visit",
      name: "First Visit",
      title: "First Visit",
      description:
        "Welcome to the magic! You've completed your first Disney park visit.",
      category: "exploration",
      progress: 1,
      maxProgress: 1,
      rarity: "common",
      points: 10,
      requirements: ["Complete first park visit"],
      unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      userId: "user123",
      achievementId: "attraction-enthusiast",
      name: "Attraction Enthusiast",
      title: "Attraction Enthusiast",
      description: "Experience 10 different attractions across all parks.",
      category: "attractions",
      progress: 6,
      maxProgress: 10,
      rarity: "rare",
      points: 25,
      requirements: ["Visit 10 different attractions"],
      unlockedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const achievement of achievements) {
    await db
      .collection("userAchievements")
      .doc(`${achievement.userId}_${achievement.achievementId}`)
      .set(achievement);
  }
  console.log("Added achievements");

  // Sample party members
  const partyMembers = [
    {
      vacationId: "vacation123",
      linkedUserId: null,
      name: "Sarah",
      relationship: "Partner",
      age: 28,
      email: null,
      preferences: {
        favoriteCharacters: ["Mickey Mouse", "Elsa"],
        ridePreferences: ["family-friendly", "mild-thrills"],
        dietaryRestrictions: [],
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "user123",
    },
    {
      vacationId: "vacation123",
      linkedUserId: null,
      name: "Emma",
      relationship: "Child",
      age: 8,
      email: null,
      preferences: {
        favoriteCharacters: ["Princess Aurora", "Moana"],
        ridePreferences: ["family-friendly"],
        dietaryRestrictions: ["vegetarian"],
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: "user123",
    },
  ];

  for (const member of partyMembers) {
    await db.collection("vacationPartyMembers").add(member);
  }
  console.log("Added party members");

  // Sample user events
  const userEvents = [
    {
      userId: "user123",
      title: "Character Breakfast at Chef Mickey's",
      type: "reservation",
      eventTime: admin.firestore.Timestamp.fromDate(
        new Date("2024-01-17T08:30:00")
      ),
      location: {
        name: "Contemporary Resort",
      },
      locationName: "Contemporary Resort",
      partySize: 4,
      status: "confirmed",
      confirmationNumber: "CM-789123",
      notes: "Birthday celebration - Emma turns 8!",
      reminders: true,
      metadata: {
        eventType: "dining",
        cost: 185.0,
        prePaid: true,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    {
      userId: "user123",
      title: "Space Mountain Lightning Lane",
      type: "fastpass",
      eventTime: admin.firestore.Timestamp.fromDate(
        new Date("2024-01-16T14:15:00")
      ),
      location: {
        name: "Magic Kingdom",
      },
      locationName: "Magic Kingdom",
      partySize: 4,
      status: "confirmed",
      confirmationNumber: "LL-456789",
      notes: null,
      reminders: true,
      metadata: {
        eventType: "attraction",
        cost: 0,
        attractionId: "space-mountain",
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
  ];

  for (const event of userEvents) {
    await db.collection("userEvents").add(event);
  }
  console.log("Added user events");

  console.log("Initial Firestore setup complete!");
}

setupInitialData().catch(console.error);
