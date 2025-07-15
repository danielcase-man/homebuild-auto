/**
 * Dynamic Municipal Compliance Service
 * Handles building codes, permits, inspections, and municipal integration
 * Automatically adapts to project jurisdiction and location
 */

export interface JurisdictionInfo {
  city: string
  county: string
  state: string
  zipCode?: string
  jurisdiction: string // Full jurisdiction name
  type: 'CITY' | 'COUNTY' | 'STATE' | 'SPECIAL_DISTRICT'
}

export interface MunicipalPermit {
  id: string
  projectId: string
  permitNumber: string
  type: PermitType
  status: PermitStatus
  jurisdiction: JurisdictionInfo
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
  requiredInspections: MunicipalInspection[]
  completedInspections: MunicipalInspection[]
  
  // Documents
  documents: PermitDocument[]
  
  // Municipal system integration
  municipalSystemId?: string
  municipalData: Record<string, any>
  lastSyncDate?: Date
}

export interface MunicipalInspection {
  id: string
  permitId: string
  projectId: string
  type: InspectionType
  phase: string
  status: InspectionStatus
  jurisdiction: JurisdictionInfo
  
  // Scheduling
  requestedDate?: Date
  scheduledDate?: Date
  completedDate?: Date
  
  // Inspector information
  inspectorName?: string
  inspectorPhone?: string
  inspectorEmail?: string
  inspectorBadge?: string
  
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

export interface JurisdictionCompliance {
  jurisdiction: JurisdictionInfo
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
    applicable: ApplicableBuildingCode[]
    violations: CodeViolation[]
    warnings: CodeWarning[]
  }
  
  localRequirements: {
    hoaRequired: boolean
    hoaApproved: boolean
    specialDistricts: SpecialDistrict[]
    environmentalRestrictions: string[]
    historicDesignation?: string
  }
  
  issues: ComplianceIssue[]
  recommendations: string[]
  
  // Jurisdiction-specific data
  jurisdictionSpecific: Record<string, any>
}

export interface ApplicableBuildingCode {
  code: string
  title: string
  description: string
  version: string
  effectiveDate: Date
  jurisdiction: string
  adoptionLevel: 'STATE' | 'COUNTY' | 'CITY' | 'LOCAL'
  requirements: string[]
  exceptions?: string[]
  localAmendments?: string[]
}

export interface SpecialDistrict {
  name: string
  type: 'WATER' | 'SEWER' | 'FIRE' | 'SCHOOL' | 'MUD' | 'HOA' | 'HISTORIC'
  requirements: string[]
  contactInfo: ContactInfo
  additionalFees?: number
}

export interface ContactInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  hours?: string
  onlinePortal?: string
}

export interface JurisdictionContacts {
  jurisdiction: JurisdictionInfo
  departments: {
    building: ContactInfo
    planning: ContactInfo
    permits: ContactInfo
    inspections: ContactInfo
    utilities: {
      water?: ContactInfo
      sewer?: ContactInfo
      electric?: ContactInfo
      gas?: ContactInfo
    }
    emergency: ContactInfo
  }
  specialDistricts: SpecialDistrict[]
}

export interface StateOwnerBuilderRules {
  state: string
  isApplicable: boolean
  requirements: {
    primaryResidence: boolean
    personalUse: boolean
    notForSale: boolean
    singleFamily: boolean
    sizeLimit?: number // square feet
    valueLimit?: number // dollars
  }
  limitations: {
    cannotSellTimeframe?: string // "1 year", "2 years", etc.
    limitedSubcontracting: boolean
    personalLiabilityIncreased: boolean
    inspectionRequirements?: string[]
  }
  exemptions: string[]
  penalties?: string[]
  filingRequirements: string[]
}

class MunicipalComplianceService {
  /**
   * Detect jurisdiction from project address
   */
  async detectJurisdiction(address: string): Promise<JurisdictionInfo> {
    try {
      const response = await fetch('/api/compliance/detect-jurisdiction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      
      if (!response.ok) throw new Error('Failed to detect jurisdiction')
      return await response.json()
    } catch (error) {
      console.error('Error detecting jurisdiction:', error)
      // Fallback to basic parsing
      return this.parseAddressForJurisdiction(address)
    }
  }

  /**
   * Get jurisdiction-specific compliance requirements
   */
  async getJurisdictionCompliance(
    projectId: string, 
    jurisdiction: JurisdictionInfo
  ): Promise<JurisdictionCompliance> {
    try {
      const response = await fetch(`/api/compliance/${jurisdiction.jurisdiction}/check/${projectId}`)
      if (!response.ok) throw new Error('Failed to get jurisdiction compliance')
      return await response.json()
    } catch (error) {
      console.error('Error getting jurisdiction compliance:', error)
      throw error
    }
  }

  /**
   * Get applicable building codes for jurisdiction
   */
  async getApplicableBuildingCodes(
    jurisdiction: JurisdictionInfo,
    projectType: string
  ): Promise<ApplicableBuildingCode[]> {
    const codes: ApplicableBuildingCode[] = []

    // State-level codes (most states adopt IBC/IRC)
    if (jurisdiction.state === 'TX') {
      codes.push(...this.getTexasBuildingCodes(projectType))
    } else if (jurisdiction.state === 'CA') {
      codes.push(...this.getCaliforniaBuildingCodes(projectType))
    } else {
      codes.push(...this.getStandardBuildingCodes(projectType))
    }

    // County-level codes
    const countyCodes = await this.getCountyBuildingCodes(jurisdiction.county, jurisdiction.state)
    codes.push(...countyCodes)

    // City-level codes
    const cityCodes = await this.getCityBuildingCodes(jurisdiction.city, jurisdiction.state)
    codes.push(...cityCodes)

    return codes
  }

  /**
   * Get jurisdiction contacts
   */
  async getJurisdictionContacts(jurisdiction: JurisdictionInfo): Promise<JurisdictionContacts> {
    try {
      const response = await fetch(`/api/compliance/contacts/${jurisdiction.jurisdiction}`)
      if (!response.ok) {
        // Return default contacts if specific ones not found
        return this.getDefaultJurisdictionContacts(jurisdiction)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching jurisdiction contacts:', error)
      return this.getDefaultJurisdictionContacts(jurisdiction)
    }
  }

  /**
   * Get state-specific owner-builder rules
   */
  async getOwnerBuilderRules(state: string): Promise<StateOwnerBuilderRules> {
    const stateRules: Record<string, StateOwnerBuilderRules> = {
      TX: {
        state: 'Texas',
        isApplicable: true,
        requirements: {
          primaryResidence: true,
          personalUse: true,
          notForSale: true,
          singleFamily: true,
          sizeLimit: 5000,
          valueLimit: undefined
        },
        limitations: {
          cannotSellTimeframe: '1 year',
          limitedSubcontracting: true,
          personalLiabilityIncreased: true,
          inspectionRequirements: ['All standard inspections required']
        },
        exemptions: ['Licensed contractors for electrical, plumbing, HVAC'],
        penalties: ['Fines up to $10,000', 'Required to obtain contractor license'],
        filingRequirements: ['Affidavit of Owner-Builder', 'Property ownership proof']
      },
      CA: {
        state: 'California',
        isApplicable: true,
        requirements: {
          primaryResidence: true,
          personalUse: true,
          notForSale: true,
          singleFamily: true,
          sizeLimit: undefined,
          valueLimit: 500000
        },
        limitations: {
          cannotSellTimeframe: '1 year',
          limitedSubcontracting: true,
          personalLiabilityIncreased: true
        },
        exemptions: ['Minor repairs under $500'],
        penalties: ['Licensing violations', 'Code enforcement actions'],
        filingRequirements: ['Owner-Builder Declaration', 'Worker compensation waiver']
      }
    }

    return stateRules[state] || this.getDefaultOwnerBuilderRules(state)
  }

  /**
   * Submit permit application for specific jurisdiction
   */
  async submitPermitApplication(
    permitData: Partial<MunicipalPermit>,
    jurisdiction: JurisdictionInfo
  ): Promise<MunicipalPermit> {
    try {
      const response = await fetch(`/api/compliance/${jurisdiction.jurisdiction}/permits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...permitData, jurisdiction })
      })
      
      if (!response.ok) throw new Error('Failed to submit permit application')
      return await response.json()
    } catch (error) {
      console.error('Error submitting permit:', error)
      throw error
    }
  }

  /**
   * Schedule inspection with jurisdiction
   */
  async scheduleInspection(
    inspectionData: {
      permitId: string
      type: InspectionType
      requestedDate: Date
      notes?: string
    },
    jurisdiction: JurisdictionInfo
  ): Promise<MunicipalInspection> {
    try {
      const response = await fetch(`/api/compliance/${jurisdiction.jurisdiction}/inspections/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inspectionData, jurisdiction })
      })
      
      if (!response.ok) throw new Error('Failed to schedule inspection')
      return await response.json()
    } catch (error) {
      console.error('Error scheduling inspection:', error)
      throw error
    }
  }

  // Private helper methods

  private parseAddressForJurisdiction(address: string): JurisdictionInfo {
    // Basic address parsing - in production would use geocoding service
    const parts = address.split(',').map(part => part.trim())
    const stateZip = parts[parts.length - 1]?.split(' ') || []
    const state = stateZip[0] || ''
    const zipCode = stateZip[1] || ''
    const city = parts[parts.length - 2] || ''
    
    return {
      city,
      county: '', // Would be determined by geocoding
      state,
      zipCode,
      jurisdiction: `${city}, ${state}`,
      type: 'CITY'
    }
  }

  private getTexasBuildingCodes(projectType: string): ApplicableBuildingCode[] {
    const codes: ApplicableBuildingCode[] = [
      {
        code: 'IRC-2021',
        title: 'International Residential Code (Texas Amendments)',
        description: 'Primary residential construction code adopted by Texas',
        version: '2021',
        effectiveDate: new Date('2021-01-01'),
        jurisdiction: 'Texas',
        adoptionLevel: 'STATE',
        requirements: [
          'Foundation requirements per soil type',
          'Framing specifications for wind loads (110+ mph)',
          'Energy efficiency requirements (Climate Zone 2A)',
          'Fire safety requirements',
          'Accessibility compliance where required'
        ],
        localAmendments: [
          'Enhanced wind resistance requirements',
          'Flood zone construction standards',
          'Drought-resistant landscaping requirements'
        ]
      }
    ]

    if (projectType.includes('COMMERCIAL')) {
      codes.push({
        code: 'IBC-2021',
        title: 'International Building Code (Texas Amendments)',
        description: 'Commercial construction code for Texas',
        version: '2021',
        effectiveDate: new Date('2021-01-01'),
        jurisdiction: 'Texas',
        adoptionLevel: 'STATE',
        requirements: [
          'Commercial fire safety systems',
          'ADA compliance requirements',
          'Structural requirements for commercial buildings',
          'MEP systems compliance'
        ]
      })
    }

    return codes
  }

  private getCaliforniaBuildingCodes(projectType: string): ApplicableBuildingCode[] {
    return [
      {
        code: 'CBC-2022',
        title: 'California Building Code',
        description: 'California state building code with seismic requirements',
        version: '2022',
        effectiveDate: new Date('2022-01-01'),
        jurisdiction: 'California',
        adoptionLevel: 'STATE',
        requirements: [
          'Seismic design requirements',
          'Fire-resistant construction in wildfire zones',
          'Energy efficiency (Title 24)',
          'Water conservation requirements',
          'Solar-ready construction'
        ],
        localAmendments: [
          'Enhanced seismic standards',
          'Wildfire resistance requirements',
          'Mandatory solar installation'
        ]
      }
    ]
  }

  private getStandardBuildingCodes(projectType: string): ApplicableBuildingCode[] {
    return [
      {
        code: 'IRC-2021',
        title: 'International Residential Code',
        description: 'Standard residential construction code',
        version: '2021',
        effectiveDate: new Date('2021-01-01'),
        jurisdiction: 'International Code Council',
        adoptionLevel: 'STATE',
        requirements: [
          'Standard building requirements',
          'Fire and life safety',
          'Structural requirements',
          'Energy efficiency baseline'
        ]
      }
    ]
  }

  private async getCountyBuildingCodes(county: string, state: string): Promise<ApplicableBuildingCode[]> {
    // In production, this would query a database of county codes
    return []
  }

  private async getCityBuildingCodes(city: string, state: string): Promise<ApplicableBuildingCode[]> {
    // In production, this would query a database of city codes
    return []
  }

  private getDefaultJurisdictionContacts(jurisdiction: JurisdictionInfo): JurisdictionContacts {
    return {
      jurisdiction,
      departments: {
        building: {
          name: `${jurisdiction.city} Building Department`,
          phone: '(000) 000-0000',
          email: `building@${jurisdiction.city.toLowerCase().replace(' ', '')}.gov`
        },
        planning: {
          name: `${jurisdiction.city} Planning Department`,
          phone: '(000) 000-0000',
          email: `planning@${jurisdiction.city.toLowerCase().replace(' ', '')}.gov`
        },
        permits: {
          name: `${jurisdiction.city} Permit Office`,
          phone: '(000) 000-0000',
          email: `permits@${jurisdiction.city.toLowerCase().replace(' ', '')}.gov`
        },
        inspections: {
          name: `${jurisdiction.city} Inspection Services`,
          phone: '(000) 000-0000',
          email: `inspections@${jurisdiction.city.toLowerCase().replace(' ', '')}.gov`
        },
        utilities: {},
        emergency: {
          name: `${jurisdiction.city} Emergency Services`,
          phone: '911'
        }
      },
      specialDistricts: []
    }
  }

  private getDefaultOwnerBuilderRules(state: string): StateOwnerBuilderRules {
    return {
      state,
      isApplicable: false,
      requirements: {
        primaryResidence: true,
        personalUse: true,
        notForSale: true,
        singleFamily: true
      },
      limitations: {
        limitedSubcontracting: true,
        personalLiabilityIncreased: true
      },
      exemptions: [],
      filingRequirements: ['Check with local building department']
    }
  }
}

// Export singleton instance
export const municipalCompliance = new MunicipalComplianceService()

// Re-export types with new names
export type {
  MunicipalPermit as Permit,
  MunicipalInspection as Inspection,
  JurisdictionCompliance as ComplianceCheck
}

// Import and re-export required types from legacy service
export type {
  PermitType,
  PermitStatus,
  InspectionType,
  InspectionStatus,
  DocumentType,
  InspectionDeficiency,
  PermitDocument,
  CodeViolation,
  CodeWarning,
  ComplianceIssue
} from './liberty-hill-compliance-service'

// Export legacy service instance for backward compatibility
export { libertyHillCompliance } from './liberty-hill-compliance-service'