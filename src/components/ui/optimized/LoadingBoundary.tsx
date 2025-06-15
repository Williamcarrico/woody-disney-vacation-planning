import React, { Suspense, ReactNode, ComponentType } from 'react'
import { ErrorBoundary, ErrorBoundaryPropsWithFallback } from 'react-error-boundary'
import { Loader2 } from 'lucide-react'

// Default loading component
export const DefaultLoader = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
)

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-muted rounded" style={{ width: `${85 - i * 10}%` }} />
    ))}
  </div>
)

// Error fallback component
const DefaultErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-destructive/10 rounded-lg">
    <div className="text-center space-y-4">
      <div className="text-destructive">
        <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
)

// Progressive loading states
export interface LoadingState {
  isLoading: boolean
  progress?: number
  message?: string
}

export const ProgressiveLoader = ({ state }: { state: LoadingState }) => {
  if (!state.isLoading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{state.message || 'Loading...'}</span>
      </div>
      {state.progress !== undefined && (
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Main loading boundary component
interface LoadingBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  suspenseEnabled?: boolean
  showErrorDetails?: boolean
}

export const LoadingBoundary = ({
  children,
  fallback,
  errorFallback: ErrorFallbackComponent = DefaultErrorFallback,
  onError,
  suspenseEnabled = true,
  showErrorDetails = process.env.NODE_ENV === 'development'
}: LoadingBoundaryProps) => {
  const errorBoundaryProps: Partial<ErrorBoundaryPropsWithFallback> = {
    FallbackComponent: ErrorFallbackComponent,
    onError: (error, errorInfo) => {
      console.error('Error caught by boundary:', error, errorInfo)
      onError?.(error, errorInfo)
    },
    onReset: () => {
      // Optionally clear any error state
      console.log('Error boundary reset')
    }
  }

  const content = (
    <ErrorBoundary {...errorBoundaryProps as ErrorBoundaryPropsWithFallback}>
      {children}
    </ErrorBoundary>
  )

  if (suspenseEnabled) {
    return (
      <Suspense fallback={fallback || <DefaultLoader />}>
        {content}
      </Suspense>
    )
  }

  return content
}

// HOC for adding loading boundary to components
export function withLoadingBoundary<P extends object>(
  Component: ComponentType<P>,
  loadingBoundaryProps?: Omit<LoadingBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <LoadingBoundary {...loadingBoundaryProps}>
      <Component {...props} />
    </LoadingBoundary>
  )

  WrappedComponent.displayName = `withLoadingBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Lazy loading with built-in error boundary
export function lazyWithBoundary<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  boundaryProps?: Omit<LoadingBoundaryProps, 'children'>
) {
  const LazyComponent = React.lazy(importFn)
  
  return (props: P) => (
    <LoadingBoundary {...boundaryProps}>
      <LazyComponent {...props} />
    </LoadingBoundary>
  )
}