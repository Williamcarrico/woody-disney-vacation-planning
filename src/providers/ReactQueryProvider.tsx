'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function ReactQueryProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                        retry: (failureCount, error) => {
                            // Don't retry for certain error types
                            if (error instanceof Error) {
                                // Don't retry for timeout errors after 2 attempts
                                if (error.message.includes('timeout') && failureCount >= 2) {
                                    return false
                                }
                                // Don't retry for 4xx errors (client errors)
                                if (error.message.includes('400') || error.message.includes('401') ||
                                    error.message.includes('403') || error.message.includes('404')) {
                                    return false
                                }
                            }
                            // Retry up to 3 times for network errors
                            return failureCount < 3
                        },
                        retryDelay: (attemptIndex) => {
                            // Exponential backoff: 1s, 2s, 4s
                            return Math.min(1000 * (2 ** attemptIndex), 30000)
                        },
                    },
                    mutations: {
                        retry: 1, // Retry mutations once
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}