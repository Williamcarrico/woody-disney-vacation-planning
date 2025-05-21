import { Skeleton } from "@/components/ui/skeleton"
import { SettingsHeader } from "./components/settings-header"
import { SettingsShell } from "./components/settings-shell"

export default function SettingsLoading() {
    const tabSkeletonKeys = ['profile', 'appearance', 'notifications', 'security', 'billing', 'integrations', 'advanced']

    return (
        <div className="container mx-auto py-6 lg:py-8">
            <SettingsHeader />

            <SettingsShell>
                <div className="space-y-6">
                    {/* Tabs skeleton */}
                    <div className="mb-8 grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {tabSkeletonKeys.map((key) => (
                            <Skeleton key={key} className="h-9 rounded-md" />
                        ))}
                    </div>

                    {/* Content skeleton */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-6 w-[250px]" />
                            <Skeleton className="h-4 w-[400px]" />
                        </div>

                        <div className="grid gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <Skeleton className="h-5 w-[150px]" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Skeleton className="h-10 rounded-md" />
                                        <Skeleton className="h-10 rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Skeleton className="h-10 w-[150px]" />
                    </div>
                </div>
            </SettingsShell>
        </div>
    )
}