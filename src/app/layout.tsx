import type { Metadata, Viewport } from "next"
import { Inter, Luckiest_Guy, Fredoka, Comfortaa, Pacifico, Bangers, Chewy } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { ScrollProgress } from "@/components/magicui/scroll-progress"
import { PerformanceMonitor } from "@/components/shared/PerformanceMonitor"

// Dynamic imports for performance
const Header = dynamic(() => import("@/components/shared/Header"), {
    ssr: true,
    loading: () => <HeaderSkeleton />
})
const Footer = dynamic(() => import("@/components/shared/Footer"), {
    ssr: true,
    loading: () => <FooterSkeleton />
})

// Font configurations
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
})

// Core font configurations - optimized for performance
const luckiestGuy = Luckiest_Guy({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-luckiest",
    display: "swap",
})

const fredoka = Fredoka({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
    variable: "--font-fredoka",
    display: "swap",
})

const bangers = Bangers({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-bangers",
    display: "swap",
})

const chewy = Chewy({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-chewy",
    display: "swap",
})

const comfortaa = Comfortaa({
    weight: ["400", "500", "600"],
    subsets: ["latin"],
    variable: "--font-comfortaa",
    display: "swap",
})

const pacifico = Pacifico({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-pacifico",
    display: "swap",
})

// Metadata configuration
export const metadata: Metadata = {
    title: {
        default: "Woody's Disney Vacation Planner | Magical Trip Planning",
        template: "%s | Woody's Disney Vacation Planner",
    },
    description: "Plan your perfect Disney vacation with AI-powered recommendations, real-time wait times, personalized itineraries, and magical experiences tailored just for you.",
    keywords: [
        "Disney vacation planner",
        "Disney World trip planning",
        "Disney itinerary",
        "Disney wait times",
        "Disney dining reservations",
        "Magic Kingdom planner",
        "EPCOT planner",
        "Hollywood Studios planner",
        "Animal Kingdom planner",
        "AI Disney planning",
        "Disney budget tracker",
        "Disney group planning",
    ],
    authors: [{ name: "Woody's Disney Vacation Planner Team" }],
    creator: "Woody's Disney Vacation Planner",
    publisher: "Woody's Disney Vacation Planner",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://woodysdisneyplanner.com"),
    openGraph: {
        title: "Woody's Disney Vacation Planner | Magical Trip Planning",
        description: "Plan your perfect Disney vacation with AI-powered recommendations and real-time insights",
        url: "/",
        siteName: "Woody's Disney Vacation Planner",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Woody's Disney Vacation Planner - Your AI-Powered Disney Planning Companion",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Woody's Disney Vacation Planner",
        description: "Plan your perfect Disney vacation with AI-powered recommendations",
        images: ["/twitter-image.png"],
        creator: "@woodysplanner",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    manifest: "/manifest.json",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
            { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
        apple: [
            { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
        ],
        other: [
            {
                rel: "mask-icon",
                url: "/favicon.svg",
            },
        ],
    },
}

// Viewport configuration
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
}

// Loading skeleton components
function HeaderSkeleton() {
    return (
        <div className="h-16 bg-background/80 backdrop-blur-sm border-b border-border/50 animate-pulse" />
    )
}

function FooterSkeleton() {
    return (
        <div className="h-64 bg-background/80 backdrop-blur-sm border-t border-border/50 animate-pulse" />
    )
}

// Loading component
function LoadingFallback() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative">
                <div className="h-24 w-24 animate-spin rounded-full border-4 border-t-primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-primary to-secondary opacity-20" />
                </div>
            </div>
        </div>
    )
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn(
                inter.variable,
                luckiestGuy.variable,
                fredoka.variable,
                bangers.variable,
                chewy.variable,
                comfortaa.variable,
                pacifico.variable,
                "scroll-smooth"
            )}
        >
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
                <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
            </head>
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    "selection:bg-primary/20 selection:text-primary",
                    "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20",
                    "hover:scrollbar-thumb-primary/40"
                )}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange={false}
                    storageKey="woody-disney-theme"
                >
                    <AuthProvider>
                        {/* Scroll Progress Indicator */}
                        <ScrollProgress className="fixed top-0 z-[100] h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

                        {/* Background Effects */}
                        <div className="fixed inset-0 -z-10 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
                            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 dark:opacity-10" />
                            <div className="animate-gradient absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-3xl" />
                            <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-primary/10 blur-3xl" />
                            <div className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full bg-secondary/10 blur-3xl delay-1000" />
                        </div>

                        {/* Main Layout */}
                        <div className="relative flex min-h-screen flex-col">
                            {/* Header */}
                            <Suspense fallback={<HeaderSkeleton />}>
                                <Header />
                            </Suspense>

                            {/* Main Content */}
                            <main className="flex-1 relative z-10">
                                <Suspense fallback={<LoadingFallback />}>
                                    {children}
                                </Suspense>
                            </main>

                            {/* Footer */}
                            <Suspense fallback={<FooterSkeleton />}>
                                <Footer />
                            </Suspense>
                        </div>

                        {/* Global Components */}
                        <Toaster
                            position="bottom-right"
                            toastOptions={{
                                className: "bg-background border-border shadow-lg",
                                duration: 4000,
                            }}
                        />

                        {/* Performance Monitoring */}
                        <PerformanceMonitor />

                        {/* Accessibility Skip Links */}
                        <a
                            href="#main-content"
                            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            Skip to main content
                        </a>
                    </AuthProvider>
                </ThemeProvider>


            </body>
        </html>
    )
}