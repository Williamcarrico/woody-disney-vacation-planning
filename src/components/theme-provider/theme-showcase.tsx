"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSelector } from "./index";
import { useDisneyTheme } from "./index";
import { cn, COMPONENT_THEMES } from "./theme-utils";
import {
    Sparkles,
    Moon,
    Sun,
    Castle,
    Waves,
    Palette,
    Eye,
    Accessibility
} from "lucide-react";

// Demo components for showcase
const AnimationDemo: React.FC = () => {
    const { disneyTheme, preferences } = useDisneyTheme();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sparkle Animation */}
            <motion.div
                className={cn(
                    "relative p-6 rounded-lg border overflow-hidden",
                    COMPONENT_THEMES.card[disneyTheme]
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative z-10">
                    <Sparkles className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">Sparkle Effect</h3>
                    <p className="text-sm text-muted-foreground">
                        Magical sparkles that dance across your interface
                    </p>
                </div>
                {preferences.animations && (
                    <div className="absolute inset-0 animate-sparkle opacity-20" />
                )}
            </motion.div>

            {/* Shimmer Animation */}
            <motion.div
                className={cn(
                    "relative p-6 rounded-lg border overflow-hidden",
                    COMPONENT_THEMES.card[disneyTheme]
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative z-10">
                    <Castle className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">Shimmer Effect</h3>
                    <p className="text-sm text-muted-foreground">
                        Royal shimmer like sunlight on castle walls
                    </p>
                </div>
                {preferences.animations && (
                    <div className="absolute inset-0 animate-shimmer opacity-30" />
                )}
            </motion.div>

            {/* Wave Animation */}
            <motion.div
                className={cn(
                    "relative p-6 rounded-lg border overflow-hidden",
                    COMPONENT_THEMES.card[disneyTheme],
                    preferences.animations && "animate-wave"
                )}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
            >
                <div className="relative z-10">
                    <Waves className="h-8 w-8 mb-2 text-primary" />
                    <h3 className="font-semibold mb-2">Wave Effect</h3>
                    <p className="text-sm text-muted-foreground">
                        Gentle waves like the ocean&apos;s rhythm
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const ThemePreviewCard: React.FC<{
    theme: keyof typeof COMPONENT_THEMES.card;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = ({ theme, title, description, icon }) => {
    const { setDisneyTheme, disneyTheme } = useDisneyTheme();
    const isActive = disneyTheme === theme;

    return (
        <motion.div
            className={cn(
                "relative p-6 rounded-lg border cursor-pointer transition-all duration-300",
                COMPONENT_THEMES.card[theme],
                isActive && "ring-2 shadow-lg scale-105"
            )}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setDisneyTheme(theme)}
        >
            <div className="flex items-center gap-3 mb-3">
                {icon}
                <h3 className={cn("font-semibold", COMPONENT_THEMES.text[theme])}>
                    {title}
                </h3>
                {isActive && (
                    <Badge variant="secondary" className="ml-auto">
                        Active
                    </Badge>
                )}
            </div>
            <p className={cn("text-sm", COMPONENT_THEMES.text[theme], "opacity-80")}>
                {description}
            </p>

            {/* Theme-specific background effect */}
            <div className={cn(
                "absolute inset-0 rounded-lg opacity-10",
                theme === "light" && "bg-magical-day",
                theme === "dark" && "bg-starlit-night",
                theme === "castle" && "bg-castle-dreams",
                theme === "galaxy" && "bg-space-mountain",
                theme === "ocean" && "bg-under-sea"
            )} />
        </motion.div>
    );
};

const ComponentShowcase: React.FC = () => {
    const { disneyTheme } = useDisneyTheme();

    return (
        <div className="space-y-6">
            {/* Buttons */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Themed Buttons</h3>
                <div className="flex flex-wrap gap-3">
                    <Button className={COMPONENT_THEMES.button[disneyTheme]}>
                        Primary Button
                    </Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="destructive">Destructive</Button>
                </div>
            </div>

            {/* Cards */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Themed Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className={COMPONENT_THEMES.card[disneyTheme]}>
                        <CardHeader>
                            <CardTitle>Themed Card</CardTitle>
                            <CardDescription>
                                This card adapts to the current Disney theme
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={75} className="mb-4" />
                            <p className="text-sm text-muted-foreground">
                                Content that looks great in any theme with proper contrast ratios.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                        <CardHeader className="relative">
                            <CardTitle>Gradient Enhanced</CardTitle>
                            <CardDescription>
                                With magical background effects
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            <Badge className="mb-4">Featured</Badge>
                            <p className="text-sm text-muted-foreground">
                                Enhanced visual appeal with theme-aware gradients.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const AccessibilityDemo: React.FC = () => {
    const { preferences, updatePreferences } = useDisneyTheme();

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Accessibility className="h-5 w-5" />
                    Accessibility Features
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Motion Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Reduce Motion</span>
                                <Button
                                    variant={preferences.reducedMotion ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updatePreferences({ reducedMotion: !preferences.reducedMotion })}
                                >
                                    {preferences.reducedMotion ? "ON" : "OFF"}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Animations</span>
                                <Button
                                    variant={preferences.animations ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updatePreferences({ animations: !preferences.animations })}
                                >
                                    {preferences.animations ? "ON" : "OFF"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Visual Controls</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">High Contrast</span>
                                <Button
                                    variant={preferences.highContrast ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
                                >
                                    {preferences.highContrast ? "ON" : "OFF"}
                                </Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Particles</span>
                                <Button
                                    variant={preferences.particles ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => updatePreferences({ particles: !preferences.particles })}
                                >
                                    {preferences.particles ? "ON" : "OFF"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/50">
                <h4 className="font-medium mb-2">Accessibility Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            preferences.reducedMotion ? "bg-green-500" : "bg-yellow-500"
                        )} />
                        Motion: {preferences.reducedMotion ? "Reduced" : "Normal"}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            preferences.highContrast ? "bg-green-500" : "bg-blue-500"
                        )} />
                        Contrast: {preferences.highContrast ? "High" : "Normal"}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        WCAG: AA Compatible
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Keyboard: Accessible
                    </div>
                </div>
            </div>
        </div>
    );
};

export function ThemeShowcase() {
    const { disneyTheme, preferences, isTransitioning } = useDisneyTheme();

    const themeData = [
        {
            theme: "light" as const,
            title: "Magical Day",
            description: "Bright and enchanting like a Disney park at sunrise",
            icon: <Sun className="h-6 w-6 text-yellow-500" />,
        },
        {
            theme: "dark" as const,
            title: "Starlit Night",
            description: "Mysterious and magical like Disney parks after dark",
            icon: <Moon className="h-6 w-6 text-purple-500" />,
        },
        {
            theme: "castle" as const,
            title: "Castle Dreams",
            description: "Royal and majestic like Cinderella's Castle",
            icon: <Castle className="h-6 w-6 text-amber-500" />,
        },
        {
            theme: "galaxy" as const,
            title: "Space Mountain",
            description: "Futuristic and cosmic like a journey through space",
            icon: <Sparkles className="h-6 w-6 text-cyan-500" />,
        },
        {
            theme: "ocean" as const,
            title: "Under the Sea",
            description: "Flowing and serene like Ariel's underwater kingdom",
            icon: <Waves className="h-6 w-6 text-emerald-500" />,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Disney Theme Showcase
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Explore our magical theming system with Disney-inspired designs, smooth animations,
                    and comprehensive accessibility features.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <ThemeToggle />
                    <Badge variant={isTransitioning ? "destructive" : "secondary"}>
                        {isTransitioning ? "Transitioning..." : `${disneyTheme} theme`}
                    </Badge>
                </div>
            </motion.div>

            {/* Main Content */}
            <Tabs defaultValue="themes" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="themes" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Themes
                    </TabsTrigger>
                    <TabsTrigger value="animations" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Animations
                    </TabsTrigger>
                    <TabsTrigger value="components" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Components
                    </TabsTrigger>
                    <TabsTrigger value="accessibility" className="flex items-center gap-2">
                        <Accessibility className="h-4 w-4" />
                        Accessibility
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="themes" className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Disney-Inspired Themes</h2>
                        <p className="text-muted-foreground">
                            Each theme brings the magic of Disney to your interface with unique colors,
                            animations, and visual effects.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {themeData.map((theme) => (
                            <ThemePreviewCard
                                key={theme.theme}
                                theme={theme.theme}
                                title={theme.title}
                                description={theme.description}
                                icon={theme.icon}
                            />
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Theme Selector</CardTitle>
                            <CardDescription>
                                Use this component anywhere in your app for theme switching
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThemeSelector />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="animations" className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Magical Animations</h2>
                        <p className="text-muted-foreground">
                            Each theme comes with unique animations that enhance the user experience
                            while respecting accessibility preferences.
                        </p>
                    </div>

                    <AnimationDemo />

                    {!preferences.animations && (
                        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
                            <CardContent className="pt-6">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    💡 Animations are currently disabled. Enable them in the theme preferences to see the full magic!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="components" className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Themed Components</h2>
                        <p className="text-muted-foreground">
                            All UI components automatically adapt to the selected theme while maintaining
                            accessibility and usability standards.
                        </p>
                    </div>

                    <ComponentShowcase />
                </TabsContent>

                <TabsContent value="accessibility" className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Accessibility & Preferences</h2>
                        <p className="text-muted-foreground">
                            Our theming system respects user preferences and provides comprehensive
                            accessibility controls for an inclusive experience.
                        </p>
                    </div>

                    <AccessibilityDemo />
                </TabsContent>
            </Tabs>

            {/* Footer */}
            <motion.div
                className="text-center pt-8 border-t"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <p className="text-sm text-muted-foreground">
                    ✨ Built with love for magical user experiences ✨
                </p>
            </motion.div>
        </div>
    );
}