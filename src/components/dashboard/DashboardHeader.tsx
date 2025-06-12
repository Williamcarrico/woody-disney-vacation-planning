import { format } from "date-fns"
import { Calendar, Clock, MapPin, Sun, Cloud, CloudRain, Sparkles, Zap, Camera } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

// Magic UI Components
import { SparklesText } from "@/components/magicui/sparkles-text"
import { TypingAnimation } from "@/components/magicui/typing-animation"
import { WarpBackground } from "@/components/magicui/warp-background"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { RainbowButton } from "@/components/magicui/rainbow-button"
import { BlurFade } from "@/components/magicui/blur-fade"

interface DashboardHeaderProps {
    userId: string
    userEmail: string
    userName?: string
    currentVacation?: {
        id: string
        name: string
        startDate: string
        endDate: string
        resort?: string
    } | null
}

async function getWeatherSummary() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/weather/realtime?location=Orlando,FL`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!response.ok) return null

        const data = await response.json()

        // Extract key weather info from Tomorrow.io format
        return {
            temperature: Math.round(data.data.values.temperature),
            condition: getWeatherCondition(data.data.values.weatherCode),
            icon: getWeatherIcon(data.data.values.weatherCode)
        }
    } catch (error) {
        console.error("Error fetching weather summary:", error)
        return null
    }
}

function getWeatherCondition(weatherCode: number): string {
    // Map Tomorrow.io weather codes to conditions
    const codeMap: Record<number, string> = {
        1000: "Clear",
        1100: "Mostly Clear",
        1101: "Partly Cloudy",
        1102: "Mostly Cloudy",
        1001: "Cloudy",
        2000: "Fog",
        4000: "Drizzle",
        4001: "Rain",
        4200: "Light Rain",
        4201: "Heavy Rain",
        8000: "Thunderstorm"
    }

    return codeMap[weatherCode] || "Clear"
}

function getWeatherIcon(weatherCode: number) {
    if (weatherCode >= 4000 && weatherCode < 5000) return <CloudRain className="h-5 w-5" />
    if (weatherCode >= 1100 && weatherCode < 2000) return <Cloud className="h-5 w-5" />
    return <Sun className="h-5 w-5" />
}

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
}

export default async function DashboardHeader({
    userId,
    userEmail,
    userName = "Explorer",
    currentVacation
}: DashboardHeaderProps) {
    const weather = await getWeatherSummary()
    const currentDate = new Date()
    const greeting = getGreeting()

    // Calculate vacation countdown if applicable
    let vacationCountdown = null
    if (currentVacation) {
        const startDate = new Date(currentVacation.startDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        startDate.setHours(0, 0, 0, 0)

        const daysUntil = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil > 0) {
            vacationCountdown = `${daysUntil} days until your magical adventure!`
        } else if (daysUntil === 0) {
            vacationCountdown = "Your magical adventure starts today!"
        } else {
            const endDate = new Date(currentVacation.endDate)
            endDate.setHours(0, 0, 0, 0)
            if (today <= endDate) {
                vacationCountdown = "Enjoy your magical vacation!"
            }
        }
    }

    return (
        <BlurFade delay={0.1}>
            <WarpBackground className="relative overflow-hidden">
                <div className="relative z-10 bg-gradient-to-b from-background/80 via-background/60 to-background/80 backdrop-blur-sm">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="text-center space-y-4">
                            <SparklesText className="text-4xl md:text-5xl font-bold">
                                {greeting}, {userName}!
                            </SparklesText>

                            <TypingAnimation
                                className="text-xl text-muted-foreground"
                                text={vacationCountdown || "Welcome to your magical Disney dashboard"}
                                duration={50}
                            />

                            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{format(currentDate, 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{format(currentDate, 'h:mm a')}</span>
                                </div>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>Walt Disney World Resort</span>
                                </div>
                                {weather && (
                                    <>
                                        <Separator orientation="vertical" className="h-4" />
                                        <div className="flex items-center gap-2">
                                            {weather.icon}
                                            <span>{weather.temperature}°F - {weather.condition}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <ShimmerButton
                                    className="bg-gradient-to-r from-blue-500 to-purple-500"
                                    asChild
                                >
                                    <a href="/dashboard/planning">
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Plan Your Day
                                    </a>
                                </ShimmerButton>

                                <RainbowButton asChild>
                                    <a href="/dashboard/genie">
                                        <Zap className="h-4 w-4 mr-2" />
                                        Lightning Lane
                                    </a>
                                </RainbowButton>

                                <Button variant="outline" className="backdrop-blur-sm" asChild>
                                    <a href="/dashboard/photos">
                                        <Camera className="h-4 w-4 mr-2" />
                                        PhotoPass
                                    </a>
                                </Button>
                            </div>

                            {currentVacation && (
                                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-sm">
                                    <span className="font-medium">Current Trip:</span>
                                    <span>{currentVacation.name}</span>
                                    {currentVacation.resort && (
                                        <>
                                            <span>•</span>
                                            <span>{currentVacation.resort}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </WarpBackground>
        </BlurFade>
    )
}