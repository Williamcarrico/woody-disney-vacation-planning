import { Sparkles } from "lucide-react"

export function SettingsHeader() {
    return (
        <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <Sparkles className="h-6 w-6 text-primary animate-pulse-slow" />
            </div>
            <p className="text-muted-foreground">
                Customize your Disney vacation planning experience to match your preferences.
            </p>
        </div>
    )
}