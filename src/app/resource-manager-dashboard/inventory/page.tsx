'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ResourceManagerNav } from '../resource-manager-nav'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Filter, Plus } from 'lucide-react'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Define the inventory item type
interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  capacity: number;
  unit: string;
  resource: { id: number; name: string } | null; // Updated resource type
  resource_name: string;
  status: string;
  last_updated: string;
  supplier: { id: number; name: string } | null; // Updated supplier type
}

// Define the resource type
interface Resource {
  id: number;
  name: string;
}

export default function InventoryPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [itemToUpdate, setItemToUpdate] = useState<InventoryItem | null>(null)
  
  // Form state for new inventory item
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    capacity: 0,
    unit: '',
    resource: ''
  })

  // Form state for updating an inventory item
  const [updateItem, setUpdateItem] = useState({
    name: '',
    quantity: 0,
    capacity: 0,
    unit: '',
    resourceId: '', // Use resourceId for clarity
    supplierId: ''  // Use supplierId for clarity
  })

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page

  // Fetch resources for the dropdown
  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch('/api/resource-management/resources/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      // Extract resources from the features array if it exists
      const resourcesList = data.features ? 
        data.features.map((feature: any) => ({ 
          id: feature.id, 
          name: feature.properties.name 
        })) : 
        data.map((resource: any) => ({ 
          id: resource.id, 
          name: resource.name 
        }))
      
      setResources(resourcesList)
    } catch (err) {
      console.error('Error fetching resources:', err)
      // Use mock data as fallback
      setResources([
        { id: 1, name: 'Castries Water Distribution Center' },
        { id: 2, name: 'Gros Islet Supply Depot' },
        { id: 3, name: 'Soufrière Medical Center' }
      ])
    }
  }

  // Fetch inventory data from the API
  const fetchInventoryData = async (statusFilter = 'all', locationFilter = 'all') => {
    try {
      setLoading(true)
      setError(null)
      
      // Get the token from localStorage
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Build the API URL with filters if needed
      let url = '/api/resource-management/inventory/with_status/'
      const params = new URLSearchParams()
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (locationFilter && locationFilter !== 'all') {
        params.append('location', locationFilter)
      }
      
      // Add query parameters if any exist
      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
      
      console.log('Fetching inventory data from:', url)
      
      // Make the API request
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      setInventoryItems(data)
      
      // Extract unique locations for the location filter
      const locations = [...new Set(data.map((item: InventoryItem) => item.resource_name))].sort() as string[]
      setUniqueLocations(locations)
    } catch (err) {
      console.error('Error fetching inventory data:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      // Clear items and locations on error instead of using mock data
      setInventoryItems([])
      setUniqueLocations([])
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'capacity' ? parseInt(value) || 0 : value
    }))
  }

  // Handle resource selection
  const handleResourceChange = (value: string) => {
    setNewItem(prev => ({
      ...prev,
      resource: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Validate form
      if (!newItem.name || !newItem.unit || !newItem.resource || newItem.quantity <= 0 || newItem.capacity <= 0) {
        throw new Error('Please fill in all required fields with valid values')
      }
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Prepare data for API
      const itemData = {
        name: newItem.name,
        quantity: newItem.quantity,
        capacity: newItem.capacity,
        unit: newItem.unit,
        resource: newItem.resource
      }
      
      // Send data to API
      const response = await fetch('/api/resource-management/inventory/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to add inventory item')
      }
      
      // Success - close dialog and refresh data
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      })
      
      setIsAddDialogOpen(false)
      resetForm()
      fetchInventoryData(statusFilter, locationFilter)
    } catch (err) {
      console.error('Error adding inventory item:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setNewItem({
      name: '',
      quantity: 0,
      capacity: 0,
      unit: '',
      resource: ''
    })
  }

  // Handle delete confirmation
  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete item
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    
    try {
      setIsSubmitting(true)
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Send delete request to API - Corrected URL
      const response = await fetch(`/api/resource-management/inventory/${itemToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.status}`)
      }
      
      // Success - close dialog and refresh data
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      })
      
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
      fetchInventoryData(statusFilter, locationFilter)
    } catch (err) {
      console.error('Error deleting inventory item:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle update click
  const handleUpdateClick = (item: InventoryItem) => {
    setItemToUpdate(item)
    setUpdateItem({
      name: item.name,
      quantity: item.quantity,
      capacity: item.capacity,
      unit: item.unit,
      // Read ID from nested objects, handle null cases
      resourceId: item.resource ? item.resource.id.toString() : '', 
      supplierId: item.supplier ? item.supplier.id.toString() : '' 
    })
    setIsUpdateDialogOpen(true)
  }

  // Handle update input changes
  const handleUpdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUpdateItem(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'capacity' ? parseInt(value) || 0 : value
    }))
  }

  // Handle update resource selection
  const handleUpdateResourceChange = (value: string) => {
    setUpdateItem(prev => ({
      ...prev,
      resourceId: value // Update resourceId
    }))
  }

  // Handle update form submission
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemToUpdate) return
    
    setIsSubmitting(true)
    
    try {
      // Validate form - using updated state names
      if (!updateItem.name || !updateItem.unit || !updateItem.resourceId || !updateItem.supplierId || updateItem.quantity < 0 || updateItem.capacity <= 0) {
        throw new Error('Please fill in all required fields with valid values (Quantity >= 0, Capacity > 0)')
      }
      
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      // Prepare data for API - using updated field names for backend
      const itemData = {
        name: updateItem.name,
        quantity: updateItem.quantity,
        capacity: updateItem.capacity,
        unit: updateItem.unit,
        resource_id: parseInt(updateItem.resourceId, 10), // Use resource_id
        supplier_id: parseInt(updateItem.supplierId, 10)  // Use supplier_id
      }

      // Basic validation check
       if (isNaN(itemData.resource_id) || isNaN(itemData.supplier_id)) { // Check new field names
         throw new Error("Invalid Resource or Supplier ID selected.");
       }
      
      // Send data to API - Corrected URL
      const response = await fetch(`/api/resource-management/inventory/${itemToUpdate.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        // Log the detailed error from DRF
        console.error("API Update Error:", errorData); 
        // Construct a more informative error message
        const errorDetails = Object.entries(errorData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        throw new Error(`Failed to update inventory item: ${errorDetails || response.statusText}`)
      }
      
      // Success - close dialog and refresh data
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      })
      
      setIsUpdateDialogOpen(false)
      setItemToUpdate(null)
      fetchInventoryData(statusFilter, locationFilter)
    } catch (err) {
      console.error('Error updating inventory item:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/auth/login')
      return
    }
    setIsAuthenticated(true)
    
    // Fetch initial data
    fetchInventoryData()
    fetchResources()
  }, [router])
  
  // Fetch data when status filter changes
  useEffect(() => {
    if (isAuthenticated) {
      // Reset page to 1 when filters change before fetching
      setCurrentPage(1); 
      fetchInventoryData(statusFilter, locationFilter);
    }
  }, [statusFilter, locationFilter, isAuthenticated]); // Removed currentPage from dependencies here

  // Apply filters to the inventory items
  const filteredItems = inventoryItems.filter(item => {
    // Apply status filter
    if (statusFilter !== 'all' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false
    }
    
    // Apply location filter
    if (locationFilter !== 'all' && item.resource_name !== locationFilter) {
      return false
    }
    
    return true
  })

  // Recalculate pagination when items or page change, but not on initial filter application
  useEffect(() => {
    if (filteredItems.length > 0 && currentPage > Math.ceil(filteredItems.length / itemsPerPage)) {
      setCurrentPage(Math.ceil(filteredItems.length / itemsPerPage) || 1);
    }
  }, [filteredItems, itemsPerPage, currentPage]);

  if (!isAuthenticated) {
    return null
  }

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Slice the *filtered* items for the current page
  const paginatedItems = filteredItems.slice(startIndex, endIndex); 

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  // --- End Pagination Logic ---

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sufficient':
        return 'bg-green-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Calculate summary statistics
  const totalItems = filteredItems.length
  const averageStockLevel = filteredItems.length > 0 
    ? Math.round(filteredItems.reduce((acc, item) => acc + (item.quantity / item.capacity * 100), 0) / filteredItems.length)
    : 0
  const criticalItems = filteredItems.filter(item => item.status.toLowerCase() === 'low').length
  const locationsCount = new Set(filteredItems.map(item => item.resource_name)).size

  return (
    <div className="flex min-h-screen">
      <ResourceManagerNav />
      <main className="flex-1">
        <div className="container p-8">
          <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
          
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-xs text-muted-foreground">Across {locationsCount} locations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Stock Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {averageStockLevel}%
                  </div>
                  <Progress 
                    value={averageStockLevel} 
                    className="h-2 mt-2" 
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{criticalItems}</div>
                  <p className="text-xs text-muted-foreground">Items requiring immediate attention</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filters */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filter by Status</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant={statusFilter === 'all' ? 'default' : 'outline'} 
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={statusFilter === 'sufficient' ? 'default' : 'outline'} 
                    onClick={() => setStatusFilter('sufficient')}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Sufficient
                  </Button>
                  <Button 
                    variant={statusFilter === 'moderate' ? 'default' : 'outline'} 
                    onClick={() => setStatusFilter('moderate')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    Moderate
                  </Button>
                  <Button 
                    variant={statusFilter === 'low' ? 'default' : 'outline'} 
                    onClick={() => setStatusFilter('low')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Low
                  </Button>
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Filter by Location</h3>
                <Select
                  value={locationFilter}
                  onValueChange={setLocationFilter}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="all-locations" value="all">All Locations</SelectItem>
                    {uniqueLocations.map(location => (
                      <SelectItem key={`loc-${location}`} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset Filters Button */}
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStatusFilter('all')
                    setLocationFilter('all')
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6 flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Loading state */}
            {loading ? (
              <Card>
                <CardContent className="pt-6 flex justify-center">
                  <p>Loading inventory data...</p>
                </CardContent>
              </Card>
            ) : (
              /* Inventory Table */
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Inventory Items</h3>
                    <div className="text-sm text-muted-foreground">
                      {filteredItems.length} items found
                    </div>
                  </div>
                  <Table>
                    <TableCaption>Inventory items as of {new Date().toLocaleDateString()}</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Resource Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No inventory items found for the current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.resource_name}</TableCell>
                            <TableCell>
                              {item.quantity} / {item.capacity} {item.unit}
                              <Progress 
                                value={(item.quantity / item.capacity) * 100} 
                                className="h-2 mt-1" 
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.last_updated}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUpdateClick(item)}
                                >
                                  Update
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteClick(item)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Export Data</Button>
              
              {/* Add Item Dialog */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new inventory item below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={newItem.name}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right">
                          Quantity
                        </Label>
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          min="0"
                          value={newItem.quantity}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="capacity" className="text-right">
                          Capacity
                        </Label>
                        <Input
                          id="capacity"
                          name="capacity"
                          type="number"
                          min="0"
                          value={newItem.capacity}
                          onChange={handleInputChange}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="unit" className="text-right">
                          Unit
                        </Label>
                        <Input
                          id="unit"
                          name="unit"
                          value={newItem.unit}
                          onChange={handleInputChange}
                          className="col-span-3"
                          placeholder="e.g., bottles, kg, units"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="resource" className="text-right">
                          Resource
                        </Label>
                        <div className="col-span-3">
                          <Select
                            value={newItem.resource.toString()}
                            onValueChange={handleResourceChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a resource" />
                            </SelectTrigger>
                            <SelectContent>
                              {resources.map(resource => (
                                <SelectItem key={resource.id} value={resource.id.toString()}>
                                  {resource.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm()
                          setIsAddDialogOpen(false)
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {itemToDelete && (
              <div className="space-y-2">
                <p><strong>Item:</strong> {itemToDelete.name}</p>
                <p><strong>Location:</strong> {itemToDelete.resource_name}</p>
                <p><strong>Quantity:</strong> {itemToDelete.quantity} {itemToDelete.unit}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Item Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of the inventory item below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="update-name"
                  name="name"
                  value={updateItem.name}
                  onChange={handleUpdateInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="update-quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={updateItem.quantity}
                  onChange={handleUpdateInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="update-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={updateItem.capacity}
                  onChange={handleUpdateInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-unit" className="text-right">
                  Unit
                </Label>
                <Input
                  id="update-unit"
                  name="unit"
                  value={updateItem.unit}
                  onChange={handleUpdateInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="update-resource" className="text-right">
                  Resource
                </Label>
                <Select 
                  value={updateItem.resourceId}
                  onValueChange={handleUpdateResourceChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {resources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id.toString()}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 