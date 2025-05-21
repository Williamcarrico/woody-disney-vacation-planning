'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { WeatherLocation } from '@/types/weather'

interface LocationSearchProps {
    defaultLocation?: string
    onLocationSelect: (location: string | WeatherLocation) => void
    className?: string
}

function LocationSearch({
    defaultLocation = '',
    onLocationSelect,
    className
}: LocationSearchProps) {
    const [query, setQuery] = useState<string>(defaultLocation)
    const [isSearching, setIsSearching] = useState<boolean>(false)
    const inputRef = useRef<HTMLInputElement>(null)

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onLocationSelect(query.trim())
            setIsSearching(false)
        }
    }

    // Use browser geolocation API
    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: WeatherLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                }
                onLocationSelect(location)
                setQuery(`${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`)
                setIsSearching(false)
            },
            (error) => {
                console.error('Error getting location:', error)
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        )
    }

    // Handle clicking outside to close search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsSearching(false)
            }
        }

        if (isSearching) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isSearching])

    // Focuses input when search is opened
    useEffect(() => {
        if (isSearching && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isSearching])

    if (!isSearching) {
        return (
            <div className={cn('flex items-center justify-between', className)}>
                <div
                    className="flex items-center cursor-pointer text-sm"
                    onClick={() => setIsSearching(true)}
                >
                    <span className="material-icons-outlined text-lg mr-1">place</span>
                    <span className="truncate max-w-[150px]">{query || 'Search location'}</span>
                </div>

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleGetCurrentLocation}
                    className="h-7 w-7"
                    title="Use current location"
                >
                    <span className="material-icons-outlined text-sm">my_location</span>
                </Button>
            </div>
        )
    }

    return (
        <div className={cn('relative', className)}>
            <form onSubmit={handleSubmit} className="flex items-center gap-1">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="City name, Zip code, or Coordinates"
                    className="text-sm h-8"
                />

                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleGetCurrentLocation}
                    className="h-8 w-8 flex-shrink-0"
                    title="Use current location"
                >
                    <span className="material-icons-outlined text-sm">my_location</span>
                </Button>

                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    title="Search"
                >
                    <span className="material-icons-outlined text-sm">search</span>
                </Button>
            </form>
        </div>
    )
}

export default LocationSearch