import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Thermometer, Wind, Sun, Umbrella, Eye, Gauge } from "lucide-react"
import { useEffect, useState } from "react"
import WeatherMap from '@/components/WeatherMap/WeatherMap'
import { weatherConditions } from '@/lib/weatherIcons'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  conditions: string
  location: string
  precipitation: number
  visibility: number
  uvIndex: number
  pressure: number
  feelsLike: number
  windGust: number
  cloudCover: number
  weatherCode: number
}

export default function CurrentWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const latitude = 13.9094
        const longitude = -60.9789
        
        const response = await fetch(
          `https://api.tomorrow.io/v4/weather/realtime?location=${latitude},${longitude}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
        )
        
        const data = await response.json()
        console.log('Weather data:', data)

        setWeatherData({
          temperature: Math.round(data.data.values.temperature),
          humidity: Math.round(data.data.values.humidity),
          windSpeed: Math.round(data.data.values.windSpeed),
          conditions: data.data.values.weatherCode,
          location: "Castries, Saint Lucia",
          precipitation: data.data.values.precipitationProbability,
          visibility: Math.round(data.data.values.visibility),
          uvIndex: Math.round(data.data.values.uvIndex),
          pressure: Math.round(data.data.values.pressureSurfaceLevel),
          feelsLike: Math.round(data.data.values.temperatureApparent),
          windGust: Math.round(data.data.values.windGust),
          cloudCover: Math.round(data.data.values.cloudCover),
          weatherCode: data.data.values.weatherCode,
        })
      } catch (error) {
        console.error('Error fetching weather data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWeatherData()
  }, [])

  if (isLoading) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
        <Card>
          <CardContent className="p-8">
            <p>Loading weather data...</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!weatherData) {
    return (
      <section>
        <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
        <Card>
          <CardContent className="p-8">
            <p>Unable to load weather data</p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Current Weather</h2>
      <Card>
        <CardHeader>
          <CardTitle>{weatherData.location}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {(() => {
                const condition = weatherConditions[weatherData.weatherCode]
                const WeatherIcon = condition.icon
                return (
                  <>
                    <WeatherIcon className={`h-8 w-8 ${condition.color}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Conditions</p>
                      <p className="text-2xl font-bold">{condition.description}</p>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="text-2xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-sm text-muted-foreground">Feels like {weatherData.feelsLike}°C</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="text-2xl font-bold">{weatherData.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Wind Speed</p>
                <p className="text-2xl font-bold">{weatherData.windSpeed} km/h</p>
                <p className="text-sm text-muted-foreground">Gusts: {weatherData.windGust} km/h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">Cloud Cover</p>
                <p className="text-2xl font-bold">{weatherData.cloudCover}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className="text-2xl font-bold">{weatherData.uvIndex}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Umbrella className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-muted-foreground">Precipitation</p>
                <p className="text-2xl font-bold">{weatherData.precipitation}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Visibility</p>
                <p className="text-2xl font-bold">{weatherData.visibility} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pressure</p>
                <p className="text-2xl font-bold">{weatherData.pressure} mb</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-4">
        <WeatherMap />
      </div>
    </section>
  )
}
