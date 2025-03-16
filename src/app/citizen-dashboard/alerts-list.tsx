'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronLeft, ChevronRight, PauseCircle, PlayCircle, List, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface AlertData {
  id: number
  title: string
  description: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  alert_type: string
  created_at: string
  is_active: boolean
}

// Define severity order type for type safety
type SeverityOrder = {
  EXTREME: number
  HIGH: number
  MODERATE: number
  LOW: number
}

interface AlertsListProps {
  forceListView?: boolean;
}

export function AlertsList({ forceListView = false }: AlertsListProps) {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showAllAlerts, setShowAllAlerts] = useState(forceListView)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const AUTO_SCROLL_DELAY = 6000; // 6 seconds per alert

  useEffect(() => {
    // If forceListView is true, ensure showAllAlerts is also true
    if (forceListView && !showAllAlerts) {
      setShowAllAlerts(true);
    }
  }, [forceListView, showAllAlerts]);

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
            'Authorization': `Bearer ${token}`,
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
        const activeAlerts = data.filter((alert: AlertData) => alert.is_active)
        
        // Sort alerts by severity (EXTREME > HIGH > MODERATE > LOW)
        const sortedAlerts = [...activeAlerts].sort((a, b) => {
          const severityOrder: SeverityOrder = { 'EXTREME': 4, 'HIGH': 3, 'MODERATE': 2, 'LOW': 1 };
          // Type assertion to fix TypeScript error
          return severityOrder[b.severity as keyof SeverityOrder] - severityOrder[a.severity as keyof SeverityOrder];
        });
        
        setAlerts(sortedAlerts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    
    // Refresh alerts every 2 minutes
    const refreshInterval = setInterval(fetchAlerts, 120000);
    
    return () => {
      clearInterval(refreshInterval);
    }
  }, [])

  // Auto-scroll functionality
  useEffect(() => {
    if (alerts.length <= 1 || isPaused || showAllAlerts) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
        autoScrollIntervalRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      return
    }

    // Reset progress when starting
    setProgress(0)
    
    // Progress bar update (100 steps)
    const progressStep = 100 / (AUTO_SCROLL_DELAY / 100); // Update every 100ms
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + progressStep;
      });
    }, 100);

    // Alert change interval
    autoScrollIntervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length)
      setProgress(0) // Reset progress when changing alert
    }, AUTO_SCROLL_DELAY)

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [alerts.length, isPaused, showAllAlerts])

  const goToNextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % alerts.length)
    setProgress(0) // Reset progress when manually changing alert
  }, [alerts.length])

  const goToPrevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + alerts.length) % alerts.length)
    setProgress(0) // Reset progress when manually changing alert
  }, [alerts.length])

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
  }, [])

  const toggleViewAllAlerts = useCallback(() => {
    if (!forceListView) {
      setShowAllAlerts(prev => !prev)
      if (!showAllAlerts) {
        setIsPaused(true) // Pause carousel when showing all alerts
      }
    }
  }, [showAllAlerts, forceListView])

  const handleMouseEnter = () => {
    // Don't auto-pause on hover, let user control with the pause button
  }

  const handleMouseLeave = () => {
    // Don't auto-resume on leave, let user control with the play button
  }

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

  const getSeverityBorderColor = (severity: AlertData['severity']) => {
    switch (severity) {
      case 'EXTREME':
        return 'border-red-500'
      case 'HIGH':
        return 'border-orange-500'
      case 'MODERATE':
        return 'border-yellow-500'
      case 'LOW':
        return 'border-blue-500'
      default:
        return 'border-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 w-full max-w-full">
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

  // Show all alerts in a list view
  if (showAllAlerts) {
    return (
      <div className="space-y-4 w-full max-w-full">
        {!forceListView && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Active Alerts ({alerts.length})</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleViewAllAlerts}
              className="flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              <span>Close List</span>
            </Button>
          </div>
        )}
        
        {alerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getSeverityBorderColor(alert.severity)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
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

  // Show carousel view
  return (
    <div 
      className="relative w-full max-w-full overflow-hidden" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Alert count indicator */}
      <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-xs">
        {currentIndex + 1} / {alerts.length}
      </div>
      
      {/* Control buttons */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        {/* Pause/Play button */}
        {alerts.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm rounded-full"
            onClick={togglePause}
          >
            {isPaused ? (
              <PlayCircle className="h-5 w-5" />
            ) : (
              <PauseCircle className="h-5 w-5" />
            )}
          </Button>
        )}
        
        {/* View all alerts button */}
        {alerts.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm rounded-full"
            onClick={toggleViewAllAlerts}
          >
            <List className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Carousel container */}
      <div className="overflow-hidden rounded-lg w-full">
        <div 
          className="flex transition-transform duration-500 ease-in-out w-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {alerts.map((alert) => (
            <div key={alert.id} className="w-full flex-shrink-0 min-w-0">
              <Card className={`border-2 shadow-lg ${getSeverityBorderColor(alert.severity)}`}>
                <CardContent className="pt-6 pb-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        <h3 className="font-semibold text-lg break-words">{alert.title}</h3>
                        <Badge variant="secondary" className={`${getSeverityColor(alert.severity)} flex-shrink-0`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {alerts.length > 1 && !isPaused && (
        <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Navigation arrows - only show if there's more than one alert */}
      {alerts.length > 1 && (
        <>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={goToPrevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={goToNextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicator dots */}
      {alerts.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {alerts.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => {
                setCurrentIndex(index)
                setProgress(0) // Reset progress when changing alert
              }}
              aria-label={`Go to alert ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 