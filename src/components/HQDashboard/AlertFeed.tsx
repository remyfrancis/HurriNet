"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"

type Alert = {
  id: number
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
}

interface AlertFeedProps {
  alerts: Alert[]
  onNewAlert: (alert: Omit<Alert, 'id' | 'created_at'>) => void
}

// Match the districts from the backend DISTRICT_CHOICES
const DISTRICTS = [
  'Castries',
  'Gros Islet',
  'Vieux Fort',
  'Soufriere',
  'Micoud',
  'Dennery',
  'Laborie',
  'Choiseul',
  'Anse La Raye',
  'Canaries',
  'All'
]

// Common weather-related alert types
const ALERT_TYPES = [
  'Hurricane',
  'Flood',
  'Landslide',
  'Storm Surge',
  'High Wind',
  'Heavy Rain',
  'High Temperature',
  'Other'
]

export function AlertFeed({ alerts, onNewAlert }: AlertFeedProps) {
    const [newAlert, setNewAlert] = useState({
      title: '',
      type: '',
      severity: 'Medium' as Alert['severity'],
      district: '',
      active: true
    })
  
    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case 'High': return 'bg-red-100 text-red-800'
        case 'Medium': return 'bg-yellow-100 text-yellow-800'
        case 'Low': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (!newAlert.title || !newAlert.type || !newAlert.district) return
      
      onNewAlert(newAlert)
      setNewAlert({
        title: '',
        type: '',
        severity: 'Medium',
        district: '',
        active: true
      })
    }
  
  return (
    <div className="w-96 h-full overflow-y-auto border-r bg-white">

      <form onSubmit={handleSubmit} className="p-4 border-b">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Create Alert</h2>
          
          <Input
            placeholder="Alert title"
            value={newAlert.title}
            onChange={(e) => setNewAlert(prev => ({ ...prev, title: e.target.value }))}
          />
          
          <Select
            value={newAlert.district}
            onValueChange={(value) => setNewAlert(prev => ({ ...prev, district: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {DISTRICTS.map(district => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newAlert.type}
            onValueChange={(value) => setNewAlert(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Alert type" />
            </SelectTrigger>
            <SelectContent>
              {ALERT_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newAlert.severity}
            onValueChange={(value: Alert['severity']) => setNewAlert(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!newAlert.title || !newAlert.type || !newAlert.district}
          >
            Create Alert
          </Button>
        </div>
      </form>

      {/* Alerts Feed */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Active Alerts</h2>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-gray-500">{alert.district}</p>
                </div>
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{alert.type}</p>
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}