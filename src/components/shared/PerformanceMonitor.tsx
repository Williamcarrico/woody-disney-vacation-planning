'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'performance' in window) {
            const handleLoad = () => {
                const perfData = window.performance.timing
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
                console.log('Page Load Time:', pageLoadTime, 'ms')

                // Send to analytics if needed
                if (window.gtag) {
                    window.gtag('event', 'page_load_time', {
                        value: pageLoadTime,
                        page_location: window.location.href
                    })
                }
            }

            if (document.readyState === 'complete') {
                handleLoad()
            } else {
                window.addEventListener('load', handleLoad)
                return () => window.removeEventListener('load', handleLoad)
            }
        }
    }, [])

    return null
} 