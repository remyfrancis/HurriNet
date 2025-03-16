'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, MapPin } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface IncidentForm {
  title: string
  description: string
  coordinates: [number, number] | null
  incident_type: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  photo?: File
}

// Saint Lucia bounds
const SAINT_LUCIA_BOUNDS = {
  north: 14.1,
  south: 13.7,
  west: -61.08,
  east: -60.87
}

export function IncidentReport() {
  const [formData, setFormData] = useState<IncidentForm>({
    title: '',
    description: '',
    coordinates: null,
    incident_type: '',
    severity: 'LOW',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-60.9765, 13.9094], // Saint Lucia center
      zoom: 11,
      maxBounds: [
        [SAINT_LUCIA_BOUNDS.west, SAINT_LUCIA_BOUNDS.south], // Southwest coordinates
        [SAINT_LUCIA_BOUNDS.east, SAINT_LUCIA_BOUNDS.north] // Northeast coordinates
      ]
    })

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      
      // Update or create marker
      if (marker.current) {
        marker.current.setLngLat([lng, lat])
      } else {
        marker.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current!)
      }

      setFormData(prev => ({
        ...prev,
        coordinates: [lng, lat]
      }))
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.coordinates) {
      setError('Please select a location on the map')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        return
      }

      // Format as GeoJSON Feature for GeoFeatureModelSerializer
      const geoJsonData = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: formData.coordinates
        },
        properties: {
          title: formData.title,
          description: formData.description,
          incident_type: formData.incident_type,
          severity: formData.severity
        }
      }

      console.log('Sending data:', JSON.stringify(geoJsonData, null, 2))

      // Always use FormData
      const formDataToSend = new FormData()
      
      // Add the GeoJSON data as a string in a field called 'data'
      formDataToSend.append('data', JSON.stringify(geoJsonData))
      
      // Add the photo if it exists
      if (photo) {
        formDataToSend.append('photo', photo)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, let the browser set it with the boundary
        },
        body: formDataToSend
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.detail || 'Failed to submit incident report')
        } catch (e) {
          throw new Error('Failed to submit incident report: ' + errorText.substring(0, 100))
        }
      }

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        coordinates: null,
        incident_type: '',
        severity: 'LOW',
      })
      setPhoto(null)
      
      // Reset marker
      if (marker.current) {
        marker.current.remove()
        marker.current = null
      }
      
    } catch (err) {
      console.error('Error submitting incident:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit incident report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what happened"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Location (Click on map to select)</Label>
            <div 
              ref={mapContainer} 
              className="w-full h-[300px] rounded-md border border-input"
            />
            {formData.coordinates && (
              <p className="text-sm text-muted-foreground">
                Selected coordinates: {formData.coordinates[1].toFixed(6)}, {formData.coordinates[0].toFixed(6)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="incident_type">Incident Type</Label>
            <Input
              id="incident_type"
              value={formData.incident_type}
              onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
              placeholder="e.g., Flood, Power Outage, Road Block"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <select
              id="severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentForm['severity'] })}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            >
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
              <option value="EXTREME">Extreme</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo/Video (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>Incident report submitted successfully!</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 