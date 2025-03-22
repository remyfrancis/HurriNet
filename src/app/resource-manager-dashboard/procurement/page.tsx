'use client'

import { useEffect, useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResourceManagerNav } from '../resource-manager-nav'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, Send } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

interface Order {
  id: number
  item: string
  quantity: number
  supplier: string
  status: string
  destination?: string
}

interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  supplier_type: string
  status: string
}

interface InventoryItem {
  id: number
  name: string
  quantity: number
  capacity: number
  unit: string
  resource: {
    id: number
    name: string
    resource_type: string
  }
  supplier: {
    id: number
    name: string
  }
}

interface Resource {
  id: number
  name: string
  resource_type: string
  location: [number, number]
  capacity: number
  status: string
}

export default function Procurement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('')
  const [selectedResourceType, setSelectedResourceType] = useState<string>('')
  const [isAllocating, setIsAllocating] = useState(false)
  
  // Data states
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, inventoryRes, resourcesRes] = await Promise.all([
          fetch('/api/resource-management/suppliers/'),
          fetch('/api/resource-management/inventory/with_status/'),
          fetch('/api/resource-management/resources/')
        ])

        if (!suppliersRes.ok || !inventoryRes.ok || !resourcesRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [suppliersData, inventoryData, resourcesData] = await Promise.all([
          suppliersRes.json(),
          inventoryRes.json(),
          resourcesRes.json()
        ])

        setSuppliers(suppliersData)
        setInventoryItems(inventoryData)
        setResources(resourcesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error loading data",
          description: "Failed to load resource data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredItems = inventoryItems.filter(item =>
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedResourceType || item.resource.resource_type === selectedResourceType)
  )

  const filteredLocations = resources.filter(resource =>
    !selectedResourceType || resource.resource_type === selectedResourceType
  )

  const filteredSuppliers = suppliers.filter(supplier =>
    !selectedResourceType || supplier.supplier_type === selectedResourceType
  )

  const placeOrder = async () => {
    if (selectedItem && selectedSupplier && orderQuantity) {
      try {
        const response = await fetch('/api/resource-management/requests/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
        item: selectedItem,
        quantity: parseInt(orderQuantity),
        supplier: selectedSupplier,
            status: 'pending'
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to place order')
        }

        const newOrder = await response.json()
      setOrders([...orders, newOrder])
      setSelectedItem('')
      setSelectedSupplier('')
      setOrderQuantity('')
        
        toast({
          title: "Order placed successfully",
          description: "Your order has been added to the queue.",
        })
      } catch (error) {
        console.error('Error placing order:', error)
        toast({
          title: "Failed to place order",
          description: "There was an error placing your order. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const allocateResources = async () => {
    setIsAllocating(true)
    try {
      // Prepare data for Hungarian Algorithm
      const requests = orders
        .filter(order => order.status === 'pending')
        .map(order => ({
          id: order.id,
          item: order.item,
          quantity: order.quantity,
          priority: 1
        }))

      const resourcesData = filteredLocations.map(resource => ({
        id: resource.id,
        name: resource.name,
        location: resource.location,
        capacity: resource.capacity
      }))

      // Call backend API to allocate resources
      const response = await fetch('/api/resource-management/allocate-procurement/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests, resources: resourcesData }),
      })

      if (!response.ok) throw new Error('Failed to allocate resources')

      const allocations = await response.json()
      
      // Update orders with allocation results
      const updatedOrders = orders.map(order => {
        const allocation = allocations.find((a: { request_id: number }) => a.request_id === order.id)
        if (allocation) {
          return {
            ...order,
            status: 'allocated',
            destination: resources.find(r => r.id === allocation.resource_id)?.name
          }
        }
        return order
      })

      setOrders(updatedOrders)
      toast({
        title: "Resources allocated successfully",
        description: "The resources have been allocated to the requested locations.",
      })
    } catch (error) {
      console.error('Error allocating resources:', error)
      toast({
        title: "Failed to allocate resources",
        description: "There was an error allocating the resources. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAllocating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <ResourceManagerNav />
        <main className="flex-1">
          <div className="container p-8">
            <div className="flex items-center justify-center h-screen">
              <div className="text-lg">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Calculate summary statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const allocatedOrders = orders.filter(order => order.status === 'allocated').length;
  const allocationRate = totalOrders > 0 ? Math.round((allocatedOrders / totalOrders) * 100) : 0;

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Procurement Management</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground">Active procurement orders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Orders awaiting allocation</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Allocation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allocationRate}%</div>
                <p className="text-xs text-muted-foreground">Orders successfully allocated</p>
              </CardContent>
            </Card>
          </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Place New Order</h2>
        <div className="flex flex-wrap gap-4">
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies</SelectItem>
                  <SelectItem value="WATER">Water</SelectItem>
                  <SelectItem value="SHELTER">Shelter</SelectItem>
                </SelectContent>
              </Select>

          <Select value={selectedItem} onValueChange={setSelectedItem}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
                  {filteredItems.map((item) => (
                <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
                  {filteredSuppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.name}>{supplier.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Quantity"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            className="w-[150px]"
          />
          <Button onClick={placeOrder}>Place Order</Button>
        </div>
      </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Current Orders</CardTitle>
                <Button 
                  onClick={allocateResources} 
                  disabled={isAllocating || orders.length === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Allocate Resources
                </Button>
              </div>
            </CardHeader>
            <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
                    <TableHead>Destination</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.item}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{order.status}</TableCell>
                      <TableCell>{order.destination || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search items or suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
              </div>
            </CardHeader>
            <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Supplier</TableHead>
                    <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.supplier.name}</TableCell>
                      <TableCell>{item.resource.resource_type}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Order</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Place Order for {item.name}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="order-quantity" className="text-right">
                            Quantity
                          </Label>
                          <Input
                            id="order-quantity"
                            type="number"
                            className="col-span-3"
                            onChange={(e) => setOrderQuantity(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => {
                          placeOrder();
                          setSelectedItem(item.name);
                                setSelectedSupplier(item.supplier.name);
                        }}>
                          Place Order
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
            </CardContent>
          </Card>
      </div>
      </main>
    </div>
  )
}

