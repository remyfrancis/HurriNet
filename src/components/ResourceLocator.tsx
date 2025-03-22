import { useEffect, useRef, useState } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  Source,
  Layer,
  MapRef,
  GeolocateControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { MapPin, AlertCircle } from 'lucide-react';

// Types for our resources
interface Resource {
  id: number;
  name: string;
  resource_type: string;
  description: string;
  status: string;
  capacity: number;
  current_count: number;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  coverage_area?: {
    type: string;
    coordinates: number[][][]; // GeoJSON Polygon coordinates
  };
}

interface ResourceLocatorProps {
  className?: string;
}

export function ResourceLocator({ className }: ResourceLocatorProps) {
  const mapRef = useRef<MapRef>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources from the API
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/resource-management/resources/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log('Raw API response:', data); // Debug log
      
      // Handle GeoJSON FeatureCollection format
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        const processedResources = data.features.map((feature: any) => {
          console.log('Processing feature:', feature); // Debug log
          return {
            id: feature.id || feature.properties?.id,
            name: feature.properties?.name || '',
            resource_type: feature.properties?.resource_type || '',
            description: feature.properties?.description || '',
            status: feature.properties?.status || '',
            capacity: feature.properties?.capacity || 0,
            current_count: feature.properties?.current_count || 0,
            address: feature.properties?.address || '',
            location: {
              type: 'Point',
              // Ensure coordinates are in [longitude, latitude] format for Mapbox
              coordinates: feature.geometry?.coordinates || [0, 0]
            },
            coverage_area: feature.properties?.coverage_area || null
          };
        });
        console.log('Processed resources:', processedResources); // Debug log
        setResources(processedResources.filter((resource: Resource) => 
          resource.location?.coordinates && 
          Array.isArray(resource.location.coordinates) && 
          resource.location.coordinates.length === 2
        ));
      } else if (Array.isArray(data)) {
        // Handle direct array format
        console.log('Processing direct array format:', data); // Debug log
        const processedResources = data.map((item: any) => ({
          ...item,
          location: {
            type: 'Point',
            // Convert [latitude, longitude] to [longitude, latitude] for Mapbox
            coordinates: item.location ? [item.location[1], item.location[0]] : [0, 0]
          }
        }));
        console.log('Processed array resources:', processedResources); // Debug log
        setResources(processedResources.filter((resource: Resource) => 
          resource.location?.coordinates && 
          Array.isArray(resource.location.coordinates) && 
          resource.location.coordinates.length === 2
        ));
      } else {
        throw new Error('Invalid data format received from API');
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Get status color for badges
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'LIMITED':
        return 'bg-yellow-500';
      case 'UNAVAILABLE':
        return 'bg-red-500';
      case 'ASSIGNED':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get coverage area style based on resource type
  const getCoverageAreaStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SHELTER':
        return {
          'fill-color': '#22c55e',
          'fill-opacity': 0.2,
          'line-color': '#15803d',
          'line-width': 2
        };
      case 'MEDICAL':
        return {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.2,
          'line-color': '#1d4ed8',
          'line-width': 2
        };
      case 'SUPPLIES':
        return {
          'fill-color': '#f59e0b',
          'fill-opacity': 0.2,
          'line-color': '#b45309',
          'line-width': 2
        };
      case 'WATER':
        return {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.2,
          'line-color': '#0891b2',
          'line-width': 2
        };
      default:
        return {
          'fill-color': '#6b7280',
          'fill-opacity': 0.2,
          'line-color': '#4b5563',
          'line-width': 2
        };
    }
  };

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`h-[600px] relative rounded-lg overflow-hidden ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -60.9789,
          latitude: 13.9094,
          zoom: 11
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />

        {resources.map((resource) => (
          resource.location?.coordinates ? (
            <div key={resource.id}>
              {/* Resource marker */}
              <Marker
                longitude={resource.location.coordinates[0]}
                latitude={resource.location.coordinates[1]}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedResource(resource);
                }}
              >
                <MapPin className="h-6 w-6 text-blue-600" />
              </Marker>

              {/* Coverage area */}
              {resource.coverage_area && (
                <Source
                  id={`coverage-${resource.id}`}
                  type="geojson"
                  data={resource.coverage_area}
                >
                  <Layer
                    id={`coverage-fill-${resource.id}`}
                    type="fill"
                    paint={getCoverageAreaStyle(resource.resource_type)}
                  />
                  <Layer
                    id={`coverage-line-${resource.id}`}
                    type="line"
                    paint={{
                      'line-color': getCoverageAreaStyle(resource.resource_type)['line-color'],
                      'line-width': getCoverageAreaStyle(resource.resource_type)['line-width']
                    }}
                  />
                </Source>
              )}
            </div>
          ) : null
        ))}

        {/* Resource popup */}
        {selectedResource && (
          <Popup
            longitude={selectedResource.location.coordinates[0]}
            latitude={selectedResource.location.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedResource(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-medium text-lg">{selectedResource.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedResource.description}</p>
              <div className="space-y-2">
                <Badge className={getStatusColor(selectedResource.status)}>
                  {selectedResource.status}
                </Badge>
                <p className="text-sm">
                  Available: {selectedResource.current_count} / {selectedResource.capacity}
                </p>
                <p className="text-sm text-gray-600">{selectedResource.address}</p>
              </div>
              <Button 
                className="w-full mt-2" 
                size="sm"
                onClick={() => {
                  // Navigate to resource details or trigger action
                  console.log('View details:', selectedResource.id);
                }}
              >
                View Details
              </Button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
} 