'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import the Map component with all its dependencies
const Map = dynamic(
  () => import('@/components/Map'),
  { 
    ssr: false,
    loading: () => <p>Loading map...</p>
  }
)

export default function IncidentMap() {
  const [center] = useState<[number, number]>([13.9094, -60.9789])

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Incident Map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Map center={center} />
      </CardContent>
    </Card>
  )
}

