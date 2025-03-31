'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toggleAlert, deleteAlert } from './actions'
import { useToast } from "@/hooks/use-toast"

type Alert = {
  id: number
  title: string
  type: string
  severity: string
  district: string
  active: boolean
}

interface AlertListProps {
  onCreateAlert: (alert: any) => void
}

export default function AlertList({ onCreateAlert }: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in to view alerts",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    const result = await toggleAlert(id, !currentActive, token)
    if (result.success) {
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, active: !currentActive } : alert
      ))
      toast({
        title: "Success",
        description: `Alert ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update alert status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    const result = await deleteAlert(id, token)
    if (result.success) {
      setAlerts(alerts.filter(alert => alert.id !== id))
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete alert",
        variant: "destructive",
      })
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>District</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>{alert.title}</TableCell>
            <TableCell>{alert.type}</TableCell>
            <TableCell>
              <Badge variant={
                alert.severity === 'High' ? "destructive" :
                alert.severity === 'Medium' ? "warning" :
                "secondary"
              }>
                {alert.severity}
              </Badge>
            </TableCell>
            <TableCell>{alert.district}</TableCell>
            <TableCell>
              <Badge variant={alert.active ? "success" : "secondary"}>
                {alert.active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button 
                variant={alert.active ? "destructive" : "default"}
                size="sm" 
                onClick={() => handleToggleStatus(alert.id, alert.active)}
                className="mr-2"
              >
                {alert.active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="outline" size="sm" className="mr-2">
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the alert.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(alert.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

