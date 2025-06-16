import { NextRequest } from 'next/server';
import { MetaAdsService } from '@/lib/metaAdsService';
import { ApiResponse, CampaignWithInsights, META_ADS_CONFIG } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId') || META_ADS_CONFIG.sampleCampaignId;

    // Fetch campaign data and insights in parallel
    const [campaign, insights] = await Promise.all([
      MetaAdsService.getCampaign(campaignId),
      MetaAdsService.getCampaignInsights(campaignId)
    ]);

    // Calculate additional metrics
    const calculatedMetrics = MetaAdsService.calculateMetrics(insights);

    const campaignWithInsights: CampaignWithInsights = {
      campaign,
      insights,
      calculatedMetrics,
      lastUpdated: new Date().toISOString()
    };

    const response: ApiResponse<CampaignWithInsights> = {
      success: true,
      data: campaignWithInsights,
      message: 'Campaign data fetched successfully'
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching campaign data:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaign data'
    };

    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignIds } = body;

    if (!Array.isArray(campaignIds)) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'campaignIds must be an array'
      };
      return Response.json(response, { status: 400 });
    }

    const campaignPromises = campaignIds.map(async (campaignId: string) => {
      try {
        const [campaign, insights] = await Promise.all([
          MetaAdsService.getCampaign(campaignId),
          MetaAdsService.getCampaignInsights(campaignId)
        ]);

        const calculatedMetrics = MetaAdsService.calculateMetrics(insights);

        return {
          campaign,
          insights,
          calculatedMetrics,
          lastUpdated: new Date().toISOString()
        } as CampaignWithInsights;
      } catch (error) {
        console.error(`Failed to fetch campaign ${campaignId}:`, error);
        return null;
      }
    });

    const campaigns = await Promise.all(campaignPromises);
    const validCampaigns = campaigns.filter(campaign => campaign !== null);

    const response: ApiResponse<CampaignWithInsights[]> = {
      success: true,
      data: validCampaigns,
      message: `Fetched ${validCampaigns.length} campaigns successfully`
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
    };

    return Response.json(response, { status: 500 });
  }
} 