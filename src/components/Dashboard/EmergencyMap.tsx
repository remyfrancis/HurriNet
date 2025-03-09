'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Card } from "@/components/ui/card"

// Dynamically import the map components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const MarkerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const PopupComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

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
  const [L, setL] = useState<any>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const mapRef = useRef<any>(null)

  // Saint Lucia's approximate center coordinates
  const defaultCenter: [number, number] = [13.9094, -60.9789]
  const defaultZoom = 12

  // Load Leaflet only on client side
  useEffect(() => {
    let mounted = true;
    
    const loadLeaflet = async () => {
      if (isMapInitialized) return; // Skip if map is already initialized
      
      try {
        const leaflet = await import('leaflet');
        if (mounted) {
          setL(leaflet.default);
          setIsMapInitialized(true);
        }
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
      }
    };

    loadLeaflet();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        setIsMapInitialized(false);
      }
    };
  }, [isMapInitialized]);

  // Handle map initialization
  const onMapCreated = (map: any) => {
    mapRef.current = map;
  };

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

  // Define marker icons after L is loaded
  const markerIcons = L ? {
    incident: new L.Icon({
      iconUrl: '/markers/incident.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
    resource: new L.Icon({
      iconUrl: '/markers/resource.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
    medical: new L.Icon({
      iconUrl: '/markers/medical.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
    shelter: new L.Icon({
      iconUrl: '/markers/shelter.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    }),
  } : null;

  if (loading) {
    return <div className="animate-pulse">Loading map...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <Suspense fallback={<div className="h-full flex items-center justify-center">Loading map...</div>}>
        {typeof window !== 'undefined' && L && markerIcons && !isMapInitialized && (
          <MapContainer
            whenCreated={onMapCreated}
            center={defaultCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayerComponent
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {locations.map((location) => (
              <MarkerComponent
                key={location.id}
                position={location.position}
                icon={markerIcons[location.type]}
                eventHandlers={{
                  click: () => onMarkerClick?.(location),
                }}
              >
                <PopupComponent>
                  <div className="p-2">
                    <h3 className="font-medium">{location.name}</h3>
                    <p className="text-sm text-muted-foreground">{location.description}</p>
                    {location.status && (
                      <p className="text-sm mt-1">Status: {location.status}</p>
                    )}
                  </div>
                </PopupComponent>
              </MarkerComponent>
            ))}
          </MapContainer>
        )}
      </Suspense>
    </div>
  )
} 