/**
 * Predictive Analytics Service
 * AI-powered insights for construction project management and optimization
 */

import { PrismaClient } from '@prisma/client'
import { createResearchService } from './research-service'

interface PredictiveInsight {
  id: string
  type: 'BUDGET_FORECAST' | 'SCHEDULE_RISK' | 'WEATHER_IMPACT' | 'RESOURCE_OPTIMIZATION' | 'QUALITY_ALERT' | 'COST_SAVING'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  confidence: number // 0-1
  impact: {
    financial: number // dollar amount
    timeline: number // days affected
    quality: number // 0-10 scale
  }
  recommendations: string[]
  data: any
  expiresAt: Date
  createdAt: Date
}

interface WeatherForecast {
  date: Date
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snow' | 'extreme'
  temperature: { min: number; max: number }
  precipitation: number
  windSpeed: number
  workability: 'excellent' | 'good' | 'fair' | 'poor' | 'dangerous'
  recommendations: string[]
}

interface BudgetForecast {
  projectedTotal: number
  varianceFromBudget: number
  riskFactors: Array<{
    category: string
    risk: number
    impact: number
    mitigation: string[]
  }>
  monthlySpend: Array<{
    month: string
    projected: number
    actual: number
  }>
  costSavingOpportunities: Array<{
    opportunity: string
    savings: number
    effort: 'low' | 'medium' | 'high'
    timeline: string
  }>
}

interface ScheduleAnalysis {
  projectedCompletion: Date
  delayProbability: number
  criticalPath: string[]
  bottlenecks: Array<{
    task: string
    delayRisk: number
    impact: number
    mitigation: string[]
  }>
  resourceConflicts: Array<{
    resource: string
    conflictDates: Date[]
    alternatives: string[]
  }>
}

interface QualityPrediction {
  riskAreas: Array<{
    area: string
    riskLevel: number
    indicators: string[]
    preventiveMeasures: string[]
  }>
  inspectionReadiness: {
    foundation: number
    framing: number
    electrical: number
    plumbing: number
    final: number
  }
  qualityTrends: Array<{
    metric: string
    trend: 'improving' | 'stable' | 'declining'
    value: number
  }>
}

export class PredictiveAnalyticsService {
  private prisma: PrismaClient
  private researchService: any

  constructor() {
    this.prisma = new PrismaClient()
    this.researchService = createResearchService()
  }

  /**
   * Generate comprehensive project insights
   */
  async generateProjectInsights(projectId: string): Promise<{
    insights: PredictiveInsight[]
    weatherForecast: WeatherForecast[]
    budgetForecast: BudgetForecast
    scheduleAnalysis: ScheduleAnalysis
    qualityPrediction: QualityPrediction
  }> {
    try {
      const project = await this.getProjectData(projectId)
      
      const [
        insights,
        weatherForecast,
        budgetForecast,
        scheduleAnalysis,
        qualityPrediction
      ] = await Promise.all([
        this.generateInsights(project),
        this.getWeatherForecast(project.location),
        this.forecastBudget(project),
        this.analyzeSchedule(project),
        this.predictQuality(project)
      ])

      return {
        insights,
        weatherForecast,
        budgetForecast,
        scheduleAnalysis,
        qualityPrediction
      }
    } catch (error) {
      console.error('Project insights generation failed:', error)
      throw new Error(`Failed to generate insights: ${error.message}`)
    }
  }

  /**
   * Weather impact analysis
   */
  async analyzeWeatherImpact(
    projectId: string,
    forecastDays: number = 14
  ): Promise<{
    workableDays: number
    delayRisk: number
    impacts: Array<{
      date: Date
      impact: string
      severity: 'low' | 'medium' | 'high'
      mitigation: string[]
    }>
    recommendations: string[]
  }> {
    try {
      const project = await this.getProjectData(projectId)
      const forecast = await this.getWeatherForecast(project.location, forecastDays)
      
      const workableDays = forecast.filter(day => 
        ['excellent', 'good', 'fair'].includes(day.workability)
      ).length

      const impacts = forecast
        .filter(day => day.workability === 'poor' || day.workability === 'dangerous')
        .map(day => ({
          date: day.date,
          impact: `${day.condition} conditions - ${day.workability} workability`,
          severity: day.workability === 'dangerous' ? 'high' as const : 'medium' as const,
          mitigation: day.recommendations
        }))

      const delayRisk = (forecastDays - workableDays) / forecastDays

      return {
        workableDays,
        delayRisk,
        impacts,
        recommendations: this.generateWeatherRecommendations(forecast, project)
      }
    } catch (error) {
      console.error('Weather impact analysis failed:', error)
      throw new Error(`Failed to analyze weather impact: ${error.message}`)
    }
  }

  /**
   * Budget optimization analysis
   */
  async optimizeBudget(projectId: string): Promise<{
    currentUtilization: number
    projectedOverrun: number
    optimizations: Array<{
      category: string
      currentCost: number
      optimizedCost: number
      savings: number
      implementation: string
      risk: 'low' | 'medium' | 'high'
    }>
    vendorNegotiations: Array<{
      vendor: string
      category: string
      currentRate: number
      marketRate: number
      savingsPotential: number
      negotiationStrategy: string[]
    }>
  }> {
    try {
      const project = await this.getProjectData(projectId)
      const budgetAnalysis = await this.forecastBudget(project)
      
      // Analyze current spending patterns
      const currentUtilization = project.budgetUsed / project.totalBudget
      const projectedOverrun = Math.max(0, budgetAnalysis.projectedTotal - project.totalBudget)

      // Generate optimization opportunities
      const optimizations = await this.findBudgetOptimizations(project)
      const vendorNegotiations = await this.analyzeVendorRates(project)

      return {
        currentUtilization,
        projectedOverrun,
        optimizations,
        vendorNegotiations
      }
    } catch (error) {
      console.error('Budget optimization failed:', error)
      throw new Error(`Failed to optimize budget: ${error.message}`)
    }
  }

  /**
   * Schedule risk assessment
   */
  async assessScheduleRisks(projectId: string): Promise<{
    onTimeCompletion: number
    riskFactors: Array<{
      factor: string
      probability: number
      impact: number
      mitigation: string[]
    }>
    criticalPathAnalysis: {
      tasks: string[]
      bufferTime: number
      riskPoints: string[]
    }
    recommendations: string[]
  }> {
    try {
      const project = await this.getProjectData(projectId)
      const scheduleAnalysis = await this.analyzeSchedule(project)
      
      const onTimeCompletion = 1 - scheduleAnalysis.delayProbability
      
      const riskFactors = [
        {
          factor: 'Weather delays',
          probability: 0.3,
          impact: 7,
          mitigation: ['Schedule weather-sensitive work during optimal periods', 'Prepare covered work areas']
        },
        {
          factor: 'Material delivery delays',
          probability: 0.25,
          impact: 5,
          mitigation: ['Order materials early', 'Establish backup suppliers', 'Use just-in-time inventory']
        },
        {
          factor: 'Inspection delays',
          probability: 0.2,
          impact: 3,
          mitigation: ['Schedule inspections early', 'Maintain compliance checklist', 'Build inspector relationships']
        },
        {
          factor: 'Labor availability',
          probability: 0.15,
          impact: 6,
          mitigation: ['Cross-train workers', 'Maintain backup contractor list', 'Competitive compensation']
        }
      ]

      return {
        onTimeCompletion,
        riskFactors,
        criticalPathAnalysis: {
          tasks: scheduleAnalysis.criticalPath,
          bufferTime: 5, // days
          riskPoints: scheduleAnalysis.bottlenecks.map(b => b.task)
        },
        recommendations: [
          'Focus on critical path tasks with highest delay risk',
          'Build 10% schedule buffer for weather contingency',
          'Establish weekly progress reviews',
          'Implement early warning system for delays'
        ]
      }
    } catch (error) {
      console.error('Schedule risk assessment failed:', error)
      throw new Error(`Failed to assess schedule risks: ${error.message}`)
    }
  }

  /**
   * Resource optimization recommendations
   */
  async optimizeResources(projectId: string): Promise<{
    crewUtilization: Array<{
      crew: string
      currentUtilization: number
      optimalUtilization: number
      recommendations: string[]
    }>
    equipmentOptimization: Array<{
      equipment: string
      rentVsBuy: 'rent' | 'buy'
      costSavings: number
      utilization: number
    }>
    skillGapAnalysis: Array<{
      skill: string
      demand: number
      supply: number
      gap: number
      solutions: string[]
    }>
  }> {
    try {
      const project = await this.getProjectData(projectId)
      
      // Mock data for demonstration - would use actual project data
      const crewUtilization = [
        {
          crew: 'Framing Crew',
          currentUtilization: 0.85,
          optimalUtilization: 0.90,
          recommendations: ['Add one additional framer', 'Optimize workflow sequence']
        },
        {
          crew: 'Electrical Team',
          currentUtilization: 0.70,
          optimalUtilization: 0.85,
          recommendations: ['Coordinate with framing schedule', 'Batch electrical work']
        }
      ]

      const equipmentOptimization = [
        {
          equipment: 'Excavator',
          rentVsBuy: 'rent' as const,
          costSavings: 1500,
          utilization: 0.15
        },
        {
          equipment: 'Concrete Mixer',
          rentVsBuy: 'buy' as const,
          costSavings: 800,
          utilization: 0.75
        }
      ]

      const skillGapAnalysis = [
        {
          skill: 'Electrical',
          demand: 80,
          supply: 70,
          gap: 10,
          solutions: ['Hire additional electrician', 'Cross-train general laborers']
        }
      ]

      return {
        crewUtilization,
        equipmentOptimization,
        skillGapAnalysis
      }
    } catch (error) {
      console.error('Resource optimization failed:', error)
      throw new Error(`Failed to optimize resources: ${error.message}`)
    }
  }

  // Private helper methods
  private async getProjectData(projectId: string): Promise<any> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        materials: true,
        suppliers: true,
        communications: true,
        decisions: true,
        issues: true
      }
    })

    if (!project) {
      throw new Error('Project not found')
    }

    return {
      ...project,
      location: project.address || 'Liberty Hill, TX',
      budgetUsed: 147500, // Mock data
      totalBudget: 350000
    }
  }

  private async generateInsights(project: any): Promise<PredictiveInsight[]> {
    const insights: PredictiveInsight[] = []

    // Budget forecast insight
    insights.push({
      id: 'budget-forecast-1',
      type: 'BUDGET_FORECAST',
      priority: 'MEDIUM',
      title: 'Budget Overrun Risk Detected',
      description: 'Current spending trend indicates potential 8% budget overrun',
      confidence: 0.75,
      impact: {
        financial: 28000,
        timeline: 0,
        quality: 0
      },
      recommendations: [
        'Review material costs for optimization opportunities',
        'Negotiate better rates with current suppliers',
        'Consider alternative materials for non-critical components'
      ],
      data: { currentOverrun: 0.08, projectedOverrun: 28000 },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    })

    // Weather impact insight
    insights.push({
      id: 'weather-impact-1',
      type: 'WEATHER_IMPACT',
      priority: 'HIGH',
      title: 'Weather Delays Expected',
      description: 'Heavy rain forecast for next 3 days will impact outdoor work',
      confidence: 0.90,
      impact: {
        financial: 5000,
        timeline: 3,
        quality: 2
      },
      recommendations: [
        'Move indoor work to priority',
        'Secure materials and equipment',
        'Prepare covered work areas'
      ],
      data: { affectedDays: 3, workabilityScore: 0.2 },
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    })

    // Quality alert insight
    insights.push({
      id: 'quality-alert-1',
      type: 'QUALITY_ALERT',
      priority: 'HIGH',
      title: 'Inspection Readiness Concern',
      description: 'Foundation work may not pass inspection without corrections',
      confidence: 0.65,
      impact: {
        financial: 2500,
        timeline: 2,
        quality: 7
      },
      recommendations: [
        'Review foundation specifications',
        'Schedule pre-inspection with foreman',
        'Document all corrections made'
      ],
      data: { readinessScore: 0.6, riskAreas: ['concrete curing', 'rebar placement'] },
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    })

    return insights
  }

  private async getWeatherForecast(location: string, days: number = 14): Promise<WeatherForecast[]> {
    // Mock weather data - would integrate with actual weather API
    const forecast: WeatherForecast[] = []
    const conditions = ['sunny', 'cloudy', 'rainy', 'stormy'] as const
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
      const condition = conditions[Math.floor(Math.random() * conditions.length)]
      
      forecast.push({
        date,
        condition,
        temperature: { 
          min: 65 + Math.random() * 10, 
          max: 80 + Math.random() * 15 
        },
        precipitation: condition === 'rainy' || condition === 'stormy' ? Math.random() * 2 : 0,
        windSpeed: 5 + Math.random() * 20,
        workability: this.calculateWorkability(condition),
        recommendations: this.getWeatherRecommendations(condition)
      })
    }

    return forecast
  }

  private calculateWorkability(condition: WeatherForecast['condition']): WeatherForecast['workability'] {
    switch (condition) {
      case 'sunny': return 'excellent'
      case 'cloudy': return 'good'
      case 'rainy': return 'poor'
      case 'stormy': return 'dangerous'
      default: return 'fair'
    }
  }

  private getWeatherRecommendations(condition: WeatherForecast['condition']): string[] {
    switch (condition) {
      case 'sunny':
        return ['Ideal conditions for all work', 'Ensure adequate hydration', 'Apply sunscreen']
      case 'cloudy':
        return ['Good conditions for most work', 'Monitor for weather changes']
      case 'rainy':
        return ['Focus on indoor work', 'Secure materials', 'Avoid concrete pours']
      case 'stormy':
        return ['Suspend outdoor work', 'Secure site', 'Check for damage after storm']
      default:
        return ['Monitor weather conditions']
    }
  }

  private async forecastBudget(project: any): Promise<BudgetForecast> {
    return {
      projectedTotal: 378000,
      varianceFromBudget: 28000,
      riskFactors: [
        {
          category: 'Materials',
          risk: 0.15,
          impact: 18000,
          mitigation: ['Bulk purchasing', 'Alternative suppliers', 'Material substitutions']
        },
        {
          category: 'Labor',
          risk: 0.10,
          impact: 8000,
          mitigation: ['Efficiency improvements', 'Skill training', 'Overtime management']
        }
      ],
      monthlySpend: [
        { month: 'Jan', projected: 50000, actual: 52000 },
        { month: 'Feb', projected: 60000, actual: 58000 },
        { month: 'Mar', projected: 70000, actual: 0 }
      ],
      costSavingOpportunities: [
        {
          opportunity: 'Bulk material purchase',
          savings: 5000,
          effort: 'low',
          timeline: '1 week'
        },
        {
          opportunity: 'Energy-efficient equipment',
          savings: 1200,
          effort: 'medium',
          timeline: '2 weeks'
        }
      ]
    }
  }

  private async analyzeSchedule(project: any): Promise<ScheduleAnalysis> {
    return {
      projectedCompletion: new Date(Date.now() + 82 * 24 * 60 * 60 * 1000),
      delayProbability: 0.25,
      criticalPath: ['Foundation', 'Framing', 'Electrical Rough-In', 'Plumbing', 'Drywall', 'Final'],
      bottlenecks: [
        {
          task: 'Electrical Rough-In',
          delayRisk: 0.3,
          impact: 5,
          mitigation: ['Additional electrician', 'Extended hours', 'Material pre-ordering']
        }
      ],
      resourceConflicts: [
        {
          resource: 'Crane',
          conflictDates: [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)],
          alternatives: ['Smaller crane', 'Manual lifting', 'Reschedule']
        }
      ]
    }
  }

  private async predictQuality(project: any): Promise<QualityPrediction> {
    return {
      riskAreas: [
        {
          area: 'Foundation',
          riskLevel: 0.3,
          indicators: ['Concrete temperature', 'Curing time', 'Weather conditions'],
          preventiveMeasures: ['Temperature monitoring', 'Proper curing', 'Weather protection']
        }
      ],
      inspectionReadiness: {
        foundation: 0.85,
        framing: 0.70,
        electrical: 0.60,
        plumbing: 0.50,
        final: 0.20
      },
      qualityTrends: [
        { metric: 'First-time pass rate', trend: 'improving', value: 0.85 },
        { metric: 'Rework incidents', trend: 'stable', value: 0.05 }
      ]
    }
  }

  private generateWeatherRecommendations(forecast: WeatherForecast[], project: any): string[] {
    const poorDays = forecast.filter(day => day.workability === 'poor' || day.workability === 'dangerous').length
    
    if (poorDays > 3) {
      return [
        'Consider temporary covered work areas',
        'Accelerate indoor work schedule',
        'Prepare for extended timeline',
        'Review weather contingency budget'
      ]
    }
    
    return [
      'Monitor daily weather updates',
      'Maintain flexible scheduling',
      'Keep materials covered and secure'
    ]
  }

  private async findBudgetOptimizations(project: any): Promise<any[]> {
    return [
      {
        category: 'Materials',
        currentCost: 120000,
        optimizedCost: 110000,
        savings: 10000,
        implementation: 'Negotiate bulk pricing with suppliers',
        risk: 'low' as const
      },
      {
        category: 'Equipment Rental',
        currentCost: 15000,
        optimizedCost: 12000,
        savings: 3000,
        implementation: 'Purchase frequently used equipment',
        risk: 'medium' as const
      }
    ]
  }

  private async analyzeVendorRates(project: any): Promise<any[]> {
    return [
      {
        vendor: 'Austin Lumber Co',
        category: 'Materials',
        currentRate: 125,
        marketRate: 115,
        savingsPotential: 2500,
        negotiationStrategy: ['Volume commitment', 'Payment terms', 'Multi-project discount']
      }
    ]
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    await this.researchService.disconnect()
  }
}

// Factory function
export function createPredictiveAnalyticsService(): PredictiveAnalyticsService {
  return new PredictiveAnalyticsService()
}