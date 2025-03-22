'use client'

import { useState } from 'react'
import { ResourceLocator } from '@/components/ResourceLocator'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function ResourceLocatorPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resource Locator</h1>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SHELTER">Shelter</SelectItem>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies</SelectItem>
                  <SelectItem value="WATER">Water</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="LIMITED">Limited</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500">Shelter</Badge>
              <span className="text-sm text-gray-600">Emergency Shelters</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500">Medical</Badge>
              <span className="text-sm text-gray-600">Medical Facilities</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-yellow-500">Supplies</Badge>
              <span className="text-sm text-gray-600">Supply Centers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-cyan-500">Water</Badge>
              <span className="text-sm text-gray-600">Water Distribution</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <ResourceLocator className="border rounded-lg shadow-sm" />
    </div>
  )
} 