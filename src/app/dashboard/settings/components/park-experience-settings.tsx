"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SettingsSection } from "./settings-section"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Map,
    Timer,
    Sparkles,
    BellRing,
    ListChecks,
    Tag
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

const walkingSpeed = [
    { name: "Leisurely", value: "slow" },
    { name: "Average", value: "normal" },
    { name: "Fast", value: "fast" },
]

const breakFrequency = [
    { name: "Frequent (Every Hour)", value: "frequent" },
    { name: "Moderate (Every 2-3 Hours)", value: "moderate" },
    { name: "Minimal (When Needed)", value: "minimal" },
]

const priorityAttractions = [
    { id: 1, name: "Space Mountain", park: "Magic Kingdom", waitAlertEnabled: true, waitThreshold: 30 },
    { id: 2, name: "Seven Dwarfs Mine Train", park: "Magic Kingdom", waitAlertEnabled: true, waitThreshold: 40 },
    { id: 3, name: "Star Wars: Rise of the Resistance", park: "Hollywood Studios", waitAlertEnabled: true, waitThreshold: 45 },
    { id: 4, name: "Avatar Flight of Passage", park: "Animal Kingdom", waitAlertEnabled: true, waitThreshold: 40 },
]

export function ParkExperienceSettings() {
    const [walkingPreference, setWalkingPreference] = useState("normal")
    const [breakPreference, setBreakPreference] = useState("moderate")
    const [favorites, setFavorites] = useState(priorityAttractions)
    const [waitTimeAlerts, setWaitTimeAlerts] = useState(true)
    const [showRecommendations, setShowRecommendations] = useState(true)
    const [optimizeForWeather, setOptimizeForWeather] = useState(true)
    const [optimizeForCrowds, setOptimizeForCrowds] = useState(true)
    const [avoidRepeats, setAvoidRepeats] = useState(false)
    const [isPending, setIsPending] = useState(false)

    function updateWaitThreshold(id: number, threshold: number) {
        setFavorites(favorites.map(fav =>
            fav.id === id ? { ...fav, waitThreshold: threshold } : fav
        ))
    }

    function updateWaitAlert(id: number, enabled: boolean) {
        setFavorites(favorites.map(fav =>
            fav.id === id ? { ...fav, waitAlertEnabled: enabled } : fav
        ))
    }

    function saveSettings() {
        setIsPending(true)

        // Simulate API call
        setTimeout(() => {
            toast.success("Park experience settings saved")
            setIsPending(false)
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Touring Preferences"
                description="Customize your in-park experience and walking preferences."
                icon={<Map className="h-5 w-5" />}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="walkingSpeed">Walking Pace</Label>
                            <Select
                                value={walkingPreference}
                                onValueChange={setWalkingPreference}
                            >
                                <SelectTrigger id="walkingSpeed" className="w-full">
                                    <SelectValue placeholder="Select your walking pace" />
                                </SelectTrigger>
                                <SelectContent>
                                    {walkingSpeed.map((speed) => (
                                        <SelectItem key={speed.value} value={speed.value}>
                                            {speed.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Affects walking time estimates between attractions
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="breakFrequency">Break Frequency</Label>
                            <Select
                                value={breakPreference}
                                onValueChange={setBreakPreference}
                            >
                                <SelectTrigger id="breakFrequency" className="w-full">
                                    <SelectValue placeholder="Select break frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {breakFrequency.map((frequency) => (
                                        <SelectItem key={frequency.value} value={frequency.value}>
                                            {frequency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                We&apos;ll suggest breaks in your itinerary based on this preference
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 py-2">
                        <h3 className="text-sm font-medium">Optimization Preferences</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="optimizeWeather"
                                    checked={optimizeForWeather}
                                    onCheckedChange={setOptimizeForWeather}
                                />
                                <Label
                                    htmlFor="optimizeWeather"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    Optimize for Weather Conditions
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="optimizeCrowds"
                                    checked={optimizeForCrowds}
                                    onCheckedChange={setOptimizeForCrowds}
                                />
                                <Label
                                    htmlFor="optimizeCrowds"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    Optimize for Lower Crowds
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="recommendations"
                                    checked={showRecommendations}
                                    onCheckedChange={setShowRecommendations}
                                />
                                <Label
                                    htmlFor="recommendations"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    Show AI-Powered Recommendations
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="avoidRepeats"
                                    checked={avoidRepeats}
                                    onCheckedChange={setAvoidRepeats}
                                />
                                <Label
                                    htmlFor="avoidRepeats"
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    Avoid Repeating Attractions
                                </Label>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Priority Attractions"
                description="Set alerts for your favorite attractions and entertainment."
                icon={<Sparkles className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="waitTimeAlerts" className="flex items-center gap-2">
                            <BellRing className="h-4 w-4 text-primary" />
                            Wait Time Alerts
                        </Label>
                        <Switch
                            id="waitTimeAlerts"
                            checked={waitTimeAlerts}
                            onCheckedChange={setWaitTimeAlerts}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {favorites.map(attraction => (
                                <div
                                    key={attraction.id}
                                    className={cn(
                                        "rounded-lg border p-4 transition-all",
                                        waitTimeAlerts && attraction.waitAlertEnabled
                                            ? "border-primary/50 bg-primary/5"
                                            : "bg-muted/50"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{attraction.name}</span>
                                                <span className="text-xs text-muted-foreground">{attraction.park}</span>
                                            </div>

                                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                                <Tag className="h-3.5 w-3.5" />
                                                <span>Alert when wait time is below:</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`alert-${attraction.id}`}
                                                checked={waitTimeAlerts && attraction.waitAlertEnabled}
                                                disabled={!waitTimeAlerts}
                                                onCheckedChange={(checked) => updateWaitAlert(attraction.id, checked)}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    </div>

                                    {waitTimeAlerts && attraction.waitAlertEnabled && (
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">Minutes:</span>
                                            </div>

                                            <Input
                                                type="number"
                                                min={10}
                                                max={120}
                                                value={attraction.waitThreshold}
                                                onChange={(e) => updateWaitThreshold(attraction.id, parseInt(e.target.value) || 30)}
                                                className="h-8 w-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full gap-2">
                            <ListChecks className="h-4 w-4" />
                            Manage Priority Attractions
                        </Button>
                    </div>
                </div>
            </SettingsSection>

            <div className="flex justify-end pt-4">
                <Button onClick={saveSettings} disabled={isPending} className="w-full sm:w-auto animate-float">
                    {isPending && (
                        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    )}
                    Save Park Experience Settings
                </Button>
            </div>
        </div>
    )
}