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