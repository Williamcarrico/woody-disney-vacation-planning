import React from "react"

export const metadata = {
    title: "Walt Disney World Annual Passes | Disney Vacation Planning",
    description: "Compare Disney World Annual Pass options including the Incredi-Pass, Sorcerer Pass, Pirate Pass, and Pixie Dust Pass to find which option is best for your vacation planning needs.",
}

export default function AnnualPassesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    )
}