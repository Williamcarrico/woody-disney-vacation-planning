'use client'

import { useState, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Menu, X, Sparkles } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Import optimized sub-components
import NavigationMenu from './NavigationMenu'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import UserMenu, { type User } from './UserMenu'

interface OptimizedHeaderProps {
  user?: User
  onLogin?: () => void
  onLogout?: () => void
  className?: string
}

const OptimizedHeader = memo(function OptimizedHeader({
  user,
  onLogin,
  onLogout,
  className
}: OptimizedHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Transform scroll position to header opacity and blur
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 0.8])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 20])

  // Callbacks
  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setIsMenuOpen(false)
  }, [])

  const handleNavigation = useCallback((path: string) => {
    router.push(path)
    handleCloseMenu()
  }, [router, handleCloseMenu])

  const handleSearchResultSelect = useCallback((result: any) => {
    router.push(result.url)
  }, [router])

  return (
    <TooltipProvider delayDuration={300}>
      <motion.header 
        className={`
          fixed top-0 left-0 right-0 z-40 
          border-b border-gray-200/50 dark:border-gray-700/50
          ${className}
        `}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
          backdropFilter: `blur(${headerBlur}px)`,
          WebkitBackdropFilter: `blur(${headerBlur}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
              onClick={handleCloseMenu}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-blue-600/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WaltWise
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/about"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                About
              </Link>
              <Link 
                href="/dashboard/parks"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Parks
              </Link>
              <Link 
                href="/dashboard/dining"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Dining
              </Link>
              <Link 
                href="/budget"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Budget
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <SearchBar 
                onResultSelect={handleSearchResultSelect}
                className="hidden sm:block"
              />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <UserMenu 
                user={user}
                onLogin={onLogin}
                onLogout={onLogout}
                onNavigate={handleNavigation}
              />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuToggle}
                className="lg:hidden"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="lg:hidden relative">
          <NavigationMenu 
            isMenuOpen={isMenuOpen}
            onCloseMenu={handleCloseMenu}
          />
        </div>
      </motion.header>
    </TooltipProvider>
  )
})

OptimizedHeader.displayName = "OptimizedHeader"

export default OptimizedHeader