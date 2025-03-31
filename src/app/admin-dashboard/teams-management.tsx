'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, PlusCircle, UserPlus } from 'lucide-react'

// Interfaces based on backend serializers (adjust if necessary)
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TeamMember {
  id: number;
  user: User;
  role: string;
  role_display: string;
  status: string;
  status_display: string;
}

interface Team {
  id: number;
  name: string;
  team_type: string;
  team_type_display: string;
  status: string;
  status_display: string;
  leader?: User;
  members: TeamMember[];
  active_members_count: number;
  location?: string;
  current_assignment?: string;
}

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([]) // All potential members
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    setLoadingTeams(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    // TODO: Fetch all relevant users (e.g., MEDICAL_PERSONNEL, EMERGENCY_PERSONNEL, etc.)
    // For now, using a placeholder endpoint or combine multiple calls
    // Example: Fetching all users - adjust endpoint as needed
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Authentication required');

      // Potential: Fetch all users, or specific roles if endpoints exist
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, { // Adjust endpoint if needed
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      // Assuming the users endpoint returns a list or paginated results
      setUsers(Array.isArray(data) ? data : data.results || []); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      // Set empty array on user fetch error to avoid breaking UI
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const handleAddMember = async (teamId: number, userId: number) => {
    console.log(`Attempting to add user ${userId} to team ${teamId}`);
    // TODO: Implement API call to /api/teams/{teamId}/add_member/
    setError('Add member functionality not yet implemented.');
    // Example API call structure:
    /*
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/add_member/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, role: 'MEMBER' }) // Add role selection later
      });
      if (!response.ok) throw new Error('Failed to add member');
      fetchTeams(); // Re-fetch teams to update member list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
    */
  };

  const handleAssignTeam = async (teamId: number, assignment: string) => {
    console.log(`Assigning team ${teamId} to ${assignment}`);
    // TODO: Implement API call to update team assignment/location
    setError('Assign team functionality not yet implemented.');
    // Example: Update team location or current_assignment field
    /*
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ location: assignment, current_assignment: `Assigned to ${assignment}` })
      });
      if (!response.ok) throw new Error('Failed to assign team');
      fetchTeams(); // Re-fetch teams to update status
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign team');
    }
    */
  };

  if (loadingTeams || loadingUsers) {
    return <div>Loading team data...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teams</CardTitle>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Team
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Leader</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No teams found.</TableCell>
                </TableRow>
              )}
              {teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.team_type_display}</TableCell>
                  <TableCell>{team.status_display}</TableCell>
                  <TableCell>{team.leader?.name || 'N/A'}</TableCell>
                  <TableCell>{team.active_members_count}</TableCell>
                  <TableCell>{team.current_assignment || team.location || 'Unassigned'}</TableCell>
                  <TableCell>
                    {/* Placeholder for assignment actions */}
                    <Select onValueChange={(value) => handleAssignTeam(team.id, value)}>
                       <SelectTrigger className="w-[180px]">
                         <SelectValue placeholder="Assign to..." />
                       </SelectTrigger>
                       <SelectContent>
                         {/* TODO: Populate with Incidents, Shelters, Medical Facilities */} 
                         <SelectItem value="Incident-1">Incident 1 (Flooding)</SelectItem>
                         <SelectItem value="Shelter-101">Shelter (Castries Comp.)</SelectItem>
                         <SelectItem value="Medical-1">Hospital (Owen King)</SelectItem>
                         <SelectItem value="Unassigned">Unassign</SelectItem>
                       </SelectContent>
                     </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Personnel</CardTitle>
          {/* Add filtering/search later */}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No users found or failed to load.</TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell> 
                  <TableCell>
                    {/* Placeholder for assignment actions */}
                     <Select onValueChange={(value) => handleAddMember(parseInt(value), user.id)}>
                       <SelectTrigger className="w-[180px]">
                         <SelectValue placeholder="Add to team..." />
                       </SelectTrigger>
                       <SelectContent>
                         {teams.map(team => (
                            <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
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
  )
}
