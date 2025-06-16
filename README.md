# Meta Ads Automation System

A comprehensive automation platform for managing Meta (Facebook) advertising campaigns with custom rule-based automation, real-time monitoring, and intelligent action execution.

## 🎥 Demo Video

[![Meta Ads Automation System Demo](https://img.youtube.com/vi/IhHgVlW-oLg/maxresdefault.jpg)](https://www.youtube.com/watch?v=IhHgVlW-oLg)

**[🎬 Watch the Live Demo](https://www.youtube.com/watch?v=IhHgVlW-oLg)** - See the automation system in action with real campaign data and live rule execution.

## 🎯 Features

### ✅ Core Requirements

- **Automated Campaign Data Tracking**: Fetches campaign data from Meta Ads API at regular intervals
- **Campaign Insights Evaluation**: Retrieves essential metrics (Spend, ROAS, CTR, CPC, etc.)
- **Customizable Automation Rules**: Define complex rules with AND/OR conditional logic
- **Automated Action Execution**: Trigger actions based on rule conditions

### 🚀 Advanced Features

- **Real-time Dashboard**: Live campaign monitoring with beautiful visualizations
- **Automated Scheduler**: Runs automation checks every 15 minutes automatically
- **Comprehensive Logging**: Track all automation executions with detailed logs
- **Custom Metrics**: Calculate ROAS, Cost per Action, and Conversion Rate
- **Rule Management**: Create, update, delete, and monitor automation rules
- **Responsive UI**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Backend (Next.js API Routes)
- **MetaAdsService**: Handles all Meta Ads API interactions
- **AutomationEngine**: Evaluates rules and executes actions
- **Scheduler**: Manages automated execution intervals
- **API Routes**: RESTful endpoints for frontend communication

### Frontend (React Components)
- **Dashboard**: Main interface showing campaigns and automation status
- **CampaignCard**: Detailed campaign metrics and insights
- **AutomationRules**: Rule management interface
- **CreateRuleModal**: Dynamic rule creation with validation
- **AutomationLogs**: Execution history and status tracking

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd koast-ai-chlng
npm install
```

2. **Environment setup:**
Create a `.env.local` file in the project root:
```bash
# Meta Ads API Configuration
META_ADS_BEARER_TOKEN=7FcUS8sCTBDGE4EaScY5CEsIAoe9dTJLwIzV4gGM3BY7dz1
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open browser:**
Navigate to `http://localhost:3000`

## 📊 API Integration

The application uses the provided Meta Ads API proxy:

```typescript
const META_ADS_CONFIG = {
  baseUrl: 'https://dev-api.adcopy.ai/challenge-proxy/meta',
  bearerToken: process.env.META_ADS_BEARER_TOKEN,
  sampleCampaignId: '120225449479650554'
};
```

### API Endpoints Used:
- `GET /{campaignId}?fields=...` - Campaign data
- `GET /{campaignId}/insights?fields=...` - Campaign insights

## 🎛️ Automation Rules

### Rule Structure
```typescript
interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  conditions: RuleCondition[];
  action: {
    type: ActionType;
    parameters?: Record<string, any>;
  };
  isActive: boolean;
}
```

### Available Conditions
- **Spend**: Total campaign spend ($)
- **CTR**: Click-through rate (%)
- **CPC**: Cost per click ($)
- **CPM**: Cost per mille ($)
- **ROAS**: Return on ad spend
- **Clicks**: Total clicks
- **Impressions**: Total impressions
- **Reach**: Unique reach
- **Frequency**: Average frequency
- **Cost per Action**: Cost per conversion ($)
- **Conversion Rate**: Conversion percentage (%)

### Available Actions
- **PAUSE_CAMPAIGN**: Pauses the campaign
- **ADJUST_BUDGET**: Modifies campaign budget
- **LOG_EVENT**: Creates a log entry
- **SEND_NOTIFICATION**: Sends notification

### Example Rules

**High Spend Alert:**
```
IF Spend > $500 THEN Send Notification
```

**Performance Optimization:**
```
IF (CTR < 1% AND Spend > $100) OR ROAS < 2 THEN Pause Campaign
```

**Budget Management:**
```
IF ROAS > 4 AND Spend < $200 THEN Adjust Budget to $300
```

## 🔄 Automation Scheduler

The system includes an intelligent scheduler that:
- Runs every 15 minutes automatically
- Fetches latest campaign data
- Evaluates all active rules
- Executes qualifying actions
- Logs all activities

**Manual Execution:**
```typescript
// Trigger automation manually
await automationScheduler.triggerNow();
```

## 📈 Metrics & Calculations

### Calculated Metrics
- **ROAS**: `Revenue / Spend`
- **Cost per Action**: `Spend / Conversions`
- **Conversion Rate**: `(Conversions / Clicks) * 100`

### Data Sources
- **Direct from API**: Spend, CTR, CPC, CPM, Clicks, Impressions, Reach, Frequency
- **Calculated**: ROAS, Cost per Action, Conversion Rate
- **Action Tracking**: Conversions from actions array

## 🛠️ Development

### Project Structure
```
├── app/
│   ├── api/
│   │   ├── campaigns/          # Campaign data endpoints
│   │   └── automation/         # Automation management
│   └── page.tsx               # Main dashboard
├── components/
│   ├── CampaignCard.tsx       # Campaign display
│   ├── AutomationRules.tsx    # Rule management
│   ├── AutomationLogs.tsx     # Execution logs
│   └── CreateRuleModal.tsx    # Rule creation
├── lib/
│   ├── metaAdsService.ts      # API service layer
│   ├── automationEngine.ts    # Rule engine
│   └── scheduler.ts           # Automation scheduler
└── types/
    └── index.ts               # TypeScript definitions
```

### API Endpoints

**Campaigns:**
- `GET /api/campaigns` - Get campaign with insights
- `POST /api/campaigns` - Get multiple campaigns

**Automation Rules:**
- `GET /api/automation/rules` - List all rules
- `POST /api/automation/rules` - Create new rule
- `PUT /api/automation/rules` - Update rule
- `DELETE /api/automation/rules` - Delete rule

**Automation Execution:**
- `POST /api/automation/execute` - Trigger automation
- `GET /api/automation/execute` - Get execution logs

**Statistics:**
- `GET /api/automation/stats` - Get automation statistics

## 🎨 UI/UX Features

### Dashboard
- **Real-time status indicators** for scheduler and campaign health
- **Color-coded metrics** for easy interpretation
- **Responsive design** that works on all devices
- **Interactive elements** for immediate feedback

### Rule Management
- **Visual rule builder** with drag-and-drop interface
- **Conditional logic** with AND/OR operators
- **Parameter validation** to prevent invalid rules
- **Rule templates** for common scenarios

### Monitoring
- **Live execution logs** with detailed timestamps
- **Success/failure indicators** with clear visual feedback
- **Campaign performance tracking** with trend analysis
- **Automation statistics** and success rates

## 💡 Product Vision & Value Proposition

### Target Users
- **Digital Marketing Agencies**: Scale campaign management across multiple clients
- **E-commerce Businesses**: Optimize ad spend for maximum ROI
- **SaaS Companies**: Automate customer acquisition campaigns
- **Enterprise Marketers**: Manage complex, multi-objective campaigns

### Key Benefits
- **24/7 Monitoring**: Never miss a performance issue
- **Cost Optimization**: Automatically optimize spend based on performance
- **Scale Operations**: Manage hundreds of campaigns with minimal manual work
- **Risk Mitigation**: Automatically pause underperforming campaigns
- **ROI Maximization**: Increase budgets for high-performing campaigns

### Monetization Opportunities
- **SaaS Subscription**: Tiered pricing based on campaign volume
- **Enterprise Licensing**: White-label solutions for agencies
- **Performance Fees**: Commission on cost savings/revenue improvements
- **Premium Features**: Advanced AI-powered optimization
- **API Access**: Developer tools and integrations

## 🚀 Future Enhancements

### AI-Powered Features
- **Predictive Analytics**: Forecast campaign performance
- **Smart Bidding**: AI-optimized bid adjustments
- **Anomaly Detection**: Automatic identification of unusual patterns
- **Natural Language Rules**: Create rules with plain English

### Advanced Automation
- **Multi-Platform Support**: Google Ads, LinkedIn, Twitter integration
- **Advanced Scheduling**: Time-based and seasonal rules
- **A/B Testing Automation**: Automatic creative and audience testing
- **Budget Reallocation**: Cross-campaign budget optimization

### Collaboration Features
- **Team Management**: Role-based access control
- **Approval Workflows**: Multi-step approval for high-impact actions
- **Notification Channels**: Slack, Teams, Email integrations
- **Audit Trails**: Comprehensive action logging and reporting

## 📊 Example Use Cases

### 1. Budget Protection
**Scenario**: Prevent overspending on underperforming campaigns
```
Rule: IF Spend > $200 AND ROAS < 1.5 THEN Pause Campaign
Result: Automatically stops campaigns that aren't profitable
```

### 2. Scale Winning Campaigns
**Scenario**: Increase budget for high-performing campaigns
```
Rule: IF ROAS > 4 AND CTR > 3% THEN Increase Budget by 50%
Result: Capitalize on successful campaigns while they're hot
```

### 3. Quality Control
**Scenario**: Monitor campaign health metrics
```
Rule: IF CTR < 0.5% OR CPC > $5 THEN Send Alert
Result: Early warning system for campaign issues
```

## 🔧 Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **HTTP Client**: Axios with interceptors and error handling
- **State Management**: React hooks and local state
- **Styling**: Tailwind CSS with responsive design
- **Date Handling**: date-fns for formatting and manipulation
- **Unique IDs**: UUID for reliable identification
- **Type Safety**: Full TypeScript coverage

## 📝 License

This project is developed as a technical challenge demonstration. Please refer to the specific licensing terms provided by the challenge organizers.

---

Built with ❤️ for intelligent ad campaign automation
