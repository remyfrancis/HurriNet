'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Custom icons for different incident types
const icons = {
  fire: new Icon({
    iconUrl: '/icons/fire.png',
    iconSize: [25, 25],
  }),
  flood: new Icon({
    iconUrl: '/icons/flood.png',
    iconSize: [25, 25],
  }),
  medical: new Icon({
    iconUrl: '/icons/medical.png',
    iconSize: [25, 25],
  }),
}

// Mock data for incidents
const incidents = [
  { id: 1, type: 'fire', location: 'Castries', lat: 14.0101, lng: -60.9875, status: 'Active' },
  { id: 2, type: 'flood', location: 'Vieux Fort', lat: 13.7202, lng: -60.9490, status: 'Responding' },
  { id: 3, type: 'medical', location: 'Gros Islet', lat: 14.0833, lng: -60.9500, status: 'Pending' },
]

export default function IncidentMap() {
  const [center] = useState<[number, number]>([13.9094, -60.9789]) // Center on Saint Lucia

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Incident Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={icons[incident.type as keyof typeof icons]}
            >
              <Popup>
                <strong>{incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident</strong>
                <br />
                Location: {incident.location}
                <br />
                Status: {incident.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  )
}
