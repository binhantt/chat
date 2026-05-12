import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/reports/my-reports`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error fetching my reports:', error);
    return NextResponse.json(
      { message: 'Da xay ra loi khi lay lich su bao cao' },
      { status: 500 },
    );
  }
}
