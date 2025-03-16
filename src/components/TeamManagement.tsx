'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  status: 'available' | 'assigned' | 'unavailable';
  currentAssignment?: number;
}

interface Assignment {
  teamMemberId: number;
  incidentId: number;
  timestamp: string;
}

export function TeamManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<Record<number, number>>({});
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetchTeamMembers();
    fetchActiveIncidents();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/teams/members/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchActiveIncidents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/incidents/?status=active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const handleAssignment = async (teamMemberId: number, incidentId: number) => {
    try {
      const response = await fetch('http://localhost:8000/api/teams/assignments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          team_member_id: teamMemberId,
          incident_id: incidentId,
        }),
      });

      if (response.ok) {
        setAssignments(prev => ({
          ...prev,
          [teamMemberId]: incidentId,
        }));

        // Update team member status
        setTeamMembers(prev =>
          prev.map(member =>
            member.id === teamMemberId
              ? { ...member, status: 'assigned', currentAssignment: incidentId }
              : member
          )
        );

        toast({
          title: 'Assignment Updated',
          description: 'Team member has been assigned successfully.',
        });
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'assigned':
        return 'bg-yellow-500';
      case 'unavailable':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Team Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map(member => (
          <Card key={member.id}>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
              <Badge className={`ml-auto ${getStatusColor(member.status)}`}>
                {member.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Assignment</p>
                <Select
                  value={member.currentAssignment?.toString()}
                  onValueChange={(value) => handleAssignment(member.id, parseInt(value))}
                  disabled={member.status === 'unavailable'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {incidents.map(incident => (
                      <SelectItem key={incident.id} value={incident.id.toString()}>
                        {incident.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 