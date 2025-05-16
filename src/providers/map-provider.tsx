'use client';

import { ReactNode } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface MapProviderProps {
    readonly children: ReactNode;
}

/**
 * MapProvider component that initializes the Google Maps API
 * Wraps child components with the Google Maps API context
 */
export function MapProvider(props: Readonly<MapProviderProps>) {
    const { children } = props;
    return (
        <APIProvider
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
            libraries={['places', 'geometry', 'drawing']}
            onLoad={() => console.log('Google Maps API loaded successfully')}
            onError={(error) => console.error('Google Maps API error:', error)}
        >
            {children}
        </APIProvider>
    );
}

export default MapProvider;