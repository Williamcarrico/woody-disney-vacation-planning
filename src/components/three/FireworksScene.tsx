'use client'

import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface FireworkParticle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  color: THREE.Color
  size: number
}

interface FireworksSceneProps {
  clickPositions: Array<{ x: number; y: number; id: number }>
}

const FireworksScene: React.FC<FireworksSceneProps> = ({ clickPositions }) => {
  const particlesRef = useRef<THREE.Points>(null)
  const fireworksRef = useRef<FireworkParticle[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { size, raycaster, camera } = useThree()

  // Optimized particle count for better performance
  const PARTICLE_COUNT = 2000
  const MAX_FIREWORKS_PARTICLES = 300

  // Create circle texture function - moved before useMemo to avoid hoisting issues
  const createCircleTexture = useCallback((): THREE.Texture => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d')!
    
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    
    context.fillStyle = gradient
    context.fillRect(0, 0, 32, 32)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  // Create particle geometry and material with optimizations
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    
    // Initialize positions, colors, and sizes
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    
    // Initialize with zero values
    positions.fill(0)
    colors.fill(0)
    sizes.fill(0)
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Enhanced material with better performance
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointTexture: { value: createCircleTexture() }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          
          // Enhanced fade effect
          float life = length(color);
          vAlpha = life > 0.0 ? smoothstep(0.0, 0.3, life) * smoothstep(1.0, 0.7, life) : 0.0;
        }
      `,
      fragmentShader: `
        uniform sampler2D pointTexture;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
          vec4 textureColor = texture2D(pointTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor, textureColor.a * vAlpha);
          
          // Add glow effect
          float center = distance(gl_PointCoord, vec2(0.5));
          float glow = 1.0 - smoothstep(0.0, 0.5, center);
          gl_FragColor.rgb += vColor * glow * 0.3;
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true
    })

    return { geometry, material }
  }, [createCircleTexture])

  // Enhanced firework creation with better physics
  const createFirework = useCallback((x: number, y: number) => {
    // Limit concurrent fireworks for performance
    if (fireworksRef.current.length > MAX_FIREWORKS_PARTICLES) {
      fireworksRef.current = fireworksRef.current.slice(-200)
    }

    const particleCount = 120 // Reduced for better performance
    const colors = [
      new THREE.Color(0xff6b6b), // Red
      new THREE.Color(0x4ecdc4), // Teal
      new THREE.Color(0x45b7d1), // Blue
      new THREE.Color(0xfeca57), // Yellow
      new THREE.Color(0xff9ff3), // Pink
      new THREE.Color(0x54a0ff), // Light Blue
      new THREE.Color(0x5f27cd), // Purple
      new THREE.Color(0x00d2d3), // Cyan
      new THREE.Color(0xff9f43), // Orange
      new THREE.Color(0x1dd1a1), // Green
    ]
    
    // Convert NDC to world coordinates more accurately
    const worldPosition = new THREE.Vector3(x * 6, y * 6, 0)
    const selectedColor = colors[Math.floor(Math.random() * colors.length)]
    
    // Create launch effect first
    const launchParticle: FireworkParticle = {
      position: new THREE.Vector3(x * 6, -6, 0),
      velocity: new THREE.Vector3(0, 12, 0),
      life: 0,
      maxLife: 0.8,
      color: selectedColor.clone(),
      size: 8
    }
    fireworksRef.current.push(launchParticle)
    
    // Delayed explosion
    setTimeout(() => {
      for (let i = 0; i < particleCount; i++) {
        const phi = Math.random() * Math.PI * 2
        const theta = Math.random() * Math.PI
        const speed = 3 + Math.random() * 4
        
        const velocity = new THREE.Vector3(
          Math.sin(theta) * Math.cos(phi) * speed,
          Math.sin(theta) * Math.sin(phi) * speed,
          Math.cos(theta) * speed
        )
        
        // Add randomness and ensure upward bias
        velocity.x += (Math.random() - 0.5) * 2
        velocity.y += Math.abs(Math.random() - 0.5) * 2
        velocity.z += (Math.random() - 0.5) * 2
        
        const particle: FireworkParticle = {
          position: worldPosition.clone(),
          velocity,
          life: 0,
          maxLife: 1.5 + Math.random() * 1.5,
          color: selectedColor.clone(),
          size: 12 + Math.random() * 18
        }
        
        // Enhanced color variation
        particle.color.offsetHSL(
          (Math.random() - 0.5) * 0.4, // Hue variation
          (Math.random() - 0.5) * 0.3, // Saturation variation
          (Math.random() - 0.5) * 0.3  // Lightness variation
        )
        
        fireworksRef.current.push(particle)
      }
    }, 800) // Delay for launch effect
  }, [])

  // Handle new click positions with proper dependency
  useEffect(() => {
    if (clickPositions.length === 0) return
    
    const latestClick = clickPositions[clickPositions.length - 1]
    createFirework(latestClick.x, latestClick.y)
  }, [clickPositions, createFirework])

  // Optimized animation loop
  useFrame((state, delta) => {
    if (!particlesRef.current || !geometry || !isInitialized) return

    const positions = geometry.attributes.position.array as Float32Array
    const colors = geometry.attributes.color.array as Float32Array
    const sizes = geometry.attributes.size.array as Float32Array
    
    // Update material time uniform
    if (material.uniforms.time) {
      material.uniforms.time.value = state.clock.elapsedTime
    }
    
    let activeParticles = 0
    
    // Update all particles with enhanced physics
    fireworksRef.current = fireworksRef.current.filter(particle => {
      particle.life += delta
      
      if (particle.life > particle.maxLife) {
        return false // Remove dead particles
      }
      
      // Enhanced physics simulation
      particle.velocity.y -= 12 * delta // Stronger gravity
      particle.velocity.multiplyScalar(0.995) // Air resistance
      
      // Add some turbulence for more realistic movement
      if (particle.life > 0.5) {
        particle.velocity.x += (Math.random() - 0.5) * 0.1
        particle.velocity.z += (Math.random() - 0.5) * 0.1
      }
      
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      )
      
      // Enhanced fade calculation
      const lifeFactor = 1 - (particle.life / particle.maxLife)
      const alpha = Math.pow(lifeFactor, 1.5)
      
      // Update geometry arrays if space available
      if (activeParticles < positions.length / 3) {
        const index = activeParticles * 3
        
        positions[index] = particle.position.x
        positions[index + 1] = particle.position.y
        positions[index + 2] = particle.position.z
        
        colors[index] = particle.color.r * alpha
        colors[index + 1] = particle.color.g * alpha
        colors[index + 2] = particle.color.b * alpha
        
        sizes[activeParticles] = particle.size * lifeFactor
        
        activeParticles++
      }
      
      return true
    })
    
    // Clear unused particles efficiently
    const clearStart = activeParticles * 3
    const clearEnd = positions.length
    if (clearStart < clearEnd) {
      positions.fill(0, clearStart, clearEnd)
      colors.fill(0, clearStart, clearEnd)
      sizes.fill(0, activeParticles, sizes.length)
    }
    
    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.color.needsUpdate = true
    geometry.attributes.size.needsUpdate = true
  })

  // Initialize component
  useEffect(() => {
    setIsInitialized(true)
    return () => {
      // Cleanup
      fireworksRef.current = []
      setIsInitialized(false)
    }
  }, [])

  if (!isInitialized) {
    return null
  }

  return (
    <>
      {/* Enhanced ambient lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Starry background */}
      <StarField />
      
      {/* Fireworks particles */}
      <points ref={particlesRef} geometry={geometry} material={material} />
    </>
  )
}

// Astronomically Accurate Night Sky Component
const StarField: React.FC = () => {
  return (
    <group>
      {/* Main star field with realistic distribution */}
      <RealisticStars />
      
      {/* Milky Way galaxy band */}
      <MilkyWay />
      
      {/* Bright constellations and notable stars */}
      <BrightStars />
      
      {/* Subtle nebulae */}
      <Nebulae />
      
      {/* Atmospheric horizon glow */}
      <AtmosphericHorizon />
    </group>
  )
}

// Realistic star distribution based on stellar magnitude and classification
const RealisticStars: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null)
  const twinkleRef = useRef<Float32Array>()
  
  // Stellar classification system with realistic colors and frequencies
  const stellarTypes = [
    { type: 'M', color: [1.0, 0.5, 0.3], temp: 3500, frequency: 0.76, size: 0.8 }, // Red dwarfs
    { type: 'K', color: [1.0, 0.7, 0.4], temp: 4500, frequency: 0.12, size: 1.0 }, // Orange dwarfs
    { type: 'G', color: [1.0, 1.0, 0.8], temp: 5800, frequency: 0.076, size: 1.2 }, // Yellow (Sun-like)
    { type: 'F', color: [1.0, 1.0, 1.0], temp: 6500, frequency: 0.03, size: 1.4 }, // White
    { type: 'A', color: [0.9, 0.9, 1.0], temp: 8500, frequency: 0.006, size: 1.8 }, // Blue-white
    { type: 'B', color: [0.7, 0.8, 1.0], temp: 15000, frequency: 0.0013, size: 2.5 }, // Blue
    { type: 'O', color: [0.6, 0.7, 1.0], temp: 35000, frequency: 0.00003, size: 3.5 } // Blue giants
  ]
  
  const { geometry, material } = useMemo(() => {
    const starCount = 2500 // Increased for realistic density
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    const twinkle = new Float32Array(starCount)
    const phases = new Float32Array(starCount)
    
    let starIndex = 0
    
    // Generate stars with realistic magnitude distribution (brighter stars are rarer)
    for (let mag = 1; mag <= 6; mag++) {
      const starsInMagnitude = Math.floor(Math.pow(2.5, mag) * 8) // Pogson's ratio
      
      for (let i = 0; i < starsInMagnitude && starIndex < starCount; i++) {
        // Spherical distribution with realistic galactic concentration
        const phi = Math.random() * Math.PI * 2
        const theta = Math.acos(1 - 2 * Math.random())
        
        // Add galactic plane concentration (more stars toward galactic center)
        const galacticBias = Math.abs(Math.sin(theta)) < 0.3 ? 2.0 : 1.0
        if (Math.random() > (1.0 / galacticBias)) continue
        
        const radius = 50 + Math.random() * 100 // Varying distances
        
        const x = radius * Math.sin(theta) * Math.cos(phi)
        const y = radius * Math.sin(theta) * Math.sin(phi) * 0.7 // Flatten slightly
        const z = radius * Math.cos(theta)
        
        positions[starIndex * 3] = x
        positions[starIndex * 3 + 1] = y
        positions[starIndex * 3 + 2] = z
        
        // Select stellar type based on frequency
        let selectedType = stellarTypes[0] // Default to M-class
        const random = Math.random()
        let cumulativeFreq = 0
        
        for (const type of stellarTypes) {
          cumulativeFreq += type.frequency
          if (random <= cumulativeFreq) {
            selectedType = type
            break
          }
        }
        
        // Set star color with slight variation
        const colorVariation = 0.1
        const r = Math.min(1.0, selectedType.color[0] + (Math.random() - 0.5) * colorVariation)
        const g = Math.min(1.0, selectedType.color[1] + (Math.random() - 0.5) * colorVariation)
        const b = Math.min(1.0, selectedType.color[2] + (Math.random() - 0.5) * colorVariation)
        
        // Brightness based on magnitude and stellar type
        const brightness = Math.pow(2.5, -(mag - 1)) * (0.8 + Math.random() * 0.4)
        
        colors[starIndex * 3] = r * brightness
        colors[starIndex * 3 + 1] = g * brightness
        colors[starIndex * 3 + 2] = b * brightness
        
        // Size based on magnitude and stellar classification
        const baseSizeForMagnitude = Math.max(0.5, 4.0 - mag * 0.5)
        sizes[starIndex] = baseSizeForMagnitude * selectedType.size * (0.8 + Math.random() * 0.4)
        
        // Twinkling parameters
        twinkle[starIndex] = 0.3 + Math.random() * 0.7 // Intensity
        phases[starIndex] = Math.random() * Math.PI * 2 // Phase offset
        
        starIndex++
      }
    }
    
    // Store twinkle data for animation
    twinkleRef.current = twinkle
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkle, 1))
    geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1))
    
    // Enhanced star shader with twinkling
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        atmosphericTurbulence: { value: 0.8 }
      },
      vertexShader: `
        attribute float size;
        attribute float twinkle;
        attribute float phase;
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vPhase;
        uniform float time;
        uniform float atmosphericTurbulence;
        
        void main() {
          vColor = color;
          vTwinkle = twinkle;
          vPhase = phase;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Atmospheric scintillation (twinkling)
          float twinkleEffect = 1.0 + sin(time * 3.0 + phase) * twinkle * atmosphericTurbulence * 0.3;
          float sizeTwinkle = 1.0 + sin(time * 5.0 + phase * 1.5) * twinkle * 0.1;
          
          gl_PointSize = size * twinkleEffect * sizeTwinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vTwinkle;
        varying float vPhase;
        uniform float time;
        
        void main() {
          // Create star disk with soft edges
          float center = distance(gl_PointCoord, vec2(0.5));
          float star = 1.0 - smoothstep(0.0, 0.5, center);
          
          // Add spikes for brighter stars
          vec2 spikeCoord = gl_PointCoord - 0.5;
          float spikes = 0.0;
          
          // Four-pointed star pattern for bright stars
          float brightness = length(vColor);
          if (brightness > 0.7) {
            float angle = atan(spikeCoord.y, spikeCoord.x);
            float spike1 = abs(cos(angle * 2.0)) * exp(-length(spikeCoord) * 8.0);
            float spike2 = abs(sin(angle * 2.0)) * exp(-length(spikeCoord) * 8.0);
            spikes = max(spike1, spike2) * 0.5;
          }
          
          // Atmospheric twinkling color shift
          vec3 finalColor = vColor;
          float colorShift = sin(time * 4.0 + vPhase) * vTwinkle * 0.1;
          finalColor.b += colorShift;
          finalColor.r -= colorShift * 0.5;
          
          float alpha = star + spikes;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      vertexColors: true
    })
    
    return { geometry, material }
  }, [])
  
  useFrame((state) => {
    if (starsRef.current && material.uniforms) {
      // Update time for twinkling
      material.uniforms.time.value = state.clock.elapsedTime
      
      // Slow celestial rotation (like Earth's rotation)
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005
      starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.001) * 0.05
      
      // Subtle atmospheric turbulence variation
      material.uniforms.atmosphericTurbulence.value = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })
  
  return <points ref={starsRef} geometry={geometry} material={material} />
}

// Bright stars and constellation markers
const BrightStars: React.FC = () => {
  const brightStarsRef = useRef<THREE.Points>(null)
  
  // Notable bright stars with approximate positions and colors
  const brightStars = [
    { name: 'Sirius', pos: [25, -8, 45], color: [0.7, 0.8, 1.0], size: 8 },
    { name: 'Canopus', pos: [-30, -25, 40], color: [1.0, 1.0, 0.9], size: 6 },
    { name: 'Rigel', pos: [20, 15, 35], color: [0.6, 0.7, 1.0], size: 7 },
    { name: 'Procyon', pos: [15, 8, 42], color: [1.0, 1.0, 0.8], size: 5 },
    { name: 'Betelgeuse', pos: [18, 12, 38], color: [1.0, 0.4, 0.2], size: 9 }, // Red supergiant
    { name: 'Capella', pos: [10, 35, 30], color: [1.0, 1.0, 0.7], size: 6 },
    { name: 'Vega', pos: [-5, 45, 25], color: [0.9, 0.9, 1.0], size: 7 },
    { name: 'Altair', pos: [-8, 25, 35], color: [1.0, 1.0, 1.0], size: 5 },
    { name: 'Aldebaran', pos: [22, 18, 40], color: [1.0, 0.6, 0.4], size: 6 },
    { name: 'Antares', pos: [-15, -15, 45], color: [1.0, 0.3, 0.1], size: 8 } // Red supergiant
  ]
  
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(brightStars.length * 3)
    const colors = new Float32Array(brightStars.length * 3)
    const sizes = new Float32Array(brightStars.length)
    
    brightStars.forEach((star, i) => {
      positions[i * 3] = star.pos[0]
      positions[i * 3 + 1] = star.pos[1]
      positions[i * 3 + 2] = star.pos[2]
      
      colors[i * 3] = star.color[0]
      colors[i * 3 + 1] = star.color[1]
      colors[i * 3 + 2] = star.color[2]
      
      sizes[i] = star.size
    })
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Dramatic twinkling for bright stars
          float twinkle = 1.0 + sin(time * 2.0 + position.x) * 0.4;
          
          gl_PointSize = size * twinkle * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float radius = length(center);
          
          // Bright star core
          float core = 1.0 - smoothstep(0.0, 0.2, radius);
          
          // Diffraction spikes
          float angle = atan(center.y, center.x);
          float spike1 = abs(cos(angle * 2.0)) * exp(-radius * 6.0);
          float spike2 = abs(sin(angle * 2.0)) * exp(-radius * 6.0);
          float crossSpike1 = abs(cos(angle * 4.0 + 0.785)) * exp(-radius * 10.0);
          float crossSpike2 = abs(sin(angle * 4.0 + 0.785)) * exp(-radius * 10.0);
          
          float spikes = max(max(spike1, spike2), max(crossSpike1, crossSpike2)) * 0.8;
          
          // Bright halo
          float halo = exp(-radius * 3.0) * 0.3;
          
          float intensity = core + spikes + halo;
          gl_FragColor = vec4(vColor * intensity, intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      vertexColors: true
    })
    
    return { geometry, material }
  }, [])
  
  useFrame((state) => {
    if (brightStarsRef.current && material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
      
      // Same rotation as main star field
      brightStarsRef.current.rotation.y = state.clock.elapsedTime * 0.005
      brightStarsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.001) * 0.05
    }
  })
  
  return <points ref={brightStarsRef} geometry={geometry} material={material} />
}

// Milky Way galaxy visualization
const MilkyWay: React.FC = () => {
  const milkyWayRef = useRef<THREE.Points>(null)
  
  const { geometry, material } = useMemo(() => {
    const starCount = 3000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    
    let validStars = 0
    
    for (let i = 0; i < starCount && validStars < starCount; i++) {
      // Create galaxy band across the sky
      const angle = (Math.random() - 0.5) * Math.PI * 2
      const height = (Math.random() - 0.5) * 15 // Thin galactic plane
      const distance = 80 + Math.random() * 40
      
      // Gaussian distribution for galactic center concentration
      const concentration = Math.exp(-Math.abs(height) / 3) * Math.exp(-Math.abs(angle) / 1.5)
      if (Math.random() > concentration) continue
      
      positions[validStars * 3] = Math.cos(angle) * distance
      positions[validStars * 3 + 1] = height
      positions[validStars * 3 + 2] = Math.sin(angle) * distance
      
      // Dusty, warm colors for galactic stars
      const dustiness = Math.random() * 0.3
      colors[validStars * 3] = 1.0 - dustiness * 0.2
      colors[validStars * 3 + 1] = 0.9 - dustiness * 0.3
      colors[validStars * 3 + 2] = 0.7 - dustiness * 0.4
      
      sizes[validStars] = 0.5 + Math.random() * 1.5
      validStars++
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const material = new THREE.PointsMaterial({
      size: 1.0,
      transparent: true,
      opacity: 0.6,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    })
    
    return { geometry, material }
  }, [])
  
  useFrame((state) => {
    if (milkyWayRef.current) {
      milkyWayRef.current.rotation.y = state.clock.elapsedTime * 0.005
      milkyWayRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.001) * 0.05
    }
  })
  
  return <points ref={milkyWayRef} geometry={geometry} material={material} />
}

// Subtle nebulae effects
const Nebulae: React.FC = () => {
  const nebulaeRef = useRef<THREE.Group>(null)
  
  return (
    <group ref={nebulaeRef}>
      {/* Orion Nebula */}
      <NebulaCloud 
        position={[18, 12, 35]} 
        color={[1.0, 0.3, 0.6]} 
        size={3} 
        density={200}
      />
      
      {/* Eagle Nebula */}
      <NebulaCloud 
        position={[-12, 8, 42]} 
        color={[0.8, 0.9, 0.4]} 
        size={2.5} 
        density={150}
      />
      
      {/* Rosette Nebula */}
      <NebulaCloud 
        position={[25, -5, 38]} 
        color={[1.0, 0.2, 0.3]} 
        size={2} 
        density={120}
      />
    </group>
  )
}

// Individual nebula cloud component
const NebulaCloud: React.FC<{
  position: [number, number, number]
  color: [number, number, number]
  size: number
  density: number
}> = ({ position, color, size, density }) => {
  const cloudRef = useRef<THREE.Points>(null)
  
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(density * 3)
    const colors = new Float32Array(density * 3)
    const sizes = new Float32Array(density)
    
    for (let i = 0; i < density; i++) {
      // Gaussian distribution for cloud shape
      const radius = Math.random() * size
      const phi = Math.random() * Math.PI * 2
      const theta = Math.acos(1 - 2 * Math.random())
      
      const x = radius * Math.sin(theta) * Math.cos(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(theta)
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Color variation with distance from center
      const distance = Math.sqrt(x*x + y*y + z*z)
      const intensity = Math.exp(-distance / size) * (0.1 + Math.random() * 0.2)
      
      colors[i * 3] = color[0] * intensity
      colors[i * 3 + 1] = color[1] * intensity
      colors[i * 3 + 2] = color[2] * intensity
      
      sizes[i] = 2 + Math.random() * 4
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const material = new THREE.PointsMaterial({
      transparent: true,
      opacity: 0.3,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthTest: false
    })
    
    return { geometry, material }
  }, [color, size, density])
  
  useFrame((state) => {
    if (cloudRef.current) {
      // Subtle nebula motion
      cloudRef.current.rotation.y = state.clock.elapsedTime * 0.001
      cloudRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.0008) * 0.02
    }
  })
  
  return (
    <points 
      ref={cloudRef} 
      geometry={geometry} 
      material={material}
      position={position}
    />
  )
}

// Atmospheric horizon glow
const AtmosphericHorizon: React.FC = () => {
  const horizonRef = useRef<THREE.Mesh>(null)
  
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.SphereGeometry(120, 64, 32)
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vWorldPosition;
        uniform float time;
        
        void main() {
          float height = normalize(vWorldPosition).y;
          
          // Atmospheric glow near horizon
          float horizonGlow = 1.0 - abs(height);
          horizonGlow = pow(horizonGlow, 8.0) * 0.05;
          
          // Subtle color variation
          vec3 color = vec3(0.1, 0.05, 0.2) + vec3(0.05, 0.02, 0.0) * sin(time * 0.5);
          
          gl_FragColor = vec4(color, horizonGlow);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthTest: false
    })
    
    return { geometry, material }
  }, [])
  
  useFrame((state) => {
    if (horizonRef.current && material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
    }
  })
  
  return <mesh ref={horizonRef} geometry={geometry} material={material} />
}

export default FireworksScene 