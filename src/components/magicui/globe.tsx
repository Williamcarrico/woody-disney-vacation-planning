'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlobeProps {
  className?: string
  size?: number
}

export const Globe: React.FC<GlobeProps> = ({ className, size = 300 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20

    let animationFrame: number

    const drawGlobe = (rotation: number) => {
      ctx.clearRect(0, 0, size, size)

      // Draw globe background
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(centerX - 30, centerY - 30, 0, centerX, centerY, radius)
      gradient.addColorStop(0, '#9c40ff')
      gradient.addColorStop(0.5, '#6366f1')
      gradient.addColorStop(1, '#1e1b4b')
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw grid lines (longitude)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + rotation
        const ellipseRadiusX = Math.abs(radius * Math.sin(angle))
        if (ellipseRadiusX > 0.1) {
          ctx.beginPath()
          try {
            ctx.ellipse(centerX, centerY, ellipseRadiusX, radius, 0, 0, Math.PI * 2)
            ctx.stroke()
          } catch (error) {
            console.warn('Ellipse drawing error:', error)
          }
        }
      }

      // Draw grid lines (latitude)
      for (let i = 1; i < 6; i++) {
        const y = centerY - radius + (i * radius * 2) / 6
        const ellipseRadius = Math.sqrt(Math.max(0, radius * radius - (y - centerY) * (y - centerY)))
        if (ellipseRadius > 0.1) {
          ctx.beginPath()
          try {
            ctx.ellipse(centerX, y, ellipseRadius, Math.max(0.1, ellipseRadius * 0.2), 0, 0, Math.PI * 2)
            ctx.stroke()
          } catch (error) {
            console.warn('Ellipse drawing error:', error)
          }
        }
      }

      // Draw continents (simplified)
      ctx.fillStyle = 'rgba(255, 170, 64, 0.8)'
      
      // North America
      const continent1X = centerX + Math.cos(rotation - 1) * radius * 0.3
      const continent1Y = centerY - radius * 0.2
      if (Math.cos(rotation - 1) > 0) {
        ctx.beginPath()
        try {
          ctx.ellipse(continent1X, continent1Y, Math.max(0.1, 30), Math.max(0.1, 20), 0, 0, Math.PI * 2)
          ctx.fill()
        } catch (error) {
          console.warn('Continent ellipse drawing error:', error)
        }
      }

      // Europe/Africa
      const continent2X = centerX + Math.cos(rotation) * radius * 0.5
      const continent2Y = centerY
      if (Math.cos(rotation) > 0) {
        ctx.beginPath()
        try {
          ctx.ellipse(continent2X, continent2Y, Math.max(0.1, 25), Math.max(0.1, 35), 0, 0, Math.PI * 2)
          ctx.fill()
        } catch (error) {
          console.warn('Continent ellipse drawing error:', error)
        }
      }

      // Asia
      const continent3X = centerX + Math.cos(rotation + 0.8) * radius * 0.4
      const continent3Y = centerY - radius * 0.1
      if (Math.cos(rotation + 0.8) > 0) {
        ctx.beginPath()
        try {
          ctx.ellipse(continent3X, continent3Y, Math.max(0.1, 35), Math.max(0.1, 25), 0, 0, Math.PI * 2)
          ctx.fill()
        } catch (error) {
          console.warn('Continent ellipse drawing error:', error)
        }
      }

      // Draw points for visitor locations
      const points = [
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 51.5074, lng: -0.1278 },  // London  
        { lat: 35.6762, lng: 139.6503 }, // Tokyo
        { lat: -33.8688, lng: 151.2093 }, // Sydney
        { lat: 48.8566, lng: 2.3522 },   // Paris
      ]

      ctx.fillStyle = '#ff69b4'
      points.forEach(point => {
        const lng = (point.lng * Math.PI) / 180 + rotation
        const lat = (point.lat * Math.PI) / 180
        
        const x = centerX + Math.cos(lat) * Math.sin(lng) * radius * 0.8
        const y = centerY - Math.sin(lat) * radius * 0.8
        const z = Math.cos(lat) * Math.cos(lng)
        
        if (z > 0) {
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.fill()
          
          // Add pulsing effect
          ctx.beginPath()
          ctx.arc(x, y, 6, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 105, 180, 0.3)'
          ctx.fill()
          ctx.fillStyle = '#ff69b4' // Reset for next point
        }
      })

      // Outer glow
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2)
      const outerGlow = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 10)
      outerGlow.addColorStop(0, 'rgba(156, 64, 255, 0.5)')
      outerGlow.addColorStop(1, 'rgba(156, 64, 255, 0)')
      ctx.fillStyle = outerGlow
      ctx.fill()
    }

    let rotation = 0
    const animate = () => {
      rotation += 0.005
      drawGlobe(rotation)
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [size])

  return (
    <div className={cn("relative", className)}>
      <motion.canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      
      {/* Floating particles around globe */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-yellow-400"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i * Math.PI * 2) / 8) * (size / 2 + 30),
              y: Math.sin((i * Math.PI * 2) / 8) * (size / 2 + 30),
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  )
}