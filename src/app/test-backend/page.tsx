'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestBackendPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [suppliersTestResult, setSuppliersTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suppliersError, setSuppliersError] = useState<string | null>(null)

  const testBackend = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/test-backend')
      const data = await response.json()
      
      setTestResult(data)
    } catch (error) {
      console.error('Error testing backend:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testSuppliersAPI = async () => {
    setSuppliersLoading(true)
    setSuppliersError(null)
    
    try {
      const response = await fetch('/api/test-suppliers')
      const data = await response.json()
      
      setSuppliersTestResult(data)
    } catch (error) {
      console.error('Error testing suppliers API:', error)
      setSuppliersError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setSuppliersLoading(false)
    }
  }

  // Test on page load
  useEffect(() => {
    testBackend()
    testSuppliersAPI()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General API Test</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers API Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>General API Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Testing connection to backend...</p>
              ) : error ? (
                <div>
                  <p className="text-red-500">Error: {error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={testBackend}
                  >
                    Retry
                  </Button>
                </div>
              ) : testResult ? (
                <div>
                  {testResult.success ? (
                    <p className="text-green-500">✅ Successfully connected to backend</p>
                  ) : (
                    <p className="text-amber-500">❌ Failed to connect to backend</p>
                  )}
                  
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>No test results yet</p>
              )}
            </CardContent>
          </Card>
          
          <Button onClick={testBackend} disabled={loading}>
            {loading ? 'Testing...' : 'Test Backend Connection'}
          </Button>
        </TabsContent>
        
        <TabsContent value="suppliers">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Suppliers API Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <p>Testing connection to suppliers API...</p>
              ) : suppliersError ? (
                <div>
                  <p className="text-red-500">Error: {suppliersError}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={testSuppliersAPI}
                  >
                    Retry
                  </Button>
                </div>
              ) : suppliersTestResult ? (
                <div>
                  {suppliersTestResult.success ? (
                    <p className="text-green-500">✅ Successfully connected to suppliers API</p>
                  ) : (
                    <p className="text-amber-500">❌ Failed to connect to suppliers API</p>
                  )}
                  
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(suppliersTestResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p>No test results yet</p>
              )}
            </CardContent>
          </Card>
          
          <Button onClick={testSuppliersAPI} disabled={suppliersLoading}>
            {suppliersLoading ? 'Testing...' : 'Test Suppliers API Connection'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
} 