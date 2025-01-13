'use client'

import WeatherAlerts from '@/components/WeatherAlerts'
import StormTracking from '@/components/StormTracking'
import EmergencyContacts from '@/components/EmergencyContacts'
import AuthButtons from '@/components/auth-buttons'

export default function PublicDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="flex justify-end items-center">
          <AuthButtons />
        </div>
      </header>
      <main className="p-6 space-y-6">
        <WeatherAlerts />
        <StormTracking />
        <EmergencyContacts />
      </main>
    </div>
  )
}


