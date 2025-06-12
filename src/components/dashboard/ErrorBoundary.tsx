'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class DashboardErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Dashboard Error Boundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="w-full max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            Dashboard Error
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Something went wrong</AlertTitle>
                            <AlertDescription>
                                We're having trouble loading your dashboard data. This might be due to a temporary service issue.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Error details: {this.state.error?.message || 'Unknown error'}
                            </p>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    size="sm"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Reload Page
                                </Button>

                                <Button
                                    onClick={() => this.setState({ hasError: false })}
                                    variant="outline"
                                    size="sm"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}

// Hook-based error boundary for functional components
export function DashboardErrorFallback({
    error,
    resetError
}: {
    error: Error
    resetError: () => void
}) {
    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <h3 className="font-semibold">Unable to Load Data</h3>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                    We're experiencing some technical difficulties. Please try again in a moment.
                </p>

                <div className="flex gap-2">
                    <Button onClick={resetError} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}