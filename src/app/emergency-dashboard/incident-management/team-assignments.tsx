'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock data for team members and incidents
const teamMembers = [
  { id: 1, name: "John Doe", role: "Firefighter", avatar: "/avatars/john-doe.png" },
  { id: 2, name: "Jane Smith", role: "Paramedic", avatar: "/avatars/jane-smith.png" },
  { id: 3, name: "Mike Johnson", role: "Police Officer", avatar: "/avatars/mike-johnson.png" },
]

const incidents = [
  { id: 1, type: "Fire", location: "Castries" },
  { id: 2, type: "Flood", location: "Vieux Fort" },
  { id: 3, type: "Medical", location: "Gros Islet" },
]

export default function TeamAssignments() {
  const [assignments, setAssignments] = useState<Record<number, number>>({})

  const handleAssignment = (teamMemberId: number, incidentId: number) => {
    setAssignments(prev => ({
      ...prev,
      [teamMemberId]: incidentId
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={assignments[member.id]?.toString() || ""}
                  onValueChange={(value) => handleAssignment(member.id, parseInt(value))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign to incident" />
                  </SelectTrigger>
                  <SelectContent>
                    {incidents.map((incident) => (
                      <SelectItem key={incident.id} value={incident.id.toString()}>
                        {incident.type} - {incident.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignments[member.id] && (
                  <Badge variant="outline">
                    Assigned: {incidents.find(i => i.id === assignments[member.id])?.type}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

