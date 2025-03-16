'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Cloud, CloudRain, CloudLightning, CloudSnow, Sun } from 'lucide-react'

interface WeatherForecastData {
  id: number
  date: string
  high_temp: number
  low_temp: number
  conditions: string
  precipitation_chance: number
  wind_speed: number
}

const WeatherIcon = ({ conditions }: { conditions: string }) => {
  const iconMap: { [key: string]: JSX.Element } = {
    'SUNNY': <Sun className="h-8 w-8 text-yellow-500" />,
    'PARTLY_CLOUDY': <Cloud className="h-8 w-8 text-gray-400" />,
    'CLOUDY': <Cloud className="h-8 w-8 text-gray-500" />,
    'RAIN': <CloudRain className="h-8 w-8 text-blue-500" />,
    'STORM': <CloudLightning className="h-8 w-8 text-purple-500" />,
    'HURRICANE': <CloudLightning className="h-8 w-8 text-red-500" />,
    'SNOW': <CloudSnow className="h-8 w-8 text-blue-300" />
  }
  return iconMap[conditions] || <Cloud className="h-8 w-8 text-gray-500" />
}

export function WeatherForecast() {
  const [forecast, setForecast] = useState<WeatherForecastData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('No authentication token found')
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/weather/forecast/`, {
          headers: {
            'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          }
          throw new Error('Failed to fetch weather data')
        }
        const data = await response.json()
        setForecast(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) return <div>Loading weather data...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {forecast.map((day) => (
        <Card key={day.id}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <WeatherIcon conditions={day.conditions} />
              <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-1">High:</span>
                <span className="text-lg font-bold">{Math.round(day.high_temp)}°</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-500 mr-1">Low:</span>
                <span className="text-sm text-gray-500">{Math.round(day.low_temp)}°</span>
              </div>
              <div className="text-xs text-gray-500">
                Wind: {day.wind_speed > 0 
                  ? `${(day.wind_speed * 2.237).toFixed(1)} mph` 
                  : 'Calm'}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 