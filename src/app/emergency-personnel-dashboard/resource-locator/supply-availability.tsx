import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

async function getSupplyAvailability() {
  // TODO: Implement actual API call to fetch supply availability data
  // This is mock data
  return [
    { id: 1, name: 'Water', available: 75 },
    { id: 2, name: 'Food', available: 60 },
    { id: 3, name: 'Medical Supplies', available: 85 },
    { id: 4, name: 'Blankets', available: 50 },
  ]
}

export default async function SupplyAvailability() {
  const supplies = await getSupplyAvailability()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Availability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {supplies.map((supply) => (
            <div key={supply.id} className="space-y-2">
              <div className="flex justify-between">
                <span>{supply.name}</span>
                <span>{supply.available}%</span>
              </div>
              <Progress value={supply.available} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

