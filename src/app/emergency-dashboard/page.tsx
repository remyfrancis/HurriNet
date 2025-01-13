import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import IncidentList from './incident-management/incident-list'
import IncidentMap from './incident-management/incident-map'
import InventoryOverview from './resource-management/inventory-overview'
import DistributionStatus from './resource-management/distribution-status'
import TrackingDashboard from '@/components/StatusTracking/TrackingDashboard'

export const metadata: Metadata = {
  title: 'Emergency Dashboard | HurriNet',
  description: 'Emergency response coordination and resource management dashboard.',
}

export default function EmergencyDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Emergency Dashboard</h1>
        <div className="space-x-4">
          <Button asChild variant="outline">
            <Link href="/emergency-dashboard/incident-management">
              Incident Management
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/emergency-dashboard/resource-management">
              Resource Management
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Tracking Section */}
      <div className="mb-6">
        <Suspense fallback={<Skeleton className="h-[200px]" />}>
          <TrackingDashboard />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Incident Overview Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<Skeleton className="h-[400px]" />}>
                {/* <IncidentMap /> */}
              </Suspense>
            </CardContent>
          </Card>
          <Suspense fallback={<Skeleton className="h-[300px]" />}>
            <IncidentList />
          </Suspense>
        </div>

        {/* Resource Overview Section */}
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[300px]" />}>
            <InventoryOverview />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[300px]" />}>
            <DistributionStatus />
          </Suspense>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Teams Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">5 locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resource Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">75% fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alert Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">Moderate</div>
            <p className="text-xs text-muted-foreground">Updated 5m ago</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
