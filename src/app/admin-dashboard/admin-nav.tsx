'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  BarChart,
  Bell,
  Cog,
  Home,
  LifeBuoy,
  Map,
  Radio,
  Shield,
  Users,
  Activity,
  MessageCircle,
  LogOut,
} from 'lucide-react'

const navItems = [
  {
    title: 'Overview',
    href: '/admin-dashboard',
    icon: Home,
  },
  {
    title: 'Alerts',
    href: '/admin-dashboard/alerts',
    icon: Bell,
  },
  {
    title: 'Map',
    href: '/admin-dashboard/map',
    icon: Map,
  },
  {
    title: 'Emergency Teams',
    href: '/admin-dashboard/teams',
    icon: Users,
  },
  {
    title: 'Resources',
    href: '/admin-dashboard/resources',
    icon: Shield,
  },
  {
    title: 'Analytics',
    href: '/admin-dashboard/analytics',
    icon: BarChart,
  },
  {
    title: 'Broadcasts',
    href: '/admin-dashboard/broadcasts',
    icon: Radio,
  },
  {
    title: 'Support',
    href: '/admin-dashboard/support',
    icon: LifeBuoy,
  },
  {
    title: 'Chat',
    href: '/chat',
    icon: MessageCircle,
  },
  {
    title: 'System Performance',
    href: '/admin-dashboard/system-performance',
    icon: Activity,
  }
]

export function AdminNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  }

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">HurriNet</h1>
        <p className="text-sm text-muted-foreground">Admin Portal</p>
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