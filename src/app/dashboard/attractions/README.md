# Disney World Attractions Module

This module provides a comprehensive implementation of the Disney World attractions feature for the Disney Vacation Planning application.

## Features

- **Browse Attractions**: View all attractions across Disney World parks with detailed information
- **Filter by Park**: Filter attractions by specific parks (Magic Kingdom, EPCOT, Hollywood Studios, etc.)
- **Advanced Filtering**: Filter by attraction type, accessibility features, height requirements, and more
- **Search**: Search for attractions by name or description
- **Detailed Views**: See detailed information about each attraction including:
  - Description
  - Accessibility information
  - Height requirements
  - Wait times
  - Operating hours
  - Performance times (for shows)
- **Itinerary Integration**: Add attractions to your vacation itinerary

## Structure

- `page.tsx`: Main attractions listing page
- `[attractionId]/page.tsx`: Individual attraction detail page
- `README.md`: This documentation file

## Components

The following reusable components were created for this module:

- `AttractionCard`: Card component displaying attraction summary
- `AttractionDetail`: Detailed view of an attraction
- `AttractionFilterBar`: Filter controls for attractions

## Data Model

Attractions follow a standardized data model defined in `/src/types/attraction.ts`, including:

- Basic information (name, description, park)
- Accessibility details
- Height requirements
- Operating schedules
- Wait times
- Categories and tags

## Future Enhancements

- Interactive map view of attractions
- Live wait time data integration
- Personalized recommendations
- Virtual queue integration
- PhotoPass integration
- Mobile app integration with location-based features

## Adding New Attractions

To add new attractions, update the `attractionData.ts` file following the defined data structure. Ensure all required fields are populated, and optional fields are included when relevant information is available.

## Image Requirements

Attraction images should be placed in `/public/images/attractions/` and referenced in the attraction data. Images should be:

- High quality (minimum 800x600px)
- Properly licensed
- Optimized for web
- Descriptive of the attraction