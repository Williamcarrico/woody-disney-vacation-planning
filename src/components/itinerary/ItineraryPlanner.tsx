import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from '@/components/ui/form';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Map,
    Users,
    AlertCircle,
    Sparkles,
    Wand2,
    Layers,
    CalendarDays,
    CheckIcon
} from 'lucide-react';
import { getWaltDisneyWorldParks } from '@/lib/api/themeParks';
import { useItineraryOptimizer } from '@/engines/itinerary/optimizer';

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

// Define form schema with Zod
const planningFormSchema = z.object({
    // Trip details
    tripName: z.string().min(1, "Please enter a name for your trip"),
    startDate: z.date({
        required_error: "Please select a start date",
    }),
    endDate: z.date({
        required_error: "Please select an end date",
    }),

    // Park days
    parkDays: z.array(z.object({
        date: z.date(),
        parkId: z.string().min(1, "Please select a park"),
        startTime: z.string(),
        endTime: z.string(),
        ridePreference: z.enum(['thrill', 'family', 'all']),
        maxWaitTime: z.number(),
    })),

    // Party details
    partySize: z.number().min(1).max(10),
    adultsCount: z.number().min(1),
    childrenCount: z.number(),
    hasChildrenUnder7: z.boolean(),
    childrenAges: z.array(z.number().min(0).max(17)).optional(),
    hasStroller: z.boolean().optional(),
    mobilityConsiderations: z.boolean().optional(),

    // Preferences
    rideRepeats: z.boolean().optional(),
    includeMeetAndGreets: z.boolean().optional(),
    includeShows: z.boolean().optional(),
    useGeniePlus: z.boolean().optional(),
    useIndividualLightningLane: z.boolean().optional(),
    maxLightningLaneBudget: z.number().optional(),
    breakDuration: z.number().min(0).max(240),
    walkingPace: z.enum(['slow', 'moderate', 'fast']),
    weatherAdaptation: z.boolean().optional(),
    accommodateHeight: z.boolean().optional(),

    // Priority attractions (to be populated dynamically)
    priorityAttractions: z.array(z.string()).optional(),
    excludedAttractions: z.array(z.string()).optional(),
}).superRefine(({ startDate, endDate }, ctx) => {
    if (endDate < startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after start date",
            path: ["endDate"],
        });
    }
});

type PlanningFormValues = z.infer<typeof planningFormSchema>;

// Default form values
const defaultValues: Partial<PlanningFormValues> = {
    tripName: "My Disney Vacation",
    partySize: 4,
    adultsCount: 2,
    childrenCount: 2,
    hasChildrenUnder7: true,
    childrenAges: [5, 8],
    hasStroller: true,
    mobilityConsiderations: false,
    rideRepeats: true,
    includeMeetAndGreets: true,
    includeShows: true,
    useGeniePlus: true,
    useIndividualLightningLane: false,
    maxLightningLaneBudget: 50,
    breakDuration: 90,
    walkingPace: 'moderate',
    weatherAdaptation: true,
    accommodateHeight: true,
    priorityAttractions: [],
    excludedAttractions: [],
};

// Interface for optimization results
interface OptimizationResult {
    date: Date;
    parkId: string;
    parkName: string;
    rideName?: string;
    waitTime?: number;
}

export default function ItineraryPlanner() {
    // State for the current step in the planning wizard
    const [currentStep, setCurrentStep] = useState<
        "trip-details" | "park-days" | "party-details" | "preferences" | "planning" | "review"
    >("trip-details");

    // State for optimization results
    const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[] | null>(null);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // Get the itinerary optimizer
    const { optimizeItinerary } = useItineraryOptimizer();

    // Fetch parks
    const { data: parks } = useQuery({
        queryKey: ['wdwParks'],
        queryFn: getWaltDisneyWorldParks,
    });

    // Initialize the form
    const form = useForm<PlanningFormValues>({
        resolver: zodResolver(planningFormSchema),
        defaultValues,
        mode: "onChange",
    });

    // Initialize field array for park days
    const { fields: parkDaysFields, append: appendParkDay, remove: removeParkDay } =
        useFieldArray({ name: "parkDays", control: form.control });

    // Instead of using useFieldArray for childrenAges, manage manually
    const watchChildrenAges = form.watch("childrenAges") || [];
    // Create fields objects compatible with how they were used before
    const childrenAgesFields = watchChildrenAges.map((age, index) => ({
        id: `child-${index}`,
        value: age
    }));

    const appendChildAge = useCallback((value: number) => {
        const currentAges = form.getValues("childrenAges") || [];
        form.setValue("childrenAges", [...currentAges, value]);
    }, [form]);

    const removeChildAge = useCallback((index: number) => {
        const currentAges = form.getValues("childrenAges") || [];
        form.setValue("childrenAges", currentAges.filter((_, i) => i !== index));
    }, [form]);

    // Watch form values for dynamic changes
    const watchStartDate = form.watch("startDate");
    const watchEndDate = form.watch("endDate");
    const watchChildrenCount = form.watch("childrenCount");
    const watchParkDays = form.watch("parkDays");

    // Calculate trip duration
    const tripDuration = useMemo(() => {
        if (watchStartDate && watchEndDate) {
            const diffTime = Math.abs(watchEndDate.getTime() - watchStartDate.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
        return 0;
    }, [watchStartDate, watchEndDate]);

    // Handle adding/removing children ages inputs based on children count
    useMemo(() => {
        const currentCount = childrenAgesFields.length;
        if (watchChildrenCount > currentCount) {
            // Add more child age inputs
            for (let i = currentCount; i < watchChildrenCount; i++) {
                appendChildAge(5 as unknown as never); // Default age
            }
        } else if (watchChildrenCount < currentCount) {
            // Remove excess child age inputs
            for (let i = currentCount - 1; i >= watchChildrenCount; i--) {
                removeChildAge(i);
            }
        }
    }, [watchChildrenCount, childrenAgesFields.length, appendChildAge, removeChildAge]);

    // Automatically populate park days based on trip dates
    useMemo(() => {
        if (watchStartDate && watchEndDate && parks) {
            // Clear existing park days if dates changed
            const currentDays = parkDaysFields.length;
            for (let i = currentDays - 1; i >= 0; i--) {
                removeParkDay(i);
            }

            // Add park days for each day in the trip
            let currentDate = new Date(watchStartDate);
            while (currentDate <= watchEndDate) {
                // Default to Magic Kingdom on day 1, Epcot on day 2, etc.
                const dayIndex = Math.floor((currentDate.getTime() - watchStartDate.getTime()) / (1000 * 60 * 60 * 24));
                let defaultParkId = "";

                if (parks && parks.length > 0) {
                    // Cycle through the parks
                    defaultParkId = parks[dayIndex % parks.length].id;
                }

                appendParkDay({
                    date: new Date(currentDate),
                    parkId: defaultParkId,
                    startTime: "09:00",
                    endTime: "21:00",
                    ridePreference: "all",
                    maxWaitTime: 90,
                });

                // Move to next day
                currentDate = dayjs(currentDate).add(1, 'day').toDate();
            }
        }
    }, [watchStartDate, watchEndDate, parks, appendParkDay, removeParkDay, parkDaysFields.length]);

    // Handle form submission - generate itinerary
    async function onSubmit(data: PlanningFormValues) {
        setIsOptimizing(true);

        try {
            // Process each day in the trip
            const results: OptimizationResult[] = [];

            for (const parkDay of data.parkDays) {
                // Format the date as YYYY-MM-DD
                const formattedDate = dayjs(parkDay.date).format('YYYY-MM-DD');

                // Convert time strings to ISO time strings
                const startTime = new Date(parkDay.date);
                const [startHour, startMinute] = parkDay.startTime.split(':').map(Number);
                startTime.setHours(startHour, startMinute, 0, 0);

                const endTime = new Date(parkDay.date);
                const [endHour, endMinute] = parkDay.endTime.split(':').map(Number);
                endTime.setHours(endHour, endMinute, 0, 0);

                // Create optimization parameters for the current day
                const optimizationParams = {
                    // Park and date parameters
                    parkId: parkDay.parkId,
                    date: formattedDate,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),

                    // Party parameters
                    partySize: data.partySize,
                    hasChildren: data.childrenCount > 0,
                    childrenAges: data.childrenAges || [],
                    hasStroller: data.hasStroller,
                    mobilityConsiderations: data.mobilityConsiderations,

                    // Preference parameters
                    preferences: {
                        priorityAttractions: data.priorityAttractions,
                        excludedAttractions: data.excludedAttractions,
                        ridePreference: parkDay.ridePreference,
                        maxWaitTime: parkDay.maxWaitTime,
                        walkingPace: data.walkingPace,
                        breakDuration: data.breakDuration,
                        lunchTime: dayjs(parkDay.date).set('hour', 12).set('minute', 0).toISOString(),
                        dinnerTime: dayjs(parkDay.date).set('hour', 18).set('minute', 0).toISOString(),
                    },

                    // Advanced parameters
                    useGeniePlus: data.useGeniePlus,
                    useIndividualLightningLane: data.useIndividualLightningLane,
                    maxLightningLaneBudget: data.maxLightningLaneBudget,
                    accommodateHeight: data.accommodateHeight,
                    rideRepeats: data.rideRepeats,
                    includeMeetAndGreets: data.includeMeetAndGreets,
                    includeShows: data.includeShows,
                    weatherAdaptation: data.weatherAdaptation,
                    crowdAvoidance: true,
                };

                // Call the optimizer to generate an itinerary for this day
                const dayResult = await optimizeItinerary(optimizationParams);

                // Add park info to the result
                const parkInfo = parks?.find(p => p.id === parkDay.parkId);

                results.push({
                    date: parkDay.date,
                    parkId: parkDay.parkId,
                    parkName: parkInfo?.name || 'Unknown Park',
                    ...dayResult,
                });
            }

            // Store the results
            setOptimizationResults(results);

            // Move to review step
            setCurrentStep("review");
        } catch (error) {
            console.error("Optimization error:", error);
            // Show error message to user
        } finally {
            setIsOptimizing(false);
        }
    }

    // Render the current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case "trip-details":
                return renderTripDetailsStep();
            case "park-days":
                return renderParkDaysStep();
            case "party-details":
                return renderPartyDetailsStep();
            case "preferences":
                return renderPreferencesStep();
            case "planning":
                return renderPlanningStep();
            case "review":
                return renderReviewStep();
            default:
                return null;
        }
    };

    // Render Trip Details step
    const renderTripDetailsStep = () => (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Getting Started</AlertTitle>
                <AlertDescription>
                    Let&apos;s start planning your magical Disney vacation! Enter your basic trip information below.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6">
                <FormField
                    control={form.control}
                    name="tripName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trip Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Disney Vacation" {...field} />
                            </FormControl>
                            <FormDescription>
                                Give your vacation plan a memorable name
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                                            onChange={(e) => {
                                                const date = e.target.value ? new Date(e.target.value) : null;
                                                if (date) field.onChange(date);
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    First day of your Disney vacation
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={field.value ? dayjs(field.value).format('YYYY-MM-DD') : ''}
                                            onChange={(e) => {
                                                const date = e.target.value ? new Date(e.target.value) : null;
                                                if (date) field.onChange(date);
                                            }}
                                            min={watchStartDate ? dayjs(watchStartDate).format('YYYY-MM-DD') : undefined}
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Last day of your Disney vacation
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {tripDuration > 0 && (
                    <Alert variant="default" className="bg-primary/10 border-primary/20">
                        <CalendarDays className="h-4 w-4" />
                        <AlertDescription className="text-foreground">
                            Your trip is {tripDuration} day{tripDuration !== 1 ? 's' : ''} long.
                            {tripDuration >= 5 && ' Perfect for experiencing all four parks!'}
                            {tripDuration < 4 && ' You may want to prioritize your must-visit parks.'}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    );

    // Render Park Days step
    const renderParkDaysStep = () => (
        <div className="space-y-6">
            <Alert>
                <Map className="h-4 w-4" />
                <AlertTitle>Plan Your Park Days</AlertTitle>
                <AlertDescription>
                    Decide which parks you want to visit on each day of your trip.
                </AlertDescription>
            </Alert>

            <div className="border rounded-lg">
                {parkDaysFields.map((field, index) => {
                    // Format the date for display
                    const date = new Date(field.date);
                    const formattedDate = dayjs(date).format('dddd, MMMM D, YYYY');

                    return (
                        <div key={field.id} className="border-b last:border-b-0">
                            <Accordion type="single" collapsible defaultValue={index === 0 ? `park-day-${index}` : undefined}>
                                <AccordionItem value={`park-day-${index}`} className="border-0">
                                    <AccordionTrigger className="px-4 py-3 text-left hover:no-underline hover:bg-secondary/40">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                {index + 1}
                                            </span>
                                            <span>{formattedDate}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 py-3 bg-secondary/10">
                                        <div className="grid gap-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`parkDays.${index}.parkId`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Park</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select a park" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {parks?.map(park => (
                                                                        <SelectItem key={park.id} value={park.id}>
                                                                            {park.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`parkDays.${index}.ridePreference`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ride Preference</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select preference" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="thrill">Thrill Rides</SelectItem>
                                                                    <SelectItem value="family">Family Rides</SelectItem>
                                                                    <SelectItem value="all">All Rides</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`parkDays.${index}.startTime`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Start Time</FormLabel>
                                                            <FormControl>
                                                                <Input type="time" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`parkDays.${index}.endTime`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>End Time</FormLabel>
                                                            <FormControl>
                                                                <Input type="time" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`parkDays.${index}.maxWaitTime`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Maximum Wait Time: {field.value} minutes
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Slider
                                                                    value={[field.value]}
                                                                    min={0}
                                                                    max={180}
                                                                    step={5}
                                                                    onValueChange={(value) => field.onChange(value[0])}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    );
                })}
            </div>

            {parkDaysFields.length === 0 && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Park Days</AlertTitle>
                    <AlertDescription>
                        Please add at least one park day to your itinerary. You need to set your trip dates first.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );

    // Render Party Details step
    const renderPartyDetailsStep = () => (
        <div className="space-y-6">
            <Alert>
                <Users className="h-4 w-4" />
                <AlertTitle>Tell Us About Your Party</AlertTitle>
                <AlertDescription>
                    Help us customize your itinerary by telling us who&apos;s coming along.
                </AlertDescription>
            </Alert>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="partySize"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Party Size</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Total number of people in your group
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="adultsCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adults</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Number of adults (18+)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="childrenCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Children</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={8}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Number of children (under 18)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {watchChildrenCount > 0 && (
                    <div className="space-y-4">
                        <FormLabel>Children&apos;s Ages</FormLabel>
                        <FormDescription>
                            This helps us recommend attractions appropriate for your children&apos;s ages and heights.
                        </FormDescription>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {childrenAgesFields.map((field, index) => (
                                <FormField
                                    key={field.id}
                                    control={form.control}
                                    name={`childrenAges.${index}`}
                                    render={({ field: inputField }) => (
                                        <FormItem>
                                            <FormLabel>Child {index + 1}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={17}
                                                    {...inputField}
                                                    onChange={(e) => inputField.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="hasStroller"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Stroller</FormLabel>
                                    <FormDescription>
                                        Will you be using a stroller during your visit?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mobilityConsiderations"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Mobility Considerations</FormLabel>
                                    <FormDescription>
                                        Does anyone in your party have mobility considerations?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );

    // Render Preferences step
    const renderPreferencesStep = () => (
        <div className="space-y-6">
            <Alert>
                <Layers className="h-4 w-4" />
                <AlertTitle>Customize Your Experience</AlertTitle>
                <AlertDescription>
                    Fine-tune your plan with these preferences.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="rideRepeats"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Repeat Rides</FormLabel>
                                <FormDescription>
                                    Allow repeating favorite rides in your itinerary
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="includeMeetAndGreets"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Character Meet & Greets</FormLabel>
                                <FormDescription>
                                    Include character experiences in your plan
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="includeShows"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Shows & Entertainment</FormLabel>
                                <FormDescription>
                                    Include shows and entertainment in your plan
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="accommodateHeight"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Height Requirements</FormLabel>
                                <FormDescription>
                                    Account for height restrictions for children
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>

            <Separator />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Lightning Lane & Genie+</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Optimize your day with Disney&apos;s skip-the-line options
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="useGeniePlus"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Use Genie+</FormLabel>
                                    <FormDescription>
                                        Use Genie+ service for Lightning Lane access
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="useIndividualLightningLane"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Individual Lightning Lane</FormLabel>
                                    <FormDescription>
                                        Purchase Individual Lightning Lane passes
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch("useIndividualLightningLane") && (
                    <FormField
                        control={form.control}
                        name="maxLightningLaneBudget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Maximum Lightning Lane Budget: ${field.value} per day
                                </FormLabel>
                                <FormControl>
                                    <Slider
                                        value={[field.value || 0]}
                                        min={0}
                                        max={200}
                                        step={5}
                                        onValueChange={(value) => field.onChange(value[0])}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Set your maximum budget for Individual Lightning Lane purchases per day
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>

            <Separator />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">Touring Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Personalize your touring style
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="breakDuration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Break Time: {field.value} minutes
                            </FormLabel>
                            <FormControl>
                                <Slider
                                    value={[field.value]}
                                    min={0}
                                    max={240}
                                    step={15}
                                    onValueChange={(value) => field.onChange(value[0])}
                                />
                            </FormControl>
                            <FormDescription>
                                Total time for breaks (rest, meals, etc.) during your park day
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="walkingPace"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Walking Pace</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select walking pace" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="slow">Slow - Take our time</SelectItem>
                                    <SelectItem value="moderate">Moderate - Steady pace</SelectItem>
                                    <SelectItem value="fast">Fast - Cover ground quickly</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose your preferred walking pace throughout the park
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="weatherAdaptation"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Weather Adaptation</FormLabel>
                                <FormDescription>
                                    Adapt plan for weather conditions (rain, heat)
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );

    // Render Planning step
    const renderPlanningStep = () => (
        <div className="space-y-6">
            <Alert className="bg-primary/10 border-primary/20">
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Ready to Create Your Perfect Itinerary</AlertTitle>
                <AlertDescription>
                    We&apos;ll use your preferences to generate an optimized itinerary for each day of your trip.
                    This process takes all factors into account including wait times, walking distances, and your personal preferences.
                </AlertDescription>
            </Alert>

            <div className="bg-secondary/30 rounded-lg p-6 text-center space-y-6">
                <Sparkles className="h-12 w-12 mx-auto text-primary" />

                <div>
                    <h3 className="text-xl font-medium">Your Personalized Disney Itinerary</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Our advanced optimization engine will create the perfect plan for your {tripDuration}-day Disney vacation
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center">
                        <span className="text-sm font-medium mr-2">Parks:</span>
                        <div className="flex flex-wrap gap-1 justify-center">
                            {watchParkDays?.map((day, index) => {
                                const park = parks?.find(p => p.id === day.parkId);
                                return park ? (
                                    <Badge key={`${day.date.toISOString()}-${park.id}-${index}`} variant="secondary">
                                        {park.name}
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <span className="text-sm font-medium mr-2">Party:</span>
                        <Badge variant="outline">
                            {form.watch("adultsCount")} {form.watch("adultsCount") === 1 ? "Adult" : "Adults"}
                            {form.watch("childrenCount") > 0 && ` & ${form.watch("childrenCount")} ${form.watch("childrenCount") === 1 ? "Child" : "Children"}`}
                        </Badge>
                    </div>
                </div>

                <Button
                    className="w-full max-w-md mx-auto"
                    size="lg"
                    onClick={() => form.handleSubmit(onSubmit)()}
                    disabled={isOptimizing}
                >
                    {isOptimizing ? (
                        <>
                            <span className="animate-spin mr-2">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            {' '}Creating Your Itinerary...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate My Optimized Itinerary
                        </>
                    )}
                </Button>
            </div>

            <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">What&apos;s included in your itinerary:</h3>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Day-by-day, hour-by-hour itinerary optimized for shortest wait times</span>
                    </li>
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Customized plans matching your party composition and preferences</span>
                    </li>
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Strategic rest breaks and meal times to keep everyone happy</span>
                    </li>
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Efficient routes to minimize walking and maximize experiences</span>
                    </li>
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Alternative plans for different conditions (rain, crowds, etc.)</span>
                    </li>
                    <li className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>Lightning Lane and Genie+ recommendations for optimal time savings</span>
                    </li>
                </ul>
            </div>
        </div>
    );

    // Render Review step
    const renderReviewStep = () => (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Review</AlertTitle>
                <AlertDescription>
                    Review your itinerary before confirming.
                </AlertDescription>
            </Alert>

            {optimizationResults?.map((result: OptimizationResult, index: number) => (
                <div key={`${result.date.toISOString()}-${result.parkId}-${index}`} className="space-y-2">
                    <h3 className="text-lg font-semibold">{result.parkName}</h3>
                    <p>Date: {dayjs(result.date).format('MMM D, YYYY')}</p>
                    {result.rideName && <p>Ride: {result.rideName}</p>}
                    {result.waitTime !== undefined && <p>Wait Time: {result.waitTime} minutes</p>}
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {renderStepContent()}
        </div>
    );
}