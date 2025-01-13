import { cookies } from 'next/headers'

export function getAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('accessToken')?.value
}

export function isAuthenticated() {
  return !!getAuthToken()
}

export async function getCurrentUser() {
  const token = getAuthToken()
  
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