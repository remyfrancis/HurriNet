'use client'

import { useState } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, MapPin, Users } from 'lucide-react'

// Mock data for demonstration
const mockRequests = [
  { id: 1, resourceType: 'Water', quantity: 1000, location: 'Castries', urgency: 'High', status: 'Pending' },
  { id: 2, resourceType: 'Food', quantity: 500, location: 'Vieux Fort', urgency: 'Medium', status: 'Pending' },
  { id: 3, resourceType: 'Medical Supplies', quantity: 200, location: 'Soufriere', urgency: 'Critical', status: 'Pending' },
  { id: 4, resourceType: 'Shelter Kits', quantity: 50, location: 'Gros Islet', urgency: 'Low', status: 'Pending' },
]

const mockRoutes = [
  { id: 1, name: 'North Route', stops: ['Gros Islet', 'Castries'], status: 'Planned' },
  { id: 2, name: 'South Route', stops: ['Vieux Fort', 'Soufriere'], status: 'In Progress' },
]

const mockTeams = [
  { id: 1, name: 'Team Alpha', members: 3, status: 'Available' },
  { id: 2, name: 'Team Beta', members: 4, status: 'On Delivery' },
  { id: 3, name: 'Team Gamma', members: 3, status: 'Available' },
]

type RouteStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled'

export default function DistributionManagement() {
  const [requests, setRequests] = useState(mockRequests)
  const [routes, setRoutes] = useState(mockRoutes)
  const [teams, setTeams] = useState(mockTeams)
  const [newRoute, setNewRoute] = useState({
    name: '',
    stops: '',
    status: 'Planned' as RouteStatus
  })

  const prioritizeRequest = (id: number, direction: 'up' | 'down') => {
    const newRequests = [...requests]
    const index = newRequests.findIndex(req => req.id === id)
    if (direction === 'up' && index > 0) {
      [newRequests[index - 1], newRequests[index]] = [newRequests[index], newRequests[index - 1]]
    } else if (direction === 'down' && index < newRequests.length - 1) {
      [newRequests[index], newRequests[index + 1]] = [newRequests[index + 1], newRequests[index]]
    }
    setRequests(newRequests)
  }

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

  const assignTeam = (routeId: number, teamId: number) => {
    setRoutes(routes.map(route => 
      route.id === routeId ? { ...route, status: 'Assigned' } : route
    ))
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, status: 'Assigned' } : team
    ))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Distribution Management</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Prioritize Requests</CardTitle>
          <CardDescription>Manage and prioritize incoming resource requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request, index) => (
                <TableRow key={request.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{request.resourceType}</TableCell>
                  <TableCell>{request.quantity}</TableCell>
                  <TableCell>{request.location}</TableCell>
                  <TableCell>
                    <Badge variant={request.urgency === 'Critical' ? 'destructive' : 
                                    request.urgency === 'High' ? 'default' : 
                                    request.urgency === 'Medium' ? 'secondary' : 'outline'}>
                      {request.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.status}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" onClick={() => prioritizeRequest(request.id, 'up')} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => prioritizeRequest(request.id, 'down')} disabled={index === requests.length - 1}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <TableCell>{route.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Transport Teams</CardTitle>
            <CardDescription>Manage transport teams and assign them to routes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assign to Route</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.members}</TableCell>
                    <TableCell>{team.status}</TableCell>
                    <TableCell>
                      <Select onValueChange={(value) => assignTeam(parseInt(value), team.id)} disabled={team.status !== 'Available'}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a route" />
                        </SelectTrigger>
                        <SelectContent>
                          {routes.filter(route => route.status === 'Planned').map((route) => (
                            <SelectItem key={route.id} value={route.id.toString()}>{route.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
