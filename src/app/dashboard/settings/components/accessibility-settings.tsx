"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "./settings-section"
import { Label } from "@/components/ui/label"
import {
    Accessibility,
    Megaphone,
    Eye,
    MousePointer,
    Keyboard,
    Type,
    ZoomIn
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

const fontFamilies = [
    { name: "Default", value: "default" },
    { name: "Open Dyslexic", value: "opendyslexic" },
    { name: "Comic Sans", value: "comicsans" },
    { name: "Arial", value: "arial" },
    { name: "Verdana", value: "verdana" },
]

export function AccessibilitySettings() {
    const [highContrast, setHighContrast] = useState(false)
    const [screenReader, setScreenReader] = useState(false)
    const [reduceMotion, setReduceMotion] = useState(false)
    const [largeText, setLargeText] = useState(false)
    const [keyboardNavigation, setKeyboardNavigation] = useState(false)
    const [fontFamily, setFontFamily] = useState("default")
    const [contrastLevel, setContrastLevel] = useState(100)
    const [textSpacing, setTextSpacing] = useState(1)

    function handleContrastChange(value: number[]) {
        setContrastLevel(value[0])
    }

    function handleTextSpacingChange(value: number[]) {
        setTextSpacing(value[0])
    }

    function saveSettings() {
        // In a real app, this would save to the user's preferences
        toast.success("Accessibility settings saved")
    }

    function resetDefaults() {
        setHighContrast(false)
        setScreenReader(false)
        setReduceMotion(false)
        setLargeText(false)
        setKeyboardNavigation(false)
        setFontFamily("default")
        setContrastLevel(100)
        setTextSpacing(1)

        toast.success("Accessibility settings reset to defaults")
    }

    return (
        <div className="space-y-6">
            <SettingsSection
                title="Visual Settings"
                description="Adjust how content appears on screen."
                icon={<Eye className="h-5 w-5" />}
            >
                <div className="space-y-6">
                    <div className="grid gap-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="highContrast">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-blue-500" />
                                        High Contrast Mode
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Increase contrast for better text visibility
                                </p>
                            </div>
                            <Switch
                                id="highContrast"
                                checked={highContrast}
                                onCheckedChange={setHighContrast}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="reduceMotion">
                                    <div className="flex items-center gap-2">
                                        <MousePointer className="h-4 w-4 text-green-500" />
                                        Reduce Motion
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Minimize animations and automatic movements
                                </p>
                            </div>
                            <Switch
                                id="reduceMotion"
                                checked={reduceMotion}
                                onCheckedChange={setReduceMotion}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="largeText">
                                    <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4 text-purple-500" />
                                        Large Text Mode
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Increase text size across the application
                                </p>
                            </div>
                            <Switch
                                id="largeText"
                                checked={largeText}
                                onCheckedChange={setLargeText}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="font-family">Font Family</Label>
                            <Select
                                value={fontFamily}
                                onValueChange={setFontFamily}
                            >
                                <SelectTrigger id="font-family" className="w-full">
                                    <SelectValue placeholder="Select font family" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontFamilies.map((font) => (
                                        <SelectItem key={font.value} value={font.value}>
                                            {font.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Some fonts like Open Dyslexic can be easier to read for people with dyslexia
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contrastSlider" className="flex items-center gap-2">
                                <ZoomIn className="h-4 w-4 text-blue-500" />
                                Contrast Level: {contrastLevel}%
                            </Label>
                            <Slider
                                id="contrastSlider"
                                min={75}
                                max={150}
                                step={5}
                                value={[contrastLevel]}
                                onValueChange={handleContrastChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="textSpacingSlider" className="flex items-center gap-2">
                                <Type className="h-4 w-4 text-green-500" />
                                Text Spacing: {textSpacing.toFixed(1)}x
                            </Label>
                            <Slider
                                id="textSpacingSlider"
                                min={1}
                                max={2}
                                step={0.1}
                                value={[textSpacing]}
                                onValueChange={handleTextSpacingChange}
                            />
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection
                title="Assistive Technology"
                description="Configure settings for assistive technologies."
                icon={<Accessibility className="h-5 w-5" />}
                defaultOpen={false}
            >
                <div className="space-y-6">
                    <div className="grid gap-5">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="screenReader">
                                    <div className="flex items-center gap-2">
                                        <Megaphone className="h-4 w-4 text-yellow-500" />
                                        Screen Reader Support
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Optimize for compatibility with screen readers
                                </p>
                            </div>
                            <Switch
                                id="screenReader"
                                checked={screenReader}
                                onCheckedChange={setScreenReader}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="keyboardNav">
                                    <div className="flex items-center gap-2">
                                        <Keyboard className="h-4 w-4 text-red-500" />
                                        Enhanced Keyboard Navigation
                                    </div>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Improve navigation using only keyboard shortcuts
                                </p>
                            </div>
                            <Switch
                                id="keyboardNav"
                                checked={keyboardNavigation}
                                onCheckedChange={setKeyboardNavigation}
                            />
                        </div>
                    </div>

                    <div className="rounded-md bg-muted p-4">
                        <h4 className="mb-2 text-sm font-medium">Keyboard Shortcuts</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Navigate tabs:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Tab</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Select item:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Enter</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Go to home:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Alt+H</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Search:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Alt+S</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Settings:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Alt+P</kbd>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Help:</span>
                                <kbd className="px-2 py-0.5 rounded bg-background">Alt+?</kbd>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsSection>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={saveSettings} className="w-full sm:w-auto animate-float">
                    Save Accessibility Settings
                </Button>
                <Button onClick={resetDefaults} variant="outline" className="w-full sm:w-auto">
                    Reset to Defaults
                </Button>
            </div>
        </div>
    )
}