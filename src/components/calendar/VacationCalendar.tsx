// src/components/calendar/VacationCalendar.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    format,
    addDays,
    isSameDay,
    startOfWeek,
    endOfWeek,
    getDaysInMonth,
    isSameMonth,
    parseISO,
    differenceInDays
} from 'date-fns';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Map,
    Clock,
    Utensils,
    Ticket,
    PlusCircle,
    MoreHorizontal,
    Sun,
    CloudRain,
    Zap,
    CalendarDays,
    BadgeInfo
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getVacation, getVacationItineraries } from '@/lib/firebase/vacations';
import { cn } from '@/lib/utils';

// Type for calendar event
interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note';
    parkId?: string;
    attractionId?: string;
    locationName?: string;
    isHighlighted?: boolean;
    notes?: string;
    reservation?: {
        id: string;
        name: string;
        time: string;
        partySize: number;
        confirmed: boolean;
    };
    weather?: {
        condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
        highTemp: number;
        lowTemp: number;
        precipitation: number;
    };
}

interface VacationCalendarProps {
    vacationId: string;
    initialDate?: Date;
    onEventClick?: (event: CalendarEvent) => void;
    onAddEvent?: (date: Date) => void;
    view?: 'month' | 'week' | 'schedule';
}

export default function VacationCalendar({
    vacationId,
    initialDate = new Date(),
    onEventClick,
    onAddEvent,
    view: initialView = 'month',
}: VacationCalendarProps) {
    const [currentDate, setCurrentDate] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [showAddEventDialog, setShowAddEventDialog] = useState(false);
    const [newEventType, setNewEventType] = useState<CalendarEvent['type']>('note');
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventNotes, setNewEventNotes] = useState('');
    const [newEventTime, setNewEventTime] = useState('');
    const [view, setView] = useState<'month' | 'week' | 'schedule'>(initialView);

    const { currentUser } = useAuth();

    // Query to fetch vacation details
    const { data: vacation, isLoading: isLoadingVacation } = useQuery({
        queryKey: ['vacation', vacationId],
        queryFn: () => getVacation(vacationId),
    });

    // Query to fetch vacation itineraries
    const { data: itineraries, isLoading: isLoadingItineraries } = useQuery({
        queryKey: ['vacationItineraries', vacationId],
        queryFn: () => getVacationItineraries(vacationId),
        enabled: !!vacation,
    });

    // Generate calendar events based on vacation data
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        if (!vacation) return allEvents;

        const startDate = vacation.startDate.toDate();
        const endDate = vacation.endDate.toDate();

        // Add park days
        if (vacation.parkDays) {
            vacation.parkDays.forEach(day => {
                const parkDate = day.date.toDate();

                allEvents.push({
                    id: `park-${parkDate.toISOString()}`,
                    title: `Park Day: ${day.parkId}`,
                    date: parkDate,
                    startTime: day.startTime,
                    endTime: day.endTime,
                    type: 'park',
                    parkId: day.parkId,
                    notes: day.notes,
                    isHighlighted: true,
                });
            });
        }

        // Generate mock travel days (first and last day)
        allEvents.push({
            id: `travel-arrival`,
            title: 'Arrival Day',
            date: startDate,
            type: 'travel',
            locationName: 'Orlando International Airport',
            notes: 'Flight arrival',
        });

        allEvents.push({
            id: `travel-departure`,
            title: 'Departure Day',
            date: endDate,
            type: 'travel',
            locationName: 'Orlando International Airport',
            notes: 'Flight departure',
        });

        // Generate mock dining reservations (for demonstration purposes)
        allEvents.push({
            id: 'dining-1',
            title: 'Dinner at Be Our Guest',
            date: addDays(startDate, 1),
            startTime: '18:30',
            endTime: '20:00',
            type: 'dining',
            locationName: 'Be Our Guest Restaurant',
            reservation: {
                id: 'res-123',
                name: 'Be Our Guest Restaurant',
                time: '18:30',
                partySize: 4,
                confirmed: true,
            },
        });

        allEvents.push({
            id: 'dining-2',
            title: 'Lunch at Cosmic Ray\'s',
            date: addDays(startDate, 2),
            startTime: '12:00',
            endTime: '13:00',
            type: 'dining',
            locationName: 'Cosmic Ray\'s Starlight Café',
        });

        // Generate mock rest days
        allEvents.push({
            id: 'rest-1',
            title: 'Resort Day',
            date: addDays(startDate, 3),
            type: 'rest',
            locationName: 'Resort Pool',
            notes: 'Relaxing day at the resort',
        });

        // Generate mock special events
        allEvents.push({
            id: 'event-1',
            title: 'Mickey\'s Not-So-Scary Halloween Party',
            date: addDays(startDate, 4),
            startTime: '19:00',
            endTime: '24:00',
            type: 'event',
            parkId: 'magickingdom',
            isHighlighted: true,
        });

        // Generate mock weather data for each day
        const tripDays = differenceInDays(endDate, startDate) + 1;
        for (let i = 0; i < tripDays; i++) {
            const date = addDays(startDate, i);

            // Find existing event for this date or create new one
            let dayEvent = allEvents.find(e =>
                isSameDay(e.date, date) && e.type === 'note'
            );

            if (!dayEvent) {
                dayEvent = {
                    id: `day-${i}`,
                    title: `Day ${i + 1}`,
                    date,
                    type: 'note',
                };
                allEvents.push(dayEvent);
            }

            // Add mock weather data
            dayEvent.weather = {
                condition: i % 4 === 0 ? 'rainy' :
                    i % 3 === 0 ? 'cloudy' : 'sunny',
                highTemp: 75 + Math.floor(Math.random() * 15),
                lowTemp: 65 + Math.floor(Math.random() * 10),
                precipitation: i % 4 === 0 ? 60 : i % 3 === 0 ? 20 : 0,
            };
        }

        return allEvents;
    }, [vacation]);

    // Get date range for current view
    const dateRange = useMemo(() => {
        if (view === 'month') {
            // For month view, we need all days in the month
            const daysInMonth = getDaysInMonth(currentDate);
            return Array.from({ length: daysInMonth }, (_, i) => {
                return new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
            });
        } else if (view === 'week') {
            // For week view, get days from start of week to end of week
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = endOfWeek(currentDate, { weekStartsOn: 0 });
            const days = [];

            let day = start;
            while (day <= end) {
                days.push(new Date(day));
                day = addDays(day, 1);
            }

            return days;
        } else {
            // For schedule view, show the entire vacation
            if (!vacation) return [];

            const startDate = vacation.startDate.toDate();
            const endDate = vacation.endDate.toDate();
            const tripDays = differenceInDays(endDate, startDate) + 1;

            return Array.from({ length: tripDays }, (_, i) => {
                return addDays(startDate, i);
            });
        }
    }, [currentDate, view, vacation]);

    // Filter events for current view
    const currentEvents = useMemo(() => {
        if (view === 'month') {
            // For month view, show all events in the current month
            return events.filter(event =>
                isSameMonth(event.date, currentDate)
            );
        } else if (view === 'week') {
            // For week view, show events in the current week
            const start = startOfWeek(currentDate, { weekStartsOn: 0 });
            const end = endOfWeek(currentDate, { weekStartsOn: 0 });

            return events.filter(event =>
                event.date >= start && event.date <= end
            );
        } else {
            // For schedule view, show all events
            return events;
        }
    }, [events, currentDate, view]);

    // Group events by date for easy rendering
    const eventsByDate = useMemo(() => {
        const grouped: { [key: string]: CalendarEvent[] } = {};

        currentEvents.forEach(event => {
            const dateStr = format(event.date, 'yyyy-MM-dd');
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(event);
        });

        return grouped;
    }, [currentEvents]);

    // Navigate to previous period
    const navigatePrevious = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (view === 'week') {
            setCurrentDate(addDays(currentDate, -7));
        } else {
            // For schedule view, do nothing as it shows the entire vacation
        }
    };

    // Navigate to next period
    const navigateNext = () => {
        if (view === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (view === 'week') {
            setCurrentDate(addDays(currentDate, 7));
        } else {
            // For schedule view, do nothing as it shows the entire vacation
        }
    };

    // Handle clicking on a date
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);

        if (onAddEvent) {
            setNewEventTitle('');
            setNewEventNotes('');
            setNewEventTime('');
            setShowAddEventDialog(true);
        }
    };

    // Handle clicking on an event
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventDialog(true);

        if (onEventClick) {
            onEventClick(event);
        }
    };

    // Handle adding a new event
    const handleAddEvent = () => {
        // In a real app, this would save to Firebase
        console.log('Adding event:', {
            title: newEventTitle,
            date: selectedDate,
            type: newEventType,
            time: newEventTime,
            notes: newEventNotes,
        });

        // Close the dialog
        setShowAddEventDialog(false);
    };

    // Get friendly label for event type
    const getEventTypeLabel = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'park': return 'Park Day';
            case 'dining': return 'Dining';
            case 'resort': return 'Resort';
            case 'travel': return 'Travel';
            case 'rest': return 'Rest Day';
            case 'event': return 'Special Event';
            case 'note': return 'Note';
            default: return 'Event';
        }
    };

    // Get icon for event type
    const getEventTypeIcon = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'park': return <Map className="h-4 w-4" />;
            case 'dining': return <Utensils className="h-4 w-4" />;
            case 'resort': return <Clock className="h-4 w-4" />;
            case 'travel': return <Ticket className="h-4 w-4" />;
            case 'rest': return <Sun className="h-4 w-4" />;
            case 'event': return <Calendar className="h-4 w-4" />;
            case 'note': return <BadgeInfo className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    // Get color for event type
    const getEventTypeColor = (type: CalendarEvent['type'], highlighted: boolean = false) => {
        if (highlighted) {
            return "border-primary bg-primary/10 text-primary";
        }

        switch (type) {
            case 'park': return "border-green-400 bg-green-50 text-green-700";
            case 'dining': return "border-amber-400 bg-amber-50 text-amber-700";
            case 'resort': return "border-blue-400 bg-blue-50 text-blue-700";
            case 'travel': return "border-purple-400 bg-purple-50 text-purple-700";
            case 'rest': return "border-teal-400 bg-teal-50 text-teal-700";
            case 'event': return "border-pink-400 bg-pink-50 text-pink-700";
            case 'note': return "border-gray-400 bg-gray-50 text-gray-700";
            default: return "border-gray-400 bg-gray-50 text-gray-700";
        }
    };

    // Get weather icon based on condition
    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'sunny': return <Sun className="h-4 w-4 text-amber-500" />;
            case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />;
            case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />;
            case 'stormy': return <Zap className="h-4 w-4 text-purple-500" />;
            default: return <Sun className="h-4 w-4 text-amber-500" />;
        }
    };

    // Render month view
    const renderMonthView = () => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, ...

        return (
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium p-1">
                        {day}
                    </div>
                ))}

                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: startingDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="h-24 p-1 border border-dashed border-gray-200 bg-gray-50/50 rounded-lg"></div>
                ))}

                {/* Days of the month */}
                {dateRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dateStr] || [];
                    const hasEvents = dayEvents.length > 0;
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "h-24 p-1 border border-gray-200 rounded-lg overflow-hidden",
                                isToday ? "bg-primary/5 border-primary" : "bg-card hover:bg-secondary/10 transition-colors"
                            )}
                            onClick={() => handleDateClick(date)}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-xs font-medium",
                                    isToday && "text-primary"
                                )}>
                                    {format(date, 'd')}
                                </span>

                                {/* Weather for the day */}
                                {dayEvents[0]?.weather && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center text-xs">
                                                    {getWeatherIcon(dayEvents[0].weather.condition)}
                                                    <span className="ml-1">{dayEvents[0].weather.highTemp}°</span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="text-xs">
                                                    <p>{dayEvents[0].weather.condition} | {dayEvents[0].weather.lowTemp}° - {dayEvents[0].weather.highTemp}°</p>
                                                    <p>Precipitation: {dayEvents[0].weather.precipitation}%</p>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>

                            {/* Events for the day */}
                            <div className="mt-1 space-y-1 max-h-[calc(100%-20px)] overflow-hidden">
                                {dayEvents
                                    .sort((a, b) => {
                                        // Sort by type (park days first)
                                        if (a.type === 'park' && b.type !== 'park') return -1;
                                        if (a.type !== 'park' && b.type === 'park') return 1;

                                        // Then by time
                                        if (a.startTime && b.startTime) {
                                            return a.startTime.localeCompare(b.startTime);
                                        }

                                        return 0;
                                    })
                                    .slice(0, 3) // Show only first 3 events
                                    .map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded border truncate cursor-pointer",
                                                getEventTypeColor(event.type, event.isHighlighted)
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEventClick(event);
                                            }}
                                        >
                                            {event.startTime && (
                                                <span className="font-medium mr-1">{event.startTime}</span>
                                            )}
                                            {event.title}
                                        </div>
                                    ))
                                }

                                {/* "More events" indicator */}
                                {dayEvents.length > 3 && (
                                    <div className="text-[10px] text-center text-muted-foreground">
                                        +{dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render week view
    const renderWeekView = () => {
        const dayStartHour = 8; // 8 AM
        const dayEndHour = 22; // 10 PM
        const hourSlots = Array.from(
            { length: dayEndHour - dayStartHour + 1 },
            (_, i) => dayStartHour + i
        );

        return (
            <div className="grid grid-cols-[50px_repeat(7,1fr)] gap-0 border rounded-lg overflow-hidden">
                {/* Header row with day names */}
                <div className="sticky top-0 bg-card z-10 border-b border-r h-16">
                    {/* Time column header */}
                </div>
                {dateRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dateStr] || [];
                    const isToday = isSameDay(date, new Date());

                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "sticky top-0 z-10 p-2 border-b border-r text-center h-16",
                                isToday ? "bg-primary/5" : "bg-card"
                            )}
                        >
                            <div className="text-sm font-medium">{format(date, 'EEE')}</div>
                            <div className={cn(
                                "text-xs",
                                isToday && "text-primary font-medium"
                            )}>
                                {format(date, 'MMM d')}
                            </div>

                            {/* Weather indicator */}
                            {dayEvents[0]?.weather && (
                                <div className="flex items-center justify-center text-xs mt-1">
                                    {getWeatherIcon(dayEvents[0].weather.condition)}
                                    <span className="ml-1">{dayEvents[0].weather.highTemp}°</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Time grid */}
                {hourSlots.map((hour) => (
                    <React.Fragment key={hour}>
                        {/* Time column */}
                        <div className="border-r border-b p-1 text-xs text-right text-muted-foreground h-16">
                            {hour}:00
                        </div>

                        {/* Day columns */}
                        {dateRange.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd');

                            // Filter events for this hour slot
                            const hourEvents = (eventsByDate[dateStr] || []).filter(event => {
                                if (!event.startTime) return false;

                                const [eventHour] = event.startTime.split(':').map(Number);
                                return eventHour === hour;
                            });

                            return (
                                <div
                                    key={`${dateStr}-${hour}`}
                                    className="border-r border-b min-h-[64px] relative"
                                >
                                    {hourEvents.map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "absolute top-0 left-0 right-0 m-0.5 p-1 text-xs rounded border overflow-hidden",
                                                getEventTypeColor(event.type, event.isHighlighted)
                                            )}
                                            style={{
                                                height: 'calc(100% - 4px)',
                                            }}
                                            onClick={() => handleEventClick(event)}
                                        >
                                            <div className="font-medium truncate">{event.title}</div>
                                            <div className="text-[10px] truncate">
                                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // Render schedule view
    const renderScheduleView = () => {
        return (
            <div className="space-y-6">
                {dateRange.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dateStr] || [];
                    const isToday = isSameDay(date, new Date());

                    return (
                        <Card key={dateStr} className={cn(
                            isToday && "border-primary bg-primary/5"
                        )}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className={cn(
                                            "text-lg",
                                            isToday && "text-primary"
                                        )}>
                                            {format(date, 'EEEE, MMMM d')}
                                        </CardTitle>
                                        <CardDescription>
                                            {dayEvents
                                                .filter(e => e.type === 'park')
                                                .map(e => e.title)
                                                .join(' • ')}
                                        </CardDescription>
                                    </div>

                                    {/* Weather card */}
                                    {dayEvents[0]?.weather && (
                                        <div className="flex items-center bg-secondary/30 rounded-lg px-2 py-1 text-xs min-w-[100px] justify-between">
                                            <div className="flex items-center">
                                                {getWeatherIcon(dayEvents[0].weather.condition)}
                                                <span className="text-sm font-medium ml-1">
                                                    {dayEvents[0].weather.highTemp}°
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {dayEvents[0].weather.lowTemp}° | {dayEvents[0].weather.precipitation}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {dayEvents
                                        .sort((a, b) => {
                                            // Sort by time first
                                            if (a.startTime && b.startTime) {
                                                return a.startTime.localeCompare(b.startTime);
                                            }

                                            // Then by type (park days first)
                                            if (a.type === 'park' && b.type !== 'park') return -1;
                                            if (a.type !== 'park' && b.type === 'park') return 1;

                                            return 0;
                                        })
                                        .map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "p-2 rounded-lg border flex items-start cursor-pointer hover:bg-secondary/10 transition-colors",
                                                    event.isHighlighted && "border-primary/50"
                                                )}
                                                onClick={() => handleEventClick(event)}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                                                    getEventTypeColor(event.type, event.isHighlighted)
                                                )}>
                                                    {getEventTypeIcon(event.type)}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="font-medium">{event.title}</div>

                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {event.startTime && (
                                                            <div className="text-xs bg-secondary rounded-full px-2 py-0.5 flex items-center">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {event.startTime}
                                                                {event.endTime && ` - ${event.endTime}`}
                                                            </div>
                                                        )}

                                                        {event.locationName && (
                                                            <div className="text-xs bg-secondary rounded-full px-2 py-0.5 flex items-center">
                                                                <Map className="h-3 w-3 mr-1" />
                                                                {event.locationName}
                                                            </div>
                                                        )}

                                                        {event.type === 'dining' && event.reservation && (
                                                            <div className={cn(
                                                                "text-xs rounded-full px-2 py-0.5 flex items-center",
                                                                event.reservation.confirmed
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                            )}>
                                                                <Utensils className="h-3 w-3 mr-1" />
                                                                {event.reservation.confirmed ? 'Confirmed' : 'Pending'}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {event.notes && (
                                                        <div className="mt-2 text-sm text-muted-foreground">
                                                            {event.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    }

                                    {dayEvents.length === 0 && (
                                        <div className="text-center py-4 text-muted-foreground">
                                            No events planned for this day.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={() => handleDateClick(date)}
                                >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Event
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    };

    // Loading state
    if (isLoadingVacation) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!vacation) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Vacation not found.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">
                        {vacation.name}
                    </h2>
                    <p className="text-muted-foreground">
                        {format(vacation.startDate.toDate(), 'MMM d')} - {format(vacation.endDate.toDate(), 'MMM d, yyyy')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {view !== 'schedule' && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={navigatePrevious}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="font-medium text-sm min-w-[120px] text-center">
                                {view === 'month'
                                    ? format(currentDate, 'MMMM yyyy')
                                    : `Week of ${format(dateRange[0], 'MMM d')}`
                                }
                            </div>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={navigateNext}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    <Separator orientation="vertical" className="h-8" />

                    <Tabs
                        value={view}
                        onValueChange={(value: 'month' | 'week' | 'schedule') => setView(value)}
                    >
                        <TabsList>
                            <TabsTrigger value="month" className="text-xs">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                Month
                            </TabsTrigger>
                            <TabsTrigger value="week" className="text-xs">
                                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                Week
                            </TabsTrigger>
                            <TabsTrigger value="schedule" className="text-xs">
                                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                                Schedule
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Calendar Content */}
            <ScrollArea className={view === 'week' ? "h-[calc(100vh-220px)] overflow-auto" : undefined}>
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'schedule' && renderScheduleView()}
            </ScrollArea>

            {/* Event Detail Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                selectedEvent && getEventTypeColor(selectedEvent.type, selectedEvent.isHighlighted)
                            )}>
                                {selectedEvent && getEventTypeIcon(selectedEvent.type)}
                            </div>
                            <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        </div>
                        <DialogDescription>
                            {selectedEvent && format(selectedEvent.date, 'EEEE, MMMM d, yyyy')}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                {selectedEvent.startTime && (
                                    <Badge variant="outline" className="flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-2" />
                                        {selectedEvent.startTime}
                                        {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                                    </Badge>
                                )}

                                <Badge variant="outline" className="flex items-center">
                                    {getEventTypeIcon(selectedEvent.type)}
                                    <span className="ml-2">{getEventTypeLabel(selectedEvent.type)}</span>
                                </Badge>

                                {selectedEvent.locationName && (
                                    <Badge variant="outline" className="flex items-center">
                                        <Map className="h-3.5 w-3.5 mr-2" />
                                        {selectedEvent.locationName}
                                    </Badge>
                                )}
                            </div>

                            {selectedEvent.notes && (
                                <div className="bg-secondary/20 p-3 rounded-lg">
                                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEvent.notes}
                                    </p>
                                </div>
                            )}

                            {/* Dining reservation details */}
                            {selectedEvent.type === 'dining' && selectedEvent.reservation && (
                                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-amber-800 mb-1 flex items-center">
                                        <Utensils className="h-4 w-4 mr-2" />
                                        Dining Reservation
                                    </h4>
                                    <div className="text-sm text-amber-700 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Restaurant:</span>
                                            <span className="font-medium">{selectedEvent.reservation.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Time:</span>
                                            <span className="font-medium">{selectedEvent.reservation.time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Party Size:</span>
                                            <span className="font-medium">{selectedEvent.reservation.partySize} people</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span className={cn(
                                                "font-medium",
                                                selectedEvent.reservation.confirmed ? "text-green-600" : "text-amber-600"
                                            )}>
                                                {selectedEvent.reservation.confirmed ? 'Confirmed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Weather details */}
                            {selectedEvent.weather && (
                                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-800 mb-1 flex items-center">
                                        {getWeatherIcon(selectedEvent.weather.condition)}
                                        <span className="ml-2">Weather Forecast</span>
                                    </h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Condition:</span>
                                            <span className="font-medium capitalize">{selectedEvent.weather.condition}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Temperature:</span>
                                            <span className="font-medium">
                                                {selectedEvent.weather.lowTemp}° - {selectedEvent.weather.highTemp}°F
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Precipitation:</span>
                                            <span className="font-medium">{selectedEvent.weather.precipitation}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4 mr-2" />
                                    Options
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Share Event
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        Delete Event
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button>
                            View Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Event Dialog */}
            <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Event</DialogTitle>
                        <DialogDescription>
                            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="event-title">Event Title</Label>
                            <Input
                                id="event-title"
                                placeholder="Enter event title"
                                value={newEventTitle}
                                onChange={(e) => setNewEventTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event-type">Event Type</Label>
                            <select
                                id="event-type"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                value={newEventType}
                                onChange={(e) => setNewEventType(e.target.value as CalendarEvent['type'])}
                            >
                                <option value="note">Note</option>
                                <option value="dining">Dining</option>
                                <option value="rest">Rest Day</option>
                                <option value="travel">Travel</option>
                                <option value="event">Special Event</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event-time">Time (optional)</Label>
                            <Input
                                id="event-time"
                                type="time"
                                value={newEventTime}
                                onChange={(e) => setNewEventTime(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="event-notes">Notes (optional)</Label>
                            <textarea
                                id="event-notes"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="Enter notes"
                                value={newEventNotes}
                                onChange={(e) => setNewEventNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddEvent}
                            disabled={!newEventTitle.trim()}
                        >
                            Add Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Cloud(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
    );
}