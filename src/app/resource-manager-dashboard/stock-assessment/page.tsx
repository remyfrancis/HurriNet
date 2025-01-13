'use client'

import { useState } from 'react'
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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// Sample data
const stockItems = [
  { id: 1, name: "Water Bottles", quantity: 5000, expiration_date: "2024-12-31", distribution_center: "Central Warehouse", status: "Adequate" },
  { id: 2, name: "First Aid Kits", quantity: 500, expiration_date: "2023-12-31", distribution_center: "North Emergency Center", status: "Low" },
  { id: 3, name: "Blankets", quantity: 1000, expiration_date: "2025-12-31", distribution_center: "South Storage Facility", status: "Adequate" },
  { id: 4, name: "Canned Food", quantity: 10000, expiration_date: "2024-06-30", distribution_center: "West Distribution Center", status: "Excess" },
  { id: 5, name: "Flashlights", quantity: 2000, expiration_date: "2026-12-31", distribution_center: "East Supply Depot", status: "Adequate" },
]

const distributionCenters = [
  "All Centers",
  "Central Warehouse",
  "North Emergency Center",
  "South Storage Facility",
  "West Distribution Center",
  "East Supply Depot",
]

export default function StockAssessment() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCenter, setSelectedCenter] = useState('All Centers')
  const [items, setItems] = useState(stockItems)

  const filteredItems = items.filter(item =>
    (selectedCenter === 'All Centers' || item.distribution_center === selectedCenter) &&
    Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const updateItemStatus = (id: number, newStatus: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'adequate':
        return 'text-green-600'
      case 'low':
        return 'text-yellow-600'
      case 'excess':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Stock Assessment</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select center" />
            </SelectTrigger>
            <SelectContent>
              {distributionCenters.map((center) => (
                <SelectItem key={center} value={center}>
                  {center}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>Add New Item</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Distribution Center</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.expiration_date}</TableCell>
                <TableCell>{item.distribution_center}</TableCell>
                <TableCell className={getStatusColor(item.status)}>{item.status}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Update</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Item Status</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input id="name" value={item.name} className="col-span-3" readOnly />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="text-right">
                            Status
                          </Label>
                          <Select 
                            onValueChange={(value) => updateItemStatus(item.id, value)}
                            defaultValue={item.status}
                          >
                            <SelectTrigger className="w-[180px] col-span-3">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Adequate">Adequate</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                              <SelectItem value="Excess">Excess</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Quick Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg flex items-center">
            <CheckCircle2 className="text-green-600 mr-2" />
            <span>Items with Adequate Stock: {items.filter(item => item.status === 'Adequate').length}</span>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg flex items-center">
            <AlertCircle className="text-yellow-600 mr-2" />
            <span>Items with Low Stock: {items.filter(item => item.status === 'Low').length}</span>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg flex items-center">
            <AlertCircle className="text-blue-600 mr-2" />
            <span>Items with Excess Stock: {items.filter(item => item.status === 'Excess').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

