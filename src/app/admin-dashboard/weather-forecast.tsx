'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WeatherForecastData {
  id: number
  date: string
  high_temp: number
  low_temp: number
  conditions: string
  conditions_display: string
  precipitation_chance: number
  wind_speed: number
  humidity: number
  location: string
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  const conditionMap: { [key: string]: JSX.Element } = {
    'SUNNY': <Sun className="h-6 w-6 text-yellow-500" />,
    'PARTLY_CLOUDY': <Cloud className="h-6 w-6 text-gray-400" />,
    'CLOUDY': <Cloud className="h-6 w-6 text-gray-500" />,
    'RAIN': <CloudRain className="h-6 w-6 text-blue-500" />,
    'STORM': <CloudRain className="h-6 w-6 text-purple-500" />,
    'HURRICANE': <Wind className="h-6 w-6 text-red-500" />
  }

  return conditionMap[condition] || <Sun className="h-6 w-6 text-yellow-500" />
}

export function WeatherForecast() {
  const [forecast, setForecast] = useState<WeatherForecastData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Authentication required')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/weather/forecast/`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in again')
            // Optionally redirect to login page
            return
          }
          throw new Error('Failed to fetch weather forecast')
        }

        const data = await response.json()
        setForecast(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather forecast')
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-2 grid-cols-7">
        {[...Array(7)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
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

  return (
    <div className="grid gap-2 grid-cols-7">
      {forecast.map((day) => (
        <Card key={day.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-bold">{Math.round(day.high_temp)}°C</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(day.low_temp)}°C
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Wind className="h-3 w-3" />
                  {Math.round(day.wind_speed)} km/h
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CloudRain className="h-3 w-3" />
                  {day.precipitation_chance}%
                </div>
              </div>
              <WeatherIcon condition={day.conditions} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 