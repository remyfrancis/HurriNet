'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, MapPin } from 'lucide-react'

interface BackendWarning {
  id: string
  title: string
  alert_type: string
  alert_type_display: string
  severity: string
  severity_display: string
  description: string
  area_affected: string
  start_time: string
  end_time: string
  created_at: string
  updated_at: string
  is_active: boolean
}

type SeverityLevel = 'high' | 'medium' | 'low' | 'extreme' | 'moderate'

const getSeverityColor = (severity: SeverityLevel | string) => {
  const lowerSeverity = severity.toLowerCase()
  switch (lowerSeverity) {
    case 'high':
    case 'extreme':
      return 'bg-red-500'
    case 'moderate':
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

export function WarningsList() {
  const [warnings, setWarnings] = useState<BackendWarning[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchWarnings = async () => {
      setIsLoading(true)
      setError(null)

      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      
      if (!token) {
          console.error('No access token found.')
          setError('Authentication token not found. Please log in again.') 
          setIsLoading(false)
          return
      }

      const headers = new Headers({
          'Authorization': `Bearer ${token}`
      })

      try {
        const response = await fetch('/api/weather/alerts/', { 
            method: 'GET',
            headers: headers,
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
             console.error('Authentication failed (invalid/expired token?).')
             setError('Authentication failed. Your session may have expired. Please log in again.')
             setIsLoading(false)
             return
          }
          const errorData = await response.text()
          console.error("Server error response:", errorData)
          throw new Error(`HTTP error! status: ${response.status}, details: ${errorData}`)
        }
        const data: BackendWarning[] = await response.json()
        setWarnings(data)
      } catch (e: any) {
        console.error("Failed to fetch warnings:", e)
        if (!error) {
            if (e.message.includes('HTTP error')) {
                setError("Failed to load warnings due to a server issue. Please try again later.")
            } else if (e.message.includes('Failed to fetch')) {
                setError("Failed to load warnings. Cannot reach server. Please check connection.")
            } else {
                setError("Failed to load warnings. An unexpected error occurred.")
            }
        }
      } finally {
          if (isLoading) {
            setIsLoading(false)
          }
      }
    }

    fetchWarnings()
  }, [])

  if (isLoading) {
    return <div>Loading warnings...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  if (warnings.length === 0 && !isLoading) {
    return <div className="p-4">No active warnings found.</div>
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-medium leading-none break-words">{warning.title}</h4>
                <Badge
                  variant="secondary"
                  className={`${getSeverityColor(
                    warning.severity
                  )} text-white border-0 shrink-0 whitespace-nowrap`}
                >
                  {warning.severity_display || warning.severity}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3 shrink-0" />
                <span className="truncate">{warning.area_affected || 'N/A'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Issued: {new Date(warning.start_time).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(warning.end_time).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 