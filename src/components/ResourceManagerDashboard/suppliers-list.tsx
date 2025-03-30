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
  supplier_type: string
  supplier_type_display: string
  status: string
  status_display: string
  email: string
  phone: string
  address: string
  description: string
  contact_name: string
  website: string
  notes: string
  created_at: string
  updated_at: string
}

type SupplierListProps = {
  compact?: boolean
}

export default function SuppliersList({ compact = false }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        const response = await fetch('/api/resource-management/suppliers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch suppliers')
        }

        const data = await response.json()
        // Convert GeoJSON features to supplier objects
        const suppliersList = data.features.map((feature: any) => ({
          id: feature.id,
          ...feature.properties
        }))
        setSuppliers(suppliersList)
        setError(null)
      } catch (err) {
        console.error('Error fetching suppliers:', err)
        setError('Failed to load suppliers')
      } finally {
        setLoading(false)
      }
    }

    fetchSuppliers()
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter ? supplier.supplier_type === filter : true
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500 text-center">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
          <CardDescription>Active suppliers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suppliers
              .filter((s) => s.status.toUpperCase() === "ACTIVE")
              .slice(0, 5)
              .map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{supplier.supplier_type_display}</p>
                  </div>
                  <Badge variant="outline">{supplier.status_display}</Badge>
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
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.supplier_type_display}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(supplier.status)} mr-2`}></div>
                      {supplier.status_display}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.email}</div>
                      <div className="text-muted-foreground">{supplier.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={supplier.address}>
                    {supplier.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
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

