import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from 'lucide-react'

async function getActiveAlerts(userId: string) {
  // TODO: Implement actual API call to fetch active alerts for the user's area
  return [
    { id: 1, title: "Hurricane Warning", description: "A hurricane is expected to affect your area within 36 hours." },
    { id: 2, title: "Flash Flood Watch", description: "Be prepared for possible flash flooding in your area." },
  ]
}

export default async function ActiveAlerts({ userId }: { userId: string }) {
  const alerts = await getActiveAlerts(userId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Alerts for Your Area</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

