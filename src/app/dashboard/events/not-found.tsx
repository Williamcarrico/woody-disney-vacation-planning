import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft } from 'lucide-react'

export default function EventNotFound() {
    return (
        <div className="container py-16 flex flex-col items-center justify-center text-center">
            <Calendar className="h-24 w-24 text-muted-foreground mb-8" />
            <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
                The event you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                    <Link href="/events">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Events
                    </Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">
                        Go to Homepage
                    </Link>
                </Button>
            </div>
        </div>
    )
}