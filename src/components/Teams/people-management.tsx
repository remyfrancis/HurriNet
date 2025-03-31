"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Plus, Edit, Trash2, UserPlus, UserX } from "lucide-react"
import { Alert, AlertDescription } from '@/components/ui/alert'

// --- Interfaces based on Backend Serializers --- 
interface User {
  id: number;
  name: string;
  email: string;
  role: string; // e.g., "ADMINISTRATOR", "MEDICAL_PERSONNEL"
  first_name?: string;
  last_name?: string;
  // Add other relevant fields from your User model if needed
  // e.g., status, specialization, certifications
}

interface TeamMemberInfo { // Represents membership info often nested in User or fetched separately
  team_id: number;
  team_name: string;
  member_role: string; // e.g., "LEADER", "MEMBER"
  member_status: string; // e.g., "ACTIVE"
}

// Representing a User from the perspective of this component
// Might include flattened team info if your API provides it
interface Person extends User { 
  // If your /api/users/ endpoint includes team details, map them here
  // Otherwise, we might need separate fetching or cross-referencing
  current_team_id?: number | null;
  current_team_name?: string | null;
  member_status?: string | null; // Status within the team
}

interface Team {
  id: number;
  name: string;
  team_type_display: string; // To show type in assignment dialog
}
// --- End Interfaces --- 

export default function PeopleManagement() {
  const [people, setPeople] = useState<Person[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [currentPerson, setCurrentPerson] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Form state (simplified as user creation might be separate) ---
  // We primarily focus on assignment here. User editing might need more fields.
  const [formData, setFormData] = useState({ 
      name: "",
      email: "", // Assuming email is key identifier
      role: "CITIZEN" // Default role
      // Add other fields if editing user details here
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  // --- Fetch Users (People) and Teams --- 
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch Users (adjust endpoint as needed)
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!userResponse.ok) throw new Error(`Failed to fetch users: ${userResponse.statusText}`);
      const userData = await userResponse.json();
      // TODO: Adapt this mapping based on actual API response structure for users
      // This assumes a flat list or paginated results. 
      // You might need to fetch team membership info separately if not included.
      const fetchedPeople = (Array.isArray(userData) ? userData : userData.results || []).map((user: any) => ({
          ...user, 
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email, // Construct name
          // --- Placeholder for team info - fetch/map separately if needed --- 
          current_team_id: null, 
          current_team_name: null,
          member_status: null 
          // --- End Placeholder --- 
      }));
      setPeople(fetchedPeople);

      // Fetch Teams (for assignment dropdown)
      const teamResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!teamResponse.ok) throw new Error(`Failed to fetch teams: ${teamResponse.statusText}`);
      const teamData = await teamResponse.json();
      setTeams(Array.isArray(teamData) ? teamData : teamData.results || []); // Handle potential pagination

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setPeople([]);
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  // --- End Fetch --- 

  // --- Input Handlers (Simplified) --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  // --- End Input Handlers --- 


  // --- API Actions --- 

  // Add/Edit Person - Placeholder - User management might be complex/separate
  const handlePersonSubmit = async () => {
    setError("User creation/editing via this interface is not yet implemented.");
    // TODO: Implement API call (POST or PATCH to /api/users/{id}/)
    // Requires more form fields and potentially different permissions.
    setIsPersonDialogOpen(false);
  };

  const handleDeletePerson = async (id: number) => {
    setError(null);
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }

    try {
      // TODO: Verify the correct endpoint for user deletion
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to delete user');
      }
      fetchData(); // Refresh user list
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred deleting user');
    }
  };

  // Assign person to team
  const handleAssignToTeam = async () => {
    if (!currentPerson || !selectedTeamId) return;
    setError(null);

    const teamId = Number(selectedTeamId);
    const userId = currentPerson.id;
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/add_member/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // You might want to add role selection later
        body: JSON.stringify({ user_id: userId, role: 'MEMBER' }), 
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
          // Handle specific error like already a member?
          throw new Error(errorData.detail || 'Failed to assign user to team');
      }

      // Success
      setIsAssignDialogOpen(false);
      setCurrentPerson(null);
      setSelectedTeamId("");
      fetchData(); // Refresh data to show the new assignment

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during assignment');
    }
  };

  // Remove person from their current team
  const handleRemoveFromTeam = async (person: Person) => {
    // Find the team the person is actually on (might need better data structure)
    // This requires knowing the *current* team ID from the user data
    // For now, assuming we have current_team_id on the person object
    const teamId = person.current_team_id; // !!! Requires current_team_id to be fetched/set correctly
    const userId = person.id;
    
    if (!teamId) {
        setError("Could not determine the user's current team.");
        return;
    }
    setError(null);
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }
    
    if (!window.confirm(`Are you sure you want to remove ${person.name} from their team?`)) return;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/remove_member/`, {
            method: 'POST', // Correct method based on urls.py
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
            throw new Error(errorData.detail || 'Failed to remove user from team');
        }

        // Success
        fetchData(); // Refresh data

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during removal');
    }
  };

  // --- End API Actions ---

  const openEditDialog = (person: Person) => {
    setCurrentPerson(person)
    // Populate form based on the person's data
    setFormData({
        name: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        email: person.email,
        role: person.role,
        // Add other fields if editing here
    });
    setIsPersonDialogOpen(true)
  }

  const openAssignDialog = (person: Person) => {
    setCurrentPerson(person)
    // Pre-select current team if known
    setSelectedTeamId(person.current_team_id?.toString() || "") 
    setIsAssignDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "CITIZEN" });
  }

  const openCreateDialog = () => {
    setCurrentPerson(null)
    resetForm()
    setIsPersonDialogOpen(true)
  }

  // --- Filtering --- 
  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role.toLowerCase().includes(searchTerm.toLowerCase());
    // TODO: Filter by status requires status field on Person interface
    // const matchesFilter = filterStatus === "ALL" || filterStatus === null ? true : person.status === filterStatus;
    const matchesFilter = true; // Placeholder
    return matchesSearch && matchesFilter;
  });

  // --- Status Color (Needs person.status or person.member_status) --- 
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "ACTIVE": return "bg-green-500"; // Team Member Status
      case "ON_CALL": return "bg-blue-500";
      case "ON_LEAVE": return "bg-yellow-500";
      case "OFF_DUTY": return "bg-gray-500";
      // Add mapping for User status if different and available
      default:
        return "bg-gray-400"; // Default/Unknown
    }
  };

  // --- Helper function to format role display ---
  const formatRoleDisplay = (role: string | null | undefined): string => {
    if (!role) return 'N/A';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div>Loading personnel data...</div>;
  }

  return (
    <div className="space-y-4">
       {/* Error Display */}
       {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Filters and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, role..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter - Requires status field 
          <Select value={filterStatus || "ALL"} onValueChange={(value) => setFilterStatus(value === "ALL" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active (in team)</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem> 
              <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
               Add other relevant statuses 
            </SelectContent>
          </Select>
          */}

          {/* Add/Edit Person Dialog - Simplified for now */}
          <Dialog open={isPersonDialogOpen} onOpenChange={setIsPersonDialogOpen}>
            <DialogTrigger asChild>
               {/* <Button onClick={openCreateDialog}><Plus className="h-4 w-4 mr-2" /> Add Person</Button> */}
               {/* Button hidden as creation might be elsewhere */}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{currentPerson ? "Edit Person" : "Add New Person"}</DialogTitle>
                {/* <DialogDescription>...</DialogDescription> */}
              </DialogHeader>
                {/* Simplified Form - User management is complex */}
               <div className="grid gap-4 py-4">
                  <p className="text-sm text-muted-foreground">User editing/creation via this interface is currently disabled. Manage users through the main Django admin panel.</p>
                  {/* Basic info display for context 
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
                  </div>
                   Add more fields if needed 
                  */}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPersonDialogOpen(false)}>Cancel</Button>
                {/* <Button onClick={handlePersonSubmit}>{currentPerson ? "Save Changes" : "Add Person"}</Button> */} 
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Assign to Team Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign to Team</DialogTitle>
            <DialogDescription>Select a team to assign {currentPerson?.name} to.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger id="team" className="col-span-3">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name} ({team.team_type_display})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* TODO: Add Role selection here based on TeamMember.MEMBER_ROLES */}
          </div>
          <DialogFooter>
            {error && <p className="text-sm text-red-500 mr-auto">Error: {error}</p>} {/* Show error in dialog */} 
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignToTeam} disabled={!selectedTeamId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* People Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>System Role</TableHead>
              {/* <TableHead>Skills</TableHead> */}
              <TableHead>Status</TableHead>
              <TableHead>Assigned Team</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  {isLoading ? "Loading..." : "No personnel found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{person.email}</TableCell>
                  {/* Use the formatter function for role display */}
                  <TableCell>{formatRoleDisplay(person.role)}</TableCell>
                  {/* Skills display removed for brevity, add back if needed 
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {person.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {person.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{person.skills.length - 2} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  */}
                  <TableCell>
                    {/* Display Member Status if available, otherwise User Status? */}
                    <div className="flex items-center">
                       <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(person.member_status)} mr-2`}></div>
                       {person.member_status || 'Unknown'} {/* Display team member status */} 
                    </div>
                  </TableCell>
                  <TableCell>
                    {person.current_team_name ? (
                      <Badge>{person.current_team_name}</Badge>
                    ) : (
                      <span className="text-muted-foreground italic">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {person.current_team_id ? (
                        <Button variant="outline" size="sm" onClick={() => handleRemoveFromTeam(person)} title="Remove from Team">
                          <UserX className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => openAssignDialog(person)} title="Assign to Team">
                          <UserPlus className="h-4 w-4 mr-1" /> Assign
                        </Button>
                      )}
                       {/* Edit/Delete might be restricted or handled elsewhere */}
                      {/* 
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(person)} title="Edit Person">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePerson(person.id)} title="Delete Person">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                       */}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

