import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { RealtimeWeatherResponse, ForecastResponse, WeatherLocation, TemperatureUnit } from '@/types/weather'
import { fetchRealtimeWeather, fetchWeatherForecast } from '@/lib/api/weather'
import { clientWeatherCache, generateCacheKey, CACHE_CONFIG } from '@/lib/api/weather-cache'

interface UseWeatherDataOptions {
    location: string | WeatherLocation
    units?: TemperatureUnit
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    cacheTime?: number
    retry?: number
    retryDelay?: number
    onError?: (error: Error) => void
    onSuccess?: (data: { realtime: RealtimeWeatherResponse; forecast: ForecastResponse }) => void
}

interface UseWeatherDataReturn {
    // Data
    realtime: RealtimeWeatherResponse | null
    forecast: ForecastResponse | null

    // Loading states
    isLoading: boolean
    isRealtimeLoading: boolean
    isForecastLoading: boolean
    isRefetching: boolean

    // Error states
    error: Error | null
    realtimeError: Error | null
    forecastError: Error | null

    // Cache information
    isStale: boolean
    lastUpdated: Date | null
    cacheHit: boolean

    // Actions
    refetch: () => Promise<void>
    invalidateCache: () => void
    warmCache: () => Promise<void>
}

export function useWeatherData({
    location,
    units = 'imperial',
    enabled = true,
    refetchInterval = 600000, // 10 minutes
    staleTime = CACHE_CONFIG.CLIENT_STALE_TIME,
    cacheTime = CACHE_CONFIG.CLIENT_CACHE_DURATION,
    retry = 3,
    retryDelay = 1000,
    onError,
    onSuccess
}: UseWeatherDataOptions): UseWeatherDataReturn {
    // State
    const [realtime, setRealtime] = useState<RealtimeWeatherResponse | null>(null)
    const [forecast, setForecast] = useState<ForecastResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isRealtimeLoading, setIsRealtimeLoading] = useState(false)
    const [isForecastLoading, setIsForecastLoading] = useState(false)
    const [isRefetching, setIsRefetching] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [realtimeError, setRealtimeError] = useState<Error | null>(null)
    const [forecastError, setForecastError] = useState<Error | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [cacheHit, setCacheHit] = useState(false)

    // Refs for cleanup and persistence
    const abortControllerRef = useRef<AbortController | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const retryCountRef = useRef(0)

    // Stable refs for callbacks to avoid infinite loops
    const onErrorRef = useRef(onError)
    const onSuccessRef = useRef(onSuccess)
    const lastUpdatedRef = useRef<Date | null>(null)
    const staleTimeRef = useRef(staleTime)

    // Update refs when values change
    useEffect(() => {
        onErrorRef.current = onError
    }, [onError])

    useEffect(() => {
        onSuccessRef.current = onSuccess
    }, [onSuccess])

    useEffect(() => {
        lastUpdatedRef.current = lastUpdated
    }, [lastUpdated])

    useEffect(() => {
        staleTimeRef.current = staleTime
    }, [staleTime])

    // Generate cache keys
    const locationStr = typeof location === 'string' ? location : `${location.lat},${location.lon}`
    const realtimeCacheKey = generateCacheKey.realtime(locationStr, units)
    const forecastCacheKey = generateCacheKey.forecast(locationStr, units)

    // Check if data is stale
    const isStale = useMemo(() => {
        if (!lastUpdated) return true
        return Date.now() - lastUpdated.getTime() > staleTime
    }, [lastUpdated, staleTime])

    // Fetch function with caching and retry logic
    const fetchWeatherData = useCallback(async (isBackground = false) => {
        if (!enabled) return

        // Cancel any ongoing requests
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        try {
            // Set loading states
            if (!isBackground) {
                setIsLoading(true)
                setError(null)
                setRealtimeError(null)
                setForecastError(null)
            } else {
                setIsRefetching(true)
            }

            // Check cache first - use current stale status at time of execution
            const currentIsStale = !lastUpdatedRef.current || (Date.now() - lastUpdatedRef.current.getTime() > staleTimeRef.current)
            const cachedRealtime = clientWeatherCache.get<RealtimeWeatherResponse>(realtimeCacheKey)
            const cachedForecast = clientWeatherCache.get<ForecastResponse>(forecastCacheKey)

            if (cachedRealtime && cachedForecast && !currentIsStale) {
                setRealtime(cachedRealtime)
                setForecast(cachedForecast)
                setCacheHit(true)
                setLastUpdated(new Date())
                retryCountRef.current = 0

                if (onSuccessRef.current) {
                    onSuccessRef.current({ realtime: cachedRealtime, forecast: cachedForecast })
                }

                return
            }

            setCacheHit(false)

            // Fetch new data
            setIsRealtimeLoading(true)
            setIsForecastLoading(true)

            const [realtimeData, forecastData] = await Promise.allSettled([
                fetchRealtimeWeather(location, units),
                fetchWeatherForecast(location, units)
            ])

            // Handle realtime data
            if (realtimeData.status === 'fulfilled') {
                setRealtime(realtimeData.value)
                setRealtimeError(null)
                // Cache the data
                clientWeatherCache.set(realtimeCacheKey, realtimeData.value, locationStr, units, cacheTime)
            } else {
                setRealtimeError(realtimeData.reason)
                // Use cached data if available
                if (cachedRealtime) {
                    setRealtime(cachedRealtime)
                }
            }

            // Handle forecast data
            if (forecastData.status === 'fulfilled') {
                setForecast(forecastData.value)
                setForecastError(null)
                // Cache the data
                clientWeatherCache.set(forecastCacheKey, forecastData.value, locationStr, units, cacheTime)
            } else {
                setForecastError(forecastData.reason)
                // Use cached data if available
                if (cachedForecast) {
                    setForecast(cachedForecast)
                }
            }

            // Handle success/error callbacks
            if (realtimeData.status === 'fulfilled' && forecastData.status === 'fulfilled') {
                setError(null)
                setLastUpdated(new Date())
                retryCountRef.current = 0

                if (onSuccessRef.current) {
                    onSuccessRef.current({ realtime: realtimeData.value, forecast: forecastData.value })
                }
            } else {
                // Set combined error if both failed
                const combinedError = new Error(
                    `Weather fetch failed: ${[
                        realtimeData.status === 'rejected' ? `Realtime: ${realtimeData.reason.message}` : null,
                        forecastData.status === 'rejected' ? `Forecast: ${forecastData.reason.message}` : null
                    ].filter(Boolean).join(', ')}`
                )

                setError(combinedError)

                // Retry logic
                if (retryCountRef.current < retry) {
                    retryCountRef.current++
                    setTimeout(() => {
                        if (!signal.aborted) {
                            fetchWeatherData(isBackground)
                        }
                    }, retryDelay * Math.pow(2, retryCountRef.current - 1)) // Exponential backoff
                    return
                }

                if (onErrorRef.current) {
                    onErrorRef.current(combinedError)
                }
            }

        } catch (fetchError) {
            if (signal.aborted) return

            const error = fetchError instanceof Error ? fetchError : new Error('Unknown error occurred')
            setError(error)

            // Retry logic
            if (retryCountRef.current < retry) {
                retryCountRef.current++
                setTimeout(() => {
                    if (!signal.aborted) {
                        fetchWeatherData(isBackground)
                    }
                }, retryDelay * Math.pow(2, retryCountRef.current - 1))
                return
            }

            if (onErrorRef.current) {
                onErrorRef.current(error)
            }
        } finally {
            setIsLoading(false)
            setIsRealtimeLoading(false)
            setIsForecastLoading(false)
            setIsRefetching(false)
        }
    }, [
        enabled, location, units, realtimeCacheKey, forecastCacheKey, locationStr,
        cacheTime, retry, retryDelay
    ]) // Removed lastUpdated and staleTime from dependencies

    // Manual refetch function
    const refetch = useCallback(async () => {
        await fetchWeatherData(false)
    }, [fetchWeatherData])

    // Cache invalidation
    const invalidateCache = useCallback(() => {
        clientWeatherCache.invalidate(locationStr)
        setLastUpdated(null)
        setCacheHit(false)
    }, [locationStr])

    // Cache warming
    const warmCache = useCallback(async () => {
        await fetchWeatherData(true)
    }, [fetchWeatherData])

    // Initial fetch and location change effect
    useEffect(() => {
        fetchWeatherData(false)

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [fetchWeatherData])

    // Background refetch interval
    useEffect(() => {
        if (!enabled || !refetchInterval) return

        intervalRef.current = setInterval(() => {
            // Check staleness at execution time to avoid dependency issues
            const currentIsStale = !lastUpdatedRef.current || (Date.now() - lastUpdatedRef.current.getTime() > staleTimeRef.current)
            if (currentIsStale) {
                fetchWeatherData(true) // Background fetch
            }
        }, refetchInterval)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [enabled, refetchInterval, fetchWeatherData]) // Removed lastUpdated and staleTime from dependencies

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    return {
        // Data
        realtime,
        forecast,

        // Loading states
        isLoading,
        isRealtimeLoading,
        isForecastLoading,
        isRefetching,

        // Error states
        error,
        realtimeError,
        forecastError,

        // Cache information
        isStale,
        lastUpdated,
        cacheHit,

        // Actions
        refetch,
        invalidateCache,
        warmCache,
    }
}