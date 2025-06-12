# EPCOT API Documentation

## Overview

The EPCOT API provides comprehensive access to all EPCOT park data through the themeparks.wiki API. This implementation offers detailed information about attractions, dining, festivals, wait times, and personalized recommendations.

## Base Information

- **Park ID**: `47f90d2c-e191-4239-a466-5892ef59a88b`
- **Parent ID**: `e957da41-3552-4cf6-b636-5babc5cbc4e5` (Walt Disney World Resort)
- **Timezone**: `America/New_York`

## API Endpoints

### 1. Main EPCOT Endpoint

**GET** `/api/parks/epcot`

Query parameters:
- `type`: The type of data to retrieve
  - `info` - Basic park information and metadata
  - `live` - Current wait times, showtimes, and operational status
  - `attractions` - All attractions, restaurants, shows, and shops
  - `schedule` - Park operating hours and special events
  - `map` - Interactive map data with coordinates and areas
  - `children` - Same as attractions - all child entities
  - `complete` - All data combined in one response

Additional parameters for `live`:
- `includeShowtimes`: boolean - Filter to only show entities with showtimes
- `includeWaitTimes`: boolean - Filter to only show entities with wait times

Additional parameters for `schedule`:
- `year`: YYYY format
- `month`: MM format

#### Example Responses:

##### Park Info
```json
GET /api/parks/epcot?type=info

{
  "id": "47f90d2c-e191-4239-a466-5892ef59a88b",
  "name": "EPCOT",
  "slug": "epcot",
  "entityType": "PARK",
  "parkInfo": {
    "fullName": "Experimental Prototype Community of Tomorrow",
    "opened": "October 1, 1982",
    "size": "305 acres",
    "icon": "🌍",
    "theme": "Technology, Innovation, and World Culture",
    "areas": ["World Celebration", "World Discovery", "World Nature", "World Showcase"],
    "highlights": ["Spaceship Earth", "Guardians of the Galaxy: Cosmic Rewind", ...]
  }
}
```

##### Live Data
```json
GET /api/parks/epcot?type=live

{
  "id": "47f90d2c-e191-4239-a466-5892ef59a88b",
  "name": "EPCOT",
  "liveData": [...],
  "summary": {
    "totalAttractions": 45,
    "operating": 42,
    "closed": 3,
    "averageWaitTime": 35,
    "attractions": {
      "worldCelebration": [...],
      "worldDiscovery": [...],
      "worldNature": [...],
      "worldShowcase": [...]
    }
  },
  "lastUpdate": "2024-01-15T14:30:00Z"
}
```

### 2. Festivals Endpoint

**GET** `/api/parks/epcot/festivals`

Query parameters:
- `type`: Festival data type
  - `active` - Currently active festivals
  - `all` - All festivals throughout the year
  - `offerings` - Festival-specific booths and marketplaces
  - `schedule` - Park schedule with festival information
- `festival`: Festival name (for offerings)
- `date`: ISO date string (for checking active festivals on specific date)

#### Example:
```json
GET /api/parks/epcot/festivals?type=active

{
  "date": "2024-01-15T14:30:00Z",
  "activeFestivals": [
    {
      "name": "EPCOT International Festival of the Arts",
      "startMonth": 1,
      "endMonth": 2,
      "description": "Celebrate the visual, culinary, and performing arts",
      "features": ["Art galleries", "Live performances", "Food studios", "Interactive workshops"]
    }
  ],
  "count": 1
}
```

### 3. World Showcase Endpoint

**GET** `/api/parks/epcot/world-showcase`

Query parameters:
- `type`: Data type
  - `countries` - All World Showcase countries and pavilions
  - `dining` - World Showcase dining options by country
  - `attractions` - World Showcase attractions by country
  - `cultural` - Cultural experiences and performances
  - `live` - Live data for World Showcase entities
- `country`: Specific country name (optional)

#### Example:
```json
GET /api/parks/epcot/world-showcase?type=countries

{
  "totalCountries": 11,
  "countries": [
    {
      "name": "Mexico",
      "pavilion": "Mexico Pavilion",
      "location": "World Showcase",
      "highlights": ["Gran Fiesta Tour", "La Cava del Tequila", "San Angel Inn"]
    },
    ...
  ],
  "walkingOrder": {
    "clockwise": ["Mexico", "Norway", ...],
    "counterClockwise": ["Canada", "United Kingdom", ...],
    "distance": "1.2 miles around the lagoon"
  }
}
```

### 4. Areas Endpoint

**GET** `/api/parks/epcot/areas`

Query parameters:
- `area`: Area selection
  - `celebration` - World Celebration
  - `discovery` - World Discovery
  - `nature` - World Nature
  - `all` - All areas
- `type`: Data type
  - `attractions` - Attractions in the area
  - `dining` - Dining options in the area
  - `experiences` - Unique experiences and special features
  - `wait-times` - Current wait times by area

#### Example:
```json
GET /api/parks/epcot/areas?area=discovery&type=attractions

{
  "area": "World Discovery",
  "description": "Explore science, technology, and space through thrilling attractions",
  "theme": "Science, Technology, and Space Exploration",
  "attractions": [...],
  "count": 4,
  "highlights": [
    "Guardians of the Galaxy: Cosmic Rewind",
    "Test Track - Design and test your own vehicle",
    "Mission: SPACE - Journey to Mars",
    "PLAY! - Interactive experience"
  ]
}
```

### 5. Recommendations Endpoint

**GET** `/api/parks/epcot/recommendations`

Query parameters:
- `interests`: Comma-separated list
  - Options: `thrills`, `food`, `family`, `education`, `culture`, `nature`
  - Default: `all`
- `time`: Time of day
  - Options: `morning`, `afternoon`, `evening`, `all`
  - Default: `all`
- `duration`: Visit duration
  - Options: `half-day`, `full-day`, `multi-day`
  - Default: `full-day`

#### Example:
```json
GET /api/parks/epcot/recommendations?interests=food,culture&time=evening&duration=full-day

{
  "interests": ["food", "culture"],
  "timeOfDay": "evening",
  "duration": "full-day",
  "recommendations": [...],
  "itinerary": {
    "morning": [...],
    "afternoon": [...],
    "evening": [...],
    "lunch": { "time": "12:00 PM", "suggestion": "World Showcase dining" },
    "dinner": { "time": "6:00 PM", "suggestion": "Table service restaurant" },
    "fireworks": {
      "show": "EPCOT Forever / Harmonious",
      "time": "9:00 PM",
      "viewingSpots": ["World Showcase Lagoon", "Japan Pavilion", "UK Pavilion"]
    }
  },
  "currentConditions": {...},
  "activeFestivals": [...],
  "tips": [...],
  "mustDo": [...],
  "diningRecommendations": {...}
}
```

### 6. Statistics Endpoint

**GET** `/api/parks/epcot/stats`

Query parameters:
- `type`: Statistics type
  - `current` - Current park statistics
  - `areas` - Detailed area statistics
  - `attractions` - Attraction-specific statistics
  - `historical` - Historical data patterns
  - `complete` - All statistics combined

#### Example:
```json
GET /api/parks/epcot/stats?type=current

{
  "park": {...},
  "totals": {
    "attractions": 45,
    "restaurants": 58,
    "shops": 35,
    "worldShowcaseCountries": 11
  },
  "current": {
    "operatingAttractions": 42,
    "averageWaitTime": 35,
    "maxWaitTime": 105,
    "activeFestivals": [...]
  },
  "summary": {
    "status": "Fully Operational",
    "recommendation": "Good time to visit - moderate crowds",
    "bestTimeToVisit": "Now is a decent time, but earlier would be better"
  },
  "lastUpdate": "2024-01-15T14:30:00Z"
}
```

## Service Functions

The EPCOT implementation includes a dedicated service (`epcot-service.ts`) with the following key functions:

### Area Management
- `getAttractionArea(attractionName)` - Determine which area an attraction belongs to
- `getWorldShowcaseCountry(entityName)` - Get World Showcase country for an entity
- `getEpcotAttractionsByArea()` - Get attractions grouped by area
- `getEpcotWaitTimesByArea()` - Get current wait times grouped by area

### Dining
- `getEpcotDining()` - Get dining options grouped by area and country

### Festivals
- `getActiveFestivals(date)` - Get active festivals for a given date
- `getFestivalOfferings(festivalName)` - Get festival-specific offerings

### Recommendations
- `getEpcotRecommendations(interests)` - Get personalized recommendations based on interests

### Statistics
- `getEpcotStats()` - Get comprehensive park statistics

## EPCOT Areas

### World Celebration
- **Theme**: Community, Connection, and Possibility
- **Key Attractions**: Spaceship Earth, Journey Into Imagination, The Seas with Nemo & Friends
- **Special Features**: Pin trading, Character meet and greets, Club Cool

### World Discovery
- **Theme**: Science, Technology, and Space Exploration
- **Key Attractions**: Guardians of the Galaxy: Cosmic Rewind, Test Track, Mission: SPACE
- **Dining**: Space 220 Restaurant

### World Nature
- **Theme**: Nature, Conservation, and Adventure
- **Key Attractions**: Soarin' Around the World, Living with the Land
- **Dining**: Sunshine Seasons, Garden Grill Restaurant

### World Showcase
- **Theme**: Culture, Cuisine, and International Fellowship
- **Countries**: 11 pavilions representing different nations
- **Distance**: 1.2 miles around the lagoon

## World Showcase Countries

1. **Mexico** - Gran Fiesta Tour, La Cava del Tequila
2. **Norway** - Frozen Ever After, Stave Church
3. **China** - Reflections of China, House of Good Fortune
4. **Germany** - Biergarten Restaurant, Karamell-Küche
5. **Italy** - Via Napoli, Tutto Italia
6. **The American Adventure** - The American Adventure Show, Voices of Liberty
7. **Japan** - Mitsukoshi Store, Teppan Edo
8. **Morocco** - Spice Road Table, Restaurant Marrakesh
9. **France** - Remy's Ratatouille Adventure, Les Halles
10. **United Kingdom** - Rose & Crown, Yorkshire County Fish Shop
11. **Canada** - O Canada!, Le Cellier

## EPCOT Festivals Calendar

### Festival of the Arts (January-February)
- Art galleries and exhibitions
- Live performances
- Food studios with artistic culinary creations
- Interactive workshops

### Flower & Garden Festival (March-May)
- Character topiaries
- Garden tours
- Outdoor kitchens
- Garden Rocks concerts

### Food & Wine Festival (August-November)
- Global marketplaces
- Culinary demonstrations
- Eat to the Beat concerts
- Wine and beverage tastings

### Festival of the Holidays (November-December)
- Holiday kitchens
- Candlelight Processional
- Holiday storytellers
- Cookie stroll

## Usage Examples

### Get current wait times for World Discovery attractions:
```javascript
const response = await fetch('/api/parks/epcot/areas?area=discovery&type=wait-times');
const data = await response.json();
```

### Check active festivals for a specific date:
```javascript
const response = await fetch('/api/parks/epcot/festivals?type=active&date=2024-03-15');
const data = await response.json();
```

### Get personalized recommendations for families:
```javascript
const response = await fetch('/api/parks/epcot/recommendations?interests=family,education&duration=full-day');
const data = await response.json();
```

### Get dining options in France pavilion:
```javascript
const response = await fetch('/api/parks/epcot/world-showcase?type=dining&country=France');
const data = await response.json();
```

## Error Handling

All endpoints return appropriate error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "validTypes": ["list", "of", "valid", "options"] // When applicable
}
```

Status codes:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `500` - Internal server error

## Performance Considerations

- Data is cached using React's cache mechanism
- Live data has a 1-minute cache TTL
- Static data (park info, children) has a 1-hour cache TTL
- Schedule data has a 30-minute cache TTL

## Integration with themeparks.wiki

This implementation uses the following themeparks.wiki endpoints:
- Entity details: `https://api.themeparks.wiki/v1/entity/{id}`
- Live data: `https://api.themeparks.wiki/v1/entity/{id}/live`
- Children entities: `https://api.themeparks.wiki/v1/entity/{id}/children`
- Schedule: `https://api.themeparks.wiki/v1/entity/{id}/schedule`