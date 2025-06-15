import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for different Google Maps API endpoints
const MapsRequestSchema = z.union([
  z.object({
    service: z.literal('geocode'),
    address: z.string().optional(),
    latlng: z.string().optional(),
  }),
  z.object({
    service: z.literal('places'),
    query: z.string(),
    location: z.string().optional(),
    radius: z.number().optional(),
  }),
  z.object({
    service: z.literal('directions'),
    origin: z.string(),
    destination: z.string(),
    mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).optional(),
  }),
  z.object({
    service: z.literal('distancematrix'),
    origins: z.array(z.string()),
    destinations: z.array(z.string()),
    mode: z.enum(['driving', 'walking', 'bicycling', 'transit']).optional(),
  }),
]);

// Get the API key from server-side environment variable
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Map service names to Google Maps API endpoints
const SERVICE_ENDPOINTS: Record<string, string> = {
  geocode: 'https://maps.googleapis.com/maps/api/geocode/json',
  places: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
  directions: 'https://maps.googleapis.com/maps/api/directions/json',
  distancematrix: 'https://maps.googleapis.com/maps/api/distancematrix/json',
};

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitCache.get(clientId);

  if (!clientData || now > clientData.resetTime) {
    rateLimitCache.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT) {
    return false;
  }

  clientData.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Get client identifier for rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'anonymous';

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = MapsRequestSchema.parse(body);

    // Get the appropriate endpoint
    const endpoint = SERVICE_ENDPOINTS[validatedData.service];
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Invalid service specified' },
        { status: 400 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams();
    params.append('key', GOOGLE_MAPS_API_KEY);

    // Add service-specific parameters
    switch (validatedData.service) {
      case 'geocode':
        if (validatedData.address) {
          params.append('address', validatedData.address);
        }
        if (validatedData.latlng) {
          params.append('latlng', validatedData.latlng);
        }
        break;

      case 'places':
        params.append('query', validatedData.query);
        if (validatedData.location) {
          params.append('location', validatedData.location);
        }
        if (validatedData.radius) {
          params.append('radius', validatedData.radius.toString());
        }
        break;

      case 'directions':
        params.append('origin', validatedData.origin);
        params.append('destination', validatedData.destination);
        if (validatedData.mode) {
          params.append('mode', validatedData.mode);
        }
        break;

      case 'distancematrix':
        params.append('origins', validatedData.origins.join('|'));
        params.append('destinations', validatedData.destinations.join('|'));
        if (validatedData.mode) {
          params.append('mode', validatedData.mode);
        }
        break;
    }

    // Make request to Google Maps API
    const response = await fetch(`${endpoint}?${params.toString()}`);
    const data = await response.json();

    // Check for API errors
    if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Maps API error:', data);
      return NextResponse.json(
        { error: 'Maps service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Return the response with cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

  } catch (error) {
    console.error('Maps proxy error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}