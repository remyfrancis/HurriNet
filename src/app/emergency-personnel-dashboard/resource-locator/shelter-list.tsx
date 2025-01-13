import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

async function getShelters() {
  // TODO: Implement actual API call to fetch shelter data
  // This is mock data
  return [
    { id: 1, name: 'Central Shelter', capacity: 200, currentOccupancy: 150 },
    { id: 2, name: 'North Community Center', capacity: 150, currentOccupancy: 100 },
    { id: 3, name: 'South School Gymnasium', capacity: 180, currentOccupancy: 120 },
  ]
}

export default async function ShelterList() {
  const shelters = await getShelters()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shelter Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Occupancy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shelters.map((shelter) => (
              <TableRow key={shelter.id}>
                <TableCell>{shelter.name}</TableCell>
                <TableCell>{shelter.capacity}</TableCell>
                <TableCell>{shelter.currentOccupancy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

