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
  location: {
    type: string;
    coordinates: [number, number];
  };
  coverage_area?: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
}

export function DashboardResourceMap() {
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
        const defaultResources = defaultResourceLocations.map((loc, index) => ({
          id: index + 1,
          name: loc.name,
          resource_type: loc.type,
          description: `Default ${loc.type.toLowerCase()} location`,
          status: 'AVAILABLE',
          location: {
            type: 'Point',
            coordinates: loc.coordinates as [number, number]
          },
          coverage_area: undefined
        }));
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
        const defaultResources = defaultResourceLocations.map((loc, index) => ({
          id: index + 1,
          name: loc.name,
          resource_type: loc.type,
          description: `Default ${loc.type.toLowerCase()} location`,
          status: 'AVAILABLE',
          location: {
            type: 'Point',
            coordinates: loc.coordinates as [number, number]
          },
          coverage_area: undefined
        }));
        setResources(defaultResources);
        return;
      }

      const data = await response.json();
      
      if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
        console.log('Raw features:', data.features);
        const processedResources = data.features.map((feature: GeoJSONFeature) => {
          console.log('Feature geometry:', feature.geometry);
          // Handle case where geometry is directly the coordinates array
          const coordinates = Array.isArray(feature.geometry) ? feature.geometry : feature.geometry.coordinates;
          console.log('Coordinates to use:', coordinates);
          return ({
            id: feature.properties.id,
            name: feature.properties.name,
            resource_type: feature.properties.resource_type,
            description: feature.properties.description,
            status: feature.properties.status,
            location: {
              type: 'Point',
              coordinates: coordinates
            },
            coverage_area: feature.properties.coverage_area ? {
              type: 'Polygon',
              coordinates: feature.properties.coverage_area.coordinates
            } : undefined
          });
        });
        console.log('Processed resources:', processedResources);
        setResources(processedResources);
      } else if (Array.isArray(data)) {
        console.log('Raw data array:', data);
        setResources(data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      const defaultResources = defaultResourceLocations.map((loc, index) => {
        console.log('Default location coordinates:', loc.coordinates);
        return ({
          id: index + 1,
          name: loc.name,
          resource_type: loc.type,
          description: `Default ${loc.type.toLowerCase()} location`,
          status: 'AVAILABLE',
          location: {
            type: 'Point',
            coordinates: loc.coordinates as [number, number]
          },
          coverage_area: undefined
        });
      });
      console.log('Using default resources:', defaultResources);
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

        {resources.map((resource, index) => {
          const uniqueId = resource.id ?? `fallback-${index}`;
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
                    e.originalEvent.stopPropagation();
                    setSelectedResource(resource);
                  }}
                >
                  <MapPin className={`h-6 w-6 ${getMarkerColor(resource.resource_type)}`} />
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