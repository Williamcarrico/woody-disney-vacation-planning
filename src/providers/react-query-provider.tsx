'use client'

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ReactQueryProviderProps {
    readonly children: ReactNode
}

/**
 * ReactQueryProvider
 * Wraps its children with TanStack QueryClientProvider.
 * QueryClient must be created inside a Client Component to avoid
 * serialization errors when used within Server Components.
 */
export default function ReactQueryProvider({ children }: ReactQueryProviderProps) {
    // Create the client once per provider instance
    const [queryClient] = useState(() => new QueryClient())

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}