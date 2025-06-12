#!/usr/bin/env node

/**
 * Disney Restaurant Database Setup Script
 *
 * This script helps set up the Disney restaurant database system
 * by creating sample data and configuring Firebase connections.
 */

const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log("\n" + "=".repeat(50), "cyan");
  log(message, "bright");
  log("=".repeat(50), "cyan");
}

function success(message) {
  log(`✅ ${message}`, "green");
}

function error(message) {
  log(`❌ ${message}`, "red");
}

function warning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function info(message) {
  log(`ℹ️  ${message}`, "blue");
}

// Sample restaurant data for testing
const sampleRestaurantData = {
  metadata: {
    total_locations: 1,
    last_updated: new Date().toISOString().split("T")[0],
    data_sources: ["Disney Official Website", "Setup Script"],
    note: "Sample data created by setup script for testing the Disney restaurant database system",
  },
  locations: {
    "magic-kingdom": {
      name: "Magic Kingdom",
      restaurants: [
        {
          id: "sample-be-our-guest",
          name: "Be Our Guest Restaurant (Sample)",
          description:
            "Experience the magic of Beauty and the Beast in this enchanted castle restaurant. This is sample data created during setup.",
          short_description: "French-inspired dining in Beast's Castle",
          location: {
            latitude: 28.4211,
            longitude: -81.5812,
            areaName: "Fantasyland",
          },
          cuisine_types: ["French", "American"],
          service_type: "Table Service",
          price_range: "$$$",
          dining_experience: "Themed Dining",
          operating_hours: {
            Monday: "11:30 AM - 9:00 PM",
            Tuesday: "11:30 AM - 9:00 PM",
            Wednesday: "11:30 AM - 9:00 PM",
            Thursday: "11:30 AM - 9:00 PM",
            Friday: "11:30 AM - 9:00 PM",
            Saturday: "11:30 AM - 9:00 PM",
            Sunday: "11:30 AM - 9:00 PM",
          },
          phone_number: "(407) 939-3463",
          reservation_info: {
            accepts_reservations: true,
            requires_reservations: true,
            advance_reservation_days: 60,
            reservation_url:
              "https://disneyworld.disney.go.com/dining/magic-kingdom/be-our-guest-restaurant/",
            walk_ups_accepted: false,
            reservation_tips: [
              "Very popular - book as early as possible",
              "This is sample data for testing",
            ],
          },
          dining_plan_info: {
            accepts_dining_plan: true,
            table_service_credits: 1,
            eligible_plans: ["Disney Dining Plan", "Deluxe Dining Plan"],
          },
          special_features: ["Themed Dining", "Kids Menu", "Allergy Friendly"],
          character_dining: {
            has_character_dining: false,
          },
          average_rating: 4.3,
          review_count: 1000,
          tags: ["Beauty and the Beast", "Themed", "Sample Data"],
          is_popular: true,
          is_new: false,
        },
      ],
    },
  },
};

function createSampleDataFile() {
  const sampleDataPath = path.join(
    process.cwd(),
    "sample_restaurant_data.json"
  );

  try {
    fs.writeFileSync(
      sampleDataPath,
      JSON.stringify(sampleRestaurantData, null, 2)
    );
    success(`Created sample restaurant data file: ${sampleDataPath}`);
    return sampleDataPath;
  } catch (err) {
    error(`Failed to create sample data file: ${err.message}`);
    return null;
  }
}

function checkFirebaseConfig() {
  const firebaseConfigPath = path.join(process.cwd(), "firebase.json");

  if (fs.existsSync(firebaseConfigPath)) {
    success("Firebase configuration found");
    return true;
  } else {
    warning("Firebase configuration not found");
    info('Run "firebase init" to set up Firebase for your project');
    return false;
  }
}

function checkEnvironmentFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (fs.existsSync(envPath)) {
    success("Environment file found");

    const envContent = fs.readFileSync(envPath, "utf8");
    const hasFirebaseVars =
      envContent.includes("FIREBASE_") ||
      envContent.includes("NEXT_PUBLIC_FIREBASE_");

    if (hasFirebaseVars) {
      success("Firebase environment variables detected");
    } else {
      warning("Firebase environment variables not found in .env.local");
      info("Add your Firebase configuration to .env.local");
    }

    return hasFirebaseVars;
  } else {
    warning("Environment file (.env.local) not found");
    info("Create .env.local with your Firebase configuration");
    return false;
  }
}

function displayNextSteps() {
  header("🚀 Next Steps to Complete Setup");

  log("\n1. 📋 Import Restaurant Data:", "bright");
  info("   • Navigate to /dashboard/dining/import in your app");
  info("   • Upload the sample_restaurant_data.json file created above");
  info("   • Or upload your own Disney restaurant JSON data");

  log("\n2. 🔧 Configure Firebase:", "bright");
  info("   • Ensure Firebase is initialized: firebase init");
  info("   • Deploy Firestore rules: firebase deploy --only firestore:rules");
  info("   • Set up authentication if not already done");

  log("\n3. 🔑 Environment Variables:", "bright");
  info("   • Add Firebase config to .env.local:");
  log("     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key", "magenta");
  log("     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain", "magenta");
  log("     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id", "magenta");
  log("     # ... other Firebase config variables", "magenta");

  log("\n4. 🎨 Customize UI:", "bright");
  info("   • Update restaurant card components in src/components/dining/");
  info("   • Customize filtering options to match your needs");
  info("   • Add your Disney theme styling");

  log("\n5. 🔍 Test the System:", "bright");
  info("   • Visit /dashboard/dining to see the restaurant grid");
  info("   • Test filtering and search functionality");
  info("   • Verify Firebase data is loading correctly");

  log("\n6. 📊 Extend Features:", "bright");
  info("   • Add user favorites functionality");
  info("   • Implement restaurant reviews");
  info("   • Create reservation integration");
  info("   • Add real-time wait time updates");

  log("\n📚 Documentation:", "bright");
  info("   • See DISNEY_RESTAURANT_DATABASE_README.md for detailed docs");
  info(
    "   • Check src/examples/restaurant-database-usage.ts for code examples"
  );
  info("   • View Firebase rules in firestore.rules");
}

function main() {
  header("🏰 Disney Restaurant Database Setup");

  log(
    "This script will help you set up the Disney restaurant database system.",
    "cyan"
  );

  // Create sample data
  const sampleDataPath = createSampleDataFile();

  // Check Firebase setup
  const hasFirebaseConfig = checkFirebaseConfig();
  const hasEnvironmentVars = checkEnvironmentFile();

  // Display status
  log("\n📊 Setup Status:", "bright");
  success(`Sample data created: ${sampleDataPath ? "Yes" : "No"}`);
  log(
    `Firebase config: ${hasFirebaseConfig ? "✅" : "❌"}`,
    hasFirebaseConfig ? "green" : "red"
  );
  log(
    `Environment vars: ${hasEnvironmentVars ? "✅" : "❌"}`,
    hasEnvironmentVars ? "green" : "red"
  );

  // Show next steps
  displayNextSteps();

  log("\n🎉 Setup script completed!", "green");
  log(
    "Follow the next steps above to complete your restaurant database integration.",
    "cyan"
  );
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createSampleDataFile,
  checkFirebaseConfig,
  checkEnvironmentFile,
  sampleRestaurantData,
};
