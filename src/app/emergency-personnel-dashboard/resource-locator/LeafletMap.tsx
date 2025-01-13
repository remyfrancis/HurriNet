'use client'

import { Resource } from '@/lib/types'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface LeafletMapProps {
  resources: Resource[]
}

export default function LeafletMap({ resources }: LeafletMapProps) {
  return (
    <MapContainer
      center={[13.9094, -60.9789]} // Saint Lucia coordinates
      zoom={11}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {resources.map(resource => (
        <Marker
          key={resource.id}
          position={[resource.location.lat, resource.location.lng]}
        >
          <Popup>{resource.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}