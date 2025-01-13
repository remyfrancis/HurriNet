'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface BaseItem {
  key: string
  title: string
  icon: ReactNode
}

interface ParentItem extends BaseItem {
  items: {
    key: string
    title: string
    href: string
  }[]
}

interface LeafItem extends BaseItem {
  href: string
}

type SidebarItem = ParentItem | LeafItem

interface SidebarProps {
  items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (key: string) => {
    setOpenMenus(current => 
      current.includes(key) 
        ? current.filter(k => k !== key)
        : [...current, key]
    )
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Link href="/" className="text-xl font-semibold text-blue-600">
          HurriNet
        </Link>
      </div>

      <nav className="p-4 space-y-1">
        {items.map((item) => {
          if ('items' in item) {
            const isOpen = openMenus.includes(item.key)
            const hasActiveChild = item.items.some(subItem => pathname === subItem.href)
            
            return (
              <div key={item.key} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.key)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${hasActiveChild ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5">{item.icon}</span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="pl-11 space-y-1">
                    {item.items.map((subItem) => {
                      const isActive = pathname === subItem.href
                      return (
                        <Link
                          key={subItem.key}
                          href={subItem.href}
                          className={`
                            block py-2 px-4 rounded-lg
                            transition-colors duration-200
                            ${isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          {subItem.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Single item with direct href
          const isActive = pathname === item.href
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg
                transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
