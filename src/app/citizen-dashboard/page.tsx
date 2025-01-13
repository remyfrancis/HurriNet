'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CloudRain, Home, Upload } from 'lucide-react'

// Mock data for incidents
const mockIncidents = [
  { id: 1, location: "Castries City Center", description: "Flooding on main street", timestamp: "2023-06-15T10:30:00Z" },
  { id: 2, location: "Gros Islet", description: "Fallen tree blocking road", timestamp: "2023-06-15T11:45:00Z" },
  { id: 3, location: "Soufriere", description: "Power outage in residential area", timestamp: "2023-06-15T09:15:00Z" },
]

export default function CitizenDashboard() {
  const [incidents, setIncidents] = useState(mockIncidents)
  const [newIncident, setNewIncident] = useState({ location: '', description: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const incident = {
      id: incidents.length + 1,
      ...newIncident,
      timestamp: new Date().toISOString()
    }
    setIncidents([incident, ...incidents])
    setNewIncident({ location: '', description: '' })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Citizen Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Weather Status */}
        <Card>
          <CardHeader>
            <CardTitle>Current Weather</CardTitle>
            <CardDescription>Weather conditions in Saint Lucia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <CloudRain size={48} />
              <div>
                <p className="text-2xl font-bold">28°C</p>
                <p>Scattered Thunderstorms</p>
                <p>Humidity: 75%</p>
                <p>Wind: 15 km/h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nearest Emergency Shelter */}
        <Card>
          <CardHeader>
            <CardTitle>Nearest Emergency Shelter</CardTitle>
            <CardDescription>Location and status of the closest shelter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Home size={48} />
              <div>
                <p className="font-bold">Castries Comprehensive Secondary School</p>
                <p>Distance: 2.5 km</p>
                <p>Status: Open</p>
                <p>Capacity: 200 people</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Feed */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Latest reported incidents in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                  <AlertTriangle className="text-yellow-500" />
                  <div>
                    <p className="font-semibold">{incident.location}</p>
                    <p>{incident.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(incident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident Report Submission */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Incident Report</CardTitle>
            <CardDescription>Report an emergency or incident in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="Enter incident location"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the incident"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="photo">Photo/Video</Label>
                  <Input id="photo" type="file" />
                </div>
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        

        
      </div>
    </div>
  )
}

