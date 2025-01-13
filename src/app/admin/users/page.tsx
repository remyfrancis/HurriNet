import { Suspense } from 'react'
import { Metadata } from 'next'
import UserList from './user-list'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: 'User Management | HurriNet Admin',
  description: 'Manage users in the HurriNet system.',
}

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button>Add New User</Button>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <UserList />
      </Suspense>
    </div>
  )
}

