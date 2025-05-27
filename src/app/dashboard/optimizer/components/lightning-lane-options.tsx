"use client"

import { useEffect, useCallback } from "react"
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
    DollarSignIcon,
    LightbulbIcon,
    ZapIcon
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface LightningLaneFormData {
    useGeniePlus: boolean
    useIndividualLightningLane: boolean
    maxLightningLaneBudget?: number
}

interface LightningLaneOptionsSectionProps {
    form: UseFormReturn<LightningLaneFormData>
}

export default function LightningLaneOptionsSection({ form }: LightningLaneOptionsSectionProps) {
    // Reset maxLightningLaneBudget when useIndividualLightningLane changes
    const watchUseILL = useCallback(() => form.watch("useIndividualLightningLane"), [form])

    useEffect(() => {
        const useILL = watchUseILL()
        if (!useILL) {
            form.setValue("maxLightningLaneBudget", undefined)
        } else if (form.getValues("maxLightningLaneBudget") === undefined) {
            form.setValue("maxLightningLaneBudget", 50)
        }
    }, [watchUseILL, form])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <ZapIcon className="h-5 w-5 text-amber-500" />
                    <CardTitle>Lightning Lane Options</CardTitle>
                </div>
                <CardDescription>
                    Configure Disney Genie+ and Individual Lightning Lane preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="useGeniePlus"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Disney Genie+</FormLabel>
                                    <FormDescription>
                                        Use Disney Genie+ service for shorter wait times
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
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Individual Lightning Lane</FormLabel>
                                    <FormDescription>
                                        Purchase individual Lightning Lane access for top attractions
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

                {form.watch("useIndividualLightningLane") && (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <DollarSignIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Lightning Lane Budget</h3>
                        </div>

                        <FormField
                            control={form.control}
                            name="maxLightningLaneBudget"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between mb-2">
                                        <FormLabel>Maximum Budget</FormLabel>
                                        <span className="text-sm font-medium">${field.value || 0}</span>
                                    </div>
                                    <FormControl>
                                        <div>
                                            <Slider
                                                value={[field.value || 0]}
                                                min={0}
                                                max={200}
                                                step={5}
                                                onValueChange={(value) => field.onChange(value[0])}
                                                className="mb-2"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>$0</span>
                                                <span>$100</span>
                                                <span>$200</span>
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Maximum amount you&apos;re willing to spend on Individual Lightning Lane passes.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-100 dark:border-amber-900/50">
                    <div className="flex items-start space-x-2">
                        <LightbulbIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800 dark:text-amber-300">
                            <p className="font-medium">Disney Genie+ and Lightning Lane Tips:</p>
                            <ul className="mt-2 space-y-1 list-disc list-inside text-amber-700 dark:text-amber-400">
                                <li>Disney Genie+ costs $15-$29 per person per day (varies by date)</li>
                                <li>Individual Lightning Lane prices range from $7-$25 per attraction</li>
                                <li>You can make your first Genie+ selection at 7:00 AM on your visit day</li>
                                <li>Individual Lightning Lane purchases can be made once you&apos;ve entered the park</li>
                                <li>Our optimizer will strategically incorporate these options if selected</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}