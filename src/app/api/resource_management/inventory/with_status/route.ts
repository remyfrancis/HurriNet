import { NextRequest, NextResponse } from 'next/server';

// The backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Get any query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    
    // Build the backend URL - Use the correct URL structure from the Django backend
    // Note: Using hyphens in resource-management to match the backend structure
    let backendUrl = `${BACKEND_URL}/api/resource-management/inventory/with_status/`;
    
    // Add query parameters if provided
    const queryParams = new URLSearchParams();
    if (status) {
      queryParams.append('status', status);
    }
    if (location) {
      queryParams.append('location', location);
    }
    
    // Append query parameters to URL if any exist
    const queryString = queryParams.toString();
    if (queryString) {
      backendUrl += `?${queryString}`;
    }

    console.log('Fetching from backend URL:', backendUrl);

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
        { error: errorData.detail || 'Failed to fetch inventory data' },
        { status: response.status }
      );
    }

    // Return the response data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in inventory API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 