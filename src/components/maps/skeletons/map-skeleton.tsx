'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MapSkeletonProps {
    readonly height?: string | number;
    readonly width?: string | number;
}

/**
 * MapSkeleton component for loading states of maps
 */
export function MapSkeleton({ height = 500, width = '100%' }: MapSkeletonProps) {
    const heightClass = typeof height === 'number' ? `h-[${height}px]` : `h-[${height}]`;
    const widthValue = typeof width === 'number' ? `w-[${width}px]` : `w-[${width}]`;
    const widthClass = width === '100%' ? 'w-full' : widthValue;

    return (
        <div className={cn("relative rounded-lg overflow-hidden", heightClass, widthClass)}>
            <Skeleton className="h-full w-full absolute" />
            <div className="absolute top-2 left-2 right-2 flex gap-2 max-w-96 z-10">
                <Skeleton className="h-10 flex-grow" />
                <Skeleton className="h-10 w-10" />
            </div>
            <div className="absolute right-2 bottom-2">
                <Skeleton className="h-10 w-10" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/80 px-4 py-2 rounded-lg shadow-md">
                    <p className="text-sm font-medium">Loading map...</p>
                </div>
            </div>
        </div>
    );
}