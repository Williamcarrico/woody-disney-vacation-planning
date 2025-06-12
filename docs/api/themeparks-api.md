# ThemeParks.wiki API Integration

This document outlines the comprehensive integration with the themeparks.wiki API for Disney park data.

## Overview

The themeparks.wiki API provides real-time and static data for Disney parks, including:
- Park information and operating hours
- Attraction details and wait times
- Restaurant and show information
- Live status updates

## API Endpoints

### Parks

#### Get All Parks
```
GET /api/parks
```

Query Parameters:
- `destination` (optional): Filter by destination slug (e.g., "walt-disney-world")
- `includeChildren` (optional): Include child entities (default: false)

#### Get Park Details
```
GET /api/parks/[parkId]
```

Path Parameters:
- `parkId`: Park slug (magic-kingdom, epcot, hollywood-studios, animal-kingdom)

Query Parameters:
- `entity`: Data type to fetch
  - `details`: Park information (default)
  - `attractions`: All attractions, restaurants, and shows
  - `live`: Live wait times and status
  - `schedule`: Operating hours
  - `showtimes`: Show times

Example:
```
GET /api/parks/magic-kingdom?entity=live
```

### Magic Kingdom Specific

#### Get Magic Kingdom Data
```
GET /api/parks/magic-kingdom
```

Query Parameters:
- `type`: Data type (details, live, attractions, schedule)
- `year`: Year for schedule (YYYY)
- `month`: Month for schedule (MM)

Example:
```
GET /api/parks/magic-kingdom?type=schedule&year=2025&month=5
```

### Destinations

#### Get Walt Disney World Data
```
GET /api/destinations/walt-disney-world
```

Query Parameters:
- `type`: Data type (details, children, live)

## Data Types

### ThemeParksEntity
```typescript
interface ThemeParksEntity {
  id: string
  name: string
  slug: string | null
  entityType: 'PARK' | 'ATTRACTION' | 'RESTAURANT' | 'SHOW' | 'HOTEL'
  parentId?: string
  externalId?: string
  location?: {
    latitude: number
    longitude: number
  }
}
```

### LiveDataItem
```typescript
interface LiveDataItem {
  id: string
  name: string
  entityType: string
  status: 'OPERATING' | 'CLOSED' | 'REFURBISHMENT' | 'DOWN'
  queue?: {
    STANDBY?: {
      waitTime: number | null
    }
    RETURN_TIME?: {
      state: 'AVAILABLE' | 'FINISHED'
      returnStart?: string
      returnEnd?: string
    }
    PAID_RETURN_TIME?: {
      state: 'AVAILABLE' | 'FINISHED'
      price?: {
        amount: number
        currency: string
      }
      returnStart?: string
      returnEnd?: string
    }
  }
  showtimes?: ShowTime[]
  operatingHours?: OperatingHour[]
}
```

### ScheduleEntry
```typescript
interface ScheduleEntry {
  date: string
  type: 'OPERATING' | 'EXTRA_MAGIC' | 'SPECIAL_EVENT' | 'TICKETED_EVENT'
  openingTime: string
  closingTime: string
  specialHours?: {
    type: string
    openingTime: string
    closingTime: string
  }[]
}
```

## Service Layer

The themeparks API service (`src/lib/services/themeparks-api.ts`) provides:

### Core Functions

- `getEntity(entityId)`: Get any entity by ID
- `getLiveData(entityId)`: Get live data for an entity
- `getChildren(entityId)`: Get child entities
- `getSchedule(entityId, year?, month?)`: Get schedule

### Magic Kingdom Functions

- `getMagicKingdom()`: Get park details
- `getMagicKingdomLive()`: Get live data
- `getMagicKingdomAttractions()`: Get all attractions
- `getMagicKingdomSchedule(year?, month?)`: Get schedule

### Park Functions by Slug

- `getParkBySlug(slug)`: Get park details
- `getParkLiveDataBySlug(slug)`: Get live data
- `getParkAttractionsBySlug(slug)`: Get attractions
- `getParkScheduleBySlug(slug, year?, month?)`: Get schedule

## Caching Strategy

The API implements multiple caching layers:

1. **Runtime Cache**: In-memory cache with configurable TTLs
   - Entity data: 1 hour
   - Live data: 1 minute
   - Schedule: 30 minutes
   - Children: 30 minutes

2. **Next.js Cache**: Server-side caching via `next: { revalidate }`

3. **Edge Caching**: For API routes with `withEdge` wrapper

## Error Handling

All API calls include:
- Graceful fallback to cached data on error
- Proper error status codes
- Detailed error messages
- Retry logic for transient failures

## Rate Limiting

The themeparks.wiki API has a rate limit of 300 requests per minute per IP. Our implementation:
- Uses server-side caching to minimize requests
- Returns cached data when possible
- Implements proper error handling for rate limit errors

## Migration from Old API

A compatibility layer (`src/lib/api/themeParks-compat.ts`) is provided for smooth migration:

```typescript
// Old import
import { getParkLiveData } from '@/lib/api/themeParks'

// New import (using compatibility layer)
import { getParkLiveData } from '@/lib/api/themeParks-compat'
```

The compatibility layer maintains the same interface while using the new API service internally.

## Examples

### Get Magic Kingdom Live Data
```javascript
const response = await fetch('/api/parks/magic-kingdom?entity=live')
const data = await response.json()

// Response includes:
// - Current wait times for all attractions
// - Operating status
// - Lightning Lane availability
// - Show times
```

### Get Park Schedule for May 2025
```javascript
const response = await fetch('/api/parks/magic-kingdom?type=schedule&year=2025&month=5')
const data = await response.json()

// Response includes daily operating hours for the month
```

### Get All Walt Disney World Parks
```javascript
const response = await fetch('/api/destinations/walt-disney-world?type=children')
const data = await response.json()

// Response includes all parks, hotels, and other entities
// Grouped by type for easy access
```