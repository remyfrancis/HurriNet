'use client';

import React, { useState, Suspense } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // Tuple type for [longitude, latitude]
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: GeoJSONPoint) => void;
}

interface MapClickHandlerProps {
  onLocationSelect: (location: GeoJSONPoint) => void;
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const point: GeoJSONPoint = {
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat]
      };
      onLocationSelect(point);
    },
  });
  return null;
}

export function LocationSelector({ isOpen, onClose, onLocationSelected }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<GeoJSONPoint | null>(null);
  const defaultCenter = { lat: 13.909444, lng: -60.978893 }; // Saint Lucia coordinates

  const handleLocationSelect = (location: GeoJSONPoint) => {
    setSelectedLocation(location);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Location</DialogTitle>
        </DialogHeader>
        <div className="h-[500px] w-full relative">
          <Suspense fallback={<div>Loading map...</div>}>
            <MapContainer
              center={defaultCenter}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onLocationSelect={handleLocationSelect} />
              {selectedLocation && (
                <Marker
                  position={[
                    selectedLocation.coordinates[1],
                    selectedLocation.coordinates[0]
                  ]}
                  icon={new L.Icon({
                    iconUrl: '/marker-icon.png',
                    shadowUrl: '/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41]
                  })}
                />
              )}
            </MapContainer>
          </Suspense>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedLocation}>
            Confirm Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 