'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AlertData {
  id: number
  title: string
  description: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  alert_type: string
  created_at: string
  is_active: boolean
}

export function AlertsList() {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Authentication required')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in again')
            return
          }
          throw new Error('Failed to fetch alerts')
        }

        const data = await response.json()
        setAlerts(data.filter((alert: AlertData) => alert.is_active))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getSeverityColor = (severity: AlertData['severity']) => {
    switch (severity) {
      case 'EXTREME':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MODERATE':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-muted-foreground">
            No active alerts at this time
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">{alert.title}</h3>
                  <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 