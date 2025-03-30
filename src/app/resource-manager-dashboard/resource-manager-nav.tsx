'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import {
  Home,
  Boxes,
  ClipboardList,
  AlertTriangle,
  ShieldCheck,
  ShoppingCart,
  PhoneCall,
  Truck,
  RefreshCw,
  LogOut,
  User,
  Settings,
  MessageCircle,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/resource-manager-dashboard',
    icon: Home,
  },
  {
    title: 'Inventory',
    href: '/resource-manager-dashboard/inventory',
    icon: Boxes,
  },
  {
    title: 'Procurement',
    href: '/resource-manager-dashboard/procurement',
    icon: ShoppingCart,
  },
  {
    title: 'Suppliers',
    href: '/resource-manager-dashboard/suppliers',
    icon: PhoneCall,
  },
  {
    title: 'Distributions',
    href: '/resource-manager-dashboard/distribution',
    icon: Truck,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  }
]

export function ResourceManagerNav() {
  const pathname = usePathname()
  const { token } = useAuth()
  const isAuthenticated = !!token

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  }

  // Authentication status indicator component
  const AuthStatusIndicator = () => (
    <div className="flex items-center">
      <div className="relative">
        <div 
          className={`h-3 w-3 rounded-full ${
            isAuthenticated 
              ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]' 
              : 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]'
          }`}
        />
        {isAuthenticated && (
          <div 
            className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping" 
            style={{ animationDuration: '3s' }} 
          />
        )}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        isAuthenticated 
          ? 'text-green-500' 
          : 'text-red-500'
      }`}>
        {isAuthenticated ? 'Online' : 'Offline'}
      </span>
    </div>
  )

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">HurriNet</h1>
        <p className="text-sm text-muted-foreground">Resource Manager Portal</p>
        
        {/* Authentication Status Indicator */}
        <div className="mt-4">
          <AuthStatusIndicator />
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
} 