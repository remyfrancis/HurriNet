import { NextRequest, NextResponse } from 'next/server';

// Define the backend URL
const API_URL = 'http://localhost:8000/api/resource-management/suppliers/';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    
    // Create headers for the backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the Django backend
    const response = await fetch(API_URL, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`Error fetching suppliers: ${response.status} ${response.statusText}`);
      
      // Try to get error details from the response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `Error: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.statusText}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Parse the response data
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in suppliers API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers from the backend' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header and body from the request
    const authHeader = request.headers.get('Authorization');
    const body = await request.json();
    
    // Create headers for the backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the Django backend
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`Error creating supplier: ${response.status} ${response.statusText}`);
      
      // Try to get error details from the response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `Error: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.statusText}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Parse the response data
    const data = await response.json();
    
    // Return the data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in suppliers API route:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
} 