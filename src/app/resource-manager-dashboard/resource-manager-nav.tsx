'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
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
    title: 'Distribution',
    href: '/resource-manager-dashboard/distribution',
    icon: Truck,
  },
  {
    title: 'Emergency Requests',
    href: '/resource-manager-dashboard/emergency-requests',
    icon: AlertTriangle,
  },
  {
    title: 'Suppliers',
    href: '/resource-manager-dashboard/suppliers',
    icon: PhoneCall,
  },
  {
    title: 'Reports',
    href: '/resource-manager-dashboard/reports',
    icon: ClipboardList,
  },
  {
    title: 'Settings',
    href: '/resource-manager-dashboard/settings',
    icon: Settings,
  },
]

export function ResourceManagerNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  }

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">HurriNet</h1>
        <p className="text-sm text-muted-foreground">Resource Manager Portal</p>
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