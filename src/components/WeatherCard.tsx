'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Sun, Cloud, CloudLightning, CloudDrizzle } from 'lucide-react'

type WeatherData = {
  location: string
  temperature: number
  humidity: number
  wind_speed: number
  conditions: string
  timestamp: string
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/weather/Castries/`)
        const data = await response.json()
        setWeather(data)
      } catch (error) {
        console.error('Error fetching weather:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  const getWeatherIcon = (conditions: string) => {
    switch (conditions.toLowerCase()) {
      case 'rain':
        return <CloudRain size={48} />
      case 'clear':
        return <Sun size={48} />
      case 'clouds':
        return <Cloud size={48} />
      case 'thunderstorm':
        return <CloudLightning size={48} />
      case 'drizzle':
        return <CloudDrizzle size={48} />
      default:
        return <Cloud size={48} />
    }
  }

  if (loading) return <div>Loading weather data...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Weather</CardTitle>
        <CardDescription>Weather conditions in Saint Lucia</CardDescription>
      </CardHeader>
      <CardContent>
        {weather && (
          <div className="flex items-center space-x-4">
            {getWeatherIcon(weather.conditions)}
            <div>
              <p className="text-2xl font-bold">{Math.round(weather.temperature)}°C</p>
              <p className="capitalize">{weather.conditions}</p>
              <p>Humidity: {Math.round(weather.humidity)}%</p>
              <p>Wind: {Math.round(weather.wind_speed)} km/h</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}