import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    CalendarDays,
    Users,
    Ticket,
    DollarSign,
    RefreshCw,
    AlertCircle,
    Clock,
    MapPin,
    Edit,
    Share2,
    Archive,
    Loader2
} from "lucide-react"
import { useVacation } from "@/hooks/useVacation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface TripOverviewProps {
    vacationId: string
    className?: string
    showActions?: boolean
    compact?: boolean
}

export default function TripOverview({
    vacationId,
    className,
    showActions = true,
    compact = false
}: TripOverviewProps) {
    // Fetch vacation data using our sophisticated hook
    const {
        vacation,
        formattedVacation,
        recommendedTicketType,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        archiveVacation,
        isUpdating,
        isArchiving,
        metadata
    } = useVacation(vacationId, {
        onSuccess: (data) => {
            console.log('✅ Vacation data loaded successfully:', data.name)
        },
        onError: (error) => {
            console.error('❌ Failed to load vacation data:', error.message)
        }
    })

    // Handle loading state
    if (isLoading) {
        return (
            <div className={cn("w-full p-4 border rounded-lg bg-card", className)}>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    {showActions && (
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Handle error state
    if (isError || !vacation) {
        return (
            <div className={cn("w-full p-4 border rounded-lg bg-card", className)}>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            {error?.message || 'Failed to load vacation data'}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    // Handle archive action
    const handleArchive = async () => {
        try {
            await archiveVacation()
            toast.success('Vacation archived successfully')
        } catch (error) {
            console.error('Failed to archive vacation:', error)
        }
    }

    // Handle share action
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: vacation.name,
                    text: `Check out my ${vacation.destination} vacation: ${vacation.formattedDateRange}`,
                    url: window.location.href
                })
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href)
                toast.success('Vacation link copied to clipboard')
            }
        } catch (error) {
            console.error('Failed to share vacation:', error)
            toast.error('Failed to share vacation')
        }
    }

    // Status badge configuration
    const getStatusBadge = () => {
        switch (vacation.status) {
            case 'upcoming':
                return (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {vacation.daysUntilTrip ? `${vacation.daysUntilTrip} days to go` : 'Upcoming'}
                    </Badge>
                )
            case 'active':
                return (
                    <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        Active Trip
                    </Badge>
                )
            case 'completed':
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                        Completed
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <div className={cn("w-full p-4 border rounded-lg bg-card", className)}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className={cn(
                            "font-bold text-foreground",
                            compact ? "text-xl" : "text-2xl"
                        )}>
                            {vacation.name}
                        </h2>
                        {getStatusBadge()}
                        {isFetching && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {vacation.formattedDateRange}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vacation.destination}
                        </span>
                    </div>
                </div>

                {showActions && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => {
                                // TODO: Implement edit functionality
                                toast.info('Edit functionality coming soon!')
                            }}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Trip
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleShare}
                        >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                        </Button>
                        {vacation.status !== 'archived' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isArchiving}
                                onClick={handleArchive}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                {isArchiving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Archive className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className={cn(
                "grid gap-4 mt-4",
                compact ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-4"
            )}>
                {/* Dates Card */}
                <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <CalendarDays className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium truncate">
                            {vacation.durationDays} day{vacation.durationDays !== 1 ? 's' : ''}
                        </p>
                    </div>
                </Card>

                {/* Party Size Card */}
                <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Party Size</p>
                        <p className="font-medium">
                            {vacation.partySize} {vacation.partySize === 1 ? 'person' : 'people'}
                        </p>
                        {vacation.travelers.children > 0 && (
                            <p className="text-xs text-muted-foreground">
                                {vacation.travelers.adults} adults, {vacation.travelers.children} children
                            </p>
                        )}
                    </div>
                </Card>

                {/* Ticket Type Card */}
                <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <Ticket className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Recommended Ticket</p>
                        <p className="font-medium truncate">
                            {recommendedTicketType || 'Park Hopper'}
                        </p>
                    </div>
                </Card>

                {/* Budget Card */}
                <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <DollarSign className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">
                            {formattedVacation?.budgetFormatted || 'Not set'}
                        </p>
                        {vacation.budgetPerPerson && (
                            <p className="text-xs text-muted-foreground">
                                {formattedVacation?.budgetPerPersonFormatted} per person
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Metadata Footer (only show in development or when there are performance issues) */}
            {process.env.NODE_ENV === 'development' && metadata && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {metadata.cached ? '🟢 Cached' : '🔵 Fresh'} •
                            Last fetched: {metadata.lastFetched ? new Date(metadata.lastFetched).toLocaleTimeString() : 'Never'}
                        </span>
                        {metadata.performance && (
                            <span>
                                {metadata.performance.duration}ms
                                {metadata.performance.retryCount > 0 && ` (${metadata.performance.retryCount} retries)`}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}