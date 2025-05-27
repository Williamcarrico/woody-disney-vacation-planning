'use client'

import React, { Suspense, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
    Box,
    Cylinder,
    Cone,
    Text,
    Html,
    OrbitControls,
    Environment,
    Sparkles,
    Stars,
    Float,
    Sky,
    ContactShadows,
    PresentationControls,
    Stage,
    SoftShadows,
    useCursor
} from '@react-three/drei'
import { motion } from 'framer-motion'
import { Group, Mesh } from 'three'
import * as THREE from 'three'
import { useSpring, animated, config } from '@react-spring/three'
import ThreeErrorBoundary from './ErrorBoundary'
import { useThree3DPerformance } from '@/hooks/use3DPerformance'

// Disney Castle Tower Component
function CastleTower({
    position,
    height = 4,
    radius = 0.8,
    color = '#8B5A96',
    roofColor = '#2563EB',
    onClick,
    isHovered,
    onHover,
    qualityLevel = 'high'
}: {
    position: [number, number, number]
    height?: number
    radius?: number
    color?: string
    roofColor?: string
    onClick?: () => void
    isHovered?: boolean
    onHover?: (hovered: boolean) => void
    qualityLevel?: 'high' | 'medium' | 'low'
}) {
    const towerRef = useRef<Group>(null)
    const [hover, setHover] = useState(false)
    const [clicked, setClicked] = useState(false)

    // Cursor interaction
    useCursor(hover)

    // Adaptive settings based on performance
    const sparkleCount = qualityLevel === 'high' ? 20 : qualityLevel === 'medium' ? 10 : 5
    const windowDetail = qualityLevel === 'high' ? 4 : qualityLevel === 'medium' ? 3 : 2

    // Spring animation for hover and click effects
    const { scale, rotationY, positionY } = useSpring({
        scale: clicked ? 1.2 : hover || isHovered ? 1.1 : 1,
        rotationY: hover ? Math.PI * 0.1 : 0,
        positionY: hover ? 0.2 : 0,
        config: config.wobbly
    })

    // Floating animation
    useFrame((state) => {
        if (towerRef.current && qualityLevel !== 'low') {
            towerRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0] * 2) * 0.01
            towerRef.current.rotation.y += 0.002
        }
    })

    const handleClick = useCallback(() => {
        setClicked(!clicked)
        onClick?.()
    }, [clicked, onClick])

    return (
        <group
            ref={towerRef}
            position={position}
            onClick={handleClick}
            onPointerEnter={() => {
                setHover(true)
                onHover?.(true)
            }}
            onPointerLeave={() => {
                setHover(false)
                onHover?.(false)
            }}
        >
            <animated.group
                scale={scale}
                rotation-y={rotationY}
                position-y={positionY}
            >
                {/* Tower Base */}
                <Cylinder args={[radius, radius * 1.1, height, qualityLevel === 'high' ? 16 : 8]} position={[0, height / 2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
                </Cylinder>

                {/* Tower Roof */}
                <Cone args={[radius * 1.2, height * 0.6, qualityLevel === 'high' ? 8 : 6]} position={[0, height + height * 0.3, 0]} castShadow>
                    <meshStandardMaterial color={roofColor} roughness={0.4} metalness={0.2} />
                </Cone>

                {/* Windows */}
                {Array.from({ length: windowDetail }).map((_, i) => (
                    <Box
                        key={i}
                        args={[0.3, 0.4, 0.1]}
                        position={[
                            Math.cos((i / windowDetail) * Math.PI * 2) * (radius * 0.9),
                            height * 0.7,
                            Math.sin((i / windowDetail) * Math.PI * 2) * (radius * 0.9)
                        ]}
                        castShadow
                    >
                        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={hover ? 0.5 : 0.2} />
                    </Box>
                ))}

                {/* Flag */}
                <Box args={[0.05, 0.8, 0.05]} position={[0, height + height * 0.7, 0]}>
                    <meshStandardMaterial color="#8B4513" />
                </Box>
                <Box args={[0.4, 0.3, 0.02]} position={[0.2, height + height * 0.8, 0]}>
                    <meshStandardMaterial color="#DC2626" />
                </Box>

                {/* Magical sparkles around tower */}
                {hover && qualityLevel !== 'low' && (
                    <Sparkles
                        count={sparkleCount}
                        scale={[radius * 3, height * 2, radius * 3]}
                        size={2}
                        speed={0.5}
                        color="#FFD700"
                    />
                )}
            </animated.group>
        </group>
    )
}

// Main Castle Structure
function DisneyMagicCastle({
    onTowerClick,
    qualityLevel = 'high'
}: {
    onTowerClick?: (tower: string) => void
    qualityLevel?: 'high' | 'medium' | 'low'
}) {
    const castleRef = useRef<Group>(null)
    const [hoveredTower, setHoveredTower] = useState<string | null>(null)

    // Gentle rotation animation (disabled on low quality)
    useFrame((state) => {
        if (castleRef.current && qualityLevel !== 'low') {
            castleRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
        }
    })

    const towers = [
        { id: 'main', position: [0, 0, 0] satisfies [number, number, number], height: 6, radius: 1.2, color: '#9333EA', roofColor: '#1E40AF' },
        { id: 'left', position: [-4, 0, -2] satisfies [number, number, number], height: 4, radius: 0.8, color: '#8B5A96', roofColor: '#2563EB' },
        { id: 'right', position: [4, 0, -2] satisfies [number, number, number], height: 4, radius: 0.8, color: '#8B5A96', roofColor: '#2563EB' },
        { id: 'back-left', position: [-2, 0, -4] satisfies [number, number, number], height: 3, radius: 0.6, color: '#7C3AED', roofColor: '#3B82F6' },
        { id: 'back-right', position: [2, 0, -4] satisfies [number, number, number], height: 3, radius: 0.6, color: '#7C3AED', roofColor: '#3B82F6' },
    ]

    return (
        <group ref={castleRef}>
            {/* Castle Base */}
            <Box args={[8, 1, 6]} position={[0, 0.5, -1]} castShadow receiveShadow>
                <meshStandardMaterial color="#D1D5DB" roughness={0.7} metalness={0.1} />
            </Box>

            {/* Castle Walls */}
            <Box args={[6, 3, 4]} position={[0, 2.5, -1]} castShadow receiveShadow>
                <meshStandardMaterial color="#E5E7EB" roughness={0.6} metalness={0.1} />
            </Box>

            {/* Castle Gates */}
            <Box args={[2, 2.5, 0.2]} position={[0, 1.75, 1.1]} castShadow>
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </Box>

            {/* Castle Towers */}
            {towers.map((tower) => (
                <CastleTower
                    key={tower.id}
                    position={tower.position}
                    height={tower.height}
                    radius={tower.radius}
                    color={tower.color}
                    roofColor={tower.roofColor}
                    isHovered={hoveredTower === tower.id}
                    onClick={() => onTowerClick?.(tower.id)}
                    onHover={(hovered) => setHoveredTower(hovered ? tower.id : null)}
                    qualityLevel={qualityLevel}
                />
            ))}

            {/* Magical Bridge */}
            <Box args={[3, 0.3, 8]} position={[0, 0.15, 3]} castShadow receiveShadow>
                <meshStandardMaterial color="#8B4513" roughness={0.7} />
            </Box>

            {/* Bridge Rails */}
            {[-1.3, 1.3].map((x, i) => (
                <Box key={i} args={[0.1, 0.8, 8]} position={[x, 0.7, 3]} castShadow>
                    <meshStandardMaterial color="#654321" />
                </Box>
            ))}
        </group>
    )
}

// Floating Disney Characters
function FloatingCharacter({
    position,
    character,
    color = '#FFD700',
    qualityLevel = 'high'
}: {
    position: [number, number, number]
    character: string
    color?: string
    qualityLevel?: 'high' | 'medium' | 'low'
}) {
    const characterRef = useRef<Mesh>(null)

    useFrame((state) => {
        if (characterRef.current && qualityLevel !== 'low') {
            characterRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02
            characterRef.current.rotation.y += 0.01
        }
    })

    const sparkleCount = qualityLevel === 'high' ? 5 : qualityLevel === 'medium' ? 3 : 1

    return (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <group position={position}>
                <Text
                    ref={characterRef}
                    fontSize={1.5}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/comic-neue.woff"
                >
                    {character}
                </Text>
                {qualityLevel !== 'low' && (
                    <Sparkles count={sparkleCount} scale={[2, 2, 2]} size={1} speed={0.3} color={color} />
                )}
            </group>
        </Float>
    )
}

// Environment component with HDR fallback
function EnvironmentWithFallback({ qualityLevel = 'high' }: { qualityLevel?: 'high' | 'medium' | 'low' }) {
    const [useHDR, setUseHDR] = useState(false) // Start with false to avoid initial load errors
    const [hasChecked, setHasChecked] = useState(false)

    useEffect(() => {
        // Only try HDR on high quality and after initial render
        if (qualityLevel === 'high' && !hasChecked) {
            // Check if HDR file exists
            fetch('/venice_sunset_1k.hdr', { method: 'HEAD' })
                .then(() => {
                    setUseHDR(true)
                })
                .catch(() => {
                    console.log('HDR file not available, using preset environment')
                })
                .finally(() => {
                    setHasChecked(true)
                })
        }
    }, [qualityLevel, hasChecked])

    // Always use preset for low/medium quality or if HDR fails
    return (
        <Suspense fallback={<Environment preset="sunset" background={false} environmentIntensity={0.4} />}>
            {useHDR && qualityLevel === 'high' ? (
                <Environment
                    files="/venice_sunset_1k.hdr"
                    background={false}
                    environmentIntensity={0.5}
                />
            ) : (
                <Environment
                    preset="sunset"
                    background={false}
                    environmentIntensity={0.4}
                />
            )}
        </Suspense>
    )
}

// Custom Cloud component without external dependencies
function CustomClouds({ qualityLevel = 'high' }: { qualityLevel?: 'high' | 'medium' | 'low' }) {
    const cloudCount = qualityLevel === 'high' ? 8 : qualityLevel === 'medium' ? 5 : 3
    const cloudsRef = useRef<Group>(null)

    useFrame((state) => {
        if (cloudsRef.current && qualityLevel !== 'low') {
            cloudsRef.current.rotation.y = state.clock.elapsedTime * 0.01
        }
    })

    return (
        <group ref={cloudsRef}>
            {Array.from({ length: cloudCount }).map((_, i) => {
                const angle = (i / cloudCount) * Math.PI * 2
                const radius = 15 + Math.random() * 10
                const height = 10 + Math.random() * 5
                const scale = 1 + Math.random() * 0.5

                return (
                    <group
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            height,
                            Math.sin(angle) * radius
                        ]}
                    >
                        {/* Cloud made from multiple spheres */}
                        <group scale={[scale, scale, scale]}>
                            <mesh castShadow receiveShadow>
                                <sphereGeometry args={[2, 8, 6]} />
                                <meshStandardMaterial
                                    color="#ffffff"
                                    transparent
                                    opacity={0.7}
                                    roughness={1}
                                    metalness={0}
                                />
                            </mesh>
                            <mesh position={[1.5, 0, 0]} castShadow receiveShadow>
                                <sphereGeometry args={[1.5, 8, 6]} />
                                <meshStandardMaterial
                                    color="#ffffff"
                                    transparent
                                    opacity={0.7}
                                    roughness={1}
                                    metalness={0}
                                />
                            </mesh>
                            <mesh position={[-1.5, 0, 0]} castShadow receiveShadow>
                                <sphereGeometry args={[1.5, 8, 6]} />
                                <meshStandardMaterial
                                    color="#ffffff"
                                    transparent
                                    opacity={0.7}
                                    roughness={1}
                                    metalness={0}
                                />
                            </mesh>
                            <mesh position={[0, 0, 1]} castShadow receiveShadow>
                                <sphereGeometry args={[1.2, 8, 6]} />
                                <meshStandardMaterial
                                    color="#ffffff"
                                    transparent
                                    opacity={0.7}
                                    roughness={1}
                                    metalness={0}
                                />
                            </mesh>
                        </group>
                    </group>
                )
            })}
        </group>
    )
}

// Magical Environment
function MagicalEnvironment({ qualityLevel = 'high' }: { qualityLevel?: 'high' | 'medium' | 'low' }) {
    const starCount = qualityLevel === 'high' ? 1000 : qualityLevel === 'medium' ? 500 : 200

    return (
        <>
            {/* Sky with gradient */}
            <Sky
                distance={450000}
                sunPosition={[0, 1, 0]}
                inclination={0}
                azimuth={0.25}
            />

            {/* Custom clouds instead of drei Clouds */}
            {qualityLevel !== 'low' && (
                <CustomClouds qualityLevel={qualityLevel} />
            )}

            {/* Magical stars */}
            <Stars
                radius={100}
                depth={50}
                count={starCount}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />

            {/* Environment lighting - Using custom HDR file with fallback */}
            <EnvironmentWithFallback qualityLevel={qualityLevel} />

            {/* Ambient light */}
            <ambientLight intensity={0.4} />

            {/* Main directional light (sun) */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize-width={qualityLevel === 'high' ? 2048 : 1024}
                shadow-mapSize-height={qualityLevel === 'high' ? 2048 : 1024}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Magical colored lights */}
            {qualityLevel !== 'low' && (
                <>
                    <pointLight position={[-10, 5, -10]} color="#FF6B9D" intensity={0.5} />
                    <pointLight position={[10, 5, -10]} color="#4ECDC4" intensity={0.5} />
                    <pointLight position={[0, 10, 10]} color="#FFD93D" intensity={0.3} />
                </>
            )}
        </>
    )
}

// Enhanced Performance monitoring component
function PerformanceMonitor() {
    useThree3DPerformance({
        enableAutoOptimization: true,
        targetFPS: 30,
        maxTriangles: 50000
    })

    // Listen for quality change events
    useEffect(() => {
        const handleQualityChange = (event: CustomEvent) => {
            console.log('3D Quality adjusted:', event.detail)
        }

        window.addEventListener('3d-quality-change', handleQualityChange as EventListener)
        return () => window.removeEventListener('3d-quality-change', handleQualityChange as EventListener)
    }, [])

    return null
}

// Main 3D Scene Component
function Scene3D() {
    const [selectedTower, setSelectedTower] = useState<string | null>(null)
    const [qualityLevel, setQualityLevel] = useState<'high' | 'medium' | 'low'>('high')
    const performance = useThree3DPerformance()

    // Update quality level based on performance
    useEffect(() => {
        setQualityLevel(performance.metrics.qualityLevel)
    }, [performance.metrics.qualityLevel])

    const handleTowerClick = useCallback((tower: string) => {
        setSelectedTower(selectedTower === tower ? null : tower)
    }, [selectedTower])

    // Adaptive sparkle count based on performance
    const sparkleCount = qualityLevel === 'high' ? 50 : qualityLevel === 'medium' ? 25 : 10

    return (
        <>
            {/* Enable soft shadows for beautiful lighting */}
            {qualityLevel !== 'low' && (
                <SoftShadows
                    samples={qualityLevel === 'high' ? 25 : 10}
                    size={qualityLevel === 'high' ? 25 : 15}
                    focus={1}
                />
            )}

            <PresentationControls
                global
                cursor={true}
                snap={true}
                speed={1}
                zoom={1}
                rotation={[0, 0, 0]}
                polar={[-Math.PI / 3, Math.PI / 3]}
                azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
                <Stage environment={null}>
                    <DisneyMagicCastle onTowerClick={handleTowerClick} qualityLevel={qualityLevel} />
                </Stage>

                {/* Floating Disney Characters */}
                <FloatingCharacter position={[-8, 5, 2]} character="🐭" color="#FFD700" qualityLevel={qualityLevel} />
                <FloatingCharacter position={[8, 6, 1]} character="❄️" color="#87CEEB" qualityLevel={qualityLevel} />
                <FloatingCharacter position={[-6, 4, -8]} character="🌹" color="#FF69B4" qualityLevel={qualityLevel} />
                <FloatingCharacter position={[6, 7, -6]} character="🦄" color="#DA70D6" qualityLevel={qualityLevel} />

                {/* Magical sparkles */}
                {qualityLevel !== 'low' && (
                    <Sparkles
                        count={sparkleCount}
                        scale={[20, 15, 20]}
                        size={3}
                        speed={0.2}
                        color="#FFD700"
                    />
                )}
            </PresentationControls>

            <MagicalEnvironment qualityLevel={qualityLevel} />
            <MagicalGround qualityLevel={qualityLevel} />
            <PerformanceMonitor />
            <InteractiveInfo selectedTower={selectedTower} />

            {/* Camera controls */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={8}
                maxDistance={25}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.5}
                autoRotate={qualityLevel !== 'low'}
                autoRotateSpeed={0.5}
            />
        </>
    )
}

// Ground with magical effects
function MagicalGround({ qualityLevel = 'high' }: { qualityLevel?: 'high' | 'medium' | 'low' }) {
    const groundRef = useRef<Mesh>(null)

    useFrame((state) => {
        if (groundRef.current && qualityLevel !== 'low') {
            // Subtle ground animation
            const material = groundRef.current.material as THREE.MeshStandardMaterial
            if (material && 'emissiveIntensity' in material) {
                material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
            }
        }
    })

    return (
        <>
            {/* Main ground */}
            <Box
                ref={groundRef}
                args={[50, 0.1, 50]}
                position={[0, -0.05, 0]}
                receiveShadow
            >
                <meshStandardMaterial
                    color="#10B981"
                    roughness={0.8}
                    metalness={0.1}
                    emissive="#064E3B"
                    emissiveIntensity={0.1}
                />
            </Box>

            {/* Magical circle around castle */}
            <Cylinder args={[12, 12, 0.05, 32]} position={[0, 0.01, 0]} receiveShadow>
                <meshStandardMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.3}
                    emissive="#FFD700"
                    emissiveIntensity={0.2}
                />
            </Cylinder>

            {/* Contact shadows for depth */}
            {qualityLevel !== 'low' && (
                <ContactShadows
                    opacity={0.4}
                    scale={30}
                    blur={2}
                    far={4}
                    resolution={qualityLevel === 'high' ? 256 : 128}
                    color="#000000"
                />
            )}
        </>
    )
}

// Loading component
function LoadingFallback() {
    return (
        <Html center>
            <motion.div
                className="flex flex-col items-center justify-center text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="text-6xl mb-4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    🏰
                </motion.div>
                <p className="text-lg font-fredoka">Loading Disney Magic...</p>
                <motion.div
                    className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-4"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            </motion.div>
        </Html>
    )
}

// Interactive feedback component
function InteractiveInfo({ selectedTower }: { selectedTower: string | null }) {
    if (!selectedTower) return null

    const towerInfo = {
        main: { name: "Cinderella Castle", description: "The heart of Disney magic!" },
        left: { name: "Rapunzel's Tower", description: "Let down your hair!" },
        right: { name: "Belle's Library", description: "Tale as old as time..." },
        'back-left': { name: "Elsa's Ice Palace", description: "Let it go!" },
        'back-right': { name: "Fairy Godmother's Tower", description: "Bibbidi-bobbidi-boo!" }
    }

    const info = selectedTower && selectedTower in towerInfo
        ? towerInfo[selectedTower as keyof typeof towerInfo]
        : null

    if (!info) return null

    return (
        <Html position={[0, 8, 0]} center>
            <motion.div
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50 max-w-xs text-center"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ type: "spring", duration: 0.5 }}
            >
                <h3 className="font-bold text-purple-800 font-fredoka text-lg mb-1">
                    {info.name}
                </h3>
                <p className="text-gray-600 font-comic text-sm">
                    {info.description}
                </p>
                <div className="flex justify-center mt-2">
                    <motion.div
                        className="text-2xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        ✨
                    </motion.div>
                </div>
            </motion.div>
        </Html>
    )
}

// Main Disney World 3D Component with enhanced performance monitoring
export default function DisneyWorld3D() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [deviceCapabilities, setDeviceCapabilities] = useState<{
        isLowEnd: boolean
        pixelRatio: number
        antialias: boolean
    }>({
        isLowEnd: false,
        pixelRatio: 1,
        antialias: true
    })

    // Detect device capabilities on mount
    useEffect(() => {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        const isLowEnd = !gl ||
            (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
            ('deviceMemory' in navigator && (navigator.deviceMemory as number) <= 4)

        setDeviceCapabilities({
            isLowEnd,
            pixelRatio: isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2),
            antialias: !isLowEnd
        })
    }, [])

    // Handle errors gracefully
    const handleCreated = useCallback(() => {
        setIsLoaded(true)
        setHasError(false)
    }, [])

    const handleError = useCallback((error: Error | Event | unknown) => {
        console.error('Three.js error:', error)
        setHasError(true)
    }, [])

    return (
        <div className="w-full h-full relative">
            <ThreeErrorBoundary
                fallback={
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4">🏰</div>
                            <p className="text-lg font-fredoka">3D Disney Castle</p>
                            <p className="text-sm opacity-80 mt-2 font-comic">
                                Interactive experience temporarily unavailable
                            </p>
                        </div>
                    </div>
                }
            >
                <Canvas
                    camera={{
                        position: [15, 8, 15],
                        fov: 45,
                        near: 0.1,
                        far: 1000
                    }}
                    shadows={deviceCapabilities.isLowEnd ? false : "soft"}
                    dpr={[1, deviceCapabilities.pixelRatio]}
                    performance={{ min: 0.5 }}
                    gl={{
                        antialias: deviceCapabilities.antialias,
                        alpha: false,
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true,
                        failIfMajorPerformanceCaveat: false
                    }}
                    onCreated={handleCreated}
                    onError={handleError}
                >
                    <Suspense fallback={<LoadingFallback />}>
                        <Scene3D />
                    </Suspense>
                </Canvas>

                {/* Enhanced Instructions overlay */}
                <motion.div
                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg max-w-xs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ delay: 2 }}
                >
                    <p className="text-sm text-gray-700 font-comic">
                        🖱️ Click towers to explore<br />
                        🔄 Drag to rotate • 🔍 Scroll to zoom<br />
                        ✨ Auto-optimized for your device
                    </p>
                </motion.div>

                {/* Performance indicator */}
                <motion.div
                    className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg p-2 text-xs text-white/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ delay: 3 }}
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${deviceCapabilities.isLowEnd ? 'bg-yellow-400' : 'bg-green-400'
                            }`} />
                        {deviceCapabilities.isLowEnd ? 'Optimized Mode' : 'High Quality'}
                    </div>
                </motion.div>

                {/* Loading indicator */}
                {!isLoaded && !hasError && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/80 to-blue-900/80 backdrop-blur-sm rounded-lg"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isLoaded ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center text-white">
                            <motion.div
                                className="text-6xl mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                🏰
                            </motion.div>
                            <p className="text-lg font-fredoka">Preparing Disney Magic...</p>
                            <motion.div
                                className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mt-4 mx-auto"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                )}
            </ThreeErrorBoundary>
        </div>
    )
}