import { cookies } from 'next/headers'

export async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get('accessToken')?.value
}

export async function isAuthenticated() {
  return !!(await getAuthToken())
}

export async function getCurrentUser() {
  const token = await getAuthToken()
  
  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_accounts/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  
  if (!refreshToken) {
    throw new Error('No refresh token found')
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/accounts/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    localStorage.setItem('accessToken', `Bearer ${data.access}`)
    return data.access
  } catch (error) {
    // If refresh fails, redirect to login
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/auth/login'
    throw error
  }
}

export function getAuthTokenClient() {
  return localStorage.getItem('accessToken')
}

export function isAuthenticatedClient() {
  return !!getAuthTokenClient()
}

