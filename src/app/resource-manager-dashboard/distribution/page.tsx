'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ResourceManagerNav } from '../resource-manager-nav'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, MapPin, Share2, Edit, ChevronDown, Download } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import 'leaflet/dist/leaflet.css'

// Dynamically import Leaflet components to avoid SSR issues
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

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)

interface MapDialogProps {
  isOpen: boolean;
  onClose: () => void;
  distribution: Distribution;  // Pass the entire distribution object instead of just location
}

function MapDialog({ isOpen, onClose, distribution }: MapDialogProps) {
  // Get resource location coordinates
  const getResourceLocation = (dist: Distribution): [number, number] => {
    if (dist.resource_location?.coordinates) {
      return [dist.resource_location.coordinates[1], dist.resource_location.coordinates[0]];
    }
    // Fallback to Saint Lucia's coordinates
    return [13.9094, -60.9789];
  };

  const coordinates = getResourceLocation(distribution);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{distribution.resource_name} Distribution</DialogTitle>
          <DialogDescription>
            Resource location and distribution coverage area
          </DialogDescription>
        </DialogHeader>
        <div className="h-[500px] w-full relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={coordinates}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Resource Location Marker */}
              <Marker position={coordinates}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-medium">{distribution.resource_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Fulfillment: {distribution.fulfilled_requests}/{distribution.total_requests}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Distribution Coverage Area */}
              {distribution.distribution_area && (
                <GeoJSON
                  data={distribution.distribution_area}
                  style={{
                    fillColor: '#2563eb',
                    fillOpacity: 0.2,
                    color: '#1d4ed8',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-medium">Distribution Coverage Area</h3>
                      <p className="text-sm text-muted-foreground">
                        Completion Rate: {distribution.completion_rate}%
                      </p>
                    </div>
                  </Popup>
                </GeoJSON>
              )}
            </MapContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Define the distribution type
interface Distribution {
  id: number;
  resource: number | string;
  resource_name: string;
  total_requests: number;
  fulfilled_requests: number;
  completion_rate: number;
  created_at: string;
  updated_at: string;
  // GeoJSON properties
  resource_location?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  distribution_area?: {
    type: string;
    coordinates: number[][][]; // GeoJSON Polygon coordinates
  };
}

// Define the resource type
interface Resource {
  id: number;
  name: string;
}

export default function DistributionPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [distributionToEdit, setDistributionToEdit] = useState<Distribution | null>(null)
  const [newFulfilledValue, setNewFulfilledValue] = useState(0)
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null)
  
  // Form state for new distribution
  const [newDistribution, setNewDistribution] = useState({
    resource: '',
    total_requests: 0,
    fulfilled_requests: 0,
    location: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    }
  })

  // Fetch resources for the dropdown
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      console.log('Fetching resources...')
      const response = await fetch('/api/resource-management/resources/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Resources data received:', data)
      // Extract resources from the features array if it exists
      const resourcesList = data.features ? 
        data.features.map((feature: any) => ({ 
          id: feature.id, 
          name: feature.properties.name 
        })) : 
        data.map((resource: any) => ({ 
          id: resource.id, 
          name: resource.name 
        }))
      
      setResources(resourcesList)
    } catch (err) {
      console.error('Error fetching resources:', err)
      // Use mock data as fallback
      setResources([
        { id: 1, name: 'Castries Water Distribution Center' },
        { id: 2, name: 'Gros Islet Supply Depot' },
        { id: 3, name: 'Soufrière Medical Center' }
      ])
    }
  }

  // Fetch distributions from the API
  const fetchDistributions = async () => {
    console.log('Fetching distributions...');
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Make the API request
      console.log('Fetching distributions...')
      const response = await fetch('/api/resource-management/distributions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Distributions data received:', data)
      
      // Process the data based on its structure
      let processedDistributions: Distribution[] = [];
      
      // Check if the data is in GeoJSON format with features
      if (data.features) {
        console.log('Processing GeoJSON format with features array');
        processedDistributions = data.features.map((feature: any) => ({
          id: feature.id,
          resource: feature.properties.resource,
          resource_name: feature.properties.resource_name,
          total_requests: feature.properties.total_requests,
          fulfilled_requests: feature.properties.fulfilled_requests,
          completion_rate: feature.properties.completion_rate,
          created_at: feature.properties.created_at,
          updated_at: feature.properties.updated_at,
          geometry: feature.geometry
        }));
      } 
      // Check if it's a direct array
      else if (Array.isArray(data)) {
        console.log('Processing direct array format');
        processedDistributions = data;
      }
      // If it's an object with type and features (full GeoJSON)
      else if (data.type && data.type === 'FeatureCollection') {
        console.log('Processing FeatureCollection format');
        processedDistributions = data.features.map((feature: any) => ({
          id: feature.id || feature.properties.id,
          resource: feature.properties.resource,
          resource_name: feature.properties.resource_name,
          total_requests: feature.properties.total_requests,
          fulfilled_requests: feature.properties.fulfilled_requests,
          completion_rate: feature.properties.completion_rate,
          created_at: feature.properties.created_at,
          updated_at: feature.properties.updated_at,
          geometry: feature.geometry
        }));
      }
      // Fallback for other formats
      else {
        console.log('Unknown data format, using as is');
        processedDistributions = Array.isArray(data) ? data : [data];
      }
      
      // Log the processed distributions
      console.log('Processed distributions:', processedDistributions);
      
      setDistributions(processedDistributions)
      setError(null)
    } catch (err) {
      console.error('Error fetching distributions:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      // Use mock data as fallback if API fails
      const mockData = [
        { 
          id: 1, 
          resource: 1,
          resource_name: 'Castries Water Distribution Center',
          total_requests: 100,
          fulfilled_requests: 75,
          completion_rate: 75,
          created_at: '2023-06-20T10:00:00Z',
          updated_at: '2023-06-20T15:30:00Z'
        },
        { 
          id: 2, 
          resource: 2,
          resource_name: 'Gros Islet Supply Depot',
          total_requests: 50,
          fulfilled_requests: 30,
          completion_rate: 60,
          created_at: '2023-06-18T09:15:00Z',
          updated_at: '2023-06-19T14:20:00Z'
        },
        { 
          id: 3, 
          resource: 3,
          resource_name: 'Soufrière Medical Center',
          total_requests: 80,
          fulfilled_requests: 20,
          completion_rate: 25,
          created_at: '2023-06-15T08:30:00Z',
          updated_at: '2023-06-17T11:45:00Z'
        },
      ]
      setDistributions(mockData)
    } finally {
      setLoading(false)
    }
  }

  // Handle update completion
  const handleUpdateCompletion = async (id: number, newFulfilledRequests: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Ensure we have a valid ID
      if (!id) {
        console.error('Invalid distribution ID:', id)
        throw new Error('Invalid distribution ID')
      }
      
      console.log(`Updating distribution ${id} with fulfilled requests: ${newFulfilledRequests}`)
      console.log('Distribution ID type:', typeof id)
      
      // Convert ID to string to ensure consistent handling
      const distributionId = id.toString()
      
      // Send update request to API - Use hyphen to match the directory structure
      const updateUrl = `/api/resource-management/distributions/${distributionId}/update_completion/`
      console.log('Update URL:', updateUrl)
      
      const requestBody = { fulfilled_requests: newFulfilledRequests }
      console.log('Request body:', JSON.stringify(requestBody))
      
      const response = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      console.log('Update response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = `Failed to update completion: ${response.status}`
        try {
          const errorData = await response.json()
          console.error('Error response data:', errorData)
          errorMessage = errorData.error || errorData.detail || errorMessage
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError)
          const errorText = await response.text()
          console.error('Error response text:', errorText)
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('Update completion response:', data)
      
      // Success - refresh data
      toast({
        title: "Success",
        description: "Distribution completion updated successfully",
      })
      
      fetchDistributions()
    } catch (err) {
      console.error('Error updating distribution completion:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      })
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewDistribution(prev => ({
      ...prev,
      [name]: name === 'total_requests' || name === 'fulfilled_requests' ? parseInt(value) || 0 : value
    }))
  }

  // Handle resource selection
  const handleResourceChange = (value: string) => {
    setNewDistribution(prev => ({
      ...prev,
      resource: value
    }))
  }

  // Handle coordinates input
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = parseFloat(e.target.value) || 0
    setNewDistribution(prev => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: index === 0 
          ? [value, prev.location.coordinates[1]] 
          : [prev.location.coordinates[0], value]
      }
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate form
      if (!newDistribution.resource || newDistribution.total_requests <= 0) {
        throw new Error('Please fill in all required fields with valid values')
      }
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Prepare data for API
      const distributionData = {
        resource: newDistribution.resource,
        total_requests: newDistribution.total_requests,
        fulfilled_requests: newDistribution.fulfilled_requests,
        location: newDistribution.location
      }
      
      // Send data to API
      const response = await fetch('/api/resource-management/distributions/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(distributionData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create distribution')
      }
      
      // Success - close dialog and refresh data
      toast({
        title: "Success",
        description: "Distribution created successfully",
      })
      
      setIsAddDialogOpen(false)
      resetForm()
      fetchDistributions()
    } catch (err) {
      console.error('Error creating distribution:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setNewDistribution({
      resource: '',
      total_requests: 0,
      fulfilled_requests: 0,
      location: {
        type: 'Point',
        coordinates: [0, 0]
      }
    })
  }

  // Handle direct edit of fulfilled requests
  const handleEditClick = (dist: Distribution) => {
    setDistributionToEdit(dist)
    setNewFulfilledValue(dist.fulfilled_requests)
    setIsEditDialogOpen(true)
  }

  // Handle save of direct edit
  const handleEditSave = () => {
    if (!distributionToEdit) return
    
    // Ensure value is within valid range
    const validValue = Math.max(0, Math.min(distributionToEdit.total_requests, newFulfilledValue))
    
    handleUpdateCompletion(Number(distributionToEdit.id), validValue)
    setIsEditDialogOpen(false)
  }

  // Function to handle exporting data to CSV
  const handleExportData = () => {
    try {
      if (!distributions.length) {
        toast({
          title: "No Data",
          description: "There is no distribution data to export",
          variant: "destructive"
        });
        return;
      }

      console.log("=== CSV EXPORT DEBUG ===");
      console.log("Total distributions to export:", distributions.length);
      
      // Function to parse WKT geometry strings
      const parseWKTGeometry = (wktString: string): [number, number] | null => {
        try {
          // Check if it's a WKT string (e.g., "SRID=4326;POINT (-60.9667 14.0833)")
          if (typeof wktString === 'string' && wktString.includes('POINT')) {
            console.log(`  Parsing WKT string: ${wktString}`);
            
            // Extract coordinates from the POINT part
            const pointMatch = wktString.match(/POINT\s*\(([^)]+)\)/i);
            if (pointMatch && pointMatch[1]) {
              // Split the coordinates and convert to numbers
              const coords = pointMatch[1].trim().split(/\s+/);
              if (coords.length >= 2) {
                const longitude = parseFloat(coords[0]);
                const latitude = parseFloat(coords[1]);
                console.log(`  Extracted coordinates: [${longitude}, ${latitude}]`);
                return [longitude, latitude];
              }
            }
          }
          return null;
        } catch (err) {
          console.error(`  Error parsing WKT: ${err}`);
          return null;
        }
      };
      
      // Log each distribution's coordinates for debugging
      distributions.forEach((dist, index) => {
        console.log(`Distribution #${index + 1} (ID: ${dist.id}):`);
        console.log(`  Resource: ${dist.resource_name}`);
        console.log(`  Full distribution object:`, JSON.stringify(dist));
        
        // Check if geometry exists and what type it is
        if (dist.geometry) {
          console.log(`  Has geometry: true`);
          
          // Check if geometry is a string (WKT format)
          if (typeof dist.geometry === 'string') {
            console.log(`  Geometry is WKT string: ${dist.geometry}`);
            const coordinates = parseWKTGeometry(dist.geometry);
            if (coordinates) {
              console.log(`  Parsed WKT coordinates: [${coordinates[0]}, ${coordinates[1]}]`);
            } else {
              console.log(`  Failed to parse WKT coordinates`);
            }
          } 
          // Check if it's a GeoJSON geometry object
          else if (typeof dist.geometry === 'object') {
            console.log(`  Geometry type: ${dist.geometry.type}`);
            console.log(`  Raw geometry object:`, JSON.stringify(dist.geometry));
            
            // Check if coordinates exist
            if (dist.geometry.coordinates) {
              console.log(`  Has coordinates: true`);
              console.log(`  Coordinates type:`, typeof dist.geometry.coordinates);
              console.log(`  Is Array:`, Array.isArray(dist.geometry.coordinates));
              console.log(`  Coordinates length:`, Array.isArray(dist.geometry.coordinates) ? dist.geometry.coordinates.length : 'N/A');
              
              // Direct access to coordinates for debugging
              if (Array.isArray(dist.geometry.coordinates) && dist.geometry.coordinates.length >= 2) {
                console.log(`  First coordinate:`, dist.geometry.coordinates[0]);
                console.log(`  Second coordinate:`, dist.geometry.coordinates[1]);
                console.log(`  First coordinate type:`, typeof dist.geometry.coordinates[0]);
                console.log(`  Second coordinate type:`, typeof dist.geometry.coordinates[1]);
              } else {
                console.log(`  Invalid coordinates array format`);
              }
            } else {
              console.log(`  No coordinates found in geometry object`);
            }
          } else {
            console.log(`  Geometry is in unknown format:`, typeof dist.geometry);
          }
        } 
        // Check if geometry exists in properties (alternative GeoJSON structure)
        else if (dist.properties && dist.properties.geometry) {
          console.log(`  Has geometry in properties: true`);
          console.log(`  Properties geometry:`, JSON.stringify(dist.properties.geometry));
        } 
        // No geometry found
        else {
          console.log(`  No geometry data available`);
        }
      });

      // Define CSV headers
      const headers = [
        'ID',
        'Resource Center',
        'Total Requests',
        'Fulfilled Requests',
        'Completion Rate (%)',
        'Last Updated',
        'Time',
        'Coordinates'
      ];

      // Convert distribution data to CSV rows
      const rows = distributions.map(dist => {
        // Safely extract coordinates if they exist
        let coordinatesStr = 'N/A';
        
        // Try to get coordinates from the geometry object
        if (dist.geometry) {
          // Check if geometry is a WKT string
          if (typeof dist.geometry === 'string') {
            const coordinates = parseWKTGeometry(dist.geometry);
            if (coordinates) {
              // Format as "latitude,longitude" and wrap in quotes to prevent CSV splitting
              coordinatesStr = `"${coordinates[1]},${coordinates[0]}"`;
              console.log(`Formatted WKT coordinates for ID ${dist.id}: ${coordinatesStr}`);
            }
          }
          // Check if it's a GeoJSON object with coordinates array
          else if (typeof dist.geometry === 'object' && dist.geometry.coordinates) {
            // Check if coordinates is an array with at least 2 elements
            if (Array.isArray(dist.geometry.coordinates) && dist.geometry.coordinates.length >= 2) {
              // Format as "latitude,longitude" and wrap in quotes to prevent CSV splitting
              coordinatesStr = `"${dist.geometry.coordinates[1]},${dist.geometry.coordinates[0]}"`;
              console.log(`Formatted GeoJSON coordinates for ID ${dist.id}: ${coordinatesStr}`);
            } else {
              console.log(`Invalid coordinates format for ID ${dist.id}:`, dist.geometry.coordinates);
            }
          }
        } 
        // Try to get coordinates from properties.geometry as fallback
        else if (dist.properties && dist.properties.geometry) {
          // Check if properties.geometry is a WKT string
          if (typeof dist.properties.geometry === 'string') {
            const coordinates = parseWKTGeometry(dist.properties.geometry);
            if (coordinates) {
              coordinatesStr = `"${coordinates[1]},${coordinates[0]}"`;
              console.log(`Formatted WKT coordinates from properties for ID ${dist.id}: ${coordinatesStr}`);
            }
          }
          // Check if it's a GeoJSON object
          else if (typeof dist.properties.geometry === 'object' && dist.properties.geometry.coordinates) {
            if (Array.isArray(dist.properties.geometry.coordinates) && dist.properties.geometry.coordinates.length >= 2) {
              coordinatesStr = `"${dist.properties.geometry.coordinates[1]},${dist.properties.geometry.coordinates[0]}"`;
              console.log(`Formatted GeoJSON coordinates from properties for ID ${dist.id}: ${coordinatesStr}`);
            }
          }
        }
        
        if (coordinatesStr === 'N/A') {
          console.log(`No valid coordinates found for ID ${dist.id}`);
        }
        
        const row = [
          dist.id,
          // Escape commas in text fields to prevent CSV parsing issues
          dist.resource_name ? `"${dist.resource_name.replace(/"/g, '""')}"` : '',
          dist.total_requests || 0,
          dist.fulfilled_requests || 0,
          dist.completion_rate || 0,
          dist.updated_at ? new Date(dist.updated_at).toLocaleString() : '',
          coordinatesStr
        ];
        
        console.log(`CSV row for ID ${dist.id}:`, row);
        return row;
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      console.log("First 200 characters of CSV content:", csvContent.substring(0, 200) + "...");
      console.log("=== END CSV EXPORT DEBUG ===");

      // Create a Blob with the CSV data
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `distribution-data-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Distribution data has been exported to CSV",
      });
    } catch (err) {
      console.error('Error exporting data:', err);
      toast({
        title: "Export Failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
    
    // Fetch initial data
    fetchDistributions()
    fetchResources()
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  // Get status color based on completion rate
  const getCompletionColor = (rate: number) => {
    if (rate >= 75) return 'bg-green-500'
    if (rate >= 50) return 'bg-yellow-500'
    if (rate >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  // Calculate summary statistics
  const totalDistributions = Array.isArray(distributions) ? distributions.length : 0;
  const totalRequests = Array.isArray(distributions) ? 
    distributions.reduce((sum, dist) => sum + (dist.total_requests || 0), 0) : 0;
  const totalFulfilled = Array.isArray(distributions) ? 
    distributions.reduce((sum, dist) => sum + (dist.fulfilled_requests || 0), 0) : 0;
  const averageCompletionRate = totalDistributions > 0 ? 
    Math.round(
      Array.isArray(distributions) ? 
        distributions.reduce((sum, dist) => sum + (dist.completion_rate || 0), 0) / totalDistributions : 0
    ) : 0;

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Distribution Management</h1>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDistributions}</div>
                  <p className="text-xs text-muted-foreground">Active distribution operations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Fulfillment Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalFulfilled} / {totalRequests}
                  </div>
                  <Progress 
                    value={totalRequests > 0 ? (totalFulfilled / totalRequests) * 100 : 0} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageCompletionRate}%</div>
                  <p className="text-xs text-muted-foreground">Across all distribution centers</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Error message */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Loading state */}
            {loading ? (
              <Card>
                <CardContent className="pt-6 flex justify-center">
                  <p>Loading distribution data...</p>
                </CardContent>
              </Card>
            ) : (
              /* Distributions Table */
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Distribution Operations</h3>
                    <div className="text-sm text-muted-foreground">
                      {distributions.length} operations found
                    </div>
                  </div>
                  <Table>
                    <TableCaption>Distribution operations as of {new Date().toLocaleDateString()}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Resource Center</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Completion</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No distribution operations found
                          </TableCell>
                        </TableRow>
                      ) : (
                        distributions.map((dist) => (
                          <TableRow key={dist.id}>
                            <TableCell>{dist.id}</TableCell>
                            <TableCell className="font-medium">{dist.resource_name}</TableCell>
                            <TableCell>
                              {dist.fulfilled_requests} / {dist.total_requests}
                              <Progress 
                                value={(dist.fulfilled_requests / dist.total_requests) * 100} 
                                className="h-2 mt-1" 
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={getCompletionColor(dist.completion_rate)}>
                                {dist.completion_rate}%
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(dist.updated_at)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {/* Replace button with dropdown and add edit button */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center">
                                      Adjust Progress <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) {
                                        toast({
                                          title: "Error",
                                          description: "Invalid distribution ID",
                                          variant: "destructive"
                                        });
                                        return;
                                      }
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 500
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 500
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 100
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 100
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 50
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 50
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 10
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 10
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 5
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 5
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.min(
                                        dist.total_requests, 
                                        dist.fulfilled_requests + 1
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Increase by 1
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 1
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 1
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 5
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 5
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 10
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 10
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 50
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 50
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 100
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 100
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if (dist.id === undefined || dist.id === null) return;
                                      
                                      const newValue = Math.max(
                                        0, 
                                        dist.fulfilled_requests - 500
                                      );
                                      
                                      handleUpdateCompletion(Number(dist.id), newValue);
                                    }}>
                                      Decrease by 500
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center"
                                  onClick={() => handleEditClick(dist)}
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                
                                {dist.resource_location && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex items-center"
                                    onClick={() => {
                                      setSelectedDistribution(dist);
                                      setIsMapDialogOpen(true);
                                    }}
                                  >
                                    <MapPin className="h-4 w-4 mr-1" /> View Map
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            
            {/* Map Dialog */}
            {selectedDistribution && (
              <MapDialog
                isOpen={isMapDialogOpen}
                onClose={() => {
                  setIsMapDialogOpen(false);
                  setSelectedDistribution(null);
                }}
                distribution={selectedDistribution}
              />
            )}
            
            {/* Edit Dialog for direct input */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Distribution Progress</DialogTitle>
                  <DialogDescription>
                    Enter the exact number of fulfilled requests.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fulfilled_requests" className="text-right">
                      Fulfilled Requests
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="fulfilled_requests"
                        type="number"
                        min="0"
                        max={distributionToEdit?.total_requests || 0}
                        value={newFulfilledValue}
                        onChange={(e) => setNewFulfilledValue(parseInt(e.target.value) || 0)}
                      />
                      {distributionToEdit && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Total requests: {distributionToEdit.total_requests}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleEditSave}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              
              {/* Add Distribution Dialog */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Share2 className="mr-2 h-4 w-4" /> Create New Distribution
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Distribution</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new distribution operation below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resource" className="text-right">
                          Resource Center
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={newDistribution.resource.toString()}
                            onValueChange={handleResourceChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resource center" />
                            </SelectTrigger>
                            <SelectContent>
                              {resources.map(resource => (
                                <SelectItem key={resource.id} value={resource.id.toString()}>
                                  {resource.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="total_requests" className="text-right">
                          Total Requests
                        </Label>
                        <Input
                          id="total_requests"
                          name="total_requests"
                          type="number"
                          min="1"
                          value={newDistribution.total_requests}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fulfilled_requests" className="text-right">
                          Fulfilled
                        </Label>
                        <Input
                          id="fulfilled_requests"
                          name="fulfilled_requests"
                          type="number"
                          min="0"
                          max={newDistribution.total_requests}
                          value={newDistribution.fulfilled_requests}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="longitude" className="text-right">
                          Longitude
                        </Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="0.000001"
                          value={newDistribution.location.coordinates[0]}
                          onChange={(e) => handleCoordinateChange(e, 0)}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="latitude" className="text-right">
                          Latitude
                        </Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="0.000001"
                          value={newDistribution.location.coordinates[1]}
                          onChange={(e) => handleCoordinateChange(e, 1)}
                          className="col-span-3"
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm()
                          setIsAddDialogOpen(false)
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Distribution'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
