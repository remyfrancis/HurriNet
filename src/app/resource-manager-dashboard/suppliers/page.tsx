'use client'

import { useState, useEffect } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ResourceManagerNav } from '../resource-manager-nav'
import { useRouter } from 'next/navigation'

// Define types
type Supplier = {
  id: number
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
  supplied_items_count: number
  created_at: string
  updated_at: string
}

type SupplierItem = {
  id: number
  name: string
  quantity: number
  unit: string
  capacity: number
  resource_name: string
}

export default function SuppliersPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [supplierItems, setSupplierItems] = useState<SupplierItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    supplier_type: 'MEDICAL',
    description: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: ''
  })

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
  }, [router])

  // Fetch suppliers from API
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch suppliers from the API - updated URL with hyphen
        const response = await fetch('/api/resource-management/suppliers/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          
          // Use the detailed error message if available
          const errorMessage = errorData.message || errorData.error || `Error fetching suppliers: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        // Check if data has features property (GeoJSON format)
        if (data.features && Array.isArray(data.features)) {
          // Transform GeoJSON features to Supplier objects
          const suppliersData = data.features.map((feature: any) => ({
            id: feature.id,
            ...feature.properties,
            // Add any missing properties with default values
            supplied_items_count: feature.properties.supplied_items_count || 0
          }));
          setSuppliers(suppliersData);
        } else if (Array.isArray(data)) {
          // If data is already an array, use it directly
          setSuppliers(data);
        } else {
          console.warn('Unexpected API response format');
          setError('Unexpected API response format. Please try again later.');
          setSuppliers([]);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch suppliers. Please try again later.');
        setSuppliers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [token, isAuthenticated]);

  // Fetch supplier items when a supplier is selected
  useEffect(() => {
    if (selectedSupplier && isAuthenticated) {
      fetchSupplierItems(selectedSupplier.id);
    }
  }, [selectedSupplier, isAuthenticated]);

  // Filter suppliers based on search term and type
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || supplier.supplier_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle adding a new supplier
  const handleAddSupplier = async () => {
    try {
      // Send POST request to create a new supplier - updated URL with hyphen
      const response = await fetch('/api/resource-management/suppliers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSupplier)
      });
      
      if (!response.ok) {
        throw new Error(`Error creating supplier: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Add the new supplier to the state
      let newSupplierData: Supplier;
      
      if (data.properties) {
        newSupplierData = {
          id: data.id,
          ...data.properties,
          supplied_items_count: 0
        };
      } else if (data.id) {
        newSupplierData = {
          ...data,
          supplied_items_count: data.supplied_items_count || 0
        };
      } else {
        throw new Error('Invalid response format from server');
      }
      
      setSuppliers([...suppliers, newSupplierData]);
      setIsAddDialogOpen(false);
      resetNewSupplierForm();
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert(`Failed to add supplier: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to get supplier type display name
  const getSupplierTypeDisplay = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'MEDICAL': 'Medical Supplies',
      'FOOD': 'Food and Water',
      'SHELTER': 'Shelter Materials',
      'EQUIPMENT': 'Equipment',
      'OTHER': 'Other Supplies'
    };
    return typeMap[type] || type;
  };

  // Reset new supplier form
  const resetNewSupplierForm = () => {
    setNewSupplier({
      name: '',
      supplier_type: 'MEDICAL',
      description: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      notes: ''
    });
  };

  // Fetch items for a specific supplier
  const fetchSupplierItems = async (supplierId: number) => {
    if (!isAuthenticated) return;
    
    setIsLoadingItems(true);
    setItemsError(null);
    
    try {
      // Fetch items for the selected supplier - updated URL with hyphen
      const response = await fetch(`/api/resource-management/suppliers/${supplierId}/items/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response for items:', errorData);
        
        // Use the detailed error message if available
        const errorMessage = errorData.message || errorData.error || `Error fetching supplier items: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setSupplierItems(data);
    } catch (error) {
      console.error('Error fetching supplier items:', error);
      setItemsError(error instanceof Error ? error.message : 'Failed to fetch supplier items. Please try again later.');
      setSupplierItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-5 h-5 text-gray-500" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="MEDICAL">Medical Supplies</SelectItem>
                <SelectItem value="FOOD">Food and Water</SelectItem>
                <SelectItem value="SHELTER">Shelter Materials</SelectItem>
                <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                <SelectItem value="OTHER">Other Supplies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Suppliers List</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">Loading suppliers...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-amber-500">{error}</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredSuppliers.map((supplier) => (
                        <div 
                          key={supplier.id} 
                          className={`p-3 rounded-md cursor-pointer transition-colors ${
                            selectedSupplier?.id === supplier.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedSupplier(supplier)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{supplier.name}</h3>
                            <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {supplier.status_display}
                            </Badge>
                          </div>
                          <p className="text-sm opacity-80">{supplier.supplier_type_display}</p>
                          <p className="text-xs opacity-70 mt-1">{supplier.contact_name}</p>
                        </div>
                      ))}
                      
                      {filteredSuppliers.length === 0 && !isLoading && !error && (
                        <div className="text-center py-4 text-muted-foreground">
                          No suppliers found matching your criteria
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {selectedSupplier ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{selectedSupplier.name}</CardTitle>
                      <Badge variant={selectedSupplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {selectedSupplier.status_display}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="details">
                      <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="items">Supplied Items ({selectedSupplier.supplied_items_count})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-2">Supplier Information</h3>
                            <p className="text-sm mb-4">{selectedSupplier.description}</p>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{selectedSupplier.supplier_type_display}</Badge>
                              </div>
                              
                              {selectedSupplier.notes && (
                                <div className="mt-4 p-3 bg-muted rounded-md">
                                  <h4 className="font-medium mb-1">Notes</h4>
                                  <p className="text-sm">{selectedSupplier.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                            <div className="space-y-3">
                              {selectedSupplier.contact_name && (
                                <p className="text-sm font-medium">{selectedSupplier.contact_name}</p>
                              )}
                              
                              {selectedSupplier.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 opacity-70" />
                                  <a href={`mailto:${selectedSupplier.email}`} className="text-sm hover:underline">
                                    {selectedSupplier.email}
                                  </a>
                                </div>
                              )}
                              
                              {selectedSupplier.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 opacity-70" />
                                  <a href={`tel:${selectedSupplier.phone}`} className="text-sm hover:underline">
                                    {selectedSupplier.phone}
                                  </a>
                                </div>
                              )}
                              
                              {selectedSupplier.website && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 opacity-70" />
                                  <a href={selectedSupplier.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                                    {selectedSupplier.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              )}
                              
                              {selectedSupplier.address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 opacity-70" />
                                  <span className="text-sm">{selectedSupplier.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="items">
                        {isLoadingItems ? (
                          <div className="text-center py-4">
                            <p className="text-muted-foreground">Loading items...</p>
                          </div>
                        ) : itemsError ? (
                          <div className="text-center py-4">
                            <p className="text-amber-500">{itemsError}</p>
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => fetchSupplierItems(selectedSupplier.id)}
                            >
                              Retry
                            </Button>
                          </div>
                        ) : supplierItems.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Resource</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {supplierItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell>{item.quantity} {item.unit}</TableCell>
                                  <TableCell>{item.capacity} {item.unit}</TableCell>
                                  <TableCell>{item.resource_name}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No items supplied by this supplier
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[300px] bg-muted/20 rounded-lg border border-dashed">
                  <div className="text-center p-6">
                    <h3 className="font-medium text-lg mb-2">No Supplier Selected</h3>
                    <p className="text-muted-foreground">Select a supplier from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Supplier Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Supplier Name</Label>
                    <Input
                      id="name"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-type">Supplier Type</Label>
                    <Select 
                      value={newSupplier.supplier_type} 
                      onValueChange={(value) => setNewSupplier({...newSupplier, supplier_type: value})}
                    >
                      <SelectTrigger id="supplier-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEDICAL">Medical Supplies</SelectItem>
                        <SelectItem value="FOOD">Food and Water</SelectItem>
                        <SelectItem value="SHELTER">Shelter Materials</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="OTHER">Other Supplies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact-name">Contact Person</Label>
                    <Input
                      id="contact-name"
                      value={newSupplier.contact_name}
                      onChange={(e) => setNewSupplier({...newSupplier, contact_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={newSupplier.website}
                      onChange={(e) => setNewSupplier({...newSupplier, website: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSupplier.description}
                      onChange={(e) => setNewSupplier({...newSupplier, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newSupplier.notes}
                      onChange={(e) => setNewSupplier({...newSupplier, notes: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetNewSupplierForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddSupplier} disabled={!newSupplier.name}>
                  Add Supplier
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
