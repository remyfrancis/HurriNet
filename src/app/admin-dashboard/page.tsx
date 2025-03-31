"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from 'next/navigation'
import { AlertTriangle, Phone, Radio, Shield, Users, Wind } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminNav } from "./admin-nav"
import { WeatherForecast } from "./weather-forecast"
import { WarningsList } from "./warnings-list"
import Link from 'next/link'

// Dynamically import the ShelterMapFullpage component
const ShelterMapFullpage = dynamic(() => 
  import('../citizen-dashboard/shelter-map-fullpage').then(mod => mod.ShelterMapFullpage), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-muted flex items-center justify-center">Loading map...</div>,
})

export default function AdminDashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<"map" | "list">("map")

  useEffect(() => {
    // Check if user is logged in and is an administrator
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (user.role !== 'ADMINISTRATOR') {
      router.push('/dashboard')
      return
    }

    setUserData(user)
    setLoading(false)
  }, [router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <AdminNav className="w-64 border-r bg-background hidden md:block" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">

        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/emergency-numbers">
                <Button variant="destructive" className="hidden sm:flex">
                  <Phone className="mr-2 h-4 w-4" />
                  Emergency Contacts
                </Button>
              </Link>
              <Button>
                <Radio className="mr-2 h-4 w-4" />
                Broadcast Alert
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last hour</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Affected Areas</CardTitle>
                <Wind className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">4 districts under evacuation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emergency Teams</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">6 teams deployed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shelters Active</CardTitle>
                <Shield className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">Capacity: 2,500 people</p>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Action Buttons */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Button className="bg-red-600 hover:bg-red-700">
              <Phone className="mr-2 h-4 w-4" /> Live Emergency Broadcasts
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Shield className="mr-2 h-4 w-4" /> Activate Shelters
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push('/admin-dashboard/teams')}
            >
              <Users className="mr-2 h-4 w-4" /> Deploy Response Teams
            </Button>
          </div>

          {/* Map and Data Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="warnings">Warnings</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-5">
                  <CardHeader>
                    <CardTitle>Situation Map</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 h-[500px]">
                    <ShelterMapFullpage />
                  </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Weather Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WarningsList />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="warnings" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Detailed Warnings</CardTitle></CardHeader>
                <CardContent>Manage and view detailed warnings here.</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Resource Management</CardTitle></CardHeader>
                <CardContent>Manage shelters, medical facilities, equipment, etc.</CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Weather Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherForecast />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 