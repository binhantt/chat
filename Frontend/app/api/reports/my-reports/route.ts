import { NextRequest, NextResponse } from 'next/server';

// Mock data for user reports
const mockUserReports = [
  {
    id: '1',
    reason: 'spam',
    description: 'User is sending spam messages',
    status: 'pending',
    createdAt: new Date().toISOString(),
    reporter: {
      id: 'current-user',
      fullName: 'Current User',
      email: 'current@example.com'
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
      id: 'current-user',
      fullName: 'Current User',
      email: 'current@example.com'
    },
    reportedUser: {
      id: 'user4',
      fullName: 'Bob Wilson',
      email: 'bob@example.com'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would get the current user from authentication
    const currentUserId = 'current-user';
    
    // Filter reports for the current user
    const userReports = mockUserReports.filter(report => 
      report.reporter.id === currentUserId
    );

    return NextResponse.json(userReports);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}