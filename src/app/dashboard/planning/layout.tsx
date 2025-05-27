import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Disney Vacation Planning | Immersive AI-Powered Dashboard",
    description: "Experience the magic with our sophisticated Disney vacation planner featuring AI optimization, real-time data, immersive animations, and comprehensive planning tools."
}

export default function PlanningLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}