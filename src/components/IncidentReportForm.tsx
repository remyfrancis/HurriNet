'use client';

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import dynamic from 'next/dynamic';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from "@/hooks/use-toast";
import { IncidentService } from '@/lib/incident-service';
import 'leaflet/dist/leaflet.css';
import type { Icon, LatLngExpression, Map } from 'leaflet';
import type { MapContainer as MapContainerType } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import { getIncidentIcon } from '@/lib/map-icons';
import { useAuth } from '@/contexts/AuthContext';

// Dynamically import the map components with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

// Define GeoJSON Point type
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

const GeoJSONPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  incident_type: z.string().min(1, 'Incident type is required'),
  severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'EXTREME']),
  location: GeoJSONPointSchema,
});

type FormData = z.infer<typeof formSchema>;

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: GeoJSONPoint) => void }) {
  useMapEvents({
    click: (e: { latlng: { lng: number; lat: number } }) => {
      const point: GeoJSONPoint = {
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat]
      };
      onLocationSelect(point);
    },
  });
  return null;
}

const DynamicMapClickHandler = dynamic(
  () => Promise.resolve(MapClickHandler),
  { ssr: false }
);

export function IncidentReportForm() {
  const { token, isAuthenticated } = useAuth();
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const mapRef = useRef<Map | null>(null);
  const { toast } = useToast();
  const defaultCenter: LatLngExpression = [13.909444, -60.978893]; // Saint Lucia coordinates

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      incident_type: '',
      severity: 'LOW',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
    },
  });

  useEffect(() => {
    if (mapRef.current) {
      setMapInstance(mapRef.current);
    }
  }, [mapRef.current]);

  useEffect(() => {
    // Cleanup function for map instance
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapInstance]);

  const handleLocationSelected = (location: GeoJSONPoint) => {
    form.setValue('location', location);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const onSubmit = async (values: FormData) => {
    try {
      if (!isAuthenticated || !token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to submit an incident report.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Validate location
      if (!values.location || values.location.coordinates[0] === 0 || values.location.coordinates[1] === 0) {
        toast({
          title: "Location Required",
          description: "Please select a location on the map",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('incident_type', values.incident_type);
      formData.append('severity', values.severity);
      
      // Format location as GeoJSON
      const locationGeoJSON = {
        type: 'Point',
        coordinates: [
          values.location.coordinates[0],  // longitude
          values.location.coordinates[1]   // latitude
        ]
      };
      formData.append('location', JSON.stringify(locationGeoJSON));
      
      if (photo) {
        formData.append('photo', photo);
      }

      const response = await fetch('http://localhost:8000/api/incidents/', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.error || errorData.detail || 'Failed to submit incident');
      }

      const data = await response.json();
      console.log('Success response:', data);

      toast({
        title: 'Incident Reported',
        description: `Your incident has been reported successfully. ID: ${data.id}`,
      });

      // Reset form
      form.reset();
      setPhoto(null);
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit incident report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLocationDisplay = (location: GeoJSONPoint) => {
    const [lng, lat] = location.coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Report Incident</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter incident title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="incident_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incident type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FIRE">Fire</SelectItem>
                      <SelectItem value="FLOOD">Flood</SelectItem>
                      <SelectItem value="MEDICAL">Medical Emergency</SelectItem>
                      <SelectItem value="STORM">Storm</SelectItem>
                      <SelectItem value="LANDSLIDE">Landslide</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="EXTREME">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Selected Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Click on the map to select location"
                      value={field.value ? formatLocationDisplay(field.value) : ''}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Photo (Optional)</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </form>
        </Form>

        <div className="h-[600px] relative rounded-lg overflow-hidden border">
          <Suspense fallback={<div className="h-full flex items-center justify-center">Loading map...</div>}>
            {typeof window !== 'undefined' && (
              <MapContainer
                center={defaultCenter}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <DynamicMapClickHandler onLocationSelect={handleLocationSelected} />
                {form.watch('location').coordinates[0] !== 0 && (
                  <Marker
                    position={[
                      form.watch('location').coordinates[1],
                      form.watch('location').coordinates[0]
                    ] as LatLngExpression}
                    icon={getIncidentIcon(form.watch('incident_type'))}
                  />
                )}
              </MapContainer>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
} 