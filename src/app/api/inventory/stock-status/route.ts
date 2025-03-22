import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resource_id');

  if (!resourceId) {
    return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 });
  }

  try {
    const token = request.headers.get('Authorization');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventory/stock-status/?resource_id=${resourceId}`, {
      headers: {
        'Authorization': token || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock levels');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock levels' },
      { status: 500 }
    );
  }
} 