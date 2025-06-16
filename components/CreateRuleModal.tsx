import { useState } from 'react';
import { ActionType, ComparisonOperator, LogicalOperator, AVAILABLE_METRICS, CreateRuleForm } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CreateRuleModalProps {
  campaignId: string;
  onClose: () => void;
  onRuleCreated: () => void;
}

interface ConditionForm {
  tempId: string;
  field: string;
  operator: ComparisonOperator;
  value: number;
  logicalOperator?: LogicalOperator;
}

export function CreateRuleModal({ campaignId, onClose, onRuleCreated }: CreateRuleModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    actionType: 'PAUSE_CAMPAIGN' as ActionType,
    actionParameters: {} as Record<string, string | number | boolean>
  });

  const [conditions, setConditions] = useState<ConditionForm[]>([
    {
      tempId: uuidv4(),
      field: 'spend',
      operator: '>',
      value: 0,
      logicalOperator: undefined
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const comparisonOperators: ComparisonOperator[] = ['>', '<', '>=', '<=', '=', '!='];
  const logicalOperators: LogicalOperator[] = ['AND', 'OR'];
  const actionTypes: ActionType[] = ['PAUSE_CAMPAIGN', 'ADJUST_BUDGET', 'LOG_EVENT', 'SEND_NOTIFICATION'];

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        tempId: uuidv4(),
        field: 'spend',
        operator: '>',
        value: 0,
        logicalOperator: 'AND'
      }
    ]);
  };

  const removeCondition = (tempId: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.tempId !== tempId));
    }
  };

  const updateCondition = (tempId: string, updates: Partial<ConditionForm>) => {
    setConditions(conditions.map(c => 
      c.tempId === tempId ? { ...c, ...updates } : c
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Rule name is required');
      }

      if (conditions.some(c => !c.field || c.value === null || c.value === undefined)) {
        throw new Error('All conditions must be properly filled out');
      }

      // Prepare the rule data
      const ruleData: CreateRuleForm = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        campaignId,
        conditions: conditions.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.value,
          logicalOperator: c.logicalOperator
        })),
        actionType: formData.actionType,
        actionParameters: Object.keys(formData.actionParameters).length > 0 
          ? formData.actionParameters 
          : undefined
      };

      // Submit the rule
      const response = await fetch('/api/automation/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create rule');
      }

      onRuleCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create rule');
    } finally {
      setLoading(false);
    }
  };

  const renderActionParameters = () => {
    switch (formData.actionType) {
      case 'ADJUST_BUDGET':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Budget Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              placeholder="Enter new budget amount"
              onChange={(e) => setFormData({
                ...formData,
                actionParameters: {
                  ...formData.actionParameters,
                  newBudget: parseFloat(e.target.value) || 0
                }
              })}
            />
          </div>
        );
      
      case 'SEND_NOTIFICATION':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter notification message"
              onChange={(e) => setFormData({
                ...formData,
                actionParameters: {
                  ...formData.actionParameters,
                  message: e.target.value
                }
              })}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Create Automation Rule</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border text-gray-600 placeholder-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rule name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border text-gray-600 placeholder-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe what this rule does"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Conditions</h3>
              <button
                type="button"
                onClick={addCondition}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                + Add Condition
              </button>
            </div>

            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <div key={condition.tempId} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metric
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.tempId, { field: e.target.value })}
                      >
                        {AVAILABLE_METRICS.map((metric) => (
                          <option key={metric.key} value={metric.key}>
                            {metric.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Operator
                      </label>
                      <select
                        className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.tempId, { operator: e.target.value as ComparisonOperator })}
                      >
                        {comparisonOperators.map((op) => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.tempId, { value: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="flex items-end">
                      {index < conditions.length - 1 && (
                        <select
                          className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                          value={conditions[index + 1]?.logicalOperator || 'AND'}
                          onChange={(e) => {
                            const nextCondition = conditions[index + 1];
                            if (nextCondition) {
                              updateCondition(nextCondition.tempId, { logicalOperator: e.target.value as LogicalOperator });
                            }
                          }}
                        >
                          {logicalOperators.map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      )}
                      
                      {conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCondition(condition.tempId)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                          title="Remove condition"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Action</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.actionType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    actionType: e.target.value as ActionType,
                    actionParameters: {} // Reset parameters when action type changes
                  })}
                >
                  {actionTypes.map((action) => (
                    <option key={action} value={action}>
                      {action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {renderActionParameters()}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 