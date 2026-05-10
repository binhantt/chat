import { NextRequest, NextResponse } from 'next/server';

// Mock data for development - in production, this would connect to the actual backend
const mockReports = [
  {
    id: '1',
    reason: 'spam',
    description: 'User is sending spam messages',
    status: 'pending',
    createdAt: new Date().toISOString(),
    reporter: {
      id: 'user1',
      fullName: 'John Doe',
      email: 'john@example.com'
    },
    reportedUser: {
      id: 'user2',
      fullName: 'Jane Smith',
      email: 'jane@example.com'
    }
  },
  {
    id: '2',
    reason: 'harassment',
    description: 'User is sending harassing messages',
    status: 'reviewed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reporter: {
      id: 'user3',
      fullName: 'Alice Johnson',
      email: 'alice@example.com'
    },
    reportedUser: {
      id: 'user4',
      fullName: 'Bob Wilson',
      email: 'bob@example.com'
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.reportedUserId || !body.reason) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new report
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      reason: body.reason,
      description: body.description || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      reporter: {
        id: 'current-user', // This would come from authentication
        fullName: 'Current User',
        email: 'current@example.com'
      },
      reportedUser: {
        id: body.reportedUserId,
        fullName: 'Reported User',
        email: 'reported@example.com'
      }
    };

    mockReports.unshift(newReport);

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would check for admin role
    const isAdmin = true; // This would come from authentication
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Only admins can view reports' },
        { status: 403 }
      );
    }

    return NextResponse.json(mockReports);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}