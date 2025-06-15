import { 
  Coordinate, 
  Marker, 
  AttractionMarker, 
  RestaurantMarker,
  MarkerType,
  Bounds,
  LocationData,
} from '@/types/maps';

// Type guards
export function isAttractionMarker(marker: Marker): marker is AttractionMarker {
  return marker.type === 'attraction';
}

export function isRestaurantMarker(marker: Marker): marker is RestaurantMarker {
  return marker.type === 'restaurant';
}

export function hasWaitTime(marker: Marker): marker is AttractionMarker & { waitTime: number } {
  return isAttractionMarker(marker) && typeof marker.waitTime === 'number';
}

export function isWithinBounds(point: Coordinate, bounds: Bounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

// Converters
export function locationDataToCoordinate(location: LocationData): Coordinate {
  return {
    lat: location.lat,
    lng: location.lng,
  };
}

export function coordinateToGoogleLatLng(coord: Coordinate): google.maps.LatLng {
  return new google.maps.LatLng(coord.lat, coord.lng);
}

export function googleLatLngToCoordinate(latLng: google.maps.LatLng): Coordinate {
  return {
    lat: latLng.lat(),
    lng: latLng.lng(),
  };
}

// Bounds utilities
export function createBoundsFromCoordinates(coordinates: Coordinate[]): Bounds | null {
  if (coordinates.length === 0) return null;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  coordinates.forEach(coord => {
    north = Math.max(north, coord.lat);
    south = Math.min(south, coord.lat);
    east = Math.max(east, coord.lng);
    west = Math.min(west, coord.lng);
  });

  return { north, south, east, west };
}

export function expandBounds(bounds: Bounds, padding: number): Bounds {
  const latPadding = (bounds.north - bounds.south) * padding;
  const lngPadding = (bounds.east - bounds.west) * padding;

  return {
    north: Math.min(90, bounds.north + latPadding),
    south: Math.max(-90, bounds.south - latPadding),
    east: Math.min(180, bounds.east + lngPadding),
    west: Math.max(-180, bounds.west - lngPadding),
  };
}

export function boundsToGoogleLatLngBounds(bounds: Bounds): google.maps.LatLngBounds {
  return new google.maps.LatLngBounds(
    { lat: bounds.south, lng: bounds.west },
    { lat: bounds.north, lng: bounds.east }
  );
}

// Marker utilities
export function filterMarkersByType<T extends MarkerType>(
  markers: Marker[],
  type: T
): Extract<Marker, { type: T }>[] {
  return markers.filter(marker => marker.type === type) as Extract<Marker, { type: T }>[];
}

export function getMarkerIcon(marker: Marker): string {
  const iconMap: Record<MarkerType, string> = {
    attraction: '/images/markers/attraction.svg',
    restaurant: '/images/markers/restaurant.svg',
    restroom: '/images/markers/restroom.svg',
    shop: '/images/markers/shop.svg',
    hotel: '/images/markers/hotel.svg',
    parking: '/images/markers/parking.svg',
    transportation: '/images/markers/transportation.svg',
    entertainment: '/images/markers/entertainment.svg',
    service: '/images/markers/service.svg',
    custom: '/images/markers/custom.svg',
  };

  return iconMap[marker.type] || iconMap.custom;
}

export function getMarkerColor(marker: Marker): string {
  if (isAttractionMarker(marker)) {
    switch (marker.status) {
      case 'OPERATING': return '#22c55e'; // green
      case 'DOWN': return '#ef4444'; // red
      case 'CLOSED': return '#6b7280'; // gray
      case 'REFURBISHMENT': return '#f59e0b'; // amber
      case 'WEATHER': return '#3b82f6'; // blue
      case 'CAPACITY': return '#a855f7'; // purple
      default: return '#6b7280';
    }
  }

  const colorMap: Record<MarkerType, string> = {
    attraction: '#3b82f6',
    restaurant: '#f59e0b',
    restroom: '#6b7280',
    shop: '#a855f7',
    hotel: '#22c55e',
    parking: '#64748b',
    transportation: '#06b6d4',
    entertainment: '#ec4899',
    service: '#f97316',
    custom: '#6b7280',
  };

  return colorMap[marker.type] || colorMap.custom;
}

// Wait time utilities
export function getWaitTimeCategory(minutes: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (minutes <= 15) return 'low';
  if (minutes <= 30) return 'medium';
  if (minutes <= 60) return 'high';
  return 'very-high';
}

export function formatWaitTime(minutes: number): string {
  if (minutes === 0) return 'Walk on';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Distance formatting
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatWalkingTime(meters: number): string {
  // Average walking speed: 5 km/h = 1.39 m/s
  const seconds = meters / 1.39;
  const minutes = Math.ceil(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} min walk`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m walk` : `${hours}h walk`;
}

// Validation helpers
export function isValidCoordinate(coord: any): coord is Coordinate {
  return (
    typeof coord === 'object' &&
    coord !== null &&
    typeof coord.lat === 'number' &&
    typeof coord.lng === 'number' &&
    coord.lat >= -90 &&
    coord.lat <= 90 &&
    coord.lng >= -180 &&
    coord.lng <= 180
  );
}

export function isValidBounds(bounds: any): bounds is Bounds {
  return (
    typeof bounds === 'object' &&
    bounds !== null &&
    typeof bounds.north === 'number' &&
    typeof bounds.south === 'number' &&
    typeof bounds.east === 'number' &&
    typeof bounds.west === 'number' &&
    bounds.north >= bounds.south &&
    bounds.east >= bounds.west
  );
}

// Disney park specific utilities
export const DISNEY_PARK_BOUNDS: Record<string, Bounds> = {
  'magic-kingdom': {
    north: 28.4224,
    south: 28.4130,
    east: -81.5755,
    west: -81.5869,
  },
  'epcot': {
    north: 28.3747,
    south: 28.3647,
    east: -81.5457,
    west: -81.5557,
  },
  'hollywood-studios': {
    north: 28.3614,
    south: 28.3514,
    east: -81.5549,
    west: -81.5649,
  },
  'animal-kingdom': {
    north: 28.3659,
    south: 28.3559,
    east: -81.5859,
    west: -81.5959,
  },
};

export function getNearestPark(location: Coordinate): string | null {
  let nearestPark: string | null = null;
  let minDistance = Infinity;

  Object.entries(DISNEY_PARK_BOUNDS).forEach(([parkId, bounds]) => {
    const center: Coordinate = {
      lat: (bounds.north + bounds.south) / 2,
      lng: (bounds.east + bounds.west) / 2,
    };

    // Simple distance calculation (not using Haversine for performance)
    const distance = Math.sqrt(
      Math.pow(location.lat - center.lat, 2) + 
      Math.pow(location.lng - center.lng, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestPark = parkId;
    }
  });

  return nearestPark;
}