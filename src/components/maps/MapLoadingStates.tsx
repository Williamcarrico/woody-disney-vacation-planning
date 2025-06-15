'use client';

import React from 'react';
import { Loader2, MapPin, AlertCircle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface MapLoadingProps {
  className?: string;
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export function MapLoading({ 
  className, 
  message = 'Loading map...', 
  showProgress = false,
  progress = 0 
}: MapLoadingProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg',
      className
    )}>
      <div className="relative">
        <MapPin className="h-12 w-12 text-muted-foreground" />
        <Loader2 className="h-6 w-6 animate-spin absolute -bottom-1 -right-1 text-primary" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      {showProgress && (
        <Progress value={progress} className="w-48 mt-4" />
      )}
    </div>
  );
}

interface MapOfflineProps {
  className?: string;
  onRetry?: () => void;
}

export function MapOffline({ className, onRetry }: MapOfflineProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg',
      className
    )}>
      <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">You're offline</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        The map requires an internet connection. Please check your connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

interface MapErrorStateProps {
  className?: string;
  error?: string;
  onRetry?: () => void;
}

export function MapErrorState({ 
  className, 
  error = 'Failed to load map', 
  onRetry 
}: MapErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 min-h-[400px] bg-muted/10 rounded-lg',
      className
    )}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Map unavailable</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-2">
        {error}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

interface MapSkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
}

export function MapSkeleton({ className, height = 400, width = '100%' }: MapSkeletonProps) {
  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <div 
      className={cn(
        'relative bg-muted/20 rounded-lg overflow-hidden animate-pulse',
        className
      )}
      style={style}
    >
      {/* Map controls skeleton */}
      <div className="absolute top-2 left-2 right-2 flex gap-2 max-w-96 z-10">
        <div className="flex-1 h-10 bg-muted/40 rounded-md" />
        <div className="w-10 h-10 bg-muted/40 rounded-md" />
      </div>

      {/* Zoom controls skeleton */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 space-y-2">
        <div className="w-10 h-10 bg-muted/40 rounded-md" />
        <div className="w-10 h-10 bg-muted/40 rounded-md" />
      </div>

      {/* User location button skeleton */}
      <div className="absolute right-2 bottom-2">
        <div className="w-10 h-10 bg-muted/40 rounded-md" />
      </div>

      {/* Map tiles pattern */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-0.5 p-0.5">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-muted/30" 
            style={{
              animationDelay: `${i * 50}ms`,
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        ))}
      </div>

      {/* Center loading indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <MapLoading className="bg-transparent min-h-0 p-4" />
      </div>
    </div>
  );
}

// Suspense fallback wrapper
export function MapSuspenseFallback({ height, width }: { height?: string | number; width?: string | number }) {
  return <MapSkeleton height={height} width={width} />;
}