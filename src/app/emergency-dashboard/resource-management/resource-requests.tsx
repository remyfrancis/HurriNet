'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddRequestDialog } from '@/components/Resources/AddRequestDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ResourceRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchRequests() {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource-management/requests/`, {
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
        throw new Error(errorData.detail || 'Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Resource Requests</CardTitle>
        <AddRequestDialog onRequestAdded={fetchRequests} />
      </CardHeader>
      <CardContent>
        {/* ... rest of your existing table code ... */}
      </CardContent>
    </Card>
  )
}

