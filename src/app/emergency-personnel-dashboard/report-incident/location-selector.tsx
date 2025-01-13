'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Center of Saint Lucia
const DEFAULT_CENTER = [13.9094, -60.9789]

function LocationMarker({ position, setPosition }: { 
  position: [number, number] | null, 
  setPosition: (pos: [number, number]) => void 
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? <Marker position={position} /> : null
}

export default function LocationSelector() {
  const [position, setPosition] = useState<[number, number] | null>(null)

  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition: [number, number] = [location.coords.latitude, location.coords.longitude]
          setPosition(newPosition)
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    } else {
      console.error('Geolocation is not supported by this browser.')
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <div className="flex space-x-2 mb-4">
        <Input
          id="location"
          name="location"
          value={position ? `${position[0]}, ${position[1]}` : ''}
          readOnly
          placeholder="Click on map or use current location"
          required
        />
        <Button type="button" variant="outline" onClick={handleGetCurrentLocation}>
          <MapPin className="mr-2 h-4 w-4" />
          Use Current
        </Button>
      </div>
      <div className="h-[300px] w-full rounded-md border">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    </div>
  )
}

