'use client';

import { useMemo, useEffect, useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(duration);
dayjs.extend(relativeTime);

// Framer Motion for animations
import { motion, AnimatePresence } from 'framer-motion';

// React Hook Form for advanced forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Icons
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
    Filter,
    Download,
    Settings,
    Share2,
    Printer,
    RefreshCw,
    AlertCircle,
    CalendarPlus,
    CalendarHeart,
    CalendarDays,
    CalendarRange,
    List,
    MapPin,
    Activity,
    BarChart3,
} from 'lucide-react';

// UI Components
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

// Magic UI Components - Only import what exists
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AvatarCircles } from "@/components/magicui/avatar-circles";

// Custom hooks and utilities
import { Vacation } from '@/lib/firebase/vacations';
import { Timestamp } from "firebase/firestore";

// Calendar Events Service
import { updateCalendarEvent, CalendarEventServiceError } from '@/lib/services/calendar-events';

// Enhanced Types and Interfaces
interface WeatherData {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'partly-cloudy' | 'windy';
    highTemp: number;
    lowTemp: number;
    precipitation: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    visibility: number;
    sunrise: string;
    sunset: string;
    moonPhase: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
    alerts?: Array<{
        type: 'warning' | 'watch' | 'advisory';
        title: string;
        description: string;
    }>;
}

interface ParkHours {
    parkId: string;
    openTime: string;
    closeTime: string;
    magicHours?: {
        morning?: { start: string; end: string };
        evening?: { start: string; end: string };
    };
    specialEvents?: Array<{
        name: string;
        startTime: string;
        endTime: string;
        requiresTicket: boolean;
    }>;
}

interface CrowdLevel {
    level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    label: 'ghost-town' | 'very-light' | 'light' | 'moderate' | 'heavy' | 'very-heavy' | 'packed' | 'insane';
    waitTimeMultiplier: number;
    recommendations: string[];
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    type: 'park' | 'dining' | 'resort' | 'travel' | 'rest' | 'event' | 'note' | 'fastpass' | 'photo' | 'shopping' | 'entertainment';
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'planned' | 'confirmed' | 'completed' | 'cancelled' | 'modified';
    parkId?: string;
    attractionId?: string;
    locationName?: string;
    isHighlighted?: boolean;
    notes?: string;
    tags?: string[];
    color?: string;
    icon?: string;
    participants?: string[];
    reminder?: {
        enabled: boolean;
        time: string;
        type: 'notification' | 'email' | 'sms';
    };
    reservation?: {
        id: string;
        name: string;
        time: string;
        partySize: number;
        confirmed: boolean;
        confirmationNumber?: string;
        specialRequests?: string;
        cost?: number;
        prepaid?: boolean;
    };
    weather?: WeatherData;
    parkHours?: ParkHours;
    crowdLevel?: CrowdLevel;
    attachments?: Array<{
        type: 'image' | 'document' | 'link';
        url: string;
        title: string;
        thumbnail?: string;
    }>;
    recurring?: {
        pattern: 'daily' | 'weekly' | 'monthly';
        interval: number;
        endDate?: Date;
        exceptions?: Date[];
    };
    budget?: {
        estimated: number;
        actual?: number;
        currency: string;
        category: string;
    };
    transportation?: {
        type: 'bus' | 'monorail' | 'boat' | 'skyliner' | 'car' | 'uber' | 'walk';
        pickupLocation?: string;
        pickupTime?: string;
        duration?: number;
    };
    checklist?: Array<{
        id: string;
        task: string;
        completed: boolean;
        dueTime?: string;
    }>;
}

interface CalendarPreferences {
    defaultView: 'month' | 'week' | 'day' | 'schedule' | 'timeline' | 'year';
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    timeFormat: '12h' | '24h';
    dateFormat: string;
    showWeekNumbers: boolean;
    showWeather: boolean;
    showCrowdLevels: boolean;
    showParkHours: boolean;
    compactMode: boolean;
    colorScheme: 'default' | 'pastel' | 'vibrant' | 'monochrome' | 'custom';
    eventColors: Record<CalendarEvent['type'], string>;
    animations: boolean;
    hapticFeedback: boolean;
    autoSave: boolean;
    syncEnabled: boolean;
    notifications: {
        enabled: boolean;
        defaultTime: string;
        types: CalendarEvent['type'][];
    };
}

interface CalendarFilters {
    types: CalendarEvent['type'][];
    parks: string[];
    participants: string[];
    priority: CalendarEvent['priority'][];
    status: CalendarEvent['status'][];
    tags: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    searchQuery?: string;
}

interface CalendarAnalytics {
    totalEvents: number;
    eventsByType: Record<CalendarEvent['type'], number>;
    completionRate: number;
    averageEventsPerDay: number;
    busiestDay: Date;
    totalBudget: number;
    spentBudget: number;
    upcomingReminders: number;
    weatherAlerts: number;
    conflictingEvents: Array<{
        event1: CalendarEvent;
        event2: CalendarEvent;
        type: 'time' | 'location';
    }>;
    recommendations: Array<{
        type: 'tip' | 'warning' | 'suggestion';
        title: string;
        description: string;
        action?: () => void;
    }>;
}

type CalendarViewType = 'month' | 'week' | 'day' | 'schedule' | 'timeline' | 'year' | 'agenda' | 'photos' | 'map';

interface Collaborator {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    permissions: 'view' | 'edit' | 'admin';
}

interface ParkDay {
    date: Timestamp;
    startTime?: string;
    endTime?: string;
    parkId: string;
    notes?: string;
}

interface WeatherDataEntry {
    date: Date;
    weather: WeatherData;
}

interface VacationCalendarProps {
    readonly vacationId: string;
    readonly initialDate?: Date;
    readonly view?: CalendarViewType;
    readonly preferences?: Partial<CalendarPreferences>;
    readonly filters?: Partial<CalendarFilters>;
    readonly readOnly?: boolean;
    readonly collaborators?: Collaborator[];
}

// Event validation schema
const eventFormSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    type: z.enum(['park', 'dining', 'resort', 'travel', 'rest', 'event', 'note', 'fastpass', 'photo', 'shopping', 'entertainment']),
    date: z.date(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    status: z.enum(['planned', 'confirmed', 'completed', 'cancelled', 'modified']),
    locationName: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    participants: z.array(z.string()).optional(),
    reminderEnabled: z.boolean().optional(),
    reminderTime: z.string().optional(),
    budget: z.number().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

// Animation variants
const calendarAnimations = {
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.02,
                delayChildren: 0.1,
            }
        }
    },
    item: {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 300
            }
        }
    },
    slideIn: {
        hidden: { x: -20, opacity: 0 },
        show: { x: 0, opacity: 1 }
    },
    fadeIn: {
        hidden: { opacity: 0 },
        show: { opacity: 1 }
    },
    scaleIn: {
        hidden: { scale: 0.9, opacity: 0 },
        show: { scale: 1, opacity: 1 }
    }
};

// Default preferences
const defaultPreferences: CalendarPreferences = {
    defaultView: 'month',
    weekStartsOn: 0,
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    showWeekNumbers: false,
    showWeather: true,
    showCrowdLevels: true,
    showParkHours: true,
    compactMode: false,
    colorScheme: 'vibrant',
    eventColors: {
        park: '#22c55e',
        dining: '#f59e0b',
        resort: '#3b82f6',
        travel: '#8b5cf6',
        rest: '#14b8a6',
        event: '#ec4899',
        note: '#6b7280',
        fastpass: '#f97316',
        photo: '#a855f7',
        shopping: '#84cc16',
        entertainment: '#06b6d4'
    },
    animations: true,
    hapticFeedback: true,
    autoSave: true,
    syncEnabled: true,
    notifications: {
        enabled: true,
        defaultTime: '1h',
        types: ['park', 'dining', 'event', 'fastpass']
    }
};

// Mock functions with enhanced data
const createMockTimestamp = (date: Date): Timestamp => {
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    return {
        seconds,
        nanoseconds,
        toDate: () => date,
        toMillis: () => date.getTime(),
        isEqual: () => false,
        toJSON: () => ({ seconds, nanoseconds }),
        valueOf: () => `${seconds}.${nanoseconds}`
    } satisfies Timestamp;
};

// Mock functions to replace the missing Firebase functions
// These would be replaced with actual implementations in a real app
const getVacation = async (vacationId: string): Promise<Vacation & {
    parkDays?: ParkDay[]
}> => {
    const startDate = createMockTimestamp(new Date('2024-03-01'));
    const endDate = createMockTimestamp(new Date('2024-03-08'));
    const now = createMockTimestamp(new Date());

    return {
        id: vacationId,
        name: 'Magical Disney World Adventure 2024',
        startDate,
        endDate,
        destination: 'Walt Disney World',
        userId: 'user123',
        createdAt: now,
        updatedAt: now,
        status: 'planning',
        parkDays: [
            {
                date: createMockTimestamp(new Date('2024-03-02')),
                parkId: 'magickingdom',
                startTime: '08:00',
                endTime: '23:00',
                notes: 'Early Magic Hours - Rope drop Seven Dwarfs Mine Train!'
            },
            {
                date: createMockTimestamp(new Date('2024-03-03')),
                parkId: 'epcot',
                startTime: '09:00',
                endTime: '21:00',
                notes: 'Flower & Garden Festival - Lunch at Space 220'
            },
            {
                date: createMockTimestamp(new Date('2024-03-04')),
                parkId: 'hollywoodstudios',
                startTime: '08:30',
                endTime: '21:30',
                notes: 'Rise of the Resistance boarding group strategy'
            },
            {
                date: createMockTimestamp(new Date('2024-03-05')),
                parkId: 'animalkingdom',
                startTime: '08:00',
                endTime: '20:00',
                notes: 'Flight of Passage first thing - Tusker House breakfast'
            }
        ]
    };
};

// Component definition
export default function VacationCalendar({
    vacationId,
    initialDate,
    view: initialView = 'month',
    preferences: userPreferences,
    filters: initialFilters,
    readOnly = false,
    collaborators = []
}: VacationCalendarProps) {
    const queryClient = useQueryClient();

    // State management
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [view, setView] = useState<CalendarViewType>(initialView);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

    // Preferences
    const preferences = useMemo(() => ({
        ...defaultPreferences,
        ...userPreferences
    }), [userPreferences]);

    // Filters
    const [filters] = useState<CalendarFilters>({
        types: initialFilters?.types || ['park', 'dining', 'resort', 'travel', 'rest', 'event', 'note', 'fastpass', 'photo', 'shopping', 'entertainment'],
        parks: initialFilters?.parks || [],
        participants: initialFilters?.participants || [],
        priority: initialFilters?.priority || ['low', 'medium', 'high', 'critical'],
        status: initialFilters?.status || ['planned', 'confirmed', 'completed', 'cancelled', 'modified'],
        tags: initialFilters?.tags || [],
        dateRange: initialFilters?.dateRange,
        searchQuery: initialFilters?.searchQuery
    });

    // Form setup
    const eventForm = useForm<EventFormData>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            type: 'note',
            priority: 'medium',
            status: 'planned'
        }
    });

    // Query for vacation data
    const {
        data: vacation,
        isLoading: isLoadingVacation,
        error: vacationError
    } = useQuery({
        queryKey: ['vacation', vacationId],
        queryFn: () => getVacation(vacationId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Mock weather data (in real app, this would be another query)
    const weatherData = useMemo(() => {
        if (!vacation) return [];

        const days = dayjs(vacation.endDate.toDate()).diff(dayjs(vacation.startDate.toDate()), 'day') + 1;
        return Array.from({ length: days }, (_, i) => ({
            date: dayjs(vacation.startDate.toDate()).add(i, 'day').toDate(),
            weather: {
                condition: 'sunny' as const,
                highTemp: 82,
                lowTemp: 68,
                precipitation: 10,
                humidity: 65,
                windSpeed: 8,
                uvIndex: 8,
                visibility: 10,
                sunrise: '06:45',
                sunset: '19:30',
                moonPhase: 'waxing-gibbous' as const
            }
        }));
    }, [vacation]);

    // Mutation for event updates
    const updateEventMutation = useMutation({
        mutationFn: async (event: CalendarEvent) => {
            // Use the real API service instead of mock
            try {
                const updatedEvent = await updateCalendarEvent(
                    vacationId,
                    event.id,
                    {
                        title: event.title,
                        date: event.date,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        type: event.type,
                        priority: event.priority,
                        status: event.status,
                        parkId: event.parkId,
                        attractionId: event.attractionId,
                        locationName: event.locationName,
                        isHighlighted: event.isHighlighted,
                        notes: event.notes,
                        tags: event.tags,
                        color: event.color,
                        icon: event.icon,
                        participants: event.participants,
                        reminder: event.reminder,
                        reservation: event.reservation,
                        weather: event.weather,
                        budget: event.budget,
                        transportation: event.transportation,
                        checklist: event.checklist,
                        attachments: event.attachments
                    }
                );
                return updatedEvent;
            } catch (error) {
                // Handle different types of errors appropriately
                if (error instanceof CalendarEventServiceError) {
                    // Re-throw service errors with context
                    throw new Error(`${error.message} (${error.code})`);
                }

                // Handle unexpected errors
                console.error('Unexpected error updating calendar event:', error);
                throw new Error('An unexpected error occurred while updating the event');
            }
        },
        onSuccess: (event) => {
            queryClient.invalidateQueries({ queryKey: ['events', vacationId] });
            queryClient.invalidateQueries({ queryKey: ['vacation', vacationId] });
            toast({
                title: "Event updated",
                description: `${event.title} has been updated successfully.`,
            });
        },
        onError: (error: Error) => {
            console.error('Failed to update event:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to update event. Please try again.",
                variant: "destructive",
            });
        }
    });

    // Generate comprehensive events based on vacation data
    const events = useMemo(() => {
        const allEvents: CalendarEvent[] = [];

        if (!vacation) return allEvents;

        const startDate = vacation.startDate.toDate();
        const endDate = vacation.endDate.toDate();

        // Add park days with enhanced data
        if (vacation.parkDays) {
            vacation.parkDays.forEach((day: ParkDay, index: number) => {
                const parkDate = day.date.toDate();
                const parkNames: Record<string, string> = {
                    'magickingdom': 'Magic Kingdom',
                    'epcot': 'EPCOT',
                    'hollywoodstudios': 'Hollywood Studios',
                    'animalkingdom': 'Animal Kingdom'
                };

                // Add park day event
                allEvents.push({
                    id: `park-${parkDate.toISOString()}`,
                    title: `${parkNames[day.parkId]} Adventure`,
                    date: parkDate,
                    startTime: day.startTime,
                    endTime: day.endTime,
                    type: 'park',
                    priority: 'high',
                    status: 'confirmed',
                    parkId: day.parkId,
                    notes: day.notes,
                    isHighlighted: true,
                    tags: ['theme-park', 'main-event'],
                    participants: collaborators.map((c: Collaborator) => c.id),
                    parkHours: {
                        parkId: day.parkId,
                        openTime: day.startTime || '09:00',
                        closeTime: day.endTime || '22:00',
                        magicHours: index === 0 ? {
                            morning: { start: '08:00', end: '09:00' }
                        } : undefined,
                        specialEvents: day.parkId === 'magickingdom' && index === 0 ? [{
                            name: 'Happily Ever After Fireworks',
                            startTime: '21:00',
                            endTime: '21:30',
                            requiresTicket: false
                        }] : undefined
                    },
                    crowdLevel: {
                        level: Math.min(10, Math.max(1, 5 + Math.floor(Math.random() * 5))) as CrowdLevel['level'],
                        label: 'moderate',
                        waitTimeMultiplier: 1.5,
                        recommendations: [
                            'Use Genie+ for popular attractions',
                            'Take midday break to avoid crowds',
                            'Mobile order lunch to save time'
                        ]
                    },
                    checklist: [
                        {
                            id: `checklist-${index}-1`,
                            task: 'Pack sunscreen and ponchos',
                            completed: false,
                            dueTime: day.startTime
                        },
                        {
                            id: `checklist-${index}-2`,
                            task: 'Charge MagicBands',
                            completed: false,
                            dueTime: dayjs(parkDate).subtract(1, 'day').format('HH:mm')
                        },
                        {
                            id: `checklist-${index}-3`,
                            task: 'Review park map and plan',
                            completed: false
                        }
                    ]
                });

                // Add Lightning Lane reservations
                if (day.parkId === 'magickingdom') {
                    allEvents.push({
                        id: `ll-${index}-1`,
                        title: 'Seven Dwarfs Mine Train - Lightning Lane',
                        date: parkDate,
                        startTime: '10:00',
                        endTime: '11:00',
                        type: 'fastpass',
                        priority: 'high',
                        status: 'confirmed',
                        parkId: day.parkId,
                        attractionId: 'seven-dwarfs',
                        locationName: 'Fantasyland',
                        tags: ['lightning-lane', 'must-do'],
                        participants: collaborators.map((c: Collaborator) => c.id),
                        reminder: {
                            enabled: true,
                            time: '15m',
                            type: 'notification'
                        }
                    });

                    allEvents.push({
                        id: `ll-${index}-2`,
                        title: 'Space Mountain - Lightning Lane',
                        date: parkDate,
                        startTime: '14:00',
                        endTime: '15:00',
                        type: 'fastpass',
                        priority: 'medium',
                        status: 'confirmed',
                        parkId: day.parkId,
                        attractionId: 'space-mountain',
                        locationName: 'Tomorrowland',
                        tags: ['lightning-lane', 'thrill-ride'],
                        participants: collaborators.map((c: Collaborator) => c.id)
                    });
                }
            });
        }

        // Add travel days with detailed info
        allEvents.push({
            id: `travel-arrival`,
            title: 'Magical Journey Begins! ✈️',
            date: startDate,
            startTime: '10:00',
            endTime: '14:00',
            type: 'travel',
            priority: 'critical',
            status: 'confirmed',
            locationName: 'Orlando International Airport',
            notes: 'Southwest Flight 1234 - Gate B15\nConfirmation: ABC123\nMagical Express pickup at 14:30',
            tags: ['arrival', 'transportation'],
            participants: collaborators.map((c: Collaborator) => c.id),
            transportation: {
                type: 'bus',
                pickupLocation: 'Level 1, Spot B',
                pickupTime: '14:30',
                duration: 45
            },
            checklist: [
                {
                    id: 'arrival-1',
                    task: 'Check-in online 24 hours before',
                    completed: false,
                    dueTime: dayjs(startDate).subtract(1, 'day').format('HH:mm')
                },
                {
                    id: 'arrival-2',
                    task: 'Print boarding passes',
                    completed: false
                },
                {
                    id: 'arrival-3',
                    task: 'Pack carry-on with essentials',
                    completed: false
                }
            ],
            budget: {
                estimated: 0,
                currency: 'USD',
                category: 'transportation'
            }
        });

        allEvents.push({
            id: `travel-departure`,
            title: 'Until Next Time! 👋',
            date: endDate,
            startTime: '15:00',
            endTime: '19:00',
            type: 'travel',
            priority: 'critical',
            status: 'planned',
            locationName: 'Orlando International Airport',
            notes: 'Southwest Flight 5678 - Gate A22\nLeave resort by 12:00 PM',
            tags: ['departure', 'transportation'],
            participants: collaborators.map((c: Collaborator) => c.id),
            transportation: {
                type: 'bus',
                pickupLocation: 'Resort Lobby',
                pickupTime: '12:00',
                duration: 45
            },
            reminder: {
                enabled: true,
                time: '12h',
                type: 'notification'
            }
        });

        // Add resort check-in
        allEvents.push({
            id: 'resort-checkin',
            title: 'Check-in at Grand Floridian Resort',
            date: startDate,
            startTime: '15:00',
            type: 'resort',
            priority: 'high',
            status: 'confirmed',
            locationName: "Disney's Grand Floridian Resort & Spa",
            notes: 'Reservation: 123456789\nRoom type: Theme Park View\nOnline check-in available',
            tags: ['resort', 'check-in'],
            participants: collaborators.map((c: Collaborator) => c.id),
            attachments: [{
                type: 'document',
                url: '/reservations/grand-floridian.pdf',
                title: 'Resort Reservation'
            }]
        });

        // Add dining reservations with rich details
        const diningReservations = [
            {
                id: 'dining-1',
                title: "Be Our Guest Restaurant",
                date: dayjs(startDate).add(1, 'day').toDate(),
                startTime: '18:30',
                endTime: '20:00',
                locationName: 'Fantasyland, Magic Kingdom',
                notes: 'Pre-order available in My Disney Experience app',
                cost: 280,
                specialRequests: 'Window seat requested, celebrating anniversary'
            },
            {
                id: 'dining-2',
                title: "Space 220 Restaurant",
                date: dayjs(startDate).add(2, 'day').toDate(),
                startTime: '13:00',
                endTime: '14:30',
                locationName: 'Mission: SPACE, EPCOT',
                notes: 'Prix fixe menu - $79 per adult',
                cost: 320,
                specialRequests: 'Vegetarian option for one guest'
            },
            {
                id: 'dining-3',
                title: "Tusker House - Character Breakfast",
                date: dayjs(startDate).add(4, 'day').toDate(),
                startTime: '08:30',
                endTime: '10:00',
                locationName: 'Africa, Animal Kingdom',
                notes: 'Donald Duck and friends character dining',
                cost: 180,
                prepaid: true
            },
            {
                id: 'dining-4',
                title: "California Grill",
                date: dayjs(startDate).add(5, 'day').toDate(),
                startTime: '20:00',
                endTime: '22:00',
                locationName: "Contemporary Resort",
                notes: 'Fireworks viewing - arrive early for balcony access',
                cost: 350,
                specialRequests: 'Anniversary celebration - dessert surprise'
            }
        ];

        diningReservations.forEach(reservation => {
            allEvents.push({
                ...reservation,
                type: 'dining',
                priority: 'high',
                status: 'confirmed',
                tags: ['dining', 'table-service'],
                participants: collaborators.map((c: Collaborator) => c.id),
                reservation: {
                    id: reservation.id,
                    name: reservation.title,
                    time: reservation.startTime,
                    partySize: collaborators.length || 4,
                    confirmed: true,
                    confirmationNumber: `WDW${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    specialRequests: reservation.specialRequests,
                    cost: reservation.cost,
                    prepaid: reservation.prepaid || false
                },
                reminder: {
                    enabled: true,
                    time: '24h',
                    type: 'notification'
                },
                budget: {
                    estimated: reservation.cost,
                    currency: 'USD',
                    category: 'dining'
                }
            });
        });

        // Add special events and entertainment
        allEvents.push({
            id: 'event-1',
            title: "Mickey's Not-So-Scary Halloween Party",
            date: dayjs(startDate).add(3, 'day').toDate(),
            startTime: '19:00',
            endTime: '00:00',
            type: 'event',
            priority: 'high',
            status: 'confirmed',
            parkId: 'magickingdom',
            locationName: 'Magic Kingdom (Special Ticketed Event)',
            notes: 'Special parade, fireworks, and trick-or-treating\nCostumes encouraged!\nParty-exclusive character meet & greets',
            tags: ['special-event', 'halloween', 'after-hours'],
            participants: collaborators.map((c: Collaborator) => c.id),
            isHighlighted: true,
            budget: {
                estimated: 500,
                actual: 489,
                currency: 'USD',
                category: 'entertainment'
            },
            checklist: [
                {
                    id: 'mnsshp-1',
                    task: 'Pack costumes',
                    completed: false
                },
                {
                    id: 'mnsshp-2',
                    task: 'Bring trick-or-treat bags',
                    completed: false
                },
                {
                    id: 'mnsshp-3',
                    task: 'Review party map for exclusive offerings',
                    completed: false
                }
            ]
        });

        // Add resort/rest day activities
        allEvents.push({
            id: 'rest-1',
            title: 'Resort Pool Day & Spa',
            date: dayjs(startDate).add(3, 'day').toDate(),
            startTime: '10:00',
            endTime: '16:00',
            type: 'rest',
            priority: 'medium',
            status: 'planned',
            locationName: 'Grand Floridian Pool & Spa',
            notes: "Spa appointment at 14:00 - Swedish Massage\nPool cabana reserved\nLunch at Narcoossee's",
            tags: ['relaxation', 'resort-day'],
            participants: collaborators.slice(0, 2).map((c: Collaborator) => c.id),
            budget: {
                estimated: 450,
                currency: 'USD',
                category: 'recreation'
            }
        });

        // Add shopping experiences
        allEvents.push({
            id: 'shopping-1',
            title: 'Disney Springs Shopping & Dining',
            date: dayjs(startDate).add(5, 'day').toDate(),
            startTime: '17:00',
            endTime: '22:00',
            type: 'shopping',
            priority: 'low',
            status: 'planned',
            locationName: 'Disney Springs',
            notes: 'World of Disney for souvenirs\nDinner at The BOATHOUSE\nCatch live entertainment at the Amphitheater',
            tags: ['shopping', 'dining', 'entertainment'],
            participants: collaborators.map((c: Collaborator) => c.id),
            transportation: {
                type: 'boat',
                pickupLocation: 'Grand Floridian Boat Dock',
                pickupTime: '16:30',
                duration: 20
            },
            budget: {
                estimated: 300,
                currency: 'USD',
                category: 'shopping'
            }
        });

        // Add photo opportunities
        allEvents.push({
            id: 'photo-1',
            title: 'Capture the Magic Photo Package',
            date: dayjs(startDate).add(1, 'day').toDate(),
            type: 'photo',
            priority: 'medium',
            status: 'confirmed',
            locationName: 'All Parks',
            notes: 'Memory Maker purchased - unlimited PhotoPass downloads\nSpecial photo ops at each park\nMagic Shots available',
            tags: ['photography', 'memories'],
            participants: collaborators.map((c: Collaborator) => c.id),
            attachments: [{
                type: 'link',
                url: 'https://mydisneyphotopass.disney.go.com',
                title: 'PhotoPass Website'
            }]
        });

        // Add weather data to each day
        if (weatherData) {
            weatherData.forEach(({ date, weather }: WeatherDataEntry) => {
                const dateStr = dayjs(date).format('YYYY-MM-DD');
                const dayEvent = allEvents.find(e =>
                    dayjs(e.date).format('YYYY-MM-DD') === dateStr &&
                    e.type === 'park'
                );

                if (dayEvent) {
                    dayEvent.weather = weather;
                }
            });
        }

        return allEvents;
    }, [vacation, collaborators, weatherData]);

    // Filter events based on current filters
    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            // Type filter
            if (!filters.types.includes(event.type)) return false;

            // Status filter
            if (!filters.status.includes(event.status)) return false;

            // Priority filter
            if (!filters.priority.includes(event.priority)) return false;

            // Park filter
            if (filters.parks.length > 0 && event.parkId && !filters.parks.includes(event.parkId)) return false;

            // Participant filter
            if (filters.participants.length > 0 && event.participants) {
                const hasParticipant = event.participants.some(p => filters.participants.includes(p));
                if (!hasParticipant) return false;
            }

            // Tag filter
            if (filters.tags.length > 0 && event.tags) {
                const hasTag = event.tags.some(t => filters.tags.includes(t));
                if (!hasTag) return false;
            }

            // Date range filter
            if (filters.dateRange) {
                const eventDate = dayjs(event.date);
                if (!eventDate.isSameOrAfter(filters.dateRange.start) ||
                    !eventDate.isSameOrBefore(filters.dateRange.end)) {
                    return false;
                }
            }

            // Search query
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const searchableText = [
                    event.title,
                    event.notes,
                    event.locationName,
                    ...(event.tags || [])
                ].filter(Boolean).join(' ').toLowerCase();

                if (!searchableText.includes(query)) return false;
            }

            return true;
        });
    }, [events, filters]);

    // Group events by date
    const eventsByDate = useMemo(() => {
        const grouped: Record<string, CalendarEvent[]> = {};

        filteredEvents.forEach(event => {
            const dateStr = dayjs(event.date).format('YYYY-MM-DD');
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(event);
        });

        // Sort events within each date
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                // Sort by time first
                if (a.startTime && b.startTime) {
                    return a.startTime.localeCompare(b.startTime);
                }
                // Then by priority
                const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
        });

        return grouped;
    }, [filteredEvents]);

    // Calculate analytics
    const analytics = useMemo((): CalendarAnalytics => {
        const typeCount = filteredEvents.reduce((acc, event) => {
            acc[event.type] = (acc[event.type] || 0) + 1;
            return acc;
        }, {} as Record<CalendarEvent['type'], number>);

        const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
        const totalBudget = filteredEvents.reduce((sum, event) =>
            sum + (event.budget?.estimated || 0), 0
        );
        const spentBudget = filteredEvents.reduce((sum, event) =>
            sum + (event.budget?.actual || 0), 0
        );

        // Find conflicting events
        const conflicts: CalendarAnalytics['conflictingEvents'] = [];
        filteredEvents.forEach((event1, i) => {
            filteredEvents.slice(i + 1).forEach(event2 => {
                // Check time conflicts
                if (event1.startTime && event1.endTime &&
                    event2.startTime && event2.endTime &&
                    dayjs(event1.date).isSame(event2.date, 'day')) {

                    const start1 = dayjs(`2000-01-01 ${event1.startTime}`);
                    const end1 = dayjs(`2000-01-01 ${event1.endTime}`);
                    const start2 = dayjs(`2000-01-01 ${event2.startTime}`);
                    const end2 = dayjs(`2000-01-01 ${event2.endTime}`);

                    if ((start1.isSameOrAfter(start2) && start1.isBefore(end2)) ||
                        (end1.isAfter(start2) && end1.isSameOrBefore(end2))) {
                        conflicts.push({ event1, event2, type: 'time' });
                    }
                }
            });
        });

        // Generate recommendations
        const recommendations: CalendarAnalytics['recommendations'] = [];

        if (conflicts.length > 0) {
            recommendations.push({
                type: 'warning',
                title: 'Schedule Conflicts Detected',
                description: `You have ${conflicts.length} overlapping events that need attention.`,
                action: () => setShowAnalyticsPanel(true)
            });
        }

        const upcomingReminders = filteredEvents.filter(e =>
            e.reminder?.enabled &&
            dayjs(e.date).isAfter(dayjs()) &&
            dayjs(e.date).isBefore(dayjs().add(7, 'days'))
        ).length;

        if (upcomingReminders > 0) {
            recommendations.push({
                type: 'tip',
                title: 'Upcoming Reminders',
                description: `You have ${upcomingReminders} events with reminders in the next week.`
            });
        }

        return {
            totalEvents: filteredEvents.length,
            eventsByType: typeCount,
            completionRate: filteredEvents.length > 0 ? (completedEvents / filteredEvents.length) * 100 : 0,
            averageEventsPerDay: vacation ? filteredEvents.length / dayjs(vacation.endDate.toDate()).diff(dayjs(vacation.startDate.toDate()), 'day') : 0,
            busiestDay: Object.entries(eventsByDate).reduce((busiest, [date, events]) =>
                events.length > (eventsByDate[dayjs(busiest).format('YYYY-MM-DD')]?.length || 0) ? new Date(date) : busiest,
                new Date()
            ),
            totalBudget,
            spentBudget,
            upcomingReminders,
            weatherAlerts: weatherData?.filter((w: WeatherDataEntry) => w.weather.alerts && w.weather.alerts.length > 0).length || 0,
            conflictingEvents: conflicts,
            recommendations
        };
    }, [filteredEvents, eventsByDate, vacation, weatherData, setShowAnalyticsPanel]);

    // Event handlers
    const handleDateClick = useCallback((date: Date) => {
        if (readOnly) return;

        setSelectedDate(date);
        eventForm.reset({
            date,
            type: 'note',
            priority: 'medium',
            status: 'planned'
        });
    }, [readOnly, eventForm]);

    // Event update handler that uses the mutation
    const handleEventUpdate = useCallback((updatedEvent: CalendarEvent, options?: {
        skipValidation?: boolean;
        skipConflictCheck?: boolean;
        showToast?: boolean;
        optimistic?: boolean;
    }) => {
        if (readOnly) {
            toast({
                title: "Read-only mode",
                description: "Calendar is in read-only mode. Changes cannot be saved.",
                variant: "destructive",
            });
            return;
        }

        const {
            skipValidation = false,
            skipConflictCheck = false,
            showToast = true,
            optimistic = true
        } = options || {};

        // Validate event data unless explicitly skipped
        if (!skipValidation) {
            try {
                // Basic validation
                if (!updatedEvent.id || !updatedEvent.title?.trim()) {
                    throw new Error("Event must have an ID and title");
                }

                if (!updatedEvent.date || isNaN(updatedEvent.date.getTime())) {
                    throw new Error("Event must have a valid date");
                }

                // Validate time format if provided
                if (updatedEvent.startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updatedEvent.startTime)) {
                    throw new Error("Start time must be in HH:MM format");
                }

                if (updatedEvent.endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updatedEvent.endTime)) {
                    throw new Error("End time must be in HH:MM format");
                }

                // Validate time sequence
                if (updatedEvent.startTime && updatedEvent.endTime) {
                    const start = dayjs(`2000-01-01 ${updatedEvent.startTime}`);
                    const end = dayjs(`2000-01-01 ${updatedEvent.endTime}`);
                    if (end.isSameOrBefore(start)) {
                        throw new Error("End time must be after start time");
                    }
                }

                // Validate vacation date range
                if (vacation) {
                    const eventDate = dayjs(updatedEvent.date);
                    const vacationStart = dayjs(vacation.startDate.toDate());
                    const vacationEnd = dayjs(vacation.endDate.toDate());

                    if (eventDate.isBefore(vacationStart, 'day') || eventDate.isAfter(vacationEnd, 'day')) {
                        throw new Error("Event date must be within vacation dates");
                    }
                }

                // Validate budget if provided
                if (updatedEvent.budget && updatedEvent.budget.estimated < 0) {
                    throw new Error("Budget amount cannot be negative");
                }

                // Validate party size for reservations
                if (updatedEvent.reservation && updatedEvent.reservation.partySize < 1) {
                    throw new Error("Party size must be at least 1");
                }

            } catch (validationError) {
                if (showToast) {
                    toast({
                        title: "Validation Error",
                        description: validationError instanceof Error ? validationError.message : "Invalid event data",
                        variant: "destructive",
                    });
                }
                return;
            }
        }

        // Check for conflicts unless explicitly skipped
        if (!skipConflictCheck) {
            const conflicts = events.filter(existingEvent => {
                // Skip self
                if (existingEvent.id === updatedEvent.id) return false;

                // Check time conflicts on the same date
                if (updatedEvent.startTime && updatedEvent.endTime &&
                    existingEvent.startTime && existingEvent.endTime &&
                    dayjs(updatedEvent.date).isSame(existingEvent.date, 'day')) {

                    const newStart = dayjs(`2000-01-01 ${updatedEvent.startTime}`);
                    const newEnd = dayjs(`2000-01-01 ${updatedEvent.endTime}`);
                    const existingStart = dayjs(`2000-01-01 ${existingEvent.startTime}`);
                    const existingEnd = dayjs(`2000-01-01 ${existingEvent.endTime}`);

                    return (newStart.isSameOrAfter(existingStart) && newStart.isBefore(existingEnd)) ||
                        (newEnd.isAfter(existingStart) && newEnd.isSameOrBefore(existingEnd)) ||
                        (newStart.isBefore(existingStart) && newEnd.isAfter(existingEnd));
                }

                // Check for duplicate reservations
                if (updatedEvent.type === 'dining' && existingEvent.type === 'dining' &&
                    updatedEvent.reservation && existingEvent.reservation &&
                    updatedEvent.locationName === existingEvent.locationName &&
                    dayjs(updatedEvent.date).isSame(existingEvent.date, 'day')) {
                    return true;
                }

                return false;
            });

            if (conflicts.length > 0) {
                const conflictNames = conflicts.map(c => c.title).join(', ');
                if (showToast) {
                    toast({
                        title: "Schedule Conflict",
                        description: `This event conflicts with: ${conflictNames}. Continue anyway?`,
                        variant: "destructive",
                    });
                }
                // In a real app, you might want to show a confirmation dialog here
                // For now, we'll proceed with a warning
                console.warn('Schedule conflicts detected:', conflicts);
            }
        }

        // Perform optimistic update if enabled
        if (optimistic) {
            queryClient.setQueryData(['events', vacationId], (oldEvents: CalendarEvent[] | undefined) => {
                if (!oldEvents) return [updatedEvent];

                const eventIndex = oldEvents.findIndex(e => e.id === updatedEvent.id);
                if (eventIndex >= 0) {
                    const newEvents = [...oldEvents];
                    newEvents[eventIndex] = updatedEvent;
                    return newEvents;
                } else {
                    return [...oldEvents, updatedEvent];
                }
            });

            // Update analytics immediately for better UX
            queryClient.invalidateQueries({ queryKey: ['analytics', vacationId] });
        }

        // Development logging
        if (process.env.NODE_ENV === 'development') {
            console.log('Event update requested:', {
                id: updatedEvent.id,
                title: updatedEvent.title,
                type: updatedEvent.type,
                date: updatedEvent.date,
                changes: options
            });
        }

        // Trigger the mutation
        updateEventMutation.mutate(updatedEvent, {
            onSuccess: (savedEvent) => {
                if (showToast) {
                    // Show different messages based on update type
                    let message = `${savedEvent.title} has been updated successfully.`;

                    if (updatedEvent.status === 'completed') {
                        message = `${savedEvent.title} marked as completed! 🎉`;
                    } else if (updatedEvent.status === 'cancelled') {
                        message = `${savedEvent.title} has been cancelled.`;
                    } else if (updatedEvent.priority === 'critical') {
                        message = `${savedEvent.title} marked as high priority! ⚠️`;
                    }

                    toast({
                        title: "Event updated",
                        description: message,
                    });
                }

                // Handle side effects based on event type and changes
                if (updatedEvent.type === 'park' && updatedEvent.status === 'completed') {
                    // Check if this completes all park days
                    const parkEvents = events.filter(e => e.type === 'park');
                    const completedParks = parkEvents.filter(e => e.status === 'completed').length;

                    if (completedParks === parkEvents.length) {
                        toast({
                            title: "Vacation Complete! 🎊",
                            description: "You've completed all your park days! Hope you had a magical time!",
                        });
                    }
                }

                // Auto-update related events if needed
                if (updatedEvent.type === 'travel' && updatedEvent.status === 'completed') {
                    // Mark check-in events as ready if arrival is complete
                    const checkInEvents = events.filter(e =>
                        e.type === 'resort' &&
                        e.title.toLowerCase().includes('check-in') &&
                        dayjs(e.date).isSame(updatedEvent.date, 'day')
                    );

                    checkInEvents.forEach(checkIn => {
                        if (checkIn.status === 'planned') {
                            // Auto-update check-in status
                            handleEventUpdate(
                                { ...checkIn, status: 'confirmed' },
                                { skipConflictCheck: true, showToast: false }
                            );
                        }
                    });
                }

                // Handle reminder updates
                if (updatedEvent.reminder?.enabled &&
                    dayjs(updatedEvent.date).isAfter(dayjs()) &&
                    dayjs(updatedEvent.date).isBefore(dayjs().add(24, 'hours'))) {

                    // Schedule notification for upcoming events (in a real app)
                    console.log('Scheduling reminder for:', updatedEvent.title);
                }
            },
            onError: (error) => {
                // Revert optimistic update on error
                if (optimistic) {
                    queryClient.invalidateQueries({ queryKey: ['events', vacationId] });
                }

                if (showToast) {
                    toast({
                        title: "Update failed",
                        description: error.message || "Failed to update event. Please try again.",
                        variant: "destructive",
                    });
                }

                console.error('Failed to update event:', error);
            }
        });

        // Update selected date if the event date changed
        if (selectedDate && !dayjs(selectedDate).isSame(updatedEvent.date, 'day')) {
            setSelectedDate(updatedEvent.date);
        }

        // Haptic feedback on mobile devices (if supported and enabled)
        if (preferences.hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }, [
        readOnly,
        vacation,
        events,
        queryClient,
        vacationId,
        updateEventMutation,
        selectedDate,
        setSelectedDate,
        preferences.hapticFeedback
    ]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Cmd/Ctrl + N for new event
            if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !readOnly) {
                e.preventDefault();
                handleDateClick(selectedDate || new Date());
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [readOnly, selectedDate, handleDateClick]);

    // Auto-save effect
    useEffect(() => {
        if (!preferences.autoSave || readOnly) return;

        const saveTimer = setTimeout(() => {
            // In a real app, save to backend
            console.log('Auto-saving calendar data...');
        }, 2000);

        return () => clearTimeout(saveTimer);
    }, [filteredEvents, preferences.autoSave, readOnly]);

    // Navigation functions
    const navigatePrevious = () => {
        if (view === 'month') {
            setCurrentDate(dayjs(currentDate).subtract(1, 'month').toDate());
        } else if (view === 'week') {
            setCurrentDate(dayjs(currentDate).subtract(1, 'week').toDate());
        }
    };

    const navigateNext = () => {
        if (view === 'month') {
            setCurrentDate(dayjs(currentDate).add(1, 'month').toDate());
        } else if (view === 'week') {
            setCurrentDate(dayjs(currentDate).add(1, 'week').toDate());
        }
    };

    // Get date range for current view
    const dateRange = useMemo(() => {
        if (view === 'month') {
            const daysInMonth = dayjs(currentDate).daysInMonth();
            return Array.from({ length: daysInMonth }, (_, i) =>
                dayjs(currentDate).date(i + 1).toDate()
            );
        } else if (view === 'week') {
            const start = dayjs(currentDate).startOf('week');
            return Array.from({ length: 7 }, (_, i) =>
                start.add(i, 'day').toDate()
            );
        } else if (view === 'schedule' || view === 'timeline') {
            if (!vacation) return [];
            const start = dayjs(vacation.startDate.toDate());
            const end = dayjs(vacation.endDate.toDate());
            const days = end.diff(start, 'day') + 1;
            return Array.from({ length: days }, (_, i) =>
                start.add(i, 'day').toDate()
            );
        }
        return [];
    }, [currentDate, view, vacation]);

    // Loading states
    if (isLoadingVacation) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (vacationError || !vacation) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load vacation details. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <TooltipProvider>
            <div className="relative min-h-screen">
                {/* Background Pattern */}
                {preferences.animations && (
                    <div className="absolute inset-0 -z-10 opacity-5">
                        <AnimatedGridPattern
                            width={40}
                            height={40}
                            className="h-full w-full"
                        />
                    </div>
                )}

                {/* Main Content */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={calendarAnimations.container}
                    className="space-y-6"
                >
                    {/* Header */}
                    <motion.div
                        variants={calendarAnimations.item}
                        className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-sm p-6"
                    >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            {/* Title Section */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-20" />
                                        <CalendarHeart className="h-8 w-8 text-purple-600 relative" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {vacation.name}
                                        </h1>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-sm text-muted-foreground">
                                                {dayjs(vacation.startDate.toDate()).format('MMM D')} - {dayjs(vacation.endDate.toDate()).format('MMM D, YYYY')}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {dayjs(vacation.endDate.toDate()).diff(dayjs(vacation.startDate.toDate()), 'day') + 1} days
                                            </Badge>
                                            {analytics.totalEvents > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Activity className="h-3 w-3 mr-1" />
                                                    {analytics.totalEvents} events
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {/* Search Button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="relative"
                                >
                                    <Search className="h-4 w-4" />
                                    <span className="sr-only">Search events</span>
                                </Button>

                                {/* Filter Button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                                    className="relative"
                                >
                                    <Filter className="h-4 w-4" />
                                    {Object.values(filters).some(f =>
                                        Array.isArray(f) ? f.length > 0 : !!f
                                    ) && (
                                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                                        )}
                                </Button>

                                {/* Analytics Button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </Button>

                                {/* More Options */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>Calendar Options</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem>
                                                <Settings className="h-4 w-4 mr-2" />
                                                Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share Calendar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="h-4 w-4 mr-2" />
                                                Export Events
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Printer className="h-4 w-4 mr-2" />
                                                Print Calendar
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Sync Calendar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Add Event Button */}
                                {!readOnly && (
                                    <ShimmerButton
                                        onClick={() => handleDateClick(selectedDate || new Date())}
                                        className="gap-2"
                                    >
                                        <CalendarPlus className="h-4 w-4" />
                                        Add Event
                                    </ShimmerButton>
                                )}
                            </div>
                        </div>

                        {/* Collaborators */}
                        {collaborators.length > 0 && (
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                <span className="text-sm text-muted-foreground">Collaborators:</span>
                                <AvatarCircles
                                    avatarUrls={collaborators.map((c: Collaborator) => ({
                                        imageUrl: c.avatar || '/default-avatar.png',
                                        profileUrl: `/profile/${c.id}`
                                    }))}
                                    numPeople={collaborators.length}
                                />
                            </div>
                        )}

                        {/* Weather Alerts */}
                        {analytics.weatherAlerts > 0 && (
                            <Alert className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Weather Alert</AlertTitle>
                                <AlertDescription>
                                    {analytics.weatherAlerts} weather {analytics.weatherAlerts === 1 ? 'alert' : 'alerts'} for your trip dates.
                                </AlertDescription>
                            </Alert>
                        )}
                    </motion.div>

                    {/* View Controls */}
                    <motion.div
                        variants={calendarAnimations.item}
                        className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-sm p-4"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Navigation */}
                            <div className="flex items-center gap-2">
                                {(view === 'month' || view === 'week') && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={navigatePrevious}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="min-w-[200px] text-center">
                                            <h2 className="text-lg font-semibold">
                                                {view === 'month'
                                                    ? dayjs(currentDate).format('MMMM YYYY')
                                                    : `Week of ${dayjs(dateRange[0]).format('MMM D, YYYY')}`
                                                }
                                            </h2>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={navigateNext}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>

                                        <Separator orientation="vertical" className="h-8 mx-2" />

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentDate(new Date())}
                                        >
                                            Today
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* View Selector */}
                            <Tabs value={view} onValueChange={(v) => setView(v as CalendarViewType)}>
                                <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                                    <TabsTrigger value="month" className="gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Month</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="week" className="gap-1">
                                        <CalendarRange className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Week</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="schedule" className="gap-1">
                                        <List className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Schedule</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="timeline" className="gap-1">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Timeline</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="map" className="gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Map</span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </motion.div>

                    {/* Main Calendar Content */}
                    <motion.div
                        variants={calendarAnimations.item}
                        className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-sm overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {view === 'month' && (
                                <motion.div
                                    key="month-view"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Month view implementation will go here */}
                                    <div className="p-6">
                                        <div className="text-center text-muted-foreground">
                                            Month view - Enhanced implementation coming...
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'week' && (
                                <motion.div
                                    key="week-view"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Week view implementation will go here */}
                                    <div className="p-6">
                                        <div className="text-center text-muted-foreground">
                                            Week view - Enhanced implementation coming...
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {view === 'schedule' && (
                                <motion.div
                                    key="schedule-view"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Schedule view implementation will go here */}
                                    <div className="p-6">
                                        <div className="text-center text-muted-foreground">
                                            Schedule view - Enhanced implementation coming...
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Toaster for notifications */}
                <Toaster />
            </div>
        </TooltipProvider>
    );
}