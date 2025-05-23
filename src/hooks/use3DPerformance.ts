'use client'

import { useEffect, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'

interface PerformanceMetrics {
    fps: number
    triangles: number
    drawCalls: number
    memoryUsage: number
    isLowPerformance: boolean
    qualityLevel: 'high' | 'medium' | 'low'
}

interface PerformanceSettings {
    enableAutoOptimization: boolean
    targetFPS: number
    maxTriangles: number
    lowEndDevice: boolean
}

export function use3DPerformance(settings: Partial<PerformanceSettings> = {}) {
    const {
        enableAutoOptimization = true,
        targetFPS = 30,
        maxTriangles = 50000,
        lowEndDevice = false
    } = settings

    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        fps: 60,
        triangles: 0,
        drawCalls: 0,
        memoryUsage: 0,
        isLowPerformance: false,
        qualityLevel: 'high'
    })

    const [frameCount, setFrameCount] = useState(0)
    const [lastTime, setLastTime] = useState(performance.now())

    // Detect low-end devices
    const detectLowEndDevice = useCallback(() => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        if (!gl) return true

        const renderer = gl.getParameter(gl.RENDERER) || ''
        const vendor = gl.getParameter(gl.VENDOR) || ''

        // Check for known low-end GPU patterns
        const lowEndPatterns = [
            /intel.*hd/i,
            /intel.*uhd/i,
            /mali/i,
            /adreno.*3/i,
            /powervr/i,
            /sgx/i
        ]

        const isLowEndGPU = lowEndPatterns.some(pattern =>
            pattern.test(renderer) || pattern.test(vendor)
        )

        // Check hardware concurrency (CPU cores)
        const lowCoreCount = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4

        // Check memory
        const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4

        return isLowEndGPU || lowCoreCount || lowMemory || lowEndDevice
    }, [lowEndDevice])

    // Performance monitoring
    const updateMetrics = useCallback((gl: any, info: any) => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastTime

        setFrameCount(prev => {
            const newFrameCount = prev + 1

            // Update FPS every second
            if (deltaTime >= 1000) {
                const fps = (newFrameCount * 1000) / deltaTime
                const triangles = info.render.triangles || 0
                const drawCalls = info.render.calls || 0

                // Estimate memory usage (approximate)
                const memoryUsage = (
                    info.memory?.geometries * 100 +
                    info.memory?.textures * 500 +
                    info.memory?.materials * 50
                ) || 0

                const isLowPerformance = fps < targetFPS || triangles > maxTriangles

                let qualityLevel: 'high' | 'medium' | 'low' = 'high'
                if (fps < targetFPS * 0.5 || triangles > maxTriangles * 1.5) {
                    qualityLevel = 'low'
                } else if (fps < targetFPS * 0.8 || triangles > maxTriangles) {
                    qualityLevel = 'medium'
                }

                setMetrics({
                    fps: Math.round(fps),
                    triangles,
                    drawCalls,
                    memoryUsage: Math.round(memoryUsage / 1024), // Convert to MB
                    isLowPerformance,
                    qualityLevel
                })

                setLastTime(currentTime)
                return 0
            }

            return newFrameCount
        })
    }, [lastTime, targetFPS, maxTriangles])

    // Auto-optimization based on performance
    const getOptimizedSettings = useCallback(() => {
        const isLowEnd = detectLowEndDevice()
        const { qualityLevel, isLowPerformance } = metrics

        const baseSettings = {
            shadowMapSize: 1024,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            antialias: true,
            maxLights: 6,
            particleCount: 50,
            enablePostProcessing: true,
            complexGeometry: true
        }

        if (isLowEnd || qualityLevel === 'low') {
            return {
                ...baseSettings,
                shadowMapSize: 512,
                pixelRatio: 1,
                antialias: false,
                maxLights: 3,
                particleCount: 20,
                enablePostProcessing: false,
                complexGeometry: false
            }
        }

        if (qualityLevel === 'medium' || isLowPerformance) {
            return {
                ...baseSettings,
                shadowMapSize: 1024,
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                antialias: true,
                maxLights: 4,
                particleCount: 30,
                enablePostProcessing: false,
                complexGeometry: true
            }
        }

        return baseSettings
    }, [metrics, detectLowEndDevice])

    // Warning system for performance issues
    const getPerformanceWarnings = useCallback(() => {
        const warnings: string[] = []

        if (metrics.fps < targetFPS * 0.5) {
            warnings.push('Very low FPS detected')
        }

        if (metrics.triangles > maxTriangles * 2) {
            warnings.push('Too many triangles being rendered')
        }

        if (metrics.memoryUsage > 100) {
            warnings.push('High memory usage')
        }

        if (metrics.drawCalls > 100) {
            warnings.push('Too many draw calls')
        }

        return warnings
    }, [metrics, targetFPS, maxTriangles])

    // Adaptive quality system
    const adaptiveQuality = useCallback(() => {
        if (!enableAutoOptimization) return

        const settings = getOptimizedSettings()

        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('3d-quality-change', {
            detail: { settings, metrics }
        }))
    }, [enableAutoOptimization, getOptimizedSettings, metrics])

    useEffect(() => {
        adaptiveQuality()
    }, [adaptiveQuality, metrics.qualityLevel])

    return {
        metrics,
        updateMetrics,
        getOptimizedSettings,
        getPerformanceWarnings,
        isLowEndDevice: detectLowEndDevice(),
        adaptiveQuality
    }
}

// Hook for Three.js integration
export function useThree3DPerformance(settings?: Partial<PerformanceSettings>) {
    const { gl, scene, camera } = useThree()
    const performance = use3DPerformance(settings)

    useEffect(() => {
        const handleFrame = () => {
            if (gl && gl.info) {
                performance.updateMetrics(gl, gl.info)
            }
        }

        // Monitor performance on each frame
        const id = setInterval(handleFrame, 100) // Check every 100ms

        return () => clearInterval(id)
    }, [gl, performance])

    return performance
}