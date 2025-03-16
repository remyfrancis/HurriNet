// src/contexts/AlertContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext' // Import the useAuth hook

// Update the AlertLevel to match backend severity levels
type AlertLevel = 'normal' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'

type AlertContextType = {
  alertLevel: AlertLevel
  setAlertLevel: (level: AlertLevel) => void
  currentAlert: Alert | null
  checkSafetyStatus: () => void
  isLoading: boolean
  error: string | null
}

// Update the Alert interface to match the backend model
interface Alert {
  id: string
  title: string
  description: string
  severity: AlertLevel
  severity_display?: string
  district: string
  created_at: string
  updated_at: string
  is_active: boolean
  is_public: boolean
  affected_areas: string
  instructions: string
  created_by?: {
    id: string
    username: string
    email: string
  }
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('normal')
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth() // Get authentication state from AuthContext

  const checkSafetyStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.log('No authentication token found yet, will retry when authenticated')
        return
      }

      // Update to use the current endpoint from the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/current/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access more gracefully
          console.log('Authentication issue when fetching alerts, will retry when authenticated')
          return
        }
        throw new Error('Failed to fetch alerts')
      }

      const data = await response.json()
      
      // Handle the array of alerts returned from the backend
      if (data && data.length > 0) {
        // Sort by severity (EXTREME > HIGH > MODERATE > LOW)
        const sortedAlerts = [...data].sort((a, b) => {
          const severityOrder = { 'EXTREME': 4, 'HIGH': 3, 'MODERATE': 2, 'LOW': 1, 'normal': 0 }
          return severityOrder[b.severity as keyof typeof severityOrder] - 
                 severityOrder[a.severity as keyof typeof severityOrder]
        })
        
        // Get the highest severity alert
        const highestSeverityAlert = sortedAlerts[0]
        setCurrentAlert(highestSeverityAlert)
        setAlertLevel(highestSeverityAlert.severity as AlertLevel)
      } else {
        // No active alerts
        setCurrentAlert(null)
        setAlertLevel('normal')
      }
    } catch (err) {
      console.error('Error checking safety status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check safety status')
    } finally {
      setIsLoading(false)
    }
  }

  // Poll for alerts - only when authenticated
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isAuthenticated) {
      console.log('User is authenticated, checking safety status')
      checkSafetyStatus()
      interval = setInterval(checkSafetyStatus, 30000) // Check every 30 seconds
    } else {
      console.log('User is not authenticated, waiting for authentication before checking alerts')
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isAuthenticated]) // Depend on isAuthenticated state

  const value = {
    alertLevel,
    setAlertLevel,
    currentAlert,
    checkSafetyStatus,
    isLoading,
    error
  }

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}