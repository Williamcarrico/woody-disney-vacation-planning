import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Theme configuration types
export interface DisneyThemeConfig {
    name: string;
    description: string;
    accent: string;
    gradient: string;
    animation: string;
    // Enhanced color palette
    colors: {
        primary: string;
        secondary: string;
        surface: string;
        surfaceVariant: string;
        onSurface: string;
        onSurfaceVariant: string;
        outline: string;
        outlineVariant: string;
        danger: string;
        warning: string;
        success: string;
        info: string;
    };
}

export type DisneyTheme = "light" | "dark" | "castle" | "galaxy" | "ocean";

// Component theme configuration types
export interface ComponentThemes {
    button: {
        primary: {
            background: string;
            text: string;
            border: string;
            ring: string;
        };
        secondary: {
            background: string;
            text: string;
            border: string;
            ring: string;
        };
        outline: {
            background: string;
            text: string;
            border: string;
            ring: string;
        };
        ghost: {
            background: string;
            text: string;
            border: string;
            ring: string;
        };
        destructive: {
            background: string;
            text: string;
            border: string;
            ring: string;
        };
    };
    card: {
        background: string;
        text: string;
        muted: string;
    };
    input: {
        background: string;
        text: string;
        ring: string;
    };
    badge: {
        default: {
            background: string;
            text: string;
        };
        secondary: {
            background: string;
            text: string;
        };
        destructive: {
            background: string;
            text: string;
        };
        outline: {
            background: string;
            text: string;
        };
    };
    alert: {
        default: {
            background: string;
            icon: string;
        };
        destructive: {
            background: string;
            icon: string;
        };
        warning: {
            background: string;
            icon: string;
        };
        success: {
            background: string;
            icon: string;
        };
    };
    navigation: {
        background: string;
        text: string;
        hover: string;
        active: string;
    };
}

// Enhanced theme configurations with sophisticated color systems
export const DISNEY_THEMES: Record<DisneyTheme, DisneyThemeConfig> = {
    light: {
        name: "Magical Day",
        description: "Bright and enchanting like a Disney park at sunrise",
        accent: "#FF6B35",
        gradient: "from-blue-200 via-purple-200 to-pink-200",
        animation: "sparkle",
        colors: {
            primary: "#3B82F6",
            secondary: "#8B5CF6",
            surface: "#FFFFFF",
            surfaceVariant: "#F8FAFC",
            onSurface: "#1E293B",
            onSurfaceVariant: "#64748B",
            outline: "#CBD5E1",
            outlineVariant: "#E2E8F0",
            danger: "#EF4444",
            warning: "#F59E0B",
            success: "#10B981",
            info: "#06B6D4",
        },
    },
    dark: {
        name: "Starlit Night",
        description: "Mysterious and magical like Disney parks after dark",
        accent: "#8B5CF6",
        gradient: "from-purple-900 via-blue-900 to-indigo-900",
        animation: "glow",
        colors: {
            primary: "#6366F1",
            secondary: "#A855F7",
            surface: "#0F172A",
            surfaceVariant: "#1E293B",
            onSurface: "#F1F5F9",
            onSurfaceVariant: "#CBD5E1",
            outline: "#475569",
            outlineVariant: "#334155",
            danger: "#F87171",
            warning: "#FBBF24",
            success: "#34D399",
            info: "#22D3EE",
        },
    },
    castle: {
        name: "Castle Dreams",
        description: "Royal and majestic like Cinderella's Castle",
        accent: "#F59E0B",
        gradient: "from-yellow-200 via-amber-200 to-orange-200",
        animation: "shimmer",
        colors: {
            primary: "#D97706",
            secondary: "#F59E0B",
            surface: "#FFFBEB",
            surfaceVariant: "#FEF3C7",
            onSurface: "#92400E",
            onSurfaceVariant: "#B45309",
            outline: "#FCD34D",
            outlineVariant: "#FDE68A",
            danger: "#DC2626",
            warning: "#EA580C",
            success: "#059669",
            info: "#0284C7",
        },
    },
    galaxy: {
        name: "Space Mountain",
        description: "Futuristic and cosmic like a journey through space",
        accent: "#06B6D4",
        gradient: "from-cyan-900 via-blue-900 to-purple-900",
        animation: "cosmic",
        colors: {
            primary: "#0EA5E9",
            secondary: "#06B6D4",
            surface: "#0C1427",
            surfaceVariant: "#1E293B",
            onSurface: "#E0F2FE",
            onSurfaceVariant: "#BAE6FD",
            outline: "#0369A1",
            outlineVariant: "#075985",
            danger: "#DC2626",
            warning: "#F59E0B",
            success: "#10B981",
            info: "#22D3EE",
        },
    },
    ocean: {
        name: "Under the Sea",
        description: "Flowing and serene like Ariel's underwater kingdom",
        accent: "#10B981",
        gradient: "from-emerald-200 via-teal-200 to-cyan-200",
        animation: "wave",
        colors: {
            primary: "#059669",
            secondary: "#10B981",
            surface: "#F0FDFA",
            surfaceVariant: "#CCFBF1",
            onSurface: "#064E3B",
            onSurfaceVariant: "#065F46",
            outline: "#6EE7B7",
            outlineVariant: "#A7F3D0",
            danger: "#DC2626",
            warning: "#F59E0B",
            success: "#047857",
            info: "#0891B2",
        },
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

// Enhanced color utilities
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

// Enhanced CSS Variable generation
export function generateThemeVariables(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];
    const colorVariants = generateColorVariants(config.accent, theme);

    return {
        "--theme-primary": config.colors.primary,
        "--theme-secondary": config.colors.secondary,
        "--theme-surface": config.colors.surface,
        "--theme-surface-variant": config.colors.surfaceVariant,
        "--theme-on-surface": config.colors.onSurface,
        "--theme-on-surface-variant": config.colors.onSurfaceVariant,
        "--theme-outline": config.colors.outline,
        "--theme-outline-variant": config.colors.outlineVariant,
        "--theme-accent": config.accent,
        "--theme-gradient": config.gradient,
        "--theme-animation": config.animation,
        "--theme-danger": config.colors.danger,
        "--theme-warning": config.colors.warning,
        "--theme-success": config.colors.success,
        "--theme-info": config.colors.info,
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

// Enhanced accessibility utilities
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

    // Enhanced fallback with theme-aware colors
    const isDark = theme === "dark" || theme === "galaxy";
    return isDark ? config.colors.onSurface : config.colors.onSurface;
}

// Theme-specific styling utilities
export function getThemeStyles(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];

    return {
        accent: config.accent,
        gradient: `bg-gradient-to-r ${config.gradient}`,
        animation: config.animation,
        textGlow: theme === "dark" || theme === "galaxy" ? "text-shadow: 0 0 10px rgba(255, 255, 255, 0.5)" : "",
        backgroundEffect: getBackgroundEffect(theme),
        borderGlow: `box-shadow: 0 0 20px ${config.accent}40`,
        colors: config.colors,
    };
}

export function getBackgroundEffect(theme: DisneyTheme): string {
    const config = DISNEY_THEMES[theme];

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
            return `background-color: ${config.colors.surface}`;
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

// Enhanced component themes with full accessibility support
export const COMPONENT_THEMES: Record<DisneyTheme, ComponentThemes> = {
    light: {
        button: {
            primary: {
                background: "bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800",
                text: "text-white",
                border: "border-blue-600 hover:border-blue-700 focus:border-blue-700",
                ring: "focus:ring-blue-500/30"
            },
            secondary: {
                background: "bg-slate-100 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-300",
                text: "text-slate-900",
                border: "border-slate-300 hover:border-slate-400 focus:border-slate-400",
                ring: "focus:ring-slate-500/30"
            },
            outline: {
                background: "bg-transparent hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-200",
                text: "text-slate-900 hover:text-slate-950",
                border: "border-slate-300 hover:border-slate-400 focus:border-slate-500",
                ring: "focus:ring-slate-500/30"
            },
            ghost: {
                background: "bg-transparent hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-200",
                text: "text-slate-700 hover:text-slate-900",
                border: "border-transparent",
                ring: "focus:ring-slate-500/30"
            },
            destructive: {
                background: "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800",
                text: "text-white",
                border: "border-red-600 hover:border-red-700 focus:border-red-700",
                ring: "focus:ring-red-500/30"
            }
        },
        card: {
            background: "bg-white border-slate-200 shadow-sm hover:shadow-md",
            text: "text-slate-900",
            muted: "text-slate-600"
        },
        input: {
            background: "bg-white border-slate-300 focus:border-blue-500",
            text: "text-slate-900 placeholder:text-slate-500",
            ring: "focus:ring-blue-500/30"
        },
        badge: {
            default: {
                background: "bg-slate-900 text-white",
                text: "text-white"
            },
            secondary: {
                background: "bg-slate-100 text-slate-900",
                text: "text-slate-900"
            },
            destructive: {
                background: "bg-red-100 text-red-900 border-red-200",
                text: "text-red-900"
            },
            outline: {
                background: "bg-transparent border-slate-300 text-slate-900",
                text: "text-slate-900"
            }
        },
        alert: {
            default: {
                background: "bg-slate-50 border-slate-200 text-slate-900",
                icon: "text-slate-600"
            },
            destructive: {
                background: "bg-red-50 border-red-200 text-red-900",
                icon: "text-red-600"
            },
            warning: {
                background: "bg-amber-50 border-amber-200 text-amber-900",
                icon: "text-amber-600"
            },
            success: {
                background: "bg-green-50 border-green-200 text-green-900",
                icon: "text-green-600"
            }
        },
        navigation: {
            background: "bg-white/95 backdrop-blur-sm border-slate-200",
            text: "text-slate-900",
            hover: "hover:bg-slate-100 hover:text-slate-950",
            active: "bg-blue-100 text-blue-900"
        }
    },
    dark: {
    button: {
            primary: {
                background: "bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-400",
                text: "text-white",
                border: "border-blue-600 hover:border-blue-500 focus:border-blue-500",
                ring: "focus:ring-blue-400/30"
            },
            secondary: {
                background: "bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-600",
                text: "text-slate-100",
                border: "border-slate-700 hover:border-slate-600 focus:border-slate-600",
                ring: "focus:ring-slate-400/30"
            },
            outline: {
                background: "bg-transparent hover:bg-slate-800 focus:bg-slate-800 active:bg-slate-700",
                text: "text-slate-100 hover:text-white",
                border: "border-slate-700 hover:border-slate-600 focus:border-slate-500",
                ring: "focus:ring-slate-400/30"
            },
            ghost: {
                background: "bg-transparent hover:bg-slate-800 focus:bg-slate-800 active:bg-slate-700",
                text: "text-slate-300 hover:text-slate-100",
                border: "border-transparent",
                ring: "focus:ring-slate-400/30"
            },
            destructive: {
                background: "bg-red-600 hover:bg-red-500 focus:bg-red-500 active:bg-red-400",
                text: "text-white",
                border: "border-red-600 hover:border-red-500 focus:border-red-500",
                ring: "focus:ring-red-400/30"
            }
        },
        card: {
            background: "bg-slate-900/50 border-slate-800 shadow-lg hover:shadow-xl",
            text: "text-slate-100",
            muted: "text-slate-400"
        },
        input: {
            background: "bg-slate-900 border-slate-700 focus:border-blue-400",
            text: "text-slate-100 placeholder:text-slate-500",
            ring: "focus:ring-blue-400/30"
        },
        badge: {
            default: {
                background: "bg-slate-800 text-slate-100",
                text: "text-slate-100"
            },
            secondary: {
                background: "bg-slate-800 text-slate-300",
                text: "text-slate-300"
            },
            destructive: {
                background: "bg-red-900/50 text-red-300 border-red-800",
                text: "text-red-300"
            },
            outline: {
                background: "bg-transparent border-slate-700 text-slate-300",
                text: "text-slate-300"
            }
        },
        alert: {
            default: {
                background: "bg-slate-900/50 border-slate-800 text-slate-100",
                icon: "text-slate-400"
            },
            destructive: {
                background: "bg-red-900/50 border-red-800 text-red-300",
                icon: "text-red-400"
            },
            warning: {
                background: "bg-amber-900/50 border-amber-800 text-amber-300",
                icon: "text-amber-400"
            },
            success: {
                background: "bg-green-900/50 border-green-800 text-green-300",
                icon: "text-green-400"
            }
        },
        navigation: {
            background: "bg-slate-900/95 backdrop-blur-sm border-slate-800",
            text: "text-slate-100",
            hover: "hover:bg-slate-800 hover:text-white",
            active: "bg-blue-900/50 text-blue-300"
        }
    },
    castle: {
        button: {
            primary: {
                background: "bg-amber-600 hover:bg-amber-700 focus:bg-amber-700 active:bg-amber-800",
                text: "text-white",
                border: "border-amber-600 hover:border-amber-700 focus:border-amber-700",
                ring: "focus:ring-amber-500/30"
            },
            secondary: {
                background: "bg-amber-100 hover:bg-amber-200 focus:bg-amber-200 active:bg-amber-300",
                text: "text-amber-900",
                border: "border-amber-300 hover:border-amber-400 focus:border-amber-400",
                ring: "focus:ring-amber-500/30"
            },
            outline: {
                background: "bg-transparent hover:bg-amber-50 focus:bg-amber-50 active:bg-amber-100",
                text: "text-amber-800 hover:text-amber-900",
                border: "border-amber-300 hover:border-amber-400 focus:border-amber-500",
                ring: "focus:ring-amber-500/30"
            },
            ghost: {
                background: "bg-transparent hover:bg-amber-50 focus:bg-amber-50 active:bg-amber-100",
                text: "text-amber-700 hover:text-amber-900",
                border: "border-transparent",
                ring: "focus:ring-amber-500/30"
            },
            destructive: {
                background: "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800",
                text: "text-white",
                border: "border-red-600 hover:border-red-700 focus:border-red-700",
                ring: "focus:ring-red-500/30"
            }
    },
    card: {
            background: "bg-amber-50/80 border-amber-200 shadow-sm hover:shadow-md",
            text: "text-amber-900",
            muted: "text-amber-700"
        },
        input: {
            background: "bg-white border-amber-300 focus:border-amber-500",
            text: "text-amber-900 placeholder:text-amber-500",
            ring: "focus:ring-amber-500/30"
        },
        badge: {
            default: {
                background: "bg-amber-800 text-amber-100",
                text: "text-amber-100"
            },
            secondary: {
                background: "bg-amber-100 text-amber-800",
                text: "text-amber-800"
            },
            destructive: {
                background: "bg-red-100 text-red-900 border-red-200",
                text: "text-red-900"
            },
            outline: {
                background: "bg-transparent border-amber-300 text-amber-800",
                text: "text-amber-800"
            }
        },
        alert: {
            default: {
                background: "bg-amber-50 border-amber-200 text-amber-900",
                icon: "text-amber-600"
            },
            destructive: {
                background: "bg-red-50 border-red-200 text-red-900",
                icon: "text-red-600"
            },
            warning: {
                background: "bg-yellow-50 border-yellow-200 text-yellow-900",
                icon: "text-yellow-600"
            },
            success: {
                background: "bg-green-50 border-green-200 text-green-900",
                icon: "text-green-600"
            }
        },
        navigation: {
            background: "bg-amber-50/95 backdrop-blur-sm border-amber-200",
            text: "text-amber-900",
            hover: "hover:bg-amber-100 hover:text-amber-950",
            active: "bg-amber-200 text-amber-900"
        }
    },
    galaxy: {
        button: {
            primary: {
                background: "bg-cyan-600 hover:bg-cyan-500 focus:bg-cyan-500 active:bg-cyan-400",
                text: "text-white",
                border: "border-cyan-600 hover:border-cyan-500 focus:border-cyan-500",
                ring: "focus:ring-cyan-400/30"
            },
            secondary: {
                background: "bg-slate-800 hover:bg-slate-700 focus:bg-slate-700 active:bg-slate-600",
                text: "text-cyan-100",
                border: "border-slate-700 hover:border-slate-600 focus:border-slate-600",
                ring: "focus:ring-cyan-400/30"
            },
            outline: {
                background: "bg-transparent hover:bg-cyan-950/50 focus:bg-cyan-950/50 active:bg-cyan-900/50",
                text: "text-cyan-300 hover:text-cyan-100",
                border: "border-cyan-700 hover:border-cyan-600 focus:border-cyan-500",
                ring: "focus:ring-cyan-400/30"
            },
            ghost: {
                background: "bg-transparent hover:bg-cyan-950/50 focus:bg-cyan-950/50 active:bg-cyan-900/50",
                text: "text-cyan-400 hover:text-cyan-200",
                border: "border-transparent",
                ring: "focus:ring-cyan-400/30"
            },
            destructive: {
                background: "bg-red-600 hover:bg-red-500 focus:bg-red-500 active:bg-red-400",
                text: "text-white",
                border: "border-red-600 hover:border-red-500 focus:border-red-500",
                ring: "focus:ring-red-400/30"
            }
        },
        card: {
            background: "bg-slate-900/80 border-cyan-800/50 shadow-lg hover:shadow-cyan-500/20",
            text: "text-cyan-100",
            muted: "text-cyan-300"
        },
        input: {
            background: "bg-slate-900 border-cyan-800 focus:border-cyan-500",
            text: "text-cyan-100 placeholder:text-cyan-500",
            ring: "focus:ring-cyan-400/30"
        },
        badge: {
            default: {
                background: "bg-cyan-800 text-cyan-100",
                text: "text-cyan-100"
            },
            secondary: {
                background: "bg-slate-800 text-cyan-300",
                text: "text-cyan-300"
            },
            destructive: {
                background: "bg-red-900/50 text-red-300 border-red-800",
                text: "text-red-300"
            },
            outline: {
                background: "bg-transparent border-cyan-700 text-cyan-300",
                text: "text-cyan-300"
            }
        },
        alert: {
            default: {
                background: "bg-slate-900/80 border-cyan-800 text-cyan-100",
                icon: "text-cyan-400"
            },
            destructive: {
                background: "bg-red-900/50 border-red-800 text-red-300",
                icon: "text-red-400"
            },
            warning: {
                background: "bg-amber-900/50 border-amber-800 text-amber-300",
                icon: "text-amber-400"
            },
            success: {
                background: "bg-green-900/50 border-green-800 text-green-300",
                icon: "text-green-400"
            }
        },
        navigation: {
            background: "bg-slate-900/95 backdrop-blur-sm border-cyan-800/50",
            text: "text-cyan-100",
            hover: "hover:bg-cyan-950/50 hover:text-cyan-50",
            active: "bg-cyan-900/50 text-cyan-200"
        }
    },
    ocean: {
        button: {
            primary: {
                background: "bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-800",
                text: "text-white",
                border: "border-emerald-600 hover:border-emerald-700 focus:border-emerald-700",
                ring: "focus:ring-emerald-500/30"
            },
            secondary: {
                background: "bg-emerald-100 hover:bg-emerald-200 focus:bg-emerald-200 active:bg-emerald-300",
                text: "text-emerald-900",
                border: "border-emerald-300 hover:border-emerald-400 focus:border-emerald-400",
                ring: "focus:ring-emerald-500/30"
            },
            outline: {
                background: "bg-transparent hover:bg-emerald-50 focus:bg-emerald-50 active:bg-emerald-100",
                text: "text-emerald-800 hover:text-emerald-900",
                border: "border-emerald-300 hover:border-emerald-400 focus:border-emerald-500",
                ring: "focus:ring-emerald-500/30"
            },
            ghost: {
                background: "bg-transparent hover:bg-emerald-50 focus:bg-emerald-50 active:bg-emerald-100",
                text: "text-emerald-700 hover:text-emerald-900",
                border: "border-transparent",
                ring: "focus:ring-emerald-500/30"
            },
            destructive: {
                background: "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-800",
                text: "text-white",
                border: "border-red-600 hover:border-red-700 focus:border-red-700",
                ring: "focus:ring-red-500/30"
            }
        },
        card: {
            background: "bg-emerald-50/80 border-emerald-200 shadow-sm hover:shadow-md",
            text: "text-emerald-900",
            muted: "text-emerald-700"
        },
        input: {
            background: "bg-white border-emerald-300 focus:border-emerald-500",
            text: "text-emerald-900 placeholder:text-emerald-500",
            ring: "focus:ring-emerald-500/30"
        },
        badge: {
            default: {
                background: "bg-emerald-800 text-emerald-100",
                text: "text-emerald-100"
            },
            secondary: {
                background: "bg-emerald-100 text-emerald-800",
                text: "text-emerald-800"
            },
            destructive: {
                background: "bg-red-100 text-red-900 border-red-200",
                text: "text-red-900"
            },
            outline: {
                background: "bg-transparent border-emerald-300 text-emerald-800",
                text: "text-emerald-800"
            }
        },
        alert: {
            default: {
                background: "bg-emerald-50 border-emerald-200 text-emerald-900",
                icon: "text-emerald-600"
            },
            destructive: {
                background: "bg-red-50 border-red-200 text-red-900",
                icon: "text-red-600"
            },
            warning: {
                background: "bg-amber-50 border-amber-200 text-amber-900",
                icon: "text-amber-600"
            },
            success: {
                background: "bg-green-50 border-green-200 text-green-900",
                icon: "text-green-600"
            }
        },
        navigation: {
            background: "bg-emerald-50/95 backdrop-blur-sm border-emerald-200",
            text: "text-emerald-900",
            hover: "hover:bg-emerald-100 hover:text-emerald-950",
            active: "bg-emerald-200 text-emerald-900"
        }
    }
};

// Enhanced semantic color system for complex components
export function getSemanticColors(theme: DisneyTheme) {
    const config = DISNEY_THEMES[theme];
    const componentTheme = COMPONENT_THEMES[theme];

    return {
        // Text colors
        text: {
            primary: componentTheme.card.text,
            secondary: componentTheme.card.muted,
            inverse: theme === 'light' || theme === 'castle' || theme === 'ocean' ? 'text-white' : 'text-slate-900',
            accent: `text-${getThemeAccentColor(theme)}-600`,
            danger: 'text-red-600 dark:text-red-400',
            warning: 'text-amber-600 dark:text-amber-400',
            success: 'text-green-600 dark:text-green-400',
            info: 'text-blue-600 dark:text-blue-400',
        },

        // Background colors
        background: {
            primary: componentTheme.card.background,
            secondary: getSecondaryBackground(theme),
            accent: `bg-${getThemeAccentColor(theme)}-50 dark:bg-${getThemeAccentColor(theme)}-950`,
            surface: getSurfaceBackground(theme),
            overlay: getOverlayBackground(theme),
            danger: 'bg-red-50 dark:bg-red-950/50',
            warning: 'bg-amber-50 dark:bg-amber-950/50',
            success: 'bg-green-50 dark:bg-green-950/50',
            info: 'bg-blue-50 dark:bg-blue-950/50',
        },

        // Border colors
        border: {
            primary: getBorderColor(theme),
            secondary: getSecondaryBorderColor(theme),
            accent: `border-${getThemeAccentColor(theme)}-200 dark:border-${getThemeAccentColor(theme)}-800`,
            danger: 'border-red-200 dark:border-red-800',
            warning: 'border-amber-200 dark:border-amber-800',
            success: 'border-green-200 dark:border-green-800',
            info: 'border-blue-200 dark:border-blue-800',
        },

        // Interactive states
        interactive: {
            hover: getHoverColor(theme),
            focus: getFocusColor(theme),
            active: getActiveColor(theme),
            disabled: getDisabledColor(theme),
        },

        // Status indicators
        status: {
            online: 'bg-green-500',
            offline: 'bg-gray-500 dark:bg-gray-600',
            away: 'bg-yellow-500',
            busy: 'bg-red-500',
            pending: 'bg-blue-500',
        },

        // Wait time indicators
        waitTimes: {
            low: 'bg-green-500 text-white',
            medium: 'bg-yellow-500 text-white',
            high: 'bg-orange-500 text-white',
            extreme: 'bg-red-500 text-white',
        },

        // Theme-specific decorative colors
        decorative: {
            gradient: getThemeGradient(theme),
            accent: config.accent,
            shadow: getThemeShadow(theme),
        }
    };
}

// Helper functions for semantic colors
function getThemeAccentColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'blue';
        case 'dark': return 'purple';
        case 'castle': return 'amber';
        case 'galaxy': return 'cyan';
        case 'ocean': return 'emerald';
        default: return 'blue';
    }
}

function getSecondaryBackground(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'bg-slate-50';
        case 'dark': return 'bg-slate-800/50';
        case 'castle': return 'bg-amber-25';
        case 'galaxy': return 'bg-slate-800/30';
        case 'ocean': return 'bg-emerald-25';
        default: return 'bg-slate-50 dark:bg-slate-800/50';
    }
}

function getSurfaceBackground(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'bg-white/95 backdrop-blur-sm';
        case 'dark': return 'bg-slate-900/95 backdrop-blur-sm';
        case 'castle': return 'bg-amber-50/95 backdrop-blur-sm';
        case 'galaxy': return 'bg-slate-900/90 backdrop-blur-sm';
        case 'ocean': return 'bg-emerald-50/95 backdrop-blur-sm';
        default: return 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm';
    }
}

function getOverlayBackground(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'bg-white/80 backdrop-blur-md';
        case 'dark': return 'bg-slate-900/80 backdrop-blur-md';
        case 'castle': return 'bg-amber-50/80 backdrop-blur-md';
        case 'galaxy': return 'bg-slate-900/85 backdrop-blur-md';
        case 'ocean': return 'bg-emerald-50/80 backdrop-blur-md';
        default: return 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md';
    }
}

function getBorderColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'border-slate-200';
        case 'dark': return 'border-slate-800';
        case 'castle': return 'border-amber-200';
        case 'galaxy': return 'border-cyan-800/50';
        case 'ocean': return 'border-emerald-200';
        default: return 'border-slate-200 dark:border-slate-800';
    }
}

function getSecondaryBorderColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'border-slate-100';
        case 'dark': return 'border-slate-700';
        case 'castle': return 'border-amber-100';
        case 'galaxy': return 'border-cyan-700/30';
        case 'ocean': return 'border-emerald-100';
        default: return 'border-slate-100 dark:border-slate-700';
    }
}

function getHoverColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'hover:bg-slate-100';
        case 'dark': return 'hover:bg-slate-800';
        case 'castle': return 'hover:bg-amber-100';
        case 'galaxy': return 'hover:bg-cyan-950/50';
        case 'ocean': return 'hover:bg-emerald-100';
        default: return 'hover:bg-slate-100 dark:hover:bg-slate-800';
    }
}

function getFocusColor(theme: DisneyTheme): string {
    const accentColor = getThemeAccentColor(theme);
    return `focus:ring-${accentColor}-500/30 focus:border-${accentColor}-500`;
}

function getActiveColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'active:bg-slate-200';
        case 'dark': return 'active:bg-slate-700';
        case 'castle': return 'active:bg-amber-200';
        case 'galaxy': return 'active:bg-cyan-900/50';
        case 'ocean': return 'active:bg-emerald-200';
        default: return 'active:bg-slate-200 dark:active:bg-slate-700';
    }
}

function getDisabledColor(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed';
        case 'dark': return 'disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed';
        case 'castle': return 'disabled:bg-amber-100 disabled:text-amber-400 disabled:cursor-not-allowed';
        case 'galaxy': return 'disabled:bg-slate-800 disabled:text-cyan-700 disabled:cursor-not-allowed';
        case 'ocean': return 'disabled:bg-emerald-100 disabled:text-emerald-400 disabled:cursor-not-allowed';
        default: return 'disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed';
    }
}

function getThemeGradient(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
        case 'dark': return 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-950';
        case 'castle': return 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50';
        case 'galaxy': return 'bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-950';
        case 'ocean': return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
        default: return 'bg-gradient-to-br from-slate-50 via-white to-slate-100';
    }
}

function getThemeShadow(theme: DisneyTheme): string {
    switch (theme) {
        case 'light': return 'shadow-lg shadow-slate-200/50';
        case 'dark': return 'shadow-xl shadow-black/50';
        case 'castle': return 'shadow-lg shadow-amber-200/50';
        case 'galaxy': return 'shadow-xl shadow-cyan-900/50';
        case 'ocean': return 'shadow-lg shadow-emerald-200/50';
        default: return 'shadow-lg';
    }
}

// Utility class generator for consistent theming
export function getUtilityClasses(theme: DisneyTheme) {
    const semantic = getSemanticColors(theme);

    return {
        // Text utilities
        textPrimary: semantic.text.primary,
        textSecondary: semantic.text.secondary,
        textAccent: semantic.text.accent,
        textInverse: semantic.text.inverse,

        // Background utilities
        bgPrimary: semantic.background.primary,
        bgSecondary: semantic.background.secondary,
        bgAccent: semantic.background.accent,
        bgSurface: semantic.background.surface,
        bgOverlay: semantic.background.overlay,

        // Border utilities
        borderPrimary: semantic.border.primary,
        borderSecondary: semantic.border.secondary,
        borderAccent: semantic.border.accent,

        // Interactive utilities
        interactive: `${semantic.interactive.hover} ${semantic.interactive.focus} ${semantic.interactive.active}`,

        // Status utilities
        statusOnline: semantic.status.online,
        statusOffline: semantic.status.offline,
        statusPending: semantic.status.pending,

        // Wait time utilities
        waitTimeLow: semantic.waitTimes.low,
        waitTimeMedium: semantic.waitTimes.medium,
        waitTimeHigh: semantic.waitTimes.high,
        waitTimeExtreme: semantic.waitTimes.extreme,

        // Decorative utilities
        gradient: semantic.decorative.gradient,
        shadow: semantic.decorative.shadow,
    };
}

// Component-specific theme getter functions
export function getButtonTheme(theme: DisneyTheme, variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' = 'primary') {
    return COMPONENT_THEMES[theme].button[variant];
}

export function getCardTheme(theme: DisneyTheme) {
    return COMPONENT_THEMES[theme].card;
}

export function getInputTheme(theme: DisneyTheme) {
    return COMPONENT_THEMES[theme].input;
}

export function getBadgeTheme(theme: DisneyTheme, variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default') {
    return COMPONENT_THEMES[theme].badge[variant];
}

export function getAlertTheme(theme: DisneyTheme, variant: 'default' | 'destructive' | 'warning' | 'success' = 'default') {
    return COMPONENT_THEMES[theme].alert[variant];
}

export function getNavigationTheme(theme: DisneyTheme) {
    return COMPONENT_THEMES[theme].navigation;
}

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