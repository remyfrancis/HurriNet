import type { Metadata } from "next"
import { IncidentList } from "@/app/incidents/list/incident-list"



export const metadata: Metadata = {
  title: "Incident List",
  description: "View all reported incidents",
}

export default function IncidentListPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Incident Reports</h3>
          <p className="text-sm text-muted-foreground">View and manage all reported incidents.</p>
        </div>
        <IncidentList />
      </div>
    </div>
  )
}

