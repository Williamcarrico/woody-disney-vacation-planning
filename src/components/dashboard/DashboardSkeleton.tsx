import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardHeaderSkeleton() {
    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4">
                    <Skeleton className="h-12 w-96 mx-auto" />
                    <Skeleton className="h-6 w-64 mx-auto" />
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-12 w-12 rounded-lg" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function QuickActionsSkeleton() {
    return (
        <div className="space-y-6 mt-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="h-48">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                            <Skeleton className="h-9 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export function DashboardContentSkeleton() {
    return (
        <Card className="min-h-[600px]">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-64" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="p-4 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function WeatherSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                    <Skeleton className="h-12 w-24 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function EventsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export function PartySkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

// Legacy export for backward compatibility
export const DashboardSkeleton = {
    Header: DashboardHeaderSkeleton,
    Stats: DashboardStatsSkeleton,
    QuickActions: QuickActionsSkeleton,
    Content: DashboardContentSkeleton,
    Weather: WeatherSkeleton,
    Events: EventsSkeleton,
    Party: PartySkeleton
}