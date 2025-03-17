import { NextRequest, NextResponse } from 'next/server';

// The backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Build the backend URL - Use the correct URL structure from the Django backend
    const backendUrl = `${BACKEND_URL}/api/resource-management/test/`;
    
    console.log('Testing backend connectivity at:', backendUrl);

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If the response is not OK, throw an error
    if (!response.ok) {
      console.error('Backend API test failed:', response.status);
      return NextResponse.json(
        { error: 'Backend API test failed' },
        { status: response.status }
      );
    }

    // Return the response data
    const data = await response.json();
    console.log('Backend API test succeeded:', data);
    return NextResponse.json({
      ...data,
      frontend_message: 'Frontend API is also working correctly'
    });
  } catch (error) {
    console.error('Error in test API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 