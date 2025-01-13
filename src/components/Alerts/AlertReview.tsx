'use client'

import { useAlert } from '@/contexts/AlertContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, Info } from 'lucide-react'

export default function AlertReview() {
  const { currentAlert, alertLevel } = useAlert()

  if (!currentAlert) return null

  return (
    <Card className="border-2 border-red-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Emergency Alert
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold">{currentAlert.type}</h3>
          <p>{currentAlert.message}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Affected Areas
          </h4>
          <ul className="list-disc list-inside">
            {currentAlert.affectedAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4" />
            Safety Instructions
          </h4>
          <p>{currentAlert.instructions}</p>
        </div>

        <div className="flex gap-4">
          <Button variant="destructive">
            Evacuate Now
          </Button>
          <Button variant="secondary">
            Shelter in Place
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}