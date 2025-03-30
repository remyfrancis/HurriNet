import { useEffect, useRef, useState } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  MapRef,
  Source,
  Layer
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import { defaultResourceLocations } from '@/lib/default-locations';

interface GeoJSONFeature {
  type: "Feature";
  geometry: [number, number] | {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: number;
    name: string;
    resource_type: string;
    description?: string;
    status: string;
    capacity: number;
    current_count: number;
    coverage_area?: {
      type: "Polygon";
      coordinates: [number, number][][];
    };
  };
}

interface Resource {
  id: number;
  name: string;
  resource_type: string;
  description?: string;
  status: string;
  capacity: number;
  current_count: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  coverage_area?: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

export interface SelectedResourceInfo {
    id: number;
    name: string;
    capacity: number;
    current_count: number;
}

interface DashboardResourceMapProps {
  onLocationSelect: (resourceInfo: SelectedResourceInfo) => void;
}

export function DashboardResourceMap({ onLocationSelect }: DashboardResourceMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Fetch resources from the API
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        const defaultResources = defaultResourceLocations.map(loc => ({
          id: loc.id || 0,
          name: loc.name,
          resource_type: loc.type,
          description: `Default ${loc.type.toLowerCase()} location`,
          status: 'AVAILABLE',
          capacity: 100,
          current_count: 50,
          location: {
            type: 'Point',
            coordinates: loc.coordinates as [number, number]
          },
          coverage_area: undefined
        }));
        console.log('Using default resources:', defaultResources);
        setResources(defaultResources);
        return;
      }

      const response = await fetch('/api/resource-management/resources/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const defaultResources = defaultResourceLocations.map(loc => ({
          id: loc.id || 0,
          name: loc.name,
          resource_type: loc.type,
          description: `Default ${loc.type.toLowerCase()} location`,
          status: 'AVAILABLE',
          capacity: 100,
          current_count: 50,
          location: {
            type: 'Point',
            coordinates: loc.coordinates as [number, number]
          },
          coverage_area: undefined
        }));
        console.log('Using default resources (API error):', defaultResources);
        setResources(defaultResources);
        return;
      }

      const data = await response.json();
      
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        console.log('Raw features:', data.features);
        const processedResources = data.features.map((feature: GeoJSONFeature) => {
          console.log('Processing feature:', feature);
          const coordinates = Array.isArray(feature.geometry) ? feature.geometry : feature.geometry.coordinates;
          return {
            id: feature.properties.id ?? 0,
            name: feature.properties.name,
            resource_type: feature.properties.resource_type,
            description: feature.properties.description,
            status: feature.properties.status,
            capacity: feature.properties.capacity ?? 0,
            current_count: feature.properties.current_count ?? 0,
            location: {
              type: 'Point',
              coordinates: coordinates
            },
            coverage_area: feature.properties.coverage_area
          };
        });
        console.log('Processed resources:', processedResources);
        setResources(processedResources);
      } else if (Array.isArray(data)) {
        console.log('Raw data array:', data);
        const mappedData = data.map(res => ({
          ...res,
          id: res.id ?? 0,
          capacity: res.capacity ?? 0,
          current_count: res.current_count ?? 0
        }));
        setResources(mappedData);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      const defaultResources = defaultResourceLocations.map(loc => ({
        id: loc.id || 0,
        name: loc.name,
        resource_type: loc.type,
        description: `Default ${loc.type.toLowerCase()} location`,
        status: 'AVAILABLE',
        capacity: 100,
        current_count: 50,
        location: {
          type: 'Point',
          coordinates: loc.coordinates as [number, number]
        },
        coverage_area: undefined
      }));
      console.log('Using default resources (error fallback):', defaultResources);
      setResources(defaultResources);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Get marker color based on resource type
  const getMarkerColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SHELTER':
        return 'text-green-600';
      case 'MEDICAL':
        return 'text-blue-600';
      case 'SUPPLIES':
        return 'text-yellow-600';
      case 'WATER':
        return 'text-cyan-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get coverage area style based on resource type
  const getCoverageAreaStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'SHELTER':
        return {
          'fill-color': '#22c55e',
          'fill-opacity': 0.1,
          'line-color': '#16a34a',
          'line-width': 1
        };
      case 'MEDICAL':
        return {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.1,
          'line-color': '#2563eb',
          'line-width': 1
        };
      case 'SUPPLIES':
        return {
          'fill-color': '#eab308',
          'fill-opacity': 0.1,
          'line-color': '#ca8a04',
          'line-width': 1
        };
      case 'WATER':
        return {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.1,
          'line-color': '#0891b2',
          'line-width': 1
        };
      default:
        return {
          'fill-color': '#6b7280',
          'fill-opacity': 0.1,
          'line-color': '#4b5563',
          'line-width': 1
        };
    }
  };

  const handleMarkerClick = (resource: Resource) => {
    console.log('Marker clicked:', resource);
    if (typeof resource.id === 'number' && !isNaN(resource.id) &&
        typeof resource.capacity === 'number' &&
        typeof resource.current_count === 'number') {
      console.log('Setting selected resource for popup:', resource);
      setSelectedResource(resource);

      const resourceInfo: SelectedResourceInfo = {
          id: resource.id,
          name: resource.name,
          capacity: resource.capacity,
          current_count: resource.current_count
      };

      console.log('Calling onLocationSelect with info:', resourceInfo);
      onLocationSelect(resourceInfo);
    } else {
      console.error('Invalid or incomplete resource data for marker click:', resource);
    }
  };

  if (mapError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-600 font-medium mb-2">Map Error</p>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: -60.9789,
          latitude: 13.9094,
          zoom: 10
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
        cooperativeGestures={true}
      >
        <NavigationControl showCompass={false} />

        {resources.map((resource) => {
          const uniqueId = resource.id;
          return (
            <div key={`resource-container-${uniqueId}`}>
              {/* Coverage Area */}
              {resource.coverage_area && (
                <Source
                  key={`source-${uniqueId}`}
                  id={`coverage-${uniqueId}`}
                  type="geojson"
                  data={{
                    type: 'Feature',
                    geometry: resource.coverage_area,
                    properties: {}
                  }}
                >
                  <Layer
                    key={`layer-fill-${uniqueId}`}
                    id={`coverage-fill-${uniqueId}`}
                    type="fill"
                    paint={getCoverageAreaStyle(resource.resource_type)}
                  />
                  <Layer
                    key={`layer-line-${uniqueId}`}
                    id={`coverage-line-${uniqueId}`}
                    type="line"
                    paint={{
                      'line-color': getCoverageAreaStyle(resource.resource_type)['line-color'],
                      'line-width': 1
                    }}
                  />
                </Source>
              )}

              {/* Resource Marker */}
              {resource.location?.coordinates && (
                <Marker
                  key={`marker-${uniqueId}`}
                  longitude={resource.location.coordinates[0]}
                  latitude={resource.location.coordinates[1]}
                  onClick={(e) => {
                    console.log('Marker onClick triggered');
                    e.originalEvent.stopPropagation();
                    handleMarkerClick(resource);
                  }}
                >
                  <div className="cursor-pointer">
                    <MapPin className={`h-6 w-6 ${getMarkerColor(resource.resource_type)}`} />
                  </div>
                </Marker>
              )}
            </div>
          );
        })}

        {/* Resource Popup */}
        {selectedResource && selectedResource.location?.coordinates && (
          <Popup
            longitude={selectedResource.location.coordinates[0]}
            latitude={selectedResource.location.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedResource(null)}
            closeOnClick={true}
            closeButton={true}
            offset={25}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-medium">{selectedResource.name}</h3>
              <Badge className="mt-1">{selectedResource.resource_type}</Badge>
              {selectedResource.description && (
                <p className="text-sm text-gray-600 mt-1">{selectedResource.description}</p>
              )}
              <Badge 
                className={`mt-1 ${
                  selectedResource.status === 'AVAILABLE' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedResource.status === 'LIMITED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {selectedResource.status}
              </Badge>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}