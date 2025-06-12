import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface AchievementsOverviewProps {
    userId: string
    achievements?: any[]
}

export default async function AchievementsOverview({ userId, achievements = [] }: AchievementsOverviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements Overview
                </CardTitle>
                <CardDescription>
                    Your magical milestones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    {achievements.length} achievements unlocked
                </p>
            </CardContent>
        </Card>
    )
}