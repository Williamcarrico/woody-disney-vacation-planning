'use client'

import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface ShareItineraryButtonProps {
    readonly itineraryId: string
}

export default function ShareItineraryButton({ itineraryId }: ShareItineraryButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [shareCode, setShareCode] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)
    const { toast } = useToast()

    async function handleShare() {
        setIsLoading(true)

        try {
            const response = await fetch(`/api/itinerary/${itineraryId}/share`, {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to share itinerary')
            }

            const data = await response.json()
            setShareCode(data.shareCode)
        } catch (error) {
            console.error('Error sharing itinerary:', error)
            toast({
                title: 'Error',
                description: 'Failed to share itinerary. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    function copyShareLink() {
        if (!shareCode) return

        const shareLink = `${window.location.origin}/shared-itinerary/${shareCode}`

        navigator.clipboard.writeText(shareLink)
            .then(() => {
                setIsCopied(true)
                toast({
                    title: 'Link copied!',
                    description: 'Itinerary link copied to clipboard',
                })

                // Reset the copied state after 2 seconds
                setTimeout(() => {
                    setIsCopied(false)
                }, 2000)
            })
            .catch(() => {
                toast({
                    title: 'Error',
                    description: 'Failed to copy link. Please try again.',
                    variant: 'destructive',
                })
            })
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Your Itinerary</DialogTitle>
                    <DialogDescription>
                        Create a shareable link to your itinerary that you can send to family and friends.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!shareCode ? (
                        <div className="flex justify-center">
                            <Button onClick={handleShare} disabled={isLoading}>
                                {isLoading ? 'Creating link...' : 'Create shareable link'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Anyone with this link can view your itinerary:
                            </p>

                            <div className="flex space-x-2">
                                <Input
                                    value={`${window.location.origin}/shared-itinerary/${shareCode}`}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button size="icon" onClick={copyShareLink} variant="outline">
                                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <p className="text-sm mt-4">
                                <strong>Note:</strong> This will make your itinerary visible to anyone with the link,
                                but they won&apos;t be able to edit it.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}