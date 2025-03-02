import { HQDashboardHeader } from "@/components/HQDashboard/HQDashboardHeader"
import { EmergencyShelterMap } from "@/components/HQDashboard/EmergencyShelterMap"
import { KeyStatistics } from "@/components/HQDashboard/KeyStatistics"
import { NewShelterForm } from "@/components/HQDashboard/NewShelterForm"
import { MedicalSupplyOverview } from "@/components/MedicalDashboard/MedicalSupplyOverview"


export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <HQDashboardHeader /> */}

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Emergency HQ Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <KeyStatistics />
              </div>
              <div className="col-span-1 md:col-span-2">
                <EmergencyShelterMap />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

