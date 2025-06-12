import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface ParkRecommendationsProps {
    userId: string
    weatherData?: any
}

export default async function ParkRecommendations({ userId, weatherData }: ParkRecommendationsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Park Recommendations
                </CardTitle>
                <CardDescription>
                    Best parks to visit today
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    All parks are magical today!
                </p>
            </CardContent>
        </Card>
    )
}