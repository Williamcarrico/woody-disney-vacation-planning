'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class MapErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Map Error Boundary caught error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error.toString(),
        fatal: false,
      });
    }

    // Increment error count
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
    }));
  }

  handleReset = () => {
    this.retryCount++;
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error, errorCount } = this.state;
      const isMapError = error?.message?.toLowerCase().includes('google') || 
                        error?.message?.toLowerCase().includes('map');
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div className={cn('p-4', this.props.className)}>
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>
                  {isMapError ? 'Map Loading Error' : 'Something went wrong'}
                </CardTitle>
              </div>
              <CardDescription>
                {isMapError 
                  ? 'The map failed to load. This might be due to network issues or API restrictions.'
                  : 'An unexpected error occurred while loading this component.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-mono text-muted-foreground">
                  {error?.message || 'Unknown error'}
                </p>
              </div>

              {canRetry && (
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again ({this.maxRetries - this.retryCount} attempts remaining)
                </Button>
              )}

              {!canRetry && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Maximum retry attempts reached.</p>
                  <p>Please refresh the page or contact support if the issue persists.</p>
                </div>
              )}

              {errorCount > 1 && (
                <div className="text-center text-xs text-muted-foreground">
                  This error has occurred {errorCount} times
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withMapErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WithMapErrorBoundaryComponent(props: P) {
    return (
      <MapErrorBoundary fallback={fallback}>
        <Component {...props} />
      </MapErrorBoundary>
    );
  };
}