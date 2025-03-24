import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Fetching users from:", `${process.env.NEXT_PUBLIC_API_URL}/chats/users/`);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/users/`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Backend error:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      return NextResponse.json(
        { error: "Failed to fetch users", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 