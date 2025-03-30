'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardOverview from "@/components/ResourceManagerDashboard/dashboard-overview"
import SuppliersList from "@/components/ResourceManagerDashboard/suppliers-list"
import ResourcesList from "@/components/ResourceManagerDashboard/resources-list"
import InventoryAllocation from "@/components/ResourceManagerDashboard/inventory-allocation"
import { ResourceManagerNav } from "../resource-manager-nav"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-3xl font-bold mb-6">Resource Procurement Dashboard</h1>

          <DashboardOverview />

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SuppliersList compact />
                <ResourcesList compact />
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="mt-6">
              <SuppliersList />
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <ResourcesList />
            </TabsContent>

            <TabsContent value="allocation" className="mt-6">
              <InventoryAllocation />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}



