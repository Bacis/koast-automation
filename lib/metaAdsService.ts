import axios, { AxiosResponse } from 'axios';
import { Campaign, CampaignInsights, META_ADS_CONFIG, INSIGHT_FIELDS } from '@/types';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: META_ADS_CONFIG.baseUrl,
  headers: {
    'Authorization': `Bearer ${META_ADS_CONFIG.bearerToken}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export class MetaAdsService {
  /**
   * Fetch campaign data by campaign ID
   */
  static async getCampaign(campaignId: string): Promise<Campaign> {
    try {
      const fields = 'id,name,status,objective,created_time,updated_time';
      const response: AxiosResponse<Campaign> = await apiClient.get(
        `/${campaignId}?fields=${fields}`
      );
      
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch campaign ${campaignId}:`, error);
      throw new Error(`Failed to fetch campaign data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch campaign insights by campaign ID
   */
  static async getCampaignInsights(
    campaignId: string, 
    datePreset: string = 'last_month'
  ): Promise<CampaignInsights | null> {
    try {
      const fields = INSIGHT_FIELDS.join(',');
      const response = await apiClient.get(
        `/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}`
      );
      
      // Meta Ads API returns insights in a data array
      const data = response.data;
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data[0] as CampaignInsights;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch insights for campaign ${campaignId}:`, error);
      // Don't throw here as insights might not be available for all campaigns
      return null;
    }
  }

  /**
   * Fetch multiple campaigns (for future expansion)
   */
  static async getCampaigns(campaignIds: string[]): Promise<Campaign[]> {
    try {
      const campaigns = await Promise.allSettled(
        campaignIds.map(id => this.getCampaign(id))
      );

      return campaigns
        .filter((result): result is PromiseFulfilledResult<Campaign> => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw new Error(`Failed to fetch campaigns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simulate campaign action execution (since we can't actually modify campaigns through the proxy)
   */
  static async executeAction(campaignId: string, action: string, parameters?: Record<string, string | number | boolean>): Promise<{
    success: boolean;
    action: string;
    timestamp: Date;
    simulated: boolean;
  }> {
    console.log(`🎯 AUTOMATION ACTION TRIGGERED:`);
    console.log(`Campaign ID: ${campaignId}`);
    console.log(`Action: ${action}`);
    console.log(`Parameters:`, parameters);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Simulate the API call that would be made in a real implementation
    let apiCallThatWouldBeMade;
    
    switch (action) {
      case 'PAUSE_CAMPAIGN':
        apiCallThatWouldBeMade = {
          method: 'POST',
          url: `https://graph.facebook.com/v18.0/${campaignId}`,
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'PAUSED' })
        };
        break;
        
      case 'ADJUST_BUDGET':
        apiCallThatWouldBeMade = {
          method: 'POST',
          url: `https://graph.facebook.com/v18.0/${campaignId}`,
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            daily_budget: parameters?.newBudget || 10000 // Budget in cents
          })
        };
        break;
        
      case 'SEND_NOTIFICATION':
        apiCallThatWouldBeMade = {
          method: 'POST',
          url: 'https://your-notification-service.com/notify',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: parameters?.message || `Campaign ${campaignId} triggered automation rule`,
            campaignId,
            timestamp: new Date().toISOString()
          })
        };
        break;
        
      default:
        apiCallThatWouldBeMade = {
          method: 'POST',
          url: `https://graph.facebook.com/v18.0/${campaignId}`,
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            // Generic action parameters
            ...parameters
          })
        };
    }
    
    console.log(`📡 API Call that would be made:`, apiCallThatWouldBeMade);
    
    // Return success simulation
    return { 
      success: true, 
      action, 
      timestamp: new Date(),
      simulated: true
    };
  }

  /**
   * Test API connectivity
   */
  static async testConnection(): Promise<boolean> {
    try {
      // Test with the sample campaign ID
      await this.getCampaign(META_ADS_CONFIG.sampleCampaignId);
      console.log('✅ Meta Ads API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Meta Ads API connection failed:', error);
      return false;
    }
  }

  /**
   * Calculate additional metrics from insights data
   */
  static calculateMetrics(insights: CampaignInsights | null) {
    if (!insights) {
      return {
        roas: null,
        costPerAction: null,
        conversionRate: null
      };
    }

    const spend = parseFloat(insights.spend);
    const clicks = parseInt(insights.clicks);
    
    // Find purchase/conversion actions
    const purchaseActions = insights.actions?.find(
      action => action.action_type === 'omni_initiated_checkout' || 
                action.action_type === 'initiate_checkout' ||
                action.action_type === 'offsite_conversion.fb_pixel_initiate_checkout'
    );
    
    const conversions = purchaseActions ? parseInt(purchaseActions.value) : 0;
    const revenue = conversions * 50; // Assume $50 average order value for demo
    
    return {
      roas: spend > 0 ? revenue / spend : null,
      costPerAction: conversions > 0 ? spend / conversions : null,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : null
    };
  }
} 