# Disney API Integration Documentation

## Overview

This document provides comprehensive documentation for the Disney API integrations implemented in the Woody Disney Vacation Planning application. The implementation integrates multiple Disney data sources to provide a unified, enriched experience for users planning their Walt Disney World vacation.

## API Sources

### 1. ThemeParks Wiki API
- **Base URL**: `https://api.themeparks.wiki/v1`
- **Purpose**: Real-time park data, wait times, schedules, and attraction information
- **Update Frequency**: Real-time for wait times (60 second cache), daily for schedules

### 2. Disney API (disneyapi.dev)
- **Base URL**: `https://api.disneyapi.dev`
- **Purpose**: Disney character information and associations
- **Features**: REST and GraphQL endpoints, character search and filtering

## Architecture

### Service Layer

#### `/src/lib/services/themeparks-api.ts`
Core service for ThemeParks Wiki API integration:
- Entity fetching (parks, attractions, restaurants)
- Live data (wait times, operating status)
- Schedule information
- Children entities (attractions within parks)
- Intelligent caching with fallback

#### `/src/lib/services/disney-api.ts`
Disney character API integration:
- Character search and filtering
- GraphQL queries for complex searches
- Park attraction character associations
- Paginated results

#### `/src/lib/services/unified-disney-api.ts`
Unified service that aggregates data from all sources:
- Combines park data with character information
- Calculates crowd levels and statistics
- Provides attraction recommendations
- Enhanced search capabilities

### API Endpoints

## REST API Endpoints

### Walt Disney World Resort

#### `GET /api/walt-disney-world`
Comprehensive resort-wide information.

**Query Parameters:**
- `includeParks` (boolean, default: true)
- `includeWaitTimes` (boolean, default: true)
- `includeSchedules` (boolean, default: true)
- `includeHotels` (boolean, default: false)
- `includeCharacters` (boolean, default: false)
- `includeStatistics` (boolean, default: true)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "resort": {
      "id": "e957da41-3552-4cf6-b636-5babc5cbc4e5",
      "name": "Walt Disney World® Resort",
      "location": {
        "latitude": 28.388195,
        "longitude": -81.569324
      }
    },
    "parks": [...],
    "statistics": {
      "resort": {
        "totalParks": 4,
        "totalAttractions": 150,
        "operatingAttractions": 145,
        "averageWaitTime": 35,
        "crowdLevel": 5
      }
    }
  }
}
```

### Parks

#### `GET /api/parks/[parkId]`
Individual park data (existing endpoint).

**Path Parameters:**
- `parkId`: Park slug (e.g., 'magic-kingdom') or UUID

**Query Parameters:**
- `entity`: 'details' | 'attractions' | 'live' | 'schedule' | 'showtimes'

#### `GET /api/unified/parks`
All parks with unified data.

**Query Parameters:**
- `includeWaitTimes` (boolean, default: true)
- `includeCharacters` (boolean, default: false)
- `includeSchedule` (boolean, default: true)

#### `GET /api/unified/parks/[parkId]`
Enhanced park-specific data with character associations.

**Query Parameters:**
- `includeCharacters` (boolean, default: true)
- `includeWaitTimes` (boolean, default: true)
- `includeSchedule` (boolean, default: true)
- `includeRecommendations` (boolean, default: false)
- `maxWaitTime` (number): For recommendations
- `characterPreferences` (string): Comma-separated character names

### Wait Times

#### `GET /api/unified/wait-times`
Real-time wait times across all parks.

**Query Parameters:**
- `parkId`: Filter by park (slug or UUID)
- `minWaitTime` (number): Minimum wait time filter
- `maxWaitTime` (number): Maximum wait time filter
- `status`: 'operating' | 'closed' | 'refurbishment' | 'down'
- `sortBy`: 'waitTime' | 'name' | 'park' (default: 'waitTime')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')
- `includePredictions` (boolean, default: false)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "waitTimes": [
      {
        "id": "attraction-uuid",
        "name": "Seven Dwarfs Mine Train",
        "waitTime": 75,
        "status": "OPERATING",
        "lightningLaneAvailable": true,
        "parkName": "Magic Kingdom"
      }
    ],
    "statistics": {
      "averageWaitTime": 35,
      "attractionsUnder30Min": 45,
      "attractionsOver60Min": 12
    }
  }
}
```

### Attractions

#### `GET /api/unified/attractions/search`
Search attractions with character associations.

**Query Parameters:**
- `q` (required): Search query
- `includeCharacters` (boolean, default: true)
- `includeWaitTimes` (boolean, default: true)
- `limit` (number, default: 10, max: 50)

### Disney Characters

#### `GET /api/disney/characters`
Search and filter Disney characters.

**Query Parameters:**
- `page` (number, default: 1)
- `pageSize` (number, default: 50)
- `name`: Character name search
- `parkAttraction`: Filter by attraction
- `film`: Filter by film
- `tvShow`: Filter by TV show
- `graphql` (boolean): Use GraphQL API
- `wdw` (boolean): Get WDW-specific characters

#### `GET /api/disney/characters/[characterId]`
Get specific character details.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": 308,
    "name": "Mickey Mouse",
    "films": ["Steamboat Willie", "Fantasia"],
    "parkAttractions": ["Mickey's PhilharMagic"],
    "imageUrl": "https://...",
    "metadata": {
      "totalAppearances": 150,
      "relationshipCount": 25
    },
    "wdwAttractions": ["Mickey's PhilharMagic"]
  }
}
```

## Data Models

### Unified Park Data
```typescript
interface UnifiedParkData {
  id: string
  name: string
  currentWaitTimes?: UnifiedWaitTime[]
  todaySchedule?: ScheduleEntry
  crowdLevel?: number
  associatedCharacters?: DisneyCharacter[]
  realTimeUpdates?: boolean
}
```

### Unified Wait Time
```typescript
interface UnifiedWaitTime {
  id: string
  name: string
  waitTime: number | null
  status: 'OPERATING' | 'CLOSED' | 'REFURBISHMENT' | 'DOWN'
  lightningLaneAvailable?: boolean
  virtualQueueAvailable?: boolean
  lastUpdate: string
  trend?: 'INCREASING' | 'DECREASING' | 'STABLE'
}
```

## Caching Strategy

### Cache TTLs
- Static entity data: 1 hour
- Live wait times: 1 minute
- Schedule data: 30 minutes
- Character data: 1 hour
- Aggregated data: 5 minutes

### Cache Fallback
All services implement intelligent fallback mechanisms:
1. Return cached data if API call fails
2. Stale data is returned with warning logs
3. Runtime cache persists across requests

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes
- `200`: Success
- `400`: Bad request (invalid parameters)
- `404`: Resource not found
- `500`: Internal server error

## Best Practices

### Performance Optimization
1. Use query parameters to limit data returned
2. Leverage caching for frequently accessed data
3. Batch requests when possible
4. Use GraphQL for complex character queries

### Rate Limiting
- ThemeParks Wiki: No official rate limit, but cache aggressively
- Disney API: No authentication required, reasonable use expected

### Data Freshness
- Wait times: Real-time with 1-minute cache
- Park schedules: Updated daily
- Character data: Static, cached for 1 hour
- Crowd levels: Calculated from live data

## Example Integration

### Get Current Park Status
```javascript
// Fetch current status for all parks
const response = await fetch('/api/unified/parks?includeCharacters=false')
const { data } = await response.json()

// Get specific park with recommendations
const mkResponse = await fetch('/api/unified/parks/magic-kingdom?includeRecommendations=true&maxWaitTime=30')
const mkData = await mkResponse.json()
```

### Search Attractions with Characters
```javascript
// Search for attractions featuring Mickey Mouse
const searchResponse = await fetch('/api/unified/attractions/search?q=mickey')
const { data } = await searchResponse.json()

// Get character details for attraction
const characterResponse = await fetch(`/api/disney/characters/${characterId}`)
const character = await characterResponse.json()
```

## Future Enhancements

### Planned Features
1. Historical wait time data and predictions
2. Touring Plans API integration for crowd calendars
3. Weather API integration
4. Real-time notifications via WebSocket
5. Mobile app push notifications
6. Personalized recommendations based on user preferences

### API Expansion
- Dining reservations availability
- Genie+ and Lightning Lane data
- Special event information
- Photo Pass locations
- Transportation wait times

## Monitoring and Analytics

### Metrics Tracked
- API response times
- Cache hit rates
- Error rates by endpoint
- Popular search queries
- Peak usage times

### Health Checks
- `/api/health`: Overall API health
- `/api/cache-stats`: Cache performance metrics

## Support

For issues or questions regarding the Disney API integration:
1. Check error logs in the console
2. Verify API endpoints are accessible
3. Review cache statistics
4. Ensure proper error handling in client code