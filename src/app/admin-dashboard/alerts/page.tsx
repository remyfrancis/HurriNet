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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Bell, Filter, MoreVertical, Plus, Trash } from 'lucide-react'
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
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([])
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<Alert | null>(null)
  const [bulkActionOpen, setBulkActionOpen] = useState(false)

  useEffect(() => {
    fetchAlerts()
  }, [router])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth/login')
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

  const handleEdit = async (alert: Alert) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${alert.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: alert.title,
          type: alert.type,
          severity: alert.severity,
          district: alert.district,
          active: alert.active,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update alert')
      }

      await fetchAlerts()
      setEditingAlert(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert')
    }
  }

  const handleDelete = async (alert: Alert) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${alert.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': token!,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete alert')
      }

      await fetchAlerts()
      setDeleteConfirmOpen(false)
      setAlertToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete alert')
    }
  }

  const handleBulkAction = async (action: 'deactivate' | 'delete') => {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (action === 'deactivate') {
        await Promise.all(
          selectedAlerts.map(id =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${id}/`, {
              method: 'PATCH',
              headers: {
                'Authorization': token!,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ active: false }),
            })
          )
        )
      } else if (action === 'delete') {
        await Promise.all(
          selectedAlerts.map(id =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${id}/`, {
              method: 'DELETE',
              headers: {
                'Authorization': token!,
              },
            })
          )
        )
      }

      await fetchAlerts()
      setSelectedAlerts([])
      setBulkActionOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action')
    }
  }

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
          <div className="flex items-center gap-4">
            {selectedAlerts.length > 0 && (
              <Button variant="outline" onClick={() => setBulkActionOpen(true)}>
                Bulk Actions ({selectedAlerts.length})
              </Button>
            )}
            <Button onClick={() => router.push('/admin-dashboard/alerts/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </div>
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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAlerts.length === filteredAlerts.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAlerts(filteredAlerts.map(a => a.id))
                          } else {
                            setSelectedAlerts([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedAlerts.includes(alert.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAlerts([...selectedAlerts, alert.id])
                            } else {
                              setSelectedAlerts(selectedAlerts.filter(id => id !== alert.id))
                            }
                          }}
                        />
                      </TableCell>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingAlert(alert)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setAlertToDelete(alert)
                                setDeleteConfirmOpen(true)
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Alert Dialog */}
      <Dialog open={editingAlert !== null} onOpenChange={() => setEditingAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert</DialogTitle>
          </DialogHeader>
          {editingAlert && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingAlert.title}
                  onChange={(e) =>
                    setEditingAlert({ ...editingAlert, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={editingAlert.type}
                  onChange={(e) =>
                    setEditingAlert({ ...editingAlert, type: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={editingAlert.severity}
                  onValueChange={(value) =>
                    setEditingAlert({ ...editingAlert, severity: value as 'High' | 'Medium' | 'Low' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={editingAlert.district}
                  onValueChange={(value) =>
                    setEditingAlert({ ...editingAlert, district: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Districts</SelectItem>
                    <SelectItem value="Castries">Castries</SelectItem>
                    <SelectItem value="Gros Islet">Gros Islet</SelectItem>
                    <SelectItem value="Vieux Fort">Vieux Fort</SelectItem>
                    <SelectItem value="Soufriere">Soufriere</SelectItem>
                    <SelectItem value="Micoud">Micoud</SelectItem>
                    <SelectItem value="Dennery">Dennery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={editingAlert.active}
                  onCheckedChange={(checked) =>
                    setEditingAlert({ ...editingAlert, active: checked as boolean })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAlert(null)}>
              Cancel
            </Button>
            <Button onClick={() => editingAlert && handleEdit(editingAlert)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => alertToDelete && handleDelete(alertToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionOpen} onOpenChange={setBulkActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Choose an action to apply to {selectedAlerts.length} selected alerts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate Selected Alerts
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={() => handleBulkAction('delete')}
            >
              Delete Selected Alerts
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 