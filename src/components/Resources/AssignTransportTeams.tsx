'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Truck, Plus, Edit, Trash2, UserPlus } from 'lucide-react'

type Team = {
  id: number
  team_name: string
  members: string[]
  vehicle_type: string
  transport_route: string
  status: string
}

export default function AssignTransportTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState({
    team_name: '',
    vehicle_type: '',
    members: [] as string[]
  })

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transport-teams/`)
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource/transport-teams/${editingTeam ? `${editingTeam.id}/` : ''}`
      const method = editingTeam ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsTeamDialogOpen(false)
        setEditingTeam(null)
        setFormData({ team_name: '', vehicle_type: '', members: [] })
        fetchTeams()
      }
    } catch (error) {
      console.error('Error saving team:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/resource/transport-teams/${id}/`, {
          method: 'DELETE'
        })
        fetchTeams()
      } catch (error) {
        console.error('Error deleting team:', error)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transport Teams</CardTitle>
          <CardDescription>Manage and assign transport teams</CardDescription>
        </div>
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTeam(null)
              setFormData({ team_name: '', vehicle_type: '', members: [] })
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit' : 'Add'} Transport Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team_name">Team Name</Label>
                <Input
                  id="team_name"
                  value={formData.team_name}
                  onChange={e => setFormData({...formData, team_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle Type</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={value => setFormData({...formData, vehicle_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingTeam ? 'Update' : 'Add'} Team
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.team_name}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {team.members.length}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Truck className="mr-2 h-4 w-4" />
                    {team.vehicle_type}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={team.status === 'Available' ? 'success' : 'secondary'}>
                    {team.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingTeam(team)
                      setFormData({
                        team_name: team.team_name,
                        vehicle_type: team.vehicle_type,
                        members: team.members
                      })
                      setIsTeamDialogOpen(true)
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(team.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingTeam(team)
                      setIsMemberDialogOpen(true)
                    }}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}