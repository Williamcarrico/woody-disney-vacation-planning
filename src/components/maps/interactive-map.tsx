'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Map,
    AdvancedMarker,
    useMap,
    useAdvancedMarkerRef,
    InfoWindow,
    Pin,
    MapControl
} from '@vis.gl/react-google-maps';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { MapSkeleton } from './skeletons/map-skeleton';

// Default Disney World coordinates (Magic Kingdom)
const DEFAULT_CENTER = { lat: 28.4177, lng: -81.5812 };
const DEFAULT_ZOOM = 14;

export interface LocationData {
    id: string;
    name: string;
    description?: string;
    lat: number;
    lng: number;
    type?: string;
    imageUrl?: string;
}

export interface InteractiveMapProps {
    className?: string;
    markers?: LocationData[];
    height?: string | number;
    width?: string | number;
    showSearch?: boolean;
    showUserLocation?: boolean;
    initialCenter?: { lat: number; lng: number };
    initialZoom?: number;
    mapId?: string;
}

/**
 * SearchBox component for the InteractiveMap
 */
function SearchBox() {
    const map = useMap();
    const [query, setQuery] = useState('');

    const handleSearch = async () => {
        if (!map || !query) return;

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
                const location = results[0].geometry.location;
                map.panTo({ lat: location.lat(), lng: location.lng() });
                map.setZoom(15);
            }
        });
    };

    return (
        <div className="absolute top-2 left-2 right-2 flex gap-2 max-w-96 z-10">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location..."
                className="bg-white/90"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button size="icon" variant="default" onClick={handleSearch}>
                <Search className="h-4 w-4" />
            </Button>
        </div>
    );
}

/**
 * UserLocationControl component for the InteractiveMap
 */
function UserLocationControl() {
    const map = useMap();

    const handleClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map?.panTo(userLocation);
                    map?.setZoom(15);
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        }
    };

    return (
        <MapControl position="RIGHT_BOTTOM">
            <Button
                variant="secondary"
                size="icon"
                className="m-2 bg-white hover:bg-gray-100"
                onClick={handleClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="1" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                    <line x1="12" y1="20" x2="12" y2="22" />
                    <line x1="4" y1="12" x2="2" y2="12" />
                    <line x1="22" y1="12" x2="20" y2="12" />
                </svg>
            </Button>
        </MapControl>
    );
}

/**
 * MarkerWithInfoWindow component for the InteractiveMap
 */
function MarkerWithInfoWindow({ location }: { location: LocationData }) {
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => setInfoWindowOpen(true)}
                title={location.name}
            >
                {location.type === 'attraction' ? (
                    <Image
                        src="/images/attraction-marker.svg"
                        alt={location.name}
                        width={32}
                        height={32}
                        className="cursor-pointer hover:scale-110 transition-transform"
                    />
                ) : (
                    <Pin
                        background={'#5387DA'}
                        glyphColor={'#FFFFFF'}
                        borderColor={'#3E67A6'}
                        scale={1.2}
                    />
                )}
            </AdvancedMarker>
            {infoWindowOpen && marker && (
                <InfoWindow
                    anchor={marker}
                    onCloseClick={() => setInfoWindowOpen(false)}
                    className="max-w-xs"
                >
                    <div>
                        <h3 className="font-bold text-lg">{location.name}</h3>
                        {location.description && (
                            <p className="mt-1 text-sm">{location.description}</p>
                        )}
                        {location.imageUrl && (
                            <div className="mt-2">
                                <Image
                                    src={location.imageUrl}
                                    alt={location.name}
                                    width={200}
                                    height={120}
                                    className="rounded-md object-cover"
                                />
                            </div>
                        )}
                    </div>
                </InfoWindow>
            )}
        </>
    );
}

/**
 * InteractiveMap component
 * A reusable Google Maps component with markers, search, and user location features
 */
export function InteractiveMap({
    className,
    markers = [],
    height = 500,
    width = '100%',
    showSearch = true,
    showUserLocation = true,
    initialCenter = DEFAULT_CENTER,
    initialZoom = DEFAULT_ZOOM,
    mapId
}: InteractiveMapProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!isLoaded) {
        return <MapSkeleton height={height} width={width} />;
    }

    return (
        <div style={{ height, width }} className={cn('relative rounded-lg overflow-hidden', className)}>
            <Map
                mapId={mapId || process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
                defaultCenter={initialCenter}
                defaultZoom={initialZoom}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
                mapTypeId={google.maps.MapTypeId.ROADMAP}
                mapTypeControl={true}
                zoomControl={true}
                streetViewControl={true}
                fullscreenControl={true}
                onLoad={(map) => {
                    mapRef.current = map;
                }}
                className="h-full w-full"
            >
                {showSearch && <SearchBox />}
                {showUserLocation && <UserLocationControl />}

                {markers.map((location) => (
                    <MarkerWithInfoWindow key={location.id} location={location} />
                ))}
            </Map>
        </div>
    );
}