import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';

interface Attraction {
    id: string;
    name: string;
    waitTime?: number;
    status?: string;
    trend?: string;
}

interface SortedAttractions {
    operating: Attraction[];
    down: Attraction[];
    closed?: Attraction[];
}

interface WaitTimesCardProps {
    readonly sortedAttractions?: SortedAttractions;
}

export function WaitTimesCard({ sortedAttractions }: WaitTimesCardProps) {
    const getWaitTimeColorClass = (waitTime: number) => {
        if (waitTime <= 10) return 'bg-green-500 text-white';
        if (waitTime <= 30) return 'bg-blue-500 text-white';
        if (waitTime <= 60) return 'bg-amber-500 text-white';
        return 'bg-red-500 text-white';
    };

    const formatWaitTime = (waitTime: number) => {
        return `${waitTime} min`;
    };

    // Get top 5 longest wait times for quick overview
    const topWaitTimes = sortedAttractions?.operating
        ?.filter(attraction => attraction.waitTime && attraction.waitTime > 0)
        ?.sort((a, b) => (b.waitTime || 0) - (a.waitTime || 0))
        ?.slice(0, 5) || [];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    Current Wait Times
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Operating Attractions */}
                {topWaitTimes.length > 0 ? (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Longest Waits</h4>
                        {topWaitTimes.map((attraction) => (
                            <div
                                key={attraction.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-card/50"
                            >
                                <div className="flex-1">
                                    <h5 className="font-medium text-sm">{attraction.name}</h5>
                                </div>
                                <Badge
                                    className={`text-xs ${getWaitTimeColorClass(attraction.waitTime || 0)}`}
                                >
                                    {formatWaitTime(attraction.waitTime || 0)}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">No wait time data available</p>
                    </div>
                )}

                {/* Down Attractions */}
                {sortedAttractions?.down && sortedAttractions.down.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">Currently Down</h4>
                        {sortedAttractions.down.slice(0, 3).map((attraction) => (
                            <div
                                key={attraction.id}
                                className="flex items-center justify-between p-2 rounded-lg border bg-red-50 border-red-200"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <h5 className="font-medium text-sm text-red-700">{attraction.name}</h5>
                                </div>
                                <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                                    Down
                                </Badge>
                            </div>
                        ))}
                        {sortedAttractions.down.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                                +{sortedAttractions.down.length - 3} more down
                            </p>
                        )}
                    </div>
                )}

                {/* Quick Stats */}
                {sortedAttractions && (
                    <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-lg font-semibold text-green-600">
                                    {sortedAttractions.operating.length}
                                </p>
                                <p className="text-xs text-muted-foreground">Operating</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-red-600">
                                    {sortedAttractions.down.length}
                                </p>
                                <p className="text-xs text-muted-foreground">Down</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}