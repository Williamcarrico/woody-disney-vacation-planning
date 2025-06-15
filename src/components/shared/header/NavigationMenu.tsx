'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { 
  Info, 
  Ticket, 
  Castle, 
  Map, 
  CloudRain, 
  DollarSign,
  MessageSquare,
  Lightbulb 
} from '@/components/icons'

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  description: string
  keywords: string[]
  category: string
  gradient: string
}

const navigationItems: NavigationItem[] = [
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
    name: 'Map', 
    href: '/map', 
    icon: Map, 
    description: 'Navigate the magic',
    keywords: ['map', 'directions', 'navigate', 'location'],
    category: 'tools',
    gradient: 'from-green-500 to-green-600'
  },
  { 
    name: 'Weather', 
    href: '/weather', 
    icon: CloudRain, 
    description: 'Plan for perfect weather',
    keywords: ['weather', 'forecast', 'rain', 'temperature'],
    category: 'tools',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  { 
    name: 'Budget', 
    href: '/budget', 
    icon: DollarSign, 
    description: 'Smart vacation budgeting',
    keywords: ['budget', 'cost', 'money', 'planning'],
    category: 'planning',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  { 
    name: 'Contact', 
    href: '/contact', 
    icon: MessageSquare, 
    description: 'Get in touch with us',
    keywords: ['contact', 'support', 'help', 'message'],
    category: 'support',
    gradient: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'Tips & Tricks', 
    href: '/tips-tricks', 
    icon: Lightbulb, 
    description: 'Insider Disney secrets',
    keywords: ['tips', 'tricks', 'secrets', 'advice'],
    category: 'discover',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

interface NavigationMenuProps {
  isMenuOpen: boolean
  onCloseMenu: () => void
}

const NavigationMenu = memo(function NavigationMenu({ 
  isMenuOpen, 
  onCloseMenu 
}: NavigationMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isMenuOpen ? 1 : 0, 
        y: isMenuOpen ? 0 : -20 
      }}
      transition={{ duration: 0.3 }}
      className={`
        absolute top-full left-0 right-0 z-50 mt-2 
        bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg 
        border border-gray-200 dark:border-gray-700 
        rounded-lg shadow-lg
        ${isMenuOpen ? 'block' : 'hidden'}
      `}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {navigationItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMenu}
              className="group relative block p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
            >
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${item.gradient} text-white mb-3`}>
                <IconComponent className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
              <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-200" />
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
})

NavigationMenu.displayName = "NavigationMenu"

export default NavigationMenu
export { navigationItems }
export type { NavigationItem }