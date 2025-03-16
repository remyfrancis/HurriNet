'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { ShelterMapFullpage } from '../shelter-map-fullpage'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  Phone, 
  MapPin, 
  Users, 
  X, 
  Navigation, 
  Clock, 
  AlertTriangle,
  Stethoscope,
  Coffee,
  Utensils,
  Wifi,
  Battery,
  Pill
} from 'lucide-react'

// Define types for map items
interface Shelter {
  id: number
  name: string
  address: string
  capacity: number
  current_occupancy: number
  latitude: number
  longitude: number
  status: 'OPEN' | 'CLOSED' | 'FULL'
  phone?: string
  amenities?: string[]
  last_updated?: string
  description?: string
  type: 'shelter'
}

interface MedicalFacility {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  status: 'OPEN' | 'LIMITED' | 'CLOSED'
  services?: string[]
  phone?: string
  last_updated?: string
  description?: string
  type: 'medical'
}

interface Incident {
  id: number
  title: string
  description: string
  latitude: number
  longitude: number
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  created_at: string
  type: 'incident'
}

type MapItem = Shelter | MedicalFacility | Incident;

export default function SheltersPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  const handleSelectItem = (item: MapItem | null) => {
    setSelectedItem(item)
    setSidebarOpen(!!item)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
    setSelectedItem(null)
  }

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'water':
        return <Coffee className="h-4 w-4" />
      case 'food':
        return <Utensils className="h-4 w-4" />
      case 'electricity':
        return <Battery className="h-4 w-4" />
      case 'wifi':
      case 'internet':
        return <Wifi className="h-4 w-4" />
      case 'medical supplies':
      case 'first aid':
        return <Pill className="h-4 w-4" />
      default:
        return null
    }
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-500'
      case 'FULL':
      case 'LIMITED':
        return 'bg-yellow-500'
      case 'CLOSED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'EXTREME':
        return 'bg-red-700'
      case 'HIGH':
        return 'bg-red-500'
      case 'MODERATE':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Helper function to get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'EXTREME':
        return <AlertTriangle className="h-5 w-5 text-red-700" />
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'MODERATE':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'LOW':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  // Render sidebar content based on selected item type
  const renderSidebarContent = () => {
    if (!selectedItem) return null;

    switch (selectedItem.type) {
      case 'shelter':
        return (
          <>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{selectedItem.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeSidebar}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge className={`${getStatusColor(selectedItem.status)} text-white mt-2`}>
                {selectedItem.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <p className="text-sm">{selectedItem.address}</p>
                </div>
                {selectedItem.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{selectedItem.phone}</p>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">
                    <span className="font-medium">{selectedItem.current_occupancy}</span> / {selectedItem.capacity} occupants
                  </p>
                </div>
                {selectedItem.last_updated && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(selectedItem.last_updated).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.amenities && selectedItem.amenities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center bg-muted px-2 py-1 rounded-full text-xs">
                        {getAmenityIcon(amenity)}
                        <span className="ml-1">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button className="w-full" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'medical':
        return (
          <>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{selectedItem.name}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeSidebar}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge className={`${getStatusColor(selectedItem.status)} text-white mt-2`}>
                {selectedItem.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                  <p className="text-sm">{selectedItem.address}</p>
                </div>
                {selectedItem.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-sm">{selectedItem.phone}</p>
                  </div>
                )}
                {selectedItem.last_updated && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(selectedItem.last_updated).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.services && selectedItem.services.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.services.map((service, index) => (
                      <div key={index} className="flex items-center bg-muted px-2 py-1 rounded-full text-xs">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button className="w-full" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </>
        );

      case 'incident':
        return (
          <>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{selectedItem.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={closeSidebar}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge className={`${getSeverityColor(selectedItem.severity)} text-white mt-2`}>
                {selectedItem.severity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  {getSeverityIcon(selectedItem.severity)}
                  <div className="ml-2">
                    <h3 className="text-sm font-medium">Description</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-sm">
                    Coordinates: {selectedItem.latitude.toFixed(4)}, {selectedItem.longitude.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Reported: {new Date(selectedItem.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Button className="w-full" size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                
                <Button className="w-full" size="sm" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Update
                </Button>
              </div>
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Emergency Shelters</h1>
          <p className="text-muted-foreground">
            Find nearby emergency shelters, medical facilities, and view active incidents.
          </p>
        </div>
        
        <div className="flex flex-grow h-[calc(100vh-200px)]">
          {/* Map container */}
          <div className={`flex-grow transition-all duration-300 ${sidebarOpen ? 'mr-4' : ''}`}>
            <ShelterMapFullpage onSelectItem={handleSelectItem} />
          </div>
          
          {/* Sidebar */}
          {sidebarOpen && selectedItem && (
            <div className="w-80 shrink-0">
              <Card className="h-full overflow-auto">
                {renderSidebarContent()}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 