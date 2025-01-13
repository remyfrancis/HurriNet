import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const nonMedicalSupplies = [
  { name: "Bed Linens", category: "Bedding", stock: 1000, reorderPoint: 500, status: "Adequate" },
  { name: "Cleaning Supplies", category: "Sanitation", stock: 500, reorderPoint: 200, status: "Adequate" },
  { name: "Patient Gowns", category: "Clothing", stock: 300, reorderPoint: 150, status: "Low" },
  { name: "Office Supplies", category: "Administrative", stock: 1000, reorderPoint: 300, status: "Adequate" },
  { name: "Food Supplies", category: "Nutrition", stock: 2000, reorderPoint: 1000, status: "Low" },
]

export default function NonMedicalSupplies() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Non-Medical Supplies</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonMedicalSupplies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adequate Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonMedicalSupplies.filter(item => item.status === "Adequate").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nonMedicalSupplies.filter(item => item.status === "Low").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(nonMedicalSupplies.map(item => item.category)).size}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Non-Medical Supplies Inventory</CardTitle>
          <CardDescription>Current stock levels and status of non-medical supplies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonMedicalSupplies.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Adequate" ? "default" : "destructive"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={(item.stock / item.reorderPoint) * 100} className="w-[60%]" />
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

