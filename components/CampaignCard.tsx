import { CampaignWithInsights } from '@/types';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: CampaignWithInsights;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { campaign: campaignData, insights, calculatedMetrics, lastUpdated } = campaign;

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETED':
        return 'bg-red-100 text-red-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Basic Info */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{campaignData.name}</h3>
          <p className="text-sm text-gray-500 mt-1">ID: {campaignData.id}</p>
          <p className="text-sm text-gray-500">Objective: {campaignData.objective}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaignData.status)}`}>
            {campaignData.status}
          </span>
          <p className="text-xs text-gray-500 mt-2">
            Updated: {format(new Date(lastUpdated), 'MMM d, yyyy HH:mm')}
          </p>
        </div>
      </div>

      {/* Campaign Insights */}
      {insights ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(insights.spend)}
            </div>
            <div className="text-sm text-blue-700">Total Spend</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {formatNumber(insights.clicks)}
            </div>
            <div className="text-sm text-green-700">Clicks</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {formatNumber(insights.impressions)}
            </div>
            <div className="text-sm text-purple-700">Impressions</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">
              {formatPercentage(insights.ctr)}
            </div>
            <div className="text-sm text-orange-700">CTR</div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-indigo-900">
              {formatCurrency(insights.cpc)}
            </div>
            <div className="text-sm text-indigo-700">CPC</div>
          </div>

          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-pink-900">
              {formatCurrency(insights.cpm)}
            </div>
            <div className="text-sm text-pink-700">CPM</div>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-teal-900">
              {formatNumber(insights.reach)}
            </div>
            <div className="text-sm text-teal-700">Reach</div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-900">
              {parseFloat(insights.frequency).toFixed(2)}
            </div>
            <div className="text-sm text-red-700">Frequency</div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-500">No insights data available for this campaign</p>
        </div>
      )}

      {/* Calculated Metrics */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Calculated Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-900">
              {calculatedMetrics.roas !== null ? calculatedMetrics.roas.toFixed(2) : 'N/A'}
            </div>
            <div className="text-sm text-yellow-700">ROAS (Return on Ad Spend)</div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-900">
              {calculatedMetrics.costPerAction !== null 
                ? formatCurrency(calculatedMetrics.costPerAction) 
                : 'N/A'
              }
            </div>
            <div className="text-sm text-emerald-700">Cost per Action</div>
          </div>

          <div className="bg-violet-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-violet-900">
              {calculatedMetrics.conversionRate !== null 
                ? formatPercentage(calculatedMetrics.conversionRate) 
                : 'N/A'
              }
            </div>
            <div className="text-sm text-violet-700">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* Actions Summary */}
      {insights?.actions && insights.actions.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Actions Breakdown</h4>
          <div className="space-y-2">
            {insights.actions.slice(0, 5).map((action, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {action.action_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumber(action.value)}
                </span>
              </div>
            ))}
            {insights.actions.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                +{insights.actions.length - 5} more actions
              </p>
            )}
          </div>
        </div>
      )}

      {/* Campaign Dates */}
      <div className="border-t pt-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="font-medium">{format(new Date(campaignData.created_time), 'MMM d, yyyy HH:mm')}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <p className="font-medium">{format(new Date(campaignData.updated_time), 'MMM d, yyyy HH:mm')}</p>
          </div>
          {insights && (
            <>
              <div>
                <span className="text-gray-500">Data Period Start:</span>
                <p className="font-medium">{format(new Date(insights.date_start), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <span className="text-gray-500">Data Period End:</span>
                <p className="font-medium">{format(new Date(insights.date_stop), 'MMM d, yyyy')}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 