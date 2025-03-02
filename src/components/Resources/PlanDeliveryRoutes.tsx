'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin } from 'lucide-react'

type Route = {
  id: number
  name: string
  stops: string[]
  status: RouteStatus
}

type RouteStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled'

export default function PlanDeliveryRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [newRoute, setNewRoute] = useState({
    name: '',
    stops: '',
    status: 'Planned' as RouteStatus
  })

  const addRoute = () => {
    if (newRoute.name && newRoute.stops) {
      setRoutes([...routes, { 
        id: routes.length + 1, 
        name: newRoute.name, 
        stops: newRoute.stops.split(',').map(stop => stop.trim()), 
        status: newRoute.status 
      }])
      setNewRoute({ name: '', stops: '', status: 'Planned' })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Delivery Routes</CardTitle>
        <CardDescription>Create and manage delivery routes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="routeName">Route Name</Label>
            <Input 
              type="text" 
              id="routeName" 
              value={newRoute.name} 
              onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
              placeholder="e.g., North Coast Route" 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="routeStops">Stops (comma-separated)</Label>
            <Input 
              type="text" 
              id="routeStops" 
              value={newRoute.stops} 
              onChange={(e) => setNewRoute({...newRoute, stops: e.target.value})}
              placeholder="e.g., Castries, Gros Islet, Rodney Bay" 
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="routeStatus">Status</Label>
            <Select 
              value={newRoute.status}
              onValueChange={(value: RouteStatus) => setNewRoute({...newRoute, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planned">Planned</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            className="mt-auto" 
            onClick={addRoute}
            disabled={!newRoute.name || !newRoute.stops}
          >
            Add Route
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Stops</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.name}</TableCell>
                <TableCell>{route.stops.join(', ')}</TableCell>
                <TableCell>
                  <Badge variant={
                    route.status === 'Completed' ? 'success' :
                    route.status === 'In Progress' ? 'warning' :
                    route.status === 'Cancelled' ? 'destructive' :
                    'default'
                  }>
                    {route.status}
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