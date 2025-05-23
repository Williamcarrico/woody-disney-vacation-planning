# Disney Theme Provider

A sophisticated, immersive theming system inspired by Disney magic, featuring smooth animations, accessibility controls, and comprehensive customization options.

## ✨ Features

- **5 Disney-Inspired Themes**: Light, Dark, Castle, Galaxy, and Ocean themes
- **Smooth Animations**: Theme-specific animations with accessibility controls
- **Accessibility First**: WCAG AA compliant with reduced motion and high contrast options
- **Persistent Preferences**: Auto-save user preferences to localStorage
- **System Theme Detection**: Respects user's system theme preference
- **Auto Theme Switching**: Optional time-based theme switching
- **TypeScript Support**: Fully typed with comprehensive interfaces
- **Performance Optimized**: Efficient transitions with minimal re-renders

## 🚀 Quick Start

### 1. Setup Theme Provider

Wrap your app with the `ThemeProvider` component:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          defaultTheme="system"
          defaultDisneyTheme="dark"
          enableSystem
          attribute="class"
          storageKey="disney-vacation-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 2. Add Theme Toggle

Use the theme toggle component in your UI:

```tsx
import { ThemeToggle } from "@/components/theme-provider/theme-toggle";

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### 3. Use Theme in Components

Access theme context in your components:

```tsx
import { useDisneyTheme } from "@/components/theme-provider";
import { cn, COMPONENT_THEMES } from "@/components/theme-provider/theme-utils";

function MyComponent() {
  const { disneyTheme, preferences } = useDisneyTheme();

  return (
    <div className={cn(
      "p-4 rounded-lg",
      COMPONENT_THEMES.card[disneyTheme]
    )}>
      <h2>Current theme: {disneyTheme}</h2>
      {preferences.animations && (
        <div className="animate-sparkle">Magic!</div>
      )}
    </div>
  );
}
```

## 🎨 Available Themes

### Light Theme - "Magical Day"
- **Colors**: Blue, purple, and pink gradients
- **Animation**: Sparkle effects
- **Feeling**: Bright and enchanting like a Disney park at sunrise

### Dark Theme - "Starlit Night"
- **Colors**: Purple, blue, and indigo gradients
- **Animation**: Glow effects
- **Feeling**: Mysterious and magical like Disney parks after dark

### Castle Theme - "Castle Dreams"
- **Colors**: Yellow, amber, and orange gradients
- **Animation**: Shimmer effects
- **Feeling**: Royal and majestic like Cinderella's Castle

### Galaxy Theme - "Space Mountain"
- **Colors**: Cyan, blue, and purple gradients
- **Animation**: Cosmic effects
- **Feeling**: Futuristic and cosmic like a journey through space

### Ocean Theme - "Under the Sea"
- **Colors**: Emerald, teal, and cyan gradients
- **Animation**: Wave effects
- **Feeling**: Flowing and serene like Ariel's underwater kingdom

## 📱 Components

### ThemeProvider

Main provider component that wraps your application.

```tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  defaultDisneyTheme?: DisneyTheme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  forcedTheme?: string;
  attribute?: string;
  value?: Record<string, string>;
  nonce?: string;
}
```

### ThemeToggle

Interactive theme selector with dropdown preferences.

```tsx
import { ThemeToggle } from "@/components/theme-provider/theme-toggle";

<ThemeToggle />
```

### CompactThemeToggle

Minimal theme toggle for mobile/compact layouts.

```tsx
import { CompactThemeToggle } from "@/components/theme-provider/theme-toggle";

<CompactThemeToggle />
```

### ThemeSelector

Grid-based theme selector component.

```tsx
import { ThemeSelector } from "@/components/theme-provider";

<ThemeSelector className="my-custom-class" />
```

### ThemeShowcase

Comprehensive demo component showing all features.

```tsx
import { ThemeShowcase } from "@/components/theme-provider/theme-showcase";

<ThemeShowcase />
```

## 🎣 Hooks

### useDisneyTheme

Main hook for accessing theme context:

```tsx
const {
  theme,           // Current theme name
  disneyTheme,     // Current Disney theme
  setTheme,        // Function to change theme
  setDisneyTheme,  // Function to change Disney theme
  toggleTheme,     // Function to toggle through themes
  isTransitioning, // Boolean indicating transition state
  systemTheme,     // System theme preference
  preferences,     // User preferences object
  updatePreferences, // Function to update preferences
  themeVariables,  // CSS variables for current theme
} = useDisneyTheme();
```

## 🛠️ Utilities

### Theme Utilities

```tsx
import {
  cn,                    // Class name utility (clsx + tailwind-merge)
  getThemeConfig,        // Get theme configuration
  getAllThemes,          // Get all available theme names
  getThemeStyles,        // Get theme-specific styles
  COMPONENT_THEMES,      // Pre-built component theme classes
  generateColorVariants, // Generate color variants from base color
  isAccessible,          // Check color accessibility
  ensureAccessibleColor, // Ensure color meets accessibility standards
} from "@/components/theme-provider/theme-utils";
```

### Using Component Themes

Pre-built theme classes for common components:

```tsx
// Buttons
<button className={COMPONENT_THEMES.button[disneyTheme]}>
  Themed Button
</button>

// Cards
<div className={COMPONENT_THEMES.card[disneyTheme]}>
  Themed Card
</div>

// Text
<p className={COMPONENT_THEMES.text[disneyTheme]}>
  Themed Text
</p>
```

## 🎨 Animations

### Available Animations

- `animate-sparkle` - Magical sparkle effect
- `animate-shimmer` - Royal shimmer effect
- `animate-cosmic` - Space-like cosmic animation
- `animate-wave` - Ocean wave movement
- `animate-magical-glow` - Theme-aware glow effect
- `animate-theme-transition` - Smooth theme transition

### Using Animations

```tsx
// Simple animation
<div className="animate-sparkle">
  Sparkling content
</div>

// Conditional animation based on preferences
<div className={cn(
  "base-styles",
  preferences.animations && "animate-magical-glow"
)}>
  Content with optional animation
</div>
```

## ♿ Accessibility

### Accessibility Features

- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Optional high contrast mode
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **WCAG AA Compliance**: All color combinations meet accessibility standards

### Accessibility Controls

```tsx
const { preferences, updatePreferences } = useDisneyTheme();

// Toggle reduced motion
updatePreferences({ reducedMotion: true });

// Enable high contrast
updatePreferences({ highContrast: true });

// Disable animations
updatePreferences({ animations: false });

// Disable particles
updatePreferences({ particles: false });
```

## ⚙️ Advanced Configuration

### Auto Theme Switching

Enable automatic theme switching based on time:

```tsx
updatePreferences({
  autoSwitch: true,
  autoSwitchTimes: {
    lightStart: "06:00",
    darkStart: "18:00"
  }
});
```

### Custom Theme Variables

Access CSS variables in your styles:

```css
.my-component {
  background: var(--theme-accent);
  transition: all var(--theme-transition-duration);
  border-radius: var(--theme-border-radius);
}
```

### Theme-Specific Backgrounds

Use pre-built theme backgrounds:

```tsx
<div className="bg-magical-day">Light theme background</div>
<div className="bg-starlit-night">Dark theme background</div>
<div className="bg-castle-dreams">Castle theme background</div>
<div className="bg-space-mountain">Galaxy theme background</div>
<div className="bg-under-sea">Ocean theme background</div>
```

## 📝 Type Definitions

```tsx
type DisneyTheme = "light" | "dark" | "castle" | "galaxy" | "ocean";

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
```

## 🎭 HOC Usage

Create theme-aware components using the HOC:

```tsx
import { withTheme } from "@/components/theme-provider";

interface MyComponentProps {
  title: string;
  theme: ThemeContextType; // Injected by HOC
}

const MyComponent = withTheme<MyComponentProps>(({ title, theme }) => {
  return (
    <div style={{ color: theme.themeVariables['--theme-accent'] }}>
      <h1>{title}</h1>
      <p>Current theme: {theme.disneyTheme}</p>
    </div>
  );
});
```

## 🔧 Troubleshooting

### Theme Not Persisting
Ensure your storage key is unique and localStorage is available:

```tsx
<ThemeProvider storageKey="my-app-theme">
```

### Animations Not Working
Check if animations are enabled in preferences:

```tsx
const { preferences } = useDisneyTheme();
console.log('Animations enabled:', preferences.animations);
```

### Hydration Mismatch
Use `suppressHydrationWarning` on your HTML element:

```tsx
<html lang="en" suppressHydrationWarning>
```

## 🌟 Best Practices

1. **Performance**: Use `React.memo` for expensive components that consume theme context
2. **Accessibility**: Always test with keyboard navigation and screen readers
3. **Color Contrast**: Use the provided `isAccessible` utility to validate custom colors
4. **Animation**: Respect user preferences and provide opt-out controls
5. **TypeScript**: Leverage the provided types for better development experience

## 📦 Dependencies

- `next-themes` - Core theme functionality
- `framer-motion` - Smooth animations
- `clsx` & `tailwind-merge` - Utility class merging
- `lucide-react` - Icons

## 🎨 Customization

### Adding Custom Themes

Extend the theme system by modifying the `DISNEY_THEMES` configuration:

```tsx
// theme-utils.ts
export const DISNEY_THEMES = {
  // ... existing themes
  custom: {
    name: "My Custom Theme",
    description: "A custom theme description",
    accent: "#FF0080",
    gradient: "from-pink-500 to-purple-500",
    animation: "pulse",
  },
};
```

### Custom Animations

Add custom animations in your CSS:

```css
@keyframes my-animation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.animate-my-animation {
  animation: my-animation 2s ease-in-out infinite;
}
```

---

✨ **Happy theming!** Create magical user experiences with Disney-inspired design! ✨