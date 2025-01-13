import { refreshToken } from "./auth"

// lib/api.ts
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
    let token = localStorage.getItem('accessToken')
  
    if (!token) {
      window.location.href = '/auth/login'
      throw new Error('No authentication token found')
    }
  
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })
  
    if (response.status === 401) {
      try {
        // Try to refresh the token
        await refreshToken()
        token = localStorage.getItem('accessToken')
        
        // Retry the original request with new token
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        window.location.href = '/auth/login'
        throw error
      }
    }
  
    return response
  }