'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Supply = {
  id: number
  item_name: string
  quantity: number
  unit: string
  facility: number
  category: string
  status: string
  is_medical: boolean
  last_updated: string
}

const STATUS_LABELS: Record<string, string> = {
  "in_stock": "Adequate Supply",
  "out_of_stock": "Out of Stock",
  "low_stock": "Low Supply"
}

export function MedicalSupplyOverview() {
  const [supplies, setSupplies] = useState<Supply[]>([])

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/supplies/?is_medical=true`)
        if (response.ok) {
          const data = await response.json()
          setSupplies(data)
        }
      } catch (error) {
        console.error('Error fetching medical supplies:', error)
      }
    }

    fetchSupplies()
    const interval = setInterval(fetchSupplies, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Supply Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supplies.map((supply) => (
              <TableRow key={supply.id}>
                <TableCell className="font-medium">{supply.item_name}</TableCell>
                <TableCell>{supply.quantity} {supply.unit}</TableCell>
                <TableCell>
                  <Badge variant={supply.status === "in_stock" ? "default" : "destructive"}>
                    {STATUS_LABELS[supply.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}