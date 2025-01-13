'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDistrict } from '@/lib/location'

interface IncidentDetailsProps {
  incident: any // TODO: Add proper type
}

export default function IncidentDetails({ incident }: IncidentDetailsProps) {
  const district = getDistrict(incident.latitude, incident.longitude)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracking ID: {incident.tracking_id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p><strong>Type:</strong> {incident.incident_type}</p>
          <p><strong>Status:</strong> {incident.status}</p>
          <p><strong>Description:</strong> {incident.description}</p>
          <p><strong>Location:</strong> {district} ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})</p>
          <p><strong>Last Updated:</strong> {new Date(incident.updated_at).toLocaleString()}</p>
          {incident.photo && (
            <div className="relative h-64 w-full">
              <Image
                src={incident.photo_url || ''}
                alt="Incident photo"
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}