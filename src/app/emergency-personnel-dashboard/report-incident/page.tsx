import { Metadata } from 'next'
import ReportIncidentForm from './report-incident-form'

export const metadata: Metadata = {
  title: 'Report Incident | HurriNet',
  description: 'Report an incident or emergency situation in your area.',
}

export default function ReportIncidentPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Report an Incident</h1>
      <ReportIncidentForm />
    </div>
  )
}

