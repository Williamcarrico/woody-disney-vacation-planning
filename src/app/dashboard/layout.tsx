"use client"

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    )
}