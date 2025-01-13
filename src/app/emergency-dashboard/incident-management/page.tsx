import { Suspense } from 'react'
import { Metadata } from 'next'
import IncidentMap from './incident-map'
import IncidentList from './incident-list'
import TeamAssignments from './team-assignments'
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: 'Incident Management | HurriNet',
  description: 'Manage and coordinate emergency response to incidents.',
}

export default function IncidentManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <IncidentMap />
        </Suspense>
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <IncidentList />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <TeamAssignments />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

