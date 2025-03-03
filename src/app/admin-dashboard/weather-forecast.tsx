'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Cloud, CloudRain, Sun, Wind } from 'lucide-react'

interface WeatherData {
  date: string
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy'
  windSpeed: number
  precipitation: number
}

const mockForecast: WeatherData[] = [
  {
    date: '2024-03-31',
    temp: 28,
    condition: 'windy',
    windSpeed: 45,
    precipitation: 80,
  },
  {
    date: '2024-04-01',
    temp: 27,
    condition: 'rainy',
    windSpeed: 50,
    precipitation: 90,
  },
  {
    date: '2024-04-02',
    temp: 29,
    condition: 'cloudy',
    windSpeed: 35,
    precipitation: 60,
  },
  {
    date: '2024-04-03',
    temp: 30,
    condition: 'sunny',
    windSpeed: 20,
    precipitation: 20,
  },
]

const WeatherIcon = ({ condition }: { condition: WeatherData['condition'] }) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="h-6 w-6 text-yellow-500" />
    case 'cloudy':
      return <Cloud className="h-6 w-6 text-gray-500" />
    case 'rainy':
      return <CloudRain className="h-6 w-6 text-blue-500" />
    case 'windy':
      return <Wind className="h-6 w-6 text-purple-500" />
  }
}

export function WeatherForecast() {
  const [forecast, setForecast] = useState<WeatherData[]>(mockForecast)

  useEffect(() => {
    // TODO: Fetch real weather data from the API
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {forecast.map((day) => (
        <Card key={day.date}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-2xl font-bold">{day.temp}°C</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  {day.windSpeed} km/h
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CloudRain className="h-4 w-4" />
                  {day.precipitation}%
                </div>
              </div>
              <WeatherIcon condition={day.condition} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 