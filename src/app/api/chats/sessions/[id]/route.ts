import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chats/sessions/${params.id}/`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Backend error:", {
        status: response.status,
        statusText: response.statusText,
        data: error,
      });
      return NextResponse.json(
        { error: "Failed to fetch chat session" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
} 