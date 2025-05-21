"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    UserCircle,
    Mail,
    Phone,
    Key,
    Camera,
    UserCog,
    ShieldCheck,
    LogOut
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

const profileFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    phone: z.string().optional(),
    avatar: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This would typically come from your auth system
const defaultValues: Partial<ProfileFormValues> = {
    name: "Mickey Mouse",
    email: "mickey@disney.com",
    phone: "+1 (555) 123-4567",
    avatar: "",
}

export function AccountSettings() {
    const [isPending, setIsPending] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues,
        mode: "onChange",
    })

    function onSubmit(data: ProfileFormValues) {
        setIsPending(true)

        // Simulate API call
        setTimeout(() => {
            toast.success("Profile updated successfully")
            setIsPending(false)
        }, 1000)

        console.log(data)
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Personal Information"
                description="Update your personal details and contact information."
                icon={<UserCircle className="h-5 w-5" />}
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="h-24 w-24 border-4 border-primary/20 animate-pulse-slow">
                                    <AvatarImage src="/images/user-avatar.jpg" alt="User avatar" />
                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">
                                        {defaultValues.name?.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <Button type="button" size="sm" variant="outline" className="gap-2">
                                    <Camera className="h-4 w-4" />
                                    Change avatar
                                </Button>
                            </div>

                            <div className="flex-1 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your full name"
                                                    className="input-futuristic"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="your.email@example.com"
                                                            className="pl-9 input-futuristic"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="+1 (555) 000-0000"
                                                            className="pl-9 input-futuristic"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription>
                                                    Used for reservation updates and alerts
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending} className="w-full md:w-auto animate-float">
                                {isPending && (
                                    <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                )}
                                Save changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </SettingsSection>

            <SettingsSection
                title="Security"
                description="Manage your password and account security."
                icon={<ShieldCheck className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="mb-2 text-sm font-medium">Password</h4>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Key className="h-4 w-4" />
                                Change password
                            </Button>
                        </div>

                        <div>
                            <h4 className="mb-2 text-sm font-medium">Two-factor Authentication</h4>
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <UserCog className="h-4 w-4" />
                                Enable 2FA
                            </Button>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="mb-2 text-sm font-medium">Account Actions</h4>
                        <div className="flex flex-wrap gap-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out of all devices
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Log out of all devices?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will log you out of all devices where you&apos;re currently signed in, including this one.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => toast.success("Logged out of all devices")}>
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        Delete account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => toast.error("Account deletion is disabled in demo mode")}>
                                            Delete account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}