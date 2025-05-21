"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldValues } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "./settings-section"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import {
    Bell,
    Calendar,
    Clock,
    MessageSquare,
    ParkingSquare,
    TicketCheck,
    Utensils,
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

const notificationFormSchema = z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    waitTimeAlerts: z.boolean().default(true),
    reservationReminders: z.boolean().default(true),
    parkUpdates: z.boolean().default(true),
    specialOffers: z.boolean().default(true),
    diningAvailability: z.boolean().default(true),
    showChanges: z.boolean().default(true),
    reminderTime: z.string().default("60"),
})

// Define the form type for better type safety
type NotificationFormValues = z.infer<typeof notificationFormSchema>

// This would be fetched from your user's settings in a real app
const defaultValues: Partial<NotificationFormValues> = {
    emailNotifications: true,
    pushNotifications: true,
    waitTimeAlerts: true,
    reservationReminders: true,
    parkUpdates: false,
    specialOffers: true,
    diningAvailability: true,
    showChanges: false,
    reminderTime: "60",
}

export function NotificationSettings() {
    // The key fix is to remove the generic type parameter from useForm
    // This allows the resolver to properly infer the types
    const form = useForm({
        resolver: zodResolver(notificationFormSchema),
        defaultValues,
    })

    function onSubmit(data: NotificationFormValues) {
        // In a real app, this would save to the server
        toast.success("Notification preferences saved")
        console.log(data)
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Notification Methods"
                description="Control how and when you receive notifications."
                icon={<Bell className="h-5 w-5" />}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as (data: FieldValues) => void)} className="space-y-8">
                        <div className="space-y-4">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="emailNotifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                                            <div className="space-y-1">
                                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                                <FormDescription>
                                                    Receive updates via email
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
                                    name="pushNotifications"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                                            <div className="space-y-1">
                                                <FormLabel className="text-base">Push Notifications</FormLabel>
                                                <FormDescription>
                                                    Receive mobile push alerts
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

                            <FormField
                                control={form.control}
                                name="reminderTime"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>Reminder Time</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select when to receive reminders" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="15">15 minutes before</SelectItem>
                                                    <SelectItem value="30">30 minutes before</SelectItem>
                                                    <SelectItem value="60">1 hour before</SelectItem>
                                                    <SelectItem value="120">2 hours before</SelectItem>
                                                    <SelectItem value="1440">1 day before</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormDescription>
                                            Select how far in advance you want to receive reminders for your reservations and events
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Notification Types</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="waitTimeAlerts"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-blue-500" />
                                                    Wait Time Alerts
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Get notified when wait times for your favorited attractions drop
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reservationReminders"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-green-500" />
                                                    Reservation Reminders
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Reminders for dining, experiences, and park reservations
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="parkUpdates"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <ParkingSquare className="h-4 w-4 text-purple-500" />
                                                    Park Updates
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Changes to park hours, closures, and special events
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="specialOffers"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-yellow-500" />
                                                    Special Offers
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Promotions, discounts and limited-time offers
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="diningAvailability"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <Utensils className="h-4 w-4 text-red-500" />
                                                    Dining Availability
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Alerts when dining reservations become available
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="showChanges"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm flex items-center gap-2">
                                                    <TicketCheck className="h-4 w-4 text-pink-500" />
                                                    Show Changes
                                                </FormLabel>
                                                <FormDescription className="text-xs">
                                                    Updates on show times, cancellations or additions
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button type="submit" className="animate-float">
                                Save Notification Preferences
                            </Button>
                        </div>
                    </form>
                </Form>
            </SettingsSection>

            <SettingsSection
                title="Communication Preferences"
                description="Control additional communications from Disney Vacation Planning."
                icon={<MessageSquare className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center space-x-2">
                            <Switch id="marketing" />
                            <label
                                htmlFor="marketing"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Marketing Emails
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="newsletter" />
                            <label
                                htmlFor="newsletter"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Disney Newsletter
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="surveys" />
                            <label
                                htmlFor="surveys"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Surveys & Feedback
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="partners" defaultChecked />
                            <label
                                htmlFor="partners"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Partner Offers
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={() => toast.success("Communication preferences saved")} variant="outline">
                            Update Communication Settings
                        </Button>
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}