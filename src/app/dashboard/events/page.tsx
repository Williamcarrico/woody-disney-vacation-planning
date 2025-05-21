import { Metadata } from 'next'
import EventList from '@/components/events/EventList'
import { annualEvents } from '@/lib/data/annual-events'

export const metadata: Metadata = {
    title: 'Annual Events at Walt Disney World',
    description: 'Explore the exciting annual events at Walt Disney World Resort, including holiday celebrations, festivals, and special occasions.',
}

export default function EventsPage() {
    return (
        <div className="container py-8">
            <EventList
                events={annualEvents}
                title="Walt Disney World Annual Events"
                description="Discover the magical annual events at Walt Disney World Resort, from seasonal celebrations to unique festivals."
            />
        </div>
    )
}