'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from 'lucide-react'

type Incident = {
  tracking_id: string
  incident_type: string
  description: string
  status: string
  latitude: number
  longitude: number
  created_at: string
}

interface IncidentTimelineProps {
  className?: string
}

export function IncidentTimeline({ className = "" }: IncidentTimelineProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`)
        if (response.ok) {
          const data = await response.json()
          setIncidents(data)
        }
      } catch (error) {
        console.error('Error fetching incidents:', error)
      }
    }

    fetchIncidents()
    const interval = setInterval(fetchIncidents, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'destructive'
      case 'responding':
        return 'warning'
      case 'resolved':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Incident Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto" style={{ maxHeight: 'calc(100vh - 13rem)' }}>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div 
              key={incident.tracking_id}
              className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">
                    {incident.incident_type}
                  </h3>
                  <Badge variant={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {incident.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>ID: {incident.tracking_id}</span>
                  <time dateTime={incident.created_at}>
                    {new Date(incident.created_at).toLocaleString()}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}