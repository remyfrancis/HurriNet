'use client'

import { useEffect, useState } from 'react'
import { CitizenNav } from '../citizen-nav'
import { IncidentReport } from '../incident-report'
import { useRouter } from 'next/navigation'

export default function ReportPage() {
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Report an Incident</h1>
          </div>
          <p className="text-muted-foreground">
            Report emergencies, hazards, or other incidents to help keep your community safe and informed.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <IncidentReport />
          </div>
        </div>
      </main>
    </div>
  )
} 