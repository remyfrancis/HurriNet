import MedicalFacilities from "@/components/MedicalDashboard/MedicalFacilities"
import MedicalStaff from "@/components/MedicalDashboard/MedicalStaff"
import MedicalSupplies from "@/components/MedicalDashboard/MedicalSupplies"
import NonMedicalSupplies from "@/components/MedicalDashboard/NonMedicalSupplies"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"


export default function MedicalDashboard() {
  return (
    <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Medical Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <MedicalFacilities />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Medical Staff</CardTitle>
                </CardHeader>
                <CardContent>
                    <MedicalStaff />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Medical Supplies</CardTitle>
                </CardHeader>
                <CardContent>
                    <MedicalSupplies />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Non-Medical Supplies</CardTitle>
                </CardHeader>
                <CardContent>
                    <NonMedicalSupplies />
                </CardContent>
            </Card>
        </div>
    </div>
  )
}