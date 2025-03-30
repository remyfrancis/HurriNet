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

// Mock Data
const MOCK_RESOURCES: ResourceFeature[] = [
  {
    type: 'Feature',
    geometry: [14.0101, -60.9789],
    id: 1,
    properties: {
      name: "St. Lucia Medical Center",
      resource_type: "MEDICAL",
      status: "ACTIVE",
      description: "Main medical facility in Castries",
      capacity: 1000,
      current_count: 750,
      current_workload: 75,
      address: "Castries, St. Lucia"
    }
  },
  {
    type: 'Feature',
    geometry: [13.9094, -60.9789],
    id: 2,
    properties: {
      name: "Vieux Fort Supply Depot",
      resource_type: "SUPPLIES",
      status: "ACTIVE",
      description: "Main supply warehouse",
      capacity: 2000,
      current_count: 1500,
      current_workload: 65,
      address: "Vieux Fort, St. Lucia"
    }
  },
  {
    type: 'Feature',
    geometry: [14.0167, -60.9833],
    id: 3,
    properties: {
      name: "Castries Water Treatment",
      resource_type: "WATER",
      status: "ACTIVE",
      description: "Water treatment and storage facility",
      capacity: 500,
      current_count: 400,
      current_workload: 80,
      address: "Castries, St. Lucia"
    }
  }
];

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    name: "Medical Supplies Kit",
    quantity: 200,
    capacity: 300,
    unit: "kits",
    resource: {
      id: 1,
      name: "St. Lucia Medical Center"
    },
    supplier: {
      id: 1,
      name: "St. Lucia Medical Supplies Ltd."
    },
    status: "IN_STOCK"
  },
  {
    id: 2,
    name: "Water Purification Tablets",
    quantity: 5000,
    capacity: 10000,
    unit: "tablets",
    resource: {
      id: 3,
      name: "Castries Water Treatment"
    },
    supplier: {
      id: 2,
      name: "Caribbean Water Solutions"
    },
    status: "IN_STOCK"
  },
  {
    id: 3,
    name: "Emergency Food Supplies",
    quantity: 1000,
    capacity: 2000,
    unit: "boxes",
    resource: {
      id: 2,
      name: "Vieux Fort Supply Depot"
    },
    supplier: {
      id: 3,
      name: "Regional Food Bank"
    },
    status: "IN_STOCK"
  }
];

const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 1,
    item: "Medical Supplies Kit",
    quantity: 50,
    source: "St. Lucia Medical Center",
    destination: "Vieux Fort Supply Depot",
    status: "pending",
    status_display: "Pending",
    created_at: "2024-03-17T10:00:00Z"
  },
  {
    id: 2,
    item: "Water Purification Tablets",
    quantity: 1000,
    source: "Castries Water Treatment",
    destination: "Vieux Fort Supply Depot",
    status: "completed",
    status_display: "Completed",
    created_at: "2024-03-16T15:30:00Z"
  }
];

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

  // Replace the useEffect with mock data
  useEffect(() => {
    // Simulate API call delay
    const loadMockData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setResources(MOCK_RESOURCES);
        setInventoryItems(MOCK_INVENTORY);
        setTransfers(MOCK_TRANSFERS);
      } catch (error) {
        console.error('Error loading mock data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMockData();
  }, []);

  const filteredItems = inventoryItems.filter(item =>
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resource?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedResourceType || selectedResourceType === 'ALL' || resources.find(r => r.id === item.resource?.id)?.properties.resource_type === selectedResourceType)
  )

  // Filter available items based on selected source
  const availableItems = inventoryItems.filter(item => 
    !sourceResource || item.resource?.id.toString() === sourceResource
  )

  // Modify handleTransfer to work with mock data
  const handleTransfer = async () => {
    if (!selectedItem || !sourceResource || !destinationResource || !transferQuantity) {
      toast({
        title: "Missing information",
        description: "Please fill in all transfer details.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new mock transfer
      const newTransfer: Transfer = {
        id: transfers.length + 1,
        item: inventoryItems.find(item => item.id.toString() === selectedItem)?.name || "",
        quantity: parseInt(transferQuantity),
        source: resources.find(r => r.id.toString() === sourceResource)?.properties.name || "",
        destination: resources.find(r => r.id.toString() === destinationResource)?.properties.name || "",
        status: "pending",
        status_display: "Pending",
        created_at: new Date().toISOString()
      };

      setTransfers([...transfers, newTransfer]);
      setShowTransferDialog(false);
      
      toast({
        title: "Transfer initiated",
        description: "The inventory transfer has been started.",
      });
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast({
        title: "Transfer failed",
        description: "Failed to initiate the transfer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modify handleTransferAction to work with mock data
  const handleTransferAction = async (transferId: number, action: 'complete' | 'cancel') => {
    try {
      const updatedTransfers = transfers.map(transfer => {
        if (transfer.id === transferId) {
          return {
            ...transfer,
            status: action === 'complete' ? 'completed' : 'cancelled',
            status_display: action === 'complete' ? 'Completed' : 'Cancelled'
          };
        }
        return transfer;
      });

      setTransfers(updatedTransfers);

      toast({
        title: `Transfer ${action}d`,
        description: `The transfer has been ${action}d successfully.`,
      });
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error);
      toast({
        title: `${action} failed`,
        description: `Failed to ${action} the transfer. Please try again.`,
        variant: "destructive",
      });
    }
  };

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
                  <SelectItem value="ALL">All Types</SelectItem>
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