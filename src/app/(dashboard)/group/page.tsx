import { Suspense } from "react"
import { Metadata } from "next"
import VacationParty from "@/components/group/VacationParty"
import PartyMessaging from "@/components/group/PartyMessaging"
import LocationSharing from "@/components/group/LocationSharing"
import CollaborativeItinerary from "@/components/group/CollaborativeItinerary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
    Users,
    MessageSquare,
    MapPin,
    Calendar,
    Share2,
    RefreshCw,
    Settings,
    Plus
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
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

export const metadata: Metadata = {
    title: "Vacation Party | Disney Vacation Planning",
    description: "Plan your Disney vacation with friends and family",
}

export default function GroupPage({ params }: { params: { vacationId?: string } }) {
    // In a real app, we would get the vacation ID from the URL
    // For now, we'll use a hardcoded vacation ID
    const vacationId = params.vacationId || "vacation123"

    return (
        <div className="container py-6">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Vacation Party</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vacation Party</h1>
                    <p className="text-muted-foreground">
                        Collaborate with your friends and family on your Disney vacation
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Party Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1">
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">Active members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Messages
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1">
                        <div className="text-2xl font-bold">28</div>
                        <p className="text-xs text-muted-foreground">New today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Trip Countdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-1">
                        <div className="text-2xl font-bold">14</div>
                        <p className="text-xs text-muted-foreground">Days until your trip</p>
                    </CardContent>
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
                    <Suspense fallback={<div>Loading vacation party...</div>}>
                        <VacationParty vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="messaging" className="space-y-6 mt-0">
                    <Suspense fallback={<div>Loading party messaging...</div>}>
                        <PartyMessaging vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="location" className="space-y-6 mt-0">
                    <Suspense fallback={<div>Loading location sharing...</div>}>
                        <LocationSharing vacationId={vacationId} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="planning" className="space-y-6 mt-0">
                    <Suspense fallback={<div>Loading collaborative planning...</div>}>
                        <CollaborativeItinerary vacationId={vacationId} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}