import { Metadata } from "next"
import { Suspense } from "react"

import { AccountSettings } from "./components/account-settings"
import { AppearanceSettings } from "./components/appearance-settings"
import { NotificationSettings } from "./components/notification-settings"
import { PrivacySettings } from "./components/privacy-settings"
import { AccessibilitySettings } from "./components/accessibility-settings"
import { VacationPreferencesSettings } from "./components/vacation-preferences-settings"
import { ProfileSettingsSkeleton } from "./components/settings-skeleton"
import { SettingsHeader } from "./components/settings-header"
import { SettingsShell } from "./components/settings-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ParkExperienceSettings } from "./components/park-experience-settings"

export const metadata: Metadata = {
    title: "Settings | Disney Vacation Planning",
    description: "Manage your account settings and preferences",
}

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-6 lg:py-8 animate-fadeIn">
            <SettingsHeader />

            <SettingsShell>
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="mb-8 grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                        <TabsTrigger value="vacation">Vacation</TabsTrigger>
                        <TabsTrigger value="parks">Park Experience</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy</TabsTrigger>
                        <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <AccountSettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <AppearanceSettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <NotificationSettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="vacation" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <VacationPreferencesSettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="parks" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <ParkExperienceSettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <PrivacySettings />
                        </Suspense>
                    </TabsContent>

                    <TabsContent value="accessibility" className="space-y-8">
                        <Suspense fallback={<ProfileSettingsSkeleton />}>
                            <AccessibilitySettings />
                        </Suspense>
                    </TabsContent>
                </Tabs>
            </SettingsShell>
        </div>
    )
}