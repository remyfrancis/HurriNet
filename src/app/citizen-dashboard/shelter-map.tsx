'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
})
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
})
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
})
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
})

interface Shelter {
  id: number
  name: string
  address: string
  capacity: number
  current_occupancy: number
  latitude: number
  longitude: number
  status: 'OPEN' | 'CLOSED' | 'FULL'
}

export function ShelterMap() {
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setError('Authentication required')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters/`, {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Please log in again')
            return
          }
          throw new Error('Failed to fetch shelters')
        }

        const data = await response.json()
        setShelters(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shelters')
      } finally {
        setLoading(false)
      }
    }

    fetchShelters()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-[400px] bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Saint Lucia coordinates
  const center = [13.9094, -60.9789]

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          <MapContainer
            key="shelter-map"
            center={center as [number, number]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {shelters.map((shelter) => (
              <Marker
                key={shelter.id}
                position={[shelter.latitude, shelter.longitude]}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{shelter.name}</h3>
                    <p className="text-sm">{shelter.address}</p>
                    <p className="text-sm">
                      Status: <span className={`font-medium ${
                        shelter.status === 'OPEN' ? 'text-green-500' :
                        shelter.status === 'FULL' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>{shelter.status}</span>
                    </p>
                    <p className="text-sm">
                      Occupancy: {shelter.current_occupancy}/{shelter.capacity}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
} 