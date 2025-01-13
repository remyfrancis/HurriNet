import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const medicalStaff = [
  { name: "Dr. John Smith", role: "Physician", specialty: "Emergency Medicine", status: "On Duty" },
  { name: "Nurse Sarah Johnson", role: "Nurse", specialty: "Critical Care", status: "On Duty" },
  { name: "Dr. Emily Brown", role: "Physician", specialty: "Pediatrics", status: "Off Duty" },
  { name: "Nurse Michael Lee", role: "Nurse", specialty: "Surgery", status: "On Call" },
  { name: "Dr. Lisa Wong", role: "Physician", specialty: "Internal Medicine", status: "On Duty" },
]

export default function MedicalStaff() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Medical Staff</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalStaff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalStaff.filter(staff => staff.status === "On Duty").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalStaff.filter(staff => staff.status === "On Call").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(medicalStaff.map(staff => staff.specialty)).size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medical Staff Roster</CardTitle>
          <CardDescription>Current status and information of medical personnel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medicalStaff.map((staff, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.specialty}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        staff.status === "On Duty" ? "default" : 
                        staff.status === "On Call" ? "secondary" : 
                        "outline"
                      }
                    >
                      {staff.status}
                    </Badge>
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

