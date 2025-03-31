'use server'

import { revalidatePath } from 'next/cache'

export async function createAlert(alert: any, token: string) {
  try {
    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create alert')
    }

    const data = await response.json()
    revalidatePath('/admin/alerts')
    revalidatePath('/dashboard')

    return {
      success: true,
      alert: data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create alert'
    }
  }
}

export async function toggleAlert(id: number, active: boolean, token: string) {
  try {
    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${id}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active })
    })

    if (!response.ok) {
      throw new Error('Failed to update alert')
    }

    revalidatePath('/admin/alerts')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update alert' }
  }
}

export async function deleteAlert(id: number, token: string) {
  try {
    if (!token) {
      return { success: false, error: 'Authentication required' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alerts/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete alert')
    }

    revalidatePath('/admin/alerts')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete alert' }
  }
}
