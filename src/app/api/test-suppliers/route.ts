import { NextRequest, NextResponse } from 'next/server';

// Make sure the URL is correctly formatted with no trailing slash
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// The correct API path for suppliers
const API_PATH = '/resource_management/suppliers/';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing connection to suppliers API:', `${BACKEND_URL}${API_PATH}`);
    
    // Try to connect to the Django backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}${API_PATH}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Suppliers API test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Suppliers API test error response:', errorText);
        return NextResponse.json(
          { 
            error: `Backend returned error: ${response.status} ${response.statusText}`, 
            details: errorText,
            url: `${BACKEND_URL}${API_PATH}`
          },
          { status: response.status }
        );
      }

      // Get the response data
      const data = await response.json();
      console.log('Successfully connected to suppliers API');
      
      // Return the response
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to suppliers API',
        backendUrl: `${BACKEND_URL}${API_PATH}`,
        dataType: typeof data,
        isArray: Array.isArray(data),
        hasFeatures: data && typeof data === 'object' && 'features' in data,
        supplierCount: Array.isArray(data) ? data.length : 
                      (data && typeof data === 'object' && 'features' in data && Array.isArray(data.features)) ? 
                      data.features.length : 0
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return NextResponse.json(
          { 
            error: 'Request to suppliers API timed out after 5 seconds',
            url: `${BACKEND_URL}${API_PATH}`
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error connecting to suppliers API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    // Check for connection refused error
    if (errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Could not connect to backend server', 
          message: 'Make sure the Django server is running at ' + BACKEND_URL,
          details: errorMessage,
          url: `${BACKEND_URL}${API_PATH}`
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to connect to suppliers API', 
        message: errorMessage,
        stack: errorStack,
        url: `${BACKEND_URL}${API_PATH}`
      },
      { status: 500 }
    );
  }
} 