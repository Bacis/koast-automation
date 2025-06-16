'use client';

import { useState, useEffect, useCallback } from 'react';
import { CampaignWithInsights, AutomationRule, AutomationLog } from '@/types';
import { CampaignCard } from '@/components/CampaignCard';
import { AutomationRules } from '@/components/AutomationRules';
import { AutomationLogs } from '@/components/AutomationLogs';
import { CreateRuleModal } from '@/components/CreateRuleModal';
import { automationScheduler } from '@/lib/scheduler';

export default function Dashboard() {
  const [campaignData, setCampaignData] = useState<CampaignWithInsights | null>(null);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logsUpdating, setLogsUpdating] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState(automationScheduler.getStatus());
  const [lastLogCount, setLastLogCount] = useState(0);
  const [newLogsIndicator, setNewLogsIndicator] = useState(false);

  // Fetch campaign data
  const fetchCampaignData = useCallback(async () => {
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      if (result.success) {
        setCampaignData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
    }
  }, []);

  // Fetch automation rules
  const fetchAutomationRules = useCallback(async () => {
    try {
      const response = await fetch('/api/automation/rules');
      const result = await response.json();
      if (result.success) {
        setAutomationRules(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch automation rules:', error);
    }
  }, []);

  // Fetch automation logs with reactive updates
  const fetchAutomationLogs = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLogsUpdating(true);
      }
      
      const response = await fetch('/api/automation/execute');
      const result = await response.json();
      
      if (result.success) {
        const newLogs = result.data;
        
        // Check if we have new logs
        if (newLogs.length > lastLogCount && lastLogCount > 0) {
          setNewLogsIndicator(true);
          // Hide the indicator after 3 seconds
          setTimeout(() => setNewLogsIndicator(false), 3000);
        }
        
        setAutomationLogs(newLogs);
        setLastLogCount(newLogs.length);
      }
    } catch (error) {
      console.error('Failed to fetch automation logs:', error);
    } finally {
      if (showLoading) {
        setLogsUpdating(false);
      }
    }
  }, [lastLogCount]);

  // Separate polling function to avoid any loading state interference
  const pollAutomationLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/automation/execute');
      const result = await response.json();
      
      if (result.success) {
        const newLogs = result.data;
        
        // Check if we have new logs (only update state if there are actually new logs)
        if (newLogs.length > automationLogs.length) {
          setNewLogsIndicator(true);
          setAutomationLogs(newLogs);
          setLastLogCount(newLogs.length);
          // Hide the indicator after 3 seconds
          setTimeout(() => setNewLogsIndicator(false), 3000);
        }
      }
    } catch (error) {
      // Silently handle polling errors to avoid spam
      console.log('Polling error (normal):', error instanceof Error ? error.message : 'Unknown error');
    }
  }, [automationLogs.length]);

  // Load data without main loading state (for refreshes)
  const loadData = useCallback(async () => {
    await Promise.all([
      fetchCampaignData(),
      fetchAutomationRules(),
      fetchAutomationLogs()
    ]);
  }, [fetchCampaignData, fetchAutomationRules, fetchAutomationLogs]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Execute automation manually
  const executeAutomation = async () => {
    try {
      setLogsUpdating(true); // Only update logs section, not whole page
      const response = await fetch('/api/automation/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: [campaignData?.campaign.id] })
      });
      
      const result = await response.json();
      if (result.success) {
        // Update logs immediately after execution
        await fetchAutomationLogs(false); // Don't show additional loading
        await fetchCampaignData();
      }
    } catch (error) {
      console.error('Failed to execute automation:', error);
    } finally {
      setLogsUpdating(false);
    }
  };

  // Handle rule creation
  const handleRuleCreated = async () => {
    setShowCreateRuleModal(false);
    await fetchAutomationRules();
  };

  // Handle rule deletion
  const handleRuleDeleted = async (ruleId: string) => {
    try {
      const response = await fetch(`/api/automation/rules?ruleId=${ruleId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchAutomationRules();
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  // Update scheduler status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSchedulerStatus(automationScheduler.getStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Reactive logs polling - fetch logs every 10 seconds (only after initial load)
  useEffect(() => {
    if (initialLoading) return; // Don't start polling during initial load
    
    const logsPollingInterval = setInterval(() => {
      pollAutomationLogs();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(logsPollingInterval);
  }, [pollAutomationLogs, initialLoading]);

  // Initial data load - only runs once
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchCampaignData(),
        fetchAutomationRules(),
        fetchAutomationLogs()
      ]);
      setInitialLoading(false);
    };
    
    loadInitialData();
  }, []); // Empty dependency array - only runs once on mount

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Meta Ads Automation Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meta Ads Automation</h1>
              <p className="text-gray-600">Automated campaign management and optimization</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${schedulerStatus.isRunning ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-600">
                  Scheduler {schedulerStatus.isRunning ? 'Active' : 'Inactive'}
                  {schedulerStatus.isRunning && ` (${schedulerStatus.intervalMinutes}min)`}
                </span>
              </div>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </button>
              <button
                onClick={executeAutomation}
                disabled={logsUpdating || !campaignData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {logsUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Running...
                  </>
                ) : (
                  'Run Automation'
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Campaign Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Campaign Overview</h2>
              </div>
              <div className="p-6">
                {campaignData ? (
                  <CampaignCard campaign={campaignData} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No campaign data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Automation Logs */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    Recent Automation Activity
                    {newLogsIndicator && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                        New Activity
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center space-x-2">
                    {logsUpdating && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </div>
                    )}
                    <button
                      onClick={() => fetchAutomationLogs(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className={`transition-all duration-300 ${logsUpdating ? 'opacity-75' : 'opacity-100'}`}>
                  <AutomationLogs logs={automationLogs} />
                </div>
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Automation Rules</h2>
                <button
                  onClick={() => setShowCreateRuleModal(true)}
                  disabled={!campaignData}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  + Add Rule
                </button>
              </div>
              <div className="p-6">
                <AutomationRules 
                  rules={automationRules} 
                  onDeleteRule={handleRuleDeleted}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Rules</span>
                  <span className="font-medium text-gray-900">{automationRules.filter(r => r.isActive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Executions</span>
                  <span className="font-medium text-gray-900 transition-all duration-300">
                    {automationLogs.length}
                    {newLogsIndicator && (
                      <span className="ml-1 text-green-600">↗</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Triggered Actions</span>
                  <span className="font-medium text-gray-900">{automationLogs.filter(l => l.triggered).length}</span>
                </div>
                {campaignData?.insights && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Campaign Spend</span>
                      <span className="font-medium text-gray-900">${campaignData.insights.spend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CTR</span>
                      <span className="font-medium text-gray-900">{campaignData.insights.ctr}%</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Live Status Indicator */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated:</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Rule Modal */}
      {showCreateRuleModal && campaignData && (
        <CreateRuleModal
          campaignId={campaignData.campaign.id}
          onClose={() => setShowCreateRuleModal(false)}
          onRuleCreated={handleRuleCreated}
        />
      )}
    </div>
  );
}
