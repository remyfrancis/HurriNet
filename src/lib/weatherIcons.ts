import { 
    Cloud, 
    CloudDrizzle, 
    CloudFog, 
    CloudLightning, 
    CloudRain, 
    CloudSnow, 
    Sun, 
    CloudSun,
    Wind as WindIcon
  } from 'lucide-react'
  
  interface WeatherCondition {
    icon: typeof Sun // Using Sun as an example, this will accept any Lucide icon
    description: string
    color: string
  }
  
  // Map Tomorrow.io weather codes to icons and descriptions
  export const weatherConditions: { [key: number]: WeatherCondition } = {
    1000: { icon: Sun, description: 'Clear, Sunny', color: 'text-yellow-500' },
    1100: { icon: CloudSun, description: 'Mostly Clear', color: 'text-yellow-400' },
    1101: { icon: CloudSun, description: 'Partly Cloudy', color: 'text-blue-400' },
    1102: { icon: Cloud, description: 'Mostly Cloudy', color: 'text-gray-400' },
    1001: { icon: Cloud, description: 'Cloudy', color: 'text-gray-500' },
    2000: { icon: CloudFog, description: 'Fog', color: 'text-gray-400' },
    2100: { icon: CloudFog, description: 'Light Fog', color: 'text-gray-400' },
    4000: { icon: CloudDrizzle, description: 'Drizzle', color: 'text-blue-400' },
    4001: { icon: CloudRain, description: 'Rain', color: 'text-blue-500' },
    4200: { icon: CloudRain, description: 'Light Rain', color: 'text-blue-400' },
    4201: { icon: CloudRain, description: 'Heavy Rain', color: 'text-blue-600' },
    5000: { icon: CloudSnow, description: 'Snow', color: 'text-blue-200' },
    5001: { icon: CloudSnow, description: 'Flurries', color: 'text-blue-200' },
    5100: { icon: CloudSnow, description: 'Light Snow', color: 'text-blue-200' },
    5101: { icon: CloudSnow, description: 'Heavy Snow', color: 'text-blue-300' },
    6000: { icon: CloudDrizzle, description: 'Freezing Drizzle', color: 'text-blue-300' },
    6001: { icon: CloudRain, description: 'Freezing Rain', color: 'text-blue-400' },
    6200: { icon: CloudRain, description: 'Light Freezing Rain', color: 'text-blue-300' },
    6201: { icon: CloudRain, description: 'Heavy Freezing Rain', color: 'text-blue-500' },
    7000: { icon: CloudLightning, description: 'Ice Pellets', color: 'text-blue-400' },
    7101: { icon: CloudLightning, description: 'Heavy Ice Pellets', color: 'text-blue-500' },
    7102: { icon: CloudLightning, description: 'Light Ice Pellets', color: 'text-blue-300' },
    8000: { icon: CloudLightning, description: 'Thunderstorm', color: 'text-yellow-500' }
  }
  
  export const getWeatherCondition = (code: number): WeatherCondition => {
    return weatherConditions[code] || { 
      icon: Cloud, 
      description: 'Unknown', 
      color: 'text-gray-500' 
    }
  }