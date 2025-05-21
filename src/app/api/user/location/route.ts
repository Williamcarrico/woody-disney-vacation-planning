import { NextRequest, NextResponse } from "next/server";

interface LocationUpdateBody {
    latitude: number;
    longitude: number;
    userId: string;
    userName: string;
    vacationId?: string;
    timestamp?: string;
}

/**
 * POST handler to update a user's location
 * In a real implementation, this would store the location in a database
 * and potentially notify other group members
 */
export async function POST(request: NextRequest) {
    try {
        const body: LocationUpdateBody = await request.json();

        // Validate required fields
        if (!body.latitude || !body.longitude || !body.userId || !body.userName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Ensure coordinates are valid
        if (
            isNaN(body.latitude) ||
            isNaN(body.longitude) ||
            body.latitude < -90 ||
            body.latitude > 90 ||
            body.longitude < -180 ||
            body.longitude > 180
        ) {
            return NextResponse.json(
                { error: 'Invalid coordinates' },
                { status: 400 }
            );
        }

        // In a real implementation, here we would:
        // 1. Store the location in a database or real-time service (Firebase, Supabase, etc.)
        // 2. Potentially send notifications to other group members
        // 3. Return the updated location data

        // For demo purposes, we'll just acknowledge the update
        return NextResponse.json({
            success: true,
            message: 'Location updated successfully',
            timestamp: new Date().toISOString(),
            data: {
                userId: body.userId,
                userName: body.userName,
                latitude: body.latitude,
                longitude: body.longitude,
                vacationId: body.vacationId
            }
        });
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json(
            { error: 'Failed to update location' },
            { status: 500 }
        );
    }
}

/**
 * GET handler to retrieve locations for a vacation group
 * In a real implementation, this would fetch from a database or real-time service
 */
export async function GET(request: NextRequest) {
    try {
        // Get vacation ID from query parameters
        const { searchParams } = new URL(request.url);
        const vacationId = searchParams.get('vacationId');

        // In a real implementation, here we would:
        // 1. Fetch location data for all users in the specified vacation group
        // 2. Return the data in a structured format

        // For demo purposes, we'll return mock data
        const mockLocations = [
            {
                userId: 'user-123',
                userName: 'Current User',
                latitude: 28.4177,
                longitude: -81.5812,
                lastUpdated: new Date().toISOString(),
                avatar: '/images/avatar.png'
            },
            {
                userId: 'user-456',
                userName: 'Mom',
                latitude: 28.4180,
                longitude: -81.5820,
                lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                avatar: null
            },
            {
                userId: 'user-789',
                userName: 'Dad',
                latitude: 28.4165,
                longitude: -81.5800,
                lastUpdated: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
                avatar: null
            }
        ];

        return NextResponse.json({
            success: true,
            data: mockLocations,
            vacationId: vacationId || 'default'
        });
    } catch (error) {
        console.error('Error retrieving locations:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve locations' },
            { status: 500 }
        );
    }
}