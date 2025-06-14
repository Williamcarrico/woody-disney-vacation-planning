import { 
  Kranky, 
  Londrina_Shadow, 
  Rock_Salt, 
  Crafty_Girls, 
  Schoolbell, 
  Sunshiney,
  Bungee_Outline,
  Calligraffitti,
  Coming_Soon,
  Life_Savers
} from "next/font/google"
import { JustMeAgainDownHere } from "next/font/google"

/**
 * Whimsical Google Fonts Configuration
 * Perfect for Disney-themed vacation planning applications
 * 
 * These fonts provide a playful, magical feel that complements
 * the Disney experience with handwritten and decorative styles.
 */

// Font Type Definitions
export interface FontConfig {
  name: string
  description: string
  category: 'cursive' | 'serif' | 'sans-serif'
  weight: string | string[]
  variable: string
  className: string
  fontInstance: any
  useCases: string[]
  disneyThemeMatch: string
}

// 1. Just Me Again Down Here - Casual handwritten cursive
export const justMeAgainDownHere = JustMeAgainDownHere({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-just-me-again-down-here",
  display: "swap",
})

// 2. Kranky - Quirky serif with playful character
export const kranky = Kranky({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kranky",
  display: "swap",
})

// 3. Londrina Shadow - Bold shadowed sans-serif
export const londrinaShadow = Londrina_Shadow({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-londrina-shadow",
  display: "swap",
})

// 4. Rock Salt - Rough textured cursive
export const rockSalt = Rock_Salt({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rock-salt",
  display: "swap",
})

// 5. Crafty Girls - Cute handwritten cursive
export const craftyGirls = Crafty_Girls({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-crafty-girls",
  display: "swap",
})

// 6. Schoolbell - Classic school cursive
export const schoolbell = Schoolbell({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-schoolbell",
  display: "swap",
})

// 7. Sunshiney - Bright cheerful cursive
export const sunshiney = Sunshiney({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sunshiney",
  display: "swap",
})

// 8. Bungee Outline - Bold outlined sans-serif
export const bungeeOutline = Bungee_Outline({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee-outline",
  display: "swap",
})

// 9. Calligraffitti - Artistic handwritten cursive
export const calligraffitti = Calligraffitti({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-calligraffitti",
  display: "swap",
})

// 10. Coming Soon - Casual handwritten cursive
export const comingSoon = Coming_Soon({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-coming-soon",
  display: "swap",
})

// 11. Life Savers - Decorative serif with multiple weights
export const lifeSavers = Life_Savers({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-life-savers",
  display: "swap",
})

// Font Configuration Array
export const whimsicalFonts: FontConfig[] = [
  {
    name: "Just Me Again Down Here",
    description: "Casual handwritten cursive font perfect for personal touches and informal text",
    category: "cursive",
    weight: "400",
    variable: "--font-just-me-again-down-here",
    className: "font-just-me-again-down-here",
    fontInstance: justMeAgainDownHere,
    useCases: [
      "Personal messages",
      "Casual headings",
      "User testimonials",
      "Diary-style content",
      "Character quotes"
    ],
    disneyThemeMatch: "Perfect for character meet-and-greet signatures and personal trip memories"
  },
  {
    name: "Kranky",
    description: "Quirky serif font with playful irregularities, great for fun headings",
    category: "serif",
    weight: "400",
    variable: "--font-kranky",
    className: "font-kranky",
    fontInstance: kranky,
    useCases: [
      "Playful headings",
      "Attraction names",
      "Fun announcements",
      "Event titles",
      "Featured content"
    ],
    disneyThemeMatch: "Ideal for attraction titles and whimsical park announcements"
  },
  {
    name: "Londrina Shadow",
    description: "Bold shadowed sans-serif that creates depth and visual impact",
    category: "sans-serif",
    weight: "400",
    variable: "--font-londrina-shadow",
    className: "font-londrina-shadow",
    fontInstance: londrinaShadow,
    useCases: [
      "Hero titles",
      "Call-to-action buttons",
      "Important announcements",
      "Section headers",
      "Promotional content"
    ],
    disneyThemeMatch: "Perfect for park entrance signs and major attraction announcements"
  },
  {
    name: "Rock Salt",
    description: "Rough textured cursive with a hand-drawn chalk or crayon feel",
    category: "cursive",
    weight: "400",
    variable: "--font-rock-salt",
    className: "font-rock-salt",
    fontInstance: rockSalt,
    useCases: [
      "Artistic headings",
      "Creative captions",
      "Adventure themes",
      "Rustic content",
      "Outdoor experiences"
    ],
    disneyThemeMatch: "Great for adventure-themed attractions like Pirates of the Caribbean"
  },
  {
    name: "Crafty Girls",
    description: "Cute handwritten cursive with a crafty, homemade appearance",
    category: "cursive",
    weight: "400",
    variable: "--font-crafty-girls",
    className: "font-crafty-girls",
    fontInstance: craftyGirls,
    useCases: [
      "DIY sections",
      "Tips and tricks",
      "Craft activities",
      "Family content",
      "Planning notes"
    ],
    disneyThemeMatch: "Perfect for DIY Disney crafts and family planning sections"
  },
  {
    name: "Schoolbell",
    description: "Classic school cursive font that evokes childhood and learning",
    category: "cursive",
    weight: "400",
    variable: "--font-schoolbell",
    className: "font-schoolbell",
    fontInstance: schoolbell,
    useCases: [
      "Educational content",
      "Tips and guides",
      "Lesson plans",
      "Study materials",
      "Historical information"
    ],
    disneyThemeMatch: "Ideal for educational content about Disney history and park facts"
  },
  {
    name: "Sunshiney",
    description: "Bright and cheerful cursive font that radiates positivity and joy",
    category: "cursive",
    weight: "400",
    variable: "--font-sunshiney",
    className: "font-sunshiney",
    fontInstance: sunshiney,
    useCases: [
      "Happy messages",
      "Celebration content",
      "Positive quotes",
      "Welcome messages",
      "Sunny day activities"
    ],
    disneyThemeMatch: "Perfect for magical moments and celebration announcements"
  },
  {
    name: "Bungee Outline",
    description: "Bold outlined sans-serif font that creates dramatic impact and visibility",
    category: "sans-serif",
    weight: "400",
    variable: "--font-bungee-outline",
    className: "font-bungee-outline",
    fontInstance: bungeeOutline,
    useCases: [
      "Bold headlines",
      "Park signage",
      "Event banners",
      "Attention-grabbing text",
      "Promotional displays"
    ],
    disneyThemeMatch: "Perfect for bold park signage and high-impact promotional content"
  },
  {
    name: "Calligraffitti",
    description: "Artistic handwritten cursive with creative flair and personality",
    category: "cursive",
    weight: "400",
    variable: "--font-calligraffitti",
    className: "font-calligraffitti",
    fontInstance: calligraffitti,
    useCases: [
      "Artistic headings",
      "Creative signatures",
      "Designer notes",
      "Artistic captions",
      "Special messages"
    ],
    disneyThemeMatch: "Ideal for artistic Disney-inspired content and creative messaging"
  },
  {
    name: "Coming Soon",
    description: "Casual handwritten cursive that feels friendly and approachable",
    category: "cursive",
    weight: "400",
    variable: "--font-coming-soon",
    className: "font-coming-soon",
    fontInstance: comingSoon,
    useCases: [
      "Coming soon announcements",
      "Casual messaging",
      "Friendly notifications",
      "Temporary content",
      "Placeholder text"
    ],
    disneyThemeMatch: "Great for upcoming attraction announcements and friendly park updates"
  },
  {
    name: "Life Savers",
    description: "Decorative serif font with vintage charm and multiple weight options",
    category: "serif",
    weight: ["400", "700", "800"],
    variable: "--font-life-savers",
    className: "font-life-savers",
    fontInstance: lifeSavers,
    useCases: [
      "Vintage-style headings",
      "Classic announcements",
      "Retro theming",
      "Traditional signage",
      "Heritage content"
    ],
    disneyThemeMatch: "Perfect for vintage Disney theming and classic attraction styling"
  }
]

// Utility Functions
export const getFontByName = (name: string): FontConfig | undefined => {
  return whimsicalFonts.find(font => font.name === name)
}

export const getFontsByCategory = (category: 'cursive' | 'serif' | 'sans-serif'): FontConfig[] => {
  return whimsicalFonts.filter(font => font.category === category)
}

export const getAllFontVariables = (): string[] => {
  return whimsicalFonts.map(font => font.variable)
}

export const getAllFontClasses = (): string[] => {
  return whimsicalFonts.map(font => font.className)
}

export const getFontsForUseCase = (useCase: string): FontConfig[] => {
  return whimsicalFonts.filter(font => 
    font.useCases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  )
}

// Export all font instances for layout.tsx
export const fontInstances = {
  justMeAgainDownHere,
  kranky,
  londrinaShadow,
  rockSalt,
  craftyGirls,
  schoolbell,
  sunshiney,
  bungeeOutline,
  calligraffitti,
  comingSoon,
  lifeSavers
}

// Export font variables array for className concatenation
export const fontVariables = [
  justMeAgainDownHere.variable,
  kranky.variable,
  londrinaShadow.variable,
  rockSalt.variable,
  craftyGirls.variable,
  schoolbell.variable,
  sunshiney.variable,
  bungeeOutline.variable,
  calligraffitti.variable,
  comingSoon.variable,
  lifeSavers.variable
]

// CSS Custom Properties Reference
export const cssVariables = {
  justMeAgainDownHere: "--font-just-me-again-down-here",
  kranky: "--font-kranky",
  londrinaShadow: "--font-londrina-shadow",
  rockSalt: "--font-rock-salt",
  craftyGirls: "--font-crafty-girls", 
  schoolbell: "--font-schoolbell",
  sunshiney: "--font-sunshiney",
  bungeeOutline: "--font-bungee-outline",
  calligraffitti: "--font-calligraffitti",
  comingSoon: "--font-coming-soon",
  lifeSavers: "--font-life-savers"
} as const

// Tailwind CSS Classes Reference
export const tailwindClasses = {
  justMeAgainDownHere: "font-just-me-again-down-here",
  kranky: "font-kranky",
  londrinaShadow: "font-londrina-shadow",
  rockSalt: "font-rock-salt",
  craftyGirls: "font-crafty-girls",
  schoolbell: "font-schoolbell",
  sunshiney: "font-sunshiney",
  bungeeOutline: "font-bungee-outline",
  calligraffitti: "font-calligraffitti",
  comingSoon: "font-coming-soon",
  lifeSavers: "font-life-savers"
} as const

// Disney Theme Recommendations
export const disneyThemeRecommendations = {
  magicKingdom: ["sunshiney", "craftyGirls", "justMeAgainDownHere", "lifeSavers"],
  epcot: ["kranky", "schoolbell", "londrinaShadow", "bungeeOutline"],
  hollywoodStudios: ["rockSalt", "londrinaShadow", "kranky", "bungeeOutline"],
  animalKingdom: ["rockSalt", "justMeAgainDownHere", "craftyGirls", "calligraffitti"],
  disneylandPark: ["sunshiney", "schoolbell", "craftyGirls", "comingSoon"],
  californiaAdventure: ["rockSalt", "kranky", "londrinaShadow", "bungeeOutline"],
  vintageDisney: ["lifeSavers", "calligraffitti", "bungeeOutline"],
  modernDisney: ["bungeeOutline", "comingSoon", "calligraffitti"]
} as const

export default whimsicalFonts 