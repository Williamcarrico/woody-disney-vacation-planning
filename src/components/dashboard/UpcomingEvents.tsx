import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface UpcomingEventsProps {
    userId: string
    initialEvents?: any[]
}

export default async function UpcomingEvents({ userId, initialEvents = [] }: UpcomingEventsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                </CardTitle>
                <CardDescription>
                    Your scheduled activities
                </CardDescription>
            </CardHeader>
            <CardContent>
                {initialEvents.length > 0 ? (
                    <div className="space-y-3">
                        {initialEvents.slice(0, 3).map((event: any, index: number) => (
                            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming events
                    </p>
                )}
            </CardContent>
        </Card>
    )
}