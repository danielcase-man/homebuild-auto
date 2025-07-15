import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleVendorResearch, type VendorResearchRequest } from '@/lib/perplexity-mcp-service'

export async function POST(request: NextRequest) {
  try {
    const body: VendorResearchRequest = await request.json()
    
    // Validate required fields
    if (!body.trade || !body.location) {
      return NextResponse.json(
        { error: 'Trade and location are required' },
        { status: 400 }
      )
    }

    // Perform vendor research using Perplexity MCP
    const vendors = await handleVendorResearch(body)
    
    // Save research results to database
    const researchRecord = await prisma.vendorResearch.create({
      data: {
        trade: body.trade,
        searchQuery: body.query || `${body.trade} vendors in ${body.location}`,
        location: body.location,
        projectId: (body as any).projectId,
        researchData: {
          originalRequest: body,
          timestamp: new Date().toISOString(),
          resultsCount: vendors.length
        },
        vendorsFound: vendors,
        confidence: vendors.reduce((sum, v) => sum + v.confidence, 0) / vendors.length,
        completeness: Math.min(vendors.length / 10, 1.0), // Consider 10+ vendors as complete
        status: 'COMPLETED'
      }
    })

    return NextResponse.json({
      id: researchRecord.id,
      vendors,
      confidence: researchRecord.confidence,
      completeness: researchRecord.completeness,
      resultCount: vendors.length,
      timestamp: researchRecord.createdAt
    })
    
  } catch (error) {
    console.error('Vendor research error:', error)
    return NextResponse.json(
      { error: 'Failed to research vendors' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const trade = searchParams.get('trade')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const where: any = {
      status: 'COMPLETED'
    }
    
    if (projectId) {
      where.projectId = projectId
    }
    
    if (trade) {
      where.trade = trade
    }
    
    const researchHistory = await prisma.vendorResearch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        trade: true,
        searchQuery: true,
        location: true,
        confidence: true,
        completeness: true,
        vendorsCreated: true,
        applied: true,
        createdAt: true,
        vendorsFound: true
      }
    })

    return NextResponse.json(researchHistory)
    
  } catch (error) {
    console.error('Error fetching vendor research history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch research history' },
      { status: 500 }
    )
  }
}