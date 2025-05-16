"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi, Cloud, CloudOff, RefreshCw, Check } from "lucide-react"
import { useOfflineStatus } from "@/hooks/useOfflineStatus"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface OfflineIndicatorProps {
    className?: string
    displayMode?: "minimal" | "standard" | "detailed"
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "inline"
}

export default function OfflineIndicator({
    className,
    displayMode = "standard",
    position = "bottom-right",
}: OfflineIndicatorProps) {
    const {
        isOnline,
        isOfflineMode,
        hasPendingChanges,
        pendingChangeCount,
        toggleOfflineMode,
        syncChanges
    } = useOfflineStatus()

    const [isAnimating, setIsAnimating] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [syncSuccess, setSyncSuccess] = useState(false)

    // Show animation when status changes
    useEffect(() => {
        setIsAnimating(true)
        const timeout = setTimeout(() => setIsAnimating(false), 1000)
        return () => clearTimeout(timeout)
    }, [isOnline, isOfflineMode])

    // Handle sync
    const handleSync = async () => {
        setIsSyncing(true)
        setSyncSuccess(false)

        try {
            await syncChanges()
            setSyncSuccess(true)
        } catch (error) {
            console.error("Sync failed:", error)
        } finally {
            // Reset the status after 2 seconds
            setTimeout(() => {
                setIsSyncing(false)
                setSyncSuccess(false)
            }, 2000)
        }
    }

    // Variants for animation
    const indicatorVariants = {
        initial: { scale: 1, opacity: 1 },
        animate: { scale: [1, 1.2, 1], opacity: 1, transition: { duration: 0.4 } },
    }

    // Determine status classes and icon
    const getStatusConfig = () => {
        if (isOfflineMode) {
            return {
                color: "bg-yellow-500",
                icon: <CloudOff className="h-4 w-4" />,
                text: "Offline Mode",
                description: "You're working in offline mode",
            }
        }

        if (!isOnline) {
            return {
                color: "bg-destructive",
                icon: <WifiOff className="h-4 w-4" />,
                text: "Offline",
                description: "No internet connection",
            }
        }

        if (hasPendingChanges) {
            return {
                color: "bg-yellow-500",
                icon: <Cloud className="h-4 w-4" />,
                text: "Pending Changes",
                description: `${pendingChangeCount} changes to sync`,
            }
        }

        return {
            color: "bg-green-500",
            icon: <Wifi className="h-4 w-4" />,
            text: "Online",
            description: "All changes synced",
        }
    }

    const { color, icon, text, description } = getStatusConfig()

    // For minimal display mode, just show a simple dot
    if (displayMode === "minimal") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            className={cn(
                                "w-3 h-3 rounded-full",
                                color,
                                position === "bottom-right" && "fixed bottom-4 right-4",
                                position === "bottom-left" && "fixed bottom-4 left-4",
                                position === "top-right" && "fixed top-4 right-4",
                                position === "top-left" && "fixed top-4 left-4",
                                position === "inline" && "inline-block",
                                isAnimating && "animate-pulse",
                                className
                            )}
                            variants={indicatorVariants}
                            animate={isAnimating ? "animate" : "initial"}
                        />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{text}</p>
                        <p className="text-xs">{description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // For standard mode, show an icon with text on hover
    if (displayMode === "standard") {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <motion.div
                            className={cn(
                                "flex items-center justify-center p-2 rounded-full shadow-md text-white",
                                color,
                                position === "bottom-right" && "fixed bottom-4 right-4",
                                position === "bottom-left" && "fixed bottom-4 left-4",
                                position === "top-right" && "fixed top-4 right-4",
                                position === "top-left" && "fixed top-4 left-4",
                                position === "inline" && "inline-flex",
                                className
                            )}
                            variants={indicatorVariants}
                            animate={isAnimating ? "animate" : "initial"}
                        >
                            {icon}
                        </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{text}</p>
                        <p className="text-xs">{description}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // For detailed mode, show a popover with actions
    return (
        <Popover>
            <PopoverTrigger asChild>
                <motion.div
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full shadow-md text-white cursor-pointer",
                        color,
                        position === "bottom-right" && "fixed bottom-4 right-4",
                        position === "bottom-left" && "fixed bottom-4 left-4",
                        position === "top-right" && "fixed top-4 right-4",
                        position === "top-left" && "fixed top-4 left-4",
                        position === "inline" && "inline-flex",
                        className
                    )}
                    variants={indicatorVariants}
                    animate={isAnimating ? "animate" : "initial"}
                >
                    {icon}
                    <span className="text-sm font-medium">{text}</span>
                    {hasPendingChanges && (
                        <Badge variant="outline" className="bg-white/20 text-white">
                            {pendingChangeCount}
                        </Badge>
                    )}
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-72">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-medium">Connection Status</h4>
                        <Badge variant={isOnline ? "default" : "destructive"}>
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Offline Mode</Label>
                            <div className="text-xs text-muted-foreground">
                                {isOfflineMode
                                    ? "Working offline with local changes"
                                    : "Changes sync automatically"}
                            </div>
                        </div>
                        <Switch
                            checked={isOfflineMode}
                            onCheckedChange={toggleOfflineMode}
                            disabled={!isOnline && !isOfflineMode}
                        />
                    </div>

                    {hasPendingChanges && (
                        <div className="space-y-2 pt-2 border-t">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Pending Changes</span>
                                <Badge variant="outline">{pendingChangeCount}</Badge>
                            </div>
                            <Button
                                className="w-full"
                                size="sm"
                                disabled={!isOnline || isOfflineMode || isSyncing}
                                onClick={handleSync}
                            >
                                {isSyncing ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : syncSuccess ? (
                                    <Check className="h-4 w-4 mr-2" />
                                ) : (
                                    <Cloud className="h-4 w-4 mr-2" />
                                )}
                                {isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Sync Now"}
                            </Button>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                        {isOfflineMode
                            ? "Your changes will be saved locally and synced when you disable offline mode."
                            : isOnline
                                ? "All changes are automatically synced with the server."
                                : "You're currently offline. Changes will sync when connection is restored."}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}