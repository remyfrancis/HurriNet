'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, MapPin } from 'lucide-react'

interface Warning {
  id: string
  title: string
  type: string
  severity: 'high' | 'medium' | 'low'
  location: string
  timestamp: string
}

const getSeverityColor = (severity: Warning['severity']) => {
  switch (severity) {
    case 'high':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

export function WarningsList() {
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWarnings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/weather/alerts/', { credentials: 'include' })
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
             throw new Error('Authentication failed. Please log in.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Warning[] = await response.json()
        setWarnings(data)
      } catch (e: any) {
        console.error("Failed to fetch warnings:", e)
        setError("Failed to load warnings. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarnings()
  }, [])

  if (isLoading) {
    return <div>Loading warnings...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (warnings.length === 0) {
    return <div>No warnings found.</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium leading-none">{warning.title}</h4>
                <Badge
                  variant="secondary"
                  className={`${getSeverityColor(
                    warning.severity
                  )} text-white border-0`}
                >
                  {warning.severity}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {warning.location}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(warning.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 