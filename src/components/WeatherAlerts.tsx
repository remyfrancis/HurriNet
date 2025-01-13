'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface WeatherAlert {
  id: string
  title: string
  description: string
  createdAt: Date
}

export default function WeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startIndex, setStartIndex] = useState(0)
  const alertsToShow = 3 // Number of alerts to show at once

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/alerts/?active=true')
        const data = await response.json()
        console.log('Received alerts data:', data)
        setAlerts(data)
      } catch (error) {
        console.error('Error fetching alerts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  // Cycle through alerts every 5 seconds
  useEffect(() => {
    if (alerts.length <= alertsToShow) return // Don't cycle if we have 3 or fewer alerts

    const interval = setInterval(() => {
      setStartIndex((current) => {
        // Reset to 0 if we've reached the end, otherwise increment
        return (current + 1) >= alerts.length ? 0 : current + 1
      })
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [alerts.length])

  if (isLoading) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Current Weather Alerts</h2>
        <p>Loading alerts...</p>
      </section>
    )
  }

  if (!alerts.length) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Current Weather Alerts</h2>
        <p>No active alerts at this time.</p>
      </section>
    )
  }

  // Get the current set of alerts to display
  const visibleAlerts = alerts.slice(startIndex, startIndex + alertsToShow)
  // If we need more alerts to fill the display, wrap around to the beginning
  if (visibleAlerts.length < alertsToShow) {
    visibleAlerts.push(...alerts.slice(0, alertsToShow - visibleAlerts.length))
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Current Weather Alerts</h2>
      <div className="space-y-4 transition-all duration-500">
        {visibleAlerts.map((alert) => (
          <Alert key={alert.id} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
      </div>
    </section>
  )
}

