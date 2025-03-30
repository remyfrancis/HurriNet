"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"

type Resource = {
  id: number
  name: string
  resource_type: string
  resource_type_display: string
  description: string
  status: string
  status_display: string
  capacity: number
  current_count: number
  current_workload: number
  address: string
  location: {
    type: string
    coordinates: [number, number]
  }
}

type ResourcesListProps = {
  compact?: boolean
}

export default function ResourcesList({ compact = false }: ResourcesListProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResources() {
      try {
        setLoading(true)
        const token = localStorage.getItem('accessToken')
        const response = await fetch('/api/resource-management/resources', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }

        const data = await response.json()
        // Convert GeoJSON features to resource objects
        const resourcesList = data.features.map((feature: any) => ({
          id: feature.id,
          ...feature.properties,
          location: feature.geometry
        }))
        setResources(resourcesList)
        setError(null)
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError('Failed to load resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter ? resource.resource_type === filter : true
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-500"
      case "LIMITED":
        return "bg-yellow-500"
      case "UNAVAILABLE":
        return "bg-red-500"
      case "ASSIGNED":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getUtilizationPercentage = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0
  }

  const getUtilizationStatus = (current: number, capacity: number) => {
    const percentage = getUtilizationPercentage(current, capacity)
    if (percentage <= 40) return { 
      label: "Low", 
      color: "bg-red-500",
      textColor: "text-red-700",
      progressColor: "bg-red-500",
      badgeColor: "border-red-200 bg-red-100 text-red-700" 
    }
    if (percentage <= 70) return { 
      label: "Moderate", 
      color: "bg-yellow-500",
      textColor: "text-yellow-700",
      progressColor: "bg-yellow-500",
      badgeColor: "border-yellow-200 bg-yellow-100 text-yellow-700"
    }
    return { 
      label: "High", 
      color: "bg-green-500",
      textColor: "text-green-700",
      progressColor: "bg-green-500",
      badgeColor: "border-green-200 bg-green-100 text-green-700"
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
          <CardTitle>Resources</CardTitle>
          <CardDescription>Current resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.slice(0, 5).map((resource) => {
              const utilization = getUtilizationStatus(resource.current_count, resource.capacity)
              return (
                <div key={resource.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{resource.name}</p>
                    <Badge className={utilization.badgeColor}>
                      {utilization.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {resource.current_count}/{resource.capacity}
                    </span>
                    <span className={utilization.textColor}>{getUtilizationPercentage(resource.current_count, resource.capacity)}%</span>
                  </div>
                  <Progress 
                    value={getUtilizationPercentage(resource.current_count, resource.capacity)} 
                    className={`[&>div]:${utilization.progressColor}`}
                  />
                </div>
              )
            })}
            <Button variant="outline" className="w-full">
              View All Resources
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resources Management</CardTitle>
        <CardDescription>View and manage all resources in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
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
            <Button
              variant={filter === "SHELTER" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("SHELTER")}
            >
              Shelter
            </Button>
            <Button
              variant={filter === "SUPPLIES" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("SUPPLIES")}
            >
              Supplies
            </Button>
            <Button variant={filter === "WATER" ? "default" : "outline"} size="sm" onClick={() => setFilter("WATER")}>
              Water
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
                <TableHead>Location</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => {
                const utilization = getUtilizationStatus(resource.current_count, resource.capacity)
                return (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.resource_type_display}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${utilization.color} mr-2`}></div>
                        <span className={utilization.textColor}>{utilization.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={resource.address}>
                      {resource.address}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {resource.current_count}/{resource.capacity}
                          </span>
                          <span className={utilization.textColor}>{getUtilizationPercentage(resource.current_count, resource.capacity)}%</span>
                        </div>
                        <Progress 
                          value={getUtilizationPercentage(resource.current_count, resource.capacity)} 
                          className={`[&>div]:${utilization.progressColor}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

