"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { AlertFeed } from "./AlertFeed"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

type Shelter = {
  id: number
  name: string
  capacity: number
  latitude: number
  longitude: number
  status: 'open' | 'closed'
}

type Alert = {
  id: number
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
}

export function EmergencyShelterMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(-60.9765)
  const [lat] = useState(13.9094)
  const [zoom] = useState(10)
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])

  const getDistrictCoordinates = (district: string) => {
    const coordinates = {
      'Castries': { lat: 14.0101, lon: -60.9875 },
      'Gros Islet': { lat: 14.0722, lon: -60.9498 },
      'Soufriere': { lat: 13.8566, lon: -61.0564 },
      'Vieux Fort': { lat: 13.7246, lon: -60.9490 },
      'Anse La Raye': { lat: 13.9462, lon: -61.0379 },
      'Canaries': { lat: 13.9042, lon: -61.0687 },
      'Choiseul': { lat: 13.7762, lon: -61.0490 },
      'Dennery': { lat: 13.8963, lon: -60.8888 },
      'Laborie': { lat: 13.7516, lon: -60.9932 },
      'Micoud': { lat: 13.8247, lon: -60.9002 }
    }
    return coordinates[district as keyof typeof coordinates]
  }

  // Fetch shelters and alerts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sheltersRes, alertsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters/`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/?active=true`)
        ])
        
        if (sheltersRes.ok) {
          const shelterData = await sheltersRes.json()
          setShelters(shelterData)
        }
        
        if (alertsRes.ok) {
          const alertData = await alertsRes.json()
          setAlerts(alertData)
          console.log('Fetched alerts:', alertData) // Debug log
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()

    // Fetch alerts periodically (every 30 seconds)
    const interval = setInterval(fetchData, 30000)

    return () => clearInterval(interval)
  }, [])

  // Initialize map
  useEffect(() => {
    if (map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    })

    map.current.on("load", () => {
      console.log("Map loaded")
      
      // Add custom marker image
      const markerElement = document.createElement('div')
      markerElement.className = 'shelter-marker'
      const homeIcon = document.createElement('div')
      homeIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
      markerElement.appendChild(homeIcon)

      // Add markers for each shelter
      shelters.forEach(shelter => {
        const marker = new mapboxgl.Marker({
          element: markerElement.cloneNode(true) as HTMLElement,
          color: shelter.status === 'open' ? '#22c55e' : '#ef4444'
        })
          .setLngLat([shelter.longitude, shelter.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <strong>${shelter.name}</strong><br/>
                Capacity: ${shelter.capacity}<br/>
                Status: ${shelter.status}
              `)
          )
          .addTo(map.current!)
      })

      setMapLoaded(true)
    })

    return () => map.current?.remove()
  }, [])

  // Update markers whenever alerts or shelters change
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Remove existing markers
    const markers = document.getElementsByClassName('marker')
    while (markers.length > 0) {
      markers[0].remove()
    }

    // Add shelter markers
    shelters.forEach(shelter => {
      const markerElement = document.createElement('div')
      markerElement.className = `marker shelter-marker ${shelter.status}`
      const homeIcon = document.createElement('div')
      homeIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
      markerElement.appendChild(homeIcon)

      new mapboxgl.Marker({
        element: markerElement,
      })
        .setLngLat([shelter.longitude, shelter.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>${shelter.name}</strong><br/>
              Capacity: ${shelter.capacity}<br/>
              Status: ${shelter.status}
            `)
        )
        .addTo(map.current!)
    })

    // Add alert markers
    alerts.forEach(alert => {
      const coords = getDistrictCoordinates(alert.district)
      if (coords) {
        const markerElement = document.createElement('div')
        markerElement.className = `marker alert-marker ${alert.severity.toLowerCase()}`
        const alertIcon = document.createElement('div')
        alertIcon.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
        markerElement.appendChild(alertIcon)

        new mapboxgl.Marker({
          element: markerElement,
        })
          .setLngLat([coords.lon, coords.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <strong>${alert.title}</strong><br/>
                Severity: ${alert.severity}<br/>
                Type: ${alert.type}
              `)
          )
          .addTo(map.current!)
      }
    })
  }, [shelters, alerts, mapLoaded])

  const toggleShelterStatus = async (shelterId: number) => {
    try {
      const shelter = shelters.find(s => s.id === shelterId)
      if (!shelter) return

      const newStatus = shelter.status === 'open' ? 'closed' : 'open'
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters/${shelterId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setShelters(shelters.map(s => 
          s.id === shelterId ? { ...s, status: newStatus } : s
        ))
      }
    } catch (error) {
      console.error('Error updating shelter status:', error)
    }
  }

  const handleNewAlert = async (alertData: Omit<Alert, 'id' | 'created_at'>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        const newAlert = await response.json()
        setAlerts(prev => [newAlert, ...prev])
      }
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  return (
    <div className="flex h-screen">
      <AlertFeed 
        alerts={alerts} 
        onNewAlert={handleNewAlert}
      />
      
      {/* Map and Shelter List */}
      <div className="flex-1 flex flex-col p-6 space-y-6">
        <div ref={mapContainer} className="h-[400px] rounded-lg shadow-md" />
        
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Designated Emergency Shelters</h3>
          <div className="grid gap-2">
            {shelters.map(shelter => (
              <div key={shelter.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{shelter.name}</p>
                  <p className="text-sm text-gray-500">Capacity: {shelter.capacity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={shelter.status === 'open' ? 'default' : 'destructive'}>
                    {shelter.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleShelterStatus(shelter.id)}
                  >
                    {shelter.status === 'open' ? 'Close' : 'Open'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

