"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

type InventoryItem = {
  id: number
  name: string
  item_type: string
  quantity: number
  unit: string
  capacity: number
  supplier_id: number | null
  supplier_name: string | null
  resource_id: number | null
  resource_name: string | null
}

type Supplier = {
  id: number
  name: string
  supplier_type: string
}

type Resource = {
  id: number
  name: string
  resource_type: string
  capacity: number
  currentCount: number
}

export default function InventoryAllocation() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [selectedResource, setSelectedResource] = useState<string>("")
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("1")
  const [isAllocating, setIsAllocating] = useState(false)
  const [allocationResult, setAllocationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isRunningAlgorithm, setIsRunningAlgorithm] = useState(false)
  const [algorithmResults, setAlgorithmResults] = useState<
    { from: string; to: string; item: string; quantity: number }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }

        // Fetch inventory items
        const inventoryResponse = await fetch('/api/resource-management/inventory', { headers })
        if (!inventoryResponse.ok) {
          throw new Error('Failed to fetch inventory items')
        }
        const inventoryData = await inventoryResponse.json()
        const formattedInventoryItems = inventoryData.map((item: any) => ({
          id: item.id,
          name: item.name,
          item_type: item.item_type,
          quantity: item.quantity,
          unit: item.unit,
          capacity: item.capacity,
          supplier_id: item.supplier?.id || null,
          supplier_name: item.supplier?.name || null,
          resource_id: item.resource?.id || null,
          resource_name: item.resource?.name || null
        }))
        setInventoryItems(formattedInventoryItems)

        // Fetch suppliers
        const suppliersResponse = await fetch('/api/resource-management/suppliers', { headers })
        if (!suppliersResponse.ok) {
          throw new Error('Failed to fetch suppliers')
        }
        const suppliersData = await suppliersResponse.json()
        const formattedSuppliers = suppliersData.features.map((feature: any) => ({
          id: feature.id,
          name: feature.properties.name,
          supplier_type: feature.properties.supplier_type
        }))
        setSuppliers(formattedSuppliers)

        // Fetch resources
        const resourcesResponse = await fetch('/api/resource-management/resources', { headers })
        if (!resourcesResponse.ok) {
          throw new Error('Failed to fetch resources')
        }
        const resourcesData = await resourcesResponse.json()
        const formattedResources = resourcesData.features.map((feature: any) => ({
          id: feature.id,
          name: feature.properties.name,
          resource_type: feature.properties.resource_type,
          capacity: feature.properties.capacity,
          currentCount: feature.properties.current_count
        }))
        setResources(formattedResources)

        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data from the server')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleManualAllocation = async () => {
    if (!selectedSupplier || !selectedResource || !selectedItem || !quantity) {
      setAllocationResult({
        success: false,
        message: "Please fill in all fields",
      })
      return
    }

    setIsAllocating(true)

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/resource-management/inventory/allocate/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventory_item_id: Number.parseInt(selectedItem),
          resource_id: Number.parseInt(selectedResource),
          quantity: Number.parseInt(quantity)
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to allocate inventory'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', errorText)
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      // Refresh inventory data after allocation
      const inventoryResponse = await fetch('/api/resource-management/inventory/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!inventoryResponse.ok) {
        throw new Error('Failed to refresh inventory data')
      }

      const inventoryData = await inventoryResponse.json()
      const formattedInventoryItems = inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        item_type: item.item_type,
        quantity: item.quantity,
        unit: item.unit,
        capacity: item.capacity,
        supplier_id: item.supplier?.id || null,
        supplier_name: item.supplier?.name || null,
        resource_id: item.resource?.id || null,
        resource_name: item.resource?.name || null
      }))
      
      setInventoryItems(formattedInventoryItems)
      setAllocationResult({
        success: true,
        message: result.message
      })

      // Reset form
      setSelectedItem("")
      setQuantity("1")
    } catch (err) {
      console.error('Error allocating inventory:', err)
      setAllocationResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to allocate inventory'
      })
    } finally {
      setIsAllocating(false)
    }
  }

  const runHungarianAlgorithm = async () => {
    setIsRunningAlgorithm(true)
    setAlgorithmResults([])
    setAllocationResult(null)

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('Authentication required. Please log in.')
      }

      const response = await fetch('/api/resource-management/inventory/optimize_allocation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || `Failed to run optimization algorithm: ${response.statusText}`)
      }

      const results = await response.json()
      if (results.success === false) {
        throw new Error(results.error || 'Failed to run optimization algorithm')
      }
      
      setAlgorithmResults(results.allocations || [])
      setAllocationResult({
        success: true,
        message: 'Successfully generated allocation recommendations'
      })

      // Update inventory items to reflect the suggested allocations
      const inventoryResponse = await fetch('/api/resource-management/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!inventoryResponse.ok) {
        throw new Error('Failed to refresh inventory data')
      }

      const inventoryData = await inventoryResponse.json()
      const formattedInventoryItems = inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        item_type: item.item_type,
        quantity: item.quantity,
        unit: item.unit,
        capacity: item.capacity,
        supplier_id: item.supplier?.id || null,
        supplier_name: item.supplier?.name || null,
        resource_id: item.resource?.id || null,
        resource_name: item.resource?.name || null
      }))
      
      setInventoryItems(formattedInventoryItems)
    } catch (err) {
      console.error('Error running optimization algorithm:', err)
      setAllocationResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to run optimization algorithm'
      })
      setAlgorithmResults([])
    } finally {
      setIsRunningAlgorithm(false)
    }
  }

  const applyAlgorithmResults = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/resource-management/inventory/apply-optimization/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allocations: algorithmResults
        })
      })

      if (!response.ok) {
        throw new Error('Failed to apply optimized allocations')
      }

      // Refresh inventory data
      const inventoryResponse = await fetch('/api/resource-management/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!inventoryResponse.ok) {
        throw new Error('Failed to refresh inventory data')
      }

      const inventoryData = await inventoryResponse.json()
      const formattedInventoryItems = inventoryData.map((item: any) => ({
        id: item.id,
        name: item.name,
        item_type: item.item_type,
        quantity: item.quantity,
        unit: item.unit,
        capacity: item.capacity,
        supplier_id: item.supplier?.id || null,
        supplier_name: item.supplier?.name || null,
        resource_id: item.resource?.id || null,
        resource_name: item.resource?.name || null
      }))
      
      setInventoryItems(formattedInventoryItems)
      setAllocationResult({
        success: true,
        message: "Successfully applied automated allocations"
      })
      setAlgorithmResults([])
    } catch (err) {
      console.error('Error applying optimized allocations:', err)
      setAllocationResult({
        success: false,
        message: 'Failed to apply optimized allocations'
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 text-center">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="manual">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="manual">Manual Allocation</TabsTrigger>
        <TabsTrigger value="automated">Automated Allocation</TabsTrigger>
      </TabsList>

      <TabsContent value="manual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Manual Inventory Allocation</CardTitle>
            <CardDescription>Allocate inventory items from suppliers to resources manually</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allocationResult && (
              <Alert variant={allocationResult.success ? "default" : "destructive"}>
                {allocationResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{allocationResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{allocationResult.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger id="supplier">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource">Resource</Label>
                <Select value={selectedResource} onValueChange={setSelectedResource}>
                  <SelectTrigger id="resource">
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id.toString()}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Inventory Item</Label>
                <Select value={selectedItem} onValueChange={setSelectedItem} disabled={!selectedSupplier}>
                  <SelectTrigger id="item">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryItems
                      .filter((item) => !selectedSupplier || item.supplier_id === Number.parseInt(selectedSupplier))
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.quantity} {item.unit}s available)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleManualAllocation}
              disabled={isAllocating || !selectedSupplier || !selectedResource || !selectedItem || !quantity}
              className="w-full"
            >
              {isAllocating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating...
                </>
              ) : (
                "Allocate Inventory"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
            <CardDescription>View all inventory items and their current allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.item_type}</TableCell>
                    <TableCell>
                      {item.quantity} / {item.capacity} {item.unit}s
                    </TableCell>
                    <TableCell>{item.supplier_name || "N/A"}</TableCell>
                    <TableCell>
                      {item.resource_name ? (
                        <Badge variant="outline">{item.resource_name}</Badge>
                      ) : (
                        <Badge variant="secondary">Unallocated</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="automated" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Automated Allocation with Hungarian Algorithm</CardTitle>
            <CardDescription>Optimize inventory allocation using the Hungarian algorithm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                The Hungarian algorithm will optimize the allocation of inventory items from suppliers to resources
                based on:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Geographic proximity (minimize transportation distance)</li>
                <li>Resource needs and priorities</li>
                <li>Supplier capacity and availability</li>
                <li>Item type compatibility with resources</li>
              </ul>
            </div>

            {algorithmResults.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Recommended Allocations:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {algorithmResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.from}</TableCell>
                        <TableCell>{result.to}</TableCell>
                        <TableCell>{result.item}</TableCell>
                        <TableCell>{result.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Button onClick={applyAlgorithmResults} className="w-full">
                  Apply Recommended Allocations
                </Button>
              </div>
            ) : (
              <Button onClick={runHungarianAlgorithm} disabled={isRunningAlgorithm} className="w-full">
                {isRunningAlgorithm ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Algorithm...
                  </>
                ) : (
                  "Run Hungarian Algorithm"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algorithm Explanation</CardTitle>
            <CardDescription>How the Hungarian algorithm optimizes resource allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <p>
                The Hungarian algorithm (also known as the Kuhn-Munkres algorithm) is a combinatorial optimization
                algorithm that solves the assignment problem in polynomial time.
              </p>

              <div>
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Creates a cost matrix between suppliers and resources based on distance, need, and compatibility
                  </li>
                  <li>Performs row and column reductions to find the minimum number of lines covering all zeros</li>
                  <li>Iteratively adjusts the matrix until an optimal assignment is found</li>
                  <li>Produces the optimal allocation that minimizes total cost</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Benefits:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Minimizes transportation costs and delivery time</li>
                  <li>Ensures efficient resource utilization</li>
                  <li>Optimizes for multiple constraints simultaneously</li>
                  <li>Guarantees mathematically optimal solutions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

