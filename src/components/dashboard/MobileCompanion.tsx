import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

interface MobileCompanionProps {
    vacationId: string
}

export default function MobileCompanion({ vacationId }: MobileCompanionProps) {
    // This would dynamically generate a QR code or link for the specific vacation
    const appDownloadLink = `https://disneyplanner.app/download?ref=${vacationId}`

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-center items-center w-32 h-32 bg-muted rounded-lg mb-4">
                <QrCode className="h-16 w-16 text-primary" />
            </div>
            <p className="text-sm mb-3 text-center">
                Scan to download our mobile app and access your trip details on the go
            </p>
            <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">iOS App</Button>
                <Button variant="outline" size="sm">Android App</Button>
            </div>
        </div>
    )
}