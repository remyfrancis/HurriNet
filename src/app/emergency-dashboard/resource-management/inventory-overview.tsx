'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AddResourceDialog } from '@/components/Resources/AddResourceDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function InventoryOverview() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchInventory() {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource-management/inventory/`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch inventory')
      }

      const data = await response.json()
      setInventory(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/auth/login'
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Inventory Overview</CardTitle>
        <AddResourceDialog onResourceAdded={fetchInventory} />
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No inventory items found.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add items to start tracking your inventory.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={(item.quantity / item.capacity) * 100} className="w-[60px]" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round((item.quantity / item.capacity) * 100)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

