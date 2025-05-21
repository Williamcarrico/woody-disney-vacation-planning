'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { ItineraryCard } from './ItineraryCard'
import type { Itinerary } from '@/db/schema/itineraries'

async function getItineraries(vacationId?: string): Promise<Itinerary[]> {
    const url = vacationId
        ? `/api/itinerary?vacationId=${vacationId}`
        : '/api/itinerary'

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error('Failed to fetch itineraries')
    }

    const data = await response.json()
    return data.itineraries
}

async function deleteItinerary(itineraryId: string): Promise<void> {
    const response = await fetch(`/api/itinerary/${itineraryId}`, {
        method: 'DELETE',
    })

    if (!response.ok) {
        throw new Error('Failed to delete itinerary')
    }
}

async function shareItinerary(itineraryId: string): Promise<{ shareCode: string }> {
    const response = await fetch(`/api/itinerary/${itineraryId}/share`, {
        method: 'POST',
    })

    if (!response.ok) {
        throw new Error('Failed to share itinerary')
    }

    return response.json()
}

interface ItineraryListProps {
    readonly vacationId?: string
    readonly onCreateNew?: () => void
    readonly onEdit?: (itinerary: Itinerary) => void
}

export function ItineraryList({
    vacationId,
    onCreateNew,
    onEdit,
}: ItineraryListProps) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [shareCode, setShareCode] = useState('')
    const { toast } = useToast()
    const queryClient = useQueryClient()

    const { data: itineraries, isLoading, error } = useQuery({
        queryKey: ['itineraries', vacationId],
        queryFn: () => getItineraries(vacationId),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteItinerary,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['itineraries'] })
        },
    })

    const shareMutation = useMutation({
        mutationFn: shareItinerary,
        onSuccess: (data) => {
            setShareCode(data.shareCode)
            setShareDialogOpen(true)
            queryClient.invalidateQueries({ queryKey: ['itineraries'] })
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Failed to share itinerary. Please try again.",
                variant: "destructive",
            })
        }
    })

    function handleDelete(itineraryId: string) {
        return deleteMutation.mutateAsync(itineraryId)
    }

    function handleShare(itinerary: Itinerary) {
        if (itinerary.shareCode) {
            setShareCode(itinerary.shareCode)
            setShareDialogOpen(true)
            return
        }

        shareMutation.mutate(itinerary.id)
    }

    function copyShareCode() {
        navigator.clipboard.writeText(`${window.location.origin}/shared-itinerary/${shareCode}`)
        toast({
            title: "Copied!",
            description: "Share link copied to clipboard",
        })
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                <p>Failed to load itineraries. Please try again.</p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['itineraries'] })}
                >
                    Retry
                </Button>
            </div>
        )
    }

    if (!itineraries?.length) {
        return (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
                <h3 className="text-lg font-medium mb-2">No itineraries found</h3>
                <p className="text-muted-foreground mb-6">
                    Create a new itinerary to plan your perfect Disney vacation day by day.
                </p>
                {onCreateNew && (
                    <Button onClick={onCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Itinerary
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div>
            {onCreateNew && (
                <div className="mb-6 flex justify-end">
                    <Button onClick={onCreateNew}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Itinerary
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itineraries.map((itinerary) => (
                    <ItineraryCard
                        key={itinerary.id}
                        itinerary={itinerary}
                        onEdit={onEdit}
                        onDelete={handleDelete}
                        onShare={handleShare}
                    />
                ))}
            </div>

            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share Your Itinerary</DialogTitle>
                        <DialogDescription>
                            Anyone with this link can view your itinerary.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center space-x-2 mt-4">
                        <div className="bg-muted p-2 rounded-md flex-1 font-mono text-sm truncate">
                            {`${window.location.origin}/shared-itinerary/${shareCode}`}
                        </div>
                        <Button onClick={copyShareCode} size="sm">
                            Copy
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}