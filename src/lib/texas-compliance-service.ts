/**
 * Texas-Specific Compliance Service
 * Handles Texas building regulations, Liberty Hill requirements, and owner-builder workflows
 */

import { PrismaClient } from '@prisma/client'
import { createResearchService } from './research-service'

interface TexasComplianceRequirement {
  id: string
  category: 'PERMIT' | 'INSPECTION' | 'LICENSE' | 'INSURANCE' | 'HOA' | 'UTILITY'
  requirement: string
  description: string
  authority: string
  jurisdiction: 'TEXAS' | 'WILLIAMSON_COUNTY' | 'LIBERTY_HILL' | 'HOA'
  applicableWhen: string
  requiredDocuments: string[]
  cost: {
    baseAmount: number
    calculationMethod: 'FIXED' | 'PERCENTAGE' | 'SQUARE_FOOTAGE' | 'VALUATION'
    additionalFees: Array<{
      name: string
      amount: number
      condition: string
    }>
  }
  timeline: {
    applicationPeriod: string
    processingTime: string
    validityPeriod: string
    renewalRequired: boolean
  }
  inspectionRequirements?: {
    phases: string[]
    inspector: string
    schedulingLeadTime: string
    reinspectionFee: number
  }
  ownerBuilderSpecific: {
    isRequired: boolean
    exemptionAvailable: boolean
    additionalRequirements: string[]
    restrictions: string[]
  }
}

interface LibertyHillRequirement {
  type: string
  description: string
  department: string
  contactInfo: {
    phone: string
    email: string
    office: string
    hours: string
  }
  process: {
    applicationMethod: 'ONLINE' | 'IN_PERSON' | 'MAIL'
    requiredForms: string[]
    supportingDocuments: string[]
    processingSteps: string[]
  }
  fees: {
    baseFee: number
    additionalFees: Array<{
      name: string
      amount: number
      condition: string
    }>
  }
  timeline: string
  inspectionSchedule?: {
    phases: string[]
    notice: string
    reschedule: string
  }
}

interface ComplianceWorkflow {
  workType: string
  projectPhase: 'PLANNING' | 'DESIGN' | 'PERMIT' | 'CONSTRUCTION' | 'FINAL'
  steps: ComplianceStep[]
  totalEstimatedCost: number
  totalEstimatedTime: string
  criticalPath: string[]
  ownerBuilderNotes: string[]
}

interface ComplianceStep {
  id: string
  title: string
  description: string
  authority: string
  dependencies: string[]
  documents: string[]
  estimatedCost: number
  estimatedTime: string
  dueDate?: Date
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'EXPIRED'
  criticalPath: boolean
  ownerBuilderSpecific: boolean
}

export class TexasComplianceService {
  private prisma: PrismaClient
  private researchService: any

  constructor() {
    this.prisma = new PrismaClient()
    this.researchService = createResearchService()
  }

  /**
   * Get compliance requirements for specific work type in Liberty Hill
   */
  async getComplianceRequirements(
    workType: string,
    projectValue: number,
    isOwnerBuilder: boolean = true,
    hoaRequired: boolean = false
  ): Promise<{
    texasRequirements: TexasComplianceRequirement[]
    libertyHillRequirements: LibertyHillRequirement[]
    workflow: ComplianceWorkflow
    estimatedCosts: {
      permits: number
      inspections: number
      total: number
    }
  }> {
    try {
      // Get dynamic compliance data from research service
      const complianceData = await this.researchService.checkCompliance(
        workType,
        'Liberty Hill, TX'
      )

      const texasRequirements = await this.getTexasRequirements(
        workType, 
        projectValue, 
        isOwnerBuilder
      )
      
      const libertyHillRequirements = await this.getLibertyHillRequirements(
        workType,
        projectValue,
        hoaRequired
      )

      const workflow = await this.generateComplianceWorkflow(
        workType,
        texasRequirements,
        libertyHillRequirements,
        isOwnerBuilder
      )

      const estimatedCosts = this.calculateComplianceCosts(
        texasRequirements,
        libertyHillRequirements
      )

      return {
        texasRequirements,
        libertyHillRequirements,
        workflow,
        estimatedCosts
      }
    } catch (error) {
      console.error('Compliance requirements lookup failed:', error)
      throw new Error(`Failed to get compliance requirements: ${error.message}`)
    }
  }

  /**
   * Track compliance progress for a project
   */
  async trackComplianceProgress(
    projectId: string,
    workflowId: string
  ): Promise<{
    completedSteps: number
    totalSteps: number
    nextDeadline: Date | null
    overdueTasks: ComplianceStep[]
    upcomingTasks: ComplianceStep[]
    estimatedCompletion: Date
  }> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          decisions: {
            where: {
              category: 'COMPLIANCE',
              status: 'APPROVED'
            }
          }
        }
      })

      if (!project) {
        throw new Error('Project not found')
      }

      const workflow = await this.getStoredWorkflow(workflowId)
      const completedSteps = workflow.steps.filter(s => s.status === 'COMPLETED').length
      const overdueTasks = workflow.steps.filter(s => 
        s.dueDate && s.dueDate < new Date() && s.status !== 'COMPLETED'
      )
      const upcomingTasks = workflow.steps.filter(s => 
        s.status === 'NOT_STARTED' && s.dependencies.every(dep => 
          workflow.steps.find(step => step.id === dep)?.status === 'COMPLETED'
        )
      ).slice(0, 5)

      return {
        completedSteps,
        totalSteps: workflow.steps.length,
        nextDeadline: this.getNextDeadline(workflow.steps),
        overdueTasks,
        upcomingTasks,
        estimatedCompletion: this.calculateEstimatedCompletion(workflow.steps)
      }
    } catch (error) {
      console.error('Compliance tracking failed:', error)
      throw new Error(`Failed to track compliance progress: ${error.message}`)
    }
  }

  /**
   * Generate compliance checklist for owner-builders
   */
  async generateOwnerBuilderChecklist(
    workType: string,
    projectValue: number
  ): Promise<{
    preConstruction: string[]
    duringConstruction: string[]
    postConstruction: string[]
    commonMistakes: string[]
    resources: Array<{
      title: string
      url: string
      description: string
    }>
  }> {
    try {
      const requirements = await this.getComplianceRequirements(
        workType,
        projectValue,
        true
      )

      return {
        preConstruction: [
          'Verify property boundaries and setbacks',
          'Obtain building permit from Liberty Hill',
          'Submit plans for HOA approval (if applicable)',
          'Schedule required inspections',
          'Verify utility availability and connections',
          'Confirm insurance coverage for construction',
          'Post building permit on-site',
          'Establish temporary utilities if needed'
        ],
        duringConstruction: [
          'Call for inspections 24 hours in advance',
          'Ensure all work stops until inspection passes',
          'Keep permit and approved plans on-site',
          'Document progress with photos',
          'Maintain daily construction log',
          'Secure site and materials properly',
          'Follow noise ordinances and work hours',
          'Coordinate with neighbors for disruptions'
        ],
        postConstruction: [
          'Schedule final inspection',
          'Obtain certificate of occupancy',
          'Submit as-built drawings (if required)',
          'Update property records with improvements',
          'Notify insurance company of completion',
          'File final HOA approval documents',
          'Update property tax assessment',
          'Retain all permits and inspection records'
        ],
        commonMistakes: [
          'Starting work before permit approval',
          'Missing required inspections',
          'Not following approved plans',
          'Inadequate setback compliance',
          'Missing utility disconnects/connections',
          'Improper waste disposal',
          'Working during restricted hours',
          'Not coordinating with neighbors'
        ],
        resources: [
          {
            title: 'Liberty Hill Building Department',
            url: 'https://www.libertyhill.org/building',
            description: 'Official building permits and inspection information'
          },
          {
            title: 'Texas Owner-Builder Guide',
            url: 'https://www.texas.gov/owner-builder',
            description: 'State requirements for owner-builder construction'
          },
          {
            title: 'Williamson County Building Codes',
            url: 'https://www.wilco.org/building',
            description: 'County-level building code information'
          }
        ]
      }
    } catch (error) {
      console.error('Owner-builder checklist generation failed:', error)
      throw new Error(`Failed to generate checklist: ${error.message}`)
    }
  }

  /**
   * Liberty Hill specific permit tracking
   */
  async trackLibertyHillPermit(
    permitNumber: string,
    projectId: string
  ): Promise<{
    permitStatus: string
    issuedDate: Date | null
    expirationDate: Date | null
    inspectionHistory: Array<{
      type: string
      date: Date
      result: 'PASS' | 'FAIL' | 'PARTIAL'
      inspector: string
      notes: string
    }>
    nextInspection: {
      type: string
      scheduledDate: Date | null
      requirements: string[]
    } | null
    fees: {
      paid: number
      outstanding: number
      breakdown: Array<{
        description: string
        amount: number
        dueDate: Date
      }>
    }
  }> {
    try {
      // Store permit tracking in project
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          libertyHillPermitNumber: permitNumber
        }
      })

      // Mock implementation - would integrate with actual Liberty Hill permit system
      return {
        permitStatus: 'ACTIVE',
        issuedDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        inspectionHistory: [],
        nextInspection: {
          type: 'Foundation',
          scheduledDate: null,
          requirements: ['Completed foundation work', 'Proper rebar placement']
        },
        fees: {
          paid: 500,
          outstanding: 0,
          breakdown: []
        }
      }
    } catch (error) {
      console.error('Permit tracking failed:', error)
      throw new Error(`Failed to track permit: ${error.message}`)
    }
  }

  // Private helper methods
  private async getTexasRequirements(
    workType: string,
    projectValue: number,
    isOwnerBuilder: boolean
  ): Promise<TexasComplianceRequirement[]> {
    const requirements: TexasComplianceRequirement[] = []

    // Building Permit Requirement
    if (this.requiresBuildingPermit(workType)) {
      requirements.push({
        id: 'tx-building-permit',
        category: 'PERMIT',
        requirement: 'Texas Building Permit',
        description: 'Building permit required for new construction and major renovations',
        authority: 'Local Building Authority',
        jurisdiction: 'TEXAS',
        applicableWhen: 'New construction or structural modifications',
        requiredDocuments: ['Building plans', 'Site survey', 'Energy compliance'],
        cost: {
          baseAmount: this.calculatePermitFee(projectValue),
          calculationMethod: 'VALUATION',
          additionalFees: []
        },
        timeline: {
          applicationPeriod: '30 days',
          processingTime: '2-3 weeks',
          validityPeriod: '12 months',
          renewalRequired: true
        },
        inspectionRequirements: {
          phases: ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'Final'],
          inspector: 'Certified Building Inspector',
          schedulingLeadTime: '24 hours',
          reinspectionFee: 100
        },
        ownerBuilderSpecific: {
          isRequired: true,
          exemptionAvailable: isOwnerBuilder,
          additionalRequirements: isOwnerBuilder ? [
            'Owner-builder affidavit',
            'Property ownership verification',
            'Personal residence verification'
          ] : [],
          restrictions: isOwnerBuilder ? [
            'Must personally occupy property for 1 year',
            'Cannot sell within 1 year without contractor licensing',
            'Limited to primary residence only'
          ] : []
        }
      })
    }

    return requirements
  }

  private async getLibertyHillRequirements(
    workType: string,
    projectValue: number,
    hoaRequired: boolean
  ): Promise<LibertyHillRequirement[]> {
    const requirements: LibertyHillRequirement[] = []

    // Liberty Hill Building Permit
    requirements.push({
      type: 'Building Permit',
      description: 'Liberty Hill municipal building permit for construction projects',
      department: 'Building & Development Services',
      contactInfo: {
        phone: '(512) 515-5100',
        email: 'building@libertyhill.org',
        office: '111 W San Antonio St, Liberty Hill, TX 78642',
        hours: 'Mon-Fri 8:00 AM - 5:00 PM'
      },
      process: {
        applicationMethod: 'ONLINE',
        requiredForms: ['Building Permit Application', 'Site Plan'],
        supportingDocuments: [
          'Construction drawings',
          'Plot plan showing setbacks',
          'Structural calculations (if required)',
          'Energy compliance certificate'
        ],
        processingSteps: [
          'Submit complete application',
          'Plan review by city staff',
          'Address any review comments',
          'Pay permit fees',
          'Permit issuance'
        ]
      },
      fees: {
        baseFee: 200,
        additionalFees: [
          {
            name: 'Plan Review Fee',
            amount: Math.max(100, projectValue * 0.001),
            condition: 'All projects'
          },
          {
            name: 'Impact Fee',
            amount: 2500,
            condition: 'New construction only'
          }
        ]
      },
      timeline: '10-15 business days',
      inspectionSchedule: {
        phases: ['Footing', 'Foundation', 'Framing', 'Electrical', 'Final'],
        notice: '24 hours advance notice required',
        reschedule: 'Must reschedule if failed inspection'
      }
    })

    return requirements
  }

  private async generateComplianceWorkflow(
    workType: string,
    texasRequirements: TexasComplianceRequirement[],
    libertyHillRequirements: LibertyHillRequirement[],
    isOwnerBuilder: boolean
  ): Promise<ComplianceWorkflow> {
    const steps: ComplianceStep[] = []

    // Pre-construction steps
    steps.push({
      id: 'site-survey',
      title: 'Obtain Site Survey',
      description: 'Professional survey to establish property boundaries and setbacks',
      authority: 'Licensed Surveyor',
      dependencies: [],
      documents: ['Property deed', 'Survey request'],
      estimatedCost: 800,
      estimatedTime: '3-5 days',
      status: 'NOT_STARTED',
      criticalPath: true,
      ownerBuilderSpecific: false
    })

    steps.push({
      id: 'building-plans',
      title: 'Prepare Building Plans',
      description: 'Architectural and engineering plans meeting code requirements',
      authority: 'Licensed Architect/Engineer',
      dependencies: ['site-survey'],
      documents: ['Architectural drawings', 'Structural plans', 'Engineering calculations'],
      estimatedCost: isOwnerBuilder ? 2000 : 5000,
      estimatedTime: '2-4 weeks',
      status: 'NOT_STARTED',
      criticalPath: true,
      ownerBuilderSpecific: false
    })

    // Add permit application step
    steps.push({
      id: 'permit-application',
      title: 'Submit Building Permit Application',
      description: 'Submit complete permit application to Liberty Hill',
      authority: 'Liberty Hill Building Department',
      dependencies: ['building-plans'],
      documents: ['Building permit application', 'Building plans', 'Site survey'],
      estimatedCost: 500,
      estimatedTime: '1 day',
      status: 'NOT_STARTED',
      criticalPath: true,
      ownerBuilderSpecific: false
    })

    const totalCost = steps.reduce((sum, step) => sum + step.estimatedCost, 0)

    return {
      workType,
      projectPhase: 'PLANNING',
      steps,
      totalEstimatedCost: totalCost,
      totalEstimatedTime: '6-10 weeks',
      criticalPath: steps.filter(s => s.criticalPath).map(s => s.id),
      ownerBuilderNotes: [
        'Owner-builder exemption applies to personal residence only',
        'Must occupy property for minimum 1 year after completion',
        'Additional insurance requirements may apply',
        'Consider hiring licensed professionals for complex work'
      ]
    }
  }

  private calculateComplianceCosts(
    texasRequirements: TexasComplianceRequirement[],
    libertyHillRequirements: LibertyHillRequirement[]
  ): { permits: number; inspections: number; total: number } {
    const permitCosts = texasRequirements.reduce((sum, req) => sum + req.cost.baseAmount, 0) +
                      libertyHillRequirements.reduce((sum, req) => sum + req.fees.baseFee, 0)
    
    const inspectionCosts = texasRequirements
      .filter(req => req.inspectionRequirements)
      .reduce((sum, req) => sum + (req.inspectionRequirements?.reinspectionFee || 0), 0)

    return {
      permits: permitCosts,
      inspections: inspectionCosts,
      total: permitCosts + inspectionCosts
    }
  }

  private requiresBuildingPermit(workType: string): boolean {
    const permitRequired = [
      'new construction',
      'addition',
      'structural modification',
      'electrical work',
      'plumbing work',
      'hvac installation'
    ]
    
    return permitRequired.some(type => 
      workType.toLowerCase().includes(type.toLowerCase())
    )
  }

  private calculatePermitFee(projectValue: number): number {
    // Texas standard permit fee calculation
    if (projectValue < 1000) return 50
    if (projectValue < 50000) return 200 + (projectValue * 0.005)
    return 450 + (projectValue * 0.003)
  }

  private async getStoredWorkflow(workflowId: string): Promise<ComplianceWorkflow> {
    // Mock implementation - would retrieve from database
    throw new Error('Workflow storage not implemented')
  }

  private getNextDeadline(steps: ComplianceStep[]): Date | null {
    const upcomingDates = steps
      .filter(s => s.dueDate && s.status !== 'COMPLETED')
      .map(s => s.dueDate!)
      .sort((a, b) => a.getTime() - b.getTime())
    
    return upcomingDates.length > 0 ? upcomingDates[0] : null
  }

  private calculateEstimatedCompletion(steps: ComplianceStep[]): Date {
    const incompleteDays = steps
      .filter(s => s.status !== 'COMPLETED')
      .reduce((total, step) => {
        const match = step.estimatedTime.match(/(\d+)/)
        return total + (match ? parseInt(match[1]) : 7)
      }, 0)

    return new Date(Date.now() + incompleteDays * 24 * 60 * 60 * 1000)
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    await this.researchService.disconnect()
  }
}

// Factory function
export function createTexasComplianceService(): TexasComplianceService {
  return new TexasComplianceService()
}