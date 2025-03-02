"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Shelter = {
  id: number
  name: string
  capacity: number
  current_occupancy: number
  status: 'open' | 'closed'
}

type Alert = {
  id: number
  active: boolean
}

export function KeyStatistics() {
  const [statistics, setStatistics] = useState({
    totalActiveShelters: 0,
    activeAlerts: 0,
    peopleSheltered: 0,
    availableCapacity: 0
  })

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch shelters and alerts concurrently
        const [sheltersRes, alertsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/shelters/`),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/?active=true`)
        ])

        if (sheltersRes.ok && alertsRes.ok) {
          const shelters: Shelter[] = await sheltersRes.json()
          const alerts: Alert[] = await alertsRes.json()

          // Calculate statistics
          const activeShelters = shelters.filter(shelter => shelter.status === 'open')
          const totalPeopleSheltered = shelters.reduce((sum, shelter) => 
            sum + (shelter.current_occupancy || 0), 0)
          const totalAvailableCapacity = activeShelters.reduce((sum, shelter) => 
            sum + shelter.capacity, 0)

          setStatistics({
            totalActiveShelters: activeShelters.length,
            activeAlerts: alerts.length,
            peopleSheltered: totalPeopleSheltered,
            availableCapacity: totalAvailableCapacity
          })
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    }

    fetchStatistics()
    // Refresh statistics every minute
    const interval = setInterval(fetchStatistics, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Shelters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalActiveShelters}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.activeAlerts}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">People Sheltered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.peopleSheltered}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.availableCapacity}</div>
        </CardContent>
      </Card>
    </div>
  )
}

