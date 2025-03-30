import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Get Auth Token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Get allocations data from the frontend request body
    const { allocations } = await request.json();
    if (!allocations || !Array.isArray(allocations)) {
        return NextResponse.json(
            { success: false, error: "Invalid allocations data provided" },
            { status: 400 }
          );
    }

    // 3. Forward the request to Django backend
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/api/resource-management/inventory/apply_optimization/`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allocations }), // Send allocations in the body
    });

    // 4. Handle Backend Response
    const responseData = await response.json();
    if (!response.ok) {
      // Forward the error status and message from Django
      return NextResponse.json(responseData, { status: response.status });
    }

    // 5. Return Success Response
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error in apply-optimization route:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to apply allocations",
      },
      { status: 500 }
    );
  }
} 