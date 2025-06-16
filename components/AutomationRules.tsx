import { AutomationRule } from '@/types';
import { format } from 'date-fns';

interface AutomationRulesProps {
  rules: AutomationRule[];
  onDeleteRule: (ruleId: string) => void;
}

export function AutomationRules({ rules, onDeleteRule }: AutomationRulesProps) {
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'PAUSE_CAMPAIGN':
        return 'bg-red-100 text-red-800';
      case 'ADJUST_BUDGET':
        return 'bg-blue-100 text-blue-800';
      case 'LOG_EVENT':
        return 'bg-gray-100 text-gray-800';
      case 'SEND_NOTIFICATION':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatConditions = (conditions: AutomationRule['conditions']) => {
    return conditions.map((condition, index) => {
      const isLast = index === conditions.length - 1;
      const nextCondition = conditions[index + 1];
      const logicalOperator = nextCondition?.logicalOperator || 'AND';
      
      return (
        <span key={condition.id} className="inline-flex items-center">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
            {condition.field} {condition.operator} {condition.value}
          </span>
          {!isLast && (
            <span className="mx-2 text-xs font-medium text-gray-500">
              {logicalOperator}
            </span>
          )}
        </span>
      );
    });
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules</h3>
        <p className="text-gray-500">Create your first automation rule to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`border rounded-lg p-4 ${
            rule.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-gray-900">{rule.name}</h4>
                <div className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              {rule.description && (
                <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(rule.action.type)}`}>
                {formatActionType(rule.action.type)}
              </span>
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="text-red-600 hover:text-red-800 text-sm"
                title="Delete rule"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-2">CONDITIONS:</p>
            <div className="flex flex-wrap gap-1">
              {formatConditions(rule.conditions)}
            </div>
          </div>

          {/* Action Details */}
          {rule.action.parameters && Object.keys(rule.action.parameters).length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-2">ACTION PARAMETERS:</p>
              <div className="bg-white rounded p-2 text-xs">
                {Object.entries(rule.action.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rule Metadata */}
          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
            <div>
              <span>Created: {format(new Date(rule.createdAt), 'MMM d, yyyy')}</span>
              {rule.lastTriggered && (
                <span className="ml-4">
                  Last triggered: {format(new Date(rule.lastTriggered), 'MMM d, yyyy HH:mm')}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Campaign: {rule.campaignId}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 