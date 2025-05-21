"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "./settings-section"
import { Label } from "@/components/ui/label"
import {
    SunMoon,
    Moon,
    Sun,
    Monitor,
    LineChart,
    PaintBucket,
    Clock,
    ChevronsUpDown
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

const fontSizes = [
    { label: "Extra Small", value: "xs" },
    { label: "Small", value: "sm" },
    { label: "Medium (Default)", value: "md" },
    { label: "Large", value: "lg" },
    { label: "Extra Large", value: "xl" },
]

const colorThemes = [
    { name: "Disney Magic", value: "magic", color: "from-blue-500 to-purple-500" },
    { name: "Mickey Classic", value: "classic", color: "from-red-500 to-yellow-500" },
    { name: "Cinderella Blue", value: "cinderella", color: "from-blue-300 to-cyan-400" },
    { name: "Adventure", value: "adventure", color: "from-green-500 to-emerald-600" },
    { name: "Space Mountain", value: "space", color: "from-indigo-800 to-slate-900" },
    { name: "Sunset Boulevard", value: "sunset", color: "from-orange-400 to-pink-500" },
]

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme()
    const [fontSize, setFontSize] = useState("md")
    const [animations, setAnimations] = useState(true)
    const [reducedMotion, setReducedMotion] = useState(false)
    const [colorTheme, setColorTheme] = useState("magic")
    const [compactMode, setCompactMode] = useState(false)
    const [chartOpacity, setChartOpacity] = useState(80)

    function handleChartOpacityChange(value: number[]) {
        setChartOpacity(value[0])
    }

    function applyChanges() {
        // In a real app, this would update your app's appearance
        toast.success("Appearance settings updated")
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Theme"
                description="Manage your theme and color mode preferences."
                icon={<SunMoon className="h-5 w-5" />}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Color Mode</Label>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === "light" ? "default" : "outline"}
                                className="w-full justify-center gap-2"
                                onClick={() => setTheme("light")}
                            >
                                <Sun className="h-4 w-4" />
                                Light
                            </Button>

                            <Button
                                variant={theme === "dark" ? "default" : "outline"}
                                className="w-full justify-center gap-2"
                                onClick={() => setTheme("dark")}
                            >
                                <Moon className="h-4 w-4" />
                                Dark
                            </Button>

                            <Button
                                variant={theme === "system" ? "default" : "outline"}
                                className="w-full justify-center gap-2"
                                onClick={() => setTheme("system")}
                            >
                                <Monitor className="h-4 w-4" />
                                System
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {colorThemes.map((item) => (
                                <div
                                    key={item.value}
                                    className={`
                    relative rounded-md border p-1 cursor-pointer transition-all overflow-hidden
                    ${colorTheme === item.value ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"}
                  `}
                                    onClick={() => setColorTheme(item.value)}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`} />
                                    <div className="relative p-2 text-center">
                                        <div className={`h-10 rounded-md mb-2 bg-gradient-to-r ${item.color}`} />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4 grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="chartOpacity">Chart Opacity</Label>
                            <div className="flex items-center gap-4">
                                <div className="w-full">
                                    <Slider
                                        id="chartOpacity"
                                        min={20}
                                        max={100}
                                        step={5}
                                        value={[chartOpacity]}
                                        onValueChange={handleChartOpacityChange}
                                    />
                                </div>
                                <span className="w-10 text-sm text-right">{chartOpacity}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Interface"
                description="Customize how the Disney Vacation Planner interface looks and feels."
                icon={<LineChart className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fontSize">Font Size</Label>
                        <Select
                            value={fontSize}
                            onValueChange={setFontSize}
                        >
                            <SelectTrigger id="fontSize" className="w-full">
                                <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                            <SelectContent>
                                {fontSizes.map((size) => (
                                    <SelectItem key={size.value} value={size.value}>
                                        {size.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-5 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="animations">
                                    <div className="flex items-center gap-2">
                                        <PaintBucket className="h-4 w-4" />
                                        Enable Animations
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Show magical animations and transitions
                                </p>
                            </div>
                            <Switch
                                id="animations"
                                checked={animations}
                                onCheckedChange={setAnimations}
                            />
                        </div>

                        <AnimatePresence>
                            {animations && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="reducedMotion">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Reduced Motion
                                                </div>
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Use more subtle animations
                                            </p>
                                        </div>
                                        <Switch
                                            id="reducedMotion"
                                            checked={reducedMotion}
                                            onCheckedChange={setReducedMotion}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="compactMode">
                                    <div className="flex items-center gap-2">
                                        <ChevronsUpDown className="h-4 w-4" />
                                        Compact Interface
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Show more content with less spacing
                                </p>
                            </div>
                            <Switch
                                id="compactMode"
                                checked={compactMode}
                                onCheckedChange={setCompactMode}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={applyChanges} className="w-full sm:w-auto animate-float">
                            Apply Appearance Settings
                        </Button>
                    </div>
                </div>
            </SettingsSection>
        </div>
    )
}