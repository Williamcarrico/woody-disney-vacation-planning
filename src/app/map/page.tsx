'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map component to avoid server-side rendering issues
const MapPage = dynamic(() => import('@/components/maps/pages/map-page').then(mod => mod.default), {
    ssr: false,
    loading: () => <MapLoading />
});

// Sample Disney World attractions and locations
const disneyLocations = [
    {
        position: { lat: 28.3852, lng: -81.5639 },
        title: 'Walt Disney World Resort',
        description: 'Main entrance and central hub'
    },
    {
        position: { lat: 28.4177, lng: -81.5812 },
        title: 'Magic Kingdom',
        description: 'Where dreams come true'
    },
    {
        position: { lat: 28.3747, lng: -81.5494 },
        title: 'EPCOT',
        description: 'Experimental Prototype Community of Tomorrow'
    },
    {
        position: { lat: 28.3559, lng: -81.5597 },
        title: 'Disney\'s Hollywood Studios',
        description: 'Movie magic comes to life'
    },
    {
        position: { lat: 28.3536, lng: -81.5904 },
        title: 'Disney\'s Animal Kingdom',
        description: 'Adventure and wildlife await'
    },
    {
        position: { lat: 28.3702, lng: -81.5462 },
        title: 'Disney Springs',
        description: 'Dining, shopping, and entertainment district'
    }
];

export default function MapRoute() {
    return (
        <div className="h-[calc(100vh-5rem)]">
            <Suspense fallback={<MapLoading />}>
                <MapPage
                    initialLocation={{ lat: 28.3852, lng: -81.5639 }}
                    locations={disneyLocations}
                    showSearch={true}
                />
            </Suspense>
        </div>
    );
}

// Loading skeleton for the map
function MapLoading() {
    return (
        <div className="h-full w-full flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="flex-1 rounded-md" />
            <Skeleton className="h-8 w-full" />
        </div>
    );
}