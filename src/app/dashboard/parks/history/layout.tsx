import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Walt Disney World History | Comprehensive Resort Overview',
    description: 'Explore the detailed operational history of Walt Disney World Resort, including hotel statistics, dining, attractions, transportation systems, financial metrics, and staffing information.',
}

export default function HistoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}