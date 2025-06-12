import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

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

interface WaitTimeStats {
    average: number;
    longest: number;
    longestName: string;
    belowThirty: number;
    belowThirtyPercent: number;
}

interface OperatingHours {
    date: string;
    openingTime: string;
    closingTime: string;
}

interface Park {
    id: string;
    name: string;
}

interface ParkStatusCardProps {
    readonly currentPark?: Park;
    readonly operatingHours?: OperatingHours;
    readonly lastUpdated?: Date | null;
    readonly sortedAttractions?: SortedAttractions;
    readonly waitTimeStats?: WaitTimeStats | null;
    readonly waitTimeTrend?: string | null;
}

export function ParkStatusCard({
    currentPark,
    operatingHours,
    lastUpdated,
    sortedAttractions,
    waitTimeStats,
    waitTimeTrend
}: ParkStatusCardProps) {
    const getTrendIndicator = (trend: string | null | undefined) => {
        if (!trend) return <Minus className="h-4 w-4" />;

        switch (trend) {
            case 'increasing':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'decreasing':
                return <TrendingDown className="h-4 w-4 text-green-500" />;
            default:
                return <Minus className="h-4 w-4 text-amber-500" />;
        }
    };

    const formatTime = (timeStr: string) => {
        try {
            const [time, period] = timeStr.split(' ');
            return `${time} ${period}`;
        } catch {
            return timeStr;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Park Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Park Name */}
                {currentPark && (
                    <div>
                        <h3 className="font-semibold text-lg">{currentPark.name}</h3>
                    </div>
                )}

                {/* Operating Hours */}
                {operatingHours && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Operating Hours</h4>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Open:</span>
                            <span className="font-medium">{formatTime(operatingHours.openingTime)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Close:</span>
                            <span className="font-medium">{formatTime(operatingHours.closingTime)}</span>
                        </div>
                    </div>
                )}

                {/* Attraction Status */}
                {sortedAttractions && (
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Attraction Status</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Operating:</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {sortedAttractions.operating.length}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Down:</span>
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    {sortedAttractions.down.length}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Wait Time Stats */}
                {waitTimeStats && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">Wait Times</h4>
                            {getTrendIndicator(waitTimeTrend)}
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Average:</span>
                                <span className="font-medium">{waitTimeStats.average} min</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Longest:</span>
                                <span className="font-medium">{waitTimeStats.longest} min</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Under 30 min:</span>
                                <span className="font-medium">{waitTimeStats.belowThirtyPercent}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                            Last updated: {format(lastUpdated, 'h:mm a')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}