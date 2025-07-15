#!/usr/bin/env node

/**
 * Analytics and Notifications CLI Tool
 * Command-line interface for predictive analytics and smart notifications
 */

// Mock the services for CLI testing since TypeScript files can't be directly required
class MockPredictiveAnalyticsService {
  async generateProjectInsights(projectId) {
    return {
      insights: [
        {
          id: 'budget-forecast-1',
          type: 'BUDGET_FORECAST',
          priority: 'MEDIUM',
          title: 'Budget Overrun Risk Detected',
          description: 'Current spending trend indicates potential 8% budget overrun',
          confidence: 0.75,
          impact: { financial: 28000, timeline: 0, quality: 0 },
          recommendations: [
            'Review material costs for optimization opportunities',
            'Negotiate better rates with current suppliers',
            'Consider alternative materials for non-critical components'
          ]
        },
        {
          id: 'weather-impact-1',
          type: 'WEATHER_IMPACT',
          priority: 'HIGH',
          title: 'Weather Delays Expected',
          description: 'Heavy rain forecast for next 3 days will impact outdoor work',
          confidence: 0.90,
          impact: { financial: 5000, timeline: 3, quality: 2 },
          recommendations: [
            'Move indoor work to priority',
            'Secure materials and equipment',
            'Prepare covered work areas'
          ]
        }
      ],
      weatherForecast: [
        { date: new Date(), condition: 'rainy', workability: 'poor' },
        { date: new Date(Date.now() + 86400000), condition: 'sunny', workability: 'excellent' }
      ],
      budgetForecast: {
        projectedTotal: 378000,
        varianceFromBudget: 28000,
        costSavingOpportunities: [
          { opportunity: 'Bulk material purchase', savings: 5000, effort: 'low' }
        ]
      },
      scheduleAnalysis: {
        projectedCompletion: new Date(Date.now() + 82 * 24 * 60 * 60 * 1000),
        delayProbability: 0.25,
        criticalPath: ['Foundation', 'Framing', 'Electrical Rough-In']
      }
    }
  }

  async analyzeWeatherImpact(projectId, days = 14) {
    return {
      workableDays: 10,
      delayRisk: 0.35,
      impacts: [
        {
          date: new Date(),
          impact: 'Heavy rain - poor workability',
          severity: 'medium',
          mitigation: ['Focus on indoor work', 'Secure materials']
        }
      ],
      recommendations: [
        'Schedule weather-sensitive work for later in week',
        'Prepare covered work areas'
      ]
    }
  }

  async optimizeBudget(projectId) {
    return {
      currentUtilization: 0.42,
      projectedOverrun: 28000,
      optimizations: [
        {
          category: 'Materials',
          currentCost: 120000,
          optimizedCost: 110000,
          savings: 10000,
          implementation: 'Negotiate bulk pricing',
          risk: 'low'
        }
      ],
      vendorNegotiations: [
        {
          vendor: 'Austin Lumber Co',
          category: 'Materials',
          currentRate: 125,
          marketRate: 115,
          savingsPotential: 2500
        }
      ]
    }
  }

  async assessScheduleRisks(projectId) {
    return {
      onTimeCompletion: 0.75,
      riskFactors: [
        {
          factor: 'Weather delays',
          probability: 0.3,
          impact: 7,
          mitigation: ['Schedule weather-sensitive work during optimal periods']
        }
      ],
      criticalPathAnalysis: {
        tasks: ['Foundation', 'Framing', 'Electrical'],
        bufferTime: 5,
        riskPoints: ['Electrical Rough-In']
      },
      recommendations: [
        'Focus on critical path tasks',
        'Build 10% schedule buffer for weather'
      ]
    }
  }

  async optimizeResources(projectId) {
    return {
      crewUtilization: [
        {
          crew: 'Framing Crew',
          currentUtilization: 0.85,
          optimalUtilization: 0.90,
          recommendations: ['Add one additional framer']
        }
      ],
      equipmentOptimization: [
        {
          equipment: 'Excavator',
          rentVsBuy: 'rent',
          costSavings: 1500,
          utilization: 0.15
        }
      ],
      skillGapAnalysis: [
        {
          skill: 'Electrical',
          demand: 80,
          supply: 70,
          gap: 10,
          solutions: ['Hire additional electrician']
        }
      ]
    }
  }

  async disconnect() {}
}

class MockSmartNotificationsService {
  async sendSmartNotification(notification) {
    return {
      notificationId: `notif_${Date.now()}`,
      deliveryResults: [
        { channel: 'EMAIL', status: 'sent' },
        { channel: 'IN_APP', status: 'sent' }
      ]
    }
  }

  async processInsightsNotifications(projectId) {
    return {
      generated: 3,
      insights: [
        { type: 'BUDGET_FORECAST', priority: 'MEDIUM', notification: {} },
        { type: 'WEATHER_IMPACT', priority: 'HIGH', notification: {} },
        { type: 'QUALITY_ALERT', priority: 'HIGH', notification: {} }
      ]
    }
  }

  async getNotificationMetrics(userId, timeframe = 'week') {
    return {
      overview: {
        sent: 45,
        delivered: 43,
        read: 35,
        actionTaken: 22,
        deliveryRate: 0.96,
        readRate: 0.81,
        actionRate: 0.63
      },
      byChannel: {
        EMAIL: { sent: 20, delivered: 19, read: 15, actionTaken: 10, deliveryRate: 0.95, readRate: 0.79, actionRate: 0.67 },
        IN_APP: { sent: 25, delivered: 24, read: 20, actionTaken: 12, deliveryRate: 0.96, readRate: 0.83, actionRate: 0.60 }
      },
      byCategory: {
        PROJECT_INSIGHTS: { sent: 15, delivered: 15, read: 12, actionTaken: 8, deliveryRate: 1.0, readRate: 0.80, actionRate: 0.67 },
        WEATHER_ALERTS: { sent: 10, delivered: 9, read: 8, actionTaken: 6, deliveryRate: 0.90, readRate: 0.89, actionRate: 0.75 }
      },
      trends: [
        { date: '2025-07-06', sent: 15, read: 12, actionTaken: 8 },
        { date: '2025-07-07', sent: 18, read: 14, actionTaken: 9 },
        { date: '2025-07-08', sent: 12, read: 10, actionTaken: 6 }
      ],
      topCategories: [
        { category: 'PROJECT_INSIGHTS', count: 15, readRate: 0.80 },
        { category: 'WEATHER_ALERTS', count: 10, readRate: 0.89 }
      ]
    }
  }

  async generateDigest(userId, digestType, categories) {
    return {
      digest: {
        summary: `${digestType === 'daily' ? 'Daily' : 'Weekly'} digest: 12 notifications including 2 urgent alerts and 4 insights.`,
        notifications: [
          {
            title: 'Budget Alert',
            message: 'Material costs 8% over budget',
            priority: 'HIGH',
            type: 'ALERT'
          },
          {
            title: 'Weather Impact',
            message: 'Rain expected for next 3 days',
            priority: 'MEDIUM',
            type: 'WARNING'
          }
        ],
        insights: [
          'Budget optimization could save $10,000',
          'Weather delays may impact timeline by 3 days',
          'Crew utilization at 85% - consider adding resources'
        ],
        actions: [
          {
            title: 'Review Material Costs',
            description: 'Material costs are 8% over budget',
            priority: 'HIGH',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      deliverySchedule: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  }

  async disconnect() {}
}

function createPredictiveAnalyticsService() {
  return new MockPredictiveAnalyticsService()
}

function createSmartNotificationsService() {
  return new MockSmartNotificationsService()
}

const fs = require('fs')
const path = require('path')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

class AnalyticsCLI {
  constructor() {
    this.analyticsService = createPredictiveAnalyticsService()
    this.notificationsService = createSmartNotificationsService()
    this.outputDir = path.join(__dirname, '..', 'analytics-output')
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async generateInsights(projectId) {
    log(`🔮 Generating predictive insights for project ${projectId}...`, colors.blue)

    try {
      const insights = await this.analyticsService.generateProjectInsights(projectId)

      // Save insights report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `project-insights-${projectId}-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)

      fs.writeFileSync(filepath, JSON.stringify({
        projectId,
        timestamp: new Date().toISOString(),
        ...insights
      }, null, 2))

      log(`✅ Generated ${insights.insights.length} insights`, colors.green)
      log(`💾 Report saved to: ${filename}`, colors.cyan)
      log('')

      this.displayInsightsSummary(insights)

      return insights
    } catch (error) {
      log(`❌ Insights generation failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async analyzeWeather(projectId, days = 14) {
    log(`🌤️ Analyzing weather impact for next ${days} days...`, colors.blue)

    try {
      const weatherAnalysis = await this.analyticsService.analyzeWeatherImpact(projectId, days)

      log(`✅ Weather analysis complete`, colors.green)
      log(`   Workable days: ${weatherAnalysis.workableDays}/${days}`, colors.cyan)
      log(`   Delay risk: ${(weatherAnalysis.delayRisk * 100).toFixed(1)}%`, 
          weatherAnalysis.delayRisk > 0.3 ? colors.red : colors.green)
      log('')

      this.displayWeatherAnalysis(weatherAnalysis)

      return weatherAnalysis
    } catch (error) {
      log(`❌ Weather analysis failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async optimizeBudget(projectId) {
    log(`💰 Analyzing budget optimization opportunities...`, colors.blue)

    try {
      const budgetAnalysis = await this.analyticsService.optimizeBudget(projectId)

      log(`✅ Budget analysis complete`, colors.green)
      log(`   Current utilization: ${(budgetAnalysis.currentUtilization * 100).toFixed(1)}%`, colors.cyan)
      log(`   Projected overrun: $${budgetAnalysis.projectedOverrun.toLocaleString()}`, 
          budgetAnalysis.projectedOverrun > 0 ? colors.red : colors.green)
      log('')

      this.displayBudgetOptimization(budgetAnalysis)

      return budgetAnalysis
    } catch (error) {
      log(`❌ Budget optimization failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async assessSchedule(projectId) {
    log(`📅 Assessing schedule risks...`, colors.blue)

    try {
      const scheduleAnalysis = await this.analyticsService.assessScheduleRisks(projectId)

      log(`✅ Schedule assessment complete`, colors.green)
      log(`   On-time completion probability: ${(scheduleAnalysis.onTimeCompletion * 100).toFixed(1)}%`, 
          scheduleAnalysis.onTimeCompletion > 0.8 ? colors.green : colors.yellow)
      log('')

      this.displayScheduleAssessment(scheduleAnalysis)

      return scheduleAnalysis
    } catch (error) {
      log(`❌ Schedule assessment failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async optimizeResources(projectId) {
    log(`👥 Analyzing resource optimization...`, colors.blue)

    try {
      const resourceAnalysis = await this.analyticsService.optimizeResources(projectId)

      log(`✅ Resource analysis complete`, colors.green)
      log('')

      this.displayResourceOptimization(resourceAnalysis)

      return resourceAnalysis
    } catch (error) {
      log(`❌ Resource optimization failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async processNotifications(projectId) {
    log(`🔔 Processing intelligent notifications...`, colors.blue)

    try {
      const result = await this.notificationsService.processInsightsNotifications(projectId)

      log(`✅ Generated ${result.generated} notifications`, colors.green)
      log('')

      this.displayNotificationSummary(result)

      return result
    } catch (error) {
      log(`❌ Notification processing failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async getNotificationMetrics(userId, timeframe = 'week') {
    log(`📊 Retrieving notification metrics for ${timeframe}...`, colors.blue)

    try {
      const metrics = await this.notificationsService.getNotificationMetrics(userId, timeframe)

      log(`✅ Metrics retrieved`, colors.green)
      log('')

      this.displayNotificationMetrics(metrics)

      return metrics
    } catch (error) {
      log(`❌ Metrics retrieval failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async generateDigest(userId, digestType = 'daily', categories) {
    log(`📰 Generating ${digestType} digest...`, colors.blue)

    try {
      const digest = await this.notificationsService.generateDigest(userId, digestType, categories)

      log(`✅ Digest generated`, colors.green)
      log(`   Scheduled for: ${digest.deliverySchedule.toLocaleString()}`, colors.cyan)
      log('')

      this.displayDigest(digest)

      return digest
    } catch (error) {
      log(`❌ Digest generation failed: ${error.message}`, colors.red)
      throw error
    }
  }

  displayInsightsSummary(insights) {
    log(`🔮 Project Insights Summary:`, colors.bold)
    log('')

    insights.insights.forEach((insight, index) => {
      const priorityColor = insight.priority === 'HIGH' || insight.priority === 'URGENT' ? colors.red :
                           insight.priority === 'MEDIUM' ? colors.yellow : colors.green

      log(`${index + 1}. ${insight.title}`, colors.cyan)
      log(`   Priority: ${insight.priority}`, priorityColor)
      log(`   Confidence: ${(insight.confidence * 100).toFixed(1)}%`, colors.reset)
      log(`   Financial Impact: $${insight.impact.financial.toLocaleString()}`, colors.reset)
      if (insight.impact.timeline > 0) {
        log(`   Timeline Impact: ${insight.impact.timeline} days`, colors.reset)
      }
      log(`   Description: ${insight.description}`, colors.reset)
      log('')
    })

    if (insights.budgetForecast.costSavingOpportunities.length > 0) {
      log(`💡 Cost Saving Opportunities:`, colors.blue)
      insights.budgetForecast.costSavingOpportunities.forEach(opp => {
        log(`   • ${opp.opportunity}: $${opp.savings.toLocaleString()} (${opp.effort} effort)`, colors.reset)
      })
      log('')
    }
  }

  displayWeatherAnalysis(analysis) {
    log(`🌤️ Weather Impact Analysis:`, colors.bold)
    log('')

    if (analysis.impacts.length > 0) {
      log(`⚠️ Weather Impacts:`, colors.yellow)
      analysis.impacts.forEach(impact => {
        const severityColor = impact.severity === 'high' ? colors.red : 
                             impact.severity === 'medium' ? colors.yellow : colors.green
        log(`   • ${impact.date.toLocaleDateString()}: ${impact.impact}`, severityColor)
        impact.mitigation.forEach(action => {
          log(`     → ${action}`, colors.reset)
        })
      })
      log('')
    }

    if (analysis.recommendations.length > 0) {
      log(`💡 Recommendations:`, colors.blue)
      analysis.recommendations.forEach(rec => {
        log(`   • ${rec}`, colors.reset)
      })
    }
  }

  displayBudgetOptimization(analysis) {
    log(`💰 Budget Optimization Analysis:`, colors.bold)
    log('')

    if (analysis.optimizations.length > 0) {
      log(`🎯 Optimization Opportunities:`, colors.blue)
      analysis.optimizations.forEach(opt => {
        log(`   ${opt.category}:`, colors.cyan)
        log(`     Current: $${opt.currentCost.toLocaleString()}`, colors.reset)
        log(`     Optimized: $${opt.optimizedCost.toLocaleString()}`, colors.green)
        log(`     Savings: $${opt.savings.toLocaleString()}`, colors.green)
        log(`     Implementation: ${opt.implementation}`, colors.reset)
        log(`     Risk: ${opt.risk}`, opt.risk === 'high' ? colors.red : colors.green)
        log('')
      })
    }

    if (analysis.vendorNegotiations.length > 0) {
      log(`🤝 Vendor Negotiation Opportunities:`, colors.blue)
      analysis.vendorNegotiations.forEach(vendor => {
        log(`   ${vendor.vendor} (${vendor.category}):`, colors.cyan)
        log(`     Current rate: $${vendor.currentRate}`, colors.reset)
        log(`     Market rate: $${vendor.marketRate}`, colors.green)
        log(`     Potential savings: $${vendor.savingsPotential.toLocaleString()}`, colors.green)
        log('')
      })
    }
  }

  displayScheduleAssessment(analysis) {
    log(`📅 Schedule Risk Assessment:`, colors.bold)
    log('')

    log(`🎯 Critical Path Analysis:`, colors.blue)
    analysis.criticalPathAnalysis.tasks.forEach((task, index) => {
      log(`   ${index + 1}. ${task}`, colors.cyan)
    })
    log(`   Buffer time: ${analysis.criticalPathAnalysis.bufferTime} days`, colors.reset)
    log('')

    if (analysis.riskFactors.length > 0) {
      log(`⚠️ Risk Factors:`, colors.yellow)
      analysis.riskFactors.forEach(risk => {
        log(`   ${risk.factor}:`, colors.cyan)
        log(`     Probability: ${(risk.probability * 100).toFixed(1)}%`, colors.reset)
        log(`     Impact: ${risk.impact}/10`, colors.reset)
        risk.mitigation.forEach(action => {
          log(`     → ${action}`, colors.reset)
        })
        log('')
      })
    }

    if (analysis.recommendations.length > 0) {
      log(`💡 Recommendations:`, colors.blue)
      analysis.recommendations.forEach(rec => {
        log(`   • ${rec}`, colors.reset)
      })
    }
  }

  displayResourceOptimization(analysis) {
    log(`👥 Resource Optimization Analysis:`, colors.bold)
    log('')

    if (analysis.crewUtilization.length > 0) {
      log(`👷 Crew Utilization:`, colors.blue)
      analysis.crewUtilization.forEach(crew => {
        log(`   ${crew.crew}:`, colors.cyan)
        log(`     Current: ${(crew.currentUtilization * 100).toFixed(1)}%`, colors.reset)
        log(`     Optimal: ${(crew.optimalUtilization * 100).toFixed(1)}%`, colors.green)
        crew.recommendations.forEach(rec => {
          log(`     → ${rec}`, colors.reset)
        })
        log('')
      })
    }

    if (analysis.equipmentOptimization.length > 0) {
      log(`🚜 Equipment Optimization:`, colors.blue)
      analysis.equipmentOptimization.forEach(equipment => {
        log(`   ${equipment.equipment}:`, colors.cyan)
        log(`     Recommendation: ${equipment.rentVsBuy}`, colors.green)
        log(`     Cost savings: $${equipment.costSavings.toLocaleString()}`, colors.green)
        log(`     Utilization: ${(equipment.utilization * 100).toFixed(1)}%`, colors.reset)
        log('')
      })
    }

    if (analysis.skillGapAnalysis.length > 0) {
      log(`🎯 Skill Gap Analysis:`, colors.blue)
      analysis.skillGapAnalysis.forEach(skill => {
        log(`   ${skill.skill}:`, colors.cyan)
        log(`     Demand: ${skill.demand}%`, colors.reset)
        log(`     Supply: ${skill.supply}%`, colors.reset)
        log(`     Gap: ${skill.gap}%`, skill.gap > 0 ? colors.red : colors.green)
        skill.solutions.forEach(solution => {
          log(`     → ${solution}`, colors.reset)
        })
        log('')
      })
    }
  }

  displayNotificationSummary(result) {
    log(`🔔 Notification Summary:`, colors.bold)
    log('')

    result.insights.forEach((insight, index) => {
      const priorityColor = insight.priority === 'HIGH' || insight.priority === 'URGENT' ? colors.red :
                           insight.priority === 'MEDIUM' ? colors.yellow : colors.green

      log(`${index + 1}. ${insight.type.replace('_', ' ')}`, colors.cyan)
      log(`   Priority: ${insight.priority}`, priorityColor)
      log('')
    })
  }

  displayNotificationMetrics(metrics) {
    log(`📊 Notification Metrics:`, colors.bold)
    log('')

    log(`📈 Overview:`, colors.blue)
    log(`   Sent: ${metrics.overview.sent}`, colors.reset)
    log(`   Delivered: ${metrics.overview.delivered} (${(metrics.overview.deliveryRate * 100).toFixed(1)}%)`, colors.green)
    log(`   Read: ${metrics.overview.read} (${(metrics.overview.readRate * 100).toFixed(1)}%)`, colors.cyan)
    log(`   Action taken: ${metrics.overview.actionTaken} (${(metrics.overview.actionRate * 100).toFixed(1)}%)`, colors.magenta)
    log('')

    log(`📱 By Channel:`, colors.blue)
    Object.entries(metrics.byChannel).forEach(([channel, data]) => {
      log(`   ${channel}:`, colors.cyan)
      log(`     Delivery rate: ${(data.deliveryRate * 100).toFixed(1)}%`, colors.reset)
      log(`     Read rate: ${(data.readRate * 100).toFixed(1)}%`, colors.reset)
      log(`     Action rate: ${(data.actionRate * 100).toFixed(1)}%`, colors.reset)
    })
    log('')

    log(`📋 Top Categories:`, colors.blue)
    metrics.topCategories.forEach(category => {
      log(`   ${category.category}: ${category.count} notifications (${(category.readRate * 100).toFixed(1)}% read rate)`, colors.reset)
    })
  }

  displayDigest(digest) {
    log(`📰 Notification Digest:`, colors.bold)
    log('')

    log(`📊 Summary:`, colors.blue)
    log(`   ${digest.digest.summary}`, colors.reset)
    log('')

    if (digest.digest.insights.length > 0) {
      log(`🔮 Key Insights:`, colors.blue)
      digest.digest.insights.forEach(insight => {
        log(`   • ${insight}`, colors.reset)
      })
      log('')
    }

    if (digest.digest.actions.length > 0) {
      log(`⚡ Action Items:`, colors.yellow)
      digest.digest.actions.forEach(action => {
        const priorityColor = action.priority === 'HIGH' || action.priority === 'URGENT' ? colors.red :
                             action.priority === 'MEDIUM' ? colors.yellow : colors.green
        log(`   • ${action.title}`, priorityColor)
        log(`     ${action.description}`, colors.reset)
        log(`     Due: ${action.dueDate.toLocaleDateString()}`, colors.reset)
        log('')
      })
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === 'help') {
    showHelp()
    return
  }

  const cli = new AnalyticsCLI()
  const command = args[0]

  try {
    switch (command) {
      case 'insights':
        if (args.length < 2) {
          log('❌ Project ID required for insights generation', colors.red)
          process.exit(1)
        }
        await cli.generateInsights(args[1])
        break

      case 'weather':
        if (args.length < 2) {
          log('❌ Project ID required for weather analysis', colors.red)
          process.exit(1)
        }
        const days = args[2] ? parseInt(args[2]) : 14
        await cli.analyzeWeather(args[1], days)
        break

      case 'budget':
        if (args.length < 2) {
          log('❌ Project ID required for budget optimization', colors.red)
          process.exit(1)
        }
        await cli.optimizeBudget(args[1])
        break

      case 'schedule':
        if (args.length < 2) {
          log('❌ Project ID required for schedule assessment', colors.red)
          process.exit(1)
        }
        await cli.assessSchedule(args[1])
        break

      case 'resources':
        if (args.length < 2) {
          log('❌ Project ID required for resource optimization', colors.red)
          process.exit(1)
        }
        await cli.optimizeResources(args[1])
        break

      case 'notifications':
        if (args.length < 2) {
          log('❌ Project ID required for notification processing', colors.red)
          process.exit(1)
        }
        await cli.processNotifications(args[1])
        break

      case 'metrics':
        if (args.length < 2) {
          log('❌ User ID required for notification metrics', colors.red)
          process.exit(1)
        }
        const timeframe = args[2] || 'week'
        await cli.getNotificationMetrics(args[1], timeframe)
        break

      case 'digest':
        if (args.length < 2) {
          log('❌ User ID required for digest generation', colors.red)
          process.exit(1)
        }
        const digestType = args[2] || 'daily'
        const categories = args[3] ? args[3].split(',') : undefined
        await cli.generateDigest(args[1], digestType, categories)
        break

      default:
        log(`❌ Unknown command: ${command}`, colors.red)
        showHelp()
        process.exit(1)
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  } finally {
    await cli.analyticsService.disconnect()
    await cli.notificationsService.disconnect()
  }
}

function showHelp() {
  log('Predictive Analytics & Smart Notifications Tool', colors.bold)
  log('==============================================', colors.cyan)
  log('')
  log('Analytics Commands:', colors.blue)
  log('  insights <project-id>', colors.reset)
  log('    Generate predictive insights for project')
  log('')
  log('  weather <project-id> [days]', colors.reset)
  log('    Analyze weather impact (default: 14 days)')
  log('')
  log('  budget <project-id>', colors.reset)
  log('    Optimize budget and find cost savings')
  log('')
  log('  schedule <project-id>', colors.reset)
  log('    Assess schedule risks and delays')
  log('')
  log('  resources <project-id>', colors.reset)
  log('    Optimize crew and equipment utilization')
  log('')
  log('Notification Commands:', colors.blue)
  log('  notifications <project-id>', colors.reset)
  log('    Process and send intelligent notifications')
  log('')
  log('  metrics <user-id> [timeframe]', colors.reset)
  log('    Get notification metrics (day/week/month)')
  log('')
  log('  digest <user-id> [daily|weekly] [categories]', colors.reset)
  log('    Generate notification digest')
  log('')
  log('Examples:', colors.blue)
  log('  npm run analytics insights proj_abc123', colors.cyan)
  log('  npm run analytics weather proj_abc123 7', colors.cyan)
  log('  npm run analytics budget proj_abc123', colors.cyan)
  log('  npm run analytics schedule proj_abc123', colors.cyan)
  log('  npm run analytics notifications proj_abc123', colors.cyan)
  log('  npm run analytics metrics user_123 week', colors.cyan)
  log('  npm run analytics digest user_123 daily', colors.cyan)
}

if (require.main === module) {
  main()
}

module.exports = { AnalyticsCLI }