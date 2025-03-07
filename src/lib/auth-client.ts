// Update or create this file
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
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
    setAuthToken(`Bearer ${data.access}`)
    return data.access
  } catch (error) {
    // If refresh fails, redirect to login
    removeAuthToken()
    localStorage.removeItem('refreshToken')
    window.location.href = '/auth/login'
    throw error
  }
}

export async function getCurrentUser() {
  const token = getAuthToken()
  
  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user_accounts/me/`, {
      headers: {
        'Authorization': token,
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