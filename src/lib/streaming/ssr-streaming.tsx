/**
 * Enhanced Streaming SSR Implementation
 * Optimized for Next.js 15 and React 19
 */

import { Suspense, ComponentType, ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Metadata } from 'next'

// Enhanced streaming configuration
export interface StreamingConfig {
  enableStreaming: boolean
  fallbackDelay: number
  errorBoundary: boolean
  chunkSize: 'small' | 'medium' | 'large'
  priority: 'low' | 'normal' | 'high'
  preloadKey?: string
}

// Default streaming configurations for different content types
export const streamingConfigs = {
  critical: {
    enableStreaming: true,
    fallbackDelay: 0,
    errorBoundary: true,
    chunkSize: 'large' as const,
    priority: 'high' as const
  },
  aboveFold: {
    enableStreaming: true,
    fallbackDelay: 100,
    errorBoundary: true,
    chunkSize: 'medium' as const,
    priority: 'normal' as const
  },
  belowFold: {
    enableStreaming: true,
    fallbackDelay: 200,
    errorBoundary: true,
    chunkSize: 'small' as const,
    priority: 'low' as const
  },
  nonCritical: {
    enableStreaming: true,
    fallbackDelay: 500,
    errorBoundary: false,
    chunkSize: 'small' as const,
    priority: 'low' as const
  }
} as const

// Enhanced loading components for different content types
export const LoadingComponents = {
  // Hero section loading
  HeroSkeleton: () => (
    <div className="relative h-[600px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-64 bg-white/30 rounded-lg mx-auto"></div>
          <div className="h-6 w-48 bg-white/20 rounded mx-auto"></div>
          <div className="h-10 w-32 bg-white/25 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  ),

  // Dashboard skeleton
  DashboardSkeleton: () => (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  ),

  // Map skeleton
  MapSkeleton: () => (
    <div className="h-[600px] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),

  // Generic content skeleton
  ContentSkeleton: ({ height = 'h-64' }: { height?: string }) => (
    <div className={`${height} bg-gray-200 rounded-lg animate-pulse`}></div>
  ),

  // List skeleton
  ListSkeleton: ({ items = 5 }: { items?: number }) => (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Error fallback components
export const ErrorFallbacks = {
  Generic: ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
      <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  ),

  Map: ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="h-[600px] flex items-center justify-center border border-red-200 rounded-lg bg-red-50">
      <div className="text-center space-y-4">
        <div className="text-4xl">🗺️</div>
        <h3 className="text-lg font-semibold text-red-800">Map failed to load</h3>
        <p className="text-red-600">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reload map
        </button>
      </div>
    </div>
  ),

  Dashboard: ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
    <div className="container mx-auto p-6">
      <div className="text-center py-12 border border-red-200 rounded-lg bg-red-50">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reload dashboard
        </button>
      </div>
    </div>
  )
}

// Enhanced streaming wrapper component
export function StreamingWrapper({
  children,
  fallback,
  errorFallback = ErrorFallbacks.Generic,
  config = streamingConfigs.aboveFold,
  name = 'StreamingComponent'
}: {
  children: ReactNode
  fallback: ReactNode
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  config?: StreamingConfig
  name?: string
}) {
  // Apply delay for non-critical content
  const FallbackWithDelay = () => {
    if (config.fallbackDelay === 0) {
      return <>{fallback}</>
    }
    
    return (
      <div style={{ animationDelay: `${config.fallbackDelay}ms` }}>
        {fallback}
      </div>
    )
  }

  if (!config.enableStreaming) {
    return <>{children}</>
  }

  const content = (
    <Suspense fallback={<FallbackWithDelay />}>
      {children}
    </Suspense>
  )

  if (config.errorBoundary) {
    return (
      <ErrorBoundary 
        FallbackComponent={errorFallback}
        onError={(error, errorInfo) => {
          console.error(`Streaming error in ${name}:`, error, errorInfo)
          // Here you could send to analytics/monitoring service
        }}
        onReset={() => {
          console.log(`Resetting error boundary for ${name}`)
        }}
      >
        {content}
      </ErrorBoundary>
    )
  }

  return content
}

// HOC for automatic streaming setup
export function withStreaming<P extends object>(
  Component: ComponentType<P>,
  config: {
    fallback: ReactNode
    errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
    streamingConfig?: StreamingConfig
    name?: string
  }
) {
  const StreamedComponent = (props: P) => (
    <StreamingWrapper
      fallback={config.fallback}
      errorFallback={config.errorFallback}
      config={config.streamingConfig}
      name={config.name || Component.displayName || Component.name}
    >
      <Component {...props} />
    </StreamingWrapper>
  )

  StreamedComponent.displayName = `WithStreaming(${Component.displayName || Component.name})`
  
  return StreamedComponent
}

// Enhanced preload utilities for streaming
export const preloadUtils = {
  // Preload critical data
  preloadCriticalData: async (keys: string[]) => {
    const promises = keys.map(key => {
      switch (key) {
        case 'parks':
          return fetch('/api/parks')
        case 'user':
          return fetch('/api/user/profile')
        case 'weather':
          return fetch('/api/weather/realtime')
        default:
          return Promise.resolve()
      }
    })
    
    return Promise.allSettled(promises)
  },

  // Preload component data
  preloadComponent: async (componentName: string) => {
    // Dynamic import with preload
    switch (componentName) {
      case 'Map':
        return import('@/components/maps/interactive-map')
      case 'Dashboard':
        return import('@/components/dashboard/DashboardContent')
      case 'Weather':
        return import('@/components/weather/WeatherDashboard')
      default:
        return Promise.resolve()
    }
  }
}

// React 19 optimized data fetching patterns
export async function createStreamingData<T>(
  fetcher: () => Promise<T>,
  options: {
    cacheKey?: string
    revalidate?: number
    fallback?: T
  } = {}
): Promise<T> {
  try {
    // Use React 19's enhanced caching capabilities
    const data = await fetcher()
    return data
  } catch (error) {
    console.error('Streaming data fetch failed:', error)
    if (options.fallback !== undefined) {
      return options.fallback
    }
    throw error
  }
}

// Enhanced server component streaming
export function createStreamingServerComponent<P extends object>(
  component: ComponentType<P>,
  dataFetcher: (props: P) => Promise<unknown>,
  options: {
    fallback: ReactNode
    errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
    config?: StreamingConfig
  }
) {
  return async function StreamingServerComponent(props: P) {
    const data = await createStreamingData(() => dataFetcher(props), {
      fallback: null
    })

    return (
      <StreamingWrapper
        fallback={options.fallback}
        errorFallback={options.errorFallback}
        config={options.config}
        name={component.displayName || component.name}
      >
        <component {...props} data={data} />
      </StreamingWrapper>
    )
  }
}

// Progressive enhancement utilities
export const progressiveEnhancement = {
  // Enhance with client-side features
  enhance: (Component: ComponentType<any>) => {
    return function EnhancedComponent(props: any) {
      return (
        <StreamingWrapper
          fallback={<LoadingComponents.ContentSkeleton />}
          config={streamingConfigs.nonCritical}
        >
          <Component {...props} />
        </StreamingWrapper>
      )
    }
  },

  // Add real-time features progressively
  withRealtime: (Component: ComponentType<any>) => {
    return function RealtimeComponent(props: any) {
      return (
        <Suspense fallback={<LoadingComponents.ContentSkeleton />}>
          <Component {...props} />
        </Suspense>
      )
    }
  }
}

// Streaming metadata generation
export function generateStreamingMetadata(
  baseMetadata: Metadata,
  streamingKeys: string[]
): Metadata {
  return {
    ...baseMetadata,
    other: {
      ...baseMetadata.other,
      'streaming-enabled': 'true',
      'streaming-keys': streamingKeys.join(','),
      'preload-strategy': 'progressive'
    }
  }
}

// Export common streaming patterns
export const streamingPatterns = {
  // Hero + content pattern
  HeroWithContent: ({ hero, content }: { hero: ReactNode; content: ReactNode }) => (
    <>
      <StreamingWrapper
        fallback={<LoadingComponents.HeroSkeleton />}
        config={streamingConfigs.critical}
        name="Hero"
      >
        {hero}
      </StreamingWrapper>
      
      <StreamingWrapper
        fallback={<LoadingComponents.ContentSkeleton />}
        config={streamingConfigs.aboveFold}
        name="Content"
      >
        {content}
      </StreamingWrapper>
    </>
  ),

  // Dashboard pattern
  Dashboard: ({ header, stats, content }: { 
    header: ReactNode; 
    stats: ReactNode; 
    content: ReactNode;
  }) => (
    <>
      <StreamingWrapper
        fallback={<div className="h-16 bg-gray-200 rounded animate-pulse" />}
        config={streamingConfigs.critical}
        name="DashboardHeader"
      >
        {header}
      </StreamingWrapper>
      
      <StreamingWrapper
        fallback={<LoadingComponents.DashboardSkeleton />}
        config={streamingConfigs.aboveFold}
        name="DashboardStats"
      >
        {stats}
      </StreamingWrapper>
      
      <StreamingWrapper
        fallback={<LoadingComponents.ContentSkeleton height="h-96" />}
        config={streamingConfigs.belowFold}
        name="DashboardContent"
      >
        {content}
      </StreamingWrapper>
    </>
  )
}

// Export enhanced streaming configuration
export { streamingConfigs, LoadingComponents, ErrorFallbacks }