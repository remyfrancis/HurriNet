import Link from 'next/link'
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string
    href: string
    icon?: React.ReactNode
  }[]
}

export function Sidebar({ className, items, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 bg-white shadow-md min-h-screen flex flex-col",
        className
      )}
      {...props}
    >
      <div className="p-6">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          HurriNet
        </Link>
      </div>
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                {item.icon}
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}