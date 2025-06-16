import { NextRequest } from 'next/server';
import { AutomationEngine } from '@/lib/automationEngine';
import { ApiResponse, AutomationRule, CreateRuleForm } from '@/types';

export async function GET() {
  try {
    const rules = AutomationEngine.getRules();
    
    const response: ApiResponse<AutomationRule[]> = {
      success: true,
      data: rules,
      message: `Retrieved ${rules.length} automation rules`
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch automation rules'
    };

    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRuleForm = await request.json();
    
    // Validate required fields
    if (!body.name || !body.campaignId || !body.conditions || !body.actionType) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Missing required fields: name, campaignId, conditions, actionType'
      };
      return Response.json(response, { status: 400 });
    }

    // Validate conditions
    if (!Array.isArray(body.conditions) || body.conditions.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'At least one condition is required'
      };
      return Response.json(response, { status: 400 });
    }

    // Create the rule
    const newRule = AutomationEngine.addRule({
      name: body.name,
      description: body.description || '',
      campaignId: body.campaignId,
      conditions: body.conditions,
      action: {
        type: body.actionType,
        parameters: body.actionParameters
      },
      isActive: true
    });

    const response: ApiResponse<AutomationRule> = {
      success: true,
      data: newRule,
      message: 'Automation rule created successfully'
    };

    return Response.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create automation rule'
    };

    return Response.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ruleId, ...updates } = body;
    
    if (!ruleId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'ruleId is required'
      };
      return Response.json(response, { status: 400 });
    }

    const updatedRule = AutomationEngine.updateRule(ruleId, updates);
    
    if (!updatedRule) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Rule not found'
      };
      return Response.json(response, { status: 404 });
    }

    const response: ApiResponse<AutomationRule> = {
      success: true,
      data: updatedRule,
      message: 'Automation rule updated successfully'
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error updating automation rule:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update automation rule'
    };

    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ruleId = searchParams.get('ruleId');
    
    if (!ruleId) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'ruleId is required'
      };
      return Response.json(response, { status: 400 });
    }

    const deleted = AutomationEngine.deleteRule(ruleId);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Rule not found'
      };
      return Response.json(response, { status: 404 });
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Automation rule deleted successfully'
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete automation rule'
    };

    return Response.json(response, { status: 500 });
  }
} 