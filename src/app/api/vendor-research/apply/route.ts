import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { VendorDiscoveryResult } from '@/lib/perplexity-mcp-service'

export async function POST(request: NextRequest) {
  try {
    const { researchId, selectedVendors } = await request.json()
    
    if (!researchId || !selectedVendors || !Array.isArray(selectedVendors)) {
      return NextResponse.json(
        { error: 'Research ID and selected vendors are required' },
        { status: 400 }
      )
    }

    // Get the research record
    const research = await prisma.vendorResearch.findUnique({
      where: { id: researchId }
    })
    
    if (!research) {
      return NextResponse.json(
        { error: 'Research record not found' },
        { status: 404 }
      )
    }

    // Get company ID (in production, this would come from authenticated user)
    const companyId = process.env.DEFAULT_COMPANY_ID || 'default-company'
    
    // Create vendors from selected research results
    const vendorsToCreate = selectedVendors.map((vendorData: VendorDiscoveryResult) => ({
      companyId,
      name: vendorData.name,
      type: this.mapTradeToSupplierType(research.trade),
      email: vendorData.contact.email,
      phone: vendorData.contact.phone,
      website: vendorData.contact.website,
      address: {
        street: vendorData.location.address || '',
        city: vendorData.location.city,
        state: vendorData.location.state,
        zip: '',
        country: 'US'
      },
      license: vendorData.credentials.license,
      insurance: vendorData.credentials.insurance,
      rating: vendorData.ratings.overall,
      specialties: vendorData.specialties,
      serviceRadius: vendorData.location.radius,
      yearsInBusiness: vendorData.experience.yearsInBusiness,
      texasLicense: vendorData.texasLicense,
      libertyHillApproved: vendorData.libertyHillApproved || false,
      discoveredVia: 'RESEARCH',
      researchData: vendorData,
      lastResearched: new Date(),
      performanceScore: vendorData.confidence,
      onTimePercentage: null,
      qualityScore: vendorData.ratings.overall,
      preferredContact: 'EMAIL',
      responseTime: null,
      status: 'ACTIVE',
      tags: [research.trade, 'AI_DISCOVERED']
    }))
    
    // Create vendors in database
    const createdVendors = await Promise.all(
      vendorsToCreate.map(vendorData => 
        prisma.supplier.create({ data: vendorData })
      )
    )
    
    // Update research record
    await prisma.vendorResearch.update({
      where: { id: researchId },
      data: {
        applied: true,
        vendorsCreated: createdVendors.length,
        reviewedAt: new Date()
      }
    })

    return NextResponse.json({
      created: createdVendors.length,
      vendors: createdVendors.map(v => ({
        id: v.id,
        name: v.name,
        type: v.type,
        email: v.email,
        phone: v.phone,
        rating: v.rating,
        specialties: v.specialties
      }))
    })
    
  } catch (error) {
    console.error('Error applying vendor research:', error)
    return NextResponse.json(
      { error: 'Failed to apply research results' },
      { status: 500 }
    )
  }
}

// Helper function to map trade to supplier type
function mapTradeToSupplierType(trade: string): 'MATERIAL' | 'SUBCONTRACTOR' | 'EQUIPMENT' | 'SERVICE' {
  const tradeType = trade.toLowerCase()
  
  if (tradeType.includes('electrical') || tradeType.includes('plumbing') || 
      tradeType.includes('hvac') || tradeType.includes('roofing') ||
      tradeType.includes('flooring') || tradeType.includes('framing') ||
      tradeType.includes('drywall') || tradeType.includes('painting')) {
    return 'SUBCONTRACTOR'
  }
  
  if (tradeType.includes('lumber') || tradeType.includes('concrete') ||
      tradeType.includes('steel') || tradeType.includes('insulation') ||
      tradeType.includes('materials')) {
    return 'MATERIAL'
  }
  
  if (tradeType.includes('equipment') || tradeType.includes('tools') ||
      tradeType.includes('machinery') || tradeType.includes('rental')) {
    return 'EQUIPMENT'
  }
  
  return 'SERVICE'
}