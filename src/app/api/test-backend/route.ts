import { NextRequest, NextResponse } from 'next/server';

// Make sure the URL is correctly formatted with no trailing slash
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// The correct API path for the test endpoint
const API_PATH = '/resource-management/test/';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing connection to backend:', BACKEND_URL);
    
    // Try to connect to the Django backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${BACKEND_URL}${API_PATH}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Backend test response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend test error response:', errorText);
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
      console.log('Successfully connected to backend');
      
      // Return the response
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to backend',
        backendUrl: BACKEND_URL,
        backendResponse: data
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return NextResponse.json(
          { 
            error: 'Request to backend timed out after 5 seconds',
            url: `${BACKEND_URL}${API_PATH}`
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error connecting to backend:', error);
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
        error: 'Failed to connect to backend', 
        message: errorMessage,
        stack: errorStack,
        url: `${BACKEND_URL}${API_PATH}`
      },
      { status: 500 }
    );
  }
} 