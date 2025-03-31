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
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react"
import { Alert, AlertDescription } from '@/components/ui/alert'

// --- Updated Interfaces to match Backend Serializers ---
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
  description: string;
  team_type: string; // e.g., "MEDICAL"
  team_type_display: string; // e.g., "Medical Response"
  status: string; // e.g., "ACTIVE"
  status_display: string; // e.g., "Active"
  leader?: User; // Can be null
  leader_id?: number | null; // For sending updates
  members: TeamMember[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  current_assignment?: string | null;
  equipment?: any[]; // Assuming list, adjust if different JSON structure
  location?: string | null;
  notes?: string;
  active_members_count: number;
  available_members_count: number;
}

// Initial state for a new team form matching backend expectations
const initialFormData = {
  name: "",
  description: "",
  team_type: "FIRST_RESPONSE", // Default value, ensure it's valid
  status: "STANDBY",        // Default value, ensure it's valid
  leader_id: null as number | null, // Use leader_id for creation/update
  is_active: true,
  current_assignment: "",
  equipment: [] as any[], // Explicitly type the empty array
  location: "",
  notes: ""
};
// --- End Interface Updates ---

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([]) // For leader selection
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Combined loading state
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false) // State for delete dialog
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null) // State for team to delete

  // --- Form state using updated initial state ---
  const [formData, setFormData] = useState(initialFormData)

  // --- Fetch Teams and Users --- 
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch Teams
      const teamResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!teamResponse.ok) throw new Error(`Failed to fetch teams: ${teamResponse.statusText}`);
      const teamData = await teamResponse.json();
      setTeams(Array.isArray(teamData) ? teamData : teamData.results || []); // Handle potential pagination

      // Fetch Users (for leader selection)
      // Adjust endpoint if you have a better one (e.g., only potential leaders)
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!userResponse.ok) throw new Error(`Failed to fetch users: ${userResponse.statusText}`);
      const userData = await userResponse.json();
      setUsers(Array.isArray(userData) ? userData : userData.results || []); // Handle potential pagination

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTeams([]); // Clear data on error
      setUsers([]);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchData();
  }, [])
  // --- End Fetch --- 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // --- API Actions --- 
  const handleApiSubmit = async () => {
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }

    const url = currentTeam
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${currentTeam.id}/`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/`;

    const method = currentTeam ? 'PATCH' : 'POST';

    // Ensure leader_id is a number or null, not an empty string
    const payload = {
        ...formData,
        leader_id: formData.leader_id ? Number(formData.leader_id) : null,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
        throw new Error(errorData.detail || `Failed to ${currentTeam ? 'update' : 'create'} team`);
      }

      // Success
      setIsDialogOpen(false);
      setCurrentTeam(null);
      resetForm();
      fetchData(); // Re-fetch data to show the changes

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDeleteTeam = async (id: number | null) => {
    if (id === null) return; // Check if ID is valid
    setError(null);
    // Remove window.confirm - confirmation handled by dialog
    // if (!window.confirm("Are you sure you want to delete this team?")) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok && response.status !== 204) { // 204 No Content is success for DELETE
        const errorData = await response.json().catch(() => ({ detail: `Request failed with status ${response.status}` }));
        throw new Error(errorData.detail || 'Failed to delete team');
      }

      // Success - refetch data
      fetchData();

    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        // Close the dialog regardless of outcome
        setIsDeleteDialogOpen(false);
        setTeamToDelete(null);
    }
  };
  // --- End API Actions ---

  const openEditDialog = (team: Team) => {
    setCurrentTeam(team)
    setFormData({
      name: team.name,
      description: team.description || "",
      team_type: team.team_type,
      status: team.status,
      leader_id: team.leader?.id ?? null,
      is_active: team.is_active,
      current_assignment: team.current_assignment || "",
      equipment: team.equipment || [],
      location: team.location || "",
      notes: team.notes || ""
    });
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData(initialFormData);
  }

  const openCreateDialog = () => {
    setCurrentTeam(null)
    resetForm()
    setIsDialogOpen(true)
  }

  // --- Function to open delete confirmation dialog ---
  const openDeleteDialog = (team: Team) => {
      setTeamToDelete(team);
      setIsDeleteDialogOpen(true);
  }
  // --- End Function ---

  // --- Filtering Logic (adjust as needed) --- 
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.leader?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Adjust filterType based on actual team_type values if needed
    const matchesFilter = filterType === "ALL" || filterType === null ? true : team.team_type === filterType;
    return matchesSearch && matchesFilter;
  });

  // --- Status Color (adjust based on backend status values) ---
  const getStatusColor = (status: string) => {
    switch (status) {
      // Medical Statuses from model
      case "ACTIVE": return "bg-green-500";
      case "ON_CALL": return "bg-blue-500";
      // Emergency Statuses from model
      case "DEPLOYED": return "bg-yellow-500";
      case "STANDBY": return "bg-purple-500"; // Adjusted Standby color
      // Common Status
      case "OFF_DUTY": return "bg-gray-500";
      default:
        return "bg-gray-400"; // Default for unknown status
    }
  };

  // --- Team Type Choices (Match backend TEAM_TYPES) ---
  const teamTypes = [
    { value: "MEDICAL", label: "Medical Response" },
    { value: "FIRST_RESPONSE", label: "First Response" },
    { value: "SEARCH_RESCUE", label: "Search and Rescue" },
    { value: "EVACUATION", label: "Evacuation" },
    { value: "HAZMAT", label: "Hazardous Materials" },
    { value: "LOGISTICS", label: "Logistics Support" },
  ];

  // --- Status Choices (Combine backend statuses - adjust if needed) ---
  const teamStatuses = [
    { value: "ACTIVE", label: "Active" },        // Medical
    { value: "ON_CALL", label: "On Call" },       // Medical
    { value: "DEPLOYED", label: "Deployed" },      // Emergency
    { value: "STANDBY", label: "Standby" },       // Emergency
    { value: "OFF_DUTY", label: "Off Duty" },      // Common
  ];

  // --- Render Logic ---
  if (isLoading) {
    return <div>Loading teams...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Filters and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams by name or leader..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Select */}
          <Select value={filterType || "ALL"} onValueChange={(value) => setFilterType(value === "ALL" ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {teamTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Create/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                New Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{currentTeam ? "Edit Team" : "Create New Team"}</DialogTitle>
                <DialogDescription>
                  {currentTeam ? "Update the team details below." : "Fill in the information to create a new team."}
                </DialogDescription>
              </DialogHeader>
              {/* Form Fields */}
              <div className="grid gap-4 py-4">
                {/* Team Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                </div>
                {/* Team Type */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team_type" className="text-right">Type</Label>
                  <Select name="team_type" value={formData.team_type} onValueChange={(value) => handleSelectChange("team_type", value)}>
                    <SelectTrigger id="team_type" className="col-span-3">
                      <SelectValue placeholder="Select team type" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Status */}
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                        <SelectTrigger id="status" className="col-span-3">
                            <SelectValue placeholder="Select team status" />
                        </SelectTrigger>
                        <SelectContent>
                            {teamStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Leader */}
                <div className="grid grid-cols-4 items-center gap-4">
                   <Label htmlFor="leader_id" className="text-right">Leader</Label>
                   <Select 
                       name="leader_id" 
                       value={formData.leader_id ? formData.leader_id.toString() : "__NONE__"} 
                       onValueChange={(value) => handleSelectChange("leader_id", value === "__NONE__" ? null : Number(value))}
                    >
                       <SelectTrigger id="leader_id" className="col-span-3">
                           <SelectValue placeholder="Select leader (optional)" />
                       </SelectTrigger>
                       <SelectContent>
                           <SelectItem value="__NONE__">None</SelectItem>
                           {users.map(user => (
                               <SelectItem key={user.id} value={user.id.toString()}>{user.name || user.email}</SelectItem>
                           ))}
                       </SelectContent>
                   </Select>
               </div>
               {/* Description */} 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" rows={3}/>
                </div>
                 {/* Location */} 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">Location</Label>
                  <Input id="location" name="location" value={formData.location || ""} onChange={handleInputChange} className="col-span-3"/>
                </div>
                 {/* Notes */} 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleInputChange} className="col-span-3" rows={2}/>
                </div>
              </div>
              {/* Footer Buttons */} 
              <DialogFooter>
                 {error && <p className="text-sm text-red-500 mr-auto">Error: {error}</p>} {/* Show error in dialog */} 
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleApiSubmit}>{currentTeam ? "Save Changes" : "Create Team"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Teams Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Members (Active)</TableHead>
              <TableHead>Leader</TableHead>
              <TableHead>Assignment/Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  {isLoading ? "Loading..." : "No teams found. Create a new team to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{team.team_type_display}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(team.status)} mr-2`}></div>
                      {team.status_display}
                    </div>
                  </TableCell>
                  <TableCell>{team.active_members_count}</TableCell>
                  <TableCell>{team.leader?.name || <span className="text-muted-foreground italic">None</span>}</TableCell>
                  <TableCell>{team.current_assignment || team.location || <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {/* Add Manage Members button later or link */} 
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(team)} title="Edit Team">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Update onClick to open dialog */}
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(team)} title="Delete Team">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                    Are you sure you want to delete the team "{teamToDelete?.name || ''}"? 
                    This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDeleteTeam(teamToDelete?.id ?? null)}>Confirm Delete</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

    </div>
  )
}

