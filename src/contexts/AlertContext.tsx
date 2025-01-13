// src/contexts/AlertContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type AlertLevel = 'normal' | 'warning' | 'evacuation' | 'preparedness'

type AlertContextType = {
  alertLevel: AlertLevel
  setAlertLevel: (level: AlertLevel) => void
  currentAlert: Alert | null
  checkSafetyStatus: () => void
  isLoading: boolean
  error: string | null
}

interface Alert {
  id: string
  type: string
  severity: AlertLevel
  message: string
  instructions: string
  affectedAreas: string[]
  timestamp: Date
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alertLevel, setAlertLevel] = useState<AlertLevel>('normal')
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSafetyStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if user is authenticated
      const token = localStorage.getItem('accessToken')
      if (!token) {
        // If not authenticated, don't make the API call
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/current/`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          throw new Error('Please log in to view alerts')
        }
        throw new Error('Failed to fetch alerts')
      }

      const data = await response.json()
      
      if (data.alert) {
        setCurrentAlert(data.alert)
        setAlertLevel(data.alert.severity as AlertLevel)
      }
    } catch (err) {
      console.error('Error checking safety status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check safety status')
    } finally {
      setIsLoading(false)
    }
  }

  // Poll for alerts
  useEffect(() => {
    // Check alerts if user is authenticated
    const token = localStorage.getItem('accessToken')
    if (token) {
      checkSafetyStatus()
      const interval = setInterval(checkSafetyStatus, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [])

  const value = {
    alertLevel,
    setAlertLevel,
    currentAlert,
    checkSafetyStatus,
    isLoading,
    error
  }

  return (
    <AlertContext.Provider value={{ value }}>
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