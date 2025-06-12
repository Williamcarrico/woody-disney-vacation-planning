import { NextRequest, NextResponse } from 'next/server'
import * as disneyAPI from '@/lib/services/disney-api'

/**
 * GET /api/disney/characters
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 50)
 * - name: Search by character name
 * - parkAttraction: Filter by park attraction
 * - film: Filter by film
 * - tvShow: Filter by TV show
 * - graphql: Use GraphQL API (boolean)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '50')
        const name = searchParams.get('name')
        const parkAttraction = searchParams.get('parkAttraction')
        const film = searchParams.get('film')
        const tvShow = searchParams.get('tvShow')
        const useGraphQL = searchParams.get('graphql') === 'true'

        // Use GraphQL for complex queries
        if (useGraphQL || (name && (parkAttraction || film || tvShow))) {
            const filter: Record<string, string> = {}
            if (name) filter.name = name
            if (parkAttraction) filter.parkAttractions = parkAttraction
            if (film) filter.films = film
            if (tvShow) filter.tvShows = tvShow

            const result = await disneyAPI.queryCharactersGraphQL(filter, page, pageSize)

            return NextResponse.json({
                success: true,
                data: result.characters.items,
                pagination: {
                    ...result.characters.paginationInfo,
                    currentPage: page,
                    pageSize
                },
                source: 'graphql'
            })
        }

        // Special endpoint for WDW-specific characters
        if (parkAttraction === 'wdw' || searchParams.get('wdw') === 'true') {
            const wdwCharacters = await disneyAPI.getWDWCharacters()

            // Paginate results
            const startIndex = (page - 1) * pageSize
            const endIndex = startIndex + pageSize
            const paginatedCharacters = wdwCharacters.slice(startIndex, endIndex)

            return NextResponse.json({
                success: true,
                data: paginatedCharacters,
                pagination: {
                    currentPage: page,
                    pageSize,
                    totalItems: wdwCharacters.length,
                    totalPages: Math.ceil(wdwCharacters.length / pageSize),
                    hasNextPage: endIndex < wdwCharacters.length,
                    hasPreviousPage: page > 1
                },
                source: 'wdw-specific'
            })
        }

        // Search by name
        if (name) {
            const characters = await disneyAPI.searchCharactersByName(name)

            return NextResponse.json({
                success: true,
                data: characters,
                pagination: {
                    currentPage: 1,
                    pageSize: characters.length,
                    totalItems: characters.length,
                    totalPages: 1
                },
                source: 'name-search'
            })
        }

        // Filter by park attraction
        if (parkAttraction) {
            const characters = await disneyAPI.getCharactersByParkAttraction(parkAttraction)

            return NextResponse.json({
                success: true,
                data: characters,
                pagination: {
                    currentPage: 1,
                    pageSize: characters.length,
                    totalItems: characters.length,
                    totalPages: 1
                },
                source: 'attraction-filter'
            })
        }

        // Default: Get all characters with pagination
        const result = await disneyAPI.getAllCharacters(page, pageSize)

        return NextResponse.json({
            success: true,
            data: result.data,
            pagination: {
                currentPage: page,
                pageSize,
                totalPages: result.info.totalPages,
                totalItems: result.info.count * result.info.totalPages,
                hasNextPage: !!result.info.nextPage,
                hasPreviousPage: !!result.info.previousPage
            },
            source: 'all-characters'
        })

    } catch (error) {
        console.error('Error fetching Disney characters:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch Disney characters',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}