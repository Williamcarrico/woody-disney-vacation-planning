'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, MapPin, Users, Star, Edit, Trash2, Share2 } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import type { Itinerary } from '@/db/schema/itineraries'

interface ItineraryCardProps {
    readonly itinerary: Itinerary
    readonly onEdit?: (itinerary: Itinerary) => void
    readonly onDelete?: (itineraryId: string) => Promise<void>
    readonly onShare?: (itinerary: Itinerary) => void
}

export function ItineraryCard({
    itinerary,
    onEdit,
    onDelete,
    onShare
}: ItineraryCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // Get the start and end date from the itinerary
    const dates = itinerary.parkDays.map(day => new Date(day.date))
    const startDate = dates.length ? dates.reduce((a, b) => a < b ? a : b, dates[0]) : new Date()
    const endDate = dates.length ? dates.reduce((a, b) => a > b ? a : b, dates[0]) : new Date()

    // Get unique parks
    const parks = [...new Set(itinerary.parkDays.map(day => day.parkId))]

    // Count total activities
    const totalActivities = itinerary.parkDays.reduce(
        (sum, day) => sum + day.activities.length,
        0
    )

    // Get ride preference text
    const ridePreferenceMap: Record<string, string> = {
        'thrill': 'Thrill Rides',
        'family': 'Family Rides'
    }
    const ridePreferenceText = ridePreferenceMap[itinerary.preferences.ridePreference as string] || 'All Rides'

    async function handleDelete() {
        if (!onDelete) return

        setIsDeleting(true)
        try {
            await onDelete(itinerary.id)
            toast({
                title: "Itinerary deleted",
                description: "Your itinerary has been successfully deleted.",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete itinerary. Please try again.",
                variant: "destructive",
            })
            console.error("Failed to delete itinerary:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    function handleView() {
        router.push(`/dashboard/itinerary/${itinerary.id}`)
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl font-bold">{itinerary.tripName}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                        </CardDescription>
                    </div>
                    {itinerary.isShared && (
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            Shared
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                            {parks.length} {parks.length === 1 ? 'Park' : 'Parks'} • {itinerary.parkDays.length} {itinerary.parkDays.length === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                        <Star className="h-4 w-4 mr-2" />
                        <span>{totalActivities} {totalActivities === 1 ? 'Activity' : 'Activities'}</span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                            Party of {itinerary.preferences.partySize || '?'}
                            {itinerary.preferences.hasChildren && ' • Including children'}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                        {itinerary.preferences.ridePreference && (
                            <Badge variant="secondary" className="text-xs">
                                {ridePreferenceText}
                            </Badge>
                        )}

                        {itinerary.preferences.walkingPace && (
                            <Badge variant="secondary" className="text-xs">
                                {itinerary.preferences.walkingPace.charAt(0).toUpperCase() +
                                    itinerary.preferences.walkingPace.slice(1)} Pace
                            </Badge>
                        )}

                        {itinerary.preferences.useGeniePlus && (
                            <Badge variant="secondary" className="text-xs">
                                Genie+
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={handleView}>
                    View Itinerary
                </Button>

                <div className="flex space-x-2">
                    <TooltipProvider>
                        {onEdit && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEdit(itinerary)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Edit Itinerary</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {onShare && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onShare(itinerary)}
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Share Itinerary</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {onDelete && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Delete Itinerary</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Itinerary</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the
                                            itinerary &ldquo;{itinerary.tripName}&rdquo; and all its associated data.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    )
}