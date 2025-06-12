import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

interface NotificationsPanelProps {
    userId: string
}

export default async function NotificationsPanel({ userId }: NotificationsPanelProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Latest updates
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                    No new notifications
                </p>
            </CardContent>
        </Card>
    )
}