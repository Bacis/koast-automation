import { v4 as uuidv4 } from 'uuid';
import { 
  AutomationRule, 
  RuleCondition, 
  CampaignWithInsights, 
  AutomationLog, 
  ComparisonOperator
} from '@/types';
import { MetaAdsService } from './metaAdsService';

export class AutomationEngine {
  private static logs: AutomationLog[] = [];
  private static rules: AutomationRule[] = [];

  /**
   * Add a new automation rule
   */
  static addRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'updatedAt' | 'conditions'> & { conditions: Omit<RuleCondition, 'id'>[] }): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conditions: rule.conditions.map(condition => ({
        ...condition,
        id: uuidv4()
      }))
    };

    this.rules.push(newRule);
    console.log(`✅ Added automation rule: ${newRule.name} (${newRule.id})`);
    return newRule;
  }

  /**
   * Get all automation rules
   */
  static getRules(): AutomationRule[] {
    return [...this.rules];
  }

  /**
   * Get rules for a specific campaign
   */
  static getRulesForCampaign(campaignId: string): AutomationRule[] {
    return this.rules.filter(rule => rule.campaignId === campaignId && rule.isActive);
  }

  /**
   * Update an existing rule
   */
  static updateRule(ruleId: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return null;

    this.rules[ruleIndex] = {
      ...this.rules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.rules[ruleIndex];
  }

  /**
   * Delete a rule
   */
  static deleteRule(ruleId: string): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.rules.splice(ruleIndex, 1);
    return true;
  }

  /**
   * Evaluate a single condition against campaign data
   */
  private static evaluateCondition(
    condition: RuleCondition, 
    campaignData: CampaignWithInsights
  ): boolean {
    const { field, operator, value } = condition;
    let actualValue: number | null = null;

    // Extract the actual value based on the field
    switch (field) {
      case 'spend':
        actualValue = campaignData.insights ? parseFloat(campaignData.insights.spend) : 0;
        break;
      case 'ctr':
        actualValue = campaignData.insights ? parseFloat(campaignData.insights.ctr) : 0;
        break;
      case 'cpc':
        actualValue = campaignData.insights ? parseFloat(campaignData.insights.cpc) : 0;
        break;
      case 'cpm':
        actualValue = campaignData.insights ? parseFloat(campaignData.insights.cpm) : 0;
        break;
      case 'clicks':
        actualValue = campaignData.insights ? parseInt(campaignData.insights.clicks) : 0;
        break;
      case 'impressions':
        actualValue = campaignData.insights ? parseInt(campaignData.insights.impressions) : 0;
        break;
      case 'reach':
        actualValue = campaignData.insights ? parseInt(campaignData.insights.reach) : 0;
        break;
      case 'frequency':
        actualValue = campaignData.insights ? parseFloat(campaignData.insights.frequency) : 0;
        break;
      case 'roas':
        actualValue = campaignData.calculatedMetrics.roas;
        break;
      case 'costPerAction':
        actualValue = campaignData.calculatedMetrics.costPerAction;
        break;
      case 'conversionRate':
        actualValue = campaignData.calculatedMetrics.conversionRate;
        break;
      default:
        console.warn(`Unknown field: ${field}`);
        return false;
    }

    if (actualValue === null) {
      console.warn(`Could not get value for field: ${field}`);
      return false;
    }

    // Evaluate the condition
    return this.compareValues(actualValue, operator, value);
  }

  /**
   * Compare two values using the specified operator
   */
  private static compareValues(
    actualValue: number, 
    operator: ComparisonOperator, 
    expectedValue: number
  ): boolean {
    switch (operator) {
      case '>':
        return actualValue > expectedValue;
      case '<':
        return actualValue < expectedValue;
      case '>=':
        return actualValue >= expectedValue;
      case '<=':
        return actualValue <= expectedValue;
      case '=':
        return Math.abs(actualValue - expectedValue) < 0.001; // Handle floating point precision
      case '!=':
        return Math.abs(actualValue - expectedValue) >= 0.001;
      default:
        return false;
    }
  }

  /**
   * Evaluate all conditions in a rule using logical operators
   */
  private static evaluateRule(rule: AutomationRule, campaignData: CampaignWithInsights): boolean {
    if (rule.conditions.length === 0) return false;
    if (rule.conditions.length === 1) {
      return this.evaluateCondition(rule.conditions[0], campaignData);
    }

    // Handle multiple conditions with logical operators
    let result = this.evaluateCondition(rule.conditions[0], campaignData);
    
    for (let i = 1; i < rule.conditions.length; i++) {
      const condition = rule.conditions[i];
      const conditionResult = this.evaluateCondition(condition, campaignData);
      
      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else { // Default to AND
        result = result && conditionResult;
      }
    }

    return result;
  }

  /**
   * Execute an automation action
   */
  private static async executeAction(
    rule: AutomationRule, 
    campaignData: CampaignWithInsights
  ): Promise<boolean> {
    try {
      console.log(`🔥 Executing action: ${rule.action.type} for campaign ${campaignData.campaign.id}`);
      
      const result = await MetaAdsService.executeAction(
        campaignData.campaign.id,
        rule.action.type,
        rule.action.parameters
      );

      // Log the execution
      this.logExecution(rule, campaignData, true, `Action executed successfully: ${rule.action.type}`);
      
      // Update rule's last triggered time
      const ruleIndex = this.rules.findIndex(r => r.id === rule.id);
      if (ruleIndex !== -1) {
        this.rules[ruleIndex].lastTriggered = new Date().toISOString();
      }

      return result.success;
    } catch (error) {
      console.error(`Failed to execute action for rule ${rule.id}:`, error);
      this.logExecution(rule, campaignData, false, `Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Log automation execution
   */
  private static logExecution(
    rule: AutomationRule,
    campaignData: CampaignWithInsights,
    triggered: boolean,
    reason: string
  ): void {
    const log: AutomationLog = {
      id: uuidv4(),
      ruleId: rule.id,
      campaignId: campaignData.campaign.id,
      action: rule.action.type,
      triggered,
      reason,
      timestamp: new Date().toISOString(),
      metadata: {
        campaignName: campaignData.campaign.name,
        ruleName: rule.name,
        spend: campaignData.insights?.spend || '0',
        ctr: campaignData.insights?.ctr || '0'
      }
    };

    this.logs.push(log);
    
    // Keep only the last 1000 logs to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Process automation rules for a single campaign
   */
  static async processCampaignRules(campaignData: CampaignWithInsights): Promise<void> {
    const rules = this.getRulesForCampaign(campaignData.campaign.id);
    
    console.log(`🔍 Processing ${rules.length} automation rules for campaign ${campaignData.campaign.id}`);

    for (const rule of rules) {
      try {
        const shouldExecute = this.evaluateRule(rule, campaignData);
        
        if (shouldExecute) {
          console.log(`✅ Rule "${rule.name}" conditions met for campaign ${campaignData.campaign.id}`);
          await this.executeAction(rule, campaignData);
        } else {
          console.log(`⏭️ Rule "${rule.name}" conditions not met for campaign ${campaignData.campaign.id}`);
          this.logExecution(rule, campaignData, false, 'Rule conditions not met');
        }
      } catch (error) {
        console.error(`Error processing rule ${rule.id}:`, error);
        this.logExecution(rule, campaignData, false, `Rule processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Process automation rules for multiple campaigns
   */
  static async processAllRules(campaignIds: string[]): Promise<void> {
    console.log(`🚀 Starting automation processing for ${campaignIds.length} campaigns`);
    
    for (const campaignId of campaignIds) {
      try {
        // Fetch campaign data and insights
        const [campaign, insights] = await Promise.all([
          MetaAdsService.getCampaign(campaignId),
          MetaAdsService.getCampaignInsights(campaignId)
        ]);

        const calculatedMetrics = MetaAdsService.calculateMetrics(insights);
        
        const campaignData: CampaignWithInsights = {
          campaign,
          insights,
          calculatedMetrics,
          lastUpdated: new Date().toISOString()
        };

        await this.processCampaignRules(campaignData);
      } catch (error) {
        console.error(`Failed to process campaign ${campaignId}:`, error);
      }
    }
    
    console.log(`✅ Completed automation processing`);
  }

  /**
   * Get automation logs
   */
  static getLogs(limit: number = 100): AutomationLog[] {
    return this.logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get logs for a specific campaign
   */
  static getLogsForCampaign(campaignId: string, limit: number = 50): AutomationLog[] {
    return this.logs
      .filter(log => log.campaignId === campaignId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Clear all logs (useful for testing)
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get automation statistics
   */
  static getStats() {
    const totalRules = this.rules.length;
    const activeRules = this.rules.filter(rule => rule.isActive).length;
    const totalLogs = this.logs.length;
    const triggeredActions = this.logs.filter(log => log.triggered).length;
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return {
      totalRules,
      activeRules,
      totalLogs,
      triggeredActions,
      recentLogs,
      successRate: totalLogs > 0 ? (triggeredActions / totalLogs) * 100 : 0
    };
  }
} 