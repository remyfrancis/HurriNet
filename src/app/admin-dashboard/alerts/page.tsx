'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bell, Filter, Plus } from 'lucide-react'
import { AdminNav } from '../admin-nav'

interface Alert {
  id: string
  title: string
  type: string
  severity: 'High' | 'Medium' | 'Low'
  district: string
  active: boolean
  created_at: string
  updated_at: string
  created_by?: {
    email: string
    role: string
  }
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterDistrict, setFilterDistrict] = useState<string>('all')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
          headers: {
            Authorization: token,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch alerts')
        }

        const data = await response.json()
        setAlerts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alerts')
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [router])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500'
      case 'Medium':
        return 'bg-yellow-500'
      case 'Low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchesDistrict = filterDistrict === 'all' || alert.district === filterDistrict
    return matchesSeverity && matchesDistrict
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav className="w-64 border-r bg-background hidden md:block" />
      
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Alerts Management</h1>
          <Button onClick={() => router.push('/admin-dashboard/alerts/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Alert
          </Button>
        </div>

        <div className="space-y-4">
          {/* Alert Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(alert => alert.active).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(alert => alert.severity === 'High').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter by:</span>
                </div>
                <Select
                  value={filterSeverity}
                  onValueChange={setFilterSeverity}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterDistrict}
                  onValueChange={setFilterDistrict}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Castries">Castries</SelectItem>
                    <SelectItem value="Gros Islet">Gros Islet</SelectItem>
                    <SelectItem value="Vieux Fort">Vieux Fort</SelectItem>
                    <SelectItem value="Soufriere">Soufriere</SelectItem>
                    <SelectItem value="Micoud">Micoud</SelectItem>
                    <SelectItem value="Dennery">Dennery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>
                        <Badge className={`${getSeverityColor(alert.severity)} text-white border-0`}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.district}</TableCell>
                      <TableCell>
                        <Badge variant={alert.active ? "default" : "secondary"}>
                          {alert.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.created_by ? (
                          <div className="text-sm">
                            <div>{alert.created_by.email}</div>
                            <div className="text-muted-foreground">{alert.created_by.role}</div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(alert.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 