import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, MapPin } from 'lucide-react';

interface SpecialEvent {
    id: string;
    name: string;
    description: string;
    location?: string;
    startDate: string;
    endDate?: string;
    type: 'festival' | 'parade' | 'fireworks' | 'seasonal' | 'character-meet';
    isActive: boolean;
}

interface SpecialEventsCardProps {
    events?: SpecialEvent[];
}

export function SpecialEventsCard({ events = [] }: SpecialEventsCardProps) {
    // Mock data for demonstration
    const mockEvents: SpecialEvent[] = [
        {
            id: '1',
            name: 'EPCOT Food & Wine Festival',
            description: 'Celebrate global cuisine with food booths and special tastings',
            location: 'EPCOT',
            startDate: '2024-07-15',
            endDate: '2024-11-24',
            type: 'festival',
            isActive: true,
        },
        {
            id: '2',
            name: 'Happily Ever After',
            description: 'Nighttime spectacular at Magic Kingdom',
            location: 'Magic Kingdom',
            startDate: '9:00 PM',
            type: 'fireworks',
            isActive: true,
        },
        {
            id: '3',
            name: 'Festival of the Holidays',
            description: 'Holiday celebrations from around the world',
            location: 'EPCOT',
            startDate: '2024-11-29',
            endDate: '2024-12-30',
            type: 'seasonal',
            isActive: false,
        },
    ];

    const displayEvents = events.length > 0 ? events : mockEvents;

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'festival':
                return 'bg-orange-500';
            case 'parade':
                return 'bg-blue-500';
            case 'fireworks':
                return 'bg-purple-500';
            case 'seasonal':
                return 'bg-green-500';
            case 'character-meet':
                return 'bg-pink-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getEventTypeText = (type: string) => {
        switch (type) {
            case 'festival':
                return 'Festival';
            case 'parade':
                return 'Parade';
            case 'fireworks':
                return 'Fireworks';
            case 'seasonal':
                return 'Seasonal';
            case 'character-meet':
                return 'Character Meet';
            default:
                return 'Event';
        }
    };

    const formatDate = (dateStr: string) => {
        if (dateStr.includes(':')) {
            return dateStr; // Time format like "9:00 PM"
        }

        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Special Events
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayEvents.map((event) => (
                    <div
                        key={event.id}
                        className={`p-3 rounded-lg border bg-card/50 ${!event.isActive ? 'opacity-60' : ''
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{event.name}</h4>
                            <Badge
                                variant="outline"
                                className={`text-xs ${getEventTypeColor(event.type)} text-white border-none`}
                            >
                                {getEventTypeText(event.type)}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                            {event.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {event.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {formatDate(event.startDate)}
                                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {displayEvents.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No special events available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}