import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import DashboardHeader from '@/components/Dashboard/Header'
import ActiveAlerts from '@/components/Dashboard/ActiveAlerts'
import WeatherInfo from '@/components/Dashboard/WeatherInfo'
import EmergencyContacts from '@/components/Dashboard/EmergencyContacts'
import QuickActions from '@/components/Dashboard/QuickActions'
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardPage() {
  // const user = await getCurrentUser()
  const user = {
    id: 1,
    name: "Developer",
    location: "Castries",
    role: "admin"
  }
  
  // if (!user) {
  //   redirect('/auth/login')
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <ActiveAlerts userId={user.id} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <WeatherInfo location={user.location} />
          </Suspense>
        </div>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <EmergencyContacts location={user.location} />
        </Suspense>
        <QuickActions />
      </main>
    </div>
  )
}

