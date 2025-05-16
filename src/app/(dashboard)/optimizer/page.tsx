"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useItineraryOptimizer } from "@/engines/itinerary/optimizer"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Slider
} from "@/components/ui/slider"
import {
    Switch
} from "@/components/ui/switch"
import {
    Calendar
} from "@/components/ui/calendar"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import {
    CalendarIcon,
    InfoIcon,
    Loader2Icon,
    MapIcon,
    SaveIcon,
    Share2Icon,
    SlidersHorizontalIcon,
    TimerIcon,
    Users2Icon,
    WalkIcon
} from "lucide-react"
import OptimizerResults from "./components/optimizer-results"
import PartyConfigSection from "./components/party-config"
import TimePreferencesSection from "./components/time-preferences"
import AttractionPreferencesSection from "./components/attraction-preferences"
import MobilityOptionsSection from "./components/mobility-options"
import LightningLaneOptionsSection from "./components/lightning-lane-options"

// Define schema for optimizer form
const formSchema = z.object({
    // Park and date parameters
    parkId: z.string({
        required_error: "Please select a park",
    }),
    date: z.date({
        required_error: "Please select a date",
    }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),

    // Party parameters
    partySize: z.number().min(1, "Party size must be at least 1").max(20, "Maximum party size is 20"),
    hasChildren: z.boolean().default(false),
    childrenAges: z.array(z.number().min(0).max(17)).optional(),
    hasStroller: z.boolean().default(false),
    mobilityConsiderations: z.boolean().default(false),

    // Preference parameters
    ridePreference: z.enum(["thrill", "family", "all"]),
    maxWaitTime: z.number().min(0).max(240),
    walkingPace: z.enum(["slow", "moderate", "fast"]),
    breakDuration: z.number().min(0).max(240),
    lunchTime: z.string().optional(),
    dinnerTime: z.string().optional(),

    // Advanced parameters
    useGeniePlus: z.boolean().default(false),
    useIndividualLightningLane: z.boolean().default(false),
    maxLightningLaneBudget: z.number().optional(),
    accommodateHeight: z.boolean().default(true),
    rideRepeats: z.boolean().default(false),
    includeMeetAndGreets: z.boolean().default(true),
    includeShows: z.boolean().default(true),
    weatherAdaptation: z.boolean().default(true),
    crowdAvoidance: z.boolean().default(true),

    // Priority attractions (to be filled in dynamically)
    priorityAttractions: z.array(z.string()).default([]),
    excludedAttractions: z.array(z.string()).default([]),
})

type FormValues = z.infer<typeof formSchema>

export default function ItineraryOptimizerPage() {
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [optimizationResult, setOptimizationResult] = useState<any>(null)
    const { optimizeItinerary } = useItineraryOptimizer()

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            parkId: "",
            date: new Date(),
            partySize: 2,
            hasChildren: false,
            childrenAges: [],
            hasStroller: false,
            mobilityConsiderations: false,
            ridePreference: "all",
            maxWaitTime: 60,
            walkingPace: "moderate",
            breakDuration: 60,
            useGeniePlus: false,
            useIndividualLightningLane: false,
            accommodateHeight: true,
            rideRepeats: false,
            includeMeetAndGreets: true,
            includeShows: true,
            weatherAdaptation: true,
            crowdAvoidance: true,
            priorityAttractions: [],
            excludedAttractions: [],
        },
    })

    // Sample park options
    const parks = [
        { id: "magic-kingdom", name: "Magic Kingdom" },
        { id: "epcot", name: "EPCOT" },
        { id: "hollywood-studios", name: "Hollywood Studios" },
        { id: "animal-kingdom", name: "Animal Kingdom" },
    ]

    async function onSubmit(values: FormValues) {
        setIsOptimizing(true)

        try {
            // Convert form values to optimizer parameters format
            const optimizationParams = {
                parkId: values.parkId,
                date: format(values.date, "yyyy-MM-dd"),
                startTime: values.startTime,
                endTime: values.endTime,
                partySize: values.partySize,
                hasChildren: values.hasChildren,
                childrenAges: values.childrenAges,
                hasStroller: values.hasStroller,
                mobilityConsiderations: values.mobilityConsiderations,
                preferences: {
                    priorityAttractions: values.priorityAttractions,
                    excludedAttractions: values.excludedAttractions,
                    ridePreference: values.ridePreference,
                    maxWaitTime: values.maxWaitTime,
                    walkingPace: values.walkingPace,
                    breakDuration: values.breakDuration,
                    lunchTime: values.lunchTime,
                    dinnerTime: values.dinnerTime,
                },
                useGeniePlus: values.useGeniePlus,
                useIndividualLightningLane: values.useIndividualLightningLane,
                maxLightningLaneBudget: values.maxLightningLaneBudget,
                accommodateHeight: values.accommodateHeight,
                rideRepeats: values.rideRepeats,
                includeMeetAndGreets: values.includeMeetAndGreets,
                includeShows: values.includeShows,
                weatherAdaptation: values.weatherAdaptation,
                crowdAvoidance: values.crowdAvoidance,
            }

            // Call the optimizer engine
            const result = await optimizeItinerary(optimizationParams)
            setOptimizationResult(result)
        } catch (error) {
            console.error("Optimization failed:", error)
        } finally {
            setIsOptimizing(false)
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Itinerary Optimizer</h1>
                <p className="text-muted-foreground">
                    Create your perfect Disney day with our AI-powered itinerary planner.
                </p>
            </div>

            <Tabs defaultValue={optimizationResult ? "results" : "plan"}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="plan" disabled={isOptimizing}>
                        <SlidersHorizontalIcon className="mr-2 h-4 w-4" />
                        Configure
                    </TabsTrigger>
                    <TabsTrigger value="results" disabled={!optimizationResult && !isOptimizing}>
                        <MapIcon className="mr-2 h-4 w-4" />
                        Results
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="plan" className="mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Park & Date</CardTitle>
                                    <CardDescription>
                                        Select which park you plan to visit and the date of your visit.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="parkId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Disney Park</FormLabel>
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
                                                            {parks.map((park) => (
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
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Visit Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full pl-3 text-left font-normal"
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Pick a date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <TimePreferencesSection form={form} />
                                </CardContent>
                            </Card>

                            <PartyConfigSection form={form} />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ride Preferences</CardTitle>
                                    <CardDescription>
                                        Configure your preferences for attractions and experiences.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="ridePreference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ride Type Preference</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select ride preference" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="thrill">Thrill Rides</SelectItem>
                                                            <SelectItem value="family">Family Rides</SelectItem>
                                                            <SelectItem value="all">All Rides</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Focus on thrill rides, family-friendly experiences, or both.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="maxWaitTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Maximum Acceptable Wait Time: {field.value} minutes</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            defaultValue={[field.value]}
                                                            min={0}
                                                            max={240}
                                                            step={5}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Maximum time you're willing to wait for attractions.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="breakDuration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Break Time: {field.value} minutes</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            defaultValue={[field.value]}
                                                            min={0}
                                                            max={240}
                                                            step={10}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Total amount of break time to schedule throughout the day.
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
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select walking pace" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="slow">Slow</SelectItem>
                                                            <SelectItem value="moderate">Moderate</SelectItem>
                                                            <SelectItem value="fast">Fast</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        How quickly do you prefer to move through the park?
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-medium">Experience Types</h3>
                                            <InfoIcon className="h-4 w-4 text-muted-foreground ml-2" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="includeShows"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Shows & Entertainment</FormLabel>
                                                            <FormDescription>
                                                                Include shows in your plan
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
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Character Meets</FormLabel>
                                                            <FormDescription>
                                                                Include character experiences
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
                                                name="rideRepeats"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                        <div className="space-y-0.5">
                                                            <FormLabel>Repeat Rides</FormLabel>
                                                            <FormDescription>
                                                                Allow riding favorites more than once
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
                                </CardContent>
                            </Card>

                            <MobilityOptionsSection form={form} />

                            <LightningLaneOptionsSection form={form} />

                            <AttractionPreferencesSection form={form} parkId={form.watch("parkId")} />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Optimization Options</CardTitle>
                                    <CardDescription>
                                        Fine-tune your optimization settings for the perfect day.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="weatherAdaptation"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Weather Adaptation</FormLabel>
                                                        <FormDescription>
                                                            Adapt for weather conditions
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
                                            name="crowdAvoidance"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Crowd Avoidance</FormLabel>
                                                        <FormDescription>
                                                            Prioritize least crowded times
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
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Height Requirements</FormLabel>
                                                        <FormDescription>
                                                            Account for height restrictions
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
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isOptimizing}
                                    >
                                        {isOptimizing ? (
                                            <>
                                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                                Optimizing Your Itinerary...
                                            </>
                                        ) : (
                                            <>
                                                <TimerIcon className="mr-2 h-4 w-4" />
                                                Generate Optimized Itinerary
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="results">
                    {optimizationResult ? (
                        <OptimizerResults result={optimizationResult} />
                    ) : isOptimizing ? (
                        <Card className="w-full">
                            <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                                <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
                                <h3 className="text-xl font-semibold">Generating Your Perfect Disney Day</h3>
                                <p className="text-muted-foreground">
                                    Our AI is optimizing your itinerary based on wait times, preferences, and walking distances...
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </TabsContent>
            </Tabs>
        </div>
    )
}