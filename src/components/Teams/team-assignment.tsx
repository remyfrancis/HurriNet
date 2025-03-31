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
import { Search, Plus, X, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Team = {
  id: number
  name: string
  type: string
  status: string
  memberCount: number
  leader: string
}

type Assignment = {
  id: number
  teamId: number
  teamName: string
  entityId: number
  entityName: string
  entityType: "INCIDENT" | "MEDICAL" | "SHELTER"
  assignedDate: string
  status: "ACTIVE" | "COMPLETED" | "PENDING"
}

type Entity = {
  id: number
  name: string
  type: "INCIDENT" | "MEDICAL" | "SHELTER"
  status: string
  location: string
  priority: "HIGH" | "MEDIUM" | "LOW"
}

export default function TeamAssignment() {
  const [teams, setTeams] = useState<Team[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [selectedEntityId, setSelectedEntityId] = useState<string>("")
  const [currentTab, setCurrentTab] = useState<string>("incidents")
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    // In a real app, fetch this data from your API
    const mockTeams: Team[] = [
      {
        id: 1,
        name: "Alpha Medical Team",
        type: "MEDICAL",
        status: "ACTIVE",
        memberCount: 8,
        leader: "Dr. Sarah Johnson",
      },
      {
        id: 2,
        name: "Bravo Rescue Squad",
        type: "RESCUE",
        status: "DEPLOYED",
        memberCount: 12,
        leader: "Captain Michael Chen",
      },
      {
        id: 3,
        name: "Charlie Logistics",
        type: "LOGISTICS",
        status: "ACTIVE",
        memberCount: 6,
        leader: "Maria Rodriguez",
      },
      {
        id: 4,
        name: "Delta Security",
        type: "SECURITY",
        status: "STANDBY",
        memberCount: 10,
        leader: "Officer James Wilson",
      },
      {
        id: 5,
        name: "Echo Response Team",
        type: "GENERAL",
        status: "UNAVAILABLE",
        memberCount: 5,
        leader: "Alex Thompson",
      },
    ]

    const mockEntities: Entity[] = [
      {
        id: 1,
        name: "Downtown Flooding",
        type: "INCIDENT",
        status: "ACTIVE",
        location: "Downtown Area",
        priority: "HIGH",
      },
      {
        id: 2,
        name: "Highway Accident",
        type: "INCIDENT",
        status: "ACTIVE",
        location: "Highway 101, Mile 45",
        priority: "MEDIUM",
      },
      {
        id: 3,
        name: "Central Hospital",
        type: "MEDICAL",
        status: "OPERATIONAL",
        location: "123 Medical Dr",
        priority: "HIGH",
      },
      {
        id: 4,
        name: "Eastside Clinic",
        type: "MEDICAL",
        status: "UNDERSTAFFED",
        location: "456 Health Ave",
        priority: "MEDIUM",
      },
      {
        id: 5,
        name: "Community Center Shelter",
        type: "SHELTER",
        status: "OPEN",
        location: "789 Community Blvd",
        priority: "MEDIUM",
      },
      {
        id: 6,
        name: "School Gymnasium Shelter",
        type: "SHELTER",
        status: "OPEN",
        location: "101 Education St",
        priority: "LOW",
      },
    ]

    const mockAssignments: Assignment[] = [
      {
        id: 1,
        teamId: 1,
        teamName: "Alpha Medical Team",
        entityId: 3,
        entityName: "Central Hospital",
        entityType: "MEDICAL",
        assignedDate: "2023-06-15",
        status: "ACTIVE",
      },
      {
        id: 2,
        teamId: 2,
        teamName: "Bravo Rescue Squad",
        entityId: 1,
        entityName: "Downtown Flooding",
        entityType: "INCIDENT",
        assignedDate: "2023-06-14",
        status: "ACTIVE",
      },
      {
        id: 3,
        teamId: 5,
        teamName: "Echo Response Team",
        entityId: 5,
        entityName: "Community Center Shelter",
        entityType: "SHELTER",
        assignedDate: "2023-06-10",
        status: "COMPLETED",
      },
    ]

    setTeams(mockTeams)
    setEntities(mockEntities)
    setAssignments(mockAssignments)
  }, [])

  const handleCreateAssignment = () => {
    if (!selectedTeamId || !selectedEntityId) return

    const teamId = Number.parseInt(selectedTeamId)
    const entityId = Number.parseInt(selectedEntityId)

    const team = teams.find((t) => t.id === teamId)
    const entity = entities.find((e) => e.id === entityId)

    if (!team || !entity) return

    // Check if this team is already assigned to this entity
    const existingAssignment = assignments.find(
      (a) => a.teamId === teamId && a.entityId === entityId && a.status === "ACTIVE",
    )

    if (existingAssignment) {
      setAlertMessage({
        type: "error",
        message: `${team.name} is already assigned to ${entity.name}`,
      })
      return
    }

    const newAssignment: Assignment = {
      id: assignments.length + 1,
      teamId,
      teamName: team.name,
      entityId,
      entityName: entity.name,
      entityType: entity.type,
      assignedDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    }

    setAssignments([...assignments, newAssignment])
    setSelectedTeamId("")
    setSelectedEntityId("")
    setIsDialogOpen(false)

    setAlertMessage({
      type: "success",
      message: `Successfully assigned ${team.name} to ${entity.name}`,
    })

    // Clear alert after 5 seconds
    setTimeout(() => {
      setAlertMessage(null)
    }, 5000)
  }

  const handleRemoveAssignment = (id: number) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id))
  }

  const completeAssignment = (id: number) => {
    setAssignments(
      assignments.map((assignment) => (assignment.id === id ? { ...assignment, status: "COMPLETED" } : assignment)),
    )
  }

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType =
      currentTab === "all"
        ? true
        : currentTab === "incidents"
          ? entity.type === "INCIDENT"
          : currentTab === "medical"
            ? entity.type === "MEDICAL"
            : currentTab === "shelters"
              ? entity.type === "SHELTER"
              : true
    return matchesSearch && matchesType
  })

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      assignment.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.entityName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "ALL" || filterType === null ? true : assignment.entityType === filterType
    return matchesSearch && matchesFilter
  })

  const getAvailableTeams = () => {
    // Get teams that are not currently assigned or are in STANDBY status
    const assignedTeamIds = assignments.filter((a) => a.status === "ACTIVE").map((a) => a.teamId)

    return teams.filter((team) => !assignedTeamIds.includes(team.id) || team.status === "STANDBY")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "LOW":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "OPERATIONAL":
      case "OPEN":
        return "bg-green-500"
      case "PENDING":
      case "UNDERSTAFFED":
        return "bg-yellow-500"
      case "COMPLETED":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
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
              <DialogDescription>Assign a team to an incident, medical facility, or shelter.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">
                  Team
                </Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger id="team" className="col-span-3">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTeams().map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} ({team.type}) - {team.memberCount} members
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entity" className="text-right">
                  Assign To
                </Label>
                <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                  <SelectTrigger id="entity" className="col-span-3">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incident-header" disabled>
                      -- Incidents --
                    </SelectItem>
                    {entities
                      .filter((e) => e.type === "INCIDENT")
                      .map((entity) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.name} ({entity.priority} priority)
                        </SelectItem>
                      ))}

                    <SelectItem value="medical-header" disabled>
                      -- Medical Facilities --
                    </SelectItem>
                    {entities
                      .filter((e) => e.type === "MEDICAL")
                      .map((entity) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.name} ({entity.status})
                        </SelectItem>
                      ))}

                    <SelectItem value="shelter-header" disabled>
                      -- Shelters --
                    </SelectItem>
                    {entities
                      .filter((e) => e.type === "SHELTER")
                      .map((entity) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.name} ({entity.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment} disabled={!selectedTeamId || !selectedEntityId}>
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="incidents" onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="shelters">Shelters</TabsTrigger>
          <TabsTrigger value="all">All Entities</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4 mt-4">
          <EntityList
            entities={filteredEntities.filter((e) => e.type === "INCIDENT")}
            assignments={assignments}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="medical" className="space-y-4 mt-4">
          <EntityList
            entities={filteredEntities.filter((e) => e.type === "MEDICAL")}
            assignments={assignments}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="shelters" className="space-y-4 mt-4">
          <EntityList
            entities={filteredEntities.filter((e) => e.type === "SHELTER")}
            assignments={assignments}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          <EntityList
            entities={filteredEntities}
            assignments={assignments}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Current Team Assignments</CardTitle>
          <CardDescription>View and manage all team assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="INCIDENT">Incidents</SelectItem>
                <SelectItem value="MEDICAL">Medical</SelectItem>
                <SelectItem value="SHELTER">Shelters</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No assignments found. Create a new assignment to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.teamName}</TableCell>
                      <TableCell>{assignment.entityName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.entityType}</Badge>
                      </TableCell>
                      <TableCell>{assignment.assignedDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(assignment.status)} mr-2`}></div>
                          {assignment.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {assignment.status === "ACTIVE" && (
                            <Button variant="outline" size="sm" onClick={() => completeAssignment(assignment.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveAssignment(assignment.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type EntityListProps = {
  entities: {
    id: number
    name: string
    type: string
    status: string
    location: string
    priority: string
  }[]
  assignments: {
    entityId: number
    teamName: string
    status: string
  }[]
  getPriorityColor: (priority: string) => string
  getStatusColor: (status: string) => string
}

function EntityList({ entities, assignments, getPriorityColor, getStatusColor }: EntityListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {entities.map((entity) => {
        const assignedTeams = assignments.filter((a) => a.entityId === entity.id && a.status === "ACTIVE")

        return (
          <Card key={entity.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{entity.name}</CardTitle>
                  <CardDescription>{entity.location}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{entity.type}</Badge>
                  <div className="flex items-center">
                    <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(entity.status)} mr-2`}></div>
                    <span className="text-sm">{entity.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${getPriorityColor(entity.priority)} mr-2`}></div>
                  <span className="text-sm">{entity.priority} Priority</span>
                </div>
                <div className="text-sm">
                  {assignedTeams.length} team{assignedTeams.length !== 1 ? "s" : ""} assigned
                </div>
              </div>

              {assignedTeams.length > 0 ? (
                <div className="space-y-2">
                  {assignedTeams.map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                      <span>{team.teamName}</span>
                      <Badge variant="outline">{team.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-muted-foreground">No teams assigned</div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        )
      })}

      {entities.length === 0 && (
        <div className="col-span-2 text-center py-8 text-muted-foreground">
          No entities found matching your search criteria.
        </div>
      )}
    </div>
  )
}

