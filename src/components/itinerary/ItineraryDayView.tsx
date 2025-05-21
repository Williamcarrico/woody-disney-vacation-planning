'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
    Calendar,
    Clock,
    Map,
    MoreHorizontal,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getParkInfo } from '@/lib/data/parks'

interface ParkDay {
    date: string
    parkId: string
    activities: Array<{
        id?: string
        name: string
        type: string
        startTime: string
        endTime: string
        location?: string
        description?: string
        waitTime?: number
        walkingTime?: number
        notes?: string
    }>
}

interface ItineraryDayViewProps {
    readonly day: ParkDay
}

export default function ItineraryDayView({ day }: ItineraryDayViewProps) {
    const [isExpanded, setIsExpanded] = useState(true)
    const parkInfo = getParkInfo(day.parkId)

    // Sort activities by start time
    const sortedActivities = [...day.activities].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime)
    })

    // Group activities by time blocks (morning, afternoon, evening)
    const morningActivities = sortedActivities.filter(a => {
        const hour = parseInt(a.startTime.split(':')[0], 10)
        return hour < 12
    })

    const afternoonActivities = sortedActivities.filter(a => {
        const hour = parseInt(a.startTime.split(':')[0], 10)
        return hour >= 12 && hour < 17
    })

    const eveningActivities = sortedActivities.filter(a => {
        const hour = parseInt(a.startTime.split(':')[0], 10)
        return hour >= 17
    })

    return (
        <Card>
            <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                        <div>
                            <CardTitle>
                                {format(new Date(day.date), 'EEEE, MMMM d, yyyy')}
                            </CardTitle>
                            <CardDescription>
                                {parkInfo?.name || day.parkId} • {sortedActivities.length} activities
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                            {parkInfo?.shortName || day.parkId}
                        </Badge>
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <div className="space-y-6">
                        {/* Morning activities */}
                        {morningActivities.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-3">Morning</h4>
                                <div className="space-y-4">
                                    {morningActivities.map((activity) => (
                                        <ActivityItem key={activity.id || `morning-${activity.name}-${activity.startTime}`} activity={activity} date={day.date} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Afternoon activities */}
                        {afternoonActivities.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-3">Afternoon</h4>
                                <div className="space-y-4">
                                    {afternoonActivities.map((activity) => (
                                        <ActivityItem key={activity.id || `afternoon-${activity.name}-${activity.startTime}`} activity={activity} date={day.date} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Evening activities */}
                        {eveningActivities.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-3">Evening</h4>
                                <div className="space-y-4">
                                    {eveningActivities.map((activity) => (
                                        <ActivityItem key={activity.id || `evening-${activity.name}-${activity.startTime}`} activity={activity} date={day.date} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No activities */}
                        {sortedActivities.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>No activities planned for this day.</p>
                                <Button variant="outline" className="mt-2">
                                    Add Activities
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

interface ActivityItemProps {
    readonly activity: ParkDay['activities'][0]
    readonly date: string
}

function ActivityItem({ activity, date }: ActivityItemProps) {
    // Format start and end times
    const startTime = format(new Date(`${date}T${activity.startTime}`), 'h:mm a')
    const endTime = format(new Date(`${date}T${activity.endTime}`), 'h:mm a')

    return (
        <div className="flex space-x-4">
            <div className="flex-shrink-0 w-16 text-muted-foreground text-sm">
                {startTime}
            </div>

            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-medium">{activity.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{startTime} - {endTime}</span>

                            {activity.location && (
                                <>
                                    <span className="mx-1">•</span>
                                    <Map className="h-3 w-3 mr-1" />
                                    <span>{activity.location}</span>
                                </>
                            )}
                        </div>

                        {activity.description && (
                            <p className="text-sm mt-1">{activity.description}</p>
                        )}

                        <div className="flex mt-2 space-x-2">
                            {activity.waitTime !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                    {activity.waitTime} min wait
                                </Badge>
                            )}

                            {activity.walkingTime !== undefined && (
                                <Badge variant="outline" className="text-xs">
                                    {activity.walkingTime} min walk
                                </Badge>
                            )}

                            <Badge variant="secondary" className="text-xs">
                                {activity.type}
                            </Badge>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {activity.notes && (
                    <div className="mt-2 text-sm border-l-2 border-primary/20 pl-3 py-1">
                        <p className="text-muted-foreground">{activity.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}