/**
 * Enhanced Research Service with Perplexity MCP Integration
 * Provides AI-powered research capabilities for vendors, materials, and compliance
 */

import { PrismaClient } from '@prisma/client'

// MCP Client interface (would be imported from actual MCP client)
interface MCPClient {
  research(query: ResearchQuery): Promise<ResearchResult>
}

interface ResearchQuery {
  query: string
  domain?: 'general' | 'construction' | 'vendors' | 'materials' | 'compliance' | 'market'
  location?: string
  timeframe?: 'recent' | 'current' | 'historical'
  structured?: boolean
  includePricing?: boolean
  includeContacts?: boolean
  includeRegulations?: boolean
}

interface ResearchResult {
  summary: string
  keyFindings: string[]
  sources: Array<{
    title: string
    url: string
    relevance: number
  }>
  structuredData?: any
  confidence: number
  timestamp: Date
}

interface VendorDiscoveryResult {
  vendors: DiscoveredVendor[]
  searchMetadata: {
    query: string
    location: string
    timestamp: Date
    confidence: number
  }
}

interface DiscoveredVendor {
  name: string
  phone?: string
  email?: string
  website?: string
  address?: string
  rating?: number
  reviewCount?: number
  specialties: string[]
  yearsInBusiness?: number
  licenseNumber?: string
  insuranceInfo?: string
  pricing?: {
    range: string
    hourlyRate?: number
    projectMin?: number
  }
  availability?: string
  responseTime?: string
}

interface MaterialResearchResult {
  materials: DiscoveredMaterial[]
  marketTrends: MarketTrend[]
  priceAnalysis: PriceAnalysis
}

interface DiscoveredMaterial {
  name: string
  brand: string
  model?: string
  category: string
  specifications: Record<string, any>
  pricing: {
    retailPrice?: number
    contractorPrice?: number
    bulkDiscount?: number
    source: string
  }
  availability: {
    inStock: boolean
    leadTime?: string
    supplier: string
  }
  reviews?: {
    rating: number
    count: number
    summary: string
  }
}

interface MarketTrend {
  material: string
  trend: 'rising' | 'falling' | 'stable'
  percentageChange: number
  timeframe: string
  factors: string[]
}

interface PriceAnalysis {
  averagePrice: number
  priceRange: {
    low: number
    high: number
  }
  marketPosition: 'budget' | 'mid-range' | 'premium'
  recommendations: string[]
}

interface ComplianceResult {
  requirements: ComplianceRequirement[]
  permits: PermitRequirement[]
  inspections: InspectionRequirement[]
  timeline: ComplianceTimeline[]
}

interface ComplianceRequirement {
  category: string
  requirement: string
  applicability: string
  reference: string
  deadline?: string
  cost?: number
}

interface PermitRequirement {
  type: string
  authority: string
  requirements: string[]
  cost: number
  timeline: string
  applicationProcess: string
}

interface InspectionRequirement {
  phase: string
  type: string
  inspector: string
  requirements: string[]
  timeline: string
  cost: number
}

interface ComplianceTimeline {
  milestone: string
  deadline: string
  dependencies: string[]
  authority: string
}

export class ResearchService {
  private prisma: PrismaClient
  private mcpClient: MCPClient

  constructor(mcpClient: MCPClient) {
    this.prisma = new PrismaClient()
    this.mcpClient = mcpClient
  }

  /**
   * Discover vendors for a specific trade in a location
   */
  async discoverVendors(
    trade: string,
    location: string = 'Liberty Hill, TX',
    projectId?: string
  ): Promise<VendorDiscoveryResult> {
    try {
      const query = `${trade} contractors ${location} reviews pricing availability license insurance contact information 2024`
      
      const research = await this.mcpClient.research({
        query,
        domain: 'vendors',
        location,
        timeframe: 'current',
        structured: true,
        includeContacts: true,
        includePricing: true
      })

      const vendors = this.parseVendorData(research, trade)
      
      // Store research results
      if (projectId) {
        await this.storeVendorResearch(projectId, trade, location, query, {
          vendors,
          research
        })
      }

      return {
        vendors,
        searchMetadata: {
          query,
          location,
          timestamp: new Date(),
          confidence: research.confidence
        }
      }
    } catch (error) {
      console.error('Vendor discovery failed:', error)
      throw new Error(`Failed to discover vendors: ${error.message}`)
    }
  }

  /**
   * Research material costs and availability
   */
  async researchMaterialCosts(
    materialName: string,
    quantity?: number,
    location: string = 'Austin, TX'
  ): Promise<MaterialResearchResult> {
    try {
      const query = `${materialName} current prices ${location} building supplies wholesale retail availability ${quantity ? `bulk ${quantity} units` : ''} 2024`
      
      const research = await this.mcpClient.research({
        query,
        domain: 'materials',
        location,
        timeframe: 'current',
        includePricing: true
      })

      const materials = this.parseMaterialData(research, materialName)
      const marketTrends = this.parseMarketTrends(research, materialName)
      const priceAnalysis = this.analyzePricing(materials)

      return {
        materials,
        marketTrends,
        priceAnalysis
      }
    } catch (error) {
      console.error('Material research failed:', error)
      throw new Error(`Failed to research materials: ${error.message}`)
    }
  }

  /**
   * Check compliance requirements for construction work
   */
  async checkCompliance(
    workType: string,
    location: string = 'Liberty Hill, TX'
  ): Promise<ComplianceResult> {
    try {
      const query = `${workType} building code requirements ${location} Texas permits inspections regulations owner-builder 2024`
      
      const research = await this.mcpClient.research({
        query,
        domain: 'compliance',
        location,
        timeframe: 'current',
        includeRegulations: true
      })

      return {
        requirements: this.parseComplianceRequirements(research),
        permits: this.parsePermitRequirements(research, location),
        inspections: this.parseInspectionRequirements(research),
        timeline: this.parseComplianceTimeline(research)
      }
    } catch (error) {
      console.error('Compliance check failed:', error)
      throw new Error(`Failed to check compliance: ${error.message}`)
    }
  }

  /**
   * Research market conditions and trends
   */
  async analyzeMarketConditions(
    category: string,
    location: string = 'Austin, TX'
  ): Promise<{
    marketConditions: string
    trends: MarketTrend[]
    recommendations: string[]
    lastUpdated: Date
  }> {
    try {
      const query = `${category} construction market conditions ${location} Texas price trends supply chain 2024`
      
      const research = await this.mcpClient.research({
        query,
        domain: 'market',
        location,
        timeframe: 'recent'
      })

      return {
        marketConditions: research.summary,
        trends: this.parseMarketTrends(research, category),
        recommendations: research.keyFindings,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Market analysis failed:', error)
      throw new Error(`Failed to analyze market conditions: ${error.message}`)
    }
  }

  /**
   * Auto-populate vendor database with discovered vendors
   */
  async populateVendorDatabase(
    vendors: DiscoveredVendor[],
    companyId: string,
    trade: string
  ): Promise<number> {
    let createdCount = 0

    for (const vendor of vendors) {
      try {
        // Check if vendor already exists
        const existingVendor = await this.prisma.supplier.findFirst({
          where: {
            companyId,
            name: vendor.name
          }
        })

        if (!existingVendor) {
          await this.prisma.supplier.create({
            data: {
              companyId,
              name: vendor.name,
              type: this.mapTradeToSupplierType(trade),
              email: vendor.email,
              phone: vendor.phone,
              website: vendor.website,
              address: vendor.address ? { address: vendor.address } : null,
              rating: vendor.rating,
              specialties: vendor.specialties,
              yearsInBusiness: vendor.yearsInBusiness,
              texasLicense: vendor.licenseNumber,
              libertyHillApproved: false, // Will be manually verified
              discoveredVia: 'AI_RESEARCH',
              researchData: vendor,
              lastResearched: new Date(),
              preferredContact: 'EMAIL',
              responseTime: this.parseResponseTime(vendor.responseTime)
            }
          })
          createdCount++
        }
      } catch (error) {
        console.error(`Failed to create vendor ${vendor.name}:`, error)
      }
    }

    return createdCount
  }

  // Private helper methods
  private async storeVendorResearch(
    projectId: string,
    trade: string,
    location: string,
    query: string,
    results: any
  ): Promise<void> {
    await this.prisma.vendorResearch.create({
      data: {
        projectId,
        trade,
        searchQuery: query,
        location,
        researchData: results.research,
        vendorsFound: results.vendors,
        confidence: results.research.confidence,
        completeness: this.calculateCompleteness(results.vendors),
        status: 'COMPLETED'
      }
    })
  }

  private parseVendorData(research: ResearchResult, trade: string): DiscoveredVendor[] {
    // This would parse the actual research results
    // For now, returning mock data structure
    const mockVendors: DiscoveredVendor[] = [
      {
        name: 'Liberty Hill Electric',
        phone: '(512) 555-0123',
        email: 'info@lhelectric.com',
        website: 'https://libertyhillelectric.com',
        address: '123 Main St, Liberty Hill, TX 78645',
        rating: 4.8,
        reviewCount: 127,
        specialties: ['Residential Electrical', 'New Construction', 'Service Upgrades'],
        yearsInBusiness: 15,
        licenseNumber: 'TX-ELEC-12345',
        pricing: {
          range: '$100-150/hour',
          hourlyRate: 125,
          projectMin: 500
        },
        availability: 'Available within 2 weeks',
        responseTime: '24 hours'
      }
    ]

    return mockVendors
  }

  private parseMaterialData(research: ResearchResult, materialName: string): DiscoveredMaterial[] {
    // Parse actual research results into material data
    const mockMaterials: DiscoveredMaterial[] = [
      {
        name: materialName,
        brand: 'Premium Brand',
        category: 'Construction Materials',
        specifications: {},
        pricing: {
          retailPrice: 100,
          contractorPrice: 85,
          bulkDiscount: 10,
          source: 'Local Supplier'
        },
        availability: {
          inStock: true,
          leadTime: '1-2 weeks',
          supplier: 'Austin Building Supply'
        }
      }
    ]

    return mockMaterials
  }

  private parseMarketTrends(research: ResearchResult, category: string): MarketTrend[] {
    const mockTrends: MarketTrend[] = [
      {
        material: category,
        trend: 'rising',
        percentageChange: 5.2,
        timeframe: 'Last 3 months',
        factors: ['Supply chain constraints', 'Increased demand']
      }
    ]

    return mockTrends
  }

  private analyzePricing(materials: DiscoveredMaterial[]): PriceAnalysis {
    const prices = materials
      .map(m => m.pricing.contractorPrice || m.pricing.retailPrice)
      .filter(p => p !== undefined) as number[]

    if (prices.length === 0) {
      return {
        averagePrice: 0,
        priceRange: { low: 0, high: 0 },
        marketPosition: 'mid-range',
        recommendations: ['Insufficient price data available']
      }
    }

    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const sortedPrices = prices.sort((a, b) => a - b)

    return {
      averagePrice,
      priceRange: {
        low: sortedPrices[0],
        high: sortedPrices[sortedPrices.length - 1]
      },
      marketPosition: 'mid-range',
      recommendations: [
        'Consider bulk purchasing for better pricing',
        'Compare multiple suppliers for best value'
      ]
    }
  }

  private parseComplianceRequirements(research: ResearchResult): ComplianceRequirement[] {
    const mockRequirements: ComplianceRequirement[] = [
      {
        category: 'Building Permit',
        requirement: 'Building permit required for new construction',
        applicability: 'All new construction projects',
        reference: 'Liberty Hill Municipal Code Section 14.02',
        cost: 500
      }
    ]

    return mockRequirements
  }

  private parsePermitRequirements(research: ResearchResult, location: string): PermitRequirement[] {
    const mockPermits: PermitRequirement[] = [
      {
        type: 'Building Permit',
        authority: 'Liberty Hill Building Department',
        requirements: ['Approved plans', 'Site survey', 'Setback verification'],
        cost: 500,
        timeline: '2-3 weeks',
        applicationProcess: 'Online application with document upload'
      }
    ]

    return mockPermits
  }

  private parseInspectionRequirements(research: ResearchResult): InspectionRequirement[] {
    const mockInspections: InspectionRequirement[] = [
      {
        phase: 'Foundation',
        type: 'Foundation Inspection',
        inspector: 'Liberty Hill Building Inspector',
        requirements: ['Completed foundation', 'Rebar inspection', 'Proper curing'],
        timeline: 'Before concrete pour',
        cost: 150
      }
    ]

    return mockInspections
  }

  private parseComplianceTimeline(research: ResearchResult): ComplianceTimeline[] {
    const mockTimeline: ComplianceTimeline[] = [
      {
        milestone: 'Permit Application',
        deadline: '2 weeks before construction start',
        dependencies: ['Approved plans', 'Site survey'],
        authority: 'Liberty Hill Building Department'
      }
    ]

    return mockTimeline
  }

  private mapTradeToSupplierType(trade: string): 'MATERIAL' | 'SUBCONTRACTOR' | 'EQUIPMENT' | 'SERVICE' {
    const materialTrades = ['lumber', 'concrete', 'steel', 'insulation']
    const subcontractorTrades = ['electrical', 'plumbing', 'hvac', 'framing', 'roofing']
    const equipmentTrades = ['crane', 'excavation', 'tools']

    if (materialTrades.some(t => trade.toLowerCase().includes(t))) {
      return 'MATERIAL'
    }
    if (subcontractorTrades.some(t => trade.toLowerCase().includes(t))) {
      return 'SUBCONTRACTOR'
    }
    if (equipmentTrades.some(t => trade.toLowerCase().includes(t))) {
      return 'EQUIPMENT'
    }
    return 'SERVICE'
  }

  private parseResponseTime(responseTime?: string): number {
    if (!responseTime) return 24

    const match = responseTime.match(/(\d+)\s*(hour|day)/i)
    if (match) {
      const value = parseInt(match[1])
      const unit = match[2].toLowerCase()
      return unit.startsWith('day') ? value * 24 : value
    }
    return 24
  }

  private calculateCompleteness(vendors: DiscoveredVendor[]): number {
    if (vendors.length === 0) return 0

    const fields = ['phone', 'email', 'website', 'address', 'rating', 'licenseNumber']
    let totalFields = vendors.length * fields.length
    let completedFields = 0

    vendors.forEach(vendor => {
      fields.forEach(field => {
        if (vendor[field as keyof DiscoveredVendor]) {
          completedFields++
        }
      })
    })

    return completedFields / totalFields
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// Mock MCP Client for development
export class MockMCPClient implements MCPClient {
  async research(query: ResearchQuery): Promise<ResearchResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      summary: `Research results for: ${query.query}`,
      keyFindings: [
        'Found multiple relevant vendors in the area',
        'Pricing ranges from competitive to premium',
        'Most vendors have good availability'
      ],
      sources: [
        {
          title: 'Local Business Directory',
          url: 'https://example.com/directory',
          relevance: 0.9
        }
      ],
      confidence: 0.85,
      timestamp: new Date()
    }
  }
}

// Factory function to create research service with appropriate MCP client
export function createResearchService(): ResearchService {
  // In production, this would use the actual Perplexity MCP client
  const mcpClient = new MockMCPClient()
  return new ResearchService(mcpClient)
}