'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, MapPin } from 'lucide-react'

interface Warning {
  id: string
  title: string
  type: string
  severity: 'high' | 'medium' | 'low'
  location: string
  timestamp: string
}

const mockWarnings: Warning[] = [
  {
    id: '1',
    title: 'Hurricane Warning',
    type: 'weather',
    severity: 'high',
    location: 'Castries',
    timestamp: '2024-03-31T10:00:00Z',
  },
  {
    id: '2',
    title: 'Flood Alert',
    type: 'weather',
    severity: 'high',
    location: 'Gros Islet',
    timestamp: '2024-03-31T09:45:00Z',
  },
  {
    id: '3',
    title: 'Wind Advisory',
    type: 'weather',
    severity: 'medium',
    location: 'Vieux Fort',
    timestamp: '2024-03-31T09:30:00Z',
  },
  {
    id: '4',
    title: 'Storm Surge Warning',
    type: 'weather',
    severity: 'high',
    location: 'Soufriere',
    timestamp: '2024-03-31T09:15:00Z',
  },
]

const getSeverityColor = (severity: Warning['severity']) => {
  switch (severity) {
    case 'high':
      return 'bg-red-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'low':
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

export function WarningsList() {
  const [warnings, setWarnings] = useState<Warning[]>(mockWarnings)

  useEffect(() => {
    // TODO: Fetch real warnings data from the API
  }, [])

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {warnings.map((warning) => (
          <div
            key={warning.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium leading-none">{warning.title}</h4>
                <Badge
                  variant="secondary"
                  className={`${getSeverityColor(
                    warning.severity
                  )} text-white border-0`}
                >
                  {warning.severity}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {warning.location}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(warning.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 