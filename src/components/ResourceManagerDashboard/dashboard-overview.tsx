"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { Activity, Package, Truck, Warehouse, Loader2 } from "lucide-react"

interface DashboardStats {
  totalSuppliers: number
  activeSuppliers: number
  totalResources: number
  availableResources: number
  totalInventory: number
  allocatedInventory: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  try {

    // Get the auth token from the localStorage
    const token = localStorage.getItem('accessToken')
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }


    // Fetch suppliers data
    const suppliersResponse = await fetch('/api/resource-management/suppliers', { headers })
    if (!suppliersResponse.ok) {
      const error = await suppliersResponse.text()
      throw new Error(`Failed to fetch suppliers: ${error}`)
    }
    const suppliersData = await suppliersResponse.json()
    const activeSuppliers = suppliersData.features.filter((s: any) => s.properties.status === 'ACTIVE').length
    const totalSuppliers = suppliersData.features.length

    // Fetch resources data
    const resourcesResponse = await fetch('/api/resource-management/resources', { headers })
    if (!resourcesResponse.ok) {
      const error = await resourcesResponse.text()
      throw new Error(`Failed to fetch resources: ${error}`)
    }
    const resourcesData = await resourcesResponse.json()
    const availableResources = resourcesData.features.filter((r: any) => r.properties.status === 'Available').length
    const totalResources = resourcesData.features.length

    // Fetch inventory data
    const inventoryResponse = await fetch('/api/resource-management/inventory', { headers })
    if (!inventoryResponse.ok) {
      const error = await inventoryResponse.text()
      throw new Error(`Failed to fetch inventory: ${error}`)
    }
    const inventoryData = await inventoryResponse.json()
    // console.log('Raw inventory data:', inventoryData)
    
    // Calculate totals from inventory data
    let totalInventory = 0
    let allocatedInventory = 0
    
    if (Array.isArray(inventoryData)) {
      // Log each item's contribution to the totals
      // inventoryData.forEach((item: any, index: number) => {
      //   console.log(`Item ${index + 1}:`, {
      //     name: item.name,
      //     quantity: item.quantity,
      //     hasResource: !!item.resource,
      //     resourceName: item.resource?.name
      //   })
      // })

      // Total inventory is the sum of all items' quantities
      totalInventory = inventoryData.reduce((sum: number, item: any) => {
        const itemQuantity = item.quantity || 0
        // console.log(`Adding ${itemQuantity} to total inventory from ${item.name}`)
        return sum + itemQuantity
      }, 0)
      
      // Allocated inventory is the sum of quantities of items that have a resource assigned
      allocatedInventory = inventoryData.reduce((sum: number, item: any) => {
        const itemQuantity = item.quantity || 0
        const isAllocated = !!item.resource
        // console.log(`${item.name}: ${isAllocated ? 'Adding' : 'Skipping'} ${itemQuantity} ${isAllocated ? 'to' : 'from'} allocated inventory`)
        return sum + (item.resource ? itemQuantity : 0)
      }, 0)
      
      // console.log(`Final totals - total: ${totalInventory}, allocated: ${allocatedInventory}`)
    }

    return {
      totalSuppliers,
      activeSuppliers,
      totalResources,
      availableResources,
      totalInventory,
      allocatedInventory,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalResources: 0,
    availableResources: 0,
    totalInventory: 0,
    allocatedInventory: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await fetchDashboardStats()
        setStats(data)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard statistics'
        setError(errorMessage)
        console.error('Error loading stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-2">Please make sure the backend server is running and try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeSuppliers}/{stats.totalSuppliers}
          </div>
          <p className="text-xs text-muted-foreground">Active suppliers</p>
          <Progress 
            className="mt-3" 
            value={stats.totalSuppliers > 0 ? (stats.activeSuppliers / stats.totalSuppliers) * 100 : 0} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resources</CardTitle>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.availableResources}/{stats.totalResources}
          </div>
          <p className="text-xs text-muted-foreground">Available resources</p>
          <Progress 
            className="mt-3" 
            value={stats.totalResources > 0 ? (stats.availableResources / stats.totalResources) * 100 : 0} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.allocatedInventory}/{stats.totalInventory}
          </div>
          <p className="text-xs text-muted-foreground">Allocated items</p>
          <Progress 
            className="mt-3" 
            value={stats.totalInventory > 0 ? (stats.allocatedInventory / stats.totalInventory) * 100 : 0} 
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Allocation Rate</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalInventory > 0 ? Math.round((stats.allocatedInventory / stats.totalInventory) * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">Current allocation rate</p>
          <Progress 
            className="mt-3" 
            value={stats.totalInventory > 0 ? (stats.allocatedInventory / stats.totalInventory) * 100 : 0} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

