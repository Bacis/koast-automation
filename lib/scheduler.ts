import { META_ADS_CONFIG } from '@/types';

class AutomationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private intervalMinutes = 15; // Run every 15 minutes by default
  
  /**
   * Start the automation scheduler
   */
  start(intervalMinutes: number = 15): void {
    if (this.isRunning) {
      console.log('⏰ Automation scheduler is already running');
      return;
    }

    this.intervalMinutes = intervalMinutes;
    console.log(`🚀 Starting automation scheduler - will run every ${intervalMinutes} minutes`);
    
    // Run immediately on start
    this.executeAutomation();
    
    // Schedule recurring executions
    this.intervalId = setInterval(() => {
      this.executeAutomation();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  /**
   * Stop the automation scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Automation scheduler stopped');
  }

  /**
   * Check if scheduler is running
   */
  getStatus(): { isRunning: boolean; intervalMinutes: number; nextRun?: Date } {
    let nextRun: Date | undefined;
    
    if (this.isRunning && this.intervalId) {
      // Estimate next run time (approximate)
      nextRun = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
    }

    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      nextRun
    };
  }

  /**
   * Execute automation for campaigns
   */
  private async executeAutomation(): Promise<void> {
    try {
      console.log('🔄 Scheduler executing automation...');
      
      // In a real application, you would fetch all active campaign IDs
      // For this demo, we'll use the sample campaign ID
      const campaignIds = [META_ADS_CONFIG.sampleCampaignId];
      
      const response = await fetch('/api/automation/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignIds }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Scheduled automation execution completed:', result.message);
      } else {
        console.error('❌ Scheduled automation execution failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error in scheduled automation execution:', error);
    }
  }

  /**
   * Manually trigger automation execution
   */
  async triggerNow(): Promise<boolean> {
    try {
      await this.executeAutomation();
      return true;
    } catch (error) {
      console.error('Failed to trigger automation:', error);
      return false;
    }
  }
}

// Export singleton instance
export const automationScheduler = new AutomationScheduler();

// Browser-side initialization
if (typeof window !== 'undefined') {
  // Auto-start scheduler in browser (for demo purposes)
  // In production, you might want to control this through user settings
  setTimeout(() => {
    automationScheduler.start(15); // Start with 15-minute intervals
  }, 5000); // Wait 5 seconds after page load
} 