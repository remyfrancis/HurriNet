import { Suspense } from 'react'
import { Metadata } from 'next'
import InventoryOverview from './inventory-overview'
import ResourceRequests from './resource-requests'
import DistributionStatus from './distribution-status'
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: 'Resource Management | HurriNet',
  description: 'Manage and track emergency resources, requests, and distribution.',
}

export default function ResourceManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Resource Management</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <InventoryOverview />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <ResourceRequests />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <DistributionStatus />
        </Suspense>
      </div>
    </div>
  )
}

