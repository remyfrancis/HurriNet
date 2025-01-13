'use server'

import { revalidatePath } from 'next/cache'

export async function reportIncident(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/incidents/`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create incident')
    }

    const data = await response.json()
    revalidatePath('/dashboard/incident-status')

    return {
      success: true,
      trackingId: data.tracking_id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create incident'
    }
  }
}

