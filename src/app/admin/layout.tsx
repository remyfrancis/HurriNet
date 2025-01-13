import { ReactNode } from 'react'
import { Toaster } from "@/components/ui/toaster"





export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      <Toaster />
    </div>
  )
}

