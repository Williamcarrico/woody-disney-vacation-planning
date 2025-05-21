import { NextRequest, NextResponse } from "next/server";

// Types for the response
interface WaitTimeResponse {
  attractionId: string;
  waitTime: number;
  status: 'OPERATING' | 'DOWN' | 'CLOSED' | 'REFURBISHMENT';
  lastUpdated: string;
}

// Mock data for simulating wait times
const mockWaitTimeData: Record<string, WaitTimeResponse> = {
  'space-mountain': {
    attractionId: 'space-mountain',
    waitTime: 45,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'splash-mountain': {
    attractionId: 'splash-mountain',
    waitTime: 60,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'pirates-of-the-caribbean': {
    attractionId: 'pirates-of-the-caribbean',
    waitTime: 20,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'haunted-mansion': {
    attractionId: 'haunted-mansion',
    waitTime: 30,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'seven-dwarfs-mine-train': {
    attractionId: 'seven-dwarfs-mine-train',
    waitTime: 75,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'jungle-cruise': {
    attractionId: 'jungle-cruise',
    waitTime: 40,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'big-thunder-mountain': {
    attractionId: 'big-thunder-mountain',
    waitTime: 35,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'its-a-small-world': {
    attractionId: 'its-a-small-world',
    waitTime: 15,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'peter-pans-flight': {
    attractionId: 'peter-pans-flight',
    waitTime: 50,
    status: 'OPERATING',
    lastUpdated: new Date().toISOString()
  },
  'test-track': {
    attractionId: 'test-track',
    waitTime: 0,
    status: 'DOWN',
    lastUpdated: new Date().toISOString()
  }
};

// Helper function to generate random fluctuations in wait times
function getRandomizedWaitTime(baseTime: number): number {
  const fluctuation = Math.floor(Math.random() * 15) - 5; // -5 to +10 minutes
  return Math.max(0, baseTime + fluctuation);
}

// GET handler for a specific attraction's wait time
export async function GET(
  request: NextRequest,
  { params }: { params: { attractionId: string } }
) {
  const { attractionId } = params;

  // Check if we have data for this attraction
  if (mockWaitTimeData[attractionId]) {
    // Update the wait time with a random fluctuation
    const data = { ...mockWaitTimeData[attractionId] };

    // Only update if the attraction is operating
    if (data.status === 'OPERATING') {
      data.waitTime = getRandomizedWaitTime(data.waitTime);
    }

    data.lastUpdated = new Date().toISOString();

    return NextResponse.json(data);
  }

  // Return a 404 if the attraction wasn't found
  return NextResponse.json(
    { error: 'Attraction not found' },
    { status: 404 }
  );
}

// GET handler for all wait times (used by the map)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parkId } = body;

    // In a real implementation, we would filter attractions by park
    // For this demo, we'll just return all wait times

    // Create a response with all wait times, adding some randomness
    const response: Record<string, WaitTimeResponse> = {};

    Object.entries(mockWaitTimeData).forEach(([id, data]) => {
      const newData = { ...data };

      // Add some randomization to wait times for operating attractions
      if (newData.status === 'OPERATING') {
        newData.waitTime = getRandomizedWaitTime(newData.waitTime);
      }

      // Randomly set some attractions to be temporarily down (5% chance)
      if (Math.random() < 0.05 && newData.status === 'OPERATING') {
        newData.status = 'DOWN';
        newData.waitTime = 0;
      }

      newData.lastUpdated = new Date().toISOString();
      response[id] = newData;
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing wait times request:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wait times' },
      { status: 500 }
    );
  }
}