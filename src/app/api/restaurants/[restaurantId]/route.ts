import { NextRequest, NextResponse } from 'next/server'
import { allRestaurants, getRestaurantById } from '@/lib/data/restaurants'
import { getRestaurantStatus, getEstimatedWaitTime, getReservationDifficulty } from '@/lib/utils/restaurant'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
) {
    try {
        const { restaurantId } = await params
        const restaurant = getRestaurantById(restaurantId)

        if (!restaurant) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Restaurant not found',
                    message: `No restaurant found with ID: ${restaurantId}`
                },
                { status: 404 }
            )
        }

        // Get additional restaurant information
        const status = getRestaurantStatus(restaurant)
        const estimatedWaitTime = getEstimatedWaitTime(restaurant)
        const reservationDifficulty = getReservationDifficulty(restaurant)

        // Get similar restaurants (same cuisine type or location)
        const similarRestaurants = allRestaurants
            .filter(r =>
                r.id !== restaurant.id && (
                    r.cuisineTypes.some(cuisine => restaurant.cuisineTypes.includes(cuisine)) ||
                    r.location.parkId === restaurant.location.parkId
                )
            )
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, 6)

        // Get operating hours for the week
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const weeklyHours = daysOfWeek.map(day => ({
            day,
            hours: restaurant.operatingHours[day] || 'Closed'
        }))

        // Enhanced restaurant data
        const enhancedRestaurant = {
            ...restaurant,
            status,
            estimatedWaitTime,
            reservationDifficulty,
            weeklyHours,
            similarRestaurants: similarRestaurants.map(r => ({
                id: r.id,
                name: r.name,
                imageUrl: r.imageUrl,
                averageRating: r.averageRating,
                priceRange: r.priceRange,
                cuisineTypes: r.cuisineTypes.slice(0, 2),
                location: r.location,
                isPopular: r.isPopular
            }))
        }

        return NextResponse.json({
            success: true,
            data: enhancedRestaurant
        })

    } catch (error) {
        console.error('Error fetching restaurant details:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch restaurant details',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantId: string }> }
) {
    try {
        const { restaurantId } = await params
        const updates = await request.json()

        // In a real app, you would update the restaurant in your database
        // For now, we'll just return a success response
        console.log(`Updating restaurant ${restaurantId} with:`, updates)

        return NextResponse.json({
            success: true,
            message: 'Restaurant updated successfully',
            data: { id: restaurantId, ...updates }
        })

    } catch (error) {
        console.error('Error updating restaurant:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update restaurant',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}