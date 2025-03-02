'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"

interface Alert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: string
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts`)
        const data = await response.json()
        setAlerts(data)
        setLoading(false)
      } catch (error) {
        setError('Failed to load alerts')
        setLoading(false)
      }
    }

    fetchAlerts()
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <Bell className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading alerts...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No active alerts at this time
          </div>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 ${getSeverityStyle(alert.severity)}`}
            >
              <div className="flex gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="space-y-1">
                  <h4 className="font-medium">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {alert.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </ScrollArea>
  )
} 