'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface StatusUpdate {
  id: string
  type: 'incident' | 'resource'
  status: string
  progress: number
  lastUpdate: string
  description: string
}

export default function TrackingDashboard() {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])

  useEffect(() => {
    // Implement real-time updates
    const ws = new WebSocket('ws://your-api-endpoint/updates')
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setUpdates(prev => [...prev, update])
    }
    return () => ws.close()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update) => (
          <div key={update.id} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {update.type === 'incident' ? 'Incident Response' : 'Resource Request'}
              </h3>
              <Badge>{update.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{update.description}</p>
            <Progress value={update.progress} />
            <p className="text-xs text-gray-500 mt-1">Last updated: {update.lastUpdate}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}