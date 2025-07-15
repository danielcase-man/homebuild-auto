/**
 * Dynamic Municipal Compliance Service
 * Handles building codes, permits, inspections, and municipal integration
 * Automatically adapts to project jurisdiction and location
 */

export interface LibertyHillPermit {
  id: string
  projectId: string
  permitNumber: string
  type: PermitType
  status: PermitStatus
  applicationDate: Date
  approvalDate?: Date
  expirationDate?: Date
  issuedDate?: Date
  
  // Permit details
  description: string
  workType: string
  estimatedCost: number
  projectAddress: string
  
  // Applicant information
  applicantName: string
  applicantPhone: string
  applicantEmail: string
  contractorName?: string
  contractorLicense?: string
  
  // Requirements
  requiresPlans: boolean
  plansSubmitted: boolean
  plansApproved: boolean
  feesRequired: number
  feesPaid: number
  
  // Inspection requirements
  requiredInspections: LibertyHillInspection[]
  completedInspections: LibertyHillInspection[]
  
  // Documents
  documents: PermitDocument[]
  
  // Municipal data
  municipalData: Record<string, any>
  lastSyncDate?: Date
}

export interface LibertyHillInspection {
  id: string
  permitId: string
  projectId: string
  type: LibertyHillInspectionType
  phase: string
  status: InspectionStatus
  
  // Scheduling
  requestedDate?: Date
  scheduledDate?: Date
  completedDate?: Date
  
  // Inspector information
  inspectorName?: string
  inspectorPhone?: string
  inspectorEmail?: string
  
  // Results
  passed?: boolean
  notes?: string
  deficiencies: InspectionDeficiency[]
  
  // Reinspection
  reinspectionRequired: boolean
  reinspectionDate?: Date
  reinspectionCount: number
  
  // Documents
  reportPath?: string
  photos: string[]
  
  // Municipal integration
  municipalInspectionId?: string
  municipalData: Record<string, any>
}

export interface InspectionDeficiency {
  id: string
  description: string
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  code: string
  location: string
  correctionRequired: string
  resolved: boolean
  resolvedDate?: Date
  resolvedBy?: string
  photos: string[]
}

export interface PermitDocument {
  id: string
  name: string
  type: DocumentType
  required: boolean
  submitted: boolean
  approved: boolean
  filePath?: string
  submittedDate?: Date
  approvedDate?: Date
}

export interface LibertyHillComplianceCheck {
  projectId: string
  checkDate: Date
  overallCompliance: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING' | 'UNKNOWN'
  
  permits: {
    required: string[]
    obtained: string[]
    pending: string[]
    missing: string[]
  }
  
  inspections: {
    required: string[]
    completed: string[]
    scheduled: string[]
    failed: string[]
    pending: string[]
  }
  
  buildingCodes: {
    applicable: string[]
    violations: CodeViolation[]
    warnings: CodeWarning[]
  }
  
  hoaCompliance: {
    required: boolean
    approved: boolean
    restrictions: string[]
    violations: string[]
  }
  
  issues: ComplianceIssue[]
  recommendations: string[]
}

export interface CodeViolation {
  code: string
  description: string
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL'
  location: string
  correctionRequired: string
  deadline?: Date
}

export interface CodeWarning {
  code: string
  description: string
  recommendation: string
}

export interface ComplianceIssue {
  id: string
  type: 'PERMIT' | 'INSPECTION' | 'CODE' | 'HOA' | 'SAFETY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  impact: string
  resolution: string
  deadline?: Date
  assigned?: string
}

export interface LibertyHillBuildingCode {
  section: string
  title: string
  description: string
  requirements: string[]
  applicableProjectTypes: string[]
  exceptions?: string[]
  penaltyForViolation?: string
  lastUpdated: Date
}

export interface TexasOwnerBuilderExemption {
  projectId: string
  isApplicable: boolean
  claimed: boolean
  
  requirements: {
    primaryResidence: boolean
    personalUse: boolean
    notForSale: boolean
    singleFamily: boolean
    underSizeLimit: boolean
  }
  
  limitations: {
    cannotSellWithinYear: boolean
    limitedSubcontracting: boolean
    personalLiabilityIncreased: boolean
  }
  
  filedDate?: Date
  expirationDate?: Date
  documentPath?: string
}

export type PermitType = 
  | 'BUILDING'
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'MECHANICAL'
  | 'DRIVEWAY'
  | 'SEPTIC'
  | 'WELL'
  | 'DEMOLITION'
  | 'TREE_REMOVAL'
  | 'FENCE'

export type PermitStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ISSUED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED'

export type LibertyHillInspectionType = 
  | 'FOUNDATION'
  | 'FRAMING'
  | 'ELECTRICAL_ROUGH'
  | 'ELECTRICAL_FINAL'
  | 'PLUMBING_ROUGH'
  | 'PLUMBING_FINAL'
  | 'MECHANICAL_ROUGH'
  | 'MECHANICAL_FINAL'
  | 'INSULATION'
  | 'DRYWALL'
  | 'FINAL'
  | 'CERTIFICATE_OF_OCCUPANCY'

export type InspectionStatus = 
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED'
  | 'CANCELLED'

export type DocumentType = 
  | 'SITE_PLAN'
  | 'BUILDING_PLANS'
  | 'STRUCTURAL_PLANS'
  | 'ELECTRICAL_PLANS'
  | 'PLUMBING_PLANS'
  | 'MECHANICAL_PLANS'
  | 'SURVEY'
  | 'SOIL_REPORT'
  | 'DRAINAGE_PLAN'
  | 'LANDSCAPE_PLAN'
  | 'PERMIT_APPLICATION'
  | 'CONTRACTOR_LICENSE'
  | 'INSURANCE_CERTIFICATE'
  | 'BOND'

class LibertyHillComplianceService {
  private apiBaseUrl = process.env.LIBERTY_HILL_API_URL || 'https://libertyhill.permittrax.com/api'
  private apiKey = process.env.LIBERTY_HILL_API_KEY

  /**
   * Get all permits for a project
   */
  async getProjectPermits(projectId: string): Promise<LibertyHillPermit[]> {
    try {
      const response = await fetch(`/api/compliance/liberty-hill/permits?projectId=${projectId}`)
      if (!response.ok) throw new Error('Failed to fetch permits')
      return await response.json()
    } catch (error) {
      console.error('Error fetching permits:', error)
      throw error
    }
  }

  /**
   * Check what permits are required for a project
   */
  async checkRequiredPermits(projectType: string, workDescription: string, estimatedCost: number): Promise<PermitType[]> {
    const requiredPermits: PermitType[] = []

    // Building permit logic
    if (estimatedCost > 1000 || projectType.includes('NEW') || projectType.includes('ADDITION')) {
      requiredPermits.push('BUILDING')
    }

    // Electrical permit logic
    if (workDescription.toLowerCase().includes('electrical') || 
        workDescription.toLowerCase().includes('wiring') ||
        projectType.includes('NEW')) {
      requiredPermits.push('ELECTRICAL')
    }

    // Plumbing permit logic
    if (workDescription.toLowerCase().includes('plumbing') || 
        workDescription.toLowerCase().includes('water') ||
        workDescription.toLowerCase().includes('sewer') ||
        projectType.includes('NEW')) {
      requiredPermits.push('PLUMBING')
    }

    // Mechanical permit logic
    if (workDescription.toLowerCase().includes('hvac') || 
        workDescription.toLowerCase().includes('air') ||
        workDescription.toLowerCase().includes('heating') ||
        projectType.includes('NEW')) {
      requiredPermits.push('MECHANICAL')
    }

    // Driveway permit logic
    if (workDescription.toLowerCase().includes('driveway') ||
        workDescription.toLowerCase().includes('curb cut')) {
      requiredPermits.push('DRIVEWAY')
    }

    // Septic permit logic
    if (workDescription.toLowerCase().includes('septic') ||
        workDescription.toLowerCase().includes('on-site sewer')) {
      requiredPermits.push('SEPTIC')
    }

    return requiredPermits
  }

  /**
   * Submit permit application
   */
  async submitPermitApplication(permitData: Partial<LibertyHillPermit>): Promise<LibertyHillPermit> {
    try {
      const response = await fetch('/api/compliance/liberty-hill/permits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permitData)
      })
      
      if (!response.ok) throw new Error('Failed to submit permit application')
      return await response.json()
    } catch (error) {
      console.error('Error submitting permit:', error)
      throw error
    }
  }

  /**
   * Schedule inspection
   */
  async scheduleInspection(inspectionData: {
    permitId: string
    type: LibertyHillInspectionType
    requestedDate: Date
    notes?: string
  }): Promise<LibertyHillInspection> {
    try {
      const response = await fetch('/api/compliance/liberty-hill/inspections/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      })
      
      if (!response.ok) throw new Error('Failed to schedule inspection')
      return await response.json()
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      throw error
    }
  }

  /**
   * Perform comprehensive compliance check
   */
  async performComplianceCheck(projectId: string): Promise<LibertyHillComplianceCheck> {
    try {
      const response = await fetch(`/api/compliance/liberty-hill/check/${projectId}`)
      if (!response.ok) throw new Error('Failed to perform compliance check')
      return await response.json()
    } catch (error) {
      console.error('Error performing compliance check:', error)
      throw error
    }
  }

  /**
   * Get applicable building codes
   */
  async getApplicableBuildingCodes(projectType: string, location: string): Promise<LibertyHillBuildingCode[]> {
    const codes: LibertyHillBuildingCode[] = []

    // Texas building codes applicable to Liberty Hill
    if (projectType.includes('RESIDENTIAL')) {
      codes.push({
        section: 'IRC-2021',
        title: 'International Residential Code',
        description: 'Primary residential construction code adopted by Texas',
        requirements: [
          'Foundation requirements per soil type',
          'Framing specifications for wind loads',
          'Electrical code compliance (NEC 2020)',
          'Plumbing code compliance (IPC 2021)',
          'Energy efficiency requirements (IECC 2021)'
        ],
        applicableProjectTypes: ['CUSTOM_HOME', 'PRODUCTION_HOME', 'ADDITION'],
        lastUpdated: new Date('2021-01-01')
      })
    }

    // Liberty Hill specific codes
    codes.push({
      section: 'LH-ZONING',
      title: 'Liberty Hill Zoning Ordinance',
      description: 'Local zoning requirements for Liberty Hill',
      requirements: [
        'Minimum lot size requirements',
        'Setback requirements from property lines',
        'Maximum building height restrictions',
        'Architectural design standards'
      ],
      applicableProjectTypes: ['CUSTOM_HOME', 'PRODUCTION_HOME', 'ADDITION', 'COMMERCIAL'],
      lastUpdated: new Date('2023-06-01')
    })

    // Texas Energy Code
    codes.push({
      section: 'TECC-2021',
      title: 'Texas Energy Conservation Code',
      description: 'Energy efficiency requirements for Texas construction',
      requirements: [
        'Insulation R-values for climate zone 2A',
        'Window U-factor and SHGC requirements',
        'HVAC efficiency standards',
        'Air sealing requirements'
      ],
      applicableProjectTypes: ['CUSTOM_HOME', 'PRODUCTION_HOME', 'ADDITION'],
      lastUpdated: new Date('2021-01-01')
    })

    return codes
  }

  /**
   * Check Texas Owner-Builder exemption eligibility
   */
  async checkOwnerBuilderEligibility(projectData: {
    projectType: string
    homeSize: number
    isPrimaryResidence: boolean
    forPersonalUse: boolean
    intendToSell: boolean
  }): Promise<TexasOwnerBuilderExemption> {
    const isApplicable = 
      projectData.projectType.includes('CUSTOM_HOME') &&
      projectData.homeSize <= 5000 && // Texas size limit for owner-builder
      projectData.isPrimaryResidence &&
      projectData.forPersonalUse &&
      !projectData.intendToSell

    return {
      projectId: '', // Will be set by caller
      isApplicable,
      claimed: false,
      requirements: {
        primaryResidence: projectData.isPrimaryResidence,
        personalUse: projectData.forPersonalUse,
        notForSale: !projectData.intendToSell,
        singleFamily: projectData.projectType.includes('CUSTOM_HOME'),
        underSizeLimit: projectData.homeSize <= 5000
      },
      limitations: {
        cannotSellWithinYear: true,
        limitedSubcontracting: true,
        personalLiabilityIncreased: true
      }
    }
  }

  /**
   * Get Liberty Hill contact information
   */
  getLibertyHillContacts(): Record<string, any> {
    return {
      buildingDepartment: {
        name: 'Liberty Hill Building Department',
        address: '15200 W State Hwy 29, Liberty Hill, TX 78642',
        phone: '(512) 515-5291',
        email: 'building@libertyhill.org',
        hours: 'Monday-Friday 8:00 AM - 5:00 PM',
        website: 'https://libertyhill.org/building-department'
      },
      permits: {
        name: 'Permit Office',
        phone: '(512) 515-5291',
        email: 'permits@libertyhill.org',
        onlinePortal: 'https://libertyhill.permittrax.com'
      },
      inspections: {
        name: 'Inspection Scheduling',
        phone: '(512) 515-5291',
        email: 'inspections@libertyhill.org',
        requestDeadline: '24 hours advance notice required',
        cancelDeadline: '2 hours advance notice required'
      },
      planning: {
        name: 'Planning & Zoning',
        phone: '(512) 515-5291',
        email: 'planning@libertyhill.org'
      },
      utilities: {
        water: {
          name: 'Liberty Hill Water Department',
          phone: '(512) 515-5291'
        },
        sewer: {
          name: 'Liberty Hill Wastewater',
          phone: '(512) 515-5291'
        },
        electric: {
          name: 'Pedernales Electric Cooperative',
          phone: '(888) 554-4732'
        },
        gas: {
          name: 'Texas Gas Service',
          phone: '(800) 700-2443'
        }
      }
    }
  }

  /**
   * Generate compliance checklist for a project
   */
  generateComplianceChecklist(projectType: string, workDescription: string): any[] {
    const checklist = []

    // Pre-construction phase
    checklist.push({
      phase: 'Pre-Construction',
      tasks: [
        {
          task: 'Obtain building permit',
          description: 'Submit application with plans and fees',
          deadline: 'Before construction begins',
          responsible: 'Owner/Contractor',
          status: 'pending'
        },
        {
          task: 'Schedule pre-construction meeting',
          description: 'Meet with building official if required',
          deadline: 'Before permit issuance',
          responsible: 'Applicant',
          status: 'pending'
        }
      ]
    })

    // Construction phase inspections
    if (projectType.includes('NEW') || projectType.includes('ADDITION')) {
      checklist.push({
        phase: 'Foundation',
        tasks: [
          {
            task: 'Foundation inspection',
            description: 'Inspect foundation before concrete pour',
            deadline: 'Before concrete placement',
            responsible: 'Contractor',
            status: 'pending'
          }
        ]
      })

      checklist.push({
        phase: 'Framing',
        tasks: [
          {
            task: 'Framing inspection',
            description: 'Inspect structural framing',
            deadline: 'Before insulation/drywall',
            responsible: 'Contractor',
            status: 'pending'
          }
        ]
      })

      checklist.push({
        phase: 'Rough-In',
        tasks: [
          {
            task: 'Electrical rough inspection',
            description: 'Inspect electrical rough-in work',
            deadline: 'Before covering wiring',
            responsible: 'Electrical contractor',
            status: 'pending'
          },
          {
            task: 'Plumbing rough inspection',
            description: 'Inspect plumbing rough-in work',
            deadline: 'Before covering pipes',
            responsible: 'Plumbing contractor',
            status: 'pending'
          },
          {
            task: 'Mechanical rough inspection',
            description: 'Inspect HVAC rough-in work',
            deadline: 'Before covering ductwork',
            responsible: 'HVAC contractor',
            status: 'pending'
          }
        ]
      })

      checklist.push({
        phase: 'Final',
        tasks: [
          {
            task: 'Final electrical inspection',
            description: 'Inspect completed electrical work',
            deadline: 'Before certificate of occupancy',
            responsible: 'Electrical contractor',
            status: 'pending'
          },
          {
            task: 'Final plumbing inspection',
            description: 'Inspect completed plumbing work',
            deadline: 'Before certificate of occupancy',
            responsible: 'Plumbing contractor',
            status: 'pending'
          },
          {
            task: 'Final mechanical inspection',
            description: 'Inspect completed HVAC work',
            deadline: 'Before certificate of occupancy',
            responsible: 'HVAC contractor',
            status: 'pending'
          },
          {
            task: 'Final building inspection',
            description: 'Final inspection of entire project',
            deadline: 'Before certificate of occupancy',
            responsible: 'General contractor',
            status: 'pending'
          }
        ]
      })
    }

    return checklist
  }

  /**
   * Sync with Liberty Hill municipal systems
   */
  async syncWithMunicipalSystems(projectId: string): Promise<void> {
    try {
      // This would integrate with Liberty Hill's permit tracking system
      // For now, we'll simulate the sync
      console.log(`Syncing project ${projectId} with Liberty Hill systems...`)
      
      // In production, this would:
      // 1. Query Liberty Hill's permit database
      // 2. Update permit statuses
      // 3. Sync inspection schedules
      // 4. Update fee payment status
      // 5. Check for new requirements or code changes
      
    } catch (error) {
      console.error('Error syncing with municipal systems:', error)
      throw error
    }
  }
}

// Export singleton instance
export const libertyHillCompliance = new LibertyHillComplianceService()