"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "./settings-section"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import {
    Compass,
    Hotel,
    Utensils,
    Baby,
    Users,
    Calendar,
    Star,
    Sparkles
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

// Define the schema with proper defaults for all required fields
const vacationPreferencesSchema = z.object({
    groupSize: z.string().min(1, "Required"),
    travelWithChildren: z.boolean(),
    childrenAges: z.string().optional(),
    travelWithSeniors: z.boolean(),
    preferredResort: z.string().optional(),
    preferredDiningStyle: z.string(),
    mealBudget: z.number().min(0),
    preferredAttractionType: z.string(),
    tripLength: z.string(),
    fastPassPriority: z.boolean(),
})

type VacationPreferencesValues = z.infer<typeof vacationPreferencesSchema>

// This would be fetched from your user's preferences in a real app
const defaultValues: VacationPreferencesValues = {
    groupSize: "2-4",
    travelWithChildren: false,
    childrenAges: "",
    travelWithSeniors: false,
    preferredResort: "value",
    preferredDiningStyle: "table-service",
    mealBudget: 50,
    preferredAttractionType: "all",
    tripLength: "7",
    fastPassPriority: true,
}

export function VacationPreferencesSettings() {
    const form = useForm<VacationPreferencesValues>({
        resolver: zodResolver(vacationPreferencesSchema),
        defaultValues,
    })

    const watchTravelWithChildren = form.watch("travelWithChildren")
    const watchMealBudget = form.watch("mealBudget")

    function onSubmit(data: VacationPreferencesValues) {
        toast.success("Vacation preferences saved")
        console.log(data)
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Trip Details"
                description="Tell us more about your travel group and preferences."
                icon={<Compass className="h-5 w-5" />}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as unknown as any)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control as unknown as any}
                                name="groupSize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-500" />
                                            Group Size
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select group size" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1">Solo Traveler</SelectItem>
                                                <SelectItem value="2-4">Small Group (2-4)</SelectItem>
                                                <SelectItem value="5-8">Medium Group (5-8)</SelectItem>
                                                <SelectItem value="9+">Large Group (9+)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            This helps us size recommendations appropriately
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as unknown as any}
                                name="tripLength"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                            Typical Trip Length
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select typical trip length" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="1-3">Weekend (1-3 days)</SelectItem>
                                                <SelectItem value="4-6">Short Week (4-6 days)</SelectItem>
                                                <SelectItem value="7">1 Week</SelectItem>
                                                <SelectItem value="8-13">Extended (8-13 days)</SelectItem>
                                                <SelectItem value="14+">2+ Weeks</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            We&apos;ll optimize itineraries for this duration
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as unknown as any}
                                name="travelWithChildren"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                                        <div className="space-y-1">
                                            <FormLabel className="flex items-center gap-2">
                                                <Baby className="h-4 w-4 text-pink-500" />
                                                Traveling with Children
                                            </FormLabel>
                                            <FormDescription>
                                                Include child-friendly recommendations
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
                                control={form.control as unknown as any}
                                name="travelWithSeniors"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                                        <div className="space-y-1">
                                            <FormLabel className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-blue-500" />
                                                Traveling with Seniors
                                            </FormLabel>
                                            <FormDescription>
                                                Include accessibility considerations
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

                            {watchTravelWithChildren && (
                                <FormField
                                    control={form.control as unknown as any}
                                    name="childrenAges"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Children&apos;s Ages</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., 3, 5, 8"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Comma-separated list of ages for appropriate recommendations
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <div className="space-y-6 border-t pt-6">
                            <h3 className="text-lg font-medium">Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control as unknown as any}
                                    name="preferredResort"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Hotel className="h-4 w-4 text-yellow-500" />
                                                Preferred Resort Area
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select resort preference" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="value">Value Resorts</SelectItem>
                                                    <SelectItem value="moderate">Moderate Resorts</SelectItem>
                                                    <SelectItem value="deluxe">Deluxe Resorts</SelectItem>
                                                    <SelectItem value="villas">Deluxe Villas</SelectItem>
                                                    <SelectItem value="offsite">Off-site Accommodations</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Your preferred Disney resort category
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as unknown as any}
                                    name="preferredAttractionType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-orange-500" />
                                                Preferred Attractions
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select attraction preference" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="all">All Attractions</SelectItem>
                                                    <SelectItem value="thrill">Thrill Rides</SelectItem>
                                                    <SelectItem value="family">Family Rides</SelectItem>
                                                    <SelectItem value="shows">Shows & Entertainment</SelectItem>
                                                    <SelectItem value="character">Character Experiences</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as unknown as any}
                                    name="preferredDiningStyle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Utensils className="h-4 w-4 text-green-500" />
                                                Preferred Dining
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select dining preference" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="quick-service">Quick Service</SelectItem>
                                                    <SelectItem value="table-service">Table Service</SelectItem>
                                                    <SelectItem value="signature">Signature Dining</SelectItem>
                                                    <SelectItem value="character">Character Dining</SelectItem>
                                                    <SelectItem value="mixed">Mixed (All Types)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as unknown as any}
                                    name="mealBudget"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Utensils className="h-4 w-4 text-red-500" />
                                                Average Meal Budget: ${watchMealBudget} per person
                                            </FormLabel>
                                            <FormControl>
                                                <Slider
                                                    value={[field.value]}
                                                    min={15}
                                                    max={125}
                                                    step={5}
                                                    onValueChange={(values) => field.onChange(values[0])}
                                                    className="py-4"
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Helps us recommend dining options in your price range
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control as unknown as any}
                                    name="fastPassPriority"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                                            <div className="space-y-1">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                                    Lightning Lane Priority
                                                </FormLabel>
                                                <FormDescription>
                                                    Prioritize attractions with Lightning Lane access
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

                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="w-full md:w-auto animate-float">
                                Save Vacation Preferences
                            </Button>
                        </div>
                    </form>
                </Form>
            </SettingsSection>
        </div>
    )
}
