'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
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
import { Label } from '@/components/ui/label'
import { Plus, Users } from 'lucide-react'

interface MedicalTeam {
  id: number
  name: string
  specialty: string
  leader: {
    id: number
    name: string
  }
  members: Array<{
    id: number
    name: string
    role: string
    status: string
  }>
  current_assignment?: string
  status: 'ACTIVE' | 'ON_CALL' | 'OFF_DUTY'
}

export function MedicalTeams() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [teams, setTeams] = useState<MedicalTeam[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'EMERGENCY',
    leader_id: '',
  })
  const [availablePersonnel, setAvailablePersonnel] = useState<Array<{ id: number, name: string }>>([])

  useEffect(() => {
    fetchTeams()
    fetchAvailablePersonnel()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/teams/medical/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTeams(data)
      }
    } catch (error) {
      console.error('Error fetching medical teams:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch medical teams',
        variant: 'destructive'
      })
    }
  }

  const fetchAvailablePersonnel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/teams/medical_personnel/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAvailablePersonnel(data)
      }
    } catch (error) {
      console.error('Error fetching available personnel:', error)
    }
  }

  const handleCreateTeam = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/teams/medical/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Medical team created successfully'
        })
        setIsCreateDialogOpen(false)
        setFormData({ name: '', specialty: 'EMERGENCY', leader_id: '' })
        fetchTeams()
      }
    } catch (error) {
      console.error('Error creating medical team:', error)
      toast({
        title: 'Error',
        description: 'Failed to create medical team',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'ON_CALL':
        return 'bg-yellow-500'
      case 'OFF_DUTY':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Medical Response Teams</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Medical Response Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMERGENCY">Emergency Medicine</SelectItem>
                    <SelectItem value="TRAUMA">Trauma Care</SelectItem>
                    <SelectItem value="GENERAL">General Medical</SelectItem>
                    <SelectItem value="SPECIALIZED">Specialized Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader">Team Leader</Label>
                <Select
                  value={formData.leader_id}
                  onValueChange={(value) => setFormData({ ...formData, leader_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePersonnel.map((person) => (
                      <SelectItem key={person.id} value={person.id.toString()}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTeam} className="w-full">
                Create Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{team.name}</CardTitle>
              <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Specialty</p>
                  <p>{team.specialty}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Team Leader</p>
                  <p>{team.leader.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Members</p>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{team.members.length} members</span>
                  </div>
                </div>
                {team.current_assignment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Assignment</p>
                    <p>{team.current_assignment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 