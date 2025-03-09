import { getAuthToken, refreshToken } from './auth-client';

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

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = token;
    }
    
    return headers;
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Try to refresh the token
      try {
        await refreshToken();
        // Retry the request with the new token
        return this.handleResponse(response);
      } catch (error) {
        // If refresh fails, throw the original error
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, options: RequestInit = {}) {
    const headers = await this.getHeaders();
    const isFormData = data instanceof FormData;
    
    // Don't include Content-Type header for FormData
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      // Don't stringify FormData
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any, options: RequestInit = {}) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();