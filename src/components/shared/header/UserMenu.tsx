'use client'

import { memo } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, Bell, Heart, Star } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isAuthenticated: boolean
}

interface UserMenuProps {
  user?: User
  onLogin?: () => void
  onLogout?: () => void
  onNavigate?: (path: string) => void
}

const UserMenu = memo(function UserMenu({ 
  user, 
  onLogin, 
  onLogout, 
  onNavigate 
}: UserMenuProps) {
  const handleMenuItemClick = (path: string) => {
    onNavigate?.(path)
  }

  if (!user?.isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onLogin}
        className="transition-all duration-200 hover:scale-105"
      >
        <User className="h-4 w-4 mr-2" />
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleMenuItemClick('/dashboard')}
          className="cursor-pointer"
        >
          <Star className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleMenuItemClick('/dashboard/itinerary')}
          className="cursor-pointer"
        >
          <Heart className="mr-2 h-4 w-4" />
          <span>My Itineraries</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleMenuItemClick('/dashboard/settings')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleMenuItemClick('/dashboard/notifications')}
          className="cursor-pointer"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

UserMenu.displayName = "UserMenu"

export default UserMenu
export type { User }