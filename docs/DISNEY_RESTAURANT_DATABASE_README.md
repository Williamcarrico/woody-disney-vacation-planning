# Disney World Restaurant Database System

A comprehensive, type-safe system for managing Disney World restaurant data with Firebase integration, real-time updates, and advanced filtering capabilities.

## 🏰 Overview

This system provides everything needed to manage a complete Disney World dining database with 220+ restaurants across all parks, resorts, and Disney Springs. It includes data import tools, Firebase integration, real-time synchronization, and a complete React UI for browsing and managing restaurant data.

### Features

- **📊 Comprehensive Database**: Support for 220+ Disney World restaurants
- **🔥 Firebase Integration**: Full CRUD operations with Firestore
- **⚡ Real-time Updates**: Live synchronization across clients
- **🔍 Advanced Filtering**: Complex search and filter capabilities
- **📱 Modern UI**: React components with shadcn/ui
- **🚀 Performance Optimized**: Caching, batch operations, and pagination
- **🛡️ Type Safe**: Full TypeScript support with comprehensive types
- **📥 Data Import**: JSON import with validation and transformation
- **🎯 Character Dining**: Special support for character dining experiences
- **⭐ Signature Dining**: Fine dining and signature restaurant categorization

## 📁 File Structure

```
src/
├── types/
│   └── dining.ts                    # Complete type definitions
├── lib/
│   ├── firebase/
│   │   └── restaurant-service.ts    # Firebase service layer
│   └── data/
│       ├── comprehensive-restaurants.ts  # Sample restaurant data
│       └── restaurant-importer.ts   # JSON import utilities
├── scripts/
│   └── import-restaurants.ts       # Bulk import functionality
├── components/
│   └── dining/
│       └── restaurant-manager.tsx  # Complete UI component
└── examples/
    └── restaurant-database-usage.ts # Usage examples
```

## 🚀 Quick Start

### 1. Import Your Restaurant Data

```typescript
import { importRestaurantsFromFile } from '@/scripts/import-restaurants'

// Import from JSON file
const result = await importRestaurantsFromFile('./disney-restaurants.json', {
    batchSize: 25,
    validateData: true,
    skipExisting: true,
    logProgress: true
})

console.log(`Imported ${result.totalImported} restaurants`)
```

### 2. Use the Firebase Service

```typescript
import { RestaurantService } from '@/lib/firebase/restaurant-service'

const restaurantService = RestaurantService.getInstance()

// Get all restaurants
const { restaurants } = await restaurantService.getRestaurants()

// Get character dining restaurants
const characterRestaurants = await restaurantService.getCharacterDiningRestaurants()

// Search restaurants
const searchResults = await restaurantService.searchRestaurants('castle')
```

### 3. Use the React Component

```tsx
import { RestaurantManager } from '@/components/dining/restaurant-manager'

function DiningPage() {
    return (
        <RestaurantManager
            onRestaurantSelect={(restaurant) => {
                console.log('Selected:', restaurant.name)
            }}
            allowManagement={true}
        />
    )
}
```

## 📋 Data Structure

### Restaurant Data Format

Each restaurant includes comprehensive information:

```typescript
interface DisneyRestaurant {
    id: string
    name: string
    description: string
    location: Location
    cuisineTypes: CuisineType[]
    serviceType: ServiceType
    priceRange: PriceRange
    diningExperience: DiningExperience
    mealPeriods: MealPeriod[]
    pricing?: PricingInfo
    operatingHours: OperatingHours
    reservationInfo: ReservationInfo
    diningPlanInfo: DiningPlanInfo
    characterDining?: CharacterDiningInfo
    specialFeatures: SpecialFeature[]
    mobileOrdering: boolean
    // ... and many more fields
}
```

### Supported Locations

- **Parks**: Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom
- **Resorts**: Grand Floridian, Polynesian, Contemporary, Beach Club, etc.
- **Entertainment**: Disney Springs, BoardWalk

### Cuisine Types (40+)

Including American, Italian, French, Asian, African-inspired, Modern American, Polynesian, and many more specialized categories.

## 🔥 Firebase Integration

### Service Features

- **CRUD Operations**: Complete create, read, update, delete functionality
- **Real-time Subscriptions**: Live updates across all clients
- **Advanced Filtering**: Complex queries with multiple criteria
- **Caching**: 5-minute cache for improved performance
- **Batch Operations**: Efficient bulk data management
- **Pagination**: Handle large datasets efficiently
- **Offline Support**: Works when disconnected

### Example Usage

```typescript
// Subscribe to restaurant updates
const unsubscribe = restaurantService.subscribeToRestaurant(
    'be-our-guest-restaurant',
    (restaurant) => {
        console.log('Restaurant updated:', restaurant?.name)
    }
)

// Advanced filtering
const { restaurants } = await restaurantService.getRestaurants({
    parkIds: [DisneyLocation.MAGIC_KINGDOM],
    serviceTypes: [ServiceType.TABLE_SERVICE],
    hasCharacterDining: true,
    rating: 4.0,
    searchQuery: 'princess'
})
```

## 📥 Data Import System

### Import from JSON File

```typescript
import { importRestaurantsFromFile } from '@/scripts/import-restaurants'

const result = await importRestaurantsFromFile('./restaurants.json', {
    batchSize: 50,        // Process in batches of 50
    validateData: true,   // Validate before importing
    skipExisting: true,   // Skip restaurants that already exist
    dryRun: false,       // Set to true to preview without importing
    logProgress: true    // Show progress logs
})
```

### Import from Data Object

```typescript
import { importRestaurantsFromData } from '@/scripts/import-restaurants'

const restaurantData = {
    metadata: { /* ... */ },
    locations: {
        magic_kingdom: {
            restaurants: [/* restaurant objects */]
        }
    }
}

const result = await importRestaurantsFromData(restaurantData)
```

### Supported JSON Formats

1. **Full Database Structure** (with metadata and locations)
2. **Simple Array** of restaurant objects
3. **Object with restaurants array**

The importer automatically detects the format and converts appropriately.

## 🎨 UI Components

### RestaurantManager Component

Complete restaurant browsing and management interface:

```tsx
<RestaurantManager
    onRestaurantSelect={(restaurant) => {
        // Handle restaurant selection
    }}
    allowManagement={true}  // Enable import/export features
    compact={false}        // Use full layout
/>
```

### Features

- **Search**: Full-text search across names, descriptions, locations
- **Filtering**: Location, service type, price range, special features
- **Statistics**: Real-time database statistics
- **Import**: Drag-and-drop JSON file import
- **Responsive**: Works on all screen sizes

## 🔧 Advanced Features

### Real-time Subscriptions

```typescript
// Subscribe to specific restaurant
const unsubscribe1 = restaurantService.subscribeToRestaurant(
    'restaurant-id',
    (restaurant) => console.log('Updated:', restaurant?.name)
)

// Subscribe to filtered restaurant list
const unsubscribe2 = restaurantService.subscribeToRestaurants(
    { hasCharacterDining: true },
    (restaurants) => console.log(`Found ${restaurants.length} character restaurants`)
)

// Remember to unsubscribe
unsubscribe1()
unsubscribe2()
```

### Batch Operations

```typescript
// Import multiple restaurants efficiently
await restaurantService.batchSaveRestaurants(restaurants)

// Get statistics
const stats = await restaurantService.getRestaurantStats()
console.log(`Total: ${stats.total}, Character: ${stats.characterDining}`)
```

### Performance Optimization

- **Caching**: Automatic 5-minute cache for frequently accessed data
- **Pagination**: Efficient handling of large datasets
- **Batch Processing**: Import/update multiple records efficiently
- **Client-side Filtering**: Reduces database queries

## 📊 Database Statistics

Get comprehensive statistics about your restaurant database:

```typescript
const stats = await restaurantService.getRestaurantStats()

console.log({
    total: stats.total,
    characterDining: stats.characterDining,
    signatureDining: stats.signatureDining,
    averageRating: stats.averageRating,
    byLocation: stats.byLocation,
    byServiceType: stats.byServiceType,
    byPriceRange: stats.byPriceRange
})
```

## 🛡️ Type Safety

Comprehensive TypeScript types ensure data integrity:

```typescript
// All enums are fully typed
const location: DisneyLocation = DisneyLocation.MAGIC_KINGDOM
const serviceType: ServiceType = ServiceType.TABLE_SERVICE
const priceRange: PriceRange = PriceRange.EXPENSIVE

// Complex filtering with type safety
const filters: DiningFilters = {
    parkIds: [DisneyLocation.EPCOT],
    serviceTypes: [ServiceType.SIGNATURE_DINING],
    priceRanges: [PriceRange.LUXURY],
    hasCharacterDining: true
}
```

## 🔍 Search and Filtering

### Basic Search

```typescript
const results = await restaurantService.searchRestaurants('beast castle')
```

### Advanced Filtering

```typescript
const { restaurants } = await restaurantService.getRestaurants({
    parkIds: [DisneyLocation.MAGIC_KINGDOM, DisneyLocation.EPCOT],
    cuisineTypes: [CuisineType.FRENCH, CuisineType.AMERICAN],
    serviceTypes: [ServiceType.TABLE_SERVICE],
    priceRanges: [PriceRange.EXPENSIVE, PriceRange.LUXURY],
    specialFeatures: [SpecialFeature.FIREWORKS_VIEW],
    hasCharacterDining: true,
    acceptsReservations: true,
    rating: 4.0,
    searchQuery: 'princess dining'
})
```

## 📖 Complete Examples

Check out `src/examples/restaurant-database-usage.ts` for comprehensive examples including:

1. **Data Import**: From JSON files and objects
2. **Basic Operations**: CRUD operations and queries
3. **Advanced Filtering**: Complex search scenarios
4. **Real-time Updates**: Subscription management
5. **Statistics**: Database analytics
6. **Data Conversion**: JSON to TypeScript transformation
7. **Performance**: Batch operations and caching
8. **Complete Workflow**: End-to-end usage

## 🚨 Error Handling

The system includes comprehensive error handling:

```typescript
try {
    const result = await importRestaurantsFromFile('./data.json')
    if (!result.success) {
        console.log('Import errors:')
        result.errors.forEach(error => {
            console.log(`${error.restaurant}: ${error.error}`)
        })
    }
} catch (error) {
    console.error('Import failed:', error)
}
```

## 🔧 Configuration

### Firebase Setup

Ensure your Firebase configuration includes:

```typescript
// firebase.config.ts
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    // Your Firebase config
}

const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)
```

### Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restaurants/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.token.admin == true;
    }
  }
}
```

## 🎯 Character Dining

Special support for Disney character dining experiences:

```typescript
// Get all character dining restaurants
const characterRestaurants = await restaurantService.getCharacterDiningRestaurants()

// Filter by specific characters
const { restaurants } = await restaurantService.getRestaurants({
    hasCharacterDining: true,
    searchQuery: 'princesses'
})
```

Character dining includes:
- **Characters Present**: List of Disney characters
- **Meal Times**: When characters appear
- **Photo Packages**: Whether photos are included
- **Rotation Info**: How characters visit tables

## ⭐ Signature Dining

Identify and filter fine dining experiences:

```typescript
// Get signature dining restaurants
const signatureRestaurants = await restaurantService.getSignatureDiningRestaurants()

// Filter by dining plan credits
const { restaurants } = await restaurantService.getRestaurants({
    serviceTypes: [ServiceType.SIGNATURE_DINING, ServiceType.FINE_DINING]
})
```

## 🔄 Data Validation

All imported data is validated:

```typescript
import { restaurantImporter } from '@/lib/data/restaurant-importer'

const validation = restaurantImporter.validateRestaurant(restaurant)
if (!validation.isValid) {
    console.log('Validation errors:', validation.errors)
}
```

## 📱 Mobile Support

The UI components are fully responsive and work great on mobile devices with touch-friendly interfaces and optimized layouts.

## 🌟 Best Practices

1. **Use TypeScript**: Leverage full type safety
2. **Batch Operations**: Use batch functions for bulk data
3. **Cache Management**: Let the service handle caching automatically
4. **Real-time Updates**: Subscribe only to data you actively display
5. **Error Handling**: Always handle potential errors
6. **Data Validation**: Validate imported data before saving
7. **Performance**: Use pagination for large datasets

## 🤝 Contributing

When adding new features:

1. Update TypeScript types in `src/types/dining.ts`
2. Extend the Firebase service in `src/lib/firebase/restaurant-service.ts`
3. Update the UI components as needed
4. Add examples to the usage file
5. Update this documentation

## 📄 License

This project is part of the Disney vacation planning application and follows the same licensing terms.

---

**Ready to manage your Disney dining data? Start with the examples in `src/examples/restaurant-database-usage.ts`!** 🏰✨