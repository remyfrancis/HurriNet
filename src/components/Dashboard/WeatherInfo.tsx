import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react'

// Default coordinates for Saint Lucia
const SAINT_LUCIA_COORDINATES = {
  Castries: { lat: 14.0101, lon: -60.9875 },
  'Gros Islet': { lat: 14.0722, lon: -60.9498 },
  Soufriere: { lat: 13.8566, lon: -61.0564 },
  'Vieux Fort': { lat: 13.7246, lon: -60.9490 },
  Micoud: { lat: 13.8249, lon: -60.9002 },
  default: { lat: 13.9094, lon: -60.9789 }, // Center of Saint Lucia
}

const WEATHER_CODE_MAP: { [key: number]: string } = {
  1000: "Clear",
  1100: "Mostly Clear",
  1101: "Partly Cloudy",
  1102: "Mostly Cloudy",
  1001: "Cloudy",
  2000: "Fog",
  4000: "Drizzle",
  4001: "Rain",
  // ... add more mappings as needed
};

async function getWeatherInfo(location: string) {
  const API_KEY = process.env.NEXT_PUBLIC_TOMORROW_API_KEY;
  
  try {
    // Get coordinates based on location
    const coordinates = SAINT_LUCIA_COORDINATES[location as keyof typeof SAINT_LUCIA_COORDINATES] 
      || SAINT_LUCIA_COORDINATES.default;

    // Get weather data using coordinates
    const weatherUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${coordinates.lat},${coordinates.lon}&apikey=${API_KEY}`;
    const weatherResponse = await fetch(weatherUrl, { cache: 'no-store' });
    
    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed');
    }
    
    const weatherData = await weatherResponse.json();

    return {
      temperature: Math.round(weatherData.data.values.temperature),
      humidity: Math.round(weatherData.data.values.humidity),
      windSpeed: Math.round(weatherData.data.values.windSpeed * 3.6), // Convert m/s to km/h
      conditions: WEATHER_CODE_MAP[weatherData.data.values.weatherCode] || 'Unknown',
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      temperature: '--',
      humidity: '--',
      windSpeed: '--',
      conditions: 'Unable to fetch weather',
    }
  }
}

export default async function WeatherInfo({ location }: { location: string }) {
  const weather = await getWeatherInfo(location)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Weather in {location}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span>{weather.temperature}°C</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            <span>{weather.conditions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

