// components/maps/ResourceMap.tsx
'use client'

import { useState } from 'react';
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  FullscreenControl,
  GeolocateControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Types
interface Resource {
  id: string;
  name: string;
  type: 'SHELTER' | 'MEDICAL' | 'SUPPLIES' | 'WATER';
  status: 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE';
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  capacity?: number;
  currentCount?: number;
  lastUpdate: string;
  contact?: string;
}

// Mock data - replace with API call
const SAMPLE_RESOURCES: Resource[] = [
  // Castries District
  {
    id: '1',
    name: 'Castries Community Center',
    type: 'SHELTER',
    status: 'AVAILABLE',
    location: {
      latitude: 14.0101,
      longitude: -60.9875
    },
    address: 'Castries City Center',
    capacity: 200,
    currentCount: 45,
    lastUpdate: new Date().toISOString(),
    contact: '123-456-7890'
  },
  {
    id: '2',
    name: 'Victoria Hospital',
    type: 'MEDICAL',
    status: 'LIMITED',
    location: {
      latitude: 14.0114,
      longitude: -60.9891
    },
    address: 'Millennium Highway, Castries',
    capacity: 120,
    currentCount: 98,
    lastUpdate: new Date().toISOString(),
    contact: '758-452-2421'
  },

  // Gros Islet District
  {
    id: '3',
    name: 'Gros Islet Emergency Shelter',
    type: 'SHELTER',
    status: 'AVAILABLE',
    location: {
      latitude: 14.0722,
      longitude: -60.9498
    },
    address: 'Gros Islet Highway',
    capacity: 150,
    currentCount: 30,
    lastUpdate: new Date().toISOString(),
    contact: '758-450-1234'
  },
  {
    id: '4',
    name: 'Rodney Bay Water Station',
    type: 'WATER',
    status: 'AVAILABLE',
    location: {
      latitude: 14.0783,
      longitude: -60.9522
    },
    address: 'Rodney Bay Marina',
    capacity: 5000,
    currentCount: 4500,
    lastUpdate: new Date().toISOString(),
    contact: '758-452-5678'
  },

  // Soufriere District
  {
    id: '5',
    name: 'Soufriere Hospital',
    type: 'MEDICAL',
    status: 'AVAILABLE',
    location: {
      latitude: 13.8566,
      longitude: -61.0564
    },
    address: 'Church Street, Soufriere',
    capacity: 50,
    currentCount: 20,
    lastUpdate: new Date().toISOString(),
    contact: '758-459-7836'
  },
  {
    id: '6',
    name: 'Soufriere Community Supply Center',
    type: 'SUPPLIES',
    status: 'LIMITED',
    location: {
      latitude: 13.8552,
      longitude: -61.0558
    },
    address: 'New Development, Soufriere',
    lastUpdate: new Date().toISOString(),
    contact: '758-459-9000'
  },

  // Vieux Fort District
  {
    id: '7',
    name: 'St Jude Hospital',
    type: 'MEDICAL',
    status: 'UNAVAILABLE',
    location: {
      latitude: 13.7246,
      longitude: -60.9490
    },
    address: 'Vieux Fort Highway',
    capacity: 80,
    currentCount: 45,
    lastUpdate: new Date().toISOString(),
    contact: '758-454-6041'
  },
  {
    id: '8',
    name: 'Vieux Fort Water Distribution',
    type: 'WATER',
    status: 'AVAILABLE',
    location: {
      latitude: 13.7197,
      longitude: -60.9486
    },
    address: 'Clarke Street, Vieux Fort',
    lastUpdate: new Date().toISOString(),
    contact: '758-454-8888'
  },

  // Micoud District
  {
    id: '9',
    name: 'Micoud Emergency Center',
    type: 'SHELTER',
    status: 'LIMITED',
    location: {
      latitude: 13.8249,
      longitude: -60.9002
    },
    address: 'Main Street, Micoud',
    capacity: 100,
    currentCount: 82,
    lastUpdate: new Date().toISOString(),
    contact: '758-455-6789'
  },
  {
    id: '10',
    name: 'Micoud Supply Depot',
    type: 'SUPPLIES',
    status: 'AVAILABLE',
    location: {
      latitude: 13.8242,
      longitude: -60.8998
    },
    address: 'Church Street, Micoud',
    lastUpdate: new Date().toISOString(),
    contact: '758-455-7000'
  }
];

const ResourceMap = () => {
  const [viewState, setViewState] = useState({
    latitude: 13.9094,
    longitude: -60.9789,
    zoom: 10
  });
  
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  
  const filteredResources = selectedType === 'ALL' 
    ? SAMPLE_RESOURCES 
    : SAMPLE_RESOURCES.filter(r => r.type === selectedType);

  // Get marker color based on resource type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'SHELTER': return '#2563eb'; // blue
      case 'MEDICAL': return '#dc2626'; // red
      case 'SUPPLIES': return '#16a34a'; // green
      case 'WATER': return '#2dd4bf';   // teal
      default: return '#6b7280';        // gray
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'LIMITED': return 'bg-yellow-500';
      case 'UNAVAILABLE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Filter Controls */}
      <div className="p-4 bg-white shadow-md z-10">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'ALL' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All Resources
          </button>
          {['SHELTER', 'MEDICAL', 'SUPPLIES', 'WATER'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedType === type 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {/* Map Controls */}
          <GeolocateControl position="top-right" />
          <FullscreenControl position="top-right" />
          <NavigationControl position="top-right" />

          {/* Resource Markers */}
          {filteredResources.map(resource => (
            <Marker
              key={resource.id}
              latitude={resource.location.latitude}
              longitude={resource.location.longitude}
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedResource(resource);
              }}
            >
              <div 
                className="cursor-pointer transition-transform hover:scale-110"
                style={{ color: getMarkerColor(resource.type) }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </Marker>
          ))}

          {/* Popup for selected resource */}
          {selectedResource && (
            <Popup
              latitude={selectedResource.location.latitude}
              longitude={selectedResource.location.longitude}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setSelectedResource(null)}
              anchor="bottom"
              className="z-50"
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg">{selectedResource.name}</h3>
                <p className="text-sm text-gray-600">{selectedResource.address}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${
                    getStatusColor(selectedResource.status)
                  }`} />
                  <span className="text-sm">{selectedResource.status}</span>
                </div>

                {selectedResource.capacity && (
                  <p className="mt-1 text-sm">
                    Capacity: {selectedResource.currentCount}/{selectedResource.capacity}
                  </p>
                )}

                {selectedResource.contact && (
                  <p className="mt-1 text-sm">
                    Contact: {selectedResource.contact}
                  </p>
                )}

                <p className="text-xs mt-2 text-gray-500">
                  Last updated: {new Date(selectedResource.lastUpdate).toLocaleString()}
                </p>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default ResourceMap;
