import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

interface PartyOverviewProps {
    userId: string
    currentVacation?: any
}

export default async function PartyOverview({ userId, currentVacation }: PartyOverviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Your Party
                </CardTitle>
                <CardDescription>
                    Travel companions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    Party members will appear here
                </p>
            </CardContent>
        </Card>
    )
}