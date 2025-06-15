import { z } from 'zod';

// Response schemas for different services
const GeocodeResponseSchema = z.object({
  results: z.array(z.object({
    formatted_address: z.string(),
    geometry: z.object({
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    }),
    place_id: z.string(),
  })),
  status: z.string(),
});

const PlacesResponseSchema = z.object({
  results: z.array(z.object({
    name: z.string(),
    formatted_address: z.string(),
    geometry: z.object({
      location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    }),
    place_id: z.string(),
    rating: z.number().optional(),
  })),
  status: z.string(),
});

const DirectionsResponseSchema = z.object({
  routes: z.array(z.object({
    legs: z.array(z.object({
      distance: z.object({
        text: z.string(),
        value: z.number(),
      }),
      duration: z.object({
        text: z.string(),
        value: z.number(),
      }),
      start_location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
      end_location: z.object({
        lat: z.number(),
        lng: z.number(),
      }),
    })),
  })),
  status: z.string(),
});

export class GoogleMapsProxy {
  private static instance: GoogleMapsProxy;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): GoogleMapsProxy {
    if (!GoogleMapsProxy.instance) {
      GoogleMapsProxy.instance = new GoogleMapsProxy();
    }
    return GoogleMapsProxy.instance;
  }

  private getCacheKey(service: string, params: any): string {
    return `${service}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async makeRequest(requestData: any): Promise<any> {
    const response = await fetch('/api/maps/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Maps request failed');
    }

    return response.json();
  }

  async geocode(address: string): Promise<z.infer<typeof GeocodeResponseSchema>> {
    const cacheKey = this.getCacheKey('geocode', { address });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest({
      service: 'geocode',
      address,
    });

    const validated = GeocodeResponseSchema.parse(data);
    this.setCache(cacheKey, validated);
    return validated;
  }

  async reverseGeocode(lat: number, lng: number): Promise<z.infer<typeof GeocodeResponseSchema>> {
    const cacheKey = this.getCacheKey('geocode', { latlng: `${lat},${lng}` });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const data = await this.makeRequest({
      service: 'geocode',
      latlng: `${lat},${lng}`,
    });

    const validated = GeocodeResponseSchema.parse(data);
    this.setCache(cacheKey, validated);
    return validated;
  }

  async searchPlaces(
    query: string, 
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<z.infer<typeof PlacesResponseSchema>> {
    const params = { query, location, radius };
    const cacheKey = this.getCacheKey('places', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const requestData: any = { service: 'places', query };
    if (location) {
      requestData.location = `${location.lat},${location.lng}`;
    }
    if (radius) {
      requestData.radius = radius;
    }

    const data = await this.makeRequest(requestData);
    const validated = PlacesResponseSchema.parse(data);
    this.setCache(cacheKey, validated);
    return validated;
  }

  async getDirections(
    origin: string,
    destination: string,
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit'
  ): Promise<z.infer<typeof DirectionsResponseSchema>> {
    const params = { origin, destination, mode };
    const cacheKey = this.getCacheKey('directions', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const requestData: any = { service: 'directions', origin, destination };
    if (mode) {
      requestData.mode = mode;
    }

    const data = await this.makeRequest(requestData);
    const validated = DirectionsResponseSchema.parse(data);
    this.setCache(cacheKey, validated);
    return validated;
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[],
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit'
  ): Promise<any> {
    const params = { origins, destinations, mode };
    const cacheKey = this.getCacheKey('distancematrix', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const requestData: any = { service: 'distancematrix', origins, destinations };
    if (mode) {
      requestData.mode = mode;
    }

    const data = await this.makeRequest(requestData);
    this.setCache(cacheKey, data);
    return data;
  }
}

// Export singleton instance
export const mapsProxy = GoogleMapsProxy.getInstance();