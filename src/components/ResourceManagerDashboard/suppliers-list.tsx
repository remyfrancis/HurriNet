"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

type Supplier = {
  id: number
  name: string
  supplier_type: "MEDICAL" | "FOOD" | "SHELTER" | "EQUIPMENT" | "OTHER"
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  email: string
  phone: string
  address: string
  location: {
    lat: number
    lng: number
  }
  inventoryCount: number
}

type SupplierListProps = {
  compact?: boolean
}

export default function SuppliersList({ compact = false }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, fetch this data from your API
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: "MedSupply Co.",
        supplier_type: "MEDICAL",
        status: "ACTIVE",
        email: "contact@medsupply.com",
        phone: "555-123-4567",
        address: "123 Health St, Medical District",
        location: { lat: 34.0522, lng: -118.2437 },
        inventoryCount: 42,
      },
      {
        id: 2,
        name: "FoodWorks Inc.",
        supplier_type: "FOOD",
        status: "ACTIVE",
        email: "orders@foodworks.com",
        phone: "555-987-6543",
        address: "456 Nutrition Ave, Food District",
        location: { lat: 34.0522, lng: -118.2437 },
        inventoryCount: 78,
      },
      {
        id: 3,
        name: "ShelterTech",
        supplier_type: "SHELTER",
        status: "ACTIVE",
        email: "info@sheltertech.com",
        phone: "555-456-7890",
        address: "789 Housing Blvd, Shelter Zone",
        location: { lat: 34.0522, lng: -118.2437 },
        inventoryCount: 23,
      },
      {
        id: 4,
        name: "EquipmentPro",
        supplier_type: "EQUIPMENT",
        status: "INACTIVE",
        email: "sales@equipmentpro.com",
        phone: "555-789-0123",
        address: "101 Tool St, Equipment Park",
        location: { lat: 34.0522, lng: -118.2437 },
        inventoryCount: 56,
      },
      {
        id: 5,
        name: "GeneralSupplies",
        supplier_type: "OTHER",
        status: "PENDING",
        email: "info@generalsupplies.com",
        phone: "555-321-6547",
        address: "202 Supply Rd, General Area",
        location: { lat: 34.0522, lng: -118.2437 },
        inventoryCount: 31,
      },
    ]

    setSuppliers(mockSuppliers)
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter ? supplier.supplier_type === filter : true
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "INACTIVE":
        return "bg-red-500"
      case "PENDING":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>Active suppliers and their inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers
              .filter((s) => s.status === "ACTIVE")
              .slice(0, 5)
              .map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{supplier.supplier_type}</p>
                  </div>
                  <Badge variant="outline">{supplier.inventoryCount} items</Badge>
                </div>
              ))}
            <Button variant="outline" className="w-full">
              View All Suppliers
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suppliers Management</CardTitle>
        <CardDescription>View and manage all suppliers in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant={filter === null ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>
              All
            </Button>
            <Button
              variant={filter === "MEDICAL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("MEDICAL")}
            >
              Medical
            </Button>
            <Button variant={filter === "FOOD" ? "default" : "outline"} size="sm" onClick={() => setFilter("FOOD")}>
              Food
            </Button>
            <Button
              variant={filter === "SHELTER" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("SHELTER")}
            >
              Shelter
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.supplier_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(supplier.status)} mr-2`}></div>
                      {supplier.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.email}</div>
                      <div className="text-muted-foreground">{supplier.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{supplier.inventoryCount} items</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Inventory
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

