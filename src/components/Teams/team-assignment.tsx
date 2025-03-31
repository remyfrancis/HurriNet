"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, X, AlertTriangle, CheckCircle2, MinusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// --- Interfaces based on Backend --- 
// Interface for Team (simplified for assignment context)
interface Team {
  id: number;
  name: string;
  team_type_display: string;
  status: string; // Needed to filter available teams?
  current_assignment?: string | null;
  location?: string | null;
}

// Interface for Incident (based on previous usage in map)
interface Incident {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string | null;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  created_at: string;
  type: 'incident'; // Keep type for consistency if needed
  // Add other fields if relevant, e.g., location description
}

// Remove mock Entity and Assignment types
// type Entity = { ... }
// type Assignment = { ... }
// --- End Interfaces ---

export default function TeamAssignment() {
  const [teams, setTeams] = useState<Team[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  // Remove mock state
  // const [entities, setEntities] = useState<Entity[]>([]) 
  // const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  // const [filterType, setFilterType] = useState<string | null>(null) // Filter might be less relevant now
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("") // Renamed from entityId
  // const [currentTab, setCurrentTab] = useState<string>("incidents") // Simplify tabs later if needed
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // --- Fetch Real Data (Moved outside useEffect) --- 
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
          // Fetch Teams
          const teamResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!teamResponse.ok) throw new Error(`Failed to fetch teams: ${teamResponse.statusText}`);
          const teamData = await teamResponse.json();
          setTeams(Array.isArray(teamData) ? teamData : teamData.results || []);

          // Fetch Active Incidents (add is_resolved=false if backend supports it)
          const incidentResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/?is_resolved=false`, { // Example filter
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!incidentResponse.ok) throw new Error(`Failed to fetch incidents: ${incidentResponse.statusText}`);
          const incidentData = await incidentResponse.json();
          console.log("Raw Incident API Data:", incidentData); // <--- Log 1: Raw API data
          
          let fetchedIncidents: Incident[] = [];
          const defaultCoords = { latitude: 13.9094, longitude: -60.9789 }; // Saint Lucia Center
          const ewktPointRegex = /SRID=\d+;\s*POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i;

          if (incidentData.type === 'FeatureCollection' && Array.isArray(incidentData.features)) {
               fetchedIncidents = incidentData.features
                  .filter((feature: any) => !feature.properties?.is_resolved) // Ensure filtering
                  .map((feature: any) => {
                      let latitude = defaultCoords.latitude;
                      let longitude = defaultCoords.longitude;

                      if (typeof feature.geometry === 'string') {
                          const ewktMatch = feature.geometry.match(ewktPointRegex);
                          if (ewktMatch && ewktMatch.length >= 3) {
                              const lon = parseFloat(ewktMatch[1]);
                              const lat = parseFloat(ewktMatch[2]);
                              if (!isNaN(lon) && !isNaN(lat)) {
                                  longitude = lon;
                                  latitude = lat;
                              }
                          }
                      } else if (feature.geometry?.type === 'Point' && Array.isArray(feature.geometry?.coordinates) && feature.geometry.coordinates.length >= 2) {
                           // Handle GeoJSON Point format: [longitude, latitude]
                          longitude = feature.geometry.coordinates[0];
                          latitude = feature.geometry.coordinates[1];
                      }

                      return {
                          id: feature.id,
                          title: feature.properties?.title || 'Incident Report',
                          description: feature.properties?.description || 'No description',
                          latitude,
                          longitude,
                          location_name: feature.properties?.location_name,
                          severity: feature.properties?.severity || 'MODERATE',
                          created_at: feature.properties?.created_at || new Date().toISOString(),
                          type: 'incident' as const,
                      };
                  });
          // Add handling for other potential incidentData structures if necessary (Array, Paginated Results)
          } else {
               console.warn("Incidents data format not recognized as GeoJSON FeatureCollection. Attempting fallback.");
              // Adapt fallback logic if needed to include location_name
              if (Array.isArray(incidentData)) {
                  fetchedIncidents = incidentData.filter((inc: any) => !inc.is_resolved).map((inc: any) => ({ ...inc, title: inc.title, type: 'incident' as const })); // Add mapping if needed
              } else if (incidentData.results) {
                  fetchedIncidents = incidentData.results.filter((inc: any) => !inc.is_resolved).map((inc: any) => ({ ...inc, title: inc.title, type: 'incident' as const })); // Add mapping if needed
              }
          }
          setIncidents(fetchedIncidents);
          console.log("Mapped Incidents (for state):", fetchedIncidents); // <--- Log 2: Mapped data

      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setTeams([]);
          setIncidents([]);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchData(); // Call the function defined outside
  }, [])
  // --- End Fetch ---

  // --- Handle Assignment Creation (API Call) --- 
  const handleCreateAssignment = async () => {
    if (!selectedTeamId || !selectedIncidentId) return;
    setError(null);
    setAlertMessage(null);

    const teamId = Number.parseInt(selectedTeamId);
    const incidentId = Number.parseInt(selectedIncidentId);
    const incident = incidents.find(i => i.id === incidentId);
    const team = teams.find(t => t.id === teamId);

    if (!incident || !team) {
        setError("Selected team or incident not found.");
        return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError('Authentication required');
        return;
    }

    // Construct assignment details (adjust as needed)
    const assignmentPayload = {
        current_assignment: `Incident: ${incident.title}`,
        location: `Incident Location (${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)})`,
        status: 'DEPLOYED' // Or another appropriate status like 'ACTIVE' or 'ASSIGNED'? Check model.
    };

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentPayload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `Request failed: ${response.statusText}` }));
            throw new Error(errorData.detail || 'Failed to assign team');
        }

        // Success
        setAlertMessage({ type: "success", message: `Successfully assigned ${team.name} to ${incident.title}` });
        setIsDialogOpen(false);
        setSelectedTeamId("");
        setSelectedIncidentId("");
        fetchData(); // Re-fetch teams to update assignment display

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during assignment');
    } finally {
        setTimeout(() => setAlertMessage(null), 5000);
    }
  };
  // --- End Assignment Creation ---

  // --- Handle Unassignment --- 
  const handleUnassignTeam = async (teamId: number) => {
    setError(null);
    setAlertMessage(null);
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const token = localStorage.getItem('accessToken');
     if (!token) {
        setError('Authentication required');
        return;
    }

     // Payload to clear assignment and set status (e.g., to STANDBY)
     const unassignPayload = {
        current_assignment: null,
        location: null,
        status: 'STANDBY' // Or 'ACTIVE'? Check model/logic
    };

    if (!window.confirm(`Are you sure you want to unassign ${team.name}?`)) return;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unassignPayload),
        });

         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: `Request failed: ${response.statusText}` }));
            throw new Error(errorData.detail || 'Failed to unassign team');
        }

        // Success
        setAlertMessage({ type: "success", message: `Successfully unassigned ${team.name}` });
        fetchData(); // Re-fetch teams

    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred during unassignment');
    } finally {
        setTimeout(() => setAlertMessage(null), 5000);
    }
  };
  // --- End Unassignment ---

  // Remove mock data handlers
  // const handleRemoveAssignment = ... 
  // const completeAssignment = ... 

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase())
    // Add type/status filtering if needed later
    return matchesSearch;
  });

  // Remove mock assignment filtering
  // const filteredAssignments = ... 

  const getAvailableTeams = () => {
    // Filter teams that do not have a current_assignment or status allows reassignment (e.g., STANDBY)
    return teams.filter(team => !team.current_assignment || team.status === 'STANDBY');
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
      case "EXTREME": // Added Extreme
        return "bg-red-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "LOW":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Simplified getStatusColor for incidents/teams
  const getStatusColor = (status: string) => {
     switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "OPERATIONAL":
      case "OPEN":
      case "DEPLOYED": // Team status
        return "bg-green-500";
      case "STANDBY": // Team status
        return "bg-purple-500";
      case "ON_CALL": // Team status
         return "bg-blue-500";
      case "PENDING":
      case "UNDERSTAFFED":
      case "LIMITED": // Medical status
        return "bg-yellow-500";
      case "COMPLETED":
      case "CLOSED": // Shelter/Medical status
        return "bg-gray-600";
      case "OFF_DUTY": // Team status
      case "UNAVAILABLE": // Team status
         return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  }

  if (isLoading) {
      return <div>Loading assignment data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {alertMessage && (
        <Alert variant={alertMessage.type === "success" ? "default" : "destructive"}>
          {alertMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{alertMessage.type === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{alertMessage.message}</AlertDescription>
        </Alert>
      )}
       {/* Error Display */}
       {error && (
          <Alert variant="destructive">
             <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Search and New Assignment Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incidents..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Assign an available team to an active incident.</DialogDescription>
            </DialogHeader>
            {/* Assignment Form */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger id="team" className="col-span-3">
                    <SelectValue placeholder="Select available team" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTeams().length === 0 && <SelectItem value="" disabled>No available teams</SelectItem>}
                    {getAvailableTeams().map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} ({team.team_type_display})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="incident" className="text-right">Incident</Label>
                <Select value={selectedIncidentId} onValueChange={setSelectedIncidentId}>
                  <SelectTrigger id="incident" className="col-span-3">
                    <SelectValue placeholder="Select incident" />
                  </SelectTrigger>
                  <SelectContent>
                     {incidents.length === 0 && <SelectItem value="" disabled>No active incidents found</SelectItem>}
                    {incidents.map((incident) => (
                        <SelectItem key={incident.id} value={incident.id.toString()}>
                          {incident.title} ({incident.severity} severity)
                        </SelectItem>
                      ))}
                    {/* Keep other entity types commented out for now 
                    <SelectItem value="medical-header" disabled>-- Medical Facilities --</SelectItem>
                    ...
                    <SelectItem value="shelter-header" disabled>-- Shelters --</SelectItem>
                    ...
                    */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Dialog Footer */}
            <DialogFooter>
              {error && <p className="text-sm text-red-500 mr-auto">Error: {error}</p>} 
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAssignment} disabled={!selectedTeamId || !selectedIncidentId}>
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Simplified Tabs - Showing Incidents Only for now */}
      <Tabs defaultValue="incidents"> 
        <TabsList className="grid w-full grid-cols-1"> {/* Simplified to 1 tab for now */} 
          <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
          {/* <TabsTrigger value="medical">Medical</TabsTrigger> */}
          {/* <TabsTrigger value="shelters">Shelters</TabsTrigger> */}
          {/* <TabsTrigger value="all">All Entities</TabsTrigger> */}
        </TabsList>

        <TabsContent value="incidents" className="space-y-4 mt-4">
           {/* Pass incidents and teams to the list */} 
          <IncidentList 
            incidents={filteredIncidents} 
            teams={teams} 
            getPriorityColor={getPriorityColor} 
            getStatusColor={getStatusColor}
            onUnassignTeam={handleUnassignTeam} // Pass the unassign handler
          />
        </TabsContent>

        {/* Keep other TabsContent commented out 
        <TabsContent value="medical" className="space-y-4 mt-4">
           ...
        </TabsContent>
        <TabsContent value="shelters" className="space-y-4 mt-4">
           ...
        </TabsContent>
        <TabsContent value="all" className="space-y-4 mt-4">
           ...
        </TabsContent>
        */}
      </Tabs>

      {/* Removed the separate "Current Team Assignments" Table */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Current Team Assignments</CardTitle>
           ...
        </CardHeader>
        <CardContent>
           ...
        </CardContent>
      </Card>
      */}
    </div>
  )
}

// --- Renamed and Updated EntityList to IncidentList --- 
type IncidentListProps = {
  incidents: Incident[];
  teams: Team[];
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  onUnassignTeam: (teamId: number) => void; // Callback for unassigning
};

function IncidentList({ incidents, teams, getPriorityColor, getStatusColor, onUnassignTeam }: IncidentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {incidents.map((incident) => {
        console.log("Rendering Incident:", incident); // <--- Log 3: Incident object in list
        // Find teams assigned to THIS specific incident
        // Matching based on a conventional string in current_assignment
        const assignmentString = `Incident: ${incident.title}`;
        const assignedTeams = teams.filter(team => team.current_assignment === assignmentString);

        return (
          <Card key={incident.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{incident.title}</CardTitle>
                  <CardDescription>{incident.description.substring(0, 100)}{incident.description.length > 100 ? '...' : ''}</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-col sm:flex-row">
                  <Badge variant="outline">{incident.type.toUpperCase()}</Badge>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(incident.severity)} mr-2`}></div>
                    <span className="text-sm">{incident.severity} Priority</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-2">
                 Location: {incident.location_name || `(${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)})`}
              </div>
               <div className="text-sm font-medium mb-2">Assigned Teams ({assignedTeams.length}):</div>
              {assignedTeams.length > 0 ? (
                <div className="space-y-2">
                  {assignedTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(team.status)} mr-2`}></div>
                          <span>{team.name} ({team.team_type_display}) - {team.status}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-100" onClick={() => onUnassignTeam(team.id)} title="Unassign Team">
                          <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-sm text-muted-foreground">No teams currently assigned</div>
              )}
            </CardContent>
            {/* Optional Footer 
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm">View Details</Button> 
            </CardFooter>
            */}
          </Card>
        )
      })}

      {incidents.length === 0 && (
        <div className="col-span-1 md:col-span-2 text-center py-8 text-muted-foreground">
          No active incidents found matching your search criteria.
        </div>
      )}
    </div>
  )
}

