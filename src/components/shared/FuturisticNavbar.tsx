'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
    Menu, X, LogIn, MoonStar, Sun, ChevronDown, Home, Map, Calendar,
    Utensils, DollarSign, Lightbulb, Users, Sparkles, Search, Command,
    Mic, Bell, Zap, TrendingUp, Clock, Star, Compass, Globe, Activity,
    Brain, Rocket, Shield, Layers,
    BarChart3, Headphones, Camera, Gift, Award, Cloud
} from 'lucide-react'
import { APP_NAME } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import confetti from 'canvas-confetti'
import { useDebounce } from '@/hooks/use-debounce'

// Types
interface NavItem {
    name: string
    href: string
    icon: React.ReactNode
    description?: string
    badge?: string
    trending?: boolean
    beta?: boolean
    new?: boolean
}

interface DropdownMenu {
    title: string
    icon: React.ReactNode
    items: NavItem[]
}

interface CommandItem {
    icon: React.ReactNode
    label: string
    action: string
    category: string
    shortcut?: string
}

// Advanced 3D Logo Component with Particle Effects
function Logo3D() {
    const meshRef = useRef<THREE.Mesh>(null)
    const particlesRef = useRef<THREE.Points>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1
            meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime) * 0.1
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })

    const particlesGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry()
        const vertices = []

        for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 1.5 + Math.random() * 0.5
            vertices.push(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 2,
                Math.sin(angle) * radius
            )
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        return geometry
    }, [])

    return (
        <group>
            <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh ref={meshRef} scale={[0.5, 0.5, 0.5]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshDistortMaterial
                        color="#8b5cf6"
                        attach="material"
                        distort={0.3}
                        speed={2}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
            </Float>
            <points ref={particlesRef} geometry={particlesGeometry}>
                <pointsMaterial
                    color="#e879f9"
                    size={0.02}
                    transparent
                    opacity={0.6}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </group>
    )
}

// Holographic Navigation Item Component
function HolographicNavItem({
    href,
    icon,
    name,
    badge,
    isActive,
    onClick,
    description,
    trending,
    beta,
    isNew
}: NavItem & { isActive: boolean; onClick?: () => void; isNew?: boolean }) {
    const [isHovered, setIsHovered] = useState(false)
    const glowRef = useRef<HTMLDivElement>(null)

    return (
        <Link
            href={href}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative group"
        >
            <motion.div
                className={cn(
                    "relative px-4 py-2.5 rounded-xl transition-all duration-300",
                    "backdrop-blur-xl bg-white/5 dark:bg-black/5",
                    "border border-white/10 dark:border-white/5",
                    isActive && "bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20",
                    "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
                    "overflow-hidden"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Animated gradient background */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    animate={{
                        background: isHovered ? [
                            'linear-gradient(45deg, transparent 0%, rgba(139,92,246,0.1) 50%, transparent 100%)',
                            'linear-gradient(45deg, transparent 0%, rgba(59,130,246,0.1) 50%, transparent 100%)',
                            'linear-gradient(45deg, transparent 0%, rgba(236,72,153,0.1) 50%, transparent 100%)',
                        ] : 'transparent'
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Holographic shimmer */}
                <motion.div
                    ref={glowRef}
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 40%, transparent 60%)',
                        backgroundSize: '200% 200%',
                    }}
                    animate={{
                        backgroundPosition: isHovered ? ['0% 0%', '200% 200%'] : '0% 0%',
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Active state glow */}
                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(139,92,246,0.5)',
                                '0 0 40px rgba(139,92,246,0.8)',
                                '0 0 20px rgba(139,92,246,0.5)',
                            ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center gap-2">
                    <motion.div
                        animate={{
                            rotate: isHovered ? 360 : 0,
                            scale: isHovered ? 1.1 : 1
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        {icon}
                    </motion.div>
                    <span className="font-medium">{name}</span>

                    {/* Badges and indicators */}
                    {badge && (
                        <Badge
                            variant="secondary"
                            className="ml-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                        >
                            {badge}
                        </Badge>
                    )}
                    {trending && (
                        <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <TrendingUp className="w-3 h-3 text-green-400" />
                        </motion.div>
                    )}
                    {beta && (
                        <Badge variant="outline" className="ml-1 text-xs border-blue-500 text-blue-400">
                            BETA
                        </Badge>
                    )}
                    {isNew && (
                        <motion.span
                            className="ml-1 text-xs text-yellow-400"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            NEW
                        </motion.span>
                    )}
                </div>

                {/* Tooltip */}
                {description && isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full mt-2 left-0 right-0 p-3 bg-black/90 backdrop-blur-xl rounded-lg text-xs text-gray-300 whitespace-nowrap z-50 border border-purple-500/20"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            {description}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </Link>
    )
}

// AI-Powered Command Palette with Voice Support
function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [search, setSearch] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isListening, setIsListening] = useState(false)
    const debouncedSearch = useDebounce(search, 300)

    const commands: CommandItem[] = useMemo(() => [
        { icon: <Home className="w-4 h-4" />, label: 'Home', action: '/', category: 'Navigation', shortcut: '⌘H' },
        { icon: <Map className="w-4 h-4" />, label: 'Interactive Map', action: '/map', category: 'Navigation', shortcut: '⌘M' },
        { icon: <Brain className="w-4 h-4" />, label: 'AI Trip Planner', action: '/dashboard/ai-planner', category: 'AI Features', shortcut: '⌘P' },
        { icon: <Rocket className="w-4 h-4" />, label: 'Quick Actions', action: 'quick-actions', category: 'Tools' },
        { icon: <Activity className="w-4 h-4" />, label: 'Real-time Wait Times', action: '/dashboard/parks/live', category: 'Live Data' },
        { icon: <Calendar className="w-4 h-4" />, label: 'My Itinerary', action: '/dashboard/itinerary', category: 'Planning' },
        { icon: <Utensils className="w-4 h-4" />, label: 'Dining Reservations', action: '/dashboard/dining', category: 'Experiences' },
        { icon: <Star className="w-4 h-4" />, label: 'Favorites', action: '/dashboard/favorites', category: 'Personal' },
        { icon: <Shield className="w-4 h-4" />, label: 'Safety Guidelines', action: '/safety', category: 'Information' },
        { icon: <Headphones className="w-4 h-4" />, label: 'Contact Support', action: '/contact', category: 'Help' },
    ], [])

    const filteredCommands = useMemo(() => {
        if (!debouncedSearch) return commands
        return commands.filter(cmd =>
            cmd.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            cmd.category.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
    }, [commands, debouncedSearch])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
                    break
                case 'Enter':
                    e.preventDefault()
                    const selected = filteredCommands[selectedIndex]
                    if (selected?.action.startsWith('/')) {
                        window.location.href = selected.action
                    }
                    onClose()
                    break
                case 'Escape':
                    e.preventDefault()
                    onClose()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, selectedIndex, filteredCommands, onClose])

    // Voice recognition mock
    const toggleVoiceRecognition = () => {
        setIsListening(!isListening)
        if (!isListening) {
            // Mock voice recognition
            setTimeout(() => {
                setSearch('AI Trip Planner')
                setIsListening(false)
            }, 2000)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 z-50 overflow-hidden"
                    >
                        {/* Search Header */}
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center gap-3">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search for anything..."
                                    className="flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
                                    autoFocus
                                />
                                <motion.button
                                    onClick={toggleVoiceRecognition}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isListening ? "bg-red-500/20 text-red-400" : "hover:bg-gray-800 text-gray-400"
                                    )}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Mic className={cn("w-4 h-4", isListening && "animate-pulse")} />
                                </motion.button>
                                <kbd className="px-2 py-1 text-xs bg-gray-800 rounded">ESC</kbd>
                            </div>

                            {/* Voice indicator */}
                            {isListening && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-2 flex items-center gap-2 text-xs text-red-400"
                                >
                                    <div className="flex gap-1">
                                        {[...Array(3)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="w-1 h-3 bg-red-400 rounded-full"
                                                animate={{ scaleY: [1, 1.5, 1] }}
                                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                            />
                                        ))}
                                    </div>
                                    Listening...
                                </motion.div>
                            )}
                        </div>

                        {/* Command List */}
                        <div className="max-h-96 overflow-y-auto p-2">
                            {filteredCommands.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Compass className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No results found</p>
                                    <p className="text-sm mt-1">Try a different search term</p>
                                </div>
                            ) : (
                                filteredCommands.map((cmd, index) => (
                                    <motion.button
                                        key={`${cmd.label}-${index}`}
                                        onClick={() => {
                                            if (cmd.action.startsWith('/')) {
                                                window.location.href = cmd.action
                                            }
                                            onClose()
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                                            selectedIndex === index
                                                ? "bg-purple-500/20 text-white shadow-lg shadow-purple-500/10"
                                                : "hover:bg-gray-800 text-gray-300"
                                        )}
                                        whileHover={{ x: 5 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            selectedIndex === index ? "bg-purple-500/20" : "bg-gray-800"
                                        )}>
                                            {cmd.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-medium">{cmd.label}</div>
                                            <div className="text-xs text-gray-500">{cmd.category}</div>
                                        </div>
                                        {cmd.shortcut && (
                                            <kbd className="px-2 py-1 text-xs bg-gray-800 rounded">
                                                {cmd.shortcut}
                                            </kbd>
                                        )}
                                    </motion.button>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-700 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↑↓</kbd> Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">↵</kbd> Select
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Brain className="w-3 h-3" />
                                AI-Powered Search
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Notification Panel
function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const notifications = [
        { id: 1, title: 'Space Mountain reopened!', time: '5 min ago', icon: <Rocket className="w-4 h-4" /> },
        { id: 2, title: 'Your dining reservation is in 1 hour', time: '30 min ago', icon: <Utensils className="w-4 h-4" /> },
        { id: 3, title: 'New parade starting at 3 PM', time: '1 hour ago', icon: <Star className="w-4 h-4" /> },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full mt-2 right-0 w-80 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notif, index) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                            {notif.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">{notif.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-gray-700">
                            <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

// Main Navbar Component
export default function FuturisticNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
    const [isCommandOpen, setIsCommandOpen] = useState(false)
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const [notifications] = useState(3)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const pathname = usePathname()

    // Motion values for advanced animations
    const { scrollY } = useScroll()
    const navY = useTransform(scrollY, [0, 100], [0, -10])
    const navOpacity = useTransform(scrollY, [0, 100], [1, 0.98])
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const mouseXSpring = useSpring(mouseX, { stiffness: 500, damping: 100 })
    const mouseYSpring = useSpring(mouseY, { stiffness: 500, damping: 100 })

    // Track mouse movement for interactive effects
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandOpen(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Theme detection and management
    useEffect(() => {
        const checkDarkMode = () => {
            const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches
            const savedTheme = localStorage.getItem('theme')

            if (savedTheme === 'dark' || (!savedTheme && darkModePreference)) {
                document.documentElement.classList.add('dark')
                setIsDarkMode(true)
            } else {
                document.documentElement.classList.remove('dark')
                setIsDarkMode(false)
            }
        }

        checkDarkMode()

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', checkDarkMode)

        return () => mediaQuery.removeEventListener('change', checkDarkMode)
    }, [])

    const toggleDarkMode = () => {
        const newMode = !isDarkMode
        if (newMode) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
        setIsDarkMode(newMode)

        // Celebration effect
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.3 },
            colors: newMode ? ['#8b5cf6', '#3b82f6', '#ec4899'] : ['#fbbf24', '#fb923c', '#f87171']
        })
    }

    // Navigation structure
    const dropdownMenus: Record<string, DropdownMenu> = {
        planning: {
            title: 'Planning',
            icon: <Calendar className="h-4 w-4" />,
            items: [
                {
                    name: 'AI Trip Planner',
                    href: '/dashboard/ai-planner',
                    icon: <Brain className="h-4 w-4" />,
                    description: 'Let AI plan your perfect day',
                    beta: true
                },
                {
                    name: 'Itinerary Optimizer',
                    href: '/dashboard/optimizer',
                    icon: <Sparkles className="h-4 w-4" />,
                    description: 'Optimize your park route',
                    trending: true
                },
                {
                    name: 'Group Planning',
                    href: '/dashboard/group',
                    icon: <Users className="h-4 w-4" />,
                    description: 'Plan with friends & family'
                },
                {
                    name: 'Budget Calculator',
                    href: '/budget',
                    icon: <DollarSign className="h-4 w-4" />,
                    description: 'Track your vacation budget'
                },
                {
                    name: 'Tips & Tricks',
                    href: '/tips-tricks',
                    icon: <Lightbulb className="h-4 w-4" />,
                    description: 'Insider tips from experts'
                },
            ]
        },
        destinations: {
            title: 'Destinations',
            icon: <Map className="h-4 w-4" />,
            items: [
                {
                    name: 'Live Wait Times',
                    href: '/dashboard/parks/live',
                    icon: <Activity className="h-4 w-4" />,
                    description: 'Real-time attraction waits',
                    badge: 'LIVE'
                },
                {
                    name: 'Interactive Map',
                    href: '/map',
                    icon: <Globe className="h-4 w-4" />,
                    description: '3D park exploration',
                    trending: true
                },
                {
                    name: 'Virtual Queue',
                    href: '/dashboard/virtual-queue',
                    icon: <Clock className="h-4 w-4" />,
                    description: 'Join queues remotely',
                    new: true
                },
                {
                    name: 'Hidden Gems',
                    href: '/dashboard/hidden-gems',
                    icon: <Compass className="h-4 w-4" />,
                    description: 'Discover secret spots'
                },
            ]
        },
        experiences: {
            title: 'Experiences',
            icon: <Sparkles className="h-4 w-4" />,
            items: [
                {
                    name: 'Dining Reservations',
                    href: '/dashboard/dining',
                    icon: <Utensils className="h-4 w-4" />,
                    description: 'Book restaurants',
                    badge: 'NEW'
                },
                {
                    name: 'Special Events',
                    href: '/dashboard/events',
                    icon: <Star className="h-4 w-4" />,
                    description: 'Exclusive experiences'
                },
                {
                    name: 'PhotoPass+',
                    href: '/dashboard/photopass',
                    icon: <Camera className="h-4 w-4" />,
                    description: 'Capture memories',
                    beta: true
                },
                {
                    name: 'Gift Shop',
                    href: '/dashboard/shop',
                    icon: <Gift className="h-4 w-4" />,
                    description: 'Exclusive merchandise',
                    new: true
                },
            ]
        },
        insights: {
            title: 'Insights',
            icon: <BarChart3 className="h-4 w-4" />,
            items: [
                {
                    name: 'Analytics Dashboard',
                    href: '/dashboard/analytics',
                    icon: <BarChart3 className="h-4 w-4" />,
                    description: 'Park trends & insights',
                    beta: true
                },
                {
                    name: 'Crowd Calendar',
                    href: '/dashboard/crowd-calendar',
                    icon: <Calendar className="h-4 w-4" />,
                    description: 'Predict busy days'
                },
                {
                    name: 'Weather Forecast',
                    href: '/dashboard/weather',
                    icon: <Cloud className="h-4 w-4" />,
                    description: '10-day forecast'
                },
                {
                    name: 'Achievement Tracker',
                    href: '/dashboard/achievements',
                    icon: <Award className="h-4 w-4" />,
                    description: 'Your park milestones',
                    new: true
                },
            ]
        }
    }

    const standaloneNavLinks: NavItem[] = [
        { name: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
        { name: 'Dashboard', href: '/dashboard', icon: <Layers className="h-4 w-4" /> },
        { name: 'Explore', href: '/explore', icon: <Compass className="h-4 w-4" />, new: true },
    ]

    const handleDropdownHover = (key: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setHoveredDropdown(key)
    }

    const handleDropdownLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setHoveredDropdown(null)
        }, 300)
    }

    return (
        <>
            <motion.nav
                style={{ y: navY, opacity: navOpacity }}
                className={cn(
                    "fixed top-0 left-0 w-full z-50 transition-all duration-500",
                    isScrolled
                        ? "bg-gray-900/80 dark:bg-black/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                        : "bg-transparent"
                )}
            >
                {/* Animated background gradient that follows mouse */}
                <motion.div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${mouseXSpring}px ${mouseYSpring}px, rgba(139,92,246,0.3), transparent 50%)`,
                    }}
                />

                {/* Animated border */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{
                        opacity: isScrolled ? 1 : 0,
                        scaleX: isScrolled ? 1 : 0.5
                    }}
                    transition={{ duration: 0.3 }}
                />

                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* 3D Logo */}
                        <Link href="/" className="relative group">
                            <motion.div
                                className="relative w-16 h-16"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                                <div className="relative w-full h-full">
                                    <Canvas camera={{ position: [0, 0, 2] }}>
                                        <ambientLight intensity={0.5} />
                                        <pointLight position={[10, 10, 10]} />
                                        <Logo3D />
                                        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                                    </Canvas>
                                </div>
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    {APP_NAME}
                                </span>
                            </motion.div>
                        </Link>

                        {/* Main Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {/* Standalone Links */}
                            {standaloneNavLinks.map((link) => (
                                <HolographicNavItem
                                    key={link.name}
                                    {...link}
                                    isActive={pathname === link.href}
                                />
                            ))}

                            {/* Dropdown Menus */}
                            {Object.entries(dropdownMenus).map(([key, dropdown]) => (
                                <div
                                    key={key}
                                    className="relative"
                                    onMouseEnter={() => handleDropdownHover(key)}
                                    onMouseLeave={handleDropdownLeave}
                                >
                                    <motion.button
                                        className={cn(
                                            "relative px-4 py-2.5 rounded-xl transition-all duration-300",
                                            "backdrop-blur-xl bg-white/5 dark:bg-black/5",
                                            "border border-white/10 dark:border-white/5",
                                            "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
                                            "flex items-center gap-2 group"
                                        )}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {dropdown.icon}
                                        <span className="font-medium">{dropdown.title}</span>
                                        <ChevronDown
                                            className={cn(
                                                "h-3.5 w-3.5 transition-transform duration-300",
                                                hoveredDropdown === key && "rotate-180"
                                            )}
                                        />
                                    </motion.button>

                                    <AnimatePresence>
                                        {hoveredDropdown === key && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ type: "spring", damping: 20 }}
                                                className="absolute top-full mt-2 w-72 p-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700"
                                            >
                                                {dropdown.items.map((item, index) => (
                                                    <motion.div
                                                        key={item.name}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <HolographicNavItem
                                                            {...item}
                                                            isActive={pathname === item.href}
                                                            onClick={() => setHoveredDropdown(null)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Command Palette Trigger */}
                            <motion.button
                                onClick={() => setIsCommandOpen(true)}
                                className="px-3 py-2 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500 transition-colors flex items-center gap-2 group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Command className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                                <span className="text-sm">⌘K</span>
                            </motion.button>

                            {/* Voice Search */}
                            <motion.button
                                className="p-2.5 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500 transition-colors group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Mic className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                            </motion.button>

                            {/* Notifications */}
                            <motion.button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2.5 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500 transition-colors group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Bell className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                                {notifications > 0 && (
                                    <motion.span
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 15 }}
                                    >
                                        {notifications}
                                    </motion.span>
                                )}
                            </motion.button>

                            {/* Theme Toggle */}
                            <motion.button
                                onClick={toggleDarkMode}
                                className="p-2.5 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500 transition-colors group"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait">
                                    {isDarkMode ? (
                                        <motion.div
                                            key="sun"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 20, opacity: 0 }}
                                        >
                                            <Sun className="h-4 w-4 group-hover:text-yellow-400 transition-colors" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="moon"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 20, opacity: 0 }}
                                        >
                                            <MoonStar className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* User Actions */}
                            <div className="flex items-center gap-2 ml-4">
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        href="/login"
                                        className="px-4 py-2 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 hover:border-purple-500 transition-colors flex items-center gap-2 group"
                                    >
                                        <LogIn className="h-4 w-4 group-hover:text-purple-400 transition-colors" />
                                        <span>Login</span>
                                    </Link>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Link
                                        href="/signup"
                                        className="relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 overflow-hidden group"
                                    >
                                        {/* Animated background */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600"
                                            animate={{
                                                x: ['-100%', '100%'],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                        <Zap className="h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Get Started</span>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden flex items-center gap-2">
                            <motion.button
                                onClick={toggleDarkMode}
                                className="p-2.5 rounded-lg bg-gray-800/50 backdrop-blur-xl"
                                whileTap={{ scale: 0.95 }}
                            >
                                {isDarkMode ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
                            </motion.button>

                            <motion.button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2.5 rounded-lg bg-gray-800/50 backdrop-blur-xl"
                                whileTap={{ scale: 0.95 }}
                            >
                                <AnimatePresence mode="wait">
                                    {isMenuOpen ? (
                                        <motion.div
                                            key="close"
                                            initial={{ rotate: -90 }}
                                            animate={{ rotate: 0 }}
                                            exit={{ rotate: 90 }}
                                        >
                                            <X className="h-6 w-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="menu"
                                            initial={{ rotate: 90 }}
                                            animate={{ rotate: 0 }}
                                            exit={{ rotate: -90 }}
                                        >
                                            <Menu className="h-6 w-6" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-800"
                        >
                            <div className="container mx-auto px-4 py-6 space-y-4">
                                {/* Mobile navigation items */}
                                {standaloneNavLinks.map((link, index) => (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            {link.icon}
                                            <span className="font-medium">{link.name}</span>
                                            {link.new && (
                                                <Badge variant="secondary" className="ml-auto text-xs">
                                                    NEW
                                                </Badge>
                                            )}
                                        </Link>
                                    </motion.div>
                                ))}

                                {/* Mobile dropdown sections */}
                                {Object.entries(dropdownMenus).map(([key, dropdown], sectionIndex) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (standaloneNavLinks.length + sectionIndex) * 0.1 }}
                                        className="pt-4 border-t border-gray-800"
                                    >
                                        <div className="flex items-center gap-2 px-3 pb-2 text-sm font-semibold text-gray-400">
                                            {dropdown.icon}
                                            {dropdown.title}
                                        </div>
                                        <div className="space-y-1">
                                            {dropdown.items.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                                                >
                                                    {item.icon}
                                                    <span className="font-medium">{item.name}</span>
                                                    {item.badge && (
                                                        <Badge variant="secondary" className="ml-auto text-xs">
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                    {item.new && (
                                                        <Badge variant="secondary" className="ml-auto text-xs">
                                                            NEW
                                                        </Badge>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Mobile CTAs */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="pt-4 border-t border-gray-800 space-y-2"
                                >
                                    <Link
                                        href="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        href="/signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium"
                                    >
                                        <Zap className="h-4 w-4" />
                                        <span>Get Started</span>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notification Panel */}
                <div className="relative">
                    <NotificationPanel
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                    />
                </div>
            </motion.nav>

            {/* Command Palette */}
            <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
        </>
    )
}