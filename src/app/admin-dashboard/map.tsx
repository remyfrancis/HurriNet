'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface EmergencyLocation {
  position: [number, number] // Tuple type for coordinates
  title: string
  type: 'warning' | 'alert' | 'shelter' | 'medical' | 'team'
  description: string
  color: string
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-60.9789, 13.9094], // Saint Lucia coordinates
      zoom: 11
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Define emergency locations with different types
    const emergencyLocations: EmergencyLocation[] = [
      {
        position: [-60.9875, 14.0101], // Castries
        title: 'Hurricane Warning Zone',
        type: 'warning',
        description: 'Category 2 hurricane approaching. Evacuation recommended.',
        color: '#ef4444', // red
      },
      {
        position: [-60.9500, 14.0833], // Gros Islet
        title: 'Flood Alert Area',
        type: 'alert',
        description: 'High risk of flooding. Prepare for evacuation.',
        color: '#f97316', // orange
      },
      {
        position: [-60.9500, 13.7167], // Vieux Fort
        title: 'Emergency Shelter',
        type: 'shelter',
        description: 'Capacity: 500 people. Currently available.',
        color: '#22c55e', // green
      },
      {
        position: [-61.0500, 13.8500], // Soufriere
        title: 'Medical Center',
        type: 'medical',
        description: '24/7 Emergency services available',
        color: '#3b82f6', // blue
      },
      {
        position: [-60.9000, 13.9500], // Dennery
        title: 'Emergency Response Team',
        type: 'team',
        description: 'Search and rescue team deployed',
        color: '#8b5cf6', // purple
      },
    ]

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      if (!map.current || !mapContainer.current) return

      const currentMap = map.current // Store reference to avoid null checks

      // Add markers and circles for emergency zones
      emergencyLocations.forEach((location) => {
        // Create marker element
        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.style.backgroundColor = location.color
        el.style.width = '24px'
        el.style.height = '24px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)'

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat(location.position)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${location.title}</h3>
                  <p class="text-sm">${location.description}</p>
                </div>
              `)
          )
          .addTo(currentMap)

        // Add circle for warning/alert zones
        if (location.type === 'warning' || location.type === 'alert') {
          currentMap.addSource(`circle-${location.title}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: location.position
              },
              properties: {}
            }
          })

          currentMap.addLayer({
            id: `circle-${location.title}`,
            type: 'circle',
            source: `circle-${location.title}`,
            paint: {
              'circle-radius': 2000,
              'circle-color': location.color,
              'circle-opacity': 0.2,
              'circle-stroke-width': 2,
              'circle-stroke-color': location.color
            }
          })
        }
      })

      // Add legend
      const legend = document.createElement('div')
      legend.className = 'legend'
      legend.style.position = 'absolute'
      legend.style.bottom = '20px'
      legend.style.right = '20px'
      legend.style.backgroundColor = 'white'
      legend.style.padding = '10px'
      legend.style.borderRadius = '4px'
      legend.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)'
      legend.innerHTML = `
        <h4 class="font-bold mb-2">Legend</h4>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div style="background: #ef4444; width: 12px; height: 12px; border-radius: 50%;"></div>
            <span>Warning Zone</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="background: #f97316; width: 12px; height: 12px; border-radius: 50%;"></div>
            <span>Alert Area</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="background: #22c55e; width: 12px; height: 12px; border-radius: 50%;"></div>
            <span>Shelter</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%;"></div>
            <span>Medical Center</span>
          </div>
          <div class="flex items-center gap-2">
            <div style="background: #8b5cf6; width: 12px; height: 12px; border-radius: 50%;"></div>
            <span>Response Team</span>
          </div>
        </div>
      `
      mapContainer.current.appendChild(legend)
    })

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  return <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
} 