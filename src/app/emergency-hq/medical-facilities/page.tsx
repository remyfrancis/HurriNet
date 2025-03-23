'use client'

import { useState, useEffect } from 'react'
import { EmergencyHQNav } from '@/components/HQDashboard/EmergencyHQNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

interface Facility {
  id: number
  name: string
  status: string
  status_display: string
  current_occupancy: number
  total_capacity: number
  facility_type: string
  facility_type_display: string
  has_power: boolean
  has_water: boolean
  has_oxygen: boolean
  has_ventilators: boolean
  address: string
  phone_number: string
  primary_contact: string
  email?: string
}

interface StatusReport {
  id: number
  title: string
  description: string
  priority: string
  priority_display: string
  facilities: number[]
  facilities_details: Facility[]
  timestamp: string
  acknowledged: boolean
  reporter_name: string
  acknowledged_by_name?: string
}

export default function MedicalFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [reports, setReports] = useState<StatusReport[]>([])
  const [selectedFacilities, setSelectedFacilities] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
  })
  
  const { token, user } = useAuth()
  const { toast } = useToast()

  // Add console logging for debugging auth
  console.log('Current User:', {
    name: user?.first_name ? `${user.first_name} ${user.last_name}` : 'Not available',
    email: user?.email || 'Not available',
    role: user?.role || 'Not available',
    isAuthenticated: !!token
  })

  useEffect(() => {
    fetchFacilities()
    fetchReports()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/facilities/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFacilities(data)
      }
    } catch (error) {
      console.error('Error fetching facilities:', error)
    }
  }

  const fetchReports = async () => {
    try {
      console.log('Fetching reports with token:', token ? 'Token exists' : 'No token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/status-reports/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('Reports API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched reports:', data)
        setReports(data)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFacilities.length) {
      toast({
        title: 'Error',
        description: 'Please select at least one facility',
        variant: 'destructive'
      })
      return
    }

    try {
      // Check if backend URL is properly set
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        console.error('NEXT_PUBLIC_BACKEND_URL is not set')
        throw new Error('Backend URL configuration is missing')
      }

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/status-reports/`
      const payload = {
        ...formData,
        facilities: selectedFacilities
      }
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
      console.log('Full request URL:', url)
      console.log('Request payload:', payload)
      console.log('Using token:', token ? 'Token exists' : 'No token')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Status report submitted successfully'
        })
        setIsDialogOpen(false)
        setFormData({ title: '', description: '', priority: 'MEDIUM' })
        setSelectedFacilities([])
        fetchReports()
      } else {
        throw new Error(responseData.detail || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit status report',
        variant: 'destructive'
      })
    }
  }

  const handleAcknowledge = async (reportId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/medical/status-reports/${reportId}/acknowledge/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Report acknowledged successfully'
        })
        fetchReports()
      }
    } catch (error) {
      console.error('Error acknowledging report:', error)
      toast({
        title: 'Error',
        description: 'Failed to acknowledge report',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-500'
      case 'LIMITED':
        return 'bg-yellow-500'
      case 'CRITICAL':
        return 'bg-orange-500'
      case 'OFFLINE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="flex min-h-screen">
      <EmergencyHQNav />
      <div className="flex-1">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-semibold text-gray-800">Medical Facilities Status</h1>
              {user?.role === 'EMERGENCY_PERSONNEL' && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Submit Status Report</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Facility Status Report</DialogTitle>
                      <DialogDescription>
                        Report the current status of one or more medical facilities.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Report Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                      <Textarea
                        placeholder="Detailed Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low Priority</SelectItem>
                          <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                          <SelectItem value="HIGH">High Priority</SelectItem>
                          <SelectItem value="CRITICAL">Critical Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="space-y-2">
                        <h4 className="font-medium">Select Facilities</h4>
                        {facilities.map((facility) => (
                          <div key={facility.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedFacilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedFacilities([...selectedFacilities, facility.id])
                                } else {
                                  setSelectedFacilities(selectedFacilities.filter(id => id !== facility.id))
                                }
                              }}
                            />
                            <label>{facility.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleSubmit}>Submit Report</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Overview Cards */}
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
                  <CardTitle className="text-sm font-medium">Operational Facilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {facilities.filter(f => f.status === 'OPERATIONAL').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {facilities.reduce((sum, f) => sum + f.total_capacity, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {facilities.reduce((sum, f) => sum + f.current_occupancy, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{facility.name}</CardTitle>
                        <p className="text-sm text-gray-500">{facility.facility_type_display}</p>
                      </div>
                      <Badge className={getStatusColor(facility.status)}>
                        {facility.status_display}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Capacity Information */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Occupancy</span>
                        <span className="text-sm">
                          {facility.current_occupancy} / {facility.total_capacity} beds
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${(facility.current_occupancy / facility.total_capacity) * 100}%` }}
                        ></div>
                      </div>

                      {/* Resource Status */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`flex items-center space-x-2 ${facility.has_power ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${facility.has_power ? 'bg-green-600' : 'bg-red-600'}`} />
                          <span className="text-sm">Power</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${facility.has_water ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${facility.has_water ? 'bg-green-600' : 'bg-red-600'}`} />
                          <span className="text-sm">Water</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${facility.has_oxygen ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${facility.has_oxygen ? 'bg-green-600' : 'bg-red-600'}`} />
                          <span className="text-sm">Oxygen</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${facility.has_ventilators ? 'text-green-600' : 'text-red-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${facility.has_ventilators ? 'bg-green-600' : 'bg-red-600'}`} />
                          <span className="text-sm">Ventilators</span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>{facility.address}</p>
                        <p>Contact: {facility.primary_contact}</p>
                        <p>Phone: {facility.phone_number}</p>
                        {facility.email && <p>Email: {facility.email}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status Reports Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Status Reports</h2>
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{report.title}</CardTitle>
                        <p className="text-sm text-gray-500">
                          Reported by {report.reporter_name} • {new Date(report.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(report.priority)}>
                        {report.priority_display}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{report.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium">Affected Facilities:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.facilities_details.map((facility) => (
                          <div key={facility.id} className="p-2 bg-gray-50 rounded">
                            <p className="font-medium">{facility.name}</p>
                            <p className="text-sm text-gray-600">
                              Status: {facility.status_display} • 
                              Occupancy: {facility.current_occupancy}/{facility.total_capacity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {report.acknowledged ? (
                          <>
                            <CheckCircle2 className="text-green-500" />
                            <span className="text-sm text-gray-600">
                              Acknowledged by {report.acknowledged_by_name}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="text-yellow-500" />
                            <span className="text-sm text-gray-600">Pending acknowledgment</span>
                          </>
                        )}
                      </div>
                      {user?.role === 'EMERGENCY_PERSONNEL' && !report.acknowledged && (
                        <Button onClick={() => handleAcknowledge(report.id)}>
                          Acknowledge Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
