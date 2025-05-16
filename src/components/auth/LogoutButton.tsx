"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
    readonly variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    readonly size?: "default" | "sm" | "lg" | "icon"
    readonly className?: string
    readonly showIcon?: boolean
    readonly label?: string
}

export function LogoutButton({
    variant = "ghost",
    size = "default",
    className,
    showIcon = true,
    label = "Log out"
}: LogoutButtonProps) {
    const router = useRouter()

    const handleLogout = () => {
        router.push("/logout")
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleLogout}
            className={cn(className)}
        >
            {showIcon && <LogOutIcon className="h-4 w-4 mr-2" />}
            {label}
        </Button>
    )
}