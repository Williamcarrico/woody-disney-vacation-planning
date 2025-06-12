import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

interface RecentActivityProps {
    userId: string
}

export default async function RecentActivity({ userId }: RecentActivityProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                </CardTitle>
                <CardDescription>
                    Your latest actions
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                </p>
            </CardContent>
        </Card>
    )
}