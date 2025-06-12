import { NextRequest, NextResponse } from 'next/server'
import * as disneyAPI from '@/lib/services/disney-api'

interface RouteParams {
    params: Promise<{
        characterId: string
    }>
}

/**
 * GET /api/disney/characters/[characterId]
 *
 * Get detailed information about a specific Disney character
 */
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { characterId } = await params
        const id = parseInt(characterId)

        if (isNaN(id)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid character ID',
                    message: 'Character ID must be a number'
                },
                { status: 400 }
            )
        }

        const character = await disneyAPI.getCharacterById(id)

        // Enrich character data with additional information
        const enrichedCharacter = {
            ...character,
            metadata: {
                hasFilms: character.films.length > 0,
                hasShortFilms: character.shortFilms.length > 0,
                hasTvShows: character.tvShows.length > 0,
                hasVideoGames: character.videoGames.length > 0,
                hasParkAttractions: character.parkAttractions.length > 0,
                totalAppearances:
                    character.films.length +
                    character.shortFilms.length +
                    character.tvShows.length +
                    character.videoGames.length,
                relationshipCount: character.allies.length + character.enemies.length
            },
            // Add park-specific information for WDW attractions
            wdwAttractions: character.parkAttractions.filter(attraction =>
                // Filter for likely WDW attractions (this is a heuristic)
                !attraction.toLowerCase().includes('disneyland') &&
                !attraction.toLowerCase().includes('paris') &&
                !attraction.toLowerCase().includes('tokyo') &&
                !attraction.toLowerCase().includes('hong kong') &&
                !attraction.toLowerCase().includes('shanghai')
            )
        }

        return NextResponse.json({
            success: true,
            data: enrichedCharacter
        })

    } catch (error) {
        const { characterId } = await params
        console.error(`Error fetching character ${characterId}:`, error)

        if (error instanceof Error && error.message.includes('404')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Character not found',
                    message: `No character found with ID ${characterId}`
                },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch character details',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}