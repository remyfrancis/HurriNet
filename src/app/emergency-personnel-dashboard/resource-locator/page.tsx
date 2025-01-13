import { Suspense } from 'react'
import { Metadata } from 'next'
//import ResourceMap from './resource-map'
import ShelterList from './shelter-list'
import SupplyAvailability from './supply-availability'
import { Skeleton } from "@/components/ui/skeleton"
import LeafletMap from './LeafletMap'
import { Resource } from '@/lib/types'
import dynamic from 'next/dynamic'
import ResourceMap from './resource-map'


export const metadata: Metadata = {
  title: 'Resource Locator | HurriNet',
  description: 'Locate emergency resources, shelters, and supplies in your area.',
}

export default function ResourceLocatorPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Resource Locator</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <ResourceMap />
        </Suspense>
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <ShelterList />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <SupplyAvailability />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

