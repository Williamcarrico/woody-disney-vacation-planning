import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Theme configuration types
export interface DisneyThemeConfig {
    name: string;
    description: string;
    accent: string;
    gradient: string;
    animation: string;
}

export type DisneyTheme = "light" | "dark" | "castle" | "galaxy" | "ocean";

// Enhanced theme configurations
export const DISNEY_THEMES: Record<DisneyTheme, DisneyThemeConfig> = {
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
};

// Utility function for combining classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Theme-aware class generation
export function themeClass(theme: DisneyTheme, baseClasses: string, themeVariants?: Partial<Record<DisneyTheme, string>>) {
    const variants = themeVariants?.[theme] || "";
    return cn(baseClasses, variants);
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                h = 0;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

export function generateColorVariants(baseColor: string, theme: DisneyTheme) {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return {};

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const isDark = theme === "dark" || theme === "galaxy";
    const lightAdjust = isDark ? -10 : 0; // Darker variants for dark themes

    return {
        50: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 45 + lightAdjust, 95)}%)`,
        100: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 35 + lightAdjust, 90)}%)`,
        200: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 25 + lightAdjust, 80)}%)`,
        300: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15 + lightAdjust, 70)}%)`,
        400: `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 5 + lightAdjust, 60)}%)`,
        500: baseColor,
        600: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 5 + lightAdjust, 50)}%)`,
        700: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15 + lightAdjust, 40)}%)`,
        800: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 25 + lightAdjust, 30)}%)`,
        900: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 35 + lightAdjust, 20)}%)`,
        950: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 45 + lightAdjust, 10)}%)`,
    };
}

// CSS Variable generation
export function generateThemeVariables(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];
    const colorVariants = generateColorVariants(config.accent, theme);

    return {
        "--theme-primary": config.accent,
        "--theme-gradient": config.gradient,
        "--theme-animation": config.animation,
        ...Object.entries(colorVariants).reduce(
            (acc, [key, value]) => {
                acc[`--theme-${key}`] = value;
                return acc;
            },
            {} as Record<string, string>
        ),
    };
}

// Animation utilities
export const ANIMATION_CONFIGS = {
    sparkle: {
        duration: "6s",
        easing: "linear",
        infinite: true,
        keyframes: {
            "0%": { backgroundPosition: "0% 50%" },
            "50%": { backgroundPosition: "100% 50%" },
            "100%": { backgroundPosition: "0% 50%" },
        },
    },
    glow: {
        duration: "2s",
        easing: "ease-in-out",
        infinite: true,
        keyframes: {
            "0%": { filter: "drop-shadow(0 0 2px rgba(139, 92, 246, 0.2))" },
            "50%": { filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))" },
            "100%": { filter: "drop-shadow(0 0 2px rgba(139, 92, 246, 0.2))" },
        },
    },
    shimmer: {
        duration: "3s",
        easing: "ease-in-out",
        infinite: true,
        keyframes: {
            "0%": { transform: "translateX(-100%)" },
            "50%": { transform: "translateX(100%)" },
            "100%": { transform: "translateX(-100%)" },
        },
    },
    cosmic: {
        duration: "8s",
        easing: "linear",
        infinite: true,
        keyframes: {
            "0%": { backgroundPosition: "0% 0%" },
            "25%": { backgroundPosition: "100% 0%" },
            "50%": { backgroundPosition: "100% 100%" },
            "75%": { backgroundPosition: "0% 100%" },
            "100%": { backgroundPosition: "0% 0%" },
        },
    },
    wave: {
        duration: "4s",
        easing: "ease-in-out",
        infinite: true,
        keyframes: {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-10px)" },
        },
    },
};

// Accessibility utilities
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        const rgb = hexToRgb(color);
        if (!rgb) return 0;

        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

export function isAccessible(foreground: string, background: string, level: "AA" | "AAA" = "AA"): boolean {
    const contrast = getContrastRatio(foreground, background);
    return level === "AA" ? contrast >= 4.5 : contrast >= 7;
}

export function ensureAccessibleColor(foreground: string, background: string, theme: DisneyTheme): string {
    if (isAccessible(foreground, background)) {
        return foreground;
    }

    const config = DISNEY_THEMES[theme];
    const variants = generateColorVariants(config.accent, theme);

    // Try different variants until we find an accessible one
    for (const variant of Object.values(variants)) {
        if (isAccessible(variant, background)) {
            return variant;
        }
    }

    // Fallback to high contrast colors
    return theme === "dark" ? "#ffffff" : "#000000";
}

// Theme-specific styling utilities
export function getThemeStyles(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];

    return {
        accent: config.accent,
        gradient: `bg-gradient-to-r ${config.gradient}`,
        animation: config.animation,
        textGlow: theme === "dark" ? "text-shadow: 0 0 10px rgba(255, 255, 255, 0.5)" : "",
        backgroundEffect: getBackgroundEffect(theme),
        borderGlow: `box-shadow: 0 0 20px ${config.accent}40`,
    };
}

export function getBackgroundEffect(theme: DisneyTheme): string {
    switch (theme) {
        case "light":
            return "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50";
        case "dark":
            return "bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900";
        case "castle":
            return "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50";
        case "galaxy":
            return "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900";
        case "ocean":
            return "bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50";
        default:
            return "";
    }
}

// Responsive utilities
export function getThemeResponsiveClasses(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];

    return {
        mobile: `${config.gradient} p-4`,
        tablet: `${config.gradient} p-6 rounded-lg`,
        desktop: `${config.gradient} p-8 rounded-xl shadow-2xl`,
    };
}

// Theme presets for common components
export const COMPONENT_THEMES = {
    button: {
        light: "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
        dark: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white",
        castle: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white",
        galaxy: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white",
        ocean: "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white",
    },
    card: {
        light: "bg-white/80 backdrop-blur-sm border border-blue-200 shadow-lg",
        dark: "bg-gray-900/80 backdrop-blur-sm border border-purple-500/30 shadow-2xl",
        castle: "bg-amber-50/80 backdrop-blur-sm border border-yellow-200 shadow-lg",
        galaxy: "bg-indigo-900/80 backdrop-blur-sm border border-cyan-500/30 shadow-2xl",
        ocean: "bg-teal-50/80 backdrop-blur-sm border border-emerald-200 shadow-lg",
    },
    text: {
        light: "text-gray-900",
        dark: "text-gray-100",
        castle: "text-amber-900",
        galaxy: "text-cyan-100",
        ocean: "text-teal-900",
    },
};

// Export theme getter
export function getThemeConfig(theme: DisneyTheme): DisneyThemeConfig {
    return DISNEY_THEMES[theme];
}

export function getAllThemes(): DisneyTheme[] {
    return Object.keys(DISNEY_THEMES) as DisneyTheme[];
}

// Theme transition helpers
export function getTransitionClasses(duration: number = 300) {
    return `transition-all duration-${duration} ease-in-out`;
}

export function getAnimationDelay(index: number, base: number = 100) {
    return `animation-delay-${index * base}`;
}