'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function TestApiPage() {
  const { token } = useAuth()
  const [results, setResults] = useState<{ [key: string]: any }>({})
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({})

  const testEndpoints = [
    {
      name: 'Django Health Check',
      url: 'http://localhost:8000/health/',
      requiresAuth: false,
      description: 'Basic health check endpoint to verify Django server is running'
    },
    {
      name: 'API Root',
      url: 'http://localhost:8000/api/',
      requiresAuth: false,
      description: 'Django REST Framework API root showing available endpoints'
    },
    {
      name: 'Resource Management Test',
      url: 'http://localhost:8000/api/resource-management/test/',
      requiresAuth: false,
      description: 'Simple test endpoint in the resource management app'
    },
    {
      name: 'Suppliers (Direct to Django)',
      url: 'http://localhost:8000/api/resource-management/suppliers/',
      requiresAuth: true,
      description: 'Direct access to Django suppliers endpoint (requires authentication)'
    },
    {
      name: 'Suppliers (Next.js API Route)',
      url: '/api/resource-management/suppliers/',
      requiresAuth: true,
      description: 'Next.js API route that proxies to Django suppliers endpoint'
    }
  ]

  const testEndpoint = async (endpoint: typeof testEndpoints[0]) => {
    setIsLoading(prev => ({ ...prev, [endpoint.name]: true }))
    setErrors(prev => ({ ...prev, [endpoint.name]: null }))
    
    try {
      const headers: HeadersInit = {}
      if (endpoint.requiresAuth && token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      console.log(`Testing ${endpoint.name} at ${endpoint.url}`)
      console.log('Headers:', headers)
      
      const response = await fetch(endpoint.url, { headers })
      
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = await response.text();
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}\n${errorText}`);
      }
      
      const data = await response.json()
      setResults(prev => ({ ...prev, [endpoint.name]: data }))
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error)
      setErrors(prev => ({ 
        ...prev, 
        [endpoint.name]: error instanceof Error ? error.message : 'Unknown error' 
      }))
    } finally {
      setIsLoading(prev => ({ ...prev, [endpoint.name]: false }))
    }
  }

  return (
    <div className="container p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      <p className="mb-6 text-muted-foreground">
        Use this page to test the connection between the Next.js frontend and Django backend.
        Click the "Test" button for each endpoint to check if it's working correctly.
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {testEndpoints.map(endpoint => (
          <Card key={endpoint.name}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{endpoint.name}</span>
                <Button 
                  size="sm" 
                  onClick={() => testEndpoint(endpoint)}
                  disabled={isLoading[endpoint.name]}
                >
                  {isLoading[endpoint.name] ? 'Testing...' : 'Test'}
                </Button>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <div><strong>URL:</strong> {endpoint.url}</div>
                <div><strong>Auth Required:</strong> {endpoint.requiresAuth ? 'Yes' : 'No'}</div>
                <div><strong>Description:</strong> {endpoint.description}</div>
              </div>
            </CardHeader>
            <CardContent>
              {errors[endpoint.name] ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-md">
                  <div className="font-medium mb-1">Error:</div>
                  <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                    {errors[endpoint.name]}
                  </pre>
                </div>
              ) : results[endpoint.name] ? (
                <div className="p-3 bg-green-50 text-green-700 rounded-md">
                  <div className="font-medium mb-1">Success!</div>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(results[endpoint.name], null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm p-3 bg-gray-50 rounded-md">
                  Click "Test" to check this endpoint
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 