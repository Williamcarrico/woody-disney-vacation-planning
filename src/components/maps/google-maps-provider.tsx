'use client';

import React, { ReactNode, createContext, useContext } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface GoogleMapsContextValue {
    mapId: string;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({ mapId: '' });

export const useGoogleMapsContext = () => useContext(GoogleMapsContext);

interface GoogleMapsProviderProps {
    children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    // Get the Map ID from environment variables
    const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || '8f077a07a8eb2b6d';

    if (!apiKey) {
        console.error('Google Maps API key is missing. Please add it to your .env.local file.');
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                <h3 className="font-bold">Google Maps Error</h3>
                <p>API key is missing. Please check your environment configuration.</p>
            </div>
        );
    }

    return (
        <APIProvider
            apiKey={apiKey}
            libraries={['places', 'geometry']}
        >
            <GoogleMapsContext.Provider value={{ mapId }}>
                {children}
            </GoogleMapsContext.Provider>
        </APIProvider>
    );
}