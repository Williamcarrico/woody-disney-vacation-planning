import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

interface VirtualQueueAttraction {
    id: string;
    name: string;
    status: 'open' | 'closed' | 'paused';
    nextDrop?: string;
    estimatedWait?: number;
    groupsLeft?: number;
}

interface VirtualQueueCardProps {
    attractions?: VirtualQueueAttraction[];
}

export function VirtualQueueCard({ attractions = [] }: VirtualQueueCardProps) {
    // Mock data for demonstration
    const mockAttractions: VirtualQueueAttraction[] = [
        {
            id: '1',
            name: 'Guardians of the Galaxy',
            status: 'open',
            nextDrop: '7:00 AM',
            estimatedWait: 45,
            groupsLeft: 150,
        },
        {
            id: '2',
            name: 'TRON Lightcycle Run',
            status: 'closed',
            nextDrop: '1:00 PM',
            estimatedWait: 0,
            groupsLeft: 0,
        },
    ];

    const displayAttractions = attractions.length > 0 ? attractions : mockAttractions;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-500';
            case 'paused':
                return 'bg-yellow-500';
            case 'closed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'open':
                return 'Open';
            case 'paused':
                return 'Paused';
            case 'closed':
                return 'Closed';
            default:
                return 'Unknown';
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Virtual Queue
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayAttractions.map((attraction) => (
                    <div
                        key={attraction.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                    >
                        <div className="flex-1">
                            <h4 className="font-medium text-sm">{attraction.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                                {attraction.nextDrop && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Next: {attraction.nextDrop}
                                        </span>
                                    </div>
                                )}
                                {attraction.groupsLeft !== undefined && attraction.groupsLeft > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {attraction.groupsLeft} left
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {attraction.estimatedWait && attraction.estimatedWait > 0 && (
                                <Badge variant="outline" className="text-xs">
                                    {attraction.estimatedWait}min wait
                                </Badge>
                            )}
                            <div className="flex items-center gap-1">
                                <div
                                    className={`w-2 h-2 rounded-full ${getStatusColor(attraction.status)}`}
                                />
                                <span className="text-xs font-medium">
                                    {getStatusText(attraction.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {displayAttractions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No virtual queue data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}