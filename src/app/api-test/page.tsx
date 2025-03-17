'use client';

import { useState, useEffect } from 'react';
import { Button, Card, Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import DirectApiTest from './direct-test';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test');
      
      if (!response.ok) {
        throw new Error(`API test failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test the inventory with status API
  const testInventoryApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resource_management/inventory/with_status');
      
      if (!response.ok) {
        throw new Error(`Inventory API test failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Inventory API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Connectivity Test
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          This page tests the connectivity between the frontend and backend API.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={testApi}
            disabled={loading}
          >
            Test General API
          </Button>
          
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={testInventoryApi}
            disabled={loading}
          >
            Test Inventory API
          </Button>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {result && (
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              API Response:
            </Typography>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '1rem', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Card>
        )}
      </Box>
      
      {/* Direct API Test Component */}
      <DirectApiTest />
    </Container>
  );
} 