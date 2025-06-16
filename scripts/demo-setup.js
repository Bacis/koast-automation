// Demo setup script to create sample automation rules
// This script can be run to populate the system with example rules

const sampleRules = [
  {
    name: "High Spend Protection",
    description: "Automatically pause campaigns that spend too much with low ROAS",
    campaignId: "120225449479650554",
    conditions: [
      {
        field: "spend",
        operator: ">",
        value: 100,
        logicalOperator: "AND"
      },
      {
        field: "roas",
        operator: "<",
        value: 1.5
      }
    ],
    actionType: "PAUSE_CAMPAIGN"
  },
  {
    name: "Low CTR Alert",
    description: "Send notification when CTR drops below 1%",
    campaignId: "120225449479650554", 
    conditions: [
      {
        field: "ctr",
        operator: "<",
        value: 1
      }
    ],
    actionType: "SEND_NOTIFICATION",
    actionParameters: {
      message: "Campaign CTR has dropped below 1% - investigate creative performance"
    }
  },
  {
    name: "Budget Scaling for Winners",
    description: "Increase budget for high-performing campaigns",
    campaignId: "120225449479650554",
    conditions: [
      {
        field: "roas",
        operator: ">=",
        value: 3,
        logicalOperator: "AND"
      },
      {
        field: "ctr",
        operator: ">",
        value: 2
      }
    ],
    actionType: "ADJUST_BUDGET",
    actionParameters: {
      newBudget: 200
    }
  },
  {
    name: "Cost Control",
    description: "Monitor when cost per click becomes too expensive",
    campaignId: "120225449479650554",
    conditions: [
      {
        field: "cpc",
        operator: ">",
        value: 2,
        logicalOperator: "OR"
      },
      {
        field: "costPerAction",
        operator: ">",
        value: 10
      }
    ],
    actionType: "LOG_EVENT"
  }
];

async function createDemoRules() {
  console.log('🚀 Setting up demonstration automation rules...');
  
  for (const rule of sampleRules) {
    try {
      const response = await fetch('http://localhost:3000/api/automation/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Created rule: ${rule.name}`);
      } else {
        console.log(`❌ Failed to create rule: ${rule.name} - ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating rule: ${rule.name} - ${error.message}`);
    }
  }
  
  console.log('🎉 Demo setup completed!');
  console.log('📝 Visit http://localhost:3000 to see the automation system in action');
}

// Run if called directly
if (require.main === module) {
  createDemoRules();
}

module.exports = { createDemoRules, sampleRules }; 