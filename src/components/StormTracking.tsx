'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import WeatherMap from '@/components/WeatherMap/WeatherMap'

interface StormData {
  name: string
  category: number
  windSpeed: string
  pressure: string
  movement: string
  location: string
  isActive: boolean
}

export default function StormTracking() {
  const [stormData, setStormData] = useState<StormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStormData = async () => {
      try {
        const latitude = 13.9094
        const longitude = -60.9789
        
        const response = await fetch(
          `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
        )
        
        const data = await response.json()
        console.log('Storm data:', data)

        // Process the data to determine if there's an active storm
        const windSpeed = data.data.values.windSpeed
        const pressure = data.data.values.pressureSurfaceLevel
        const isStorm = windSpeed > 74 // Hurricane wind speed threshold in mph

        if (isStorm) {
          // Determine hurricane category based on wind speed
          const category = getHurricaneCategory(windSpeed)
          
          setStormData({
            name: "Active Tropical System", // You'll need to get this from a hurricane-specific API
            category: category,
            windSpeed: `${Math.round(windSpeed)} mph`,
            pressure: `${Math.round(pressure)} mb`,
            movement: `${data.data.values.windDirection}° at ${Math.round(data.data.values.windSpeed)} mph`,
            location: "Near Saint Lucia",
            isActive: true
          })
        } else {
          setStormData({
            name: "No Active Storms",
            category: 0,
            windSpeed: `${Math.round(windSpeed)} mph`,
            pressure: `${Math.round(pressure)} mb`,
            movement: `${data.data.values.windDirection}° at ${Math.round(data.data.values.windSpeed)} mph`,
            location: "N/A",
            isActive: false
          })
        }
      } catch (error) {
        console.error('Error fetching storm data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStormData()
  }, [])

  // Helper function to determine hurricane category
  const getHurricaneCategory = (windSpeed: number): number => {
    if (windSpeed >= 157) return 5
    if (windSpeed >= 130) return 4
    if (windSpeed >= 111) return 3
    if (windSpeed >= 96) return 2
    if (windSpeed >= 74) return 1
    return 0
  }

  if (isLoading) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Storm Tracking</h2>
        <Card>
          <CardContent className="p-8">
            <p>Loading storm data...</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!stormData) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Storm Tracking</h2>
        <Card>
          <CardContent className="p-8">
            <p>Unable to load storm data</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Storm Tracking</h2>
      
      {/* Storm Data Card */}
      <Card>
        <CardHeader>
          <CardTitle>{stormData.name}</CardTitle>
          {stormData.isActive && (
            <CardDescription>Category {stormData.category} Hurricane</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li><strong>Wind Speed:</strong> {stormData.windSpeed}</li>
            <li><strong>Pressure:</strong> {stormData.pressure}</li>
            <li><strong>Movement:</strong> {stormData.movement}</li>
            <li><strong>Current Location:</strong> {stormData.location}</li>
          </ul>
        </CardContent>
      </Card>

      {/* Weather Map Card */}
      <Card>
        <CardHeader>
          <CardTitle>Weather Radar</CardTitle>
          <CardDescription>Current weather conditions around Saint Lucia</CardDescription>
        </CardHeader>
        <CardContent>
          <WeatherMap />
        </CardContent>
      </Card>
    </section>
  )
}

