'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { 
  Sun, 
  Moon, 
  ChevronDown,
  User,
  Settings,
  LogOut,
  Map,
  CloudRain,
  Sparkles,
  DollarSign,
  MessageSquare,
  Info,
  Lightbulb,
  Activity,
  X,
  Menu as MenuIcon,
  ArrowRight,
  Zap,
  Ticket,
  Mic,
  MicOff,
  Castle,
  Star,
  Heart,
  Wand2,
  Search,
  Bell,
  Crown
} from 'lucide-react'

// Import Magic UI components
import { AuroraBackground } from '@/components/magicui/aurora-background'
import { IntelligentHover } from '@/components/magicui/intelligent-hover'
import { MagicWandTrail, FloatingCastle, MagicalLoading } from '@/components/magicui/disney-themed-effects'
import { BorderBeam } from '@/components/magicui/border-beam'
import { MagicCard } from '@/components/magicui/magic-card'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { GlowingStars } from '@/components/magicui/glowing-stars'
import { CustomCursor } from '@/components/magicui/custom-cursor'
import { AdvancedParticles } from '@/components/magicui/advanced-particles'
import { TypingAnimation } from '@/components/magicui/typing-animation'

// Import UI components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Navigation items with enhanced metadata
const navigationItems = [
  { 
    name: 'About', 
    href: '/about', 
    icon: Info, 
    description: 'Discover the magic behind WaltWise',
    keywords: ['about', 'info', 'story', 'mission'],
    category: 'discover',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Annual Passes', 
    href: '/annual-passes', 
    icon: Ticket, 
    description: 'Find your perfect Disney pass',
    keywords: ['passes', 'tickets', 'annual', 'pricing'],
    category: 'planning',
    gradient: 'from-red-500 to-red-600'
  },
  { 
    name: 'Parks', 
    href: '/dashboard/parks', 
    icon: Castle, 
    description: 'Explore magical kingdoms',
    keywords: ['parks', 'attractions', 'rides', 'shows'],
    category: 'discover',
    gradient: 'from-red-500 to-red-600'
  },
  { 
    name: 'Budget', 
    href: '/budget', 
    icon: DollarSign, 
    description: 'Plan your magical budget',
    keywords: ['budget', 'money', 'cost', 'planning'],
    category: 'planning',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  { 
    name: 'Maps', 
    href: '/map', 
    icon: Map, 
    description: 'Navigate with enchanted maps',
    keywords: ['map', 'navigation', 'directions', 'location'],
    category: 'tools',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Weather', 
    href: '/weather', 
    icon: CloudRain, 
    description: 'Magical weather forecasts',
    keywords: ['weather', 'forecast', 'conditions', 'temperature'],
    category: 'tools',
    gradient: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Tips & Tricks', 
    href: '/tips-tricks', 
    icon: Lightbulb, 
    description: 'Unlock insider secrets',
    keywords: ['tips', 'tricks', 'advice', 'secrets'],
    category: 'discover',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  { 
    name: 'Contact', 
    href: '/contact', 
    icon: MessageSquare, 
    description: 'Connect with our magic makers',
    keywords: ['contact', 'message', 'support', 'help'],
    category: 'support',
    gradient: 'from-blue-500 to-blue-600'
  }
]

// Quick access items
const quickAccessItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Activity, color: 'from-red-500 to-blue-500' },
  { name: 'Dining', href: '/dashboard/dining', icon: Heart, color: 'from-red-500 to-red-600' },
  { name: 'Events', href: '/dashboard/events', icon: Star, color: 'from-yellow-500 to-yellow-600' },
  { name: 'Itinerary', href: '/dashboard/itinerary', icon: Map, color: 'from-blue-500 to-blue-600' }
]

// Profile menu items
const profileItems = [
  { name: 'Your Profile', href: '/dashboard/settings', icon: User, description: 'Manage your magical profile' },
  { name: 'Dashboard', href: '/dashboard', icon: Activity, description: 'Your personalized hub' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, description: 'Customize your experience' },
  { name: 'Achievements', href: '/dashboard/achievements', icon: Crown, description: 'View your magical milestones' }
]

// Floating particles configuration
const createParticles = () => Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
  color: ['#dc2626', '#eab308', '#2563eb', '#dc2626', '#2563eb'][Math.floor(Math.random() * 5)]
}))

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [showMagicTrail, setShowMagicTrail] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [_particles] = useState(createParticles)
  const [_isLoading, _setIsLoading] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const headerRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Mouse position tracking for interactive effects
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const _smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const _smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 25 })
  
  // Scroll-based transforms
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8])
  const parallaxY = useTransform(scrollY, [0, 300], [0, -30])
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9])
  
  // Handle mouse movement for interactive effects
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
  }, [mouseX, mouseY])
  
  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleMouseMove])
  
  // Focus search input when dialog opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchOpen])
  
  // Filter navigation items based on search
  const filteredNavItems = navigationItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    setVoiceEnabled(!voiceEnabled)
    // In a real implementation, integrate with Web Speech API
  }
  
  // Handle search navigation
  const handleSearchSelect = (_href: string) => {
    setSearchOpen(false)
    setSearchQuery('')
    // Navigate to href - in Next.js this would be handled by Link component
  }
  
  if (!mounted) return <MagicalLoading size="lg" className="fixed top-8 left-8 z-50" />

  return (
    <>
      {/* Custom cursor */}
      <CustomCursor />
      
      {/* Magic wand cursor trail */}
      {showMagicTrail && <MagicWandTrail />}
      
      {/* Aurora background effect */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <AuroraBackground showRadialGradient={true} />
        <GlowingStars starCount={40} className="opacity-60" />
      </div>
      
      {/* Advanced particles system */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <AdvancedParticles 
          count={30}
          colors={['#dc2626', '#eab308', '#2563eb', '#dc2626', '#2563eb']}
          enableInteraction={true}
          mouseInfluence={200}
          emissionRate={0.05}
          particleLife={12000}
        />
      </div>
      
      <motion.header 
        ref={headerRef}
        style={{ 
          opacity: headerOpacity, 
          y: parallaxY,
          backdropFilter: `blur(${headerBlur}px)`
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50' 
            : 'bg-transparent'
        }`}
      >
        <BorderBeam 
          size={60}
          duration={8}
          colorFrom="#dc2626"
          colorTo="#2563eb"
          className="opacity-50"
        />
        
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo with floating castle and magical effects */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="group relative">
                <IntelligentHover
                  magnetStrength={0.3}
                  hoverDepth={20}
                  enableRipple={true}
                  enableGradientFollow={true}
                >
                  <motion.div
                    style={{ scale: logoScale }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 rounded-xl blur-lg opacity-75"
                        animate={{
                          opacity: [0.5, 0.9, 0.5],
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <MagicCard 
                        className="relative bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 text-white rounded-xl p-3 group-hover:shadow-2xl transition-all duration-300"
                        gradientColor="#ffffff"
                        gradientOpacity={0.2}
                      >
                        <FloatingCastle size={28} className="text-white" />
                      </MagicCard>
                      
                      {/* Orbiting sparkles */}
                      {Array.from({ length: 3 }, (_, i) => (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: '50%',
                            top: '50%',
                            transformOrigin: '0 0'
                          }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 8 + i * 2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        >
                          <Star 
                            className="w-2 h-2 text-yellow-400 fill-current"
                            style={{
                              transform: `translate(${25 + i * 8}px, -1px)`
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="hidden sm:block">
                      <motion.h1 
                        className="text-2xl cabin-sketch-bold"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="relative">
                          <TypingAnimation
                            text="WaltWise"
                            duration={150}
                            className="bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent"
                          />
                        </div>
                      </motion.h1>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-mono h-5">
                        <TypingAnimation
                          text="Plan Magical Moments ✨"
                          duration={100}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </motion.div>
                </IntelligentHover>
              </Link>
            </div>

            {/* Desktop Navigation with enhanced dropdown */}
            <div className="hidden lg:flex lg:items-center lg:space-x-6">
              {/* Explore Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="group relative px-4 py-2 text-sm font-medium hover:bg-transparent"
                    onMouseEnter={() => setHoveredItem('explore')}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <span className="flex items-center space-x-1">
                      <Sparkles className="h-4 w-4" />
                      <span>Explore</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </span>
                    <motion.span 
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-red-600 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: hoveredItem === 'explore' ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-2" align="start">
                  <div className="grid grid-cols-2 gap-1">
                    {navigationItems.map((item, _index) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          className="group flex items-start space-x-3 rounded-xl p-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-blue-50/50 dark:hover:from-red-900/20 dark:hover:to-blue-900/20"
                        >
                          <motion.div 
                            className={`mt-0.5 rounded-lg p-2 bg-gradient-to-r ${item.gradient} text-white`}
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <item.icon className="h-4 w-4" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Quick Access Links */}
              {quickAccessItems.map((item, _index) => (
                <motion.div
                  key={item.name}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: _index * 0.5 
                  }}
                >
                  <IntelligentHover magnetStrength={0.1} hoverDepth={8}>
                    <Link 
                      href={item.href} 
                      className="relative group px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <span className="flex items-center space-x-1">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </span>
                      <motion.span 
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: hoveredItem === item.name ? '100%' : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </IntelligentHover>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <IntelligentHover magnetStrength={0.1} hoverDepth={8}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative group"
                      aria-label="Search"
                    >
                      <Search className="h-5 w-5" />
                      <motion.div
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      />
                    </Button>
                  </IntelligentHover>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Search className="h-5 w-5 text-red-600" />
                      <span>Search WaltWise</span>
                    </DialogTitle>
                    <DialogDescription>
                      Find pages, features, and magical content
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      ref={searchInputRef}
                      placeholder="Type to search... (⌘/)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-lg"
                    />
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {filteredNavItems.map((item) => (
                        <Button
                          key={item.name}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={() => handleSearchSelect(item.href)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} text-white`}>
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.description}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Voice Recognition Toggle */}
              <IntelligentHover magnetStrength={0.1} hoverDepth={10}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleVoiceRecognition}
                  className={`relative group transition-all ${
                    voiceEnabled 
                      ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-700 hover:to-blue-700' 
                      : ''
                  }`}
                  aria-label="Toggle voice recognition"
                >
                  <AnimatePresence mode="wait">
                    {voiceEnabled ? (
                      <motion.div
                        key="mic-on"
                        initial={{ scale: 0, rotate: 180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: -180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Mic className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="mic-off"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MicOff className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {voiceEnabled && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(220, 38, 38, 0.7)',
                          '0 0 0 10px rgba(220, 38, 38, 0)',
                          '0 0 0 0 rgba(220, 38, 38, 0)',
                        ]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </Button>
              </IntelligentHover>

              {/* Magic Mode Toggle */}
              <IntelligentHover magnetStrength={0.15} hoverDepth={12}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMagicTrail(!showMagicTrail)}
                  className="relative group sparkle-zone"
                  aria-label="Toggle magic mode"
                >
                  <motion.div
                    animate={{ rotate: showMagicTrail ? 360 : 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Wand2 className="h-5 w-5" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent)'
                    }}
                  />
                </Button>
              </IntelligentHover>

              {/* Theme Toggle with enhanced animation */}
              <IntelligentHover magnetStrength={0.15} hoverDepth={12}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="relative group overflow-hidden"
                  aria-label="Toggle theme"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {theme === 'dark' ? (
                        <motion.div
                          key="moon"
                          initial={{ rotate: -90, opacity: 0, scale: 0 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: 90, opacity: 0, scale: 0 }}
                          transition={{ duration: 0.4, type: "spring" }}
                        >
                          <Moon className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="sun"
                          initial={{ rotate: 90, opacity: 0, scale: 0 }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{ rotate: -90, opacity: 0, scale: 0 }}
                          transition={{ duration: 0.4, type: "spring" }}
                        >
                          <Sun className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Button>
              </IntelligentHover>

              {/* Notifications */}
              <IntelligentHover magnetStrength={0.1} hoverDepth={8}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative group"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <motion.div
                    className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </Button>
              </IntelligentHover>

              {/* Enhanced CTA Button */}
              <div className="hidden lg:block">
                <IntelligentHover magnetStrength={0.2} hoverDepth={15} enableRipple={true}>
                  <RainbowButton className="relative group px-6 py-2.5 text-sm font-medium shadow-lg transition-all duration-300">
                    <span className="relative z-10 flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </RainbowButton>
                </IntelligentHover>
              </div>

              {/* Enhanced Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full bg-gradient-to-r from-red-600 to-blue-600 p-0.5"
                  >
                    <motion.div 
                      className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </motion.div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-600 to-blue-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Disney Dreamer</p>
                        <p className="text-sm text-gray-500">guest@waltwise.com</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {profileItems.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center space-x-3 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-3 cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MenuIcon className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </nav>

        {/* Enhanced Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
            >
              <div className="space-y-2 px-4 py-6">
                {navigationItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 rounded-xl px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-blue-50 dark:hover:from-red-900/20 dark:hover:to-blue-900/20 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.gradient} text-white`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigationItems.length * 0.05 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-800"
                >
                  <ShimmerButton
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Get Started</span>
                    </span>
                  </ShimmerButton>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Add enhanced custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        .sparkle-zone {
          position: relative;
        }
        
        .sparkle-zone::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #dc2626, #eab308, #2563eb, #dc2626);
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
          animation: sparkle-border 3s ease-in-out infinite;
        }
        
        .sparkle-zone:hover::before {
          opacity: 0.7;
        }
        
        @keyframes sparkle-border {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        
        @keyframes magical-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(220, 38, 38, 0.5),
                        0 0 10px rgba(220, 38, 38, 0.3),
                        0 0 15px rgba(220, 38, 38, 0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.6),
                        0 0 20px rgba(37, 99, 235, 0.4),
                        0 0 30px rgba(37, 99, 235, 0.3);
          }
        }
        
        .animate-magical-glow {
          animation: magical-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
