import { NextRequest, NextResponse } from 'next/server';

// The backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(
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
    
    // Build the backend URL - Use the correct URL structure from the Django backend
    const backendUrl = `${BACKEND_URL}/api/resource-management/distributions/${id}/`;
    
    console.log('Fetching distribution from backend URL:', backendUrl);

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // If the response is not OK, throw an error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Backend API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch distribution' },
        { status: response.status }
      );
    }

    // Return the response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distribution API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const backendUrl = `${BACKEND_URL}/api/resource-management/distributions/${id}/`;
    
    console.log('Updating distribution at backend URL:', backendUrl, body);

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'PUT',
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
        { error: errorData.detail || 'Failed to update distribution' },
        { status: response.status }
      );
    }

    // Return the response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distribution update API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Build the backend URL - Use the correct URL structure from the Django backend
    const backendUrl = `${BACKEND_URL}/api/resource-management/distributions/${id}/`;
    
    console.log('Deleting distribution from backend URL:', backendUrl);

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // If the response is not OK, throw an error
    if (!response.ok) {
      // For DELETE operations, a 204 No Content response is common and doesn't have a JSON body
      if (response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend API error:', response.status, errorData);
        return NextResponse.json(
          { error: errorData.detail || 'Failed to delete distribution' },
          { status: response.status }
        );
      }
    }

    // For successful DELETE operations (204 No Content)
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // For other successful responses that might have a body
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distribution delete API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 