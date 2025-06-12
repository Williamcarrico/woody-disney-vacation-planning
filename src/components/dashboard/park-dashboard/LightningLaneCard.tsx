import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

interface LightningLaneAttraction {
    id: string;
    name: string;
    nextAvailable: string;
    price?: number;
    isPaid: boolean;
    isAvailable: boolean;
}

interface LightningLaneCardProps {
    attractions?: LightningLaneAttraction[];
}

export function LightningLaneCard({ attractions = [] }: LightningLaneCardProps) {
    // Mock data for demonstration
    const mockAttractions: LightningLaneAttraction[] = [
        {
            id: '1',
            name: 'Space Mountain',
            nextAvailable: '2:30 PM',
            isPaid: false,
            isAvailable: true,
        },
        {
            id: '2',
            name: 'Seven Dwarfs Mine Train',
            nextAvailable: '4:15 PM',
            isPaid: false,
            isAvailable: true,
        },
        {
            id: '3',
            name: 'Avatar Flight of Passage',
            nextAvailable: 'Sold Out',
            price: 15,
            isPaid: true,
            isAvailable: false,
        },
    ];

    const displayAttractions = attractions.length > 0 ? attractions : mockAttractions;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Lightning Lane
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
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Next: {attraction.nextAvailable}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {attraction.isPaid && attraction.price && (
                                <Badge variant="outline" className="text-xs">
                                    ${attraction.price}
                                </Badge>
                            )}
                            <Badge
                                variant={attraction.isAvailable ? 'default' : 'secondary'}
                                className="text-xs"
                            >
                                {attraction.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>
                    </div>
                ))}

                {displayAttractions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                        <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Lightning Lane data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}