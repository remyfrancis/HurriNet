import { notFound } from 'next/navigation'
import IncidentDetails from '@/components/Incidents/IncidentDetails'

async function getIncidentStatus(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/${id}/`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching incident:', error);
    return null;
  }
}

interface PageProps {
  params: { id: string }
}

export default async function IncidentStatusPage({ params }: PageProps) {
  const { id } = params
  const incident = await getIncidentStatus(id)

  if (!incident) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Status</h1>
      <IncidentDetails incident={incident} />
    </div>
  )
}

