import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Creating chat session with:", body);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/sessions/`, {
      method: "POST",
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Backend error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      return NextResponse.json(
        { error: "Failed to create chat session", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 