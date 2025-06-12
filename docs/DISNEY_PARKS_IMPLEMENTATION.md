# Disney Parks Static Data Implementation

This documentation covers the comprehensive Disney parks static data implementation using Firebase Firestore with API routes and React hooks.

## Overview

The implementation provides detailed static data for three Disney World parks:
- **Magic Kingdom (MK)** - 6 lands, comprehensive attractions, dining, and entertainment
- **EPCOT (EP)** - 4 areas, advanced attractions, world-class dining, and festivals
- **Hollywood Studios (HS)** - 7 lands, movie magic attractions, themed dining, and shows

## Architecture

### Data Structure
```
src/
├── types/parks.ts              # TypeScript interfaces for park data
├── lib/
│   ├── data/
│   │   └── detailed-parks.ts   # Static park data definitions
│   └── firebase/
│       ├── collections.ts      # Firebase collections and types
│       └── parks-service.ts    # Firebase service layer
├── hooks/use-parks.ts          # React hooks for consuming data
├── app/api/                    # API routes
│   ├── parks/                  # Park-related endpoints
│   ├── attractions/            # Attraction search endpoints
│   └── dining/                 # Dining search endpoints
└── scripts/
    └── seed-parks-data.ts      # Database seeding script
```

## Features

### Comprehensive Park Data
Each park includes:
- **Basic Information**: Name, description, location, size, operating hours
- **Lands/Areas**: Themed sections with attractions, dining, and shops
- **Attractions**: Full details including height requirements, Lightning Lane, accessibility
- **Dining**: Table service, quick service, and snacks with menus and reservations
- **Entertainment**: Shows, fireworks, parades with schedules and tips
- **Facilities & Services**: Baby care, accessibility services, guest relations
- **Transportation**: Parking, monorail, bus, boat, Skyliner connections
- **Tips & Strategies**: Planning advice, best times, touring recommendations

### Attraction Details
- Height requirements (inches/centimeters)
- Thrill levels (1-5 scale)
- Age appeal (toddler to seniors)
- Lightning Lane availability (MultiPass/SinglePass)
- Accessibility features
- PhotoPass availability
- Rider Swap and Single Rider options
- Virtual Queue requirements
- Closure information with dates and reasons

### Dining Information
- Cuisine types and price ranges
- Reservation requirements
- Disney Dining Plan acceptance
- Mobile Order availability
- Character dining experiences
- Menu highlights and dietary options
- Accessibility features
- Expert tips and recommendations

## Getting Started

### 1. Firebase Setup
The parks data uses Firebase Firestore. Ensure your Firebase configuration is set up in `src/lib/firebase/firebase.config.ts`.

### 2. Seed the Database
Run the seeding script to populate Firebase with park data:

```bash
# Initial seeding
npx tsx src/scripts/seed-parks-data.ts

# Force overwrite existing data
npx tsx src/scripts/seed-parks-data.ts --force

# Show help
npx tsx src/scripts/seed-parks-data.ts --help
```

### 3. API Endpoints

#### Get All Parks
```
GET /api/parks
Query Parameters:
- searchTerm: Filter by name/description
- hasAttraction: Filter by specific attraction ID
- hasLand: Filter by specific land ID
- operatingStatus: Filter by status (open/closed/seasonal)
```

#### Get Specific Park
```
GET /api/parks/[parkId]
Parameters:
- parkId: 'mk', 'epcot', or 'hs'
```

#### Get Park Statistics
```
GET /api/parks/[parkId]/stats
Returns: attraction count, dining count, lands, Lightning Lane info
```

#### Search Attractions
```
GET /api/attractions
Query Parameters:
- parkId: Filter by park
- landId: Filter by land
- type: ride/show/experience/character-meet/walkthrough
- thrillLevel: Minimum thrill level (1-5)
- heightRequirement: true for attractions with height requirements
- lightningLane: true for Lightning Lane attractions
- mustDo: true for must-do attractions
- ageGroup: toddler/preschool/kids/tweens/teens/adults/seniors
```

#### Search Dining
```
GET /api/dining
Query Parameters:
- parkId: Filter by park
- landId: Filter by land
- type: tableService/quickService/snacks
- cuisine: Filter by cuisine type
- priceRange: $/$$/$$$/$$$$
- characterDining: true for character dining
- mobileOrder: true for mobile order locations
- mealPeriod: breakfast/lunch/dinner/allday
```

## React Hooks Usage

### useParks - Get All Parks
```typescript
import { useParks } from '@/hooks/use-parks'

function ParksComponent() {
  const { parks, loading, error, refetch } = useParks({
    searchTerm: 'magic'
  })

  if (loading) return <div>Loading parks...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {parks.map(park => (
        <div key={park.id}>
          <h2>{park.name}</h2>
          <p>{park.description}</p>
        </div>
      ))}
    </div>
  )
}
```

### usePark - Get Specific Park
```typescript
import { usePark } from '@/hooks/use-parks'

function ParkDetailsComponent({ parkId }: { parkId: string }) {
  const { park, loading, error } = usePark(parkId)

  if (loading) return <div>Loading park...</div>
  if (error) return <div>Error: {error}</div>
  if (!park) return <div>Park not found</div>

  return (
    <div>
      <h1>{park.name}</h1>
      <p>{park.description}</p>
      <p>Size: {park.size.acres} acres</p>
      <p>Lands: {park.lands.length}</p>
      <p>Attractions: {park.attractions.length}</p>
    </div>
  )
}
```

### useAttractions - Search Attractions
```typescript
import { useAttractions } from '@/hooks/use-parks'

function AttractionsComponent() {
  const { attractions, loading, error } = useAttractions({
    mustDo: true,
    thrillLevel: 3
  })

  return (
    <div>
      {attractions.map(attraction => (
        <div key={attraction.id}>
          <h3>{attraction.name}</h3>
          <p>Park: {attraction.parkName}</p>
          <p>Thrill Level: {attraction.thrillLevel}/5</p>
          {attraction.heightRequirement.inches && (
            <p>Height: {attraction.heightRequirement.inches}"</p>
          )}
        </div>
      ))}
    </div>
  )
}
```

### useDining - Search Dining
```typescript
import { useDining } from '@/hooks/use-parks'

function DiningComponent() {
  const { dining, loading, error } = useDining({
    type: 'tableService',
    characterDining: true
  })

  return (
    <div>
      {dining.map(restaurant => (
        <div key={restaurant.id}>
          <h3>{restaurant.name}</h3>
          <p>Park: {restaurant.parkName}</p>
          <p>Price: {restaurant.priceRange}</p>
          <p>Cuisine: {restaurant.cuisine?.join(', ')}</p>
        </div>
      ))}
    </div>
  )
}
```

### useParkStats - Get Park Statistics
```typescript
import { useParkStats } from '@/hooks/use-parks'

function ParkStatsComponent({ parkId }: { parkId: string }) {
  const { stats, loading, error } = useParkStats(parkId)

  if (loading) return <div>Loading stats...</div>

  return (
    <div>
      <h2>Park Statistics</h2>
      <p>Total Attractions: {stats?.totalAttractions}</p>
      <p>Total Dining: {stats?.totalDining}</p>
      <p>Lightning Lane Attractions: {stats?.lightningLaneAttractions}</p>
      <p>Must-Do Attractions: {stats?.mustDoAttractions}</p>
    </div>
  )
}
```

## Example Data Access

### Direct Service Usage
```typescript
import { parksService } from '@/lib/firebase/parks-service'

// Get all parks
const parks = await parksService.getAllParks()

// Get specific park
const magicKingdom = await parksService.getParkById('mk')

// Search attractions by filters
const thrillRides = await parksService.searchAttractions({
  thrillLevel: 4,
  mustDo: true
})

// Search dining by filters
const characterDining = await parksService.searchDining({
  characterDining: true,
  type: 'tableService'
})
```

## Key Features

### Lightning Lane Information
- **MultiPass**: Multiple attractions, advance booking
- **SinglePass**: Single attraction, day-of booking
- Accurate tier classifications for planning

### Height Requirements
- Precise measurements in inches and centimeters
- Helpful for families with children
- Rider Swap availability noted

### Accessibility Support
- Wheelchair accessibility details
- Transfer requirements
- Assistive listening availability
- Service animal policies
- DAS (Disability Access Service) information

### Real-World Data
- Current closure information with dates
- Actual operating hours by day of week
- Transportation connections
- Parking costs and tips
- Special events calendars

## Best Practices

### Error Handling
```typescript
const { data, loading, error, refetch } = useParks()

if (error) {
  // Log error for debugging
  console.error('Parks fetch error:', error)

  // Show user-friendly message
  return <ErrorMessage onRetry={refetch} />
}
```

### Loading States
```typescript
if (loading) {
  return <ParksSkeleton />
}
```

### Data Validation
The TypeScript interfaces ensure type safety:
```typescript
// All park data is strictly typed
const park: DisneyPark = await parksService.getParkById('mk')
// TypeScript will catch any incorrect property access
```

## Future Enhancements

### Planned Features
- **Wait Times**: Real-time attraction wait times
- **Weather Integration**: Current conditions and forecasts
- **Events Calendar**: Special events and festivals
- **Crowd Predictions**: Busy day forecasting
- **Photo Locations**: PhotoPass and scenic spots

### Data Expansion
- **Additional Parks**: Animal Kingdom, water parks
- **Resort Information**: Hotel details and transportation
- **Seasonal Events**: Halloween, Christmas overlays
- **Menu Updates**: Current pricing and seasonal items

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify environment variables in `.env`
   - Check Firebase project configuration
   - Ensure proper authentication

2. **API Route 404 Errors**
   - Verify API routes are deployed
   - Check Next.js app router setup
   - Confirm dynamic route parameters

3. **TypeScript Errors**
   - Run `npm run type-check`
   - Verify import paths
   - Check interface compatibility

4. **Seeding Script Issues**
   - Ensure Firebase admin SDK is configured
   - Check Firestore permissions
   - Verify data structure matches interfaces

### Performance Optimization
- API routes include appropriate caching headers
- React hooks prevent unnecessary re-renders
- Firebase queries are optimized for minimal reads
- Static data reduces external API dependencies

This implementation provides a robust foundation for Disney park planning applications with comprehensive, accurate data and developer-friendly APIs.