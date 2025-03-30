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
  resource_type: "SHELTER" | "MEDICAL" | "SUPPLIES" | "WATER"
  status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE" | "ASSIGNED"
  capacity: number
  currentCount: number
  location: {
    lat: number
    lng: number
  }
}

type ResourcesListProps = {
  compact?: boolean
}

export default function ResourcesList({ compact = false }: ResourcesListProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, fetch this data from your API
    const mockResources: Resource[] = [
      {
        id: 1,
        name: "Central Medical Facility",
        resource_type: "MEDICAL",
        status: "AVAILABLE",
        capacity: 1000,
        currentCount: 750,
        location: { lat: 34.0522, lng: -118.2437 },
      },
      {
        id: 2,
        name: "North Food Bank",
        resource_type: "SUPPLIES",
        status: "LIMITED",
        capacity: 500,
        currentCount: 450,
        location: { lat: 34.1522, lng: -118.1437 },
      },
      {
        id: 3,
        name: "East Shelter",
        resource_type: "SHELTER",
        status: "AVAILABLE",
        capacity: 200,
        currentCount: 120,
        location: { lat: 34.0622, lng: -118.1437 },
      },
      {
        id: 4,
        name: "South Water Station",
        resource_type: "WATER",
        status: "UNAVAILABLE",
        capacity: 2000,
        currentCount: 1900,
        location: { lat: 33.9522, lng: -118.2437 },
      },
      {
        id: 5,
        name: "West Medical Outpost",
        resource_type: "MEDICAL",
        status: "ASSIGNED",
        capacity: 300,
        currentCount: 150,
        location: { lat: 34.0522, lng: -118.3437 },
      },
    ]

    setResources(mockResources)
  }, [])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter ? resource.resource_type === filter : true
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
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
    return Math.round((current / capacity) * 100)
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
            {resources.slice(0, 5).map((resource) => (
              <div key={resource.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{resource.name}</p>
                  <Badge variant={resource.status === "AVAILABLE" ? "outline" : "secondary"}>{resource.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {resource.currentCount}/{resource.capacity}
                  </span>
                  <span>{getUtilizationPercentage(resource.currentCount, resource.capacity)}%</span>
                </div>
                <Progress value={getUtilizationPercentage(resource.currentCount, resource.capacity)} />
              </div>
            ))}
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
                <TableHead>Utilization</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>{resource.resource_type}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(resource.status)} mr-2`}></div>
                      {resource.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {resource.currentCount}/{resource.capacity}
                        </span>
                        <span>{getUtilizationPercentage(resource.currentCount, resource.capacity)}%</span>
                      </div>
                      <Progress value={getUtilizationPercentage(resource.currentCount, resource.capacity)} />
                    </div>
                  </TableCell>
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

