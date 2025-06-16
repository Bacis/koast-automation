import { AutomationEngine } from '@/lib/automationEngine';
import { ApiResponse } from '@/types';

export async function GET() {
  try {
    const stats = AutomationEngine.getStats();
    
    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
      message: 'Automation statistics retrieved successfully'
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching automation stats:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch automation statistics'
    };

    return Response.json(response, { status: 500 });
  }
} 