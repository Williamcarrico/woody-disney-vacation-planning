"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn, type DisneyTheme, DISNEY_THEMES, generateThemeVariables } from "@/lib/utils"

// Enhanced theme context with more sophisticated state management
interface EnhancedThemeContextType {
    disneyTheme: DisneyTheme
    setDisneyTheme: (theme: DisneyTheme) => void
    isTransitioning: boolean
    themeVariables: Record<string, string>
    enableAnimations: boolean
    setEnableAnimations: (enabled: boolean) => void
    accessibility: {
        highContrast: boolean
        reducedMotion: boolean
        largeText: boolean
    }
    setAccessibility: (settings: Partial<typeof accessibility>) => void
    colorBlindnessMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
    setColorBlindnessMode: (mode: typeof colorBlindnessMode) => void
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined)

interface EnhancedThemeProviderProps {
    children: React.ReactNode
    defaultDisneyTheme?: DisneyTheme
    storageKey?: string
    enableSystemTheme?: boolean
}

export function EnhancedThemeProvider({
    children,
    defaultDisneyTheme = "light",
    storageKey = "disney-theme",
    enableSystemTheme = true
}: EnhancedThemeProviderProps) {
    const { theme: systemTheme } = useTheme()
    const [disneyTheme, setDisneyThemeState] = useState<DisneyTheme>(defaultDisneyTheme)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [enableAnimations, setEnableAnimations] = useState(true)
    const [accessibility, setAccessibilityState] = useState({
        highContrast: false,
        reducedMotion: false,
        largeText: false
    })
    const [colorBlindnessMode, setColorBlindnessMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none')

    // Memoize theme variables to prevent unnecessary recalculations
    const themeVariables = useMemo(() => {
        return generateThemeVariables(disneyTheme)
    }, [disneyTheme])

    // Enhanced theme setter with transition effects
    const setDisneyTheme = useCallback((newTheme: DisneyTheme) => {
        if (newTheme === disneyTheme) return

        setIsTransitioning(true)
        
        // Smooth transition with CSS variables
        const root = document.documentElement
        const currentVars = generateThemeVariables(disneyTheme)
        const newVars = generateThemeVariables(newTheme)

        // Animate CSS custom properties
        const startTime = performance.now()
        const duration = enableAnimations ? 500 : 0

        const animateTheme = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3)

            // Interpolate colors (simplified - in production you'd want proper color interpolation)
            Object.keys(newVars).forEach(key => {
                root.style.setProperty(key, newVars[key])
            })

            if (progress < 1 && enableAnimations) {
                requestAnimationFrame(animateTheme)
            } else {
                setDisneyThemeState(newTheme)
                setIsTransitioning(false)
                
                // Save to localStorage
                try {
                    localStorage.setItem(storageKey, newTheme)
                } catch (error) {
                    console.warn('Failed to save theme to localStorage:', error)
                }
            }
        }

        requestAnimationFrame(animateTheme)
    }, [disneyTheme, enableAnimations, storageKey])

    // Enhanced accessibility setter
    const setAccessibility = useCallback((newSettings: Partial<typeof accessibility>) => {
        setAccessibilityState(prev => {
            const updated = { ...prev, ...newSettings }
            
            // Apply accessibility settings to document
            document.documentElement.classList.toggle('high-contrast', updated.highContrast)
            document.documentElement.classList.toggle('reduce-motion', updated.reducedMotion)
            document.documentElement.classList.toggle('large-text', updated.largeText)
            
            // Save to localStorage
            try {
                localStorage.setItem('accessibility-settings', JSON.stringify(updated))
            } catch (error) {
                console.warn('Failed to save accessibility settings:', error)
            }
            
            return updated
        })
    }, [])

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem(storageKey) as DisneyTheme
            const savedAccessibility = localStorage.getItem('accessibility-settings')
            
            if (savedTheme && Object.keys(DISNEY_THEMES).includes(savedTheme)) {
                setDisneyThemeState(savedTheme)
            } else if (enableSystemTheme && systemTheme) {
                // Map system theme to Disney theme
                const themeMap: Record<string, DisneyTheme> = {
                    'dark': 'dark',
                    'light': 'light',
                    'system': systemTheme === 'dark' ? 'dark' : 'light'
                }
                setDisneyThemeState(themeMap[systemTheme] || 'light')
            }

            if (savedAccessibility) {
                const parsed = JSON.parse(savedAccessibility)
                setAccessibility(parsed)
            }
        } catch (error) {
            console.warn('Failed to load theme from localStorage:', error)
        }

        // Check for system preference for reduced motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        if (mediaQuery.matches) {
            setAccessibility({ reducedMotion: true })
        }

        const handleChange = (e: MediaQueryListEvent) => {
            setAccessibility({ reducedMotion: e.matches })
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [storageKey, enableSystemTheme, systemTheme, setAccessibility])

    // Apply theme variables to document
    useEffect(() => {
        const root = document.documentElement
        Object.entries(themeVariables).forEach(([key, value]) => {
            root.style.setProperty(key, value)
        })

        // Apply colorblindness filter
        const filters = {
            none: 'none',
            protanopia: 'url(#protanopia-filter)',
            deuteranopia: 'url(#deuteranopia-filter)', 
            tritanopia: 'url(#tritanopia-filter)'
        }

        if (colorBlindnessMode !== 'none') {
            root.style.filter = filters[colorBlindnessMode]
        } else {
            root.style.filter = 'none'
        }
    }, [themeVariables, colorBlindnessMode])

    const contextValue = useMemo(() => ({
        disneyTheme,
        setDisneyTheme,
        isTransitioning,
        themeVariables,
        enableAnimations,
        setEnableAnimations,
        accessibility,
        setAccessibility,
        colorBlindnessMode,
        setColorBlindnessMode
    }), [
        disneyTheme,
        setDisneyTheme,
        isTransitioning,
        themeVariables,
        enableAnimations,
        accessibility,
        setAccessibility,
        colorBlindnessMode
    ])

    return (
        <EnhancedThemeContext.Provider value={contextValue}>
            {/* Color blindness SVG filters */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="protanopia-filter">
                        <feColorMatrix values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
                    </filter>
                    <filter id="deuteranopia-filter">
                        <feColorMatrix values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
                    </filter>
                    <filter id="tritanopia-filter">
                        <feColorMatrix values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
                    </filter>
                </defs>
            </svg>

            {/* Theme transition overlay */}
            <AnimatePresence>
                {isTransitioning && enableAnimations && (
                    <motion.div
                        className="fixed inset-0 z-[9999] pointer-events-none"
                        style={{
                            background: `radial-gradient(circle, ${DISNEY_THEMES[disneyTheme].accent}20 0%, transparent 70%)`
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </AnimatePresence>

            {children}
        </EnhancedThemeContext.Provider>
    )
}

// Custom hook to use the enhanced theme context
export function useEnhancedTheme() {
    const context = useContext(EnhancedThemeContext)
    if (context === undefined) {
        throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
    }
    return context
}

/**
 * Theme selector component with live preview
 */
interface ThemeSelectorProps {
    className?: string
    showPreview?: boolean
    onThemeSelect?: (theme: DisneyTheme) => void
}

export function ThemeSelector({ 
    className, 
    showPreview = true, 
    onThemeSelect 
}: ThemeSelectorProps) {
    const { disneyTheme, setDisneyTheme, enableAnimations } = useEnhancedTheme()
    const [previewTheme, setPreviewTheme] = useState<DisneyTheme | null>(null)

    const handleThemeClick = (theme: DisneyTheme) => {
        setDisneyTheme(theme)
        onThemeSelect?.(theme)
    }

    const handleThemeHover = (theme: DisneyTheme) => {
        if (showPreview && enableAnimations) {
            setPreviewTheme(theme)
        }
    }

    const handleMouseLeave = () => {
        setPreviewTheme(null)
    }

    return (
        <div className={cn("space-y-4", className)}>
            <h3 className="text-lg font-semibold">Choose Your Magic Theme</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(DISNEY_THEMES).map(([key, config]) => {
                    const themeKey = key as DisneyTheme
                    const isActive = disneyTheme === themeKey
                    const isPreview = previewTheme === themeKey

                    return (
                        <motion.button
                            key={themeKey}
                            className={cn(
                                "relative p-4 rounded-xl border-2 transition-all duration-300",
                                "hover:scale-105 active:scale-95",
                                isActive 
                                    ? "border-primary shadow-lg shadow-primary/20" 
                                    : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleThemeClick(themeKey)}
                            onMouseEnter={() => handleThemeHover(themeKey)}
                            onMouseLeave={handleMouseLeave}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Theme preview */}
                            <div className="space-y-3">
                                {/* Color palette */}
                                <div className="flex space-x-1">
                                    <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: config.colors.primary }}
                                    />
                                    <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: config.colors.secondary }}
                                    />
                                    <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: config.accent }}
                                    />
                                </div>

                                {/* Theme info */}
                                <div className="text-left">
                                    <h4 className="font-medium text-sm">{config.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {config.description}
                                    </p>
                                </div>

                                {/* Animation preview */}
                                <div className="h-8 rounded bg-gradient-to-r opacity-20" 
                                     style={{
                                         background: `linear-gradient(135deg, ${config.colors.primary}, ${config.accent})`
                                     }}>
                                    {enableAnimations && (isActive || isPreview) && (
                                        <motion.div
                                            className="h-full bg-white/30 rounded"
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <span className="text-primary-foreground text-xs">✓</span>
                                </motion.div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Preview indicator */}
            {showPreview && previewTheme && (
                <motion.div
                    className="text-center text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    Previewing: {DISNEY_THEMES[previewTheme].name}
                </motion.div>
            )}
        </div>
    )
}

/**
 * Accessibility settings component
 */
interface AccessibilityControlsProps {
    className?: string
}

export function AccessibilityControls({ className }: AccessibilityControlsProps) {
    const { 
        accessibility, 
        setAccessibility, 
        enableAnimations, 
        setEnableAnimations,
        colorBlindnessMode,
        setColorBlindnessMode
    } = useEnhancedTheme()

    return (
        <div className={cn("space-y-6", className)}>
            <h3 className="text-lg font-semibold">Accessibility Settings</h3>

            {/* Motion settings */}
            <div className="space-y-3">
                <h4 className="font-medium">Motion & Animation</h4>
                <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={enableAnimations}
                            onChange={(e) => setEnableAnimations(e.target.checked)}
                            className="rounded border-input"
                        />
                        <span className="text-sm">Enable animations</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={accessibility.reducedMotion}
                            onChange={(e) => setAccessibility({ reducedMotion: e.target.checked })}
                            className="rounded border-input"
                        />
                        <span className="text-sm">Reduce motion</span>
                    </label>
                </div>
            </div>

            {/* Visual settings */}
            <div className="space-y-3">
                <h4 className="font-medium">Visual Accessibility</h4>
                <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={accessibility.highContrast}
                            onChange={(e) => setAccessibility({ highContrast: e.target.checked })}
                            className="rounded border-input"
                        />
                        <span className="text-sm">High contrast mode</span>
                    </label>
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={accessibility.largeText}
                            onChange={(e) => setAccessibility({ largeText: e.target.checked })}
                            className="rounded border-input"
                        />
                        <span className="text-sm">Large text</span>
                    </label>
                </div>
            </div>

            {/* Color blindness support */}
            <div className="space-y-3">
                <h4 className="font-medium">Color Vision Support</h4>
                <select
                    value={colorBlindnessMode}
                    onChange={(e) => setColorBlindnessMode(e.target.value as any)}
                    className="w-full p-2 rounded border border-input bg-background"
                >
                    <option value="none">Normal vision</option>
                    <option value="protanopia">Protanopia (Red-blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-blind)</option>
                </select>
            </div>
        </div>
    )
}

/**
 * Theme showcase component for testing
 */
export function ThemeShowcase() {
    const { disneyTheme } = useEnhancedTheme()
    const config = DISNEY_THEMES[disneyTheme]

    return (
        <div className="space-y-6 p-6 rounded-xl border bg-card">
            <h3 className="text-xl font-bold">Theme Preview: {config.name}</h3>
            
            {/* Color swatches */}
            <div className="grid grid-cols-4 gap-4">
                {Object.entries(config.colors).map(([name, color]) => (
                    <div key={name} className="text-center">
                        <div 
                            className="w-16 h-16 rounded-lg mx-auto mb-2 border"
                            style={{ backgroundColor: color }}
                        />
                        <p className="text-xs font-medium capitalize">{name}</p>
                        <p className="text-xs text-muted-foreground">{color}</p>
                    </div>
                ))}
            </div>

            {/* Component previews */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
                        Primary Button
                    </button>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">
                        Secondary Button
                    </button>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                        This is a preview of how text appears with the current theme.
                        The colors automatically adapt to ensure proper contrast and readability.
                    </p>
                </div>
            </div>
        </div>
    )
}