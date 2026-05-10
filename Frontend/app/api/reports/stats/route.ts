import { NextResponse } from 'next/server';

// Mock data for report statistics
const mockStats = {
  totalReports: 25,
  pendingReports: 8,
  reviewedReports: 12,
  resolvedReports: 5,
};

export async function GET() {
  try {
    // In a real implementation, this would query the database
    // and check for admin role
    const isAdmin = true; // This would come from authentication
    
    if (!isAdmin) {
      return NextResponse.json(
        { message: 'Only admins can view report statistics' },
        { status: 403 }
      );
    }

    return NextResponse.json(mockStats);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}