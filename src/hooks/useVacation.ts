/**
 * useVacation Hook
 * Sophisticated React hook for vacation data management with:
 * - React Query integration for caching and synchronization
 * - Optimistic updates for better UX
 * - Comprehensive error handling and retry logic
 * - Real-time data synchronization
 * - Performance monitoring and analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import {
    vacationService,
    type Vacation,
    type VacationUpdate,
    type VacationServiceResponse,
    VacationServiceError,
    VacationErrorCodes,
    formatVacationForDisplay,
    getRecommendedTicketType
} from '@/lib/firebase/vacation-service-enhanced'

// =============================================================================
// HOOK CONFIGURATION & TYPES
// =============================================================================

interface UseVacationOptions {
    enabled?: boolean
    refetchInterval?: number | false
    staleTime?: number
    gcTime?: number
    retry?: number | boolean
    retryDelay?: number
    onSuccess?: (data: Vacation) => void
    onError?: (error: VacationServiceError) => void
}

interface UseVacationResult {
    // Data
    vacation: Vacation | undefined
    formattedVacation: ReturnType<typeof formatVacationForDisplay> | undefined
    recommendedTicketType: string | undefined

    // Loading states
    isLoading: boolean
    isFetching: boolean
    isRefetching: boolean
    isStale: boolean

    // Error handling
    error: VacationServiceError | null
    isError: boolean

    // Actions
    refetch: () => Promise<unknown>
    invalidate: () => Promise<void>

    // Mutations
    updateVacation: (updates: VacationUpdate) => Promise<Vacation>
    archiveVacation: () => Promise<void>

    // Mutation states
    isUpdating: boolean
    isArchiving: boolean

    // Metadata
    metadata: {
        lastFetched: string | undefined
        cached: boolean
        requestId: string | undefined
        performance: {
            duration: number
            retryCount: number
        } | undefined
    }
}

// =============================================================================
// QUERY KEY FACTORY
// =============================================================================

const vacationKeys = {
    all: ['vacations'] as const,
    vacation: (id: string) => [...vacationKeys.all, 'vacation', id] as const,
    details: (id: string) => [...vacationKeys.vacation(id), 'details'] as const
}

// =============================================================================
// MAIN HOOK IMPLEMENTATION
// =============================================================================

export function useVacation(
    vacationId: string,
    options: UseVacationOptions = {}
): UseVacationResult {
    const queryClient = useQueryClient()

    // Destructure options with defaults
    const {
        enabled = true,
        refetchInterval = false,
        staleTime = 5 * 60 * 1000, // 5 minutes
        gcTime = 10 * 60 * 1000, // 10 minutes
        retry = 3,
        retryDelay = 1000,
        onSuccess,
        onError
    } = options

    // =============================================================================
    // MAIN QUERY
    // =============================================================================

    const {
        data: queryData,
        isLoading,
        isFetching,
        isRefetching,
        isStale,
        error: queryError,
        isError,
        refetch: queryRefetch
    } = useQuery({
        queryKey: vacationKeys.details(vacationId),
        queryFn: async (): Promise<VacationServiceResponse<Vacation>> => {
            const result = await vacationService.getVacation(vacationId)

            // Handle service-level errors
            if (!result.success && result.error) {
                throw result.error
            }

            return result
        },
        enabled: enabled && !!vacationId,
        refetchInterval,
        staleTime,
        gcTime,
        retry: (failureCount, error) => {
            // Don't retry on client errors (4xx)
            if (error instanceof VacationServiceError) {
                if (error.statusCode >= 400 && error.statusCode < 500) {
                    return false
                }
            }

            return typeof retry === 'boolean' ? retry : failureCount < retry
        },
        retryDelay: (attemptIndex) => {
            return Math.min(retryDelay * Math.pow(2, attemptIndex), 30000)
        }
    })

    // Handle success/error callbacks manually since they're not part of useQuery options in v5
    useMemo(() => {
        if (queryData?.success && queryData.data && onSuccess) {
            onSuccess(queryData.data)
        }
    }, [queryData, onSuccess])

    useMemo(() => {
        if (queryError && onError) {
            console.error('[useVacation] Query error:', queryError)

            if (queryError instanceof VacationServiceError) {
                onError(queryError)

                // Show user-friendly error messages
                switch (queryError.code) {
                    case VacationErrorCodes.NOT_FOUND:
                        toast.error('Vacation not found', {
                            description: 'The vacation you\'re looking for doesn\'t exist or has been removed.'
                        })
                        break
                    case VacationErrorCodes.UNAUTHORIZED:
                        toast.error('Authentication required', {
                            description: 'Please log in to view this vacation.'
                        })
                        break
                    case VacationErrorCodes.FORBIDDEN:
                        toast.error('Access denied', {
                            description: 'You don\'t have permission to view this vacation.'
                        })
                        break
                    case VacationErrorCodes.NETWORK_ERROR:
                        toast.error('Connection error', {
                            description: 'Please check your internet connection and try again.'
                        })
                        break
                    default:
                        toast.error('Failed to load vacation', {
                            description: queryError.message || 'An unexpected error occurred.'
                        })
                }
            }
        }
    }, [queryError, onError])

    // =============================================================================
    // UPDATE MUTATION
    // =============================================================================

    const updateMutation = useMutation({
        mutationFn: async (updates: VacationUpdate): Promise<Vacation> => {
            const result = await vacationService.updateVacation(vacationId, updates)

            if (!result.success || !result.data) {
                throw result.error || new VacationServiceError(
                    'Failed to update vacation',
                    VacationErrorCodes.SERVER_ERROR
                )
            }

            return result.data
        },
        onMutate: async (updates) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: vacationKeys.details(vacationId) })

            // Snapshot previous value
            const previousData = queryClient.getQueryData<VacationServiceResponse<Vacation>>(
                vacationKeys.details(vacationId)
            )

            // Optimistically update
            if (previousData?.success && previousData.data) {
                const optimisticData: VacationServiceResponse<Vacation> = {
                    ...previousData,
                    data: {
                        ...previousData.data,
                        ...updates,
                        updatedAt: new Date().toISOString()
                    }
                }

                queryClient.setQueryData(
                    vacationKeys.details(vacationId),
                    optimisticData
                )
            }

            return { previousData }
        },
        onError: (error, updates, context) => {
            // Rollback on error
            if (context?.previousData) {
                queryClient.setQueryData(
                    vacationKeys.details(vacationId),
                    context.previousData
                )
            }

            console.error('[useVacation] Update error:', error)

            if (error instanceof VacationServiceError) {
                toast.error('Failed to update vacation', {
                    description: error.message || 'Please try again.'
                })
            }
        },
        onSuccess: (updatedVacation) => {
            // Update cache with server response
            const newData: VacationServiceResponse<Vacation> = {
                success: true,
                data: updatedVacation,
                metadata: {
                    fetchedAt: new Date().toISOString(),
                    cached: false,
                    requestId: `update_${Date.now()}`,
                    performance: {
                        duration: 0,
                        retryCount: 0
                    }
                }
            }

            queryClient.setQueryData(vacationKeys.details(vacationId), newData)

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: vacationKeys.all })

            toast.success('Vacation updated successfully')
        }
    })

    // =============================================================================
    // ARCHIVE MUTATION
    // =============================================================================

    const archiveMutation = useMutation({
        mutationFn: async (): Promise<void> => {
            const result = await vacationService.archiveVacation(vacationId)

            if (!result.success) {
                throw result.error || new VacationServiceError(
                    'Failed to archive vacation',
                    VacationErrorCodes.SERVER_ERROR
                )
            }
        },
        onSuccess: () => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: vacationKeys.details(vacationId) })

            // Invalidate vacation lists
            queryClient.invalidateQueries({ queryKey: vacationKeys.all })

            toast.success('Vacation archived successfully')
        },
        onError: (error) => {
            console.error('[useVacation] Archive error:', error)

            if (error instanceof VacationServiceError) {
                toast.error('Failed to archive vacation', {
                    description: error.message || 'Please try again.'
                })
            }
        }
    })

    // =============================================================================
    // HELPER FUNCTIONS
    // =============================================================================

    const refetch = useCallback(async () => {
        return queryRefetch()
    }, [queryRefetch])

    const invalidate = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: vacationKeys.details(vacationId) })
    }, [queryClient, vacationId])

    const updateVacation = useCallback(async (updates: VacationUpdate): Promise<Vacation> => {
        return updateMutation.mutateAsync(updates)
    }, [updateMutation])

    const archiveVacation = useCallback(async (): Promise<void> => {
        return archiveMutation.mutateAsync()
    }, [archiveMutation])

    // =============================================================================
    // COMPUTED VALUES
    // =============================================================================

    const vacation = useMemo(() => {
        return queryData?.success ? queryData.data : undefined
    }, [queryData])

    const formattedVacation = useMemo(() => {
        return vacation ? formatVacationForDisplay(vacation) : undefined
    }, [vacation])

    const recommendedTicketType = useMemo(() => {
        return vacation ? getRecommendedTicketType(vacation) : undefined
    }, [vacation])

    const error = useMemo(() => {
        if (queryError instanceof VacationServiceError) {
            return queryError
        }
        if (queryError) {
            return new VacationServiceError(
                'An unexpected error occurred',
                VacationErrorCodes.SERVER_ERROR,
                500,
                { originalError: queryError }
            )
        }
        return null
    }, [queryError])

    const metadata = useMemo(() => ({
        lastFetched: queryData?.metadata?.fetchedAt,
        cached: queryData?.metadata?.cached || false,
        requestId: queryData?.metadata?.requestId,
        performance: queryData?.metadata?.performance
    }), [queryData])

    // =============================================================================
    // RETURN HOOK RESULT
    // =============================================================================

    return {
        // Data
        vacation,
        formattedVacation,
        recommendedTicketType,

        // Loading states
        isLoading,
        isFetching,
        isRefetching,
        isStale,

        // Error handling
        error,
        isError,

        // Actions
        refetch,
        invalidate,

        // Mutations
        updateVacation,
        archiveVacation,

        // Mutation states
        isUpdating: updateMutation.isPending,
        isArchiving: archiveMutation.isPending,

        // Metadata
        metadata
    }
}

// =============================================================================
// ADDITIONAL HOOKS FOR SPECIFIC USE CASES
// =============================================================================

/**
 * Hook for vacation data with automatic refetching
 */
export function useVacationWithRefresh(
    vacationId: string,
    refreshInterval: number = 30000 // 30 seconds
) {
    return useVacation(vacationId, {
        refetchInterval: refreshInterval,
        staleTime: refreshInterval / 2
    })
}

/**
 * Hook for vacation data with minimal caching (always fresh)
 */
export function useVacationFresh(vacationId: string) {
    return useVacation(vacationId, {
        staleTime: 0,
        gcTime: 0,
        refetchInterval: false
    })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Prefetches vacation data for better performance
 */
export function prefetchVacation(
    queryClient: ReturnType<typeof useQueryClient>,
    vacationId: string
) {
    return queryClient.prefetchQuery({
        queryKey: vacationKeys.details(vacationId),
        queryFn: () => vacationService.getVacation(vacationId),
        staleTime: 5 * 60 * 1000
    })
}

/**
 * Invalidates all vacation-related queries
 */
export function invalidateAllVacations(
    queryClient: ReturnType<typeof useQueryClient>
) {
    return queryClient.invalidateQueries({ queryKey: vacationKeys.all })
}