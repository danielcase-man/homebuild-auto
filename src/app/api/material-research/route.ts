import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleMaterialResearch, type MaterialResearchRequest } from '@/lib/perplexity-mcp-service'

export async function POST(request: NextRequest) {
  try {
    const body: MaterialResearchRequest = await request.json()
    
    // Validate required fields
    if (!body.category) {
      return NextResponse.json(
        { error: 'Material category is required' },
        { status: 400 }
      )
    }

    // Perform material research using Perplexity MCP
    const materials = await handleMaterialResearch(body)
    
    // Save research results (you could create a MaterialResearch model similar to VendorResearch)
    const researchData = {
      category: body.category,
      query: body.query || `${body.category} materials`,
      specifications: body.specifications || [],
      budget: body.budget,
      qualityRequirements: body.qualityRequirements || [],
      sustainabilityRequirements: body.sustainabilityRequirements || [],
      texasClimate: body.texasClimate || false,
      results: materials,
      timestamp: new Date().toISOString(),
      resultCount: materials.length
    }

    return NextResponse.json({
      id: `material-research-${Date.now()}`,
      materials,
      confidence: materials.reduce((sum, m) => sum + m.confidence, 0) / materials.length,
      resultCount: materials.length,
      timestamp: new Date(),
      researchData
    })
    
  } catch (error) {
    console.error('Material research error:', error)
    return NextResponse.json(
      { error: 'Failed to research materials' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Get existing materials from database
    const where: any = {
      status: 'ACTIVE'
    }
    
    if (category) {
      where.category = category
    }
    
    const materials = await prisma.material.findMany({
      where,
      orderBy: { popularityScore: 'desc' },
      take: limit,
      include: {
        vendors: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                rating: true,
                status: true
              }
            }
          }
        },
        selections: projectId ? {
          where: { projectId }
        } : false
      }
    })

    return NextResponse.json(materials)
    
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}