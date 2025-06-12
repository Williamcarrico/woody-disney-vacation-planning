# Animal Kingdom API Integration

This document outlines the comprehensive integration with the themeparks.wiki API for Disney's Animal Kingdom Theme Park.

## Overview

The Animal Kingdom API provides real-time and static data for Disney's Animal Kingdom Theme Park, including:
- Park hours and schedules
- Live attraction wait times and status
- Dining locations and availability
- Entertainment and show schedules
- Lightning Lane pricing and availability
- Interactive map data

## Entity IDs

```typescript
// Core entity IDs
const ANIMAL_KINGDOM_ID = '1c84a229-8862-4648-9c71-378ddd2c7693'
const WALT_DISNEY_WORLD_ID = 'e957da41-3552-4cf6-b636-5babc5cbc4e5'
```

## API Endpoints

### 1. Park Overview
```
GET https://api.themeparks.wiki/v1/entity/1c84a229-8862-4648-9c71-378ddd2c7693
```
Returns basic park information including location, timezone, and parent destination.

### 2. Live Data
```
GET https://api.themeparks.wiki/v1/entity/1c84a229-8862-4648-9c71-378ddd2c7693/live
```
Returns real-time data for all attractions, dining, and entertainment including:
- Current wait times
- Operating status
- Lightning Lane availability and pricing
- Show times
- Operating hours

### 3. Children Entities
```
GET https://api.themeparks.wiki/v1/entity/1c84a229-8862-4648-9c71-378ddd2c7693/children
```
Returns all child entities (attractions, restaurants, shows) within Animal Kingdom.

### 4. Schedule Data
```
GET https://api.themeparks.wiki/v1/entity/1c84a229-8862-4648-9c71-378ddd2c7693/schedule
GET https://api.themeparks.wiki/v1/entity/1c84a229-8862-4648-9c71-378ddd2c7693/schedule/{year}/{month}
```
Returns park operating hours and special event schedules.

### 5. Walt Disney World Context
```
GET https://api.themeparks.wiki/v1/entity/e957da41-3552-4cf6-b636-5babc5cbc4e5/children
GET https://api.themeparks.wiki/v1/entity/e957da41-3552-4cf6-b636-5babc5cbc4e5/live
```
Returns WDW resort-wide data for context and cross-park information.

## Implementation Details

### API Route Handler

The main API route handler is located at `/api/parks/animal-kingdom/route.ts` and provides the following endpoints:

#### Overview Data
```typescript
GET /api/parks/animal-kingdom?type=overview
```
Returns:
- Park information
- Current status (open/closed, crowd level, average wait time)
- Weather conditions
- Today's schedule
- List of lands

#### Attractions Data
```typescript
GET /api/parks/animal-kingdom?type=attractions
```
Returns:
- All attractions with enhanced data
- Current wait times and status
- Lightning Lane availability and pricing
- Height requirements
- Operating hours
- Next show times (for shows)

#### Dining Data
```typescript
GET /api/parks/animal-kingdom?type=dining
```
Returns:
- All dining locations
- Operating status
- Type categorization (table-service, quick-service, snack)
- Operating hours
- Land location

#### Entertainment Data
```typescript
GET /api/parks/animal-kingdom?type=entertainment
```
Returns:
- All shows and entertainment
- Current status
- Show times
- Location information

#### Schedule Data
```typescript
GET /api/parks/animal-kingdom?type=schedule&year=2025&month=5
```
Returns park schedules for specified time period.

#### Live Data
```typescript
GET /api/parks/animal-kingdom?type=live
```
Returns raw live data from themeparks.wiki API.

#### Map Data
```typescript
GET /api/parks/animal-kingdom?type=map
```
Returns location data for all entities suitable for interactive map display.

#### WDW Context Data
```typescript
GET /api/parks/animal-kingdom?type=wdw-context
```
Returns Walt Disney World resort-wide information.

## Custom React Hooks

### useAnimalKingdomOverview
```typescript
const { data, isLoading, error, refetch } = useAnimalKingdomOverview()
```
Fetches park overview data with 1-minute cache.

### useAnimalKingdomAttractions
```typescript
const { data, isLoading, error } = useAnimalKingdomAttractions()
```
Fetches all attractions with live wait times, 1-minute cache.

### useAnimalKingdomDining
```typescript
const { data, isLoading, error } = useAnimalKingdomDining()
```
Fetches dining locations, 5-minute cache.

### useAnimalKingdomEntertainment
```typescript
const { data, isLoading, error } = useAnimalKingdomEntertainment()
```
Fetches entertainment and shows, 5-minute cache.

### useAnimalKingdomSchedule
```typescript
const { data, isLoading, error } = useAnimalKingdomSchedule(year?, month?)
```
Fetches park schedules, 30-minute cache.

### useAnimalKingdomLive
```typescript
const { data, isLoading, error } = useAnimalKingdomLive()
```
Fetches raw live data with auto-refresh every minute.

### useAnimalKingdomMap
```typescript
const { data, isLoading, error } = useAnimalKingdomMap()
```
Fetches map data, 5-minute cache.

### useWDWContext
```typescript
const { data, isLoading, error } = useWDWContext()
```
Fetches WDW resort context, 30-minute cache.

## Land Categorization

The API automatically categorizes attractions and dining into the following lands:

- **Discovery Island** - Central hub area
- **Pandora - The World of Avatar** - Avatar-themed land
- **Africa** - African-themed area including Harambe
- **Asia** - Asian-themed area including Anandapur
- **DinoLand U.S.A.** - Dinosaur-themed area
- **Rafiki's Planet Watch** - Conservation Station area

## Data Enhancements

The API provides several enhancements over the raw themeparks.wiki data:

### Attraction Categorization
- **Type**: thrill, family, kids, show, trail
- **Land**: Automatic assignment based on name/location
- **Height Requirements**: Mapped for applicable attractions

### Dining Categorization
- **Type**: table-service, quick-service, snack
- **Land**: Automatic assignment based on location

### Crowd Level Calculation
Based on average wait times:
- 1-2: Very Light (avg < 15 min)
- 3-4: Light (avg 15-30 min)
- 5-6: Moderate (avg 30-45 min)
- 7-8: Heavy (avg 45-60 min)
- 9-10: Very Heavy (avg > 60 min)

## Error Handling

All API endpoints include comprehensive error handling:
- Network failures gracefully degrade
- Cached data returned when API is unavailable
- User-friendly error messages
- Detailed logging for debugging

## Caching Strategy

The implementation uses a multi-level caching strategy:

1. **Runtime Cache**: In-memory cache for API responses
2. **React Query Cache**: Client-side caching with stale-while-revalidate
3. **Next.js Cache**: Server-side caching with revalidation

Cache durations:
- Entity data: 1 hour
- Live data: 1 minute
- Schedule data: 30 minutes
- Children data: 30 minutes

## Rate Limiting

The themeparks.wiki API has a rate limit of 300 requests per minute per IP. Our implementation:
- Aggressive caching to minimize requests
- Parallel requests where appropriate
- Error handling for rate limit responses

## Usage Example

```typescript
import { useAnimalKingdomOverview, useAnimalKingdomAttractions } from '@/hooks/useAnimalKingdom'

function AnimalKingdomDashboard() {
  const { data: overview, isLoading: overviewLoading } = useAnimalKingdomOverview()
  const { data: attractions, isLoading: attractionsLoading } = useAnimalKingdomAttractions()

  if (overviewLoading || attractionsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <h1>{overview.park.name}</h1>
      <p>Crowd Level: {overview.currentStatus.crowdLevel}/10</p>
      <p>Average Wait: {overview.currentStatus.averageWaitTime} minutes</p>

      {attractions.attractions.map(attraction => (
        <AttractionCard key={attraction.id} attraction={attraction} />
      ))}
    </div>
  )
}
```

## Testing

To test the Animal Kingdom API integration:

1. **Unit Tests**: Test individual helper functions
2. **Integration Tests**: Test API route handlers
3. **E2E Tests**: Test full user flows

## Future Enhancements

- WebSocket support for real-time updates when available
- Historical wait time analysis
- Predictive crowd modeling
- Enhanced dining reservation integration
- PhotoPass location integration