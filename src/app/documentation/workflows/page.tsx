'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MermaidDiagram from '@/components/MermaidDiagram'

const DIAGRAMS = {
  incidentReporting: `
    sequenceDiagram
      actor User
      participant Form as Report Form
      participant Map as Location Selector
      participant API as Backend API
      participant DB as Database
      
      User->>Form: Initiates incident report
      Form->>Map: Opens location selector
      Map->>Form: Returns selected coordinates
      User->>Form: Fills incident details
      opt Photo Upload
          User->>Form: Uploads incident photo
      end
      Form->>API: Submits report data
      API->>DB: Stores incident data
      API-->>Form: Returns tracking ID
      Form-->>User: Shows confirmation
  `,
  emergencyAlert: `
    flowchart TD
      A[Weather API] -->|New data| B[Alert System]
      B -->|Check thresholds| C{Alert needed?}
      C -->|Yes| D[Create Alert]
      C -->|No| E[Update status]
      D --> F[Notify Emergency Staff]
      D --> G[Update Dashboard]
      F --> H[Staff Response]
      G --> I[Public Display]
  `,
  resourceManagement: `
    stateDiagram-v2
      [*] --> Available
      Available --> Assigned: Resource Request
      Assigned --> InUse: Deployment
      InUse --> Available: Return
      InUse --> Maintenance: Damage/Issue
      Maintenance --> Available: Repaired
      Available --> Unavailable: Out of Stock
      Unavailable --> Available: Restocked
  `
}

export default function WorkflowsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">System Workflows</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Incident Reporting Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidDiagram diagram={DIAGRAMS.incidentReporting} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Alert Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidDiagram diagram={DIAGRAMS.emergencyAlert} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Management Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <MermaidDiagram diagram={DIAGRAMS.resourceManagement} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
