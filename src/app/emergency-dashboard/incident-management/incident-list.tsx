import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getIncidents() {
  // TODO: Implement actual API call to fetch incidents
  // This is mock data
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  return [
    { id: 1, type: "Fire", location: "Castries", status: "Active", lastUpdate: "10 minutes ago" },
    { id: 2, type: "Flood", location: "Vieux Fort", status: "Responding", lastUpdate: "5 minutes ago" },
    { id: 3, type: "Medical", location: "Gros Islet", status: "Pending", lastUpdate: "2 minutes ago" },
    { id: 4, type: "Traffic Accident", location: "Soufrière", status: "Resolved", lastUpdate: "1 hour ago" },
  ]
}

export default async function IncidentList() {
  const incidents = await getIncidents()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.type}</TableCell>
                <TableCell>{incident.location}</TableCell>
                <TableCell>
                  <Badge variant={
                    incident.status === "Active" ? "destructive" :
                    incident.status === "Responding" ? "warning" :
                    incident.status === "Pending" ? "default" :
                    "secondary"
                  }>
                    {incident.status}
                  </Badge>
                </TableCell>
                <TableCell>{incident.lastUpdate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

