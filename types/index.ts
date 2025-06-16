// Campaign data types based on Meta Ads API response
export interface Campaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  created_time: string;
  updated_time: string;
}

// Campaign insights types based on Meta Ads API response
export interface CampaignInsights {
  spend: string;
  actions?: Action[];
  clicks: string;
  impressions: string;
  ctr: string;
  cpc: string;
  cpm: string;
  reach: string;
  frequency: string;
  date_start: string;
  date_stop: string;
}

export interface Action {
  action_type: string;
  value: string;
}

// Automation rule types
export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '=' | '!=';
export type LogicalOperator = 'AND' | 'OR';
export type ActionType = 'PAUSE_CAMPAIGN' | 'ADJUST_BUDGET' | 'LOG_EVENT' | 'SEND_NOTIFICATION';

export interface RuleCondition {
  id: string;
  field: string; // e.g., 'spend', 'ctr', 'roas', 'cpc'
  operator: ComparisonOperator;
  value: number;
  logicalOperator?: LogicalOperator; // Used when there are multiple conditions
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  conditions: RuleCondition[];
  action: {
    type: ActionType;
    parameters?: Record<string, string | number | boolean>;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
}

// Combined campaign data with insights
export interface CampaignWithInsights {
  campaign: Campaign;
  insights: CampaignInsights | null;
  calculatedMetrics: {
    roas: number | null;
    costPerAction: number | null;
    conversionRate: number | null;
  };
  lastUpdated: string;
}

// Automation execution log
export interface AutomationLog {
  id: string;
  ruleId: string;
  campaignId: string;
  action: ActionType;
  triggered: boolean;
  reason: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types for the frontend
export interface CreateRuleForm {
  name: string;
  description: string;
  campaignId: string;
  conditions: Omit<RuleCondition, 'id'>[];
  actionType: ActionType;
  actionParameters?: Record<string, string | number | boolean>;
}

// Meta Ads API configuration
export const META_ADS_CONFIG = {
  baseUrl: 'https://dev-api.adcopy.ai/challenge-proxy/meta',
  bearerToken: process.env.META_ADS_BEARER_TOKEN || '',
  sampleCampaignId: '120225449479650554'
} as const;

// Available fields for campaign insights
export const INSIGHT_FIELDS = [
  'spend',
  'actions',
  'clicks',
  'impressions',
  'ctr',
  'cpc',
  'cpm',
  'reach',
  'frequency'
] as const;

// Available metrics for rule conditions
export const AVAILABLE_METRICS = [
  { key: 'spend', label: 'Spend ($)', type: 'number' },
  { key: 'ctr', label: 'CTR (%)', type: 'percentage' },
  { key: 'cpc', label: 'CPC ($)', type: 'currency' },
  { key: 'cpm', label: 'CPM ($)', type: 'currency' },
  { key: 'roas', label: 'ROAS', type: 'number' },
  { key: 'clicks', label: 'Clicks', type: 'number' },
  { key: 'impressions', label: 'Impressions', type: 'number' },
  { key: 'reach', label: 'Reach', type: 'number' },
  { key: 'frequency', label: 'Frequency', type: 'number' },
  { key: 'costPerAction', label: 'Cost per Action ($)', type: 'currency' },
  { key: 'conversionRate', label: 'Conversion Rate (%)', type: 'percentage' }
] as const; 