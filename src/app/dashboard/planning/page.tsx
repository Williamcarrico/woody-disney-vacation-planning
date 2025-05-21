import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbSeparator,
    BreadcrumbLink,
    BreadcrumbPage
} from "@/components/ui/breadcrumb"
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent
} from "@/components/ui/tooltip"
import { Metadata } from "next"

// Components
import ItineraryPlanner from "@/components/itinerary/ItineraryPlanner"
import { ItineraryList } from "@/components/itinerary/ItineraryList"
import VacationCalendar from "@/components/calendar/VacationCalendar"
import VacationParty from "@/components/group/VacationParty"
import TripBudgetTracker from "@/components/budget/TripBudgetTracker"
import { WeatherForecastWidget } from "@/components/weather"
import '@/components/weather/animations.css'
import WaitTimesDashboard from "@/components/attractions/WaitTimesDashboard"
import ParkHoursDisplay from "@/components/parks/ParkHoursDisplay"
import { RecommendationEngine } from "@/components/optimizer/recommendation-engine/recommendation-engine"
import TripOverview from "@/components/dashboard/TripOverview"
import MobileCompanion from "@/components/dashboard/MobileCompanion"
import DisneyGeniePlanner from "@/components/planning/DisneyGeniePlanner"
import { Suspense } from "react"

// Icons
import {
    Calendar as CalendarIcon,
    Users,
    DollarSign,
    ListChecks,
    Wand2,
    RefreshCw,
    CloudSun,
    Clock,
    Map,
    Sparkles,
    Smartphone,
    BarChart3,
    LayoutDashboard,
    Zap,
    Info,
    ClipboardList,
    ChevronRight
} from "lucide-react"

export const metadata: Metadata = {
    title: "Disney Vacation Planning | Interactive Dashboard",
    description: "Complete planning dashboard with AI optimization, real-time wait times, and personalized recommendations for your perfect Disney vacation."
}

export default function PlanningDashboardPage({ params }: { readonly params?: { readonly vacationId?: string } }) {
    const vacationId = params?.vacationId || "vacation123"

    // Default date range for budget tracking
    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7) // Default 7-day window

    return (
        <div className="container py-6 space-y-6">
            <Breadcrumb className="mb-4">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Vacation Planning</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Disney Vacation Planner</h1>
                    <p className="text-muted-foreground mt-1">
                        Create your perfect Disney experience with our advanced planning tools
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Smartphone className="h-4 w-4 mr-2" />
                                    Get Mobile App
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p>Take your itinerary with you in the parks</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button variant="default" size="sm" className="h-9">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Trip Overview Card */}
            <Suspense fallback={<TripOverviewSkeleton />}>
                <TripOverview vacationId={vacationId} />
            </Suspense>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="dashboard" className="space-y-6">
                <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10 pb-0">
                    <TabsList className="w-full justify-start rounded-none border-b-0 px-0 h-auto overflow-x-auto flex-nowrap">
                        <TabsTrigger
                            value="dashboard"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Overview
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="wizard"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <Wand2 className="h-4 w-4 mr-2" />
                            Planner Wizard
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="calendar"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Calendar
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="itineraries"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <ListChecks className="h-4 w-4 mr-2" />
                            Itineraries
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="party"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Party
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="budget"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Budget
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="wait-times"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            Wait Times
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="genie-plus"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Genie+
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="weather"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <CloudSun className="h-4 w-4 mr-2" />
                            Weather
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="optimize"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0 flex items-center"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Optimize
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" />
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Dashboard Overview Tab */}
                <TabsContent value="dashboard" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <Map className="h-4 w-4 mr-2 text-primary" />
                                    Park Hours
                                </CardTitle>
                                <CardDescription>Today&apos;s operating hours</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                    <ParkHoursDisplay compact />
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                    View Complete Schedule
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-primary" />
                                    Wait Times
                                </CardTitle>
                                <CardDescription>Popular attractions right now</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                    <WaitTimesDashboard compact />
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                    View All Wait Times
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <CloudSun className="h-4 w-4 mr-2 text-primary" />
                                    Weather Forecast
                                </CardTitle>
                                <CardDescription>5-day outlook</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                    <WeatherForecastWidget
                                        location="Orlando, FL"
                                        units="imperial"
                                        showForecast={true}
                                        daysToShow={3}
                                    />
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => window.location.href = '/weather-example'}>
                                    View Extended Forecast
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                                    Your Trip at a Glance
                                </CardTitle>
                                <CardDescription>Upcoming activities and reservations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                                    <ScrollArea className="h-[350px]">
                                        <VacationCalendar vacationId={vacationId} view="schedule" />
                                    </ScrollArea>
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                    View Full Calendar
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                                    AI Recommendations
                                </CardTitle>
                                <CardDescription>Personalized for your trip</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                                    <RecommendationEngine
                                        userPreferences={{ userId: vacationId }}
                                        allItems={[]}
                                        maxRecommendations={4}
                                    />
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full justify-between">
                                    View All Recommendations
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <Smartphone className="h-4 w-4 mr-2 text-primary" />
                                    Mobile Companion
                                </CardTitle>
                                <CardDescription>Take your plan with you</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                                    <MobileCompanion vacationId={vacationId} />
                                </Suspense>
                            </CardContent>
                            <CardFooter>
                                <Button variant="default" size="sm" className="w-full">
                                    Get Mobile App
                                </Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-medium flex items-center">
                                    <ClipboardList className="h-4 w-4 mr-2 text-primary" />
                                    Next Steps
                                </CardTitle>
                                <CardDescription>Complete your planning</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between py-1 border-b">
                                        <div className="flex items-center">
                                            <span className="text-sm">Complete your party details</span>
                                        </div>
                                        <Badge variant="outline">Essential</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b">
                                        <div className="flex items-center">
                                            <span className="text-sm">Add dining reservations</span>
                                        </div>
                                        <Badge variant="outline">Recommended</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b">
                                        <div className="flex items-center">
                                            <span className="text-sm">Set budget parameters</span>
                                        </div>
                                        <Badge variant="outline">Optional</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-1 border-b">
                                        <div className="flex items-center">
                                            <span className="text-sm">Review AI optimized itinerary</span>
                                        </div>
                                        <Badge variant="outline">Recommended</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <div className="flex items-center">
                                            <span className="text-sm">Download mobile companion</span>
                                        </div>
                                        <Badge variant="outline">Optional</Badge>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" size="sm" className="w-full">
                                    View Planning Checklist
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <Alert className="bg-primary/5 border-primary/20">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle>Pro Tip</AlertTitle>
                        <AlertDescription>
                            Use our AI Optimization tool to automatically generate the perfect itinerary based on predicted crowd levels, wait times, and your preferences.
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                {/* Planning Wizard Tab */}
                <TabsContent value="wizard" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <ItineraryPlanner />
                    </Suspense>
                </TabsContent>

                {/* Calendar Tab */}
                <TabsContent value="calendar" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <VacationCalendar vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                {/* Itineraries Tab */}
                <TabsContent value="itineraries" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <ItineraryList vacationId={vacationId} onCreateNew={() => { }} />
                    </Suspense>
                </TabsContent>

                {/* Party Tab */}
                <TabsContent value="party" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <VacationParty vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <TripBudgetTracker
                            vacationId={vacationId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    </Suspense>
                </TabsContent>

                {/* Wait Times Tab */}
                <TabsContent value="wait-times" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <WaitTimesDashboard vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                {/* Genie+ Tab */}
                <TabsContent value="genie-plus" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <DisneyGeniePlanner vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                {/* Weather Tab */}
                <TabsContent value="weather" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Orlando Weather</h2>
                                <WeatherForecastWidget
                                    location="Orlando, FL"
                                    units="imperial"
                                    daysToShow={5}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Anaheim Weather</h2>
                                <WeatherForecastWidget
                                    location="Anaheim, CA"
                                    units="imperial"
                                    daysToShow={5}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weather Planning Tips</CardTitle>
                                    <CardDescription>Make the most of your Disney vacation regardless of weather</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Rainy Day Tips</h3>
                                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                                <li>Pack ponchos instead of umbrellas</li>
                                                <li>Wear waterproof shoes</li>
                                                <li>Plan indoor attractions</li>
                                                <li>Lines are typically shorter on rainy days</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Hot Weather Tips</h3>
                                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                                <li>Stay hydrated with water bottles</li>
                                                <li>Take afternoon breaks during peak heat</li>
                                                <li>Use cooling towels and hats</li>
                                                <li>Schedule water rides for hot afternoons</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">Weather Resources</h3>
                                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                                <li>Check real-time radar in our app</li>
                                                <li>Set weather alerts for your trip</li>
                                                <li>Download our mobile app for updates</li>
                                                <li>Check ride closures during storms</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Suspense>
                </TabsContent>

                {/* Optimize Tab */}
                <TabsContent value="optimize" className="space-y-6 mt-0">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}>
                        <RecommendationEngine
                            userPreferences={{ userId: vacationId }}
                            allItems={[]}
                        />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Skeleton component for the Trip Overview
function TripOverviewSkeleton() {
    return (
        <div className="w-full p-4 border rounded-lg bg-card">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
}