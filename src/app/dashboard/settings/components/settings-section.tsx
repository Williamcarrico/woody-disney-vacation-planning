"use client"

import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface SettingsSectionProps {
    title: string
    description?: string
    children: React.ReactNode
    icon?: React.ReactNode
    defaultOpen?: boolean
    className?: string
}

export function SettingsSection({
    title,
    description,
    children,
    icon,
    defaultOpen = true,
    className,
}: SettingsSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={cn("rounded-lg border bg-card shadow-sm", className)}>
            <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    {icon && <div className="text-primary">{icon}</div>}
                    <div>
                        <h3 className="font-medium tracking-tight">{title}</h3>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-muted-foreground"
                >
                    <ChevronDown className="h-5 w-5" />
                </motion.div>
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="border-t p-4 pt-2">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}