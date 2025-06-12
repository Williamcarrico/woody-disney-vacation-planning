import { NextRequest, NextResponse } from 'next/server'
import { parksService } from '@/lib/firebase/parks-service'

interface RouteParams {
    params: {
        parkId: string
    }
}

/**
 * GET /api/parks/[parkId]/stats
 * Returns statistics for a specific Disney park
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { parkId } = params

        if (!parkId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Park ID is required'
                },
                { status: 400 }
            )
        }

        const stats = await parksService.getParkStats(parkId)

        if (!stats) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Park not found'
                },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error('Error fetching park stats:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch park stats'
            },
            { status: 500 }
        )
    }
}