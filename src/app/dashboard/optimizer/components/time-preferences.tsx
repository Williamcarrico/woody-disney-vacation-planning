"use client"

import { UseFormReturn } from "react-hook-form"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { AlarmClockIcon, CoffeeIcon, TimerIcon, UtensilsIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Type definition matching the form schema from the main optimizer page
type OptimizerFormData = {
    parkId: string
    date: Date
    startTime?: string
    endTime?: string
    partySize: number
    hasChildren: boolean
    childrenAges?: number[]
    hasStroller: boolean
    mobilityConsiderations: boolean
    ridePreference: "thrill" | "family" | "all"
    maxWaitTime: number
    walkingPace: "slow" | "moderate" | "fast"
    breakDuration: number
    lunchTime?: string
    dinnerTime?: string
    useGeniePlus: boolean
    useIndividualLightningLane: boolean
    maxLightningLaneBudget?: number
    accommodateHeight: boolean
    rideRepeats: boolean
    includeMeetAndGreets: boolean
    includeShows: boolean
    weatherAdaptation: boolean
    crowdAvoidance: boolean
    priorityAttractions: string[]
    excludedAttractions: string[]
}

interface TimePreferencesSectionProps {
    form: UseFormReturn<OptimizerFormData>
}

const HOURS = Array.from({ length: 24 }, (_, i) => ({
    value: `${i.toString().padStart(2, '0')}:00`,
    label: `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i >= 12 ? 'PM' : 'AM'}`
}))

export default function TimePreferencesSection({ form }: TimePreferencesSectionProps) {
    return (
        <div className="space-y-4">
            <Separator />

            <div className="flex items-center">
                <TimerIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-sm font-medium">Park Time Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <AlarmClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <SelectValue placeholder="Select start time" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {HOURS.slice(6, 13).map((time) => (
                                        <SelectItem key={time.value} value={time.value}>
                                            {time.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                When do you want to arrive at the park?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <TimerIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <SelectValue placeholder="Select end time" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {HOURS.slice(15, 24).map((time) => (
                                        <SelectItem key={time.value} value={time.value}>
                                            {time.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                When do you plan to leave the park?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Separator />

            <div className="flex items-center">
                <UtensilsIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <h3 className="text-sm font-medium">Meal Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="lunchTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lunch Time</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <CoffeeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <SelectValue placeholder="Select lunch time" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">No Preference</SelectItem>
                                    {HOURS.slice(11, 15).map((time) => (
                                        <SelectItem key={time.value} value={time.value}>
                                            {time.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                When would you prefer to have lunch?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="dinnerTime"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dinner Time</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <UtensilsIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <SelectValue placeholder="Select dinner time" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="">No Preference</SelectItem>
                                    {HOURS.slice(17, 22).map((time) => (
                                        <SelectItem key={time.value} value={time.value}>
                                            {time.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                When would you prefer to have dinner?
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    )
}