'use client'

import { useState } from 'react'
import { MapPin, AlertTriangle, CloudRain, MessageSquare, Flag, Building } from 'lucide-react'
import { Card } from "@/components/ui/card"
import WeatherWidget from '@/components/dashboard/WeatherWidget'
import IncidentFeed from '@/components/dashboard/IncidentFeed'
import AlertsPanel from '@/components/dashboard/AlertsPanel'
import EmergencyMap from '@/components/dashboard/EmergencyMap'
import CreateIncidentForm from '@/components/dashboard/CreateIncidentForm'

export default function CitizenDashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Citizen Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Weather and Alerts */}
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <CloudRain className="h-5 w-5" />
                Current Weather
              </h2>
              <WeatherWidget />
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </h2>
              <AlertsPanel />
            </Card>
          </div>

          {/* Middle Column - Incident Feed and Create Incident */}
          <div className="space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                Report an Incident
              </h2>
              <CreateIncidentForm onIncidentCreated={() => {
                // Refresh incident feed
              }} />
            </Card>

            <Card className="p-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Flag className="h-5 w-5" />
                Incident Feed
              </h2>
              <IncidentFeed 
                onIncidentSelect={(incident) => setSelectedIncident(incident)}
                onIncidentFlag={(incidentId) => {
                  // Handle incident flagging
                }}
              />
            </Card>
          </div>

          {/* Right Column - Map */}
          <div className="md:col-span-1">
            <Card className="p-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5" />
                Emergency Map
              </h2>
              <div className="h-[600px]">
                <EmergencyMap 
                  selectedIncident={selectedIncident}
                  onMarkerClick={(marker) => {
                    // Handle marker click
                  }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 