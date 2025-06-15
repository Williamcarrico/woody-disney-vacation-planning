/**
 * Bundle optimization utilities for code splitting and lazy loading
 */

import dynamic from 'next/dynamic'
import { ComponentType, lazy, Suspense } from 'react'

// Loading component for dynamic imports
export const DefaultLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
)

// Error component for failed imports
export const DefaultErrorComponent = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center p-8 text-red-600">
    <p>Failed to load component: {error.message}</p>
  </div>
)

// Dynamic import wrapper with loading and error states
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: ComponentType
    error?: ComponentType<{ error: Error }>
    ssr?: boolean
    suspense?: boolean
  }
) {
  const {
    loading = DefaultLoadingComponent,
    error = DefaultErrorComponent,
    ssr = false,
    suspense = false
  } = options || {}

  if (suspense) {
    // Use React.lazy for Suspense support
    const LazyComponent = lazy(importFn)
    
    return (props: P) => (
      <Suspense fallback={<loading />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }

  // Use Next.js dynamic for more control
  return dynamic(importFn, {
    loading,
    ssr,
    // @ts-ignore - Next.js types don't include error option
    error
  })
}

// Preload component in the background
export async function preloadComponent(
  importFn: () => Promise<any>
): Promise<void> {
  try {
    await importFn()
  } catch (error) {
    console.warn('Failed to preload component:', error)
  }
}

// Intersection Observer for lazy loading
export function createLazyComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    rootMargin?: string
    threshold?: number | number[]
    loading?: ComponentType
  }
) {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    loading = DefaultLoadingComponent
  } = options || {}

  return dynamic(() => {
    return new Promise<{ default: ComponentType<P> }>((resolve) => {
      if (typeof window === 'undefined') {
        // SSR: resolve immediately
        resolve(importFn())
        return
      }

      // Client: use Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect()
            resolve(importFn())
          }
        },
        { rootMargin, threshold }
      )

      // Create a placeholder element to observe
      const placeholder = document.createElement('div')
      placeholder.style.height = '1px'
      placeholder.style.width = '1px'
      document.body.appendChild(placeholder)
      observer.observe(placeholder)

      // Cleanup after a timeout
      setTimeout(() => {
        observer.disconnect()
        placeholder.remove()
        resolve(importFn())
      }, 10000) // 10 second timeout
    })
  }, {
    loading,
    ssr: false
  })
}

// Route-based code splitting configurations
export const routeConfig = {
  // Heavy components that should be lazy loaded
  heavyComponents: {
    // 3D components
    Globe3D: () => createDynamicComponent(
      () => import('@/components/maps/Globe3D'),
      { ssr: false }
    ),
    AttractionModel3D: () => createDynamicComponent(
      () => import('@/components/attractions/AttractionModel3D'),
      { ssr: false }
    ),
    
    // Chart components
    WaitTimeChart: () => createDynamicComponent(
      () => import('@/components/charts/WaitTimeChart'),
      { ssr: false }
    ),
    CrowdCalendar: () => createDynamicComponent(
      () => import('@/components/charts/CrowdCalendar'),
      { ssr: false }
    ),
    
    // Map components
    ParkMap: () => createDynamicComponent(
      () => import('@/components/maps/ParkMap'),
      { ssr: false }
    ),
    
    // Animation components
    LottieAnimation: () => createDynamicComponent(
      () => import('@/components/animations/LottieAnimation'),
      { ssr: false }
    ),
    
    // Rich editors
    RichTextEditor: () => createDynamicComponent(
      () => import('@/components/editors/RichTextEditor'),
      { ssr: false, suspense: true }
    )
  },

  // Route-specific optimizations
  routes: {
    '/dashboard': {
      preload: ['WaitTimeChart', 'ParkMap'],
      lazy: ['Globe3D', 'CrowdCalendar']
    },
    '/dashboard/attractions': {
      preload: ['WaitTimeChart'],
      lazy: ['AttractionModel3D', 'LottieAnimation']
    },
    '/dashboard/planning': {
      preload: ['CrowdCalendar'],
      lazy: ['RichTextEditor', 'ParkMap']
    }
  }
}

// Webpack chunk optimization helpers
export const webpackOptimizations = {
  // Vendor chunk configuration
  vendorChunks: {
    // React ecosystem
    react: ['react', 'react-dom', 'react-query'],
    
    // UI libraries
    ui: ['@radix-ui', 'framer-motion', 'class-variance-authority'],
    
    // Firebase
    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    
    // 3D libraries
    three: ['three', '@react-three/fiber', '@react-three/drei'],
    
    // Maps
    maps: ['@vis.gl/react-google-maps', 'mapbox-gl'],
    
    // Charts
    charts: ['recharts', 'd3'],
    
    // Utilities
    utils: ['lodash', 'date-fns', 'zod']
  },

  // Module federation for micro-frontends
  federationConfig: {
    name: 'disneyVacationPlanning',
    filename: 'remoteEntry.js',
    exposes: {
      './ParkInfo': './src/components/parks/ParkInfo',
      './AttractionList': './src/components/attractions/AttractionList',
      './DiningReservations': './src/components/dining/DiningReservations'
    },
    shared: {
      react: { singleton: true, requiredVersion: '^19.0.0' },
      'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      'next': { singleton: true, requiredVersion: '^15.0.0' }
    }
  }
}

// Image optimization configurations
export const imageOptimization = {
  // Responsive image sizes
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Image formats
  formats: ['image/webp', 'image/avif'],
  
  // Lazy loading configuration
  lazyBoundary: '200px',
  
  // Quality settings by image type
  quality: {
    default: 75,
    hero: 90,
    thumbnail: 60,
    avatar: 80
  }
}

// Performance monitoring for bundles
export class BundleMonitor {
  private static measurements: Map<string, number> = new Map()

  static startMeasure(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-start`)
    }
  }

  static endMeasure(name: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${name}-end`)
      try {
        performance.measure(name, `${name}-start`, `${name}-end`)
        const measure = performance.getEntriesByName(name)[0]
        if (measure) {
          this.measurements.set(name, measure.duration)
          console.log(`Bundle ${name} loaded in ${measure.duration.toFixed(2)}ms`)
        }
      } catch (error) {
        console.warn('Failed to measure bundle performance:', error)
      }
    }
  }

  static getReport(): Record<string, number> {
    const report: Record<string, number> = {}
    this.measurements.forEach((duration, name) => {
      report[name] = duration
    })
    return report
  }
}

// Resource hints for preloading
export function addResourceHints(resources: {
  preconnect?: string[]
  prefetch?: string[]
  preload?: Array<{ href: string; as: string }>
}): void {
  if (typeof window === 'undefined') return

  const head = document.head

  // Preconnect to external domains
  resources.preconnect?.forEach(origin => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = origin
    head.appendChild(link)
  })

  // Prefetch resources
  resources.prefetch?.forEach(href => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    head.appendChild(link)
  })

  // Preload critical resources
  resources.preload?.forEach(({ href, as }) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    head.appendChild(link)
  })
}

// Initialize performance optimizations
export function initializeBundleOptimizations(): void {
  if (typeof window === 'undefined') return

  // Add resource hints
  addResourceHints({
    preconnect: [
      'https://fonts.googleapis.com',
      'https://firebasestorage.googleapis.com',
      'https://maps.googleapis.com'
    ],
    prefetch: [
      '/api/parks/magic-kingdom',
      '/api/attractions'
    ]
  })

  // Monitor bundle loading
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          console.log(`Resource ${entry.name} loaded in ${entry.duration.toFixed(2)}ms`)
        }
      })
    })
    
    observer.observe({ entryTypes: ['resource'] })
  }
}