import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getCookieHeader(request: Request) {
  return request.headers.get('cookie') || '';
}

async function proxyJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const res = await fetch(`${BACKEND_URL}/api/reports/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: getCookieHeader(request),
      },
      credentials: 'include',
    });

    return proxyJson(res);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { message: 'Da xay ra loi khi lay chi tiet bao cao' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/api/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: getCookieHeader(request),
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    return proxyJson(res);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { message: 'Da xay ra loi khi cap nhat bao cao' },
      { status: 500 },
    );
  }
}
