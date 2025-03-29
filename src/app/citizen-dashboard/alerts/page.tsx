'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { AlertsList } from '../alerts-list'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * AlertsPage Component
 * 
 * Displays emergency alerts for authenticated citizens. This page shows a list
 * of current alerts and warnings in the user's area. It includes authentication
 * checks and loading states for better user experience.
 */
export default function AlertsPage() {
  const router = useRouter()
  // Authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  /**
   * Effect hook to handle authentication check on component mount
   * - Checks for access token in localStorage
   * - Redirects to login if no token is found
   * - Updates authentication state accordingly
   */
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
    setIsAuthLoading(false)
  }, [router])

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen">
        <CitizenNav />
        <main className="flex-1 p-8">
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </main>
      </div>
    )
  }

  // Returns null if not authenticated (will redirect to login)
  if (!isAuthenticated) {
    return null
  }

  // Main page content - shown when authenticated
  return (
    <div className="flex min-h-screen">
      {/* Navigation sidebar */}
      <CitizenNav />
      
      {/* Main content area */}
      <main className="flex-1 p-8">
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Emergency Alerts</h1>
          </div>
          
          {/* Page description */}
          <p className="text-muted-foreground">
            Stay informed about current emergency alerts and warnings in your area.
          </p>
          
          {/* Alerts list container */}
          <div className="max-w-4xl mx-auto">
            {/* AlertsList component with forced list view */}
            <AlertsList forceListView={true} />
          </div>
        </div>
      </main>
    </div>
  )
} 