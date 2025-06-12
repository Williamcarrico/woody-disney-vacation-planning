import { type DisneyTheme, getSemanticColors, getUtilityClasses, COMPONENT_THEMES } from '@/components/theme-provider/theme-utils';

/**
 * Theme Optimizer - Comprehensive Dark/Light Mode Color System
 *
 * This utility provides standardized color mappings to replace hardcoded colors
 * throughout the codebase, ensuring perfect readability and accessibility
 * across all Disney theme variants.
 */

// Common hardcoded color mappings that need to be replaced
export const COLOR_MAPPINGS = {
    // Text color replacements
    text: {
        'text-white': 'text-primary-foreground',
        'text-black': 'text-foreground',
        'text-gray-50': 'text-muted-foreground',
        'text-gray-100': 'text-muted-foreground',
        'text-gray-200': 'text-muted-foreground',
        'text-gray-300': 'text-muted-foreground',
        'text-gray-400': 'text-muted-foreground',
        'text-gray-500': 'text-muted-foreground',
        'text-gray-600': 'text-muted-foreground',
        'text-gray-700': 'text-foreground',
        'text-gray-800': 'text-foreground',
        'text-gray-900': 'text-foreground',
        'text-slate-100': 'text-muted-foreground',
        'text-slate-200': 'text-muted-foreground',
        'text-slate-300': 'text-muted-foreground',
        'text-slate-400': 'text-muted-foreground',
        'text-slate-500': 'text-muted-foreground',
        'text-slate-600': 'text-muted-foreground',
        'text-slate-700': 'text-foreground',
        'text-slate-800': 'text-foreground',
        'text-slate-900': 'text-foreground',
    },

    // Background color replacements
    background: {
        'bg-white': 'bg-background',
        'bg-black': 'bg-foreground',
        'bg-gray-50': 'bg-muted',
        'bg-gray-100': 'bg-muted',
        'bg-gray-200': 'bg-muted',
        'bg-gray-800': 'bg-muted dark:bg-muted',
        'bg-gray-900': 'bg-background dark:bg-muted',
        'bg-slate-50': 'bg-muted',
        'bg-slate-100': 'bg-muted',
        'bg-slate-200': 'bg-muted',
        'bg-slate-800': 'bg-muted dark:bg-muted',
        'bg-slate-900': 'bg-background dark:bg-muted',
    },

    // Border color replacements
    border: {
        'border-white': 'border-border',
        'border-black': 'border-foreground',
        'border-gray-200': 'border-border',
        'border-gray-300': 'border-border',
        'border-gray-800': 'border-border',
        'border-slate-200': 'border-border',
        'border-slate-300': 'border-border',
        'border-slate-800': 'border-border',
    }
};

// Theme-aware color generators
export function getThemeAwareColors(theme: DisneyTheme) {
    const semantic = getSemanticColors(theme);
    const utility = getUtilityClasses(theme);
    const componentThemes = COMPONENT_THEMES[theme];

    return {
        // Core semantic colors
        semantic,
        utility,
        components: componentThemes,

        // Enhanced color system for complex components
        enhanced: {
            // Navigation colors
            nav: {
                bg: semantic.background.surface,
                text: semantic.text.primary,
                hover: semantic.interactive.hover,
                active: semantic.interactive.active,
                border: semantic.border.primary,
            },

            // Card colors
            card: {
                bg: semantic.background.primary,
                text: semantic.text.primary,
                muted: semantic.text.secondary,
                border: semantic.border.primary,
                shadow: semantic.decorative.shadow,
            },

            // Button colors
            button: {
                primary: {
                    bg: componentThemes.button.primary.background,
                    text: componentThemes.button.primary.text,
                    border: componentThemes.button.primary.border,
                    ring: componentThemes.button.primary.ring,
                },
                secondary: {
                    bg: componentThemes.button.secondary.background,
                    text: componentThemes.button.secondary.text,
                    border: componentThemes.button.secondary.border,
                    ring: componentThemes.button.secondary.ring,
                },
                outline: {
                    bg: componentThemes.button.outline.background,
                    text: componentThemes.button.outline.text,
                    border: componentThemes.button.outline.border,
                    ring: componentThemes.button.outline.ring,
                },
                ghost: {
                    bg: componentThemes.button.ghost.background,
                    text: componentThemes.button.ghost.text,
                    border: componentThemes.button.ghost.border,
                    ring: componentThemes.button.ghost.ring,
                },
                destructive: {
                    bg: componentThemes.button.destructive.background,
                    text: componentThemes.button.destructive.text,
                    border: componentThemes.button.destructive.border,
                    ring: componentThemes.button.destructive.ring,
                },
            },

            // Status colors
            status: {
                success: {
                    bg: semantic.background.success,
                    text: semantic.text.success,
                    border: semantic.border.success,
                },
                warning: {
                    bg: semantic.background.warning,
                    text: semantic.text.warning,
                    border: semantic.border.warning,
                },
                danger: {
                    bg: semantic.background.danger,
                    text: semantic.text.danger,
                    border: semantic.border.danger,
                },
                info: {
                    bg: semantic.background.info,
                    text: semantic.text.info,
                    border: semantic.border.info,
                },
            },

            // Interactive states
            interactive: {
                hover: semantic.interactive.hover,
                focus: semantic.interactive.focus,
                active: semantic.interactive.active,
                disabled: semantic.interactive.disabled,
            },

            // Wait time colors (for Disney attractions)
            waitTime: {
                low: semantic.waitTimes.low,
                medium: semantic.waitTimes.medium,
                high: semantic.waitTimes.high,
                extreme: semantic.waitTimes.extreme,
            },

            // Resort category colors
            resort: {
                value: getResortCategoryColor(theme, 'value'),
                moderate: getResortCategoryColor(theme, 'moderate'),
                deluxe: getResortCategoryColor(theme, 'deluxe'),
                dvc: getResortCategoryColor(theme, 'dvc'),
            },

            // Park-specific colors
            park: {
                magicKingdom: getParkColor(theme, 'magic-kingdom'),
                epcot: getParkColor(theme, 'epcot'),
                hollywoodStudios: getParkColor(theme, 'hollywood-studios'),
                animalKingdom: getParkColor(theme, 'animal-kingdom'),
            },

            // Badge colors
            badge: {
                default: componentThemes.badge.default,
                secondary: componentThemes.badge.secondary,
                destructive: componentThemes.badge.destructive,
                outline: componentThemes.badge.outline,
            },

            // Form colors
            form: {
                input: {
                    bg: componentThemes.input.background,
                    text: componentThemes.input.text,
                    ring: componentThemes.input.ring,
                },
                label: semantic.text.primary,
                helpText: semantic.text.secondary,
                error: semantic.text.danger,
            },
        }
    };
}

// Helper functions for specific color categories
function getResortCategoryColor(theme: DisneyTheme, category: 'value' | 'moderate' | 'deluxe' | 'dvc') {
    switch (theme) {
        case 'light':
        case 'castle':
        case 'ocean':
            return {
                value: 'bg-blue-100 text-blue-800 border-blue-200',
                moderate: 'bg-amber-100 text-amber-800 border-amber-200',
                deluxe: 'bg-purple-100 text-purple-800 border-purple-200',
                dvc: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            }[category];
        case 'dark':
        case 'galaxy':
            return {
                value: 'bg-blue-900/30 text-blue-300 border-blue-800',
                moderate: 'bg-amber-900/30 text-amber-300 border-amber-800',
                deluxe: 'bg-purple-900/30 text-purple-300 border-purple-800',
                dvc: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
            }[category];
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

function getParkColor(theme: DisneyTheme, park: 'magic-kingdom' | 'epcot' | 'hollywood-studios' | 'animal-kingdom') {
    switch (theme) {
        case 'light':
        case 'castle':
        case 'ocean':
            return {
                'magic-kingdom': 'bg-blue-100 text-blue-800 border-blue-200',
                'epcot': 'bg-green-100 text-green-800 border-green-200',
                'hollywood-studios': 'bg-red-100 text-red-800 border-red-200',
                'animal-kingdom': 'bg-orange-100 text-orange-800 border-orange-200',
            }[park];
        case 'dark':
        case 'galaxy':
            return {
                'magic-kingdom': 'bg-blue-900/30 text-blue-300 border-blue-800',
                'epcot': 'bg-green-900/30 text-green-300 border-green-800',
                'hollywood-studios': 'bg-red-900/30 text-red-300 border-red-800',
                'animal-kingdom': 'bg-orange-900/30 text-orange-300 border-orange-800',
            }[park];
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

// Utility function to replace hardcoded colors in className strings
export function optimizeColors(className: string): string {
    let optimizedClass = className;

    // Replace text colors
    Object.entries(COLOR_MAPPINGS.text).forEach(([oldColor, newColor]) => {
        optimizedClass = optimizedClass.replace(new RegExp(`\\b${oldColor}\\b`, 'g'), newColor);
    });

    // Replace background colors
    Object.entries(COLOR_MAPPINGS.background).forEach(([oldColor, newColor]) => {
        optimizedClass = optimizedClass.replace(new RegExp(`\\b${oldColor}\\b`, 'g'), newColor);
    });

    // Replace border colors
    Object.entries(COLOR_MAPPINGS.border).forEach(([oldColor, newColor]) => {
        optimizedClass = optimizedClass.replace(new RegExp(`\\b${oldColor}\\b`, 'g'), newColor);
    });

    return optimizedClass;
}

// Comprehensive theme-aware class generators
export function createThemeClasses(theme: DisneyTheme) {
    const colors = getThemeAwareColors(theme);

    return {
        // Page layouts
        page: {
            background: colors.semantic.decorative.gradient,
            container: `${colors.enhanced.card.bg} ${colors.enhanced.card.border} rounded-lg ${colors.enhanced.card.shadow}`,
            text: colors.enhanced.card.text,
        },

        // Navigation
        navigation: {
            bar: `${colors.enhanced.nav.bg} ${colors.enhanced.nav.border} border-b`,
            item: `${colors.enhanced.nav.text} ${colors.enhanced.nav.hover} px-3 py-2 rounded-md transition-colors`,
            active: `${colors.enhanced.nav.active} px-3 py-2 rounded-md`,
        },

        // Cards
        card: {
            base: `${colors.enhanced.card.bg} ${colors.enhanced.card.border} border rounded-lg ${colors.enhanced.card.shadow} p-6`,
            header: `${colors.enhanced.card.text} font-semibold text-lg mb-4`,
            content: `${colors.enhanced.card.text} mb-4`,
            footer: `${colors.enhanced.card.muted} text-sm`,
        },

        // Buttons
        button: {
            primary: `${colors.enhanced.button.primary.bg} ${colors.enhanced.button.primary.text} ${colors.enhanced.button.primary.border} ${colors.enhanced.button.primary.ring} border px-4 py-2 rounded-md font-medium transition-colors`,
            secondary: `${colors.enhanced.button.secondary.bg} ${colors.enhanced.button.secondary.text} ${colors.enhanced.button.secondary.border} ${colors.enhanced.button.secondary.ring} border px-4 py-2 rounded-md font-medium transition-colors`,
            outline: `${colors.enhanced.button.outline.bg} ${colors.enhanced.button.outline.text} ${colors.enhanced.button.outline.border} ${colors.enhanced.button.outline.ring} border px-4 py-2 rounded-md font-medium transition-colors`,
            ghost: `${colors.enhanced.button.ghost.bg} ${colors.enhanced.button.ghost.text} ${colors.enhanced.button.ghost.ring} px-4 py-2 rounded-md font-medium transition-colors`,
            destructive: `${colors.enhanced.button.destructive.bg} ${colors.enhanced.button.destructive.text} ${colors.enhanced.button.destructive.border} ${colors.enhanced.button.destructive.ring} border px-4 py-2 rounded-md font-medium transition-colors`,
        },

        // Form elements
        form: {
            input: `${colors.enhanced.form.input.bg} ${colors.enhanced.form.input.text} ${colors.enhanced.form.input.ring} border rounded-md px-3 py-2 transition-colors`,
            label: `${colors.enhanced.form.label} font-medium text-sm mb-2 block`,
            helpText: `${colors.enhanced.form.helpText} text-sm mt-1`,
            error: `${colors.enhanced.form.error} text-sm mt-1`,
        },

        // Status indicators
        status: {
            success: `${colors.enhanced.status.success.bg} ${colors.enhanced.status.success.text} ${colors.enhanced.status.success.border} border rounded-md px-3 py-2`,
            warning: `${colors.enhanced.status.warning.bg} ${colors.enhanced.status.warning.text} ${colors.enhanced.status.warning.border} border rounded-md px-3 py-2`,
            danger: `${colors.enhanced.status.danger.bg} ${colors.enhanced.status.danger.text} ${colors.enhanced.status.danger.border} border rounded-md px-3 py-2`,
            info: `${colors.enhanced.status.info.bg} ${colors.enhanced.status.info.text} ${colors.enhanced.status.info.border} border rounded-md px-3 py-2`,
        },

        // Wait time indicators
        waitTime: {
            low: colors.enhanced.waitTime.low,
            medium: colors.enhanced.waitTime.medium,
            high: colors.enhanced.waitTime.high,
            extreme: colors.enhanced.waitTime.extreme,
        },

        // Interactive states
        interactive: {
            hover: colors.enhanced.interactive.hover,
            focus: colors.enhanced.interactive.focus,
            active: colors.enhanced.interactive.active,
            disabled: colors.enhanced.interactive.disabled,
        },
    };
}

// Specific utility functions for common component patterns
export function getWaitTimeColor(waitTime: number, theme: DisneyTheme): string {
    const colors = getThemeAwareColors(theme);

    if (waitTime <= 30) return colors.enhanced.waitTime.low;
    if (waitTime <= 60) return colors.enhanced.waitTime.medium;
    if (waitTime <= 90) return colors.enhanced.waitTime.high;
    return colors.enhanced.waitTime.extreme;
}

export function getResortCategoryColors(category: string, theme: DisneyTheme): string {
    const colors = getThemeAwareColors(theme);

    switch (category.toLowerCase()) {
        case 'value': return colors.enhanced.resort.value;
        case 'moderate': return colors.enhanced.resort.moderate;
        case 'deluxe': return colors.enhanced.resort.deluxe;
        case 'dvc': return colors.enhanced.resort.dvc;
        default: return `bg-muted text-muted-foreground border-border`;
    }
}

export function getParkColors(parkId: string, theme: DisneyTheme): string {
    const colors = getThemeAwareColors(theme);

    switch (parkId.toLowerCase()) {
        case 'magic-kingdom':
        case 'mk': return colors.enhanced.park.magicKingdom;
        case 'epcot': return colors.enhanced.park.epcot;
        case 'hollywood-studios':
        case 'dhs': return colors.enhanced.park.hollywoodStudios;
        case 'animal-kingdom':
        case 'ak': return colors.enhanced.park.animalKingdom;
        default: return `bg-muted text-muted-foreground border-border`;
    }
}

// Export all utility functions for easy use throughout the app
export {
    getSemanticColors,
    getUtilityClasses,
    COMPONENT_THEMES,
} from '@/components/theme-provider/theme-utils';