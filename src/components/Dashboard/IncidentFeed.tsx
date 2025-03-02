'use client'

import { useState, useEffect } from 'react'
import { Flag, AlertTriangle, ThumbsUp, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"

interface Incident {
  id: string
  title: string
  description: string
  location: string
  severity: 'low' | 'medium' | 'high'
  timestamp: string
  author: {
    name: string
    avatar?: string
  }
  flags: number
  verified: boolean
}

interface IncidentFeedProps {
  onIncidentSelect: (incident: Incident) => void
  onIncidentFlag: (incidentId: string) => void
}

export default function IncidentFeed({ onIncidentSelect, onIncidentFlag }: IncidentFeedProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents`)
        const data = await response.json()
        setIncidents(data)
        setLoading(false)
      } catch (error) {
        setError('Failed to load incidents')
        setLoading(false)
      }
    }

    fetchIncidents()
    // Refresh incidents every minute
    const interval = setInterval(fetchIncidents, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500 bg-red-100'
      case 'medium':
        return 'text-yellow-500 bg-yellow-100'
      case 'low':
        return 'text-green-500 bg-green-100'
      default:
        return 'text-gray-500 bg-gray-100'
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading incidents...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card 
            key={incident.id}
            className="p-4 hover:bg-muted/50 cursor-pointer"
            onClick={() => onIncidentSelect(incident)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Avatar>
                    <img 
                      src={incident.author.avatar || '/default-avatar.png'} 
                      alt={incident.author.name}
                    />
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{incident.title}</h3>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {incident.location}
                </span>
                <span>{new Date(incident.timestamp).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onIncidentFlag(incident.id)
                  }}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag ({incident.flags})
                </Button>
                {incident.verified && (
                  <span className="flex items-center gap-1 text-green-500 text-sm">
                    <ThumbsUp className="h-4 w-4" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
} 