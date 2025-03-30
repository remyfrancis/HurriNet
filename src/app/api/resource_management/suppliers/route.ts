import { NextRequest, NextResponse } from 'next/server';

// Make sure the URL is correctly formatted with no trailing slash
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// The correct API path for suppliers
const API_PATH = '/resource-management/suppliers/';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    
    const apiUrl = `${BACKEND_URL}${API_PATH}`;
    console.log('Attempting to fetch suppliers from backend:', apiUrl);
    
    // Forward the request to the Django backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return NextResponse.json(
          { error: `Backend returned error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }

      // Get the response data
      const data = await response.json();
      console.log('Successfully fetched suppliers data');
      
      // Return the response
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return NextResponse.json(
          { error: 'Request to backend timed out after 5 seconds' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    // Check for connection refused error
    if (errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Could not connect to backend server', 
          message: 'Make sure the Django server is running at ' + BACKEND_URL,
          details: errorMessage
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from backend', 
        message: errorMessage,
        stack: errorStack 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header and body from the request
    const authHeader = request.headers.get('Authorization');
    const body = await request.json();
    
    const apiUrl = `${BACKEND_URL}${API_PATH}`;
    console.log('Attempting to create supplier in backend:', apiUrl);
    
    // Forward the request to the Django backend with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Backend response status for POST:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response for POST:', errorText);
        return NextResponse.json(
          { error: `Backend returned error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }

      // Get the response data
      const data = await response.json();
      console.log('Successfully created supplier');
      
      // Return the response
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timed out');
        return NextResponse.json(
          { error: 'Request to backend timed out after 5 seconds' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    // Check for connection refused error
    if (errorMessage.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Could not connect to backend server', 
          message: 'Make sure the Django server is running at ' + BACKEND_URL,
          details: errorMessage
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to send data to backend', 
        message: errorMessage,
        stack: errorStack 
      },
      { status: 500 }
    );
  }
} 