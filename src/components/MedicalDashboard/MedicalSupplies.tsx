'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, Trash2, Plus } from 'lucide-react'

type Supply = {
  id: number
  item_name: string
  quantity: number
  unit: string
  facility: number
  category: string
  status: string
  is_medical: boolean
  last_updated: string
}

type Facility = {
  id: number
  name: string
}

const SUPPLY_CATEGORIES = ["PPE", "Equipment", "Medication", "Consumables"]
const SUPPLY_STATUSES = ["in_stock", "out_of_stock", "low_stock"]

const STATUS_LABELS: Record<string, string> = {
  "in_stock": "Adequate Supply",
  "out_of_stock": "Out of Stock",
  "low_stock": "Low Supply"
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function MedicalSupplies() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [formData, setFormData] = useState<Partial<Supply>>({
    item_name: '',
    quantity: 0,
    unit: '',
    facility: 0,
    category: '',
    status: 'in_stock',
    is_medical: true
  })

  useEffect(() => {
    fetchSupplies()
    fetchFacilities()
  }, [])

  const fetchSupplies = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/supplies/`)
      const data = await response.json()
      setSupplies(data.filter((supply: Supply) => supply.is_medical))
    } catch (error) {
      console.error('Error fetching supplies:', error)
    }
  }

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/facilities/`)
      const data = await response.json()
      setFacilities(data)
    } catch (error) {
      console.error('Error fetching facilities:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/supplies/${editingSupply ? `${editingSupply.id}/` : ''}`
      const method = editingSupply ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsDialogOpen(false)
        setEditingSupply(null)
        setFormData({})
        fetchSupplies()
      }
    } catch (error) {
      console.error('Error saving supply:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this supply?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/supplies/${id}/`, {
          method: 'DELETE'
        })
        fetchSupplies()
      } catch (error) {
        console.error('Error deleting supply:', error)
      }
    }
  }

  const openEditDialog = (supply: Supply) => {
    setEditingSupply(supply)
    setFormData(supply)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Supplies</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSupply(null)
              setFormData({})
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supply
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSupply ? 'Edit' : 'Add'} Supply</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_name">Item Name</Label>
                  <Input
                    id="item_name"
                    value={formData.item_name || ''}
                    onChange={e => setFormData({...formData, item_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity || ''}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit || ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facility">Facility</Label>
                  <Select
                    value={formData.facility?.toString()}
                    onValueChange={value => setFormData({...formData, facility: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(facility => (
                        <SelectItem key={facility.id} value={facility.id.toString()}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLY_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={value => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLY_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingSupply ? 'Update' : 'Add'} Supply
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adequate Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supplies.filter(item => item.status === "in_stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {supplies.filter(item => item.status === "low_stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(supplies.map(item => item.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Supplies Inventory</CardTitle>
          <CardDescription>Current stock levels and status of medical supplies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.map((supply) => (
                <TableRow key={supply.id}>
                  <TableCell className="font-medium">{supply.item_name}</TableCell>
                  <TableCell>{supply.category}</TableCell>
                  <TableCell>{supply.quantity}</TableCell>
                  <TableCell>{supply.unit}</TableCell>
                  <TableCell>
                    <Badge variant={supply.status === "in_stock" ? "default" : "destructive"}>
                      {STATUS_LABELS[supply.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(supply)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(supply.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-right text-sm text-muted-foreground mt-4">
        Last Updated: {supplies.length > 0 ? formatDateTime(supplies[0].last_updated) : 'Never'}
      </div>
    </div>
  )
}