/**
 * Disney API Service (disneyapi.dev)
 * Provides access to Disney character data and related content
 */

import { cache } from 'react'

const BASE_URL = 'https://api.disneyapi.dev'
const GRAPHQL_URL = `${BASE_URL}/graphql`

// Cache configuration
const CACHE_TTL = {
    characters: 3600, // 1 hour
    character: 1800, // 30 minutes
}

// Runtime cache
const runtimeCache = new Map<string, { data: any; timestamp: number }>()

// Types
export interface DisneyCharacter {
    _id: number
    url: string
    name: string
    sourceUrl: string
    films: string[]
    shortFilms: string[]
    tvShows: string[]
    videoGames: string[]
    alignment?: string
    parkAttractions: string[]
    allies: string[]
    enemies: string[]
    imageUrl?: string
}

export interface CharacterListResponse {
    info: {
        totalPages: number
        count: number
        previousPage?: string
        nextPage?: string
    }
    data: DisneyCharacter[]
}

export interface CharacterResponse {
    info: {
        count: number
    }
    data: DisneyCharacter | DisneyCharacter[]
}

// Enhanced fetch with caching
async function fetchWithCache<T>(
    url: string,
    options?: RequestInit,
    ttl: number = 3600
): Promise<T> {
    const cacheKey = `${url}${JSON.stringify(options || {})}`
    const cached = runtimeCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < ttl * 1000) {
        return cached.data
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            next: { revalidate: ttl }
        })

        if (!response.ok) {
            throw new Error(`Disney API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        runtimeCache.set(cacheKey, { data, timestamp: Date.now() })
        return data
    } catch (error) {
        // Return cached data if available
        if (cached) {
            console.warn('Returning stale Disney API data due to error:', error)
            return cached.data
        }
        throw error
    }
}

/**
 * Get all characters with pagination
 */
export const getAllCharacters = cache(async (
    page: number = 1,
    pageSize: number = 50
): Promise<CharacterListResponse> => {
    const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
    })

    return fetchWithCache<CharacterListResponse>(
        `${BASE_URL}/character?${params}`,
        undefined,
        CACHE_TTL.characters
    )
})

/**
 * Get character by ID
 */
export const getCharacterById = cache(async (id: number): Promise<DisneyCharacter> => {
    const response = await fetchWithCache<CharacterResponse>(
        `${BASE_URL}/character/${id}`,
        undefined,
        CACHE_TTL.character
    )
    return response.data as DisneyCharacter
})

/**
 * Search characters by name
 */
export const searchCharactersByName = cache(async (name: string): Promise<DisneyCharacter[]> => {
    const params = new URLSearchParams({ name })
    const response = await fetchWithCache<CharacterResponse>(
        `${BASE_URL}/character?${params}`,
        undefined,
        CACHE_TTL.character
    )
    return Array.isArray(response.data) ? response.data : [response.data]
})

/**
 * Filter characters by various criteria
 */
export const filterCharacters = cache(async (filters: {
    name?: string
    films?: string
    tvShows?: string
    videoGames?: string
    parkAttractions?: string
    allies?: string
    enemies?: string
}): Promise<DisneyCharacter[]> => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
    })

    const response = await fetchWithCache<CharacterResponse>(
        `${BASE_URL}/character?${params}`,
        undefined,
        CACHE_TTL.character
    )
    return Array.isArray(response.data) ? response.data : [response.data]
})

/**
 * Get characters by park attraction
 */
export const getCharactersByParkAttraction = cache(async (
    attractionName: string
): Promise<DisneyCharacter[]> => {
    return filterCharacters({ parkAttractions: attractionName })
})

/**
 * GraphQL query for more complex character searches
 */
export const queryCharactersGraphQL = cache(async (
    filter?: {
        id?: number
        name?: string
        films?: string
        tvShows?: string
        parkAttractions?: string
    },
    page: number = 1,
    pageSize: number = 50
): Promise<{
    characters: {
        items: DisneyCharacter[]
        paginationInfo: {
            hasPreviousPage: boolean
            hasNextPage: boolean
            pageItemCount: number
            totalPages: number
        }
    }
}> => {
    const query = `
        query GetCharacters($page: Int, $pageSize: Int, $filter: CharacterFilterInput) {
            characters(page: $page, pageSize: $pageSize, filter: $filter) {
                items {
                    _id
                    name
                    imageUrl
                    films
                    shortFilms
                    tvShows
                    videoGames
                    parkAttractions
                    allies
                    enemies
                    url
                }
                paginationInfo {
                    hasPreviousPage
                    hasNextPage
                    pageItemCount
                    totalPages
                }
            }
        }
    `

    const variables = {
        page,
        pageSize,
        filter
    }

    const response = await fetchWithCache<any>(
        GRAPHQL_URL,
        {
            method: 'POST',
            body: JSON.stringify({ query, variables })
        },
        CACHE_TTL.characters
    )

    return response.data
})

/**
 * Get characters related to Walt Disney World attractions
 */
export const getWDWCharacters = cache(async (): Promise<DisneyCharacter[]> => {
    // Get characters from popular WDW attractions
    const attractions = [
        'Space Mountain',
        'Pirates of the Caribbean',
        'Haunted Mansion',
        'Jungle Cruise',
        'Splash Mountain',
        'Big Thunder Mountain Railroad',
        'Seven Dwarfs Mine Train',
        'Peter Pan\'s Flight',
        'It\'s a Small World',
        'Mickey\'s PhilharMagic'
    ]

    const characterPromises = attractions.map(attraction =>
        getCharactersByParkAttraction(attraction).catch(() => [])
    )

    const results = await Promise.all(characterPromises)
    const allCharacters = results.flat()

    // Remove duplicates
    const uniqueCharacters = Array.from(
        new Map(allCharacters.map(char => [char._id, char])).values()
    )

    return uniqueCharacters
})

/**
 * Clear the runtime cache
 */
export function clearDisneyAPICache() {
    runtimeCache.clear()
}

/**
 * Get cache statistics
 */
export function getDisneyAPICacheStats() {
    return {
        size: runtimeCache.size,
        entries: Array.from(runtimeCache.entries()).map(([key, value]) => ({
            key,
            age: Math.floor((Date.now() - value.timestamp) / 1000)
        }))
    }
}