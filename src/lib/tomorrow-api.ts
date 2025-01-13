import redis from '@/lib/redis'

const CACHE_TTL = 300 // 5 minutes
const RATE_LIMIT = {
  MAX_CALLS: 5, // Adjust based on API plan
  WINDOW: 3600, // 1 hour in seconds
  KEY_PREFIX: 'tomorrow-api-ratelimit:'
}

interface WeatherData {
  temperature: number
  precipitation: number
  windSpeed: number
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const cacheKey = `weather:${lat},${lon}`
  const rateLimitKey = `${RATE_LIMIT.KEY_PREFIX}${new Date().getHours()}`

  // Check cache first
  const cachedData = await redis.get(cacheKey)
  if (cachedData) {
    return JSON.parse(cachedData)
  }

  // Check rate limit
  const currentCalls = await redis.incr(rateLimitKey)
  
  // Set expiry for rate limit key if it's new
  if (currentCalls === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT.WINDOW)
  }

  if (currentCalls > RATE_LIMIT.MAX_CALLS) {
    throw new Error('API rate limit exceeded')
  }

  try {
    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Weather API request failed')
    }

    const data = await response.json()
    
    // Process and format the data
    const weatherData = {
      temperature: data.data.values.temperature,
      precipitation: data.data.values.precipitationIntensity,
      windSpeed: data.data.values.windSpeed,
      // Add other weather properties
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(weatherData))

    return weatherData
  } catch (error) {
    console.error('Error fetching weather data:', error)
    
    // If we have cached data, return it even if expired
    const staleData = await redis.get(cacheKey)
    if (staleData) {
      return JSON.parse(staleData)
    }
    
    throw error
  }
}

// For weather map tiles
export async function getWeatherMapUrl(z: number, x: number, y: number, layer: string): Promise<string> {
  const cacheKey = `weather-tile:${layer}:${z}:${x}:${y}`
  const rateLimitKey = `${RATE_LIMIT.KEY_PREFIX}tiles:${new Date().getHours()}`

  // Check cache first
  const cachedUrl = await redis.get(cacheKey)
  if (cachedUrl) {
    return cachedUrl
  }

  // Check rate limit
  const currentCalls = await redis.incr(rateLimitKey)
  
  if (currentCalls === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT.WINDOW)
  }

  if (currentCalls > RATE_LIMIT.MAX_CALLS) {
    throw new Error('Tile API rate limit exceeded')
  }

  const url = `https://api.tomorrow.io/v4/map/tile/${z}/${x}/${y}/${layer}?apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
  
  // Cache the URL
  await redis.setex(cacheKey, CACHE_TTL, url)
  
  return url
}

// Weather alerts
export async function getWeatherAlerts(lat: number, lon: number) {
  const cacheKey = `alerts:${lat},${lon}`
  const rateLimitKey = `${RATE_LIMIT.KEY_PREFIX}alerts:${new Date().getHours()}`

  // Check cache first
  const cachedAlerts = await redis.get(cacheKey)
  if (cachedAlerts) {
    return JSON.parse(cachedAlerts)
  }

  // Check rate limit
  const currentCalls = await redis.incr(rateLimitKey)
  
  if (currentCalls === 1) {
    await redis.expire(rateLimitKey, RATE_LIMIT.WINDOW)
  }

  if (currentCalls > RATE_LIMIT.MAX_CALLS) {
    throw new Error('Alerts API rate limit exceeded')
  }

  try {
    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/alerts?location=${lat},${lon}&apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('Weather alerts request failed')
    }

    const alerts = await response.json()
    
    // Cache the alerts
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(alerts))

    return alerts
  } catch (error) {
    console.error('Error fetching weather alerts:', error)
    
    // Return cached alerts if available
    const staleAlerts = await redis.get(cacheKey)
    if (staleAlerts) {
      return JSON.parse(staleAlerts)
    }
    
    throw error
  }
}