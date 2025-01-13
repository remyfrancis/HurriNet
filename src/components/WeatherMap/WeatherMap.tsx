import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getWeatherMapUrl } from '@/lib/tomorrow-api'

interface LegendConfig {
  [key: string]: {
    title: string,
    units: string,
    colors: string[],
    values: number[]
  }
}

const legendConfig: LegendConfig = {
  precipitation: {
    title: 'Precipitation',
    units: 'mm/hr',
    colors: ['#d3d3d3', '#99ccff', '#3399ff', '#0066ff', '#0000ff', '#660066'],
    values: [0, 0.1, 1, 2.5, 5, 10]
  },
  temperature: {
    title: 'Temperature',
    units: '°C',
    colors: ['#0000ff', '#3399ff', '#99ccff', '#ffff00', '#ff9900', '#ff0000'],
    values: [0, 10, 15, 20, 25, 30]
  },
  wind: {
    title: 'Wind Speed',
    units: 'km/h',
    colors: ['#d3d3d3', '#99ff99', '#ffff00', '#ff9900', '#ff0000', '#990000'],
    values: [0, 10, 20, 30, 40, 50]
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const weatherCache = new Map()

export default function WeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [activeLayer, setActiveLayer] = useState('precipitation')
  const [error, setError] = useState<string | null>(null)

  const getCachedData = (key: string) => {
    const cached = weatherCache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  const setCachedData = (key: string, data: any) => {
    weatherCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  // Create Legend Component
  const Legend = ({ layer }: { layer: string }) => {
    const config = legendConfig[layer]
    
    return (
      <div className="bg-white p-2 rounded-lg shadow-lg">
        <h3 className="text-sm font-semibold mb-2">{config.title} ({config.units})</h3>
        <div className="flex flex-col gap-1">
          {config.colors.map((color, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">
                {index === config.values.length - 1 
                  ? `>${config.values[index]}` 
                  : `${config.values[index]} - ${config.values[index + 1]}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Add error handling component
  const ErrorMessage = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
      <div className="text-center p-4">
        <p className="text-red-600 font-semibold">Unable to load weather data</p>
        <p className="text-sm text-gray-600 mt-2">Please try again later</p>
      </div>
    </div>
  )

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-60.9789, 13.9094],
      zoom: 9,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    })

    map.current = initializeMap

    initializeMap.on('load', () => {
      try {
        // Add precipitation layer with error handling
        initializeMap.addSource('precipitation', {
          type: 'raster',
          tiles: [
            `https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/precipitationIntensity?apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
          ],
          tileSize: 256,
        })

      initializeMap.addLayer({
        id: 'precipitation-layer',
        type: 'raster',
        source: 'precipitation',
        paint: {
          'raster-opacity': 0.6
        }
      })

        // Add temperature layer with error handling
        initializeMap.addSource('temperature', {
          type: 'raster',
          tiles: [
            `https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/temperature?apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
          ],
          tileSize: 256,
        })

      initializeMap.addLayer({
        id: 'temperature-layer',
        type: 'raster',
        source: 'temperature',
        paint: {
          'raster-opacity': 0
        }
      })

        // Add wind layer with error handling
        initializeMap.addSource('wind', {
          type: 'raster',
          tiles: [
            `https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/windSpeed?apikey=${process.env.NEXT_PUBLIC_TOMORROW_API_KEY}`
          ],
          tileSize: 256,
        })

      initializeMap.addLayer({
        id: 'wind-layer',
        type: 'raster',
        source: 'wind',
        paint: {
          'raster-opacity': 0
        }
      })

        setMapLoaded(true)
      } catch (err) {
        console.error('Error loading map layers:', err)
        setError('Failed to load weather layers')
      }
    })

    // Add error handling for map load failures
    initializeMap.on('error', (e) => {
      console.error('Map error:', e)
      setError('Failed to load weather data')
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Add layer controls after map is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainer.current) return

    const layerControls = document.createElement('div')
    layerControls.className = 'map-overlay bg-white p-4 rounded-lg shadow-lg'
    layerControls.style.position = 'absolute'
    layerControls.style.top = '10px'
    layerControls.style.right = '10px'
    layerControls.style.zIndex = '1'

    const layers = [
      { id: 'precipitation', label: 'Precipitation' },
      { id: 'temperature', label: 'Temperature' },
      { id: 'wind', label: 'Wind Speed' }
    ]

    layers.forEach(({ id, label }) => {
      const container = document.createElement('div')
      container.className = 'flex items-center gap-2 mb-2'

      const radio = document.createElement('input')
      radio.type = 'radio'
      radio.name = 'layer'
      radio.id = `${id}-toggle`
      radio.className = 'form-radio h-4 w-4'
      radio.checked = id === 'precipitation'
      
      const labelElement = document.createElement('label')
      labelElement.htmlFor = `${id}-toggle`
      labelElement.textContent = label
      labelElement.className = 'text-sm text-gray-700'

      radio.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (map.current && target.checked) {
          // Hide all layers
          layers.forEach(l => {
            map.current?.setPaintProperty(
              `${l.id}-layer`,
              'raster-opacity',
              0
            )
          })
          // Show selected layer
          map.current.setPaintProperty(
            `${id}-layer`,
            'raster-opacity',
            0.6
          )
          setActiveLayer(id)
        }
      })

      container.appendChild(radio)
      container.appendChild(labelElement)
      layerControls.appendChild(container)
    })

    mapContainer.current.appendChild(layerControls)

    return () => {
      layerControls.remove()
    }
  }, [mapLoaded])

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg overflow-hidden" />
      {error ? (
        <ErrorMessage />
      ) : (
        mapLoaded && (
          <div className="absolute bottom-4 left-4">
            <Legend layer={activeLayer} />
          </div>
        )
      )}
    </div>
  )
}