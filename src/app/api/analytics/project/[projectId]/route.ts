import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService, type ProjectAnalytics } from '@/lib/analytics-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    
    // Get project data with all related information
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        phases: true,
        tasks: {
          include: {
            timeEntries: true,
            assignedTo: true
          }
        },
        budgetItems: {
          include: {
            category: true,
            supplier: true
          }
        },
        expenses: true,
        inspections: true,
        communications: true,
        issues: true,
        metrics: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate timeline analytics
    const timeline = calculateTimelineAnalytics(project)
    
    // Calculate budget analytics
    const budget = calculateBudgetAnalytics(project)
    
    // Calculate quality metrics
    const quality = calculateQualityMetrics(project)
    
    // Calculate team performance
    const team = calculateTeamPerformance(project)
    
    // Calculate vendor performance
    const vendors = calculateVendorPerformance(project)
    
    // Calculate risks
    const risks = calculateRiskAnalysis(project, { timeline, budget, quality, team, vendors })
    
    // Generate predictions
    const predictions = generatePredictions(project, { timeline, budget, quality, risks })

    const analytics: ProjectAnalytics = {
      projectId,
      generatedAt: new Date(),
      timeline,
      budget,
      quality,
      team,
      vendors,
      risks,
      predictions
    }

    // Update project metrics in database
    await updateProjectMetrics(projectId, analytics)

    return NextResponse.json(analytics)
    
  } catch (error) {
    console.error('Analytics generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}

// Helper functions

function calculateTimelineAnalytics(project: any) {
  const now = new Date()
  const startDate = project.actualStartDate || project.estimatedStartDate
  const endDate = project.estimatedEndDate
  
  let originalDuration = 0
  let currentDuration = 0
  let daysOverdue = 0
  
  if (startDate && endDate) {
    originalDuration = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    currentDuration = Math.ceil((now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    
    if (now > new Date(endDate) && project.status !== 'COMPLETE') {
      daysOverdue = Math.ceil((now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  const completionPercentage = project.completionPercentage || 0
  
  // Simple prediction based on current velocity
  const daysElapsed = Math.max(1, currentDuration)
  const velocity = completionPercentage / daysElapsed
  const remainingWork = 100 - completionPercentage
  const predictedDaysRemaining = velocity > 0 ? remainingWork / velocity : 30
  const predictedCompletion = new Date(now.getTime() + (predictedDaysRemaining * 24 * 60 * 60 * 1000))

  return {
    originalDuration,
    currentDuration,
    actualDuration: project.status === 'COMPLETE' ? currentDuration : undefined,
    daysOverdue,
    completionPercentage,
    criticalPath: ['Foundation', 'Framing', 'Roofing', 'Interior'], // Simplified
    milestonePerformance: [],
    predictedCompletion,
    confidenceLevel: Math.max(0.3, Math.min(0.9, 1 - (daysOverdue / 30)))
  }
}

function calculateBudgetAnalytics(project: any) {
  const originalBudget = project.estimatedCost || 0
  const currentBudget = project.estimatedCost || 0
  const spentAmount = project.actualCost || 0
  
  const budgetItems = project.budgetItems || []
  const commitedAmount = budgetItems.reduce((sum: number, item: any) => 
    sum + (item.estimatedTotal || 0), 0)
  
  const remainingBudget = currentBudget - spentAmount
  const variance = spentAmount - originalBudget
  const variancePercentage = originalBudget > 0 ? (variance / originalBudget) * 100 : 0
  
  // Calculate burn rate
  const startDate = project.actualStartDate || project.estimatedStartDate
  const burnRate = startDate ? analyticsService.calculateBurnRate(spentAmount, new Date(startDate)) : 0
  
  // Predict final cost based on current trajectory
  const predictedFinalCost = spentAmount + (remainingBudget * 1.1) // Add 10% buffer

  // Group spending by category
  const categorySpends = budgetItems.reduce((acc: any, item: any) => {
    const categoryName = item.category?.name || 'Other'
    if (!acc[categoryName]) {
      acc[categoryName] = { budgeted: 0, spent: 0 }
    }
    acc[categoryName].budgeted += item.estimatedTotal || 0
    acc[categoryName].spent += item.actualTotal || 0
    return acc
  }, {})

  const costByCategory = Object.entries(categorySpends).map(([category, data]: [string, any]) => ({
    category,
    budgeted: data.budgeted,
    spent: data.spent,
    variance: data.spent - data.budgeted,
    variancePercentage: data.budgeted > 0 ? ((data.spent - data.budgeted) / data.budgeted) * 100 : 0
  }))

  return {
    originalBudget,
    currentBudget,
    spentAmount,
    commitedAmount,
    remainingBudget,
    variance,
    variancePercentage,
    burnRate,
    predictedFinalCost,
    costByCategory,
    topCostDrivers: []
  }
}

function calculateQualityMetrics(project: any) {
  const issues = project.issues || []
  const inspections = project.inspections || []
  
  const defectCount = issues.filter((issue: any) => 
    issue.category === 'QUALITY' && issue.status === 'OPEN'
  ).length
  
  const passedInspections = inspections.filter((inspection: any) => 
    inspection.passed === true
  ).length
  
  const inspectionPassRate = inspections.length > 0 ? 
    (passedInspections / inspections.length) * 100 : 100

  return {
    defectCount,
    defectDensity: defectCount / Math.max(1, project.homeSize || 1000), // defects per sq ft
    reworkHours: 0, // Would be calculated from time entries
    reworkCost: 0,
    clientSatisfactionScore: undefined,
    qualityTrend: [],
    inspectionPassRate
  }
}

function calculateTeamPerformance(project: any) {
  const tasks = project.tasks || []
  const timeEntries = project.tasks?.flatMap((task: any) => task.timeEntries || []) || []
  
  const teamMembers = new Set(tasks.map((task: any) => task.assignedToId).filter(Boolean))
  const totalHours = timeEntries.reduce((sum: number, entry: any) => sum + (entry.duration || 0), 0)
  const completedTasks = tasks.filter((task: any) => task.status === 'COMPLETE').length
  
  const averageUtilization = teamMembers.size > 0 ? 
    Math.min(100, (totalHours / (teamMembers.size * 40 * 4)) * 100) : 0 // Assuming 40 hrs/week for 4 weeks

  return {
    totalTeamMembers: teamMembers.size,
    averageUtilization,
    skillGaps: [],
    topPerformers: [],
    productivityMetrics: [
      {
        metric: 'Tasks per Week',
        value: completedTasks / 4, // Assuming 4 weeks
        unit: 'tasks',
        trend: 'STABLE' as const,
        benchmark: 5
      }
    ],
    communicationEfficiency: 85 // Default value
  }
}

function calculateVendorPerformance(project: any) {
  const budgetItems = project.budgetItems || []
  const vendors = budgetItems.filter((item: any) => item.supplier).map((item: any) => item.supplier)
  const uniqueVendors = vendors.filter((vendor: any, index: number, self: any[]) => 
    self.findIndex(v => v.id === vendor.id) === index
  )

  return {
    totalVendors: uniqueVendors.length,
    onTimeDeliveryRate: 90, // Default - would be calculated from actual deliveries
    qualityScore: 85, // Default
    costEfficiency: 80, // Default
    topVendors: [],
    riskVendors: []
  }
}

function calculateRiskAnalysis(project: any, metrics: any) {
  const budgetRisk = Math.min(100, Math.abs(metrics.budget.variancePercentage) * 2)
  const scheduleRisk = Math.min(100, Math.max(0, metrics.timeline.daysOverdue * 3))
  const qualityRisk = Math.min(100, metrics.quality.defectCount * 10)
  
  const overallRiskScore = analyticsService.calculateRiskScore({
    budgetVariance: metrics.budget.variancePercentage,
    scheduleVariance: metrics.timeline.daysOverdue,
    qualityScore: 100 - qualityRisk,
    teamUtilization: metrics.team.averageUtilization,
    vendorPerformance: metrics.vendors.qualityScore,
    weatherRisk: 20 // Default
  })

  return {
    overallRiskScore,
    scheduleRisk,
    budgetRisk,
    qualityRisk,
    weatherRisk: 20,
    supplyChainRisk: 15,
    topRisks: [],
    mitigationRecommendations: []
  }
}

function generatePredictions(project: any, metrics: any) {
  const { date: predictedCompletion, confidence } = analyticsService.predictCompletionDate(
    metrics.timeline.completionPercentage,
    new Date()
  )

  return {
    completionProbability: {
      onTime: confidence,
      within1Week: Math.min(1, confidence + 0.1),
      within2Weeks: Math.min(1, confidence + 0.2),
      within1Month: Math.min(1, confidence + 0.3),
      moreThan1Month: 1 - confidence
    },
    budgetOverrunRisk: Math.min(100, Math.abs(metrics.budget.variancePercentage) * 1.5),
    qualityIssuesProbability: metrics.quality.defectCount * 5,
    weatherDelayRisk: 20,
    recommendedActions: []
  }
}

async function updateProjectMetrics(projectId: string, analytics: ProjectAnalytics) {
  try {
    await prisma.projectMetrics.upsert({
      where: { projectId },
      update: {
        originalDuration: analytics.timeline.originalDuration,
        currentDuration: analytics.timeline.currentDuration,
        actualDuration: analytics.timeline.actualDuration,
        daysOverdue: analytics.timeline.daysOverdue,
        completionPercentage: analytics.timeline.completionPercentage,
        originalBudget: analytics.budget.originalBudget,
        currentBudget: analytics.budget.currentBudget,
        spentAmount: analytics.budget.spentAmount,
        variance: analytics.budget.variance,
        variancePercentage: analytics.budget.variancePercentage,
        defectCount: analytics.quality.defectCount,
        reworkHours: analytics.quality.reworkHours,
        tasksCompleted: 0, // Would be calculated
        tasksTotal: 0, // Would be calculated
        teamUtilization: analytics.team.averageUtilization,
        vendorOnTimeRate: analytics.vendors.onTimeDeliveryRate,
        averageVendorScore: analytics.vendors.qualityScore,
        riskScore: analytics.risks.overallRiskScore,
        successProbability: analytics.predictions.completionProbability.onTime,
        insights: analytics,
        lastCalculated: new Date()
      },
      create: {
        projectId,
        originalDuration: analytics.timeline.originalDuration,
        currentDuration: analytics.timeline.currentDuration,
        actualDuration: analytics.timeline.actualDuration,
        daysOverdue: analytics.timeline.daysOverdue,
        completionPercentage: analytics.timeline.completionPercentage,
        originalBudget: analytics.budget.originalBudget,
        currentBudget: analytics.budget.currentBudget,
        spentAmount: analytics.budget.spentAmount,
        variance: analytics.budget.variance,
        variancePercentage: analytics.budget.variancePercentage,
        defectCount: analytics.quality.defectCount,
        reworkHours: analytics.quality.reworkHours,
        tasksCompleted: 0,
        tasksTotal: 0,
        teamUtilization: analytics.team.averageUtilization,
        vendorOnTimeRate: analytics.vendors.onTimeDeliveryRate,
        averageVendorScore: analytics.vendors.qualityScore,
        riskScore: analytics.risks.overallRiskScore,
        successProbability: analytics.predictions.completionProbability.onTime,
        insights: analytics,
        lastCalculated: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to update project metrics:', error)
  }
}