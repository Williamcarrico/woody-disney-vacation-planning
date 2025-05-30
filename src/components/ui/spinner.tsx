import { cn } from "@/lib/utils"

interface SpinnerProps {
    size?: "sm" | "md" | "lg"
    className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    }

    return (
        <div
            className={cn(
                "inline-block animate-spin rounded-full border-2 border-solid border-t-current border-l-current border-b-current border-r-transparent",
                sizeClasses[size],
                className
            )}
        />
    )
}