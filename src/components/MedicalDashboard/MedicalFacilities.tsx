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

type Facility = {
  id: number
  name: string
  location: string
  facility_type: string
  capacity: number
  current_occupancy: number
  status: string
  last_updated: string
}

const FACILITY_TYPES = [
  'general_hospital',
  'private_hospital',
  'community_hospital',
  'clinic',
  'mobile_unit'
]

const FACILITY_TYPE_LABELS: Record<string, string> = {
  'general_hospital': 'General Hospital',
  'private_hospital': 'Private Hospital',
  'community_hospital': 'Community Hospital',
  'clinic': 'Clinic',
  'mobile_unit': 'Mobile Unit'
}

const FACILITY_STATUS_LABELS: Record<string, string> = {
  'operational': 'Operational',
  'closed': 'Closed',
  'under_maintenance': 'Under Maintenance',
  'emergency_only': 'Emergency Only'
}

const FACILITY_STATUSES = [
  'operational',
  'closed',
  'under_maintenance',
  'emergency_only'
]

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return 'Never'
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export default function MedicalFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    location: '',
    facility_type: '',
    capacity: 0,
    current_occupancy: 0,
    status: 'Operational'
  })

  useEffect(() => {
    fetchFacilities()
  }, [])

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
      const payload = {
        name: formData.name || '',
        facility_type: formData.facility_type || 'general_hospital',
        location: formData.location || '',
        capacity: parseInt(formData.capacity?.toString() || '0'),
        current_occupancy: parseInt(formData.current_occupancy?.toString() || '0'),
        status: formData.status || 'operational'
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/facilities/${editingFacility ? `${editingFacility.id}/` : ''}`
      const method = editingFacility ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Server error:', errorData)
        throw new Error('Failed to save facility')
      }

      setIsDialogOpen(false)
      setEditingFacility(null)
      setFormData({})
      fetchFacilities()
    } catch (error) {
      console.error('Error saving facility:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this facility?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/facilities/${id}/`, {
          method: 'DELETE'
        })
        fetchFacilities()
      } catch (error) {
        console.error('Error deleting facility:', error)
      }
    }
  }

  const openEditDialog = (facility: Facility) => {
    setEditingFacility(facility)
    setFormData(facility)
    setIsDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Facilities</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingFacility(null)
              setFormData({})
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFacility ? 'Edit' : 'Add'} Facility</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location || ''}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.facility_type}
                    onValueChange={value => setFormData({...formData, facility_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACILITY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {FACILITY_TYPE_LABELS[type]}
                        </SelectItem>
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
                      {FACILITY_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {FACILITY_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupancy">Current Occupancy</Label>
                  <Input
                    id="occupancy"
                    type="number"
                    value={formData.current_occupancy || ''}
                    onChange={e => setFormData({...formData, current_occupancy: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingFacility ? 'Update' : 'Add'} Facility
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facilities.reduce((sum, facility) => sum + facility.capacity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facilities.reduce((sum, facility) => sum + facility.current_occupancy, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational Facilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {facilities.filter(facility => facility.status === "operational").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facilities Overview</CardTitle>
          <CardDescription>A list of all medical facilities and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.name}</TableCell>
                  <TableCell>{FACILITY_TYPE_LABELS[facility.facility_type]}</TableCell>
                  <TableCell>{facility.capacity}</TableCell>
                  <TableCell>{facility.current_occupancy}</TableCell>
                  <TableCell>
                    <Badge variant={facility.status === "operational" ? "success" : "destructive"}>
                      {FACILITY_STATUS_LABELS[facility.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(facility)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(facility.id)}>
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
        Last Updated: {facilities.length > 0 && facilities[0].last_updated ? 
          formatDateTime(facilities[0].last_updated) : 
          'Never'
        }
      </div>
    </div>
  )
}