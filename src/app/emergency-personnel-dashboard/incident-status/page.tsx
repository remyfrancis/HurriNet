import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { getDistrict } from '@/lib/location'

async function getIncidents() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch incidents')
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
}

export default async function IncidentStatusPage() {
  const incidents = await getIncidents()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident: any) => (
                <TableRow key={incident.tracking_id}>
                  <TableCell>{incident.tracking_id}</TableCell>
                  <TableCell className="capitalize">{incident.incident_type}</TableCell>
                  <TableCell>{getDistrict(incident.latitude, incident.longitude)}</TableCell>
                  <TableCell className="capitalize">{incident.status}</TableCell>
                  <TableCell>{new Date(incident.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/incident-status/${incident.tracking_id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      View Details
                    </Link>
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