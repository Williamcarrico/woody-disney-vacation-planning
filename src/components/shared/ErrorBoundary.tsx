'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{
        error: Error | null
        resetError: () => void
    }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo)
        this.setState({
            error,
            errorInfo,
        })
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />
            }

            return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
        }

        return this.props.children
    }
}

interface ErrorFallbackProps {
    error: Error | null
    resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
    const isNetworkError = error?.message.includes('Failed to fetch') ||
        error?.message.includes('Network error') ||
        error?.message.includes('timeout')

    return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        {isNetworkError ? (
                            <WifiOff className="h-6 w-6 text-red-600 dark:text-red-400" />
                        ) : (
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        )}
                    </div>
                    <CardTitle className="text-lg">
                        {isNetworkError ? 'Connection Issue' : 'Something went wrong'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {isNetworkError
                            ? 'Unable to connect to our services. Please check your internet connection.'
                            : 'An unexpected error occurred. Our team has been notified.'
                        }
                    </p>

                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="text-left mt-4">
                            <summary className="cursor-pointer text-sm font-medium">
                                Error Details (Development)
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                                {error.message}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-2 justify-center">
                        <Button onClick={resetError} size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>

                        {isNetworkError && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.reload()}
                            >
                                <Wifi className="h-4 w-4 mr-2" />
                                Reload Page
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Hook for functional components
export function useErrorHandler() {
    return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
        console.error('[useErrorHandler] Error caught:', error, errorInfo)

        // You could send this to an error reporting service here
        // Example: Sentry, LogRocket, etc.
    }, [])
}