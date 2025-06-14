'use client'

import React, { Suspense, lazy, useState, useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Try to load Three.js components with better error handling
let CanvasComponent: React.ComponentType<any> | null = null
let FireworksSceneComponent: React.ComponentType<any> | null = null

// Async loader functions
const loadCanvas = async () => {
  try {
    const { Canvas } = await import('@react-three/fiber')
    return Canvas
  } catch (error) {
    console.error('Failed to load @react-three/fiber Canvas:', error)
    throw new Error('Three.js Canvas failed to load')
  }
}

const loadFireworksScene = async () => {
  try {
    return (await import('./FireworksScene')).default
  } catch (error) {
    console.error('Failed to load FireworksScene:', error)
    throw new Error('FireworksScene failed to load')
  }
}

interface ThreeJSWrapperProps {
  clickPositions: Array<{ x: number; y: number; id: number }>
  onRetry?: () => void
}

const LoadingFallback: React.FC = () => (
  <div className="absolute inset-0 bg-black flex items-center justify-center">
    <div className="text-white text-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🎆</span>
        </div>
      </div>
      <p className="text-lg font-semibold">Loading magical fireworks...</p>
      <p className="text-sm opacity-60">Preparing the show just for you</p>
    </div>
  </div>
)

const ErrorFallback: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center text-white">
    <div className="text-center space-y-6 max-w-md px-4">
      <div className="flex justify-center">
        <AlertTriangle className="h-16 w-16 text-yellow-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Three.js Loading Error</h3>
        <p className="text-sm opacity-75">
          The 3D graphics system couldn't load. This might be due to browser compatibility or network issues.
        </p>
      </div>
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-6xl mb-2">🎆</div>
          <p className="text-lg font-semibold text-purple-300">
            Imagine beautiful fireworks here!
          </p>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        <p className="text-xs opacity-50">
          Try refreshing the page or using a different browser for the best experience.
        </p>
      </div>
    </div>
  </div>
)

const ThreeJSWrapper: React.FC<ThreeJSWrapperProps> = ({ clickPositions, onRetry }) => {
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [components, setComponents] = useState<{
    Canvas: React.ComponentType<any> | null
    FireworksScene: React.ComponentType<any> | null
  }>({ Canvas: null, FireworksScene: null })

  useEffect(() => {
    let mounted = true

    const loadComponents = async () => {
      try {
        setLoadingState('loading')
        
        // Load components in parallel
        const [Canvas, FireworksScene] = await Promise.all([
          loadCanvas(),
          loadFireworksScene()
        ])

        if (mounted) {
          setComponents({ Canvas, FireworksScene })
          setLoadingState('loaded')
        }
      } catch (error) {
        console.error('Failed to load Three.js components:', error)
        if (mounted) {
          setLoadingState('error')
        }
      }
    }

    loadComponents()
    
    return () => {
      mounted = false
    }
  }, [])

  const handleRetry = () => {
    setLoadingState('loading')
    setComponents({ Canvas: null, FireworksScene: null })
    
    // Retry loading after a brief delay
    setTimeout(() => {
      const loadComponents = async () => {
        try {
          const [Canvas, FireworksScene] = await Promise.all([
            loadCanvas(),
            loadFireworksScene()
          ])
          setComponents({ Canvas, FireworksScene })
          setLoadingState('loaded')
        } catch (error) {
          console.error('Retry failed:', error)
          setLoadingState('error')
        }
      }
      loadComponents()
    }, 1000)
    
    onRetry?.()
  }

  if (loadingState === 'loading') {
    return <LoadingFallback />
  }

  if (loadingState === 'error' || !components.Canvas || !components.FireworksScene) {
    return <ErrorFallback onRetry={handleRetry} />
  }

  const { Canvas, FireworksScene } = components

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Canvas
        className="w-full h-full pointer-events-none"
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false
        }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        performance={{ min: 0.8 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.shadowMap.enabled = false
        }}
      >
        <FireworksScene clickPositions={clickPositions} />
      </Canvas>
    </Suspense>
  )
}

export default ThreeJSWrapper 