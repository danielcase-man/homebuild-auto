import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { MaterialDiscoveryResult } from '@/lib/perplexity-mcp-service'

export async function POST(request: NextRequest) {
  try {
    const { materials } = await request.json()
    
    if (!materials || !Array.isArray(materials)) {
      return NextResponse.json(
        { error: 'Materials array is required' },
        { status: 400 }
      )
    }

    // Convert research results to material records
    const materialsToCreate = materials.map((materialData: MaterialDiscoveryResult) => ({
      name: materialData.name,
      description: materialData.description,
      category: materialData.category,
      subcategory: materialData.subcategory,
      sku: null,
      upc: null,
      specifications: {
        ...materialData.specifications,
        texas_climate_suitability: materialData.texas_climate_suitability,
        installation: materialData.installation,
        warranty: materialData.warranty
      },
      grade: null,
      brand: materialData.brand,
      model: materialData.model,
      basePrice: materialData.pricing.basePrice,
      unit: materialData.pricing.unit,
      leadTime: this.parseLeadTime(materialData.availability.leadTime),
      researchData: materialData,
      lastResearched: new Date(),
      popularityScore: materialData.confidence,
      qualityRating: materialData.ratings.overall,
      status: 'ACTIVE',
      tags: [
        materialData.category,
        'AI_DISCOVERED',
        ...(materialData.sustainability.eco_friendly ? ['ECO_FRIENDLY'] : []),
        ...(materialData.texas_climate_suitability.rating ? ['TEXAS_CLIMATE'] : [])
      ]
    }))
    
    // Create materials in database
    const createdMaterials = await Promise.all(
      materialsToCreate.map(materialData => 
        prisma.material.create({ data: materialData })
      )
    )
    
    // Create vendor relationships for materials that have supplier information
    const vendorRelationships = []
    
    for (const [index, createdMaterial] of createdMaterials.entries()) {
      const originalData = materials[index] as MaterialDiscoveryResult
      
      if (originalData.availability.suppliers?.length) {
        for (const supplierName of originalData.availability.suppliers) {
          // Try to find existing supplier or create a placeholder
          let supplier = await prisma.supplier.findFirst({
            where: {
              name: {
                contains: supplierName,
                mode: 'insensitive'
              }
            }
          })
          
          if (!supplier) {
            // Create a basic supplier record for tracking
            supplier = await prisma.supplier.create({
              data: {
                companyId: process.env.DEFAULT_COMPANY_ID || 'default-company',
                name: supplierName,
                type: 'MATERIAL',
                status: 'ACTIVE',
                discoveredVia: 'RESEARCH',
                tags: ['AI_DISCOVERED', 'MATERIAL_SUPPLIER']
              }
            })
          }
          
          // Create material-vendor relationship
          vendorRelationships.push({
            materialId: createdMaterial.id,
            supplierId: supplier.id,
            price: originalData.pricing.basePrice || 0,
            availability: originalData.availability.inStock ? 'IN_STOCK' : 'SPECIAL_ORDER',
            leadTime: this.parseLeadTime(originalData.availability.leadTime),
            isPreferred: false
          })
        }
      }
    }
    
    // Create vendor relationships
    if (vendorRelationships.length > 0) {
      await prisma.materialVendor.createMany({
        data: vendorRelationships,
        skipDuplicates: true
      })
    }

    return NextResponse.json({
      created: createdMaterials.length,
      vendorRelationships: vendorRelationships.length,
      materials: createdMaterials.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        brand: m.brand,
        basePrice: m.basePrice,
        unit: m.unit,
        qualityRating: m.qualityRating
      }))
    })
    
  } catch (error) {
    console.error('Error creating materials:', error)
    return NextResponse.json(
      { error: 'Failed to create materials' },
      { status: 500 }
    )
  }
}

// Helper function to parse lead time from string to days
function parseLeadTime(leadTimeStr?: string): number | null {
  if (!leadTimeStr) return null
  
  const lowerStr = leadTimeStr.toLowerCase()
  
  // Extract number from string
  const match = lowerStr.match(/(\d+)/)
  if (!match) return null
  
  const num = parseInt(match[1])
  
  if (lowerStr.includes('day')) return num
  if (lowerStr.includes('week')) return num * 7
  if (lowerStr.includes('month')) return num * 30
  if (lowerStr.includes('year')) return num * 365
  
  return num // Default to days
}