'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Home,
  Building2,
  FileText,
  Users,
  Package,
  Building,
  Activity,
  LogOut,
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/emergency-hq',
    icon: Home,
  },
  {
    title: 'Medical Facility Status',
    href: '/emergency-hq/medical-facilities',
    icon: Building2,
  },
  {
    title: 'Situation Reports',
    href: '/emergency-hq/situation-reports',
    icon: FileText,
  },
  {
    title: 'Team Positions',
    href: '/emergency-hq/team-positions',
    icon: Users,
  }
]

export function EmergencyHQNav() {
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    window.location.href = '/login'
  }

  return (
    <div className="w-64 min-h-screen bg-background border-r">
      <div className="p-6">
        <h1 className="text-xl font-bold">HurriNet</h1>
        <p className="text-sm text-muted-foreground">Emergency HQ Portal</p>
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