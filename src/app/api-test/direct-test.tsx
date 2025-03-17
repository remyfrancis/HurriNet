'use client';

import { useState } from 'react';
import { Button, Card, Typography, Box, CircularProgress, Alert, TextField } from '@mui/material';

export default function DirectApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [endpoint, setEndpoint] = useState('/api/resource-management/inventory/with_status/');

  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const fullUrl = `${backendUrl}${endpoint}`;
      console.log('Testing direct backend API at:', fullUrl);
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Direct API test failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Direct API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Direct Backend API Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This test bypasses the Next.js API routes and directly calls the backend API.
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Backend URL"
          variant="outlined"
          fullWidth
          value={backendUrl}
          onChange={(e) => setBackendUrl(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="API Endpoint"
          variant="outlined"
          fullWidth
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          color="warning" 
          onClick={testDirectApi}
          disabled={loading}
          fullWidth
        >
          Test Direct Backend API
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
        <Box>
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
        </Box>
      )}
    </Card>
  );
} 