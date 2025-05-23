"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Palette, Sparkles, Waves, Castle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useDisneyTheme } from "@/components/theme-provider";
import { cn } from "@/components/theme-provider/theme-utils";

// Theme icons mapping
const THEME_ICONS = {
    light: Sun,
    dark: Moon,
    castle: Castle,
    galaxy: Sparkles,
    ocean: Waves,
} as const;

// Theme colors for the toggle button
const THEME_COLORS = {
    light: "text-yellow-500",
    dark: "text-purple-500",
    castle: "text-amber-500",
    galaxy: "text-cyan-500",
    ocean: "text-emerald-500",
} as const;

export function ThemeToggle() {
    const {
        disneyTheme,
        setDisneyTheme,
        preferences,
        updatePreferences,
        isTransitioning,
        systemTheme,
    } = useDisneyTheme();

    const [isOpen, setIsOpen] = React.useState(false);
    const CurrentIcon = THEME_ICONS[disneyTheme];

    const handleThemeChange = (newTheme: keyof typeof THEME_ICONS) => {
        setDisneyTheme(newTheme);
        setIsOpen(false);
    };

    const themeOptions = [
        {
            key: "light" as const,
            name: "Magical Day",
            description: "Bright and enchanting",
            icon: Sun,
            gradient: "from-blue-400 to-purple-400",
            bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
        },
        {
            key: "dark" as const,
            name: "Starlit Night",
            description: "Mysterious and magical",
            icon: Moon,
            gradient: "from-purple-600 to-pink-600",
            bgColor: "bg-gradient-to-br from-purple-900 to-pink-900",
        },
        {
            key: "castle" as const,
            name: "Castle Dreams",
            description: "Royal and majestic",
            icon: Castle,
            gradient: "from-yellow-500 to-orange-500",
            bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
        },
        {
            key: "galaxy" as const,
            name: "Space Mountain",
            description: "Futuristic and cosmic",
            icon: Sparkles,
            gradient: "from-cyan-500 to-blue-500",
            bgColor: "bg-gradient-to-br from-cyan-900 to-blue-900",
        },
        {
            key: "ocean" as const,
            name: "Under the Sea",
            description: "Flowing and serene",
            icon: Waves,
            gradient: "from-teal-500 to-emerald-500",
            bgColor: "bg-gradient-to-br from-teal-50 to-emerald-50",
        },
    ];

    return (
        <TooltipProvider>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "relative overflow-hidden transition-all duration-300 hover:scale-110",
                                    THEME_COLORS[disneyTheme],
                                    isTransitioning && "animate-pulse"
                                )}
                                aria-label="Toggle theme"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={disneyTheme}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <CurrentIcon className="h-5 w-5" />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Magical glow effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-md opacity-20"
                                    style={{
                                        background: `radial-gradient(circle, var(--theme-accent, #8B5CF6), transparent 70%)`,
                                    }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.2, 0.4, 0.2],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />
                            </Button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Switch theme ({themeOptions.find(t => t.key === disneyTheme)?.name})</p>
                    </TooltipContent>
                </Tooltip>

                <PopoverContent className="w-80 p-0 overflow-hidden" side="bottom" align="end">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold text-sm">Choose Your Magic</h3>
                        </div>

                        {/* Theme Options */}
                        <div className="grid gap-2 mb-4">
                            {themeOptions.map((option) => {
                                const IconComponent = option.icon;
                                const isActive = disneyTheme === option.key;

                                return (
                                    <motion.button
                                        key={option.key}
                                        onClick={() => handleThemeChange(option.key)}
                                        className={cn(
                                            "relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                                            isActive
                                                ? "border-primary bg-primary/5 ring-2 ring-offset-2"
                                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Theme preview */}
                                        <div className={cn("relative w-8 h-8 rounded-md overflow-hidden", option.bgColor)}>
                                            <div className={cn("absolute inset-0 bg-gradient-to-br", option.gradient, "opacity-80")} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <IconComponent className="h-4 w-4 text-white drop-shadow-md" />
                                            </div>
                                        </div>

                                        {/* Theme info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{option.name}</div>
                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                        </div>

                                        {/* Active indicator */}
                                        {isActive && (
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-primary"
                                                layoutId="activeTheme"
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <Separator className="my-4" />

                        {/* Preferences */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    ⚙️
                                </motion.div>
                                Theme Preferences
                            </h4>

                            {/* Animations toggle */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="animations" className="text-sm flex items-center gap-2">
                                    ✨ Magical Animations
                                </Label>
                                <Switch
                                    id="animations"
                                    checked={preferences.animations}
                                    onCheckedChange={(checked) =>
                                        updatePreferences({ animations: checked })
                                    }
                                />
                            </div>

                            {/* Particles toggle */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="particles" className="text-sm flex items-center gap-2">
                                    🌟 Floating Particles
                                </Label>
                                <Switch
                                    id="particles"
                                    checked={preferences.particles}
                                    onCheckedChange={(checked) =>
                                        updatePreferences({ particles: checked })
                                    }
                                />
                            </div>

                            {/* Reduced motion toggle */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="reduced-motion" className="text-sm flex items-center gap-2">
                                    🎯 Reduce Motion
                                </Label>
                                <Switch
                                    id="reduced-motion"
                                    checked={preferences.reducedMotion}
                                    onCheckedChange={(checked) =>
                                        updatePreferences({ reducedMotion: checked })
                                    }
                                />
                            </div>

                            {/* Auto switch toggle */}
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto-switch" className="text-sm flex items-center gap-2">
                                    🕐 Auto Theme Switch
                                </Label>
                                <Switch
                                    id="auto-switch"
                                    checked={preferences.autoSwitch}
                                    onCheckedChange={(checked) =>
                                        updatePreferences({ autoSwitch: checked })
                                    }
                                />
                            </div>

                            {preferences.autoSwitch && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pl-4 space-y-2 text-xs text-muted-foreground"
                                >
                                    <div>🌅 Light: {preferences.autoSwitchTimes.lightStart}</div>
                                    <div>🌙 Dark: {preferences.autoSwitchTimes.darkStart}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Current system theme indicator */}
                        <Separator className="my-4" />
                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>System theme:</span>
                            <span className="flex items-center gap-1">
                                {systemTheme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                                {systemTheme}
                            </span>
                        </div>
                    </motion.div>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    );
}

// Compact theme toggle for mobile/small spaces
export function CompactThemeToggle() {
    const { disneyTheme, setDisneyTheme } = useDisneyTheme();
    const CurrentIcon = THEME_ICONS[disneyTheme];

    const toggleTheme = () => {
        const themes = Object.keys(THEME_ICONS) as Array<keyof typeof THEME_ICONS>;
        const currentIndex = themes.indexOf(disneyTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setDisneyTheme(themes[nextIndex]);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className={cn(
                            "relative transition-all duration-300 hover:scale-110",
                            THEME_COLORS[disneyTheme]
                        )}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={disneyTheme}
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                <CurrentIcon className="h-4 w-4" />
                            </motion.div>
                        </AnimatePresence>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Switch theme</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}