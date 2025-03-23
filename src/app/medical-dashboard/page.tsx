'use client'

import MedicalFacilities from "@/components/MedicalDashboard/MedicalFacilities"
import MedicalStaff from "@/components/MedicalDashboard/MedicalStaff"
import MedicalSupplies from "@/components/MedicalDashboard/MedicalSupplies"
import NonMedicalSupplies from "@/components/MedicalDashboard/NonMedicalSupplies"
import RealTimeOverview from "@/components/MedicalDashboard/RealTimeOverview"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { MedicalNav } from "@/components/MedicalDashboard/MedicalNav"

export default function MedicalDashboard() {
  return (
    <div className="flex min-h-screen">
      <MedicalNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Medical Dashboard</h1>
          
          {/* Real-Time Overview Section */}
          <div className="mb-8">
            <RealTimeOverview />
          </div>

          
        </div>
      </main>
    </div>
  )
}