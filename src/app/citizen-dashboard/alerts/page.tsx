'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { AlertsList } from '../alerts-list'
import { useRouter } from 'next/navigation'

export default function AlertsPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Emergency Alerts</h1>
          </div>
          <p className="text-muted-foreground">
            Stay informed about current emergency alerts and warnings in your area.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <AlertsList forceListView={true} />
          </div>
        </div>
      </main>
    </div>
  )
} 