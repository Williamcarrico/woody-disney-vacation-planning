// src/components/wallet/DigitalWallet.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isTomorrow, isAfter, addDays, isSameDay } from 'date-fns';
import {
    Ticket,
    Utensils,
    Hotel,
    Sparkles,
    Zap,
    QrCode,
    Clock,
    Check,
    Plus,
    Share2,
    LucideIcon
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet as Drawer,
    SheetContent as DrawerContent,
    SheetDescription as DrawerDescription,
    SheetFooter as DrawerFooter,
    SheetHeader as DrawerHeader,
    SheetTitle as DrawerTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';

// Define our pass types
type PassType = 'ticket' | 'dining' | 'lightning' | 'hotel' | 'event';

// Base pass interface
interface BasePass {
    id: string;
    type: PassType;
    name: string;
    date: Date;
    barcode?: string;
    isExpired?: boolean;
    isUsed?: boolean;
}

// Park ticket pass
interface ParkTicketPass extends BasePass {
    type: 'ticket';
    parkId: string;
    parkName: string;
    guestName: string;
    admissionType: 'standard' | 'hopper' | 'annual';
    startDate: Date;
    endDate: Date;
}

// Dining reservation pass
interface DiningPass extends BasePass {
    type: 'dining';
    restaurantName: string;
    location: string;
    time: string;
    partySize: number;
    confirmationNumber: string;
    hasArrived?: boolean;
}

// Lightning Lane pass
interface LightningLanePass extends BasePass {
    type: 'lightning';
    attractionName: string;
    parkId: string;
    parkName: string;
    returnTime: {
        start: string;
        end: string;
    };
    isGeniePlus: boolean;
    partySize: number;
    isPaid: boolean;
    price?: number;
}

// Hotel reservation pass
interface HotelPass extends BasePass {
    type: 'hotel';
    hotelName: string;
    roomType: string;
    checkIn: Date;
    checkOut: Date;
    guestNames: string[];
    confirmationNumber: string;
}

// Special event pass
interface EventPass extends BasePass {
    type: 'event';
    eventName: string;
    location: string;
    startTime: string;
    endTime: string;
    description?: string;
}

// Union type for all passes
type Pass = ParkTicketPass | DiningPass | LightningLanePass | HotelPass | EventPass;

// Props for the digital wallet
interface DigitalWalletProps {
    readonly vacationId?: string;
    readonly showUpcoming?: boolean;
}

export default function DigitalWallet({
    vacationId,
    showUpcoming = true,
}: DigitalWalletProps) {
    const [activeTab, setActiveTab] = useState<string>('all');
    const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
    const [sortBy] = useState<'date' | 'name'>('date');
    const [showExpired, setShowExpired] = useState(false);

    // Mock API query - in a real app, this would fetch from Firebase
    const { data: passes, isLoading } = useQuery<Pass[]>({
        queryKey: ['passes', vacationId],
        queryFn: () => getMockPasses(),
    });

    // Function to handle clicking on a pass
    const handlePassClick = (pass: Pass) => {
        setSelectedPass(pass);

        if (pass.barcode) {
            setShowBarcodeDialog(true);
        } else {
            setShowDetailsDrawer(true);
        }
    };

    // Filter and sort passes based on active tab and sort option
    const filteredPasses = useMemo(() => {
        if (!passes) return [];

        // First apply type filter
        let filtered = passes.filter(pass => {
            if (activeTab === 'all') return true;
            return pass.type === activeTab;
        });

        // Then apply expired filter
        if (!showExpired) {
            filtered = filtered.filter(pass => !pass.isExpired && !pass.isUsed);
        }

        // Optionally filter out past passes if the consumer does not want to show upcoming items only
        if (!showUpcoming) {
            const today = new Date()
            filtered = filtered.filter(pass => isAfter(pass.date, today) || isToday(pass.date))
        }

        // Then sort
        return [...filtered].sort((a, b) => {
            if (sortBy === 'date') {
                return a.date.getTime() - b.date.getTime();
            } else {
                return a.name.localeCompare(b.name);
            }
        });
    }, [passes, activeTab, sortBy, showExpired, showUpcoming]);

    // Group passes by day
    const passesByDay = useMemo(() => {
        const grouped: Record<string, Pass[]> = {};

        filteredPasses.forEach(pass => {
            const dateKey = format(pass.date, 'yyyy-MM-dd');
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(pass);
        });

        return grouped;
    }, [filteredPasses]);

    // Get pass icon
    const getPassIcon = (type: PassType): LucideIcon => {
        switch (type) {
            case 'ticket':
                return Ticket;
            case 'dining':
                return Utensils;
            case 'lightning':
                return Zap;
            case 'hotel':
                return Hotel;
            case 'event':
                return Sparkles;
            default:
                return Ticket;
        }
    };

    // Get color based on pass type
    const getPassColor = (pass: Pass) => {
        if (pass.isExpired || pass.isUsed) {
            return "bg-gray-100 border-gray-300 opacity-75 grayscale";
        }

        switch (pass.type) {
            case 'ticket':
                return "bg-green-50 border-green-200";
            case 'dining':
                return "bg-amber-50 border-amber-200";
            case 'lightning':
                return "bg-purple-50 border-purple-200";
            case 'hotel':
                return "bg-blue-50 border-blue-200";
            case 'event':
                return "bg-pink-50 border-pink-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    // Get text color based on pass type
    const getPassTextColor = (pass: Pass) => {
        if (pass.isExpired || pass.isUsed) {
            return "text-gray-500";
        }

        switch (pass.type) {
            case 'ticket':
                return "text-green-700";
            case 'dining':
                return "text-amber-700";
            case 'lightning':
                return "text-purple-700";
            case 'hotel':
                return "text-blue-700";
            case 'event':
                return "text-pink-700";
            default:
                return "text-gray-700";
        }
    };

    // Get a friendly date string
    const getDateString = (date: Date) => {
        if (isToday(date)) {
            return 'Today';
        } else if (isTomorrow(date)) {
            return 'Tomorrow';
        } else {
            return format(date, 'EEEE, MMMM d');
        }
    };

    // Get pass status badge
    const getPassStatusBadge = (pass: Pass) => {
        if (pass.isExpired) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300">
                    Expired
                </Badge>
            );
        }

        if (pass.isUsed) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300">
                    Used
                </Badge>
            );
        }

        if (pass.type === 'lightning') {
            const now = new Date();
            const startTime = new Date();
            const [startHour, startMinute] = pass.returnTime.start.split(':').map(Number);
            startTime.setHours(startHour, startMinute);

            const endTime = new Date();
            const [endHour, endMinute] = pass.returnTime.end.split(':').map(Number);
            endTime.setHours(endHour, endMinute);

            if (now >= startTime && now <= endTime) {
                return (
                    <Badge className="bg-green-500">
                        Active Now
                    </Badge>
                );
            } else if (now < startTime) {
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Upcoming
                    </Badge>
                );
            } else {
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300">
                        Expired
                    </Badge>
                );
            }
        }

        return null;
    };

    // Render QR code - in a real app, this would generate an actual QR code
    const renderQRCode = (text: string) => {
        return (
            <div
                className="relative mx-auto bg-white p-4 rounded-lg w-[250px] h-[250px]"
                data-barcode={text}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="h-full w-full p-4 text-black" />
                </div>
            </div>
        );
    };

    // Mock data generation
    function getMockPasses(): Pass[] {
        const today = new Date();
        const tomorrow = addDays(today, 1);
        const dayAfter = addDays(today, 2);
        const nextWeek = addDays(today, 7);
        const lastWeek = addDays(today, -7);

        return [
            // Park tickets
            {
                id: 'ticket-1',
                type: 'ticket',
                name: 'Magic Kingdom Park Ticket',
                date: today,
                parkId: 'magickingdom',
                parkName: 'Magic Kingdom',
                guestName: 'John Doe',
                admissionType: 'standard',
                startDate: today,
                endDate: addDays(today, 5),
                barcode: '12345678901234',
            },
            {
                id: 'ticket-2',
                type: 'ticket',
                name: 'EPCOT Park Ticket',
                date: tomorrow,
                parkId: 'epcot',
                parkName: 'EPCOT',
                guestName: 'John Doe',
                admissionType: 'standard',
                startDate: today,
                endDate: addDays(today, 5),
                barcode: '23456789012345',
            },
            {
                id: 'ticket-3',
                type: 'ticket',
                name: 'Hollywood Studios Park Ticket',
                date: dayAfter,
                parkId: 'hollywoodstudios',
                parkName: 'Hollywood Studios',
                guestName: 'John Doe',
                admissionType: 'standard',
                startDate: today,
                endDate: addDays(today, 5),
                barcode: '34567890123456',
            },
            {
                id: 'ticket-4',
                type: 'ticket',
                name: 'Animal Kingdom Park Ticket',
                date: addDays(today, 3),
                parkId: 'animalkingdom',
                parkName: 'Animal Kingdom',
                guestName: 'John Doe',
                admissionType: 'standard',
                startDate: today,
                endDate: addDays(today, 5),
                barcode: '45678901234567',
            },
            {
                id: 'ticket-5',
                type: 'ticket',
                name: 'Expired Park Ticket',
                date: lastWeek,
                parkId: 'magickingdom',
                parkName: 'Magic Kingdom',
                guestName: 'John Doe',
                admissionType: 'standard',
                startDate: addDays(lastWeek, -1),
                endDate: lastWeek,
                barcode: '56789012345678',
                isExpired: true,
            },

            // Dining reservations
            {
                id: 'dining-1',
                type: 'dining',
                name: 'Be Our Guest Dinner',
                date: today,
                restaurantName: 'Be Our Guest',
                location: 'Magic Kingdom',
                time: '18:30',
                partySize: 4,
                confirmationNumber: 'DINING1234',
                barcode: '67890123456789',
            },
            {
                id: 'dining-2',
                type: 'dining',
                name: 'Cinderella\'s Royal Table Breakfast',
                date: tomorrow,
                restaurantName: 'Cinderella\'s Royal Table',
                location: 'Magic Kingdom',
                time: '09:00',
                partySize: 4,
                confirmationNumber: 'DINING2345',
                barcode: '78901234567890',
            },
            {
                id: 'dining-3',
                type: 'dining',
                name: 'Space 220 Lunch',
                date: dayAfter,
                restaurantName: 'Space 220',
                location: 'EPCOT',
                time: '12:15',
                partySize: 2,
                confirmationNumber: 'DINING3456',
                barcode: '89012345678901',
            },
            {
                id: 'dining-4',
                type: 'dining',
                name: 'Past Dining Reservation',
                date: lastWeek,
                restaurantName: 'Chef Mickey\'s',
                location: 'Contemporary Resort',
                time: '18:00',
                partySize: 4,
                confirmationNumber: 'DINING4567',
                barcode: '90123456789012',
                isUsed: true,
            },

            // Lightning Lane passes
            {
                id: 'lightning-1',
                type: 'lightning',
                name: 'Seven Dwarfs Mine Train Lightning Lane',
                date: today,
                attractionName: 'Seven Dwarfs Mine Train',
                parkId: 'magickingdom',
                parkName: 'Magic Kingdom',
                returnTime: {
                    start: '14:30',
                    end: '15:30',
                },
                isGeniePlus: false,
                partySize: 4,
                isPaid: true,
                price: 12,
                barcode: '01234567890123',
            },
            {
                id: 'lightning-2',
                type: 'lightning',
                name: 'Space Mountain Lightning Lane',
                date: today,
                attractionName: 'Space Mountain',
                parkId: 'magickingdom',
                parkName: 'Magic Kingdom',
                returnTime: {
                    start: '16:45',
                    end: '17:45',
                },
                isGeniePlus: true,
                partySize: 4,
                isPaid: false,
                barcode: '12345678901235',
            },
            {
                id: 'lightning-3',
                type: 'lightning',
                name: 'Guardians of the Galaxy Lightning Lane',
                date: tomorrow,
                attractionName: 'Guardians of the Galaxy: Cosmic Rewind',
                parkId: 'epcot',
                parkName: 'EPCOT',
                returnTime: {
                    start: '13:15',
                    end: '14:15',
                },
                isGeniePlus: false,
                partySize: 4,
                isPaid: true,
                price: 15,
                barcode: '23456789012346',
            },
            {
                id: 'lightning-4',
                type: 'lightning',
                name: 'Expired Lightning Lane',
                date: today,
                attractionName: 'Haunted Mansion',
                parkId: 'magickingdom',
                parkName: 'Magic Kingdom',
                returnTime: {
                    start: '10:00',
                    end: '11:00',
                },
                isGeniePlus: true,
                partySize: 4,
                isPaid: false,
                barcode: '34567890123457',
                isExpired: true,
            },

            // Hotel reservations
            {
                id: 'hotel-1',
                type: 'hotel',
                name: 'Contemporary Resort Reservation',
                date: today,
                hotelName: 'Disney\'s Contemporary Resort',
                roomType: 'Garden Wing - Standard Room',
                checkIn: today,
                checkOut: addDays(today, 5),
                guestNames: ['John Doe', 'Jane Doe'],
                confirmationNumber: 'HOTEL1234',
                barcode: '45678901234568',
            },

            // Special events
            {
                id: 'event-1',
                type: 'event',
                name: 'Mickey\'s Not-So-Scary Halloween Party',
                date: nextWeek,
                eventName: 'Mickey\'s Not-So-Scary Halloween Party',
                location: 'Magic Kingdom',
                startTime: '19:00',
                endTime: '24:00',
                description: 'Special ticketed event with unique entertainment, treats, and attractions',
                barcode: '56789012345679',
            },
        ];
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Digital Wallet</CardTitle>
                            <CardDescription>
                                Your tickets, reservations, and Lightning Lane passes
                            </CardDescription>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center mr-2">
                                <Switch
                                    id="show-expired"
                                    checked={showExpired}
                                    onCheckedChange={setShowExpired}
                                    className="mr-2"
                                />
                                <Label htmlFor="show-expired" className="text-sm">
                                    Show Expired
                                </Label>
                            </div>

                            <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Pass
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-1">
                    <Tabs defaultValue="all" onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-5">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="ticket">Tickets</TabsTrigger>
                            <TabsTrigger value="dining">Dining</TabsTrigger>
                            <TabsTrigger value="lightning">Lightning</TabsTrigger>
                            <TabsTrigger value="hotel">Hotel</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-4">
                            {Object.keys(passesByDay).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No passes found.
                                </div>
                            ) : (
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-6">
                                        {Object.entries(passesByDay)
                                            .sort(([dateA], [dateB]) => {
                                                return new Date(dateA).getTime() - new Date(dateB).getTime();
                                            })
                                            .map(([dateStr, dayPasses]) => (
                                                <div key={dateStr}>
                                                    <h3 className="text-sm font-medium mb-3">
                                                        {getDateString(new Date(dateStr))}
                                                    </h3>

                                                    <div className="space-y-3">
                                                        {dayPasses.map(pass => {
                                                            const Icon = getPassIcon(pass.type);

                                                            return (
                                                                <button
                                                                    key={pass.id}
                                                                    className={cn(
                                                                        "p-3 rounded-lg border w-full text-left",
                                                                        getPassColor(pass),
                                                                        "hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    )}
                                                                    onClick={() => handlePassClick(pass)}
                                                                    aria-label={`View details for ${pass.name}`}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className={cn(
                                                                            "w-10 h-10 rounded-full flex items-center justify-center mr-3",
                                                                            getPassTextColor(pass)
                                                                        )}>
                                                                            <Icon className="h-5 w-5" />
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <div className={cn(
                                                                                "font-medium line-clamp-1",
                                                                                getPassTextColor(pass)
                                                                            )}>
                                                                                {pass.name}
                                                                            </div>

                                                                            <div className="flex items-center text-xs mt-1">
                                                                                <Clock className={cn(
                                                                                    "h-3.5 w-3.5 mr-1",
                                                                                    getPassTextColor(pass)
                                                                                )} />
                                                                                {(() => {
                                                                                    if (pass.type === 'lightning') {
                                                                                        return (
                                                                                            <span>
                                                                                                {pass.returnTime.start} - {pass.returnTime.end}
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    if (pass.type === 'dining') {
                                                                                        return <span>{pass.time}</span>;
                                                                                    }
                                                                                    if (pass.type === 'event') {
                                                                                        return (
                                                                                            <span>
                                                                                                {pass.startTime} - {pass.endTime}
                                                                                            </span>
                                                                                        );
                                                                                    }
                                                                                    return <span>Valid {format(pass.date, 'MMM d')}</span>;
                                                                                })()}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            {getPassStatusBadge(pass)}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="pt-0">
                    <div className="w-full text-center text-xs text-muted-foreground">
                        Tap any pass to view details or present for scanning
                    </div>
                </CardFooter>
            </Card>

            {/* QR Code Dialog */}
            <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedPass?.name}</DialogTitle>
                        <DialogDescription>
                            {selectedPass?.type === 'ticket' && 'Present this code for park entry'}
                            {selectedPass?.type === 'dining' && 'Present this code to check in for your reservation'}
                            {selectedPass?.type === 'lightning' && 'Present this code to access the Lightning Lane'}
                            {selectedPass?.type === 'hotel' && 'Present this code at hotel check-in'}
                            {selectedPass?.type === 'event' && 'Present this code for event entry'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedPass?.barcode && renderQRCode(selectedPass.barcode)}

                        <div className="text-center mt-4">
                            <div className="text-sm text-muted-foreground">Barcode</div>
                            <div className="font-mono text-lg tracking-wider">
                                {selectedPass?.barcode}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" className="w-full" size="sm">
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Pass
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pass Details Drawer */}
            <Drawer open={showDetailsDrawer} onOpenChange={setShowDetailsDrawer}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{selectedPass?.name}</DrawerTitle>
                        <DrawerDescription>
                            {getDateString(selectedPass?.date ?? new Date())}
                        </DrawerDescription>
                    </DrawerHeader>

                    {selectedPass && (
                        <div className="p-4 pt-0">
                            <div className="space-y-4">
                                {/* Different content based on pass type */}
                                {selectedPass.type === 'ticket' && (
                                    <PassTicketDetails pass={selectedPass} />
                                )}

                                {selectedPass.type === 'dining' && (
                                    <PassDiningDetails pass={selectedPass} />
                                )}

                                {selectedPass.type === 'lightning' && (
                                    <PassLightningDetails pass={selectedPass} />
                                )}

                                {selectedPass.type === 'hotel' && (
                                    <PassHotelDetails pass={selectedPass} />
                                )}

                                {selectedPass.type === 'event' && (
                                    <PassEventDetails pass={selectedPass} />
                                )}

                                {/* Barcode section */}
                                {selectedPass.barcode && (
                                    <>
                                        <Separator />

                                        <div className="pt-2">
                                            <h3 className="text-sm font-medium mb-2">Barcode</h3>
                                            <div className="flex justify-center">
                                                {renderQRCode(selectedPass.barcode)}
                                            </div>
                                            <div className="text-center mt-2">
                                                <div className="font-mono text-sm tracking-wider">
                                                    {selectedPass.barcode}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <DrawerFooter>
                        <Button>View Full Details</Button>
                        {selectedPass?.barcode && (
                            <Button variant="outline">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Pass
                            </Button>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}

// Ticket pass details component
function PassTicketDetails({ pass }: { readonly pass: ParkTicketPass }) {
    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-lg border flex items-center",
                !pass.isExpired ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    !pass.isExpired ? "text-green-600" : "text-gray-500"
                )}>
                    <Ticket className="h-6 w-6" />
                </div>

                <div>
                    <div className="font-medium">{pass.parkName}</div>
                    <div className="text-sm text-muted-foreground">
                        {format(pass.startDate, 'MMM d')} - {format(pass.endDate, 'MMM d, yyyy')}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Guest</div>
                        <div className="font-medium">{pass.guestName}</div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Admission Type</div>
                        <div className="font-medium capitalize">{pass.admissionType}</div>
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Valid For</div>
                    <div className="font-medium">
                        {format(pass.startDate, 'MMMM d')} - {format(pass.endDate, 'MMMM d, yyyy')}
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Entry Instructions</h3>
                <p className="text-sm text-blue-700">
                    Present this pass at the park entrance for admission. You may be asked to show photo ID.
                </p>
            </div>
        </div>
    );
}

// Dining pass details component
function PassDiningDetails({ pass }: { readonly pass: DiningPass }) {
    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-lg border flex items-center",
                !pass.isExpired && !pass.isUsed ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    !pass.isExpired && !pass.isUsed ? "text-amber-600" : "text-gray-500"
                )}>
                    <Utensils className="h-6 w-6" />
                </div>

                <div>
                    <div className="font-medium">{pass.restaurantName}</div>
                    <div className="text-sm text-muted-foreground">
                        {format(pass.date, 'EEEE, MMMM d')} at {pass.time}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Time</div>
                        <div className="font-medium">{pass.time}</div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Party Size</div>
                        <div className="font-medium">{pass.partySize} guests</div>
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-medium">{pass.location}</div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Confirmation Number</div>
                    <div className="font-medium">{pass.confirmationNumber}</div>
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-amber-800 mb-1">Dining Instructions</h3>
                <p className="text-sm text-amber-700">
                    Please arrive 15 minutes before your reservation time. Your entire party must be present to be seated.
                </p>
            </div>
        </div>
    );
}

// Lightning Lane pass details component
function PassLightningDetails({ pass }: { readonly pass: LightningLanePass }) {
    // Determine if the pass is currently active
    const now = new Date();
    const startTime = new Date();
    const [startHour, startMinute] = pass.returnTime.start.split(':').map(Number);
    startTime.setHours(startHour, startMinute);

    const endTime = new Date();
    const [endHour, endMinute] = pass.returnTime.end.split(':').map(Number);
    endTime.setHours(endHour, endMinute);

    const isActive = !pass.isExpired && !pass.isUsed && now >= startTime && now <= endTime;
    const isUpcoming = !pass.isExpired && !pass.isUsed && now < startTime;
    const isExpired = pass.isExpired || pass.isUsed || (!isActive && !isUpcoming);

    // Determine color classes based on status
    const getBgColorClass = () => {
        if (isActive) return "bg-green-50 border-green-200";
        if (isUpcoming) return "bg-purple-50 border-purple-200";
        return "bg-gray-50 border-gray-200";
    }

    const getTextColorClass = () => {
        if (isActive) return "text-green-600";
        if (isUpcoming) return "text-purple-600";
        return "text-gray-500";
    }

    const getStatusHeadingTextClass = () => {
        if (isActive) return "text-green-800";
        if (isUpcoming) return "text-blue-800";
        return "text-gray-800";
    }

    const getStatusBodyTextClass = () => {
        if (isActive) return "text-green-700";
        if (isUpcoming) return "text-blue-700";
        return "text-gray-700";
    }

    const getStatusContent = () => {
        if (isActive) return 'Ready to Use';
        if (isUpcoming) return 'Usage Instructions';
        return 'Pass Expired';
    }

    const getStatusDescription = () => {
        if (isActive) return 'Proceed to the Lightning Lane entrance and scan your pass.';
        if (isUpcoming) return `Return to the attraction between ${pass.returnTime.start} and ${pass.returnTime.end} and scan your pass at the Lightning Lane entrance.`;
        return 'This Lightning Lane pass has expired and can no longer be used.';
    }

    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-lg border flex items-center",
                getBgColorClass()
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    getTextColorClass()
                )}>
                    <Zap className="h-6 w-6" />
                </div>

                <div>
                    <div className="font-medium">{pass.attractionName}</div>
                    <div className="text-sm text-muted-foreground">
                        Return Time: {pass.returnTime.start} - {pass.returnTime.end}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Park</div>
                        <div className="font-medium">{pass.parkName}</div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Party Size</div>
                        <div className="font-medium">{pass.partySize} guests</div>
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Type</div>
                    <div className="font-medium">
                        {pass.isGeniePlus
                            ? 'Genie+ Lightning Lane'
                            : 'Individual Lightning Lane'
                        }
                        {pass.isPaid && pass.price && ` ($${pass.price.toFixed(2)})`}
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium flex items-center">
                        {isActive && (
                            <>
                                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                                Active Now
                            </>
                        )}
                        {isUpcoming && (
                            <>
                                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                Upcoming
                            </>
                        )}
                        {isExpired && (
                            <>
                                <Check className="h-4 w-4 mr-2 text-gray-500" />
                                Expired
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={cn(
                "border p-3 rounded-lg",
                getBgColorClass()
            )}>
                <h3 className={cn(
                    "text-sm font-medium mb-1",
                    getStatusHeadingTextClass()
                )}>
                    {getStatusContent()}
                </h3>
                <p className={cn(
                    "text-sm",
                    getStatusBodyTextClass()
                )}>
                    {getStatusDescription()}
                </p>
            </div>
        </div>
    );
}

// Hotel pass details component
function PassHotelDetails({ pass }: { readonly pass: HotelPass }) {
    const today = new Date();
    const isCheckInDay = isSameDay(today, pass.checkIn);
    const isCheckOutDay = isSameDay(today, pass.checkOut);
    const isStay = isAfter(today, pass.checkIn) && !isAfter(today, pass.checkOut);

    // Get appropriate background and text color
    const getCardColorClasses = () => {
        return (isCheckInDay || isStay)
            ? "bg-blue-50 border-blue-200"
            : "bg-gray-50 border-gray-200";
    };

    const getIconColorClass = () => {
        return (isCheckInDay || isStay)
            ? "text-blue-600"
            : "text-gray-500";
    };

    // Get appropriate instructions based on status
    const getInstructionsHeading = () => {
        if (isCheckInDay) return 'Check-In Instructions';
        if (isCheckOutDay) return 'Check-Out Instructions';
        return 'Reservation Information';
    };

    const getInstructionsText = () => {
        if (isCheckInDay) {
            return 'Check-in time is 3:00 PM. Present this pass at the front desk along with ID.';
        }
        if (isCheckOutDay) {
            return 'Check-out time is 11:00 AM. You can use the Express Check-out feature on your TV.';
        }
        return 'Your reservation is confirmed. Check-in time is 3:00 PM and check-out is 11:00 AM.';
    };

    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-lg border flex items-center",
                getCardColorClasses()
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    getIconColorClass()
                )}>
                    <Hotel className="h-6 w-6" />
                </div>

                <div>
                    <div className="font-medium">{pass.hotelName}</div>
                    <div className="text-sm text-muted-foreground">
                        {format(pass.checkIn, 'MMM d')} - {format(pass.checkOut, 'MMM d, yyyy')}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Room Type</div>
                    <div className="font-medium">{pass.roomType}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Check-In</div>
                        <div className="font-medium">{format(pass.checkIn, 'MMMM d, yyyy')}</div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Check-Out</div>
                        <div className="font-medium">{format(pass.checkOut, 'MMMM d, yyyy')}</div>
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Guests</div>
                    <div className="font-medium">
                        {pass.guestNames.join(', ')}
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Confirmation Number</div>
                    <div className="font-medium">{pass.confirmationNumber}</div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-1">
                    {getInstructionsHeading()}
                </h3>
                <p className="text-sm text-blue-700">
                    {getInstructionsText()}
                </p>
            </div>
        </div>
    );
}

// Event pass details component
function PassEventDetails({ pass }: { readonly pass: EventPass }) {
    // Determine appropriate color classes based on event status
    const getCardColorClass = () => {
        return !pass.isExpired
            ? "bg-pink-50 border-pink-200"
            : "bg-gray-50 border-gray-200";
    };

    const getIconColorClass = () => {
        return !pass.isExpired
            ? "text-pink-600"
            : "text-gray-500";
    };

    return (
        <div className="space-y-4">
            <div className={cn(
                "p-4 rounded-lg border flex items-center",
                getCardColorClass()
            )}>
                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mr-4",
                    getIconColorClass()
                )}>
                    <Sparkles className="h-6 w-6" />
                </div>

                <div>
                    <div className="font-medium">{pass.eventName}</div>
                    <div className="text-sm text-muted-foreground">
                        {format(pass.date, 'EEEE, MMMM d')}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Start Time</div>
                        <div className="font-medium">{pass.startTime}</div>
                    </div>

                    <div className="bg-secondary/20 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">End Time</div>
                        <div className="font-medium">{pass.endTime}</div>
                    </div>
                </div>

                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-medium">{pass.location}</div>
                </div>
            </div>

            {pass.description && (
                <div className="bg-secondary/20 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <div className="text-sm">{pass.description}</div>
                </div>
            )}

            <div className="bg-pink-50 border border-pink-200 p-3 rounded-lg">
                <h3 className="text-sm font-medium text-pink-800 mb-1">Event Information</h3>
                <p className="text-sm text-pink-700">
                    Please arrive at least 15 minutes before the event starts. Present this pass at the entrance for admission.
                </p>
            </div>
        </div>
    );
}