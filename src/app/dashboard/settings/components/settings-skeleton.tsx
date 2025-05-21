import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSettingsSkeleton() {
    return (
        <div className="space-y-10">
            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />

                <div className="grid gap-8 pt-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={`profile-field-${i}`} className="space-y-4">
                            <div className="grid gap-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-10 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={`profile-option-${i}`} className="space-y-3">
                            <Skeleton className="h-4 w-[120px]" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-5 w-[180px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4">
                <Skeleton className="h-10 w-[120px]" />
                <Skeleton className="h-10 w-[120px]" />
            </div>
        </div>
    )
}