import type { Metadata } from "next"
import { IncidentForm } from "@/components/Incidents/IncidentForm"
import { Separator } from "@/components/Incidents/Separator"


export const metadata: Metadata = {
  title: "Report Incident",
  description: "Report a new disaster incident",
}

export default function IncidentPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Report New Incident</h3>
            <p className="text-sm text-muted-foreground">Fill out the form below to report a new disaster incident.</p>
          </div>
          <Separator />
          <IncidentForm />
        </div>
      </div>
    </div>
  )
}

