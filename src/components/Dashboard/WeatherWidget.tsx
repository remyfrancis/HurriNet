'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, Wind } from 'lucide-react'

export default function WeatherWidget() {
  const [weather, setWeather] = useState({
    temperature: null,
    condition: '',
    humidity: null,
    windSpeed: null,
    loading: true,
    error: null as string | null
  })

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/weather/current/`, {
          headers: {
            'Authorization': localStorage.getItem('accessToken') || '',
          }
        })
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load weather data')
        }
        
        setWeather({
          temperature: data.temperature,
          condition: data.condition,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          loading: false,
          error: null
        })
      } catch (error) {
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load weather data'
        }))
      }
    }

    fetchWeather()
    // Refresh weather data every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (weather.loading) {
    return <div className="animate-pulse">Loading weather data...</div>
  }

  if (weather.error) {
    return <div className="text-red-500">{weather.error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-2xl font-bold">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground">{weather.condition}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium">Humidity</p>
            <p className="text-sm text-muted-foreground">{weather.humidity}%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium">Wind Speed</p>
            <p className="text-sm text-muted-foreground">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </div>
  )
} 