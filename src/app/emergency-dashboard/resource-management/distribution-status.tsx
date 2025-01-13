import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

async function getDistributionStatus() {
  // TODO: Implement actual API call to fetch distribution status
  // This is mock data
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  return [
    { id: 1, location: "Castries", totalRequests: 1000, fulfilled: 750 },
    { id: 2, location: "Vieux Fort", totalRequests: 500, fulfilled: 300 },
    { id: 3, location: "Soufrière", totalRequests: 300, fulfilled: 200 },
    { id: 4, location: "Gros Islet", totalRequests: 400, fulfilled: 350 },
  ]
}

export default async function DistributionStatus() {
  const distributionStatus = await getDistributionStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {distributionStatus.map((status) => (
            <div key={status.id} className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{status.location}</span>
                <span className="text-sm text-muted-foreground">
                  {status.fulfilled} / {status.totalRequests} requests fulfilled
                </span>
              </div>
              <Progress value={(status.fulfilled / status.totalRequests) * 100} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

