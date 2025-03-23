'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useWebSocket } from '@/hooks/useWebSocket'

// Note: Replace with your actual Mapbox token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MedicalFacility {
  id: number
  name: string
  location: [number, number]
  status: 'available' | 'busy' | 'full'
  activeResponses: number
}

interface EmergencyStats {
  activeEmergencies: number
  availableFacilities: number
  activeTeams: number
  averageResponseTime: number
}

export default function RealTimeOverview() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: number]: mapboxgl.Marker }>({})

  const [stats, setStats] = useState<EmergencyStats>({
    activeEmergencies: 0,
    availableFacilities: 0,
    activeTeams: 0,
    averageResponseTime: 0
  })
  const [facilities, setFacilities] = useState<MedicalFacility[]>([])
  
  // WebSocket connection for real-time updates
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/medical-dashboard/')

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.5, 40], // Default center - will be updated based on facilities
      zoom: 9
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update markers when facilities change
  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    Object.values(markers.current).forEach(marker => marker.remove())
    markers.current = {}

    // Add new markers
    facilities.forEach(facility => {
      const el = document.createElement('div')
      el.className = 'w-8 h-8 rounded-full border-2 cursor-pointer'
      
      // Set color based on status
      const statusColors = {
        available: 'bg-green-500 border-green-600',
        busy: 'bg-yellow-500 border-yellow-600',
        full: 'bg-red-500 border-red-600'
      }
      el.className += ` ${statusColors[facility.status]}`

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${facility.name}</h3>
          <p class="text-sm">Status: ${facility.status}</p>
          <p class="text-sm">Active Responses: ${facility.activeResponses}</p>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat(facility.location)
        .setPopup(popup)
        .addTo(map.current!)

      markers.current[facility.id] = marker
    })

    // Fit map to show all markers if there are any facilities
    if (facilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      facilities.forEach(facility => {
        bounds.extend(facility.location)
      })
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [facilities])

  // Handle WebSocket updates
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data)
      if (data.type === 'stats_update') {
        setStats(data.stats)
      } else if (data.type === 'facilities_update') {
        setFacilities(data.facilities)
      }
    }
  }, [lastMessage])

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsRes, facilitiesRes] = await Promise.all([
          fetch('/api/medical/stats'),
          fetch('/api/medical/facilities')
        ])
        const statsData = await statsRes.json()
        const facilitiesData = await facilitiesRes.json()
        
        setStats(statsData)
        setFacilities(facilitiesData)
      } catch (error) {
        console.error('Failed to fetch initial data:', error)
      }
    }

    fetchInitialData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.activeEmergencies}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.availableFacilities}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.activeTeams}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageResponseTime}m
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-[400px]">
        <CardHeader>
          <CardTitle>Facility Map View</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-full w-full rounded-b-lg" />
        </CardContent>
      </Card>
    </div>
  )
} 