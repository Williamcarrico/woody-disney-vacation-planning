import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CalendarDays, Users, Ticket, DollarSign } from "lucide-react"

interface TripOverviewProps {
    vacationId: string
}

export default function TripOverview({ vacationId }: TripOverviewProps) {
    // In a real implementation, this would fetch data based on the vacationId
    const vacationData = {
        name: "Magic Kingdom Adventure",
        dates: "Dec 15-22, 2023",
        partySize: 4,
        ticketType: "Park Hopper",
        budget: "$5,000"
    }

    return (
        <div className="w-full p-4 border rounded-lg bg-card">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{vacationData.name}</h2>
                    <p className="text-muted-foreground">{vacationData.dates}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit Trip</Button>
                    <Button variant="default" size="sm">Share</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Card className="p-3 flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Dates</p>
                        <p className="font-medium">{vacationData.dates}</p>
                    </div>
                </Card>
                <Card className="p-3 flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Party Size</p>
                        <p className="font-medium">{vacationData.partySize} people</p>
                    </div>
                </Card>
                <Card className="p-3 flex items-center gap-3">
                    <Ticket className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Ticket Type</p>
                        <p className="font-medium">{vacationData.ticketType}</p>
                    </div>
                </Card>
                <Card className="p-3 flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">{vacationData.budget}</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}