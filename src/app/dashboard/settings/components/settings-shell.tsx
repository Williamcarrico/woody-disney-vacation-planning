import { cn } from "@/lib/utils"

interface SettingsShellProps {
    children: React.ReactNode
    className?: string
}

export function SettingsShell({ children, className }: SettingsShellProps) {
    return (
        <div className={cn(
            "relative rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all",
            "backdrop-blur-sm dark:bg-card/95",
            "animate-floating-shadow",
            className
        )}>
            <div className="absolute -inset-px rounded-xl bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 opacity-30 blur-sm"></div>
            <div className="relative z-10">{children}</div>
        </div>
    )
}