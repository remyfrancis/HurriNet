'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CitizenNav } from './citizen-nav'
import { WeatherForecast } from './weather-forecast'
import { CitizenFeed } from './citizen-feed'
import { AlertsList } from './alerts-list'
import { IncidentReport } from './incident-report'
import { ShelterMap } from './shelter-map'
import { useRouter } from 'next/navigation'

export default function CitizenDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <CitizenNav />
      <main className="flex-1 p-8">
        <div className="space-y-8">
          {/* Weather & Alerts Row */}
          <div className="flex gap-8">
            {/* Weather Section */}
            <section className="w-1/2">
              <h2 className="text-2xl font-bold mb-4">Weather Forecast</h2>
              <WeatherForecast />
            </section>

            {/* Alerts Section */}
            <section className="w-1/2">
              <h2 className="text-2xl font-bold mb-4">Active Alerts</h2>
              <AlertsList />
            </section>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Feed Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Community Feed</h2>
              <CitizenFeed />
            </section>

            {/* Incident Report Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Report Incident</h2>
              <IncidentReport />
            </section>
          </div>

        </div>
      </main>
    </div>
  )
}

