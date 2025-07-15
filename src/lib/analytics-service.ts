/**
 * Advanced Analytics and Reporting Service
 * Provides predictive insights, performance metrics, and comprehensive reporting
 */

export interface ProjectAnalytics {
  projectId: string
  generatedAt: Date
  
  // Timeline Analytics
  timeline: {
    originalDuration: number // days
    currentDuration: number
    actualDuration?: number
    daysOverdue: number
    completionPercentage: number
    criticalPath: string[]
    milestonePerformance: MilestoneMetric[]
    predictedCompletion: Date
    confidenceLevel: number
  }
  
  // Budget Analytics
  budget: {
    originalBudget: number
    currentBudget: number
    spentAmount: number
    commitedAmount: number
    remainingBudget: number
    variance: number
    variancePercentage: number
    burnRate: number // per day
    predictedFinalCost: number
    costByCategory: CategorySpend[]
    topCostDrivers: CostDriver[]
  }
  
  // Quality Metrics
  quality: {
    defectCount: number
    defectDensity: number // defects per unit
    reworkHours: number
    reworkCost: number
    clientSatisfactionScore?: number
    qualityTrend: QualityTrendPoint[]
    inspectionPassRate: number
  }
  
  // Team Performance
  team: {
    totalTeamMembers: number
    averageUtilization: number
    skillGaps: string[]
    topPerformers: TeamMember[]
    productivityMetrics: ProductivityMetric[]
    communicationEfficiency: number
  }
  
  // Vendor Performance
  vendors: {
    totalVendors: number
    onTimeDeliveryRate: number
    qualityScore: number
    costEfficiency: number
    topVendors: VendorPerformance[]
    riskVendors: VendorRisk[]
  }
  
  // Risk Analysis
  risks: {
    overallRiskScore: number // 0-100
    scheduleRisk: number
    budgetRisk: number
    qualityRisk: number
    weatherRisk: number
    supplyChainRisk: number
    topRisks: ProjectRisk[]
    mitigationRecommendations: string[]
  }
  
  // Predictive Insights
  predictions: {
    completionProbability: CompletionProbability
    budgetOverrunRisk: number
    qualityIssuesProbability: number
    weatherDelayRisk: number
    recommendedActions: PredictiveAction[]
  }
}

export interface MilestoneMetric {
  name: string
  plannedDate: Date
  actualDate?: Date
  daysVariance: number
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface CategorySpend {
  category: string
  budgeted: number
  spent: number
  variance: number
  variancePercentage: number
}

export interface CostDriver {
  description: string
  impact: number
  category: string
  controllable: boolean
}

export interface QualityTrendPoint {
  date: Date
  defectCount: number
  reworkHours: number
  satisfactionScore?: number
}

export interface TeamMember {
  id: string
  name: string
  role: string
  utilization: number
  productivity: number
  qualityScore: number
}

export interface ProductivityMetric {
  metric: string
  value: number
  unit: string
  trend: 'UP' | 'DOWN' | 'STABLE'
  benchmark: number
}

export interface VendorPerformance {
  vendorId: string
  name: string
  onTimeRate: number
  qualityScore: number
  costEfficiency: number
  overallScore: number
}

export interface VendorRisk {
  vendorId: string
  name: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  riskFactors: string[]
  impact: number
}

export interface ProjectRisk {
  id: string
  description: string
  probability: number
  impact: number
  riskScore: number
  category: 'SCHEDULE' | 'BUDGET' | 'QUALITY' | 'SAFETY' | 'EXTERNAL'
  mitigation: string
  owner: string
  status: 'OPEN' | 'MITIGATED' | 'CLOSED'
}

export interface CompletionProbability {
  onTime: number
  within1Week: number
  within2Weeks: number
  within1Month: number
  moreThan1Month: number
}

export interface PredictiveAction {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  category: string
  action: string
  expectedImpact: string
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  deadline?: Date
}

export interface WeatherAnalytics {
  location: string
  analysisDate: Date
  
  current: {
    conditions: string
    temperature: number
    humidity: number
    windSpeed: number
    workability: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'UNSAFE'
  }
  
  forecast: {
    next7Days: DayForecast[]
    next30Days: WeatherSummary
    workableDays: number
    riskDays: number
  }
  
  impact: {
    scheduleRisk: number
    recommendedDelays: DelayRecommendation[]
    alternativeActivities: string[]
    seasonalConsiderations: string[]
  }
  
  historical: {
    averageWorkableDays: number
    historicalDelays: number
    seasonalPatterns: SeasonalPattern[]
  }
}

export interface DayForecast {
  date: Date
  conditions: string
  highTemp: number
  lowTemp: number
  precipitation: number
  windSpeed: number
  workability: string
  recommendedActivities: string[]
  restrictedActivities: string[]
}

export interface WeatherSummary {
  averageTemp: number
  totalPrecipitation: number
  workableDays: number
  highRiskDays: number
}

export interface DelayRecommendation {
  activity: string
  recommendedDelay: number // days
  reason: string
  alternativeStart: Date
}

export interface SeasonalPattern {
  month: string
  averageWorkableDays: number
  commonDelays: string[]
  recommendations: string[]
}

class AnalyticsService {
  /**
   * Generate comprehensive project analytics
   */
  async generateProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    try {
      const response = await fetch(`/api/analytics/project/${projectId}`)
      if (!response.ok) throw new Error('Failed to fetch project analytics')
      return await response.json()
    } catch (error) {
      console.error('Error generating project analytics:', error)
      throw error
    }
  }

  /**
   * Get weather analytics for project location
   */
  async getWeatherAnalytics(location: string): Promise<WeatherAnalytics> {
    try {
      const response = await fetch(`/api/analytics/weather?location=${encodeURIComponent(location)}`)
      if (!response.ok) throw new Error('Failed to fetch weather analytics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching weather analytics:', error)
      throw error
    }
  }

  /**
   * Calculate project risk score
   */
  calculateRiskScore(metrics: {
    budgetVariance: number
    scheduleVariance: number
    qualityScore: number
    teamUtilization: number
    vendorPerformance: number
    weatherRisk: number
  }): number {
    const weights = {
      budget: 0.25,
      schedule: 0.25,
      quality: 0.20,
      team: 0.15,
      vendor: 0.10,
      weather: 0.05
    }

    // Normalize all metrics to 0-100 scale where 100 is highest risk
    const normalizedMetrics = {
      budget: Math.min(Math.abs(metrics.budgetVariance) * 2, 100),
      schedule: Math.min(Math.abs(metrics.scheduleVariance) * 2, 100),
      quality: Math.max(0, 100 - metrics.qualityScore),
      team: Math.max(0, 100 - metrics.teamUtilization),
      vendor: Math.max(0, 100 - metrics.vendorPerformance),
      weather: metrics.weatherRisk
    }

    const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (normalizedMetrics[key as keyof typeof normalizedMetrics] * weight)
    }, 0)

    return Math.round(weightedScore)
  }

  /**
   * Generate predictive insights
   */
  async generatePredictiveInsights(projectId: string): Promise<PredictiveAction[]> {
    try {
      const response = await fetch(`/api/analytics/predictions/${projectId}`)
      if (!response.ok) throw new Error('Failed to generate predictions')
      return await response.json()
    } catch (error) {
      console.error('Error generating predictive insights:', error)
      throw error
    }
  }

  /**
   * Calculate budget burn rate
   */
  calculateBurnRate(spentAmount: number, startDate: Date, currentDate: Date = new Date()): number {
    const daysElapsed = Math.max(1, (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return spentAmount / daysElapsed
  }

  /**
   * Predict project completion date
   */
  predictCompletionDate(
    currentProgress: number,
    currentDate: Date = new Date(),
    historicalVelocity?: number
  ): { date: Date; confidence: number } {
    // Simple linear prediction - in production would use more sophisticated ML models
    const remainingWork = 100 - currentProgress
    const velocity = historicalVelocity || 1 // percent per day
    
    const daysToComplete = remainingWork / velocity
    const predictedDate = new Date(currentDate.getTime() + (daysToComplete * 24 * 60 * 60 * 1000))
    
    // Confidence decreases with longer predictions
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (daysToComplete / 365)))
    
    return { date: predictedDate, confidence }
  }

  /**
   * Analyze vendor performance trends
   */
  analyzeVendorPerformance(vendorData: any[]): VendorPerformance[] {
    return vendorData.map(vendor => {
      const onTimeRate = this.calculateOnTimeRate(vendor.deliveries || [])
      const qualityScore = this.calculateQualityScore(vendor.qualityMetrics || {})
      const costEfficiency = this.calculateCostEfficiency(vendor.pricing || {})
      
      return {
        vendorId: vendor.id,
        name: vendor.name,
        onTimeRate,
        qualityScore,
        costEfficiency,
        overallScore: (onTimeRate + qualityScore + costEfficiency) / 3
      }
    }).sort((a, b) => b.overallScore - a.overallScore)
  }

  /**
   * Generate performance benchmarks
   */
  generateBenchmarks(industryData?: any): Record<string, number> {
    return {
      budgetVariance: 5, // +/- 5% considered good
      scheduleVariance: 7, // +/- 7 days considered good
      qualityScore: 85, // 85+ considered good
      teamUtilization: 80, // 80%+ considered good
      vendorOnTime: 90, // 90%+ considered good
      inspectionPassRate: 95, // 95%+ considered good
      clientSatisfaction: 4.5, // 4.5/5 considered good
      reworkRate: 2, // <2% considered good
      defectDensity: 0.1, // <0.1 defects per unit considered good
      costPerSqFt: industryData?.avgCostPerSqFt || 150 // Industry average
    }
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(analytics: ProjectAnalytics): {
    status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL'
    keyMetrics: Array<{ metric: string; value: string; status: string }>
    topIssues: string[]
    recommendations: string[]
  } {
    const status = analytics.risks.overallRiskScore < 30 ? 'ON_TRACK' :
                  analytics.risks.overallRiskScore < 60 ? 'AT_RISK' : 'CRITICAL'

    const keyMetrics = [
      {
        metric: 'Schedule',
        value: `${analytics.timeline.completionPercentage}% complete`,
        status: analytics.timeline.daysOverdue > 0 ? 'BEHIND' : 'ON_TRACK'
      },
      {
        metric: 'Budget',
        value: `${analytics.budget.variancePercentage.toFixed(1)}% variance`,
        status: Math.abs(analytics.budget.variancePercentage) > 10 ? 'OVER' : 'ON_TRACK'
      },
      {
        metric: 'Quality',
        value: `${analytics.quality.defectCount} defects`,
        status: analytics.quality.defectCount > 5 ? 'POOR' : 'GOOD'
      },
      {
        metric: 'Team',
        value: `${analytics.team.averageUtilization}% utilized`,
        status: analytics.team.averageUtilization < 70 ? 'LOW' : 'GOOD'
      }
    ]

    const topIssues = analytics.risks.topRisks
      .slice(0, 3)
      .map(risk => risk.description)

    const recommendations = analytics.predictions.recommendedActions
      .filter(action => action.priority === 'HIGH')
      .slice(0, 3)
      .map(action => action.action)

    return { status, keyMetrics, topIssues, recommendations }
  }

  // Private helper methods

  private calculateOnTimeRate(deliveries: any[]): number {
    if (deliveries.length === 0) return 0
    const onTimeDeliveries = deliveries.filter(d => 
      new Date(d.actualDate) <= new Date(d.promisedDate)
    ).length
    return (onTimeDeliveries / deliveries.length) * 100
  }

  private calculateQualityScore(qualityMetrics: any): number {
    // Weighted average of quality factors
    const factors = {
      defectRate: (qualityMetrics.defectRate || 0) * -10, // Lower is better
      customerSatisfaction: (qualityMetrics.customerSatisfaction || 5) * 20,
      reworkRate: (qualityMetrics.reworkRate || 0) * -15
    }
    
    return Math.max(0, Math.min(100, 
      factors.customerSatisfaction + factors.defectRate + factors.reworkRate
    ))
  }

  private calculateCostEfficiency(pricing: any): number {
    const marketRate = pricing.marketRate || pricing.quoted || 100
    const actualCost = pricing.actual || pricing.quoted || 100
    
    // Efficiency improves when actual cost is below market rate
    const efficiency = ((marketRate - actualCost) / marketRate) * 100
    return Math.max(0, Math.min(100, 50 + efficiency)) // Normalized to 0-100
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

export default analyticsService