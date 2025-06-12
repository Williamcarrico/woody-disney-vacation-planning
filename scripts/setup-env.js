#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🏰 Disney Vacation Planning App - Environment Setup");
console.log("================================================\n");

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local");
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log("📝 Creating .env.local file...");

  const envContent = `# Database Configuration
DATABASE_URL="postgres://postgres:postgres@localhost:5432/disney_vacation"

# Weather API Configuration (Tomorrow.io)
TOMORROW_IO_API_KEY="BUg7tFzAmctASd4DLGxkwDTSmuwWGHNS"

# Firebase Configuration (optional - for production features)
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""

# Google Maps API Key (optional - for enhanced map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""

# Development Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env.local file created successfully!");
  } catch (error) {
    console.error("❌ Failed to create .env.local file:", error.message);
  }
} else {
  console.log("✅ .env.local file already exists");
}

console.log("\n🔧 System Status Check:");
console.log("======================");

// Check Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check if PostgreSQL is needed
console.log("\n📊 Database Setup:");
console.log("==================");
console.log("The app can run without a database connection.");
console.log("Location updates and some features will use fallback mode.");
console.log("");
console.log("To set up PostgreSQL (optional):");
console.log("1. Install PostgreSQL on your system");
console.log('2. Create a database named "disney_vacation"');
console.log("3. Update the DATABASE_URL in .env.local if needed");

console.log("\n🌤️  Weather API:");
console.log("================");
console.log("The app includes a fallback weather API key.");
console.log("For production, get your own key from tomorrow.io");

console.log("\n🗺️  Maps Integration:");
console.log("====================");
console.log("Google Maps features are optional.");
console.log("The app will work with basic mapping without an API key.");

console.log("\n🚀 Next Steps:");
console.log("==============");
console.log("1. Run: npm install");
console.log("2. Run: npm run dev");
console.log("3. Open: http://localhost:3000");
console.log("");
console.log("The app will now handle missing services gracefully!");
console.log("✨ Happy Disney planning! ✨");
