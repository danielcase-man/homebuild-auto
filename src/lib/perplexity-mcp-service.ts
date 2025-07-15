/**
 * Perplexity MCP Integration Service
 * Provides intelligent research capabilities for vendors, materials, and compliance
 */

export interface PerplexityResearchRequest {
  query: string
  context?: string
  location?: string
  industry?: string
  filters?: Record<string, any>
  maxResults?: number
}

export interface PerplexityResearchResult {
  id: string
  query: string
  results: ResearchResult[]
  summary: string
  confidence: number
  timestamp: Date
  sources: Source[]
  metadata: Record<string, any>
}

export interface ResearchResult {
  title: string
  description: string
  url?: string
  data: Record<string, any>
  relevance: number
  category: string
}

export interface Source {
  title: string
  url: string
  publishedDate?: Date
  credibilityScore: number
}

export interface VendorResearchRequest extends PerplexityResearchRequest {
  trade: string
  location: string
  projectType?: string
  budget?: number
  timeline?: string
  requirements?: string[]
  libertyHillSpecific?: boolean
}

export interface MaterialResearchRequest extends PerplexityResearchRequest {
  category: string
  specifications?: string[]
  budget?: number
  qualityRequirements?: string[]
  sustainabilityRequirements?: string[]
  texasClimate?: boolean
}

export interface ComplianceResearchRequest extends PerplexityResearchRequest {
  jurisdiction: string
  projectType: string
  phase: string
  requirements?: string[]
}

export interface VendorDiscoveryResult {
  name: string
  description: string
  specialties: string[]
  location: {
    address?: string
    city: string
    state: string
    radius?: number
  }
  contact: {
    phone?: string
    email?: string
    website?: string
  }
  credentials: {
    license?: string
    insurance?: string
    bonded?: boolean
    certifications?: string[]
  }
  ratings: {
    overall?: number
    sources: string[]
    reviewCount?: number
  }
  experience: {
    yearsInBusiness?: number
    projectTypes?: string[]
    clientTypes?: string[]
  }
  pricing: {
    range?: string
    hourlyRate?: { min: number; max: number }
    flatRate?: boolean
  }
  availability: {
    currentCapacity?: string
    leadTime?: string
    seasonal?: boolean
  }
  libertyHillApproved?: boolean
  texasLicense?: string
  confidence: number
  sourceUrl?: string
}

export interface MaterialDiscoveryResult {
  name: string
  brand?: string
  model?: string
  category: string
  subcategory?: string
  description: string
  specifications: Record<string, any>
  pricing: {
    basePrice?: number
    range?: { min: number; max: number }
    unit: string
    currency: string
  }
  availability: {
    inStock: boolean
    leadTime?: string
    suppliers: string[]
  }
  ratings: {
    overall?: number
    durability?: number
    value?: number
    ease_of_installation?: number
  }
  sustainability: {
    eco_friendly?: boolean
    certifications?: string[]
    energy_efficiency?: string
  }
  texas_climate_suitability: {
    heat_resistance?: boolean
    humidity_resistance?: boolean
    uv_resistance?: boolean
    rating?: number
  }
  installation: {
    difficulty?: string
    tools_required?: string[]
    professional_required?: boolean
  }
  warranty: {
    duration?: string
    type?: string
    coverage?: string[]
  }
  confidence: number
  sourceUrl?: string
}

class PerplexityMCPService {
  private apiKey: string | null = null
  private baseUrl = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai'
  private mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001'

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || null
  }

  /**
   * Generic research method using Perplexity MCP
   */
  async research(request: PerplexityResearchRequest): Promise<PerplexityResearchResult> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query: request.query,
          context: request.context,
          filters: request.filters,
          max_results: request.maxResults || 10
        })
      })

      if (!response.ok) {
        throw new Error(`Research request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        id: `research-${Date.now()}`,
        query: request.query,
        results: this.parseResearchResults(data.results || []),
        summary: data.summary || '',
        confidence: data.confidence || 0.8,
        timestamp: new Date(),
        sources: this.parseSources(data.sources || []),
        metadata: data.metadata || {}
      }
    } catch (error) {
      console.error('Perplexity research failed:', error)
      throw error
    }
  }

  /**
   * Discover vendors for specific trades in Liberty Hill, TX area
   */
  async discoverVendors(request: VendorResearchRequest): Promise<VendorDiscoveryResult[]> {
    const enhancedQuery = this.buildVendorQuery(request)
    
    const researchResult = await this.research({
      query: enhancedQuery,
      context: 'home_construction_vendor_discovery',
      location: request.location,
      industry: 'construction',
      maxResults: request.maxResults || 15
    })

    return this.parseVendorResults(researchResult, request)
  }

  /**
   * Research materials for construction projects
   */
  async researchMaterials(request: MaterialResearchRequest): Promise<MaterialDiscoveryResult[]> {
    const enhancedQuery = this.buildMaterialQuery(request)
    
    const researchResult = await this.research({
      query: enhancedQuery,
      context: 'construction_material_research',
      industry: 'construction_materials',
      maxResults: request.maxResults || 20
    })

    return this.parseMaterialResults(researchResult, request)
  }

  /**
   * Research compliance requirements for Liberty Hill, TX
   */
  async researchCompliance(request: ComplianceResearchRequest): Promise<PerplexityResearchResult> {
    const enhancedQuery = this.buildComplianceQuery(request)
    
    return await this.research({
      query: enhancedQuery,
      context: 'building_code_compliance',
      location: request.jurisdiction,
      industry: 'construction_regulation',
      maxResults: request.maxResults || 10
    })
  }

  /**
   * Research market pricing for materials and services
   */
  async researchPricing(category: string, location: string, specifications?: Record<string, any>): Promise<any> {
    const query = `Current market pricing for ${category} in ${location} area ${specifications ? `with specifications: ${JSON.stringify(specifications)}` : ''}`
    
    return await this.research({
      query,
      context: 'construction_pricing_research',
      location,
      industry: 'construction_pricing'
    })
  }

  /**
   * Research building codes and regulations
   */
  async researchBuildingCodes(jurisdiction: string, codeType: string, projectType: string): Promise<any> {
    const query = `${codeType} building codes and regulations for ${projectType} projects in ${jurisdiction}, Texas including permit requirements, inspection schedules, and compliance guidelines`
    
    return await this.research({
      query,
      context: 'building_code_research',
      location: jurisdiction,
      industry: 'construction_regulation'
    })
  }

  /**
   * Research weather and climate considerations
   */
  async researchClimateConsiderations(location: string, projectType: string): Promise<any> {
    const query = `Climate and weather considerations for ${projectType} construction in ${location}, Texas including material selection, seasonal planning, and weather-resistant design`
    
    return await this.research({
      query,
      context: 'climate_construction_research',
      location,
      industry: 'construction_planning'
    })
  }

  // Private helper methods

  private buildVendorQuery(request: VendorResearchRequest): string {
    let query = `Find ${request.trade} contractors and vendors`
    
    if (request.location) {
      query += ` in ${request.location} area`
    }
    
    if (request.projectType) {
      query += ` specializing in ${request.projectType}`
    }
    
    if (request.budget) {
      query += ` with budget range around $${request.budget}`
    }
    
    if (request.requirements?.length) {
      query += ` with requirements: ${request.requirements.join(', ')}`
    }
    
    if (request.libertyHillSpecific) {
      query += ` approved for Liberty Hill, Texas with proper licensing and insurance`
    }
    
    query += `. Include contact information, licensing, insurance, ratings, pricing, and availability.`
    
    return query
  }

  private buildMaterialQuery(request: MaterialResearchRequest): string {
    let query = `Research ${request.category} materials`
    
    if (request.specifications?.length) {
      query += ` with specifications: ${request.specifications.join(', ')}`
    }
    
    if (request.budget) {
      query += ` within budget of $${request.budget}`
    }
    
    if (request.qualityRequirements?.length) {
      query += ` meeting quality requirements: ${request.qualityRequirements.join(', ')}`
    }
    
    if (request.sustainabilityRequirements?.length) {
      query += ` with sustainability features: ${request.sustainabilityRequirements.join(', ')}`
    }
    
    if (request.texasClimate) {
      query += ` suitable for Texas climate including heat resistance, humidity resistance, and UV protection`
    }
    
    query += `. Include pricing, availability, suppliers, ratings, warranties, and installation requirements.`
    
    return query
  }

  private buildComplianceQuery(request: ComplianceResearchRequest): string {
    let query = `${request.jurisdiction} building codes and compliance requirements for ${request.projectType}`
    
    if (request.phase) {
      query += ` during ${request.phase} phase`
    }
    
    if (request.requirements?.length) {
      query += ` including ${request.requirements.join(', ')}`
    }
    
    query += `. Include permit requirements, inspection schedules, fees, timelines, and contact information for local authorities.`
    
    return query
  }

  private parseResearchResults(results: any[]): ResearchResult[] {
    return results.map((result, index) => ({
      title: result.title || `Result ${index + 1}`,
      description: result.description || result.content || '',
      url: result.url,
      data: result.data || {},
      relevance: result.relevance || 0.8,
      category: result.category || 'general'
    }))
  }

  private parseSources(sources: any[]): Source[] {
    return sources.map(source => ({
      title: source.title || 'Unknown Source',
      url: source.url || '',
      publishedDate: source.published_date ? new Date(source.published_date) : undefined,
      credibilityScore: source.credibility_score || 0.8
    }))
  }

  private parseVendorResults(researchResult: PerplexityResearchResult, request: VendorResearchRequest): VendorDiscoveryResult[] {
    return researchResult.results.map(result => {
      const vendorData = result.data as any
      
      return {
        name: vendorData.name || result.title,
        description: vendorData.description || result.description,
        specialties: vendorData.specialties || [request.trade],
        location: {
          address: vendorData.address,
          city: vendorData.city || this.extractCityFromLocation(request.location),
          state: vendorData.state || 'TX',
          radius: vendorData.service_radius
        },
        contact: {
          phone: vendorData.phone,
          email: vendorData.email,
          website: vendorData.website || result.url
        },
        credentials: {
          license: vendorData.license,
          insurance: vendorData.insurance,
          bonded: vendorData.bonded,
          certifications: vendorData.certifications || []
        },
        ratings: {
          overall: vendorData.rating,
          sources: vendorData.rating_sources || [],
          reviewCount: vendorData.review_count
        },
        experience: {
          yearsInBusiness: vendorData.years_in_business,
          projectTypes: vendorData.project_types || [],
          clientTypes: vendorData.client_types || []
        },
        pricing: {
          range: vendorData.price_range,
          hourlyRate: vendorData.hourly_rate,
          flatRate: vendorData.flat_rate
        },
        availability: {
          currentCapacity: vendorData.current_capacity,
          leadTime: vendorData.lead_time,
          seasonal: vendorData.seasonal
        },
        libertyHillApproved: vendorData.liberty_hill_approved,
        texasLicense: vendorData.texas_license,
        confidence: result.relevance,
        sourceUrl: result.url
      }
    })
  }

  private parseMaterialResults(researchResult: PerplexityResearchResult, request: MaterialResearchRequest): MaterialDiscoveryResult[] {
    return researchResult.results.map(result => {
      const materialData = result.data as any
      
      return {
        name: materialData.name || result.title,
        brand: materialData.brand,
        model: materialData.model,
        category: materialData.category || request.category,
        subcategory: materialData.subcategory,
        description: materialData.description || result.description,
        specifications: materialData.specifications || {},
        pricing: {
          basePrice: materialData.base_price,
          range: materialData.price_range,
          unit: materialData.unit || 'each',
          currency: materialData.currency || 'USD'
        },
        availability: {
          inStock: materialData.in_stock !== false,
          leadTime: materialData.lead_time,
          suppliers: materialData.suppliers || []
        },
        ratings: {
          overall: materialData.overall_rating,
          durability: materialData.durability_rating,
          value: materialData.value_rating,
          ease_of_installation: materialData.installation_rating
        },
        sustainability: {
          eco_friendly: materialData.eco_friendly,
          certifications: materialData.sustainability_certifications || [],
          energy_efficiency: materialData.energy_efficiency
        },
        texas_climate_suitability: {
          heat_resistance: materialData.heat_resistance,
          humidity_resistance: materialData.humidity_resistance,
          uv_resistance: materialData.uv_resistance,
          rating: materialData.climate_suitability_rating
        },
        installation: {
          difficulty: materialData.installation_difficulty,
          tools_required: materialData.tools_required || [],
          professional_required: materialData.professional_installation_required
        },
        warranty: {
          duration: materialData.warranty_duration,
          type: materialData.warranty_type,
          coverage: materialData.warranty_coverage || []
        },
        confidence: result.relevance,
        sourceUrl: result.url
      }
    })
  }

  private extractCityFromLocation(location: string): string {
    // Simple extraction - in production, you might want more sophisticated parsing
    const parts = location.split(',')
    return parts[0].trim()
  }
}

// Export singleton instance
export const perplexityMCP = new PerplexityMCPService()

// API route handlers for Next.js
export const handleVendorResearch = async (request: VendorResearchRequest) => {
  return await perplexityMCP.discoverVendors(request)
}

export const handleMaterialResearch = async (request: MaterialResearchRequest) => {
  return await perplexityMCP.researchMaterials(request)
}

export const handleComplianceResearch = async (request: ComplianceResearchRequest) => {
  return await perplexityMCP.researchCompliance(request)
}

export const handlePricingResearch = async (category: string, location: string, specifications?: Record<string, any>) => {
  return await perplexityMCP.researchPricing(category, location, specifications)
}