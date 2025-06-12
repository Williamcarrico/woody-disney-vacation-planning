import { NextRequest, NextResponse } from 'next/server'
import * as unifiedAPI from '@/lib/services/unified-disney-api'

/**
 * GET /api/unified/attractions/search
 *
 * Search for attractions across all parks with character associations
 *
 * Query parameters:
 * - q: Search query (required)
 * - includeCharacters: Include associated Disney characters (default: true)
 * - includeWaitTimes: Include current wait times (default: true)
 * - limit: Maximum number of results (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')
        const includeCharacters = searchParams.get('includeCharacters') !== 'false'
        const includeWaitTimes = searchParams.get('includeWaitTimes') !== 'false'
        const limit = Math.min(
            parseInt(searchParams.get('limit') || '10'),
            50
        )

        if (!query) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing search query',
                    message: 'Please provide a search query using the "q" parameter'
                },
                { status: 400 }
            )
        }

        // Search attractions with character data
        const searchResults = await unifiedAPI.searchAttractionsWithCharacters(query)

        // Limit results
        const limitedResults = searchResults.slice(0, limit)

        // Enhance results with additional data if needed
        const enhancedResults = await Promise.all(
            limitedResults.map(async (attraction) => {
                const result: any = {
                    id: attraction.id,
                    name: attraction.name,
                    slug: attraction.slug,
                    entityType: attraction.entityType,
                    parentId: attraction.parentId
                }

                if (includeCharacters) {
                    result.associatedCharacters = attraction.associatedCharacters
                    result.characterCount = attraction.associatedCharacters?.length || 0
                }

                if (includeWaitTimes && attraction.currentWaitTime) {
                    result.currentWaitTime = attraction.currentWaitTime
                }

                // Add any additional metadata
                result.metadata = {
                    description: attraction.description,
                    tips: attraction.tips,
                    bestTimes: attraction.bestTimes
                }

                return result
            })
        )

        // Group results by park
        const resultsByPark = enhancedResults.reduce((acc, attraction) => {
            // Determine park based on parentId (this is a simplified approach)
            let parkName = 'Unknown Park'
            if (attraction.parentId) {
                if (attraction.parentId.includes('75ea578a')) parkName = 'Magic Kingdom'
                else if (attraction.parentId.includes('47f90d2c')) parkName = 'EPCOT'
                else if (attraction.parentId.includes('288747d1')) parkName = 'Hollywood Studios'
                else if (attraction.parentId.includes('1c84a229')) parkName = 'Animal Kingdom'
            }

            if (!acc[parkName]) {
                acc[parkName] = []
            }
            acc[parkName].push(attraction)
            return acc
        }, {} as Record<string, any[]>)

        // Calculate search relevance statistics
        const statistics = {
            totalResults: searchResults.length,
            returnedResults: enhancedResults.length,
            resultsPerPark: Object.entries(resultsByPark).map(([park, attractions]) => ({
                park,
                count: attractions.length
            })),
            charactersFound: includeCharacters
                ? enhancedResults.reduce((sum, attr) => sum + (attr.characterCount || 0), 0)
                : null
        }

        return NextResponse.json({
            success: true,
            data: {
                query,
                results: enhancedResults,
                resultsByPark,
                statistics,
                metadata: {
                    limit,
                    includeCharacters,
                    includeWaitTimes,
                    searchedAt: new Date().toISOString()
                }
            }
        })

    } catch (error) {
        console.error('Error searching attractions:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search attractions',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
