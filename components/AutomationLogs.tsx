import { AutomationLog } from '@/types';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

interface AutomationLogsProps {
  logs: AutomationLog[];
}

export function AutomationLogs({ logs }: AutomationLogsProps) {
  const [displayLogs, setDisplayLogs] = useState<AutomationLog[]>([]);
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set());

  // Animate new logs appearance
  useEffect(() => {
    if (logs.length > displayLogs.length && displayLogs.length > 0) {
      // New logs added - animate them in (only if we already have logs displayed)
      const newLogs = logs.slice(displayLogs.length);
      const newIds = new Set(newLogs.map(log => log.id));
      
      setNewLogIds(newIds);
      setDisplayLogs(logs);
      
      // Remove highlight after animation
      const timer = setTimeout(() => {
        setNewLogIds(new Set());
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      // Initial load or complete refresh - no animation
      setDisplayLogs(logs);
    }
  }, [logs, displayLogs.length]);

  const getStatusIcon = (triggered: boolean) => {
    if (triggered) {
      return (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'PAUSE_CAMPAIGN':
        return 'bg-red-100 text-red-800';
      case 'ADJUST_BUDGET':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOG_EVENT':
        return 'bg-blue-100 text-blue-800';
      case 'SEND_NOTIFICATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionType = (action: string) => {
    return action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (displayLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg 
          className="w-16 h-16 text-gray-300 mx-auto mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <p className="text-gray-500 text-lg font-medium">No automation activity yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Rules will appear here when they execute
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
          Monitoring campaigns...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Recent Activity Indicator */}
      {displayLogs.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pb-3 border-b border-gray-100">
          <span>Showing {displayLogs.length} recent activities</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Auto-updating</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4 max-h-96 overflow-y-auto px-1">
        {displayLogs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((log) => {
            const isNew = newLogIds.has(log.id);
            
            return (
              <div
                key={log.id}
                className={`
                  relative flex space-x-3 p-4 rounded-lg border transition-all duration-300 ease-out
                  ${log.triggered 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                  }
                  ${isNew 
                    ? 'shadow-lg ring-2 ring-green-200 ring-opacity-50' 
                    : 'hover:shadow-md'
                  }
                `}
                style={{
                  transform: isNew ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center',
                }}
              >
                {/* New badge */}
                {isNew && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium animate-bounce">
                    NEW
                  </div>
                )}
                
                {getStatusIcon(log.triggered)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {formatActionType(log.action)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Campaign: {log.campaignId}
                      </span>
                      {log.triggered && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Triggered
                        </span>
                      )}
                    </div>
                    <time className="flex-shrink-0 text-xs text-gray-500">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </time>
                  </div>
                  
                  <p className={`text-sm ${log.triggered ? 'text-green-800' : 'text-gray-700'}`}>
                    {log.reason}
                  </p>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-800">View details</summary>
                        <div className="grid grid-cols-2 gap-2 mt-2 p-2 bg-white rounded border">
                          {Object.entries(log.metadata).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-500">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {/* Just executed indicator */}
                  {isNew && (
                    <div className="mt-2 flex items-center text-xs text-green-600 font-medium">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Just executed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
      
      {/* Show more indicator if there are many logs */}
      {displayLogs.length > 10 && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">Showing 10 most recent activities</span>
        </div>
      )}
    </div>
  );
} 