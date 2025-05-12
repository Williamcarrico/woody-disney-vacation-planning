import { NextRequest, NextResponse } from 'next/server';
import { cache } from 'react';

// Mock historical data processing endpoint
// In a real application, this would fetch from a database or external API
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const attractionId = searchParams.get('attractionId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (!attractionId) {
            return NextResponse.json(
                { error: 'Attraction ID is required' },
                { status: 400 }
            );
        }

        // Mock data - in a real app, this would come from a database
        // Generate random wait times for each hour between start and end dates
        const mockData = generateMockHistoricalData(attractionId, startDate, endDate);

        return NextResponse.json(mockData);
    } catch (error) {
        console.error('Error processing historical data:', error);
        return NextResponse.json(
            { error: 'Failed to process historical data' },
            { status: 500 }
        );
    }
}

// Helper function to generate mock historical data
function generateMockHistoricalData(attractionId: string, startDate?: string | null, endDate?: string | null) {
    // Default to last 30 days if dates not provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const waitTimes = [];
    const current = new Date(start);

    // Base wait time depends on attraction popularity (using ID as a proxy)
    const attractionPopularity = parseInt(attractionId.substring(attractionId.length - 3), 16) % 100;
    const baseWaitTime = 15 + (attractionPopularity % 45); // 15-60 minute base wait

    while (current <= end) {
        const hour = current.getHours();
        const day = current.getDay(); // 0 = Sunday, 6 = Saturday

        // Wait times vary by hour and day
        let hourlyFactor = 1.0;

        // Peak hours (11am-2pm, 6pm-8pm)
        if ((hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 20)) {
            hourlyFactor = 1.5;
        }

        // Early morning and late evening have shorter waits
        if (hour < 10 || hour > 21) {
            hourlyFactor = 0.5;
        }

        // Weekends have longer waits
        let dayFactor = (day === 0 || day === 6) ? 1.3 : 1.0;

        // Add some randomness
        const randomFactor = 0.7 + (Math.random() * 0.6); // 0.7-1.3

        const waitTime = Math.round(baseWaitTime * hourlyFactor * dayFactor * randomFactor);

        waitTimes.push({
            timestamp: new Date(current).toISOString(),
            waitTime,
        });

        // Move to next hour
        current.setHours(current.getHours() + 1);
    }

    // Generate hourly averages
    const hourlyAverages: Record<string, number> = {};
    for (let h = 9; h <= 21; h++) {
        const hourData = waitTimes.filter(wt => new Date(wt.timestamp).getHours() === h);
        if (hourData.length > 0) {
            const sum = hourData.reduce((acc, curr) => acc + curr.waitTime, 0);
            hourlyAverages[h.toString()] = Math.round(sum / hourData.length);
        }
    }

    // Generate daily averages
    const dailyAverages: Record<string, number> = {};
    for (let d = 0; d <= 6; d++) {
        const dayData = waitTimes.filter(wt => new Date(wt.timestamp).getDay() === d);
        if (dayData.length > 0) {
            const sum = dayData.reduce((acc, curr) => acc + curr.waitTime, 0);
            dailyAverages[d.toString()] = Math.round(sum / dayData.length);
        }
    }

    return {
        attractionId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        waitTimes,
        averages: {
            overall: Math.round(waitTimes.reduce((acc, curr) => acc + curr.waitTime, 0) / waitTimes.length),
            hourly: hourlyAverages,
            daily: dailyAverages,
        },
    };
}