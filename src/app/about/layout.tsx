import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About Us | Crafting Magical Memories Together',
    description: 'Discover our story, mission, and the technology behind the platform revolutionizing Disney World group vacation planning.'
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}