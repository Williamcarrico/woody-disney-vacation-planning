'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface MapContextType {
    userLocation: GeolocationCoordinates | null
    locationError: string | null
    isLoadingLocation: boolean
    refreshLocation: () => void
}

interface MapProviderProps {
    children: React.ReactNode
    timeout?: number
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const useMap = () => {
    const context = useContext(MapContext)
    if (!context) {
        throw new Error('useMap must be used within MapProvider')
    }
    return context
}

export function MapProvider({
    children,
    timeout = 5000,
}: MapProviderProps) {
    const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(false)

    const getLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser')
            return
        }

        setIsLoadingLocation(true)
        setLocationError(null)

        const options = {
            enableHighAccuracy: true,
            timeout: timeout,
            maximumAge: 0
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation(position.coords)
                setIsLoadingLocation(false)
            },
            (error) => {
                let errorMessage = 'Failed to get your location'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied'
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable'
                        break
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out'
                        break
                }
                setLocationError(errorMessage)
                setIsLoadingLocation(false)
            },
            options
        )
    }, [timeout])

    const refreshLocation = useCallback(() => {
        getLocation()
    }, [getLocation])

    useEffect(() => {
        getLocation()
    }, [getLocation])

    return (
        <MapContext.Provider
            value={{
                userLocation,
                locationError,
                isLoadingLocation,
                refreshLocation,
            }}
        >
            {children}
        </MapContext.Provider>
    )
}