import { NextRequest } from 'next/server';
import { AutomationEngine } from '@/lib/automationEngine';
import { ApiResponse, AutomationLog, META_ADS_CONFIG } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignIds = [META_ADS_CONFIG.sampleCampaignId] } = body;

    if (!Array.isArray(campaignIds)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'campaignIds must be an array'
      };
      return Response.json(response, { status: 400 });
    }

    // Execute automation rules for the specified campaigns
    await AutomationEngine.processAllRules(campaignIds);

    // Get recent logs for the processed campaigns
    const logs = AutomationEngine.getLogs(50).filter(log => 
      campaignIds.includes(log.campaignId)
    );

    const response: ApiResponse<AutomationLog[]> = {
      success: true,
      data: logs,
      message: `Automation execution completed for ${campaignIds.length} campaigns`
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error executing automation:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute automation'
    };

    return Response.json(response, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let logs: AutomationLog[];
    
    if (campaignId) {
      logs = AutomationEngine.getLogsForCampaign(campaignId, limit);
    } else {
      logs = AutomationEngine.getLogs(limit);
    }

    const response: ApiResponse<AutomationLog[]> = {
      success: true,
      data: logs,
      message: `Retrieved ${logs.length} automation logs`
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching automation logs:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch automation logs'
    };

    return Response.json(response, { status: 500 });
  }
} 