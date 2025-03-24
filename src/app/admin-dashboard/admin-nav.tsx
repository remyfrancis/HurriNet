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
    title: 'Settings',
    href: '/admin-dashboard/settings',
    icon: Cog,
  },
  {
    title: 'System Performance',
    href: '/admin-dashboard/system-performance',
    icon: Activity,
  }
]

interface AdminNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminNav({ className, ...props }: AdminNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn('py-4', className)} {...props}>
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
          Admin Panel
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
} 