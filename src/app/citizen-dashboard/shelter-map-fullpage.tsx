'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Phone, MapPin, Users, X, Navigation, Clock } from 'lucide-react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MedicalFacility, mockMedicalFacilities as importedMedicalFacilities } from './data/medical-facilities'
import { Shelter, mockShelters as importedShelters } from './data/shelters'

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

interface ShelterMapFullpageProps {
  onSelectItem?: (item: MapItem | null) => void;
}

export function ShelterMapFullpage({ onSelectItem }: ShelterMapFullpageProps) {
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [medicalFacilities, setMedicalFacilities] = useState<MedicalFacility[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null)

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        console.log('NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
        
        if (!token) {
          setError('Authentication required')
          return
        }

        // Fetch shelters - REMOVED API CALL, using imported mock data now
        /* 
        const sheltersResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Shelters API response status:', sheltersResponse.status);

        if (!sheltersResponse.ok) {
          if (sheltersResponse.status === 401) {
            setError('Please log in again')
            return
          }
          throw new Error('Failed to fetch shelters')
        }

        const sheltersData = await sheltersResponse.json()
        console.log('Shelters API response data:', sheltersData);
        
        // Add type field to each shelter
        const typedShelters = sheltersData.map((shelter: any) => ({
          ...shelter,
          type: 'shelter',
          // Add some mock data for demonstration
          phone: shelter.phone || '+1 (555) 123-4567',
          amenities: shelter.amenities || ['Water', 'Food', 'Electricity', 'Medical Supplies'],
          last_updated: shelter.last_updated || new Date().toISOString(),
          description: shelter.description || 'Emergency shelter providing basic necessities and safety during crisis situations.'
        }))
        console.log('Typed shelters after mapping:', typedShelters);
        setShelters(typedShelters)
        */
        setShelters(importedShelters); // Use imported mock shelter data

        // Fetch medical facilities - Now using imported mock data
        setMedicalFacilities(importedMedicalFacilities);

        // Fetch active incidents from the database
        try {
          // First try to fetch from incidents endpoint
          const incidentsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Incidents API response status:', incidentsResponse.status);
          
          if (incidentsResponse.ok) {
            const incidentsData = await incidentsResponse.json();
            console.log('Incidents API response structure:', JSON.stringify(incidentsData).substring(0, 200) + '...');
            
            // Check if we have a GeoJSON FeatureCollection
            if (incidentsData.type === 'FeatureCollection' && Array.isArray(incidentsData.features)) {
              console.log('Detected GeoJSON FeatureCollection with', incidentsData.features.length, 'features');
              
              // Filter for active incidents if needed
              const activeIncidents = incidentsData.features.filter((feature: any) => 
                !feature.properties.is_resolved
              );
              
              console.log('Active incidents count after filtering:', activeIncidents.length);
              
              // Map the features to our expected format
              const typedIncidents = activeIncidents.map((feature: any) => {
                console.log('Processing feature ID:', feature.id);
                
                // Extract coordinates with validation
                let latitude = 13.9094; // Default to Saint Lucia center
                let longitude = -60.9789;
                let coordinatesSource = 'default';
                
                // Parse the EWKT geometry format
                // Example: "SRID=4326;POINT (-60.9789 13.9094)"
                if (feature.geometry && typeof feature.geometry === 'string') {
                  const ewktPointRegex = /SRID=\d+;\s*POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i;
                  const ewktMatch = feature.geometry.match(ewktPointRegex);
                  
                  if (ewktMatch && ewktMatch.length >= 3) {
                    longitude = parseFloat(ewktMatch[1]);
                    latitude = parseFloat(ewktMatch[2]);
                    if (!isNaN(longitude) && !isNaN(latitude)) {
                      coordinatesSource = 'ewkt-point';
                      console.log(`Feature ${feature.id} using EWKT Point coordinates: [${longitude}, ${latitude}]`);
                    }
                  } else {
                    console.log(`Could not parse EWKT geometry for feature ${feature.id}:`, feature.geometry);
                  }
                } else if (feature.geometry && typeof feature.geometry === 'object') {
                  // Handle GeoJSON geometry format
                  if (feature.geometry.type === 'Point' && 
                      Array.isArray(feature.geometry.coordinates) && 
                      feature.geometry.coordinates.length >= 2) {
                    // GeoJSON Point format: [longitude, latitude]
                    longitude = feature.geometry.coordinates[0];
                    latitude = feature.geometry.coordinates[1];
                    coordinatesSource = 'geojson-point';
                    console.log(`Feature ${feature.id} using GeoJSON Point coordinates: [${longitude}, ${latitude}]`);
                  }
                }
                
                console.log(`Feature ${feature.id} final coordinates [${latitude}, ${longitude}] from source: ${coordinatesSource}`);
                
                // Extract properties from the feature
                const properties = feature.properties || {};
                
                return {
                  id: feature.id,
                  title: properties.title || 'Incident Report',
                  description: properties.description || 'No description provided',
                  latitude,
                  longitude,
                  severity: (properties.severity || 'MODERATE') as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME',
                  created_at: properties.created_at || new Date().toISOString(),
                  type: 'incident' as const
                };
              });
              
              console.log('Typed incidents count after mapping:', typedIncidents.length);
              setIncidents(typedIncidents);
            } else {
              // Handle other response formats as before
              console.log('Incidents API response type:', typeof incidentsData);
              console.log('Is array?', Array.isArray(incidentsData));
              
              // Log the first few items to understand the structure
              if (Array.isArray(incidentsData) && incidentsData.length > 0) {
                console.log('First incident in array:', JSON.stringify(incidentsData[0], null, 2));
                console.log('Total incidents in array:', incidentsData.length);
              } 
              // Log pagination info if available
              else if (typeof incidentsData === 'object' && incidentsData !== null) {
                if ('count' in incidentsData) {
                  console.log('Pagination count:', incidentsData.count);
                }
                if ('next' in incidentsData) {
                  console.log('Pagination next URL:', incidentsData.next);
                }
                if ('previous' in incidentsData) {
                  console.log('Pagination previous URL:', incidentsData.previous);
                }
                if ('results' in incidentsData && Array.isArray(incidentsData.results)) {
                  console.log('Results array length:', incidentsData.results.length);
                  if (incidentsData.results.length > 0) {
                    console.log('First result in paginated response:', JSON.stringify(incidentsData.results[0], null, 2));
                  }
                }
              }
              
              if (typeof incidentsData === 'object' && incidentsData !== null) {
                console.log('Response keys:', Object.keys(incidentsData));
                
                // Check if response is paginated (common DRF format)
                let results: any[] = [];
                
                // Handle Django REST Framework pagination format
                if ('count' in incidentsData && 'results' in incidentsData && Array.isArray(incidentsData.results)) {
                  console.log('Detected DRF pagination format with', incidentsData.count, 'total items');
                  results = incidentsData.results;
                } 
                // Handle array response
                else if (Array.isArray(incidentsData)) {
                  console.log('Detected array response with', incidentsData.length, 'items');
                  results = incidentsData;
                } 
                // Handle single object response
                else if (incidentsData.id) {
                  console.log('Detected single object response with ID', incidentsData.id);
                  results = [incidentsData];
                }
                // Handle other object formats
                else if ('results' in incidentsData && Array.isArray(incidentsData.results)) {
                  console.log('Detected object with results array containing', incidentsData.results.length, 'items');
                  results = incidentsData.results;
                }
                else {
                  console.log('Unknown response format, attempting to use as is');
                  results = Array.isArray(incidentsData) ? incidentsData : [incidentsData];
                }
                
                // Filter for active incidents if needed
                const activeIncidents = results.filter((incident: any) => !incident.is_resolved);
                
                console.log('Active incidents count after filtering:', activeIncidents.length);
                
                // Map the incidents to our expected format
                const typedIncidents = activeIncidents.map((incident: any) => {
                  console.log('Raw incident data:', JSON.stringify(incident, null, 2));
                  
                  // Extract coordinates with validation
                  let latitude = 13.9094; // Default to Saint Lucia center
                  let longitude = -60.9789;
                  let coordinatesSource = 'default';
                  
                  // Try to extract coordinates from different possible formats
                  if (incident.location) {
                    console.log(`Incident ${incident.id} location type:`, typeof incident.location);
                    
                    // Handle GeoJSON format from Django's PointField
                    if (typeof incident.location === 'object') {
                      console.log(`Incident ${incident.id} location object:`, JSON.stringify(incident.location, null, 2));
                      
                      // If it's a GeoJSON object with type and coordinates
                      if (incident.location.type === 'Point' && 
                          Array.isArray(incident.location.coordinates) && 
                          incident.location.coordinates.length >= 2) {
                        // GeoJSON Point format: [longitude, latitude]
                        longitude = incident.location.coordinates[0];
                        latitude = incident.location.coordinates[1];
                        coordinatesSource = 'geojson-point';
                        console.log(`Incident ${incident.id} using GeoJSON Point coordinates: [${longitude}, ${latitude}]`);
                      } 
                      // If it's just a coordinates array
                      else if (Array.isArray(incident.location.coordinates) && 
                               incident.location.coordinates.length >= 2) {
                        longitude = incident.location.coordinates[0];
                        latitude = incident.location.coordinates[1];
                        coordinatesSource = 'coordinates-array';
                        console.log(`Incident ${incident.id} using coordinates array: [${longitude}, ${latitude}]`);
                      }
                      // If it has x and y properties (some GIS systems use this)
                      else if (typeof incident.location.x === 'number' && typeof incident.location.y === 'number') {
                        longitude = incident.location.x;
                        latitude = incident.location.y;
                        coordinatesSource = 'x-y-properties';
                        console.log(`Incident ${incident.id} using x/y properties: [${longitude}, ${latitude}]`);
                      }
                      // Try to access coordinates directly if they exist
                      else if (incident.location.coordinates) {
                        console.log(`Incident ${incident.id} coordinates structure:`, JSON.stringify(incident.location.coordinates, null, 2));
                      }
                    }
                    // If location is a string, try to parse it
                    else if (typeof incident.location === 'string') {
                      console.log(`Incident ${incident.id} location string:`, incident.location);
                      
                      // Try to parse as WKT (Well-Known Text) format
                      // Example: "POINT (-60.9789 13.9094)"
                      const wktPointRegex = /POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i;
                      const wktMatch = incident.location.match(wktPointRegex);
                      
                      // Try to parse as EWKT (Extended Well-Known Text) format
                      // Example: "SRID=4326;POINT (-60.9789 13.9094)"
                      const ewktPointRegex = /SRID=\d+;\s*POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i;
                      const ewktMatch = incident.location.match(ewktPointRegex);
                      
                      if (wktMatch && wktMatch.length >= 3) {
                        longitude = parseFloat(wktMatch[1]);
                        latitude = parseFloat(wktMatch[2]);
                        if (!isNaN(longitude) && !isNaN(latitude)) {
                          coordinatesSource = 'wkt-point';
                          console.log(`Incident ${incident.id} using WKT Point coordinates: [${longitude}, ${latitude}]`);
                        }
                      }
                      else if (ewktMatch && ewktMatch.length >= 3) {
                        longitude = parseFloat(ewktMatch[1]);
                        latitude = parseFloat(ewktMatch[2]);
                        if (!isNaN(longitude) && !isNaN(latitude)) {
                          coordinatesSource = 'ewkt-point';
                          console.log(`Incident ${incident.id} using EWKT Point coordinates: [${longitude}, ${latitude}]`);
                        }
                      }
                      // If not WKT/EWKT, try to parse as JSON
                      else {
                        try {
                          // Try to parse as JSON
                          const locationObj = JSON.parse(incident.location);
                          console.log(`Incident ${incident.id} parsed location:`, JSON.stringify(locationObj, null, 2));
                          if (locationObj.coordinates && locationObj.coordinates.length >= 2) {
                            longitude = locationObj.coordinates[0];
                            latitude = locationObj.coordinates[1];
                            coordinatesSource = 'parsed-string';
                            console.log(`Incident ${incident.id} using parsed string coordinates: [${longitude}, ${latitude}]`);
                          }
                        } catch (e) {
                          console.log(`Could not parse location string for incident ${incident.id}:`, incident.location);
                        }
                      }
                    }
                  } 
                  // Try direct latitude/longitude properties
                  else if (typeof incident.latitude === 'number' && typeof incident.longitude === 'number') {
                    latitude = incident.latitude;
                    longitude = incident.longitude;
                    coordinatesSource = 'direct-properties';
                    console.log(`Incident ${incident.id} using direct lat/lng properties: [${latitude}, ${longitude}]`);
                  } 
                  // Try string latitude/longitude properties
                  else if (incident.latitude && incident.longitude) {
                    try {
                      const lat = parseFloat(incident.latitude);
                      const lng = parseFloat(incident.longitude);
                      if (!isNaN(lat) && !isNaN(lng)) {
                        latitude = lat;
                        longitude = lng;
                        coordinatesSource = 'parsed-string-properties';
                        console.log(`Incident ${incident.id} using parsed string lat/lng: [${latitude}, ${longitude}]`);
                      }
                    } catch (e) {
                      console.log(`Could not parse lat/lng for incident ${incident.id}:`, incident.latitude, incident.longitude);
                    }
                  }
                  
                  console.log(`Incident ${incident.id} final coordinates [${latitude}, ${longitude}] from source: ${coordinatesSource}`);
                  
                  return {
                    id: incident.id,
                    title: incident.title || 'Incident Report',
                    description: incident.description || 'No description provided',
                    latitude,
                    longitude,
                    severity: (incident.severity || 'MODERATE') as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME',
                    created_at: incident.created_at,
                    type: 'incident' as const
                  };
                });
                
                console.log('Typed incidents count after mapping:', typedIncidents.length);
                setIncidents(typedIncidents);
              } else {
                console.error('Unexpected response format:', incidentsData);
              }
            }
          } else {
            console.log('Incidents API failed with status:', incidentsResponse.status);
            
            // If the API fails, use mock data
            const mockIncidents: Incident[] = [
              {
                id: 1,
                title: 'Flooding',
                description: 'Major flooding reported in this area. Roads may be impassable.',
                latitude: 13.9250,
                longitude: -60.9550,
                severity: 'HIGH' as const,
                created_at: new Date().toISOString(),
                type: 'incident'
              },
              {
                id: 2,
                title: 'Power Outage',
                description: 'Widespread power outage affecting multiple neighborhoods.',
                latitude: 13.8800,
                longitude: -61.0200,
                severity: 'MODERATE' as const,
                created_at: new Date().toISOString(),
                type: 'incident'
              }
            ];
            
            setIncidents(mockIncidents);
          }
        } catch (incidentError) {
          console.error('Error fetching incidents:', incidentError);
          // Fallback to mock data if all attempts fail
          const mockIncidents: Incident[] = [
            {
              id: 1,
              title: 'Flooding',
              description: 'Major flooding reported in this area. Roads may be impassable.',
              latitude: 13.9250,
              longitude: -60.9550,
              severity: 'HIGH' as const,
              created_at: new Date().toISOString(),
              type: 'incident'
            },
            {
              id: 2,
              title: 'Power Outage',
              description: 'Widespread power outage affecting multiple neighborhoods.',
              latitude: 13.8800,
              longitude: -61.0200,
              severity: 'MODERATE' as const,
              created_at: new Date().toISOString(),
              type: 'incident'
            }
          ];
          
          setIncidents(mockIncidents);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch map data')
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [])

  // Log all coordinates when data changes
  useEffect(() => {
    console.log('--- Shelters ---');
    shelters.forEach(shelter => {
      console.log(`Shelter ${shelter.id}: [${shelter.latitude}, ${shelter.longitude}]`);
    });
    
    console.log('--- Medical Facilities ---');
    medicalFacilities.forEach(facility => {
      console.log(`Facility ${facility.id}: [${facility.latitude}, ${facility.longitude}]`);
    });
    
    console.log('--- Incidents ---');
    incidents.forEach(incident => {
      console.log(`Incident ${incident.id}: [${incident.latitude}, ${incident.longitude}]`);
    });
  }, [shelters, medicalFacilities, incidents]);

  const handleItemClick = (item: MapItem) => {
    setSelectedItem(item)
    if (onSelectItem) {
      onSelectItem(item)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden">
        <div className="animate-pulse w-full h-full bg-gray-200"></div>
      </div>
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

  const getShelterMarkerColor = (status: Shelter['status']) => {
    switch (status) {
      case 'OPEN':
        return 'green'
      case 'FULL':
        return 'orange'
      case 'CLOSED':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getMedicalMarkerColor = (status: MedicalFacility['status']) => {
    switch (status) {
      case 'OPEN':
        return 'green'
      case 'LIMITED':
        return 'orange'
      case 'CLOSED':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getIncidentMarkerColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'EXTREME':
        return 'darkred'
      case 'HIGH':
        return 'red'
      case 'MODERATE':
        return 'orange'
      case 'LOW':
        return 'blue'
      default:
        return 'gray'
    }
  }

  // Create custom marker icons
  const createShelterIcon = (status: Shelter['status']) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${getShelterMarkerColor(status) === 'green' ? '#22c55e' : 
        getShelterMarkerColor(status) === 'orange' ? '#f97316' : 
        getShelterMarkerColor(status) === 'red' ? '#ef4444' : 
        '#6b7280'}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">S</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createMedicalIcon = (status: MedicalFacility['status']) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${getMedicalMarkerColor(status) === 'green' ? '#8b5cf6' : 
        getMedicalMarkerColor(status) === 'orange' ? '#f97316' : 
        getMedicalMarkerColor(status) === 'red' ? '#ef4444' : 
        '#6b7280'}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">M</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const createIncidentIcon = (severity: Incident['severity']) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${getIncidentMarkerColor(severity) === 'darkred' ? '#991b1b' : 
        getIncidentMarkerColor(severity) === 'red' ? '#ef4444' : 
        getIncidentMarkerColor(severity) === 'orange' ? '#f97316' : 
        getIncidentMarkerColor(severity) === 'blue' ? '#3b82f6' : 
        '#6b7280'}; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">!</div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border">
      {/* Log filtered markers */}
      {(() => {
        const filteredShelters = shelters.filter(shelter => 
          typeof shelter.latitude === 'number' && 
          typeof shelter.longitude === 'number' &&
          !isNaN(shelter.latitude) && 
          !isNaN(shelter.longitude)
        );
        
        const filteredMedical = medicalFacilities.filter(facility => 
          typeof facility.latitude === 'number' && 
          typeof facility.longitude === 'number' &&
          !isNaN(facility.latitude) && 
          !isNaN(facility.longitude)
        );
        
        const filteredIncidents = incidents.filter(incident => 
          typeof incident.latitude === 'number' && 
          typeof incident.longitude === 'number' &&
          !isNaN(incident.latitude) && 
          !isNaN(incident.longitude)
        );
        
        console.log(`Rendering ${filteredShelters.length}/${shelters.length} shelters`);
        console.log(`Rendering ${filteredMedical.length}/${medicalFacilities.length} medical facilities`);
        console.log(`Rendering ${filteredIncidents.length}/${incidents.length} incidents`);
        
        return null;
      })()}
      
      <MapContainer
        key="shelter-map-fullpage"
        center={center as [number, number]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Shelter Markers */}
        {shelters.filter(shelter => 
          typeof shelter.latitude === 'number' && 
          typeof shelter.longitude === 'number' &&
          !isNaN(shelter.latitude) && 
          !isNaN(shelter.longitude)
        ).map((shelter) => (
          <Marker
            key={`shelter-${shelter.id}`}
            position={[shelter.latitude, shelter.longitude]}
            eventHandlers={{
              click: () => handleItemClick(shelter)
            }}
            icon={createShelterIcon(shelter.status)}
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
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(shelter);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Medical Facility Markers */}
        {medicalFacilities.filter(facility => 
          typeof facility.latitude === 'number' && 
          typeof facility.longitude === 'number' &&
          !isNaN(facility.latitude) && 
          !isNaN(facility.longitude)
        ).map((facility) => (
          <Marker
            key={`medical-${facility.id}`}
            position={[facility.latitude, facility.longitude]}
            eventHandlers={{
              click: () => handleItemClick(facility)
            }}
            icon={createMedicalIcon(facility.status)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{facility.name}</h3>
                <p className="text-sm">{facility.address}</p>
                <p className="text-sm">
                  Status: <span className={`font-medium ${
                    facility.status === 'OPEN' ? 'text-green-500' :
                    facility.status === 'LIMITED' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>{facility.status}</span>
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(facility);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers */}
        {incidents.filter(incident => 
          typeof incident.latitude === 'number' && 
          typeof incident.longitude === 'number' &&
          !isNaN(incident.latitude) && 
          !isNaN(incident.longitude)
        ).map((incident) => (
          <Marker
            key={`incident-${incident.id}`}
            position={[incident.latitude, incident.longitude]}
            eventHandlers={{
              click: () => handleItemClick(incident)
            }}
            icon={createIncidentIcon(incident.severity)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">{incident.title}</h3>
                <p className="text-sm">{incident.description ? incident.description.substring(0, 50) + '...' : 'No description available'}</p>
                <p className="text-sm">
                  Severity: <span className={`font-medium ${
                    incident.severity === 'EXTREME' ? 'text-red-700' :
                    incident.severity === 'HIGH' ? 'text-red-500' :
                    incident.severity === 'MODERATE' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`}>{incident.severity}</span>
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(incident);
                  }}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
} 