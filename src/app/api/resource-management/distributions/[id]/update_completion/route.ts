import { NextRequest, NextResponse } from 'next/server';

// The backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== UPDATE COMPLETION API ROUTE START ===');
  console.log('Received params:', params);
  
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('Missing authorization header');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Ensure we have a valid ID
    const id = params.id;
    console.log('Distribution ID from params:', id, 'Type:', typeof id);
    
    if (!id || id === 'undefined') {
      console.log('Invalid distribution ID:', id);
      return NextResponse.json(
        { error: 'Invalid distribution ID' },
        { status: 400 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    console.log('Update completion request body:', body);
    
    // Build the backend URL - Use the correct URL structure from the Django backend
    const backendUrl = `${BACKEND_URL}/api/resource-management/distributions/${id}/update_completion/`;
    
    console.log('Updating distribution completion at backend URL:', backendUrl);
    console.log('Request body being sent to backend:', JSON.stringify(body));

    // Forward the request to the backend
    console.log('Sending request to backend...');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('Backend response status:', response.status);
    console.log('Backend response status text:', response.statusText);

    // If the response is not OK, throw an error
    if (!response.ok) {
      console.log('Backend response not OK');
      let errorMessage = 'Failed to update distribution completion';
      
      try {
        const errorData = await response.json();
        console.error('Backend API error details:', errorData);
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response as JSON:', parseError);
        try {
          const textError = await response.text();
          console.error('Error response as text:', textError);
        } catch (textError) {
          console.error('Could not get error response as text either:', textError);
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Return the response data
    console.log('Backend response OK, parsing JSON...');
    const data = await response.json();
    console.log('Update completion response from backend:', data);
    console.log('=== UPDATE COMPLETION API ROUTE END ===');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in distribution update_completion API route:', error);
    console.log('=== UPDATE COMPLETION API ROUTE END WITH ERROR ===');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 