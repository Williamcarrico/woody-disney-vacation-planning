"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps as NextThemeProviderProps } from "next-themes";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced theme configuration with Disney-inspired themes
const DISNEY_THEMES = {
    light: {
        name: "Magical Day",
        description: "Bright and enchanting like a Disney park at sunrise",
        accent: "#FF6B35",
        gradient: "from-blue-200 via-purple-200 to-pink-200",
        animation: "sparkle",
    },
    dark: {
        name: "Starlit Night",
        description: "Mysterious and magical like Disney parks after dark",
        accent: "#8B5CF6",
        gradient: "from-purple-900 via-blue-900 to-indigo-900",
        animation: "glow",
    },
    castle: {
        name: "Castle Dreams",
        description: "Royal and majestic like Cinderella's Castle",
        accent: "#F59E0B",
        gradient: "from-yellow-200 via-amber-200 to-orange-200",
        animation: "shimmer",
    },
    galaxy: {
        name: "Space Mountain",
        description: "Futuristic and cosmic like a journey through space",
        accent: "#06B6D4",
        gradient: "from-cyan-900 via-blue-900 to-purple-900",
        animation: "cosmic",
    },
    ocean: {
        name: "Under the Sea",
        description: "Flowing and serene like Ariel's underwater kingdom",
        accent: "#10B981",
        gradient: "from-emerald-200 via-teal-200 to-cyan-200",
        animation: "wave",
    },
} as const;

type DisneyTheme = keyof typeof DISNEY_THEMES;

interface ThemeContextType {
    theme: string;
    disneyTheme: DisneyTheme;
    setTheme: (theme: DisneyTheme) => void;
    setDisneyTheme: (theme: DisneyTheme) => void;
    toggleTheme: () => void;
    isTransitioning: boolean;
    systemTheme: "light" | "dark";
    preferences: ThemePreferences;
    updatePreferences: (prefs: Partial<ThemePreferences>) => void;
    themeVariables: Record<string, string>;
}

interface ThemePreferences {
    animations: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    autoSwitch: boolean;
    autoSwitchTimes: {
        lightStart: string;
        darkStart: string;
    };
    transitionDuration: number;
    particles: boolean;
    soundEffects: boolean;
}

const DEFAULT_PREFERENCES: ThemePreferences = {
    animations: true,
    highContrast: false,
    reducedMotion: false,
    autoSwitch: false,
    autoSwitchTimes: {
        lightStart: "06:00",
        darkStart: "18:00",
    },
    transitionDuration: 500,
    particles: true,
    soundEffects: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps extends Pick<NextThemeProviderProps, 'attribute' | 'value' | 'nonce'> {
    children: React.ReactNode;
    defaultTheme?: string;
    defaultDisneyTheme?: DisneyTheme;
    storageKey?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    themes?: string[];
    forcedTheme?: string;
}

// Theme transition animations
const themeVariants = {
    light: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#1F2937",
        transition: { duration: 0.8, ease: "easeInOut" }
    },
    dark: {
        background: "linear-gradient(135deg, #1F2937 0%, #111827 100%)",
        color: "#F9FAFB",
        transition: { duration: 0.8, ease: "easeInOut" }
    }
};

// Magical particle component for theme transitions
const MagicalParticles: React.FC<{ theme: DisneyTheme; enabled: boolean }> = ({ theme, enabled }) => {
    if (!enabled) return null;

    const particleCount = 20;
    const themeConfig = DISNEY_THEMES[theme];

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {Array.from({ length: particleCount }).map((_, i) => (
                    <motion.div
                        key={`${theme}-${i}`}
                        className={`absolute w-2 h-2 rounded-full opacity-60`}
                        style={{
                            background: themeConfig.accent,
                            boxShadow: `0 0 10px ${themeConfig.accent}`,
                        }}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: window.innerHeight + 20,
                            scale: 0,
                            opacity: 0,
                        }}
                        animate={{
                            x: Math.random() * window.innerWidth,
                            y: -20,
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            ease: "easeOut",
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// Enhanced theme transition overlay
const ThemeTransitionOverlay: React.FC<{
    isVisible: boolean;
    theme: DisneyTheme;
    duration: number;
}> = ({ isVisible, theme, duration }) => {
    const themeConfig = DISNEY_THEMES[theme];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[9999] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration / 1000 }}
                >
                    <motion.div
                        className={`w-full h-full bg-gradient-to-br ${themeConfig.gradient}`}
                        style={{
                            background: `radial-gradient(circle at center, ${themeConfig.accent}40 0%, transparent 70%)`,
                        }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.8, 0.4, 0],
                        }}
                        transition={{
                            duration: duration / 1000,
                            ease: "easeInOut",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-shimmer" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export function ThemeProvider({
    children,
    defaultTheme = "system",
    defaultDisneyTheme = "light",
    storageKey = "disney-vacation-theme",
    enableSystem = true,
    disableTransitionOnChange = false,
    themes = ["light", "dark", "system"],
    forcedTheme,
    attribute = "class",
    value,
    nonce,
    ...props
}: ThemeProviderProps) {
    const [disneyTheme, setDisneyThemeState] = useState<DisneyTheme>(defaultDisneyTheme);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
    const [preferences, setPreferences] = useState<ThemePreferences>(DEFAULT_PREFERENCES);
    const [mounted, setMounted] = useState(false);

    // Load preferences from localStorage
    useEffect(() => {
        setMounted(true);
        try {
            const savedPrefs = localStorage.getItem(`${storageKey}-preferences`);
            if (savedPrefs) {
                setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) });
            }
            const savedDisneyTheme = localStorage.getItem(`${storageKey}-disney`) as DisneyTheme;
            if (savedDisneyTheme && DISNEY_THEMES[savedDisneyTheme]) {
                setDisneyThemeState(savedDisneyTheme);
            }
        } catch (error) {
            console.warn("Failed to load theme preferences:", error);
        }
    }, [storageKey]);

    // System theme detection
    useEffect(() => {
        if (!enableSystem) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        setSystemTheme(mediaQuery.matches ? "dark" : "light");
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [enableSystem]);



    // Generate theme-specific CSS variables
    const themeVariables = React.useMemo(() => {
        const config = DISNEY_THEMES[disneyTheme];
        return {
            '--theme-accent': config.accent,
            '--theme-gradient': config.gradient,
            '--theme-animation': config.animation,
            '--transition-duration': `${preferences.transitionDuration}ms`,
        };
    }, [disneyTheme, preferences.transitionDuration]);

    // Apply CSS variables to document
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        Object.entries(themeVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [themeVariables, mounted]);

    const setDisneyTheme = useCallback((newTheme: DisneyTheme) => {
        if (newTheme === disneyTheme) return;

        setIsTransitioning(true);

        // Smooth transition with magical effects
        setTimeout(() => {
            setDisneyThemeState(newTheme);
            localStorage.setItem(`${storageKey}-disney`, newTheme);

            // Play theme change sound effect if enabled
            if (preferences.soundEffects) {
                const audio = new Audio('/sounds/theme-change.mp3');
                audio.volume = 0.3;
                audio.play().catch(() => {
                    // Ignore audio errors in case file doesn't exist
                });
            }

            setTimeout(() => {
                setIsTransitioning(false);
            }, preferences.transitionDuration);
        }, 50);
    }, [disneyTheme, storageKey, preferences.transitionDuration, preferences.soundEffects]);

    // Auto theme switching based on time
    useEffect(() => {
        if (!preferences.autoSwitch) return;

        const checkTime = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const lightStart = preferences.autoSwitchTimes.lightStart;
            const darkStart = preferences.autoSwitchTimes.darkStart;

            if (currentTime >= lightStart && currentTime < darkStart) {
                setDisneyTheme("light");
            } else {
                setDisneyTheme("dark");
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [preferences.autoSwitch, preferences.autoSwitchTimes, setDisneyTheme]);

    const updatePreferences = useCallback((newPrefs: Partial<ThemePreferences>) => {
        const updated = { ...preferences, ...newPrefs };
        setPreferences(updated);
        localStorage.setItem(`${storageKey}-preferences`, JSON.stringify(updated));
    }, [preferences, storageKey]);

    const toggleTheme = useCallback(() => {
        const themeKeys = Object.keys(DISNEY_THEMES) as DisneyTheme[];
        const currentIndex = themeKeys.indexOf(disneyTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        const nextTheme = themeKeys[nextIndex];
        setDisneyTheme(nextTheme);
    }, [disneyTheme, setDisneyTheme]);

    // Enhanced accessibility support
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        // Apply accessibility preferences
        if (preferences.reducedMotion) {
            root.style.setProperty('--animation-duration', '0s');
            root.classList.add('reduce-motion');
        } else {
            root.style.removeProperty('--animation-duration');
            root.classList.remove('reduce-motion');
        }

        if (preferences.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    }, [preferences.reducedMotion, preferences.highContrast, mounted]);

    const contextValue: ThemeContextType = {
        theme: disneyTheme,
        disneyTheme,
        setTheme: setDisneyTheme,
        setDisneyTheme,
        toggleTheme,
        isTransitioning,
        systemTheme,
        preferences,
        updatePreferences,
        themeVariables,
    };

    if (!mounted) {
        return <div className="theme-loading">{children}</div>;
    }

    return (
        <NextThemesProvider
            attribute={attribute}
            defaultTheme={defaultTheme}
            enableSystem={enableSystem}
            storageKey={storageKey}
            themes={themes}
            forcedTheme={forcedTheme}
            value={value}
            nonce={nonce}
            disableTransitionOnChange={disableTransitionOnChange}
            {...props}
        >
            <ThemeContext.Provider value={contextValue}>
                <motion.div
                    className="theme-container"
                    variants={themeVariants}
                    animate={disneyTheme}
                    style={themeVariables as React.CSSProperties}
                    transition={{
                        duration: preferences.transitionDuration / 1000,
                        ease: "easeInOut",
                    }}
                >
                    {/* Theme transition overlay */}
                    <ThemeTransitionOverlay
                        isVisible={isTransitioning && preferences.animations}
                        theme={disneyTheme}
                        duration={preferences.transitionDuration}
                    />

                    {/* Magical particles */}
                    <MagicalParticles
                        theme={disneyTheme}
                        enabled={preferences.particles && preferences.animations && !preferences.reducedMotion}
                    />

                    {/* Main content */}
                    <motion.div
                        className="theme-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            </ThemeContext.Provider>
        </NextThemesProvider>
    );
}

// Custom hook to use theme context
export const useDisneyTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useDisneyTheme must be used within a ThemeProvider");
    }
    return context;
};

// Theme utilities
export const getThemeConfig = (theme: DisneyTheme) => DISNEY_THEMES[theme];
export const getAllThemes = () => Object.keys(DISNEY_THEMES) as DisneyTheme[];

// HOC for theme-aware components
export function withTheme<P extends object>(
    Component: React.ComponentType<P & { theme: ThemeContextType }>
) {
    return function ThemedComponent(props: P) {
        const theme = useDisneyTheme();
        return <Component {...props} theme={theme} />;
    };
}

// Theme selector component
export const ThemeSelector: React.FC<{ className?: string }> = ({ className }) => {
    const { disneyTheme, setDisneyTheme } = useDisneyTheme();

    return (
        <div className={`theme-selector ${className}`}>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.entries(DISNEY_THEMES).map(([key, config]) => (
                    <motion.button
                        key={key}
                        className={`
              relative p-4 rounded-lg border-2 transition-all duration-300
              ${disneyTheme === key
                                ? 'border-accent ring-2 ring-offset-2'
                                : 'border-border hover:border-accent/50'
                            }
            `}
                        onClick={() => setDisneyTheme(key as DisneyTheme)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Switch to ${config.name} theme`}
                    >
                        <div
                            className={`w-full h-8 rounded bg-gradient-to-r ${config.gradient} mb-2 bg-theme-accent`}
                        />
                        <div className="text-sm font-medium">{config.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {config.description}
                        </div>
                        {disneyTheme === key && (
                            <motion.div
                                className="absolute inset-0 rounded-lg bg-accent/10"
                                layoutId="activeTheme"
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default ThemeProvider;
