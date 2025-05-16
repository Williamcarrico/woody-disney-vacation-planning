import { useState } from 'react';
import { format } from 'date-fns';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Plus,
    Info,
    ChevronUp,
    ChevronDown,
    Star,
    Zap
} from 'lucide-react';
import { Attraction, AttractionStatus, LiveData } from '@/types/api';
import { cn } from '@/lib/utils';

interface AttractionCardProps {
    readonly attraction: Attraction;
    readonly waitTimeData?: LiveData['attractions'][string];
    readonly showDetails?: boolean;
    readonly onSelect?: () => void;
    readonly onAddToItinerary?: () => void;
    readonly lightningLaneAvailable?: boolean;
    readonly lightningLanePrice?: number;
    readonly recommended?: boolean;
    readonly className?: string;
}

export default function AttractionCard(props: Readonly<AttractionCardProps>) {
    const {
        attraction,
        waitTimeData,
        showDetails = false,
        onSelect,
        onAddToItinerary,
        lightningLaneAvailable = false,
        lightningLanePrice,
        recommended = false,
        className,
    } = props;
    const [expanded, setExpanded] = useState(showDetails);

    // Function to determine status badge color
    function getStatusColor(status: AttractionStatus) {
        switch (status) {
            case 'OPERATING':
                return 'bg-green-500/20 text-green-700 dark:text-green-400';
            case 'DOWN':
                return 'bg-amber-500/20 text-amber-700 dark:text-amber-400';
            case 'CLOSED':
                return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
            case 'REFURBISHMENT':
                return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
            default:
                return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
        }
    }

    // Function to get the status badge
    function getStatusBadge() {
        if (!waitTimeData?.status) return null;

        const statusClass = getStatusColor(waitTimeData.status);

        return (
            <Badge variant="outline" className={`text-xs ${statusClass}`}>
                {waitTimeData.status.charAt(0) + waitTimeData.status.slice(1).toLowerCase().replace('_', ' ')}
            </Badge>
        );
    }

    // Function to get the type badge
    function getTypeBadge() {
        if (!attraction.attractionType) return null;

        return (
            <Badge variant="secondary" className="text-xs">
                {attraction.attractionType.replace(/_/g, ' ')}
            </Badge>
        );
    }

    // Function to display wait time with appropriate styling
    function getWaitTimeDisplay() {
        if (!waitTimeData?.waitTime) return null;

        const waitTime = waitTimeData.waitTime.standby;

        if (waitTime === -1) {
            return <span className="text-muted-foreground">Not Available</span>;
        }

        const waitClass = cn(
            "font-medium",
            getWaitTimeColorClass(waitTime)
        );

        return (
            <div className="flex flex-col">
                <span className={cn(waitClass, "text-2xl font-bold")}>{waitTime} min</span>
                {waitTimeData.waitTime.singleRider && waitTimeData.waitTime.singleRider > 0 && (
                    <span className="text-xs text-muted-foreground">
                        Single Rider: {waitTimeData.waitTime.singleRider} min
                    </span>
                )}
                <span className="text-xs text-muted-foreground mt-1">
                    Updated: {getLastUpdateTime()}
                </span>
            </div>
        );
    }

    // Get color class based on wait time
    function getWaitTimeColorClass(waitTime: number): string {
        if (waitTime <= 10) return "text-green-600";
        if (waitTime <= 30) return "text-blue-600";
        if (waitTime <= 60) return "text-amber-600";
        return "text-red-600";
    }

    // Format last update time
    function getLastUpdateTime() {
        if (!waitTimeData) return '';

        const lastUpdate = new Date(waitTimeData.lastUpdate);
        return format(lastUpdate, 'h:mm a');
    }

    // Height requirement display
    function getHeightRequirement() {
        if (!attraction.heightRequirement) return null;

        const { min, unit } = attraction.heightRequirement;
        return `${min} ${unit}`;
    }

    return (
        <Card
            className={cn(
                "overflow-hidden transition-all duration-200 hover:shadow-md",
                waitTimeData?.status === 'CLOSED' && "opacity-70",
                recommended && "border-2 border-primary",
                className
            )}
            onClick={onSelect}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-lg line-clamp-1 pr-2">{attraction.name}</CardTitle>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {getTypeBadge()}
                            {getStatusBadge()}
                            {attraction.heightRequirement && (
                                <Badge variant="outline" className="text-xs">
                                    Height: {getHeightRequirement()}
                                </Badge>
                            )}
                            {recommended && (
                                <Badge variant="default" className="bg-primary text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Recommended
                                </Badge>
                            )}
                        </div>
                    </div>
                    {waitTimeData?.status === 'OPERATING' && getWaitTimeDisplay()}
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="p-4 pt-2">
                    <div className="text-sm text-muted-foreground">
                        {attraction.description || "No description available."}
                    </div>

                    {attraction.tags && attraction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {attraction.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs bg-secondary/20">
                                    {tag.replace(/_/g, ' ')}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {lightningLaneAvailable && (
                        <div className="mt-3 flex items-center">
                            <Badge
                                variant="outline"
                                className="bg-purple-50 text-purple-700 border-purple-200 flex items-center"
                            >
                                <Zap className="h-3 w-3 mr-1" />
                                Lightning Lane Available
                                {lightningLanePrice && ` - $${lightningLanePrice.toFixed(2)}`}
                            </Badge>
                        </div>
                    )}
                </CardContent>
            )}

            <CardFooter className="p-3 pt-0 flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less Info
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            More Info
                        </>
                    )}
                </Button>

                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSelect}
                                >
                                    <Info className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                View Details
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={onAddToItinerary}
                                    disabled={waitTimeData?.status === 'CLOSED' || waitTimeData?.status === 'REFURBISHMENT'}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                Add to Itinerary
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
}