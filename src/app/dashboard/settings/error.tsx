"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { SettingsHeader } from "./components/settings-header"
import { SettingsShell } from "./components/settings-shell"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SettingsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="container mx-auto py-6 lg:py-8">
            <SettingsHeader />

            <SettingsShell>
                <div className="space-y-8">
                    <Alert variant="destructive" className="animate-pulse-slow">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>Something went wrong</AlertTitle>
                        <AlertDescription>
                            {error.message || "An error occurred while loading your settings. Please try again."}
                        </AlertDescription>
                    </Alert>

                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        <div className="rounded-full bg-destructive/10 p-6 text-destructive dark:bg-destructive/20">
                            <AlertCircle className="h-10 w-10" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-xl font-semibold tracking-tight">Settings Error</h3>
                            <p className="text-muted-foreground">
                                We encountered an issue while trying to load your settings. This could be a temporary problem.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={reset} variant="default">
                                Try again
                            </Button>
                            <Button onClick={() => window.location.href = "/dashboard"} variant="outline">
                                Return to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsShell>
        </div>
    )
}