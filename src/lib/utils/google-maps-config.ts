/**
 * Google Maps configuration validation and utilities
 */

interface GoogleMapsConfig {
    apiKey: string
    mapId: string
}

export function validateGoogleMapsConfig(): GoogleMapsConfig {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID

    if (!apiKey) {
        throw new Error(
            'Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable. ' +
            'Please add it to your .env.local file. ' +
            'See README.md for setup instructions.'
        )
    }

    if (!mapId) {
        throw new Error(
            'Missing NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID environment variable. ' +
            'Please add it to your .env.local file. ' +
            'See README.md for setup instructions.'
        )
    }

    return { apiKey, mapId }
}

export function isGoogleMapsAvailable(): boolean {
    return typeof window !== 'undefined' && typeof google !== 'undefined'
}

export function getGoogleMapsConfig(): GoogleMapsConfig | null {
    try {
        return validateGoogleMapsConfig()
    } catch {
        // Return null in production to allow graceful degradation
        return null
    }
}