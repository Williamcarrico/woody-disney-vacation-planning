"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "./settings-section"
import {
    Lock,
    Shield,
    FileJson,
    Globe,
    Fingerprint,
    Trash2
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
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export function PrivacySettings() {
    const [locationTracking, setLocationTracking] = useState(true)
    const [dataSharingAnalytics, setDataSharingAnalytics] = useState(true)
    const [dataSharingPartners, setDataSharingPartners] = useState(false)
    const [dataSharingPersonalization, setDataSharingPersonalization] = useState(true)
    const [cookiesEssential] = useState(true)
    const [cookiesAnalytics, setCookiesAnalytics] = useState(true)
    const [cookiesMarketing, setCookiesMarketing] = useState(false)
    const [downloadingData, setDownloadingData] = useState(false)
    const [dataProgress, setDataProgress] = useState(0)

    function handleExportData() {
        setDownloadingData(true)
        setDataProgress(0)

        // Simulate progress
        const interval = setInterval(() => {
            setDataProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setDownloadingData(false)
                    toast.success("Data export ready for download")
                    // In a real app, this would trigger a download
                    return 0
                }
                return prev + 10
            })
        }, 500)
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Privacy Preferences"
                description="Control how your data is used and shared."
                icon={<Shield className="h-5 w-5" />}
            >
                <div className="space-y-6">
                    <div className="grid gap-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="location">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        Location Tracking
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow the app to track your location for personalized park recommendations and wait times
                                </p>
                            </div>
                            <Switch
                                id="location"
                                checked={locationTracking}
                                onCheckedChange={setLocationTracking}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="analytics">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="h-4 w-4 text-green-500" />
                                        Data Sharing for Analytics
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Share app usage data to help improve our services
                                </p>
                            </div>
                            <Switch
                                id="analytics"
                                checked={dataSharingAnalytics}
                                onCheckedChange={setDataSharingAnalytics}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="partners">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-purple-500" />
                                        Data Sharing with Partners
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow us to share your data with trusted Disney partners for relevant offers
                                </p>
                            </div>
                            <Switch
                                id="partners"
                                checked={dataSharingPartners}
                                onCheckedChange={setDataSharingPartners}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="personalization">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint className="h-4 w-4 text-pink-500" />
                                        Data for Personalization
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Use your browsing history and preferences to personalize your Disney experience
                                </p>
                            </div>
                            <Switch
                                id="personalization"
                                checked={dataSharingPersonalization}
                                onCheckedChange={setDataSharingPersonalization}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={() => toast.success("Privacy preferences saved")} className="w-full sm:w-auto">
                            Save Privacy Preferences
                        </Button>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Cookie Management"
                description="Manage browser cookies and tracking preferences."
                icon={<Lock className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-6">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="essential">
                                    <div className="flex items-center gap-2">
                                        Essential Cookies
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Required for basic functionality (cannot be disabled)
                                </p>
                            </div>
                            <Switch
                                id="essential"
                                checked={cookiesEssential}
                                disabled
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="cookieAnalytics">
                                    <div className="flex items-center gap-2">
                                        Analytics Cookies
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Help us understand how you use our app
                                </p>
                            </div>
                            <Switch
                                id="cookieAnalytics"
                                checked={cookiesAnalytics}
                                onCheckedChange={setCookiesAnalytics}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="marketing">
                                    <div className="flex items-center gap-2">
                                        Marketing Cookies
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Allow personalized ads and content
                                </p>
                            </div>
                            <Switch
                                id="marketing"
                                checked={cookiesMarketing}
                                onCheckedChange={setCookiesMarketing}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={() => toast.success("Cookie preferences saved")} variant="outline" className="w-full sm:w-auto">
                            Save Cookie Preferences
                        </Button>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Your Data"
                description="Export or delete your data."
                icon={<FileJson className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 text-sm font-medium">Export Your Data</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Download a copy of all your data including your profile, preferences, vacation plans, and activity history.
                            </p>

                            {downloadingData ? (
                                <div className="space-y-2">
                                    <Progress value={dataProgress} className="h-2 w-full" />
                                    <p className="text-xs text-center text-muted-foreground">Preparing your data for download: {dataProgress}%</p>
                                </div>
                            ) : (
                                <Button onClick={handleExportData} className="w-full sm:w-auto">
                                    Export Data (JSON)
                                </Button>
                            )}
                        </div>

                        <div className="rounded-lg border p-4 border-destructive/20">
                            <h4 className="mb-2 text-sm font-medium text-destructive">Delete Your Data</h4>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Permanently delete all of your data from our servers. This action cannot be undone.
                            </p>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full sm:w-auto">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete All My Data
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete all your personal data, preferences, vacation plans, and activity history from our servers. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => toast.error("Data deletion is disabled in demo mode")}>
                                            Yes, delete all my data
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="rounded-md bg-muted p-4">
                        <h4 className="mb-2 text-sm font-medium">Privacy Information</h4>
                        <p className="text-sm text-muted-foreground">
                            We take your privacy seriously. For more information on how we handle your data, please read our{" "}
                            <a href="/privacy-policy" className="font-medium text-primary hover:underline">
                                Privacy Policy
                            </a>{" "}
                            and{" "}
                            <a href="/terms-of-service" className="font-medium text-primary hover:underline">
                                Terms of Service
                            </a>.
                        </p>
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}