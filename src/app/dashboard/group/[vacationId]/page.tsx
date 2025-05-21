import { Suspense } from "react"
import { Metadata } from "next"
import VacationParty from "@/components/group/VacationParty"
import PartyMessaging from "@/components/group/PartyMessaging"
import LocationSharing from "@/components/group/LocationSharing"
import CollaborativeItinerary from "@/components/group/CollaborativeItinerary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    Users,
    MessageSquare,
    MapPin,
    Calendar,
    Share2,
    Plus,
    ArrowRight,
    CalendarDays,
    Map
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
    title: "Vacation Party | Disney Vacation Planning",
    description: "Plan your Disney vacation with friends and family",
}

export default function VacationGroupPage({ params }: { readonly params: { vacationId: string } }) {
    const { vacationId } = params

    return (
        <div className="container py-6">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/group">Vacation Parties</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Magic Kingdom Adventure 2023</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Magic Kingdom Adventure 2023</h1>
                        <p className="text-muted-foreground">
                            Collaborate with your friends and family on your Disney vacation
                        </p>

                        <div className="flex gap-2 mt-2">
                            <div className="flex -space-x-2">
                                <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src="/app/user1.jpg" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src="/app/user2.jpg" />
                                    <AvatarFallback>JS</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src="/app/user3.jpg" />
                                    <AvatarFallback>AJ</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarFallback>+2</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="text-muted-foreground text-sm flex items-center">
                                6 members in this vacation party
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-start gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Invite
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                <Card className="md:col-span-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            Trip Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1">
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-muted-foreground">Dates</div>
                                <div className="font-medium">Dec 15 - Dec 22, 2023</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Destination</div>
                                <div className="font-medium">Walt Disney World Resort</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Resort</div>
                                <div className="font-medium">Disney&apos;s Contemporary Resort</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-3 pb-2 border-t">
                        <Link href={`/resorts/${vacationId}`} className="text-xs text-primary flex items-center">
                            View Resort Details
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Trip Countdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl font-bold">14</div>
                            <p className="text-muted-foreground">Days until your trip</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-3 pb-2 border-t">
                        <Link href={`/planning/${vacationId}`} className="text-xs text-primary flex items-center">
                            View Trip Planner
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-4">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <Map className="h-4 w-4" />
                            Active Now
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="/app/user1.jpg" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">John Doe</span>
                                </div>
                                <Badge variant="outline" className="text-xs h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">Online</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="/app/user2.jpg" />
                                        <AvatarFallback>JS</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">Jane Smith</span>
                                </div>
                                <Badge variant="outline" className="text-xs h-5 px-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20">Online</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src="/app/user3.jpg" />
                                        <AvatarFallback>AJ</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">Alex Johnson</span>
                                </div>
                                <Badge variant="outline" className="text-xs h-5 px-1.5 bg-muted text-muted-foreground">Offline</Badge>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-3 pb-2 border-t">
                        <Link href="#messaging" className="text-xs text-primary flex items-center">
                            Send Message
                            <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </CardFooter>
                </Card>
            </div>

            <Tabs defaultValue="party" className="space-y-6">
                <div className="border-b">
                    <TabsList className="w-full justify-start rounded-none border-b-0 px-0">
                        <TabsTrigger
                            value="party"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0"
                            data-state="active"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            <span>Party</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" data-state="active" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="messaging"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0"
                            id="messaging"
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <span>Messaging</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" data-state="inactive" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="location"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0"
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>Location</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" data-state="inactive" />
                        </TabsTrigger>

                        <TabsTrigger
                            value="planning"
                            className="py-3 px-4 relative data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-0"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Planning</span>
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary data-[state=inactive]:opacity-0 transition-opacity" data-state="inactive" />
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="party" className="space-y-6 mt-0">
                    <Suspense fallback={<VacationPartyFallback />}>
                        <VacationParty vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="messaging" className="space-y-6 mt-0">
                    <Suspense fallback={<MessagingFallback />}>
                        <PartyMessaging vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="location" className="space-y-6 mt-0">
                    <Suspense fallback={<LocationSharingFallback />}>
                        <LocationSharing vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="planning" className="space-y-6 mt-0">
                    <Suspense fallback={<CollaborativePlanningFallback />}>
                        <CollaborativeItinerary vacationId={vacationId} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Fallback components
function VacationPartyFallback() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                        <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}

function MessagingFallback() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}

function LocationSharingFallback() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}

function CollaborativePlanningFallback() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="h-6 w-40 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-64 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] bg-muted rounded animate-pulse"></div>
            </CardContent>
        </Card>
    )
}