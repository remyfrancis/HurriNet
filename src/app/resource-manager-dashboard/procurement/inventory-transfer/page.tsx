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
import { ResourceManagerNav } from '../../resource-manager-nav'
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
import { ArrowRight, Search, Send, TrendingUp } from 'lucide-react'
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = 'http://localhost:8000'

interface ResourceProperties {
  name: string
  resource_type: string
  status: string
  description: string
  capacity: number
  current_count: number
  current_workload: number
  address: string
}

interface ResourceFeature {
  type: 'Feature'
  geometry: [number, number]  // Array of [longitude, latitude]
  id: number
  properties: ResourceProperties
}

interface ResourceResponse {
  type: 'FeatureCollection'
  features: ResourceFeature[]
}

interface SupplierProperties {
  name: string
  supplier_type: string
  supplier_type_display: string
  description: string
  contact_name: string
  email: string
  phone: string
  address: string
  website: string
  status: string
  status_display: string
  notes: string
  created_at: string
  updated_at: string
}

interface SupplierFeature {
  id: number
  type: 'Feature'
  geometry: string | null
  properties: SupplierProperties
}

interface SupplierGeoJSON {
  type: 'FeatureCollection'
  features: SupplierFeature[]
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
  }
  supplier: {
    id: number
    name: string
  }
  status: string
}

interface Transfer {
  id: number
  item: string
  quantity: number
  source: string
  destination: string
  status: string
  status_display: string
  created_at: string
}

export default function InventoryTransfer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResourceType, setSelectedResourceType] = useState<string>('')
  const [resources, setResources] = useState<ResourceFeature[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Transfer dialog state
  const [selectedItem, setSelectedItem] = useState('')
  const [sourceResource, setSourceResource] = useState('')
  const [destinationResource, setDestinationResource] = useState('')
  const [transferQuantity, setTransferQuantity] = useState('')
  const [showTransferDialog, setShowTransferDialog] = useState(false)

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }

        const [resourcesRes, inventoryRes, transfersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/resource-management/resources/`, { headers }),
          fetch(`${API_BASE_URL}/api/resource-management/inventory/with_status/`, { headers }),
          fetch(`${API_BASE_URL}/api/resource-management/transfers/`, { headers })
        ])

        if (!resourcesRes.ok || !inventoryRes.ok || !transfersRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [resourcesData, inventoryData, transfersData] = await Promise.all([
          resourcesRes.json() as Promise<ResourceResponse>,
          inventoryRes.json(),
          transfersRes.json()
        ])

        setResources(resourcesData.features)
        setInventoryItems(inventoryData)
        setTransfers(transfersData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error loading data",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredItems = inventoryItems.filter(item =>
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedResourceType || resources.find(r => r.id === item.resource?.id)?.properties.resource_type === selectedResourceType)
  )

  // Filter available items based on selected source
  const availableItems = inventoryItems.filter(item => 
    !sourceResource || item.resource?.id.toString() === sourceResource
  )

  const handleTransfer = async () => {
    if (!selectedItem || !sourceResource || !destinationResource || !transferQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all transfer details.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resource-management/transfers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          item_id: selectedItem,
          source_id: sourceResource,
          destination_id: destinationResource,
          quantity: parseInt(transferQuantity),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create transfer')
      }

      const newTransfer = await response.json()
      setTransfers([...transfers, newTransfer])
      setShowTransferDialog(false)
      
      toast({
        title: "Transfer initiated",
        description: "The inventory transfer has been started.",
      })
    } catch (error) {
      console.error('Error creating transfer:', error)
      toast({
        title: "Transfer failed",
        description: "Failed to initiate the transfer. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTransferAction = async (transferId: number, action: 'complete' | 'cancel') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resource-management/transfers/${transferId}/${action}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} transfer`)
      }

      // Update the transfer in the list
      const updatedTransfer = await response.json()
      setTransfers(transfers.map(t => 
        t.id === transferId ? updatedTransfer : t
      ))

      toast({
        title: `Transfer ${action}d`,
        description: `The transfer has been ${action}d successfully.`,
      })
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error)
      toast({
        title: `${action} failed`,
        description: `Failed to ${action} the transfer. Please try again.`,
        variant: "destructive",
      })
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

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Inventory Transfer</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resources.length}</div>
                <p className="text-xs text-muted-foreground">Active resource locations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryItems.length}</div>
                <p className="text-xs text-muted-foreground">Items across all locations</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transfers.filter(t => t.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Pending inventory transfers</p>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {Array.from(new Set(resources.map(r => r.properties.resource_type))).map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    New Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Inventory Transfer</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="source" className="text-right">From</Label>
                      <Select value={sourceResource} onValueChange={(value) => {
                        setSourceResource(value)
                        setSelectedItem('') // Reset selected item when source changes
                      }}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {resources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id.toString()}>
                              {resource.properties.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="item" className="text-right">Item</Label>
                      <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name} ({item.quantity} available)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="destination" className="text-right">To</Label>
                      <Select value={destinationResource} onValueChange={setDestinationResource}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {resources
                            .filter(r => r.id.toString() !== sourceResource)
                            .map((resource) => (
                              <SelectItem key={resource.id} value={resource.id.toString()}>
                                {resource.properties.name}
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="quantity" className="text-right">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={transferQuantity}
                        onChange={(e) => setTransferQuantity(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleTransfer}>Initiate Transfer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Inventory Table */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Current Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.resource?.name || 'Unassigned'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.capacity}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>{item.supplier?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item.id.toString())
                            setSourceResource(item.resource?.id.toString() || '')
                            setShowTransferDialog(true)
                          }}
                        >
                          Transfer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Active Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>Active Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No active transfers
                      </TableCell>
                    </TableRow>
                  ) : (
                    transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>{transfer.item}</TableCell>
                        <TableCell>{transfer.source}</TableCell>
                        <TableCell>{transfer.destination}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.status_display}</TableCell>
                        <TableCell>{new Date(transfer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {transfer.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTransferAction(transfer.id, 'complete')}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTransferAction(transfer.id, 'cancel')}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 