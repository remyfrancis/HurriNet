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

  useEffect(() => {
    // In a real app, fetch this data from your API
    const mockInventoryItems: InventoryItem[] = [
      {
        id: 1,
        name: "Bandages",
        item_type: "MEDICAL",
        quantity: 500,
        unit: "box",
        capacity: 1000,
        supplier_id: 1,
        supplier_name: "MedSupply Co.",
        resource_id: null,
        resource_name: null,
      },
      {
        id: 2,
        name: "Antibiotics",
        item_type: "MEDICAL",
        quantity: 200,
        unit: "bottle",
        capacity: 300,
        supplier_id: 1,
        supplier_name: "MedSupply Co.",
        resource_id: null,
        resource_name: null,
      },
      {
        id: 3,
        name: "Canned Food",
        item_type: "FOOD",
        quantity: 1000,
        unit: "can",
        capacity: 2000,
        supplier_id: 2,
        supplier_name: "FoodWorks Inc.",
        resource_id: null,
        resource_name: null,
      },
      {
        id: 4,
        name: "Bottled Water",
        item_type: "WATER",
        quantity: 500,
        unit: "bottle",
        capacity: 1000,
        supplier_id: 2,
        supplier_name: "FoodWorks Inc.",
        resource_id: null,
        resource_name: null,
      },
      {
        id: 5,
        name: "Tents",
        item_type: "SHELTER",
        quantity: 50,
        unit: "unit",
        capacity: 100,
        supplier_id: 3,
        supplier_name: "ShelterTech",
        resource_id: null,
        resource_name: null,
      },
    ]

    const mockSuppliers: Supplier[] = [
      { id: 1, name: "MedSupply Co.", supplier_type: "MEDICAL" },
      { id: 2, name: "FoodWorks Inc.", supplier_type: "FOOD" },
      { id: 3, name: "ShelterTech", supplier_type: "SHELTER" },
      { id: 4, name: "EquipmentPro", supplier_type: "EQUIPMENT" },
      { id: 5, name: "GeneralSupplies", supplier_type: "OTHER" },
    ]

    const mockResources: Resource[] = [
      { id: 1, name: "Central Medical Facility", resource_type: "MEDICAL", capacity: 1000, currentCount: 750 },
      { id: 2, name: "North Food Bank", resource_type: "SUPPLIES", capacity: 500, currentCount: 450 },
      { id: 3, name: "East Shelter", resource_type: "SHELTER", capacity: 200, currentCount: 120 },
      { id: 4, name: "South Water Station", resource_type: "WATER", capacity: 2000, currentCount: 1900 },
      { id: 5, name: "West Medical Outpost", resource_type: "MEDICAL", capacity: 300, currentCount: 150 },
    ]

    setInventoryItems(mockInventoryItems)
    setSuppliers(mockSuppliers)
    setResources(mockResources)
  }, [])

  const handleManualAllocation = () => {
    if (!selectedSupplier || !selectedResource || !selectedItem || !quantity) {
      setAllocationResult({
        success: false,
        message: "Please fill in all fields",
      })
      return
    }

    setIsAllocating(true)

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to allocate inventory
      const updatedItems = inventoryItems.map((item) => {
        if (item.id === Number.parseInt(selectedItem)) {
          return {
            ...item,
            resource_id: Number.parseInt(selectedResource),
            resource_name: resources.find((r) => r.id === Number.parseInt(selectedResource))?.name || null,
            quantity: item.quantity - Number.parseInt(quantity),
          }
        }
        return item
      })

      setInventoryItems(updatedItems)
      setIsAllocating(false)
      setAllocationResult({
        success: true,
        message: `Successfully allocated ${quantity} units to ${resources.find((r) => r.id === Number.parseInt(selectedResource))?.name}`,
      })

      // Reset form
      setSelectedItem("")
      setQuantity("1")
    }, 1500)
  }

  const runHungarianAlgorithm = () => {
    setIsRunningAlgorithm(true)
    setAlgorithmResults([])

    // Simulate running the Hungarian algorithm
    setTimeout(() => {
      // In a real app, this would be an API call to run the algorithm
      // The Hungarian algorithm would optimize the allocation of inventory items to resources
      // based on various factors like distance, resource needs, etc.

      const mockResults = [
        {
          from: "MedSupply Co.",
          to: "Central Medical Facility",
          item: "Bandages",
          quantity: 200,
        },
        {
          from: "MedSupply Co.",
          to: "West Medical Outpost",
          item: "Antibiotics",
          quantity: 50,
        },
        {
          from: "FoodWorks Inc.",
          to: "North Food Bank",
          item: "Canned Food",
          quantity: 300,
        },
        {
          from: "FoodWorks Inc.",
          to: "South Water Station",
          item: "Bottled Water",
          quantity: 100,
        },
        {
          from: "ShelterTech",
          to: "East Shelter",
          item: "Tents",
          quantity: 20,
        },
      ]

      setAlgorithmResults(mockResults)
      setIsRunningAlgorithm(false)

      // Update inventory items to reflect the allocations
      const updatedItems = [...inventoryItems]
      mockResults.forEach((result) => {
        const itemIndex = updatedItems.findIndex((item) => item.name === result.item)
        if (itemIndex !== -1) {
          const resourceId = resources.find((r) => r.name === result.to)?.id || null
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: updatedItems[itemIndex].quantity - result.quantity,
            resource_id: resourceId,
            resource_name: result.to,
          }
        }
      })

      setInventoryItems(updatedItems)
    }, 3000)
  }

  const applyAlgorithmResults = () => {
    setAllocationResult({
      success: true,
      message: "Successfully applied automated allocations",
    })
    setAlgorithmResults([])
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

