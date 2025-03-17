import { NextRequest, NextResponse } from 'next/server';

// Define the backend URL base
const API_BASE_URL = 'http://localhost:8000/api/resource-management/suppliers/';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the supplier ID from the route parameters
    const supplierId = params.id;
    
    // Construct the full URL for the supplier items endpoint
    const apiUrl = `${API_BASE_URL}${supplierId}/items/`;
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    
    // Create headers for the backend request
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the Django backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Check if the response is OK
    if (!response.ok) {
      console.error(`Error fetching supplier items: ${response.status} ${response.statusText}`);
      
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
    console.error('Error in supplier items API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier items from the backend' },
      { status: 500 }
    );
  }
} 