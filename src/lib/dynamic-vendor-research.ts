/**
 * Dynamic Vendor Research Service
 * Flexible API for researching construction suppliers and vendors with Perplexity MCP
 */

import { PrismaClient } from '@prisma/client'

// Core interfaces for vendor research
export interface VendorSearchParams {
  // Location parameters
  zipCode?: string
  city?: string
  state?: string
  radius?: number // miles
  
  // Vendor/supplier parameters
  vendorType?: VendorType
  materialType?: MaterialType
  serviceType?: ServiceType
  
  // Construction-specific parameters
  tradeSpecialty?: TradeSpecialty
  projectType?: ProjectType
  contractorTier?: 'residential' | 'commercial' | 'industrial' | 'all'
  
  // Research parameters
  includeContact?: boolean
  includePricing?: boolean
  includeReviews?: boolean
  includeInsurance?: boolean
  includeLicensing?: boolean
  
  // Quality filters
  minRating?: number
  yearsInBusiness?: number
  certifications?: string[]
  
  // Result parameters
  maxResults?: number
  sortBy?: 'distance' | 'rating' | 'price' | 'established'
}

export type VendorType = 
  | 'lumber_supplier'
  | 'hardware_store' 
  | 'building_materials'
  | 'specialty_supplier'
  | 'wholesale_distributor'
  | 'contractor_supply'
  | 'home_center'
  | 'plumbing_supply'
  | 'electrical_supply'
  | 'roofing_supply'
  | 'concrete_supplier'
  | 'steel_supplier'
  | 'insulation_supplier'
  | 'flooring_supplier'
  | 'paint_supplier'
  | 'window_door_supplier'
  | 'hvac_supplier'
  | 'landscape_supplier'
  | 'rental_equipment'

export type MaterialType =
  | 'framing_lumber'
  | 'treated_lumber'
  | 'engineered_lumber'
  | 'hardwood'
  | 'plywood_osb'
  | 'drywall_sheetrock'
  | 'insulation'
  | 'roofing_materials'
  | 'siding_materials'
  | 'concrete_cement'
  | 'rebar_steel'
  | 'plumbing_fixtures'
  | 'electrical_components'
  | 'hvac_equipment'
  | 'windows_doors'
  | 'flooring'
  | 'paint_stain'
  | 'hardware_fasteners'
  | 'tools_equipment'

export type ServiceType =
  | 'delivery'
  | 'installation'
  | 'custom_cutting'
  | 'design_consultation'
  | 'takeoff_services'
  | 'financing'
  | 'rental'
  | 'warranty_service'

export type TradeSpecialty =
  | 'general_contractor'
  | 'framing'
  | 'roofing'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'concrete'
  | 'masonry'
  | 'drywall'
  | 'flooring'
  | 'painting'
  | 'landscaping'
  | 'excavation'
  | 'foundation'

export type ProjectType =
  | 'new_construction'
  | 'renovation'
  | 'addition'
  | 'repair'
  | 'maintenance'
  | 'custom_build'
  | 'spec_build'
  | 'commercial'
  | 'residential'

// Normalized vendor data structure
export interface NormalizedVendor {
  // Basic information
  name: string
  businessType: VendorType
  description?: string
  
  // Location and contact
  address: {
    street?: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    phone?: string
    email?: string
    website?: string
    hours?: string
  }
  
  // Business details
  businessInfo: {
    established?: number
    employees?: number
    yearsInBusiness?: number
    licenseNumber?: string
    insuranceInfo?: string
    bonded?: boolean
  }
  
  // Services and specialties
  services: {
    vendorTypes: VendorType[]
    materialTypes: MaterialType[]
    serviceTypes: ServiceType[]
    tradeSpecialties: TradeSpecialty[]
    projectTypes: ProjectType[]
  }
  
  // Quality metrics
  ratings: {
    overallRating?: number
    reviewCount?: number
    bbbRating?: string
    certifications: string[]
  }
  
  // Geographic coverage
  serviceArea: {
    radius?: number
    counties?: string[]
    states?: string[]
    deliveryRange?: number
  }
  
  // Pricing and terms
  pricing: {
    priceRange?: 'budget' | 'mid-range' | 'premium'
    paymentTerms?: string[]
    discounts?: string[]
    minimumOrder?: number
  }
  
  // Distance and logistics
  logistics: {
    distanceFromSearch?: number
    deliveryAvailable?: boolean
    pickupAvailable?: boolean
    rushOrderCapability?: boolean
  }
  
  // Research metadata
  metadata: {
    sourceReliability: number
    lastUpdated: Date
    researchConfidence: number
    dataCompleteness: number
  }
}

// MCP Client interface
interface MCPClient {
  research(query: MCPResearchQuery): Promise<MCPResearchResult>
}

interface MCPResearchQuery {
  query: string
  domain: string
  location?: string
  timeframe?: string
  structured: boolean
  includePricing?: boolean
  includeContacts?: boolean
}

interface MCPResearchResult {
  summary: string
  keyFindings: string[]
  vendors: any[]
  sources: Array<{
    title: string
    url: string
    relevance: number
  }>
}

export class DynamicVendorResearchService {
  private mcpClient: MCPClient
  private prisma: PrismaClient

  constructor(mcpClient?: MCPClient) {
    this.mcpClient = mcpClient || new MockMCPClient()
    this.prisma = new PrismaClient()
  }

  /**
   * Main research function - searches for vendors based on flexible parameters
   */
  async searchVendors(params: VendorSearchParams): Promise<{
    vendors: NormalizedVendor[]
    totalFound: number
    searchMetadata: {
      location: string
      searchRadius: number
      queryUsed: string
      sourceCount: number
      confidence: number
    }
  }> {
    const location = this.buildLocationString(params)
    const query = this.buildSearchQuery(params)
    
    console.log(`🔍 Searching for vendors: ${query} near ${location}`)
    
    const mcpQuery: MCPResearchQuery = {
      query,
      domain: 'vendors',
      location,
      timeframe: 'current',
      structured: true,
      includePricing: params.includePricing,
      includeContacts: params.includeContact
    }

    const rawResult = await this.mcpClient.research(mcpQuery)
    const normalizedVendors = await this.normalizeVendorData(rawResult.vendors, params)
    
    // Filter and sort results
    const filteredVendors = this.filterVendors(normalizedVendors, params)
    const sortedVendors = this.sortVendors(filteredVendors, params.sortBy || 'distance')
    const limitedVendors = sortedVendors.slice(0, params.maxResults || 20)

    return {
      vendors: limitedVendors,
      totalFound: rawResult.vendors.length,
      searchMetadata: {
        location,
        searchRadius: params.radius || 25,
        queryUsed: query,
        sourceCount: rawResult.sources.length,
        confidence: this.calculateSearchConfidence(rawResult)
      }
    }
  }

  /**
   * Save research results to database
   */
  async saveVendorsToDatabase(vendors: NormalizedVendor[], searchParams: VendorSearchParams) {
    const results = []
    
    for (const vendor of vendors) {
      try {
        const savedVendor = await this.prisma.vendor.upsert({
          where: { 
            name_zipCode: {
              name: vendor.name,
              zipCode: vendor.address.zipCode
            }
          },
          update: {
            businessType: vendor.businessType,
            description: vendor.description,
            phone: vendor.contact.phone,
            email: vendor.contact.email,
            website: vendor.contact.website,
            address: vendor.address.street,
            city: vendor.address.city,
            state: vendor.address.state,
            zipCode: vendor.address.zipCode,
            rating: vendor.ratings.overallRating,
            certifications: vendor.ratings.certifications,
            serviceRadius: vendor.serviceArea.radius,
            lastUpdated: new Date()
          },
          create: {
            name: vendor.name,
            businessType: vendor.businessType,
            description: vendor.description,
            phone: vendor.contact.phone,
            email: vendor.contact.email,
            website: vendor.contact.website,
            address: vendor.address.street,
            city: vendor.address.city,
            state: vendor.address.state,
            zipCode: vendor.address.zipCode,
            rating: vendor.ratings.overallRating,
            certifications: vendor.ratings.certifications,
            serviceRadius: vendor.serviceArea.radius,
            verified: false,
            lastUpdated: new Date()
          }
        })
        
        results.push(savedVendor)
      } catch (error) {
        console.error(`Failed to save vendor ${vendor.name}:`, error)
      }
    }
    
    return results
  }

  /**
   * Build location string from parameters
   */
  private buildLocationString(params: VendorSearchParams): string {
    if (params.zipCode) {
      return params.zipCode
    }
    
    if (params.city && params.state) {
      return `${params.city}, ${params.state}`
    }
    
    if (params.city) {
      return params.city
    }
    
    return 'United States'
  }

  /**
   * Build search query from parameters
   */
  private buildSearchQuery(params: VendorSearchParams): string {
    const parts = []
    
    // Add vendor type
    if (params.vendorType) {
      parts.push(params.vendorType.replace('_', ' '))
    }
    
    // Add material type
    if (params.materialType) {
      parts.push(params.materialType.replace('_', ' '))
    }
    
    // Add service type
    if (params.serviceType) {
      parts.push(params.serviceType.replace('_', ' '))
    }
    
    // Add trade specialty
    if (params.tradeSpecialty) {
      parts.push(params.tradeSpecialty.replace('_', ' '))
    }
    
    // Add project type context
    if (params.projectType) {
      parts.push(`for ${params.projectType.replace('_', ' ')} projects`)
    }
    
    // Add contractor tier
    if (params.contractorTier && params.contractorTier !== 'all') {
      parts.push(`${params.contractorTier} contractors`)
    }
    
    const query = parts.length > 0 
      ? parts.join(' ') + ' suppliers and vendors'
      : 'construction suppliers and building material vendors'
    
    return query
  }

  /**
   * Normalize raw vendor data into standardized format
   */
  private async normalizeVendorData(rawVendors: any[], params: VendorSearchParams): Promise<NormalizedVendor[]> {
    return rawVendors.map(vendor => {
      // Extract and clean vendor data
      const normalizedVendor: NormalizedVendor = {
        name: this.cleanString(vendor.name || vendor.businessName || 'Unknown Vendor'),
        businessType: this.inferBusinessType(vendor, params),
        description: this.cleanString(vendor.description || vendor.summary),
        
        address: {
          street: this.cleanString(vendor.address || vendor.street),
          city: this.cleanString(vendor.city || this.extractCity(vendor.location)),
          state: this.cleanString(vendor.state || this.extractState(vendor.location)),
          zipCode: this.cleanString(vendor.zipCode || vendor.zip || params.zipCode),
          country: 'USA'
        },
        
        contact: {
          phone: this.cleanPhone(vendor.phone || vendor.phoneNumber),
          email: this.cleanEmail(vendor.email),
          website: this.cleanUrl(vendor.website || vendor.url),
          hours: this.cleanString(vendor.hours || vendor.businessHours)
        },
        
        businessInfo: {
          established: this.parseYear(vendor.established || vendor.yearEstablished),
          yearsInBusiness: this.calculateYearsInBusiness(vendor.established),
          licenseNumber: this.cleanString(vendor.license || vendor.licenseNumber),
          insuranceInfo: this.cleanString(vendor.insurance),
          bonded: this.parseBoolean(vendor.bonded)
        },
        
        services: {
          vendorTypes: this.inferVendorTypes(vendor, params),
          materialTypes: this.inferMaterialTypes(vendor, params),
          serviceTypes: this.inferServiceTypes(vendor, params),
          tradeSpecialties: this.inferTradeSpecialties(vendor, params),
          projectTypes: this.inferProjectTypes(vendor, params)
        },
        
        ratings: {
          overallRating: this.parseRating(vendor.rating || vendor.stars),
          reviewCount: this.parseNumber(vendor.reviewCount || vendor.reviews),
          bbbRating: this.cleanString(vendor.bbbRating),
          certifications: this.parseCertifications(vendor.certifications || vendor.certs)
        },
        
        serviceArea: {
          radius: this.parseNumber(vendor.serviceRadius) || params.radius || 25,
          counties: this.parseStringArray(vendor.counties),
          states: this.parseStringArray(vendor.states),
          deliveryRange: this.parseNumber(vendor.deliveryRange)
        },
        
        pricing: {
          priceRange: this.inferPriceRange(vendor.pricing || vendor.priceLevel),
          paymentTerms: this.parseStringArray(vendor.paymentTerms),
          discounts: this.parseStringArray(vendor.discounts),
          minimumOrder: this.parseNumber(vendor.minimumOrder)
        },
        
        logistics: {
          distanceFromSearch: this.parseDistance(vendor.distance),
          deliveryAvailable: this.parseBoolean(vendor.delivery),
          pickupAvailable: this.parseBoolean(vendor.pickup),
          rushOrderCapability: this.parseBoolean(vendor.rushOrders)
        },
        
        metadata: {
          sourceReliability: this.calculateSourceReliability(vendor),
          lastUpdated: new Date(),
          researchConfidence: this.calculateResearchConfidence(vendor),
          dataCompleteness: this.calculateDataCompleteness(vendor)
        }
      }
      
      return normalizedVendor
    })
  }

  /**
   * Filter vendors based on search parameters
   */
  private filterVendors(vendors: NormalizedVendor[], params: VendorSearchParams): NormalizedVendor[] {
    return vendors.filter(vendor => {
      // Rating filter
      if (params.minRating && vendor.ratings.overallRating && vendor.ratings.overallRating < params.minRating) {
        return false
      }
      
      // Years in business filter
      if (params.yearsInBusiness && vendor.businessInfo.yearsInBusiness && vendor.businessInfo.yearsInBusiness < params.yearsInBusiness) {
        return false
      }
      
      // Distance filter (if we have distance data)
      if (params.radius && vendor.logistics.distanceFromSearch && vendor.logistics.distanceFromSearch > params.radius) {
        return false
      }
      
      // Certification filter
      if (params.certifications && params.certifications.length > 0) {
        const hasRequiredCert = params.certifications.some(cert => 
          vendor.ratings.certifications.some(vendorCert => 
            vendorCert.toLowerCase().includes(cert.toLowerCase())
          )
        )
        if (!hasRequiredCert) return false
      }
      
      return true
    })
  }

  /**
   * Sort vendors based on specified criteria
   */
  private sortVendors(vendors: NormalizedVendor[], sortBy: string): NormalizedVendor[] {
    return vendors.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.logistics.distanceFromSearch || 999) - (b.logistics.distanceFromSearch || 999)
        case 'rating':
          return (b.ratings.overallRating || 0) - (a.ratings.overallRating || 0)
        case 'established':
          return (b.businessInfo.established || 0) - (a.businessInfo.established || 0)
        case 'price':
          // Simple price range comparison
          const priceOrder = { budget: 1, 'mid-range': 2, premium: 3 }
          return (priceOrder[a.pricing.priceRange as keyof typeof priceOrder] || 2) - 
                 (priceOrder[b.pricing.priceRange as keyof typeof priceOrder] || 2)
        default:
          return 0
      }
    })
  }

  // Utility methods for data cleaning and parsing
  private cleanString(str: any): string | undefined {
    if (!str || typeof str !== 'string') return undefined
    return str.trim().replace(/\s+/g, ' ')
  }

  private cleanPhone(phone: any): string | undefined {
    if (!phone) return undefined
    return phone.toString().replace(/\D/g, '')
  }

  private cleanEmail(email: any): string | undefined {
    if (!email || typeof email !== 'string') return undefined
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) ? email.toLowerCase() : undefined
  }

  private cleanUrl(url: any): string | undefined {
    if (!url || typeof url !== 'string') return undefined
    if (!url.startsWith('http')) return `https://${url}`
    return url
  }

  private parseNumber(value: any): number | undefined {
    if (!value) return undefined
    const num = parseFloat(value.toString())
    return isNaN(num) ? undefined : num
  }

  private parseYear(year: any): number | undefined {
    const num = this.parseNumber(year)
    return num && num > 1800 && num <= new Date().getFullYear() ? num : undefined
  }

  private parseRating(rating: any): number | undefined {
    const num = this.parseNumber(rating)
    return num && num >= 0 && num <= 5 ? num : undefined
  }

  private parseBoolean(value: any): boolean | undefined {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.toLowerCase()
      if (['true', 'yes', 'y', '1'].includes(lower)) return true
      if (['false', 'no', 'n', '0'].includes(lower)) return false
    }
    return undefined
  }

  private parseStringArray(value: any): string[] {
    if (Array.isArray(value)) return value.filter(v => typeof v === 'string')
    if (typeof value === 'string') return value.split(',').map(s => s.trim())
    return []
  }

  private parseCertifications(certs: any): string[] {
    const certArray = this.parseStringArray(certs)
    return certArray.map(cert => cert.toUpperCase())
  }

  private parseDistance(distance: any): number | undefined {
    if (!distance) return undefined
    const distStr = distance.toString().toLowerCase()
    const match = distStr.match(/(\d+(?:\.\d+)?)\s*(mile|mi|km)/i)
    if (match) {
      const num = parseFloat(match[1])
      const unit = match[2].toLowerCase()
      return unit.startsWith('k') ? num * 0.621371 : num // Convert km to miles
    }
    return this.parseNumber(distance)
  }

  private calculateYearsInBusiness(established: any): number | undefined {
    const year = this.parseYear(established)
    return year ? new Date().getFullYear() - year : undefined
  }

  private extractCity(location: string): string | undefined {
    if (!location) return undefined
    const parts = location.split(',')
    return parts[0]?.trim()
  }

  private extractState(location: string): string | undefined {
    if (!location) return undefined
    const parts = location.split(',')
    return parts[1]?.trim().split(' ')[0]
  }

  private inferBusinessType(vendor: any, params: VendorSearchParams): VendorType {
    if (params.vendorType) return params.vendorType
    
    const name = (vendor.name || '').toLowerCase()
    const description = (vendor.description || '').toLowerCase()
    const text = `${name} ${description}`
    
    if (text.includes('lumber') || text.includes('millwork')) return 'lumber_supplier'
    if (text.includes('home depot') || text.includes('lowes') || text.includes('menards')) return 'home_center'
    if (text.includes('plumbing')) return 'plumbing_supply'
    if (text.includes('electrical')) return 'electrical_supply'
    if (text.includes('roofing')) return 'roofing_supply'
    if (text.includes('concrete')) return 'concrete_supplier'
    if (text.includes('steel') || text.includes('metal')) return 'steel_supplier'
    if (text.includes('hardware')) return 'hardware_store'
    
    return 'building_materials'
  }

  private inferVendorTypes(vendor: any, params: VendorSearchParams): VendorType[] {
    const types: VendorType[] = [this.inferBusinessType(vendor, params)]
    // Add logic to infer additional types based on services offered
    return types
  }

  private inferMaterialTypes(vendor: any, params: VendorSearchParams): MaterialType[] {
    if (params.materialType) return [params.materialType]
    
    const types: MaterialType[] = []
    const text = `${vendor.name || ''} ${vendor.description || ''}`.toLowerCase()
    
    if (text.includes('lumber') || text.includes('wood')) types.push('framing_lumber')
    if (text.includes('plywood') || text.includes('osb')) types.push('plywood_osb')
    if (text.includes('drywall') || text.includes('sheetrock')) types.push('drywall_sheetrock')
    if (text.includes('concrete') || text.includes('cement')) types.push('concrete_cement')
    if (text.includes('roofing')) types.push('roofing_materials')
    if (text.includes('insulation')) types.push('insulation')
    if (text.includes('hardware') || text.includes('fastener')) types.push('hardware_fasteners')
    
    return types.length > 0 ? types : ['hardware_fasteners']
  }

  private inferServiceTypes(vendor: any, params: VendorSearchParams): ServiceType[] {
    const services: ServiceType[] = []
    const text = `${vendor.description || ''} ${vendor.services || ''}`.toLowerCase()
    
    if (text.includes('delivery')) services.push('delivery')
    if (text.includes('install')) services.push('installation')
    if (text.includes('cutting') || text.includes('custom')) services.push('custom_cutting')
    if (text.includes('design') || text.includes('consultation')) services.push('design_consultation')
    if (text.includes('takeoff') || text.includes('estimate')) services.push('takeoff_services')
    if (text.includes('financing') || text.includes('credit')) services.push('financing')
    
    return services
  }

  private inferTradeSpecialties(vendor: any, params: VendorSearchParams): TradeSpecialty[] {
    if (params.tradeSpecialty) return [params.tradeSpecialty]
    return [] // Could add inference logic based on vendor type
  }

  private inferProjectTypes(vendor: any, params: VendorSearchParams): ProjectType[] {
    if (params.projectType) return [params.projectType]
    
    const types: ProjectType[] = []
    const text = `${vendor.description || ''}`.toLowerCase()
    
    if (text.includes('residential')) types.push('residential')
    if (text.includes('commercial')) types.push('commercial')
    if (text.includes('renovation') || text.includes('remodel')) types.push('renovation')
    if (text.includes('new construction') || text.includes('new build')) types.push('new_construction')
    
    return types.length > 0 ? types : ['residential', 'commercial']
  }

  private inferPriceRange(pricing: any): 'budget' | 'mid-range' | 'premium' | undefined {
    if (!pricing) return undefined
    
    const priceStr = pricing.toString().toLowerCase()
    if (priceStr.includes('budget') || priceStr.includes('low') || priceStr.includes('$')) return 'budget'
    if (priceStr.includes('premium') || priceStr.includes('high') || priceStr.includes('$$$')) return 'premium'
    return 'mid-range'
  }

  private calculateSourceReliability(vendor: any): number {
    let score = 0.5 // Base score
    
    if (vendor.phone) score += 0.1
    if (vendor.website) score += 0.1
    if (vendor.address) score += 0.1
    if (vendor.rating) score += 0.1
    if (vendor.established) score += 0.1
    if (vendor.license) score += 0.1
    
    return Math.min(score, 1.0)
  }

  private calculateResearchConfidence(vendor: any): number {
    let confidence = 0.6 // Base confidence
    
    if (vendor.name && vendor.name.length > 5) confidence += 0.1
    if (vendor.address || vendor.location) confidence += 0.1
    if (vendor.phone) confidence += 0.1
    if (vendor.description && vendor.description.length > 20) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  private calculateDataCompleteness(vendor: any): number {
    const fields = ['name', 'location', 'phone', 'address', 'description', 'rating', 'website']
    const completedFields = fields.filter(field => vendor[field]).length
    return completedFields / fields.length
  }

  private calculateSearchConfidence(result: MCPResearchResult): number {
    return Math.min(result.sources.length * 0.1 + 0.3, 1.0)
  }
}

// Mock MCP client for testing
class MockMCPClient implements MCPClient {
  async research(query: MCPResearchQuery): Promise<MCPResearchResult> {
    console.log(`🔍 Mock MCP Research: ${query.query} in ${query.location}`)
    
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
    
    return {
      summary: `Found construction suppliers and vendors for ${query.query} in ${query.location}`,
      keyFindings: [
        "Multiple local and regional suppliers available",
        "Mix of specialty and general building supply stores",
        "Various service levels and price ranges",
        "Good geographic coverage in the area"
      ],
      vendors: this.generateMockVendors(query),
      sources: [
        { title: "Business directories", url: "mock-source-1", relevance: 0.9 },
        { title: "Construction supplier databases", url: "mock-source-2", relevance: 0.8 },
        { title: "Local chamber of commerce", url: "mock-source-3", relevance: 0.7 }
      ]
    }
  }

  private generateMockVendors(query: MCPResearchQuery): any[] {
    const baseVendors = [
      {
        name: "Liberty Hill Building Supply",
        location: "Liberty Hill, TX",
        phone: "512-555-0101",
        website: "libertyhillsupply.com",
        description: "Local building materials supplier serving central Texas",
        rating: 4.2,
        established: 1998,
        distance: "2 miles",
        services: "delivery, custom cutting, consultation"
      },
      {
        name: "Home Depot - Georgetown",
        location: "Georgetown, TX",
        phone: "512-555-0102", 
        website: "homedepot.com",
        description: "Major home improvement retailer with full building supplies",
        rating: 3.8,
        established: 1978,
        distance: "12 miles",
        services: "delivery, installation, rental"
      },
      {
        name: "Central Texas Lumber",
        location: "Cedar Park, TX",
        phone: "512-555-0103",
        website: "centraltexaslumber.com", 
        description: "Professional lumber supplier for contractors",
        rating: 4.5,
        established: 1985,
        distance: "15 miles",
        services: "delivery, takeoff services, cutting"
      },
      {
        name: "Austin Building Materials",
        location: "Austin, TX",
        phone: "512-555-0104",
        website: "austinbuildingmaterials.com",
        description: "Wholesale building materials and contractor supplies",
        rating: 4.1,
        established: 1975,
        distance: "22 miles",
        services: "wholesale, delivery, financing"
      }
    ]
    
    return baseVendors
  }
}

