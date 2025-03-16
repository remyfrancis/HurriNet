'use client'

import { useEffect, useState, useRef } from 'react'
import { CitizenNav } from '../citizen-nav'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Upload, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { LatLngTuple, Icon, DivIcon } from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'

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

// Saint Lucia center coordinates (explicitly typed as LatLngTuple)
const SAINT_LUCIA_CENTER: LatLngTuple = [13.9094, -60.9789]

interface IncidentForm {
  title: string
  description: string
  latitude: number | null
  longitude: number | null
  incident_type: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  photo?: File
}

// Create a separate component for the map with click handler
const MapWithClickHandler = ({ onMapClick, markerPosition, severity }: { 
  onMapClick: (lat: number, lng: number) => void,
  markerPosition: LatLngTuple | null,
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
}) => {
  // Import the hook directly
  const ClickHandler = dynamic(() => 
    import('react-leaflet').then((mod) => {
      const ClickComponent = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
        const map = mod.useMapEvents({
          click(e) {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
          },
        });
        return null;
      };
      return ClickComponent;
    }),
    { ssr: false }
  );

  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME':
        return '#dc2626'; // text-red-600
      case 'HIGH':
        return '#ef4444'; // text-red-500
      case 'MODERATE':
        return '#eab308'; // text-yellow-500
      case 'LOW':
        return '#3b82f6'; // text-blue-500
      default:
        return '#6b7280'; // text-gray-500
    }
  };

  // Create custom icon HTML
  const iconHtml = markerPosition ? renderToStaticMarkup(
    <div style={{ 
      color: getSeverityColor(severity),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </svg>
    </div>
  ) : '';

  // Create a custom icon when the component mounts
  const [customIcon, setCustomIcon] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && markerPosition) {
      // Create the icon on the client side
      const icon = new DivIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });
      setCustomIcon(icon);
    }
  }, [markerPosition, iconHtml]);

  return (
    <MapContainer 
      center={SAINT_LUCIA_CENTER} 
      zoom={11} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      {markerPosition && customIcon && (
        <Marker 
          position={markerPosition} 
          icon={customIcon}
        >
          <Popup>
            Incident location
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

// Wrap the component with dynamic to avoid SSR issues
const DynamicMapWithClickHandler = dynamic(() => Promise.resolve(MapWithClickHandler), {
  ssr: false,
});

export default function ReportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [markerPosition, setMarkerPosition] = useState<LatLngTuple | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<IncidentForm>({
    title: '',
    description: '',
    latitude: null,
    longitude: null,
    incident_type: '',
    severity: 'LOW',
  })

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleMapClick = (lat: number, lng: number) => {
    console.log(`Map clicked at: ${lat}, ${lng}`);
    setMarkerPosition([lat, lng]);
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location on the map')
      toast({
        title: "Error",
        description: "Please select a location on the map",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Authentication required')
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        })
        return
      }

      // Format data as a GeoJSON Feature object with the exact structure the backend expects
      const geoJsonData = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [formData.longitude, formData.latitude] // Longitude first, then latitude
        },
        properties: {
          title: formData.title,
          description: formData.description,
          incident_type: formData.incident_type,
          severity: formData.severity
        }
      }
      
      // Create the location as a GeoJSON Point object
      // This is what the serializer.validate_location method expects
      const locationData = {
        type: "Point",
        coordinates: [formData.longitude, formData.latitude]
      }
      
      console.log('Preparing GeoJSON data:', JSON.stringify(geoJsonData, null, 2))
      console.log('Preparing location data:', JSON.stringify(locationData, null, 2))
      
      // Create FormData object
      const formDataToSend = new FormData()
      
      // Add the GeoJSON as a string in a field called 'data'
      // This is the key field that the backend processes in the create method
      formDataToSend.append('data', JSON.stringify(geoJsonData))
      
      // CRITICAL: Add the location field separately
      // The serializer is specifically looking for this field
      formDataToSend.append('location', JSON.stringify(locationData))
      
      // Also add the individual fields for completeness
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('incident_type', formData.incident_type)
      formDataToSend.append('severity', formData.severity)
      
      console.log('Sending form data with fields:', 
        Array.from(formDataToSend.entries()).map(entry => entry[0]).join(', '))
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No Content-Type header - browser will set it to multipart/form-data with boundary
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

      // Reset form
      setFormData({
        title: '',
        description: '',
        latitude: null,
        longitude: null,
        incident_type: '',
        severity: 'LOW',
      })
      setMarkerPosition(null)
      
      toast({
        title: "Success",
        description: "Incident report submitted successfully",
        variant: "default"
      })
      
    } catch (err) {
      console.error('Error submitting incident:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit incident report')
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to submit incident report',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Report an Incident</h1>
          </div>
          <p className="text-muted-foreground">
            Report emergencies, hazards, or other incidents to help keep your community safe and informed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Map Section */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Select Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] w-full rounded-md overflow-hidden">
                  {typeof window !== 'undefined' && (
                    <DynamicMapWithClickHandler 
                      onMapClick={handleMapClick}
                      markerPosition={markerPosition}
                      severity={formData.severity}
                    />
                  )}
                </div>
                {markerPosition && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected coordinates: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Form Section */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Incident Details</CardTitle>
              </CardHeader>
              <CardContent>
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

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !formData.latitude || !formData.longitude}
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 