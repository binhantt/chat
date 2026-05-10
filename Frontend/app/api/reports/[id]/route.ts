import { NextRequest, NextResponse } from 'next/server';

// Mock data - in production, this would connect to the actual backend
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const report = mockReports.find(r => r.id === params.id);
    
    if (!report) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    // In a real implementation, this would check for admin role
    const isAdmin = true; // This would come from authentication
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Only admins can view reports' },
        { status: 403 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    if (!body.status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    const reportIndex = mockReports.findIndex(r => r.id === params.id);
    
    if (reportIndex === -1) {
      return NextResponse.json(
        { message: 'Report not found' },
        { status: 404 }
      );
    }

    // In a real implementation, this would check for admin role
    const isAdmin = true; // This would come from authentication
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Only admins can update reports' },
        { status: 403 }
      );
    }

    // Update report status
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status: body.status,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(mockReports[reportIndex]);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}