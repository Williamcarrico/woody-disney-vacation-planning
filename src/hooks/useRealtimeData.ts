import { useState, useEffect, useRef } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    limit,
    Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface WaitTime {
    attractionId: string
    currentWait: number
    lightningLane: boolean
    status: 'operating' | 'down' | 'delayed'
    lastUpdated: string
}

interface ParkData {
    parkId: string
    isOpen: boolean
    currentCapacity: number
    waitTimes: WaitTime[]
    crowdLevel: number
    weather: {
        condition: string
        temperature: number
        humidity: number
    }
    lastUpdated: string
}

export function useRealtimeData(parkId?: string) {
    const [parkData, setParkData] = useState<ParkData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    // Use refs to track subscriptions and prevent zombie listeners
    const unsubscribeRef = useRef<Unsubscribe | null>(null)
    const isMountedRef = useRef(true)

    useEffect(() => {
        // Reset mounted flag
        isMountedRef.current = true
        
        // Clean up any existing subscription
        if (unsubscribeRef.current) {
            unsubscribeRef.current()
            unsubscribeRef.current = null
        }

        const parkDataRef = collection(db, 'parkData')
        let q = query(
            parkDataRef,
            orderBy('lastUpdated', 'desc'),
            limit(10)
        )

        // Filter by specific park if provided
        if (parkId) {
            q = query(
                parkDataRef,
                where('parkId', '==', parkId),
                orderBy('lastUpdated', 'desc'),
                limit(1)
            )
        }

        unsubscribeRef.current = onSnapshot(
            q,
            (snapshot) => {
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as ParkData[]

                    setParkData(data)
                    setIsLoading(false)
                    setError(null)
                }
            },
            (err) => {
                // Only update state if component is still mounted
                if (isMountedRef.current) {
                    console.error('Error fetching realtime park data:', err)
                    setError('Failed to load park data')
                    setIsLoading(false)
                }
            }
        )

        return () => {
            isMountedRef.current = false
            if (unsubscribeRef.current) {
                unsubscribeRef.current()
                unsubscribeRef.current = null
            }
        }
    }, [parkId])

    // Get specific park data
    const getParkData = (id: string) => {
        return parkData.find(park => park.parkId === id)
    }

    // Get current wait times for a park
    const getWaitTimes = (id: string) => {
        const park = getParkData(id)
        return park?.waitTimes || []
    }

    // Get crowd level for a park
    const getCrowdLevel = (id: string) => {
        const park = getParkData(id)
        return park?.crowdLevel || 0
    }

    return {
        parkData,
        isLoading,
        error,
        getParkData,
        getWaitTimes,
        getCrowdLevel
    }
}