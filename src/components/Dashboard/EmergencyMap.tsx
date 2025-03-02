'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card } from "@/components/ui/card"

// Define marker types and their icons
const markerIcons = {
  incident: L.icon({
    iconUrl: '/markers/incident.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  resource: L.icon({
    iconUrl: '/markers/resource.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  medical: L.icon({
    iconUrl: '/markers/medical.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  shelter: L.icon({
    iconUrl: '/markers/shelter.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
}

interface Location {
  id: string
  type: 'incident' | 'resource' | 'medical' | 'shelter'
  name: string
  description: string
  position: [number, number] // [latitude, longitude]
  status?: string
}

interface EmergencyMapProps {
  selectedIncident?: any
  onMarkerClick?: (marker: Location) => void
}

export default function EmergencyMap({ selectedIncident, onMarkerClick }: EmergencyMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Saint Lucia's approximate center coordinates
  const defaultCenter: [number, number] = [13.9094, -60.9789]
  const defaultZoom = 12

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch all types of locations
        const [incidents, resources, medical, shelters] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resources`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical-facilities`).then(res => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters`).then(res => res.json()),
        ])

        // Combine and format all locations
        const allLocations = [
          ...incidents.map((i: any) => ({ ...i, type: 'incident' })),
          ...resources.map((r: any) => ({ ...r, type: 'resource' })),
          ...medical.map((m: any) => ({ ...m, type: 'medical' })),
          ...shelters.map((s: any) => ({ ...s, type: 'shelter' })),
        ]

        setLocations(allLocations)
        setLoading(false)
      } catch (error) {
        setError('Failed to load map data')
        setLoading(false)
      }
    }

    fetchLocations()
    // Refresh locations every 2 minutes
    const interval = setInterval(fetchLocations, 2 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="animate-pulse">Loading map...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            icon={markerIcons[location.type]}
            eventHandlers={{
              click: () => onMarkerClick?.(location),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium">{location.name}</h3>
                <p className="text-sm text-muted-foreground">{location.description}</p>
                {location.status && (
                  <p className="text-sm mt-1">Status: {location.status}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 