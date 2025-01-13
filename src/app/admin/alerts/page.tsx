'use client'

import { Suspense } from 'react'
import AlertList from './alert-list'
import { CreateAlertModal } from '@/components/Alerts/CreateAlertModal'
import { Skeleton } from "@/components/ui/skeleton"

export default function AlertManagementPage() {
  const handleCreateAlert = (alert: any) => {
    console.log('New alert:', alert)
    // You can add more logic here to handle the new alert
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <CreateAlertModal onCreateAlert={handleCreateAlert} />
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <AlertList onCreateAlert={handleCreateAlert} />
      </Suspense>
    </div>
  )
}

