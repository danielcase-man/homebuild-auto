/**
 * Vendor Research API Endpoint
 * Provides REST API for dynamic vendor research functionality
 */

import { NextRequest, NextResponse } from 'next/server'
import { DynamicVendorResearchService, VendorSearchParams } from '@/lib/dynamic-vendor-research'

// Initialize the research service
const researchService = new DynamicVendorResearchService()

export async function POST(request: NextRequest) {
  try {
    const body: VendorSearchParams & { saveToDatabase?: boolean } = await request.json()
    
    // Validate required parameters
    if (!body.zipCode && !body.city && !body.state) {
      return NextResponse.json(
        { error: 'Location parameter required (zipCode, city, or state)' },
        { status: 400 }
      )
    }

    console.log('🔍 Starting vendor research with params:', {
      location: body.zipCode || `${body.city}, ${body.state}`,
      vendorType: body.vendorType,
      materialType: body.materialType,
      radius: body.radius || 25
    })

    // Perform the research
    const result = await researchService.searchVendors(body)
    
    // Optionally save to database
    let savedVendors = []
    if (body.saveToDatabase && result.vendors.length > 0) {
      try {
        savedVendors = await researchService.saveVendorsToDatabase(result.vendors, body)
        console.log(`💾 Saved ${savedVendors.length} vendors to database`)
      } catch (saveError) {
        console.error('Failed to save vendors to database:', saveError)
        // Continue without failing the request
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        vendors: result.vendors,
        metadata: result.searchMetadata,
        totalFound: result.totalFound,
        savedToDatabase: savedVendors.length,
        searchParams: {
          location: result.searchMetadata.location,
          radius: result.searchMetadata.searchRadius,
          vendorType: body.vendorType,
          materialType: body.materialType
        }
      }
    })

  } catch (error) {
    console.error('Vendor research API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to research vendors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    // Convert query parameters to VendorSearchParams
    const params: VendorSearchParams = {
      zipCode: searchParams.get('zipCode') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined,
      vendorType: searchParams.get('vendorType') as any,
      materialType: searchParams.get('materialType') as any,
      serviceType: searchParams.get('serviceType') as any,
      tradeSpecialty: searchParams.get('tradeSpecialty') as any,
      projectType: searchParams.get('projectType') as any,
      contractorTier: searchParams.get('contractorTier') as any,
      includeContact: searchParams.get('includeContact') === 'true',
      includePricing: searchParams.get('includePricing') === 'true',
      includeReviews: searchParams.get('includeReviews') === 'true',
      maxResults: searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults')!) : undefined,
      sortBy: searchParams.get('sortBy') as any,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    }

    // Validate required parameters
    if (!params.zipCode && !params.city && !params.state) {
      return NextResponse.json(
        { error: 'Location parameter required (zipCode, city, or state)' },
        { status: 400 }
      )
    }

    const result = await researchService.searchVendors(params)
    
    return NextResponse.json({
      success: true,
      data: {
        vendors: result.vendors,
        metadata: result.searchMetadata,
        totalFound: result.totalFound,
        searchParams: params
      }
    })

  } catch (error) {
    console.error('Vendor research GET API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to research vendors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}