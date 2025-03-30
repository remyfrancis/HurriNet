import { NextRequest, NextResponse } from 'next/server';

// The backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Ensure we have a valid ID
    const id = params.id;
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'Invalid distribution ID' },
        { status: 400 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    
    // Build the backend URL - Use the correct URL structure from the Django backend
    const backendUrl = `${BACKEND_URL}/api/resource-management/distributions/${id}/update_completion/`;
    
    console.log('Updating distribution completion at backend URL:', backendUrl, body);

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // If the response is not OK, throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to update distribution completion' },
        { status: response.status }
      );
    }

    // Return the response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distribution update_completion API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 