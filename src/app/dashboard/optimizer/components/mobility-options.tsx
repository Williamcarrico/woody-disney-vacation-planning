"use client"

import { UseFormReturn } from "react-hook-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
    AccessibilityIcon,
    FootprintsIcon
} from "lucide-react"

interface MobilityOptionsSectionProps {
    form: UseFormReturn<any>
}

export default function MobilityOptionsSection({ form }: MobilityOptionsSectionProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <AccessibilityIcon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>Mobility & Accessibility</CardTitle>
                </div>
                <CardDescription>
                    Configure options to accommodate mobility needs and preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                            <FootprintsIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            Walking Preferences
                        </h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="walkingPace"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex justify-between mb-2">
                                            <FormLabel>Walking Pace</FormLabel>
                                            <span className="text-sm capitalize font-medium">
                                                {field.value}
                                            </span>
                                        </div>
                                        <FormControl>
                                            <div className="pt-2">
                                                <Slider
                                                    defaultValue={[
                                                        field.value === "slow" ? 0 :
                                                            field.value === "moderate" ? 50 :
                                                                100
                                                    ]}
                                                    min={0}
                                                    max={100}
                                                    step={50}
                                                    onValueChange={(value) => {
                                                        const pace = value[0] === 0 ? "slow" :
                                                            value[0] === 50 ? "moderate" : "fast"
                                                        field.onChange(pace)
                                                    }}
                                                    className="mb-3"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Slow</span>
                                                    <span>Moderate</span>
                                                    <span>Fast</span>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            How quickly does your group prefer to walk through the park?
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center">
                            <AccessibilityIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            Accessibility Options
                        </h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="mobilityConsiderations"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Mobility Assistance</FormLabel>
                                            <FormDescription>
                                                Optimize for wheelchair or mobility device access
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
                                                Account for ride height restrictions
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
            </CardContent>
        </Card>
    )
}