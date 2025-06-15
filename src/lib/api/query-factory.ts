import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import type { SharedQueryOptions } from '@/types/shared'

/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  total?: number
  error?: string
}

/**
 * Generic query hook factory
 * Creates reusable query hooks with consistent error handling and options
 */
export function createQueryHook<TData, TFilters = void>(
  queryKeyPrefix: string,
  fetcher: (filters?: TFilters) => Promise<TData>,
  defaultOptions?: Partial<SharedQueryOptions>
) {
  return function useGenericQuery(
    filters?: TFilters,
    options?: Partial<SharedQueryOptions>
  ): UseQueryResult<TData, Error> & { refetch: () => Promise<any> } {
    const queryKey = filters ? [queryKeyPrefix, filters] : [queryKeyPrefix]
    
    const queryOptions: UseQueryOptions<TData, Error> = {
      queryKey,
      queryFn: () => fetcher(filters),
      enabled: options?.enabled ?? defaultOptions?.enabled ?? true,
      refetchInterval: options?.refetchInterval ?? defaultOptions?.refetchInterval,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? defaultOptions?.refetchOnWindowFocus ?? false,
      staleTime: options?.staleTime ?? defaultOptions?.staleTime ?? 5 * 60 * 1000, // 5 minutes
      cacheTime: options?.cacheTime ?? defaultOptions?.cacheTime ?? 10 * 60 * 1000, // 10 minutes
      retry: options?.retry ?? defaultOptions?.retry ?? 3,
      onError: options?.onError ?? defaultOptions?.onError,
      onSuccess: options?.onSuccess ?? defaultOptions?.onSuccess,
    }

    const query = useQuery(queryOptions)

    return {
      ...query,
      refetch: query.refetch
    }
  }
}

/**
 * Create a fetcher function that handles API responses
 */
export function createApiFetcher<T, TFilters = void>(
  endpoint: string,
  buildParams?: (filters?: TFilters) => URLSearchParams
): (filters?: TFilters) => Promise<T> {
  return async (filters?: TFilters) => {
    const searchParams = buildParams ? buildParams(filters) : new URLSearchParams()
    const url = `${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    const response = await fetch(url)
    const data: ApiResponse<T> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch data')
    }

    return data.data
  }
} 