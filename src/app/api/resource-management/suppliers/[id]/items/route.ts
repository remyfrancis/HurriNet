import { NextRequest, NextResponse } from 'next/server';

// Make sure the URL is correctly formatted with no trailing slash
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

// The correct API path for supplier items
const getApiPath = (supplierId: string) => `/resource-management/suppliers/${supplierId}/items/`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the supplier ID from the route parameters
    const supplierId = params.id;
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    
    const apiUrl = `${BACKEND_URL}${getApiPath(supplierId)}`;
    
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
      
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response for supplier items:', errorText);
        return NextResponse.json(
          { error: `Backend returned error: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        );
      }

      // Get the response data
      const data = await response.json();
      console.log('Successfully fetched supplier items');
      
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
        error: 'Failed to fetch supplier items from backend', 
        message: errorMessage,
        stack: errorStack 
      },
      { status: 500 }
    );
  }
} 