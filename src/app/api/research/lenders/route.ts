import { NextRequest, NextResponse } from 'next/server'
import { getPerplexityMCPClient } from '@/lib/mcp/perplexity-client'

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json()
    
    const query = `Research construction lenders for this project:

PROJECT DETAILS:
- Location: ${projectData.location}
- Project Type: ${projectData.type || 'Custom home construction'}
- Builder Type: ${projectData.builderType || 'Owner-builder'}
- Budget: ${projectData.budget || 'Not specified'}
- Timeline: ${projectData.timeline || 'Not specified'}

RESEARCH REQUIREMENTS:
Find 5-10 construction lenders that would be suitable for this project. For each lender, provide:
1. Lender name
2. Contact information (phone, email, website)
3. Loan types offered (construction-to-perm, construction-only, etc.)
4. Geographic coverage
5. Key requirements and qualifications
6. Typical interest rates and terms
7. Special programs or features

Format the response as a structured list with clear sections for each lender.`

    const mcpClient = getPerplexityMCPClient()
    const mcpResult = await mcpClient.searchLenders(query)
    
    // Extract the content from MCP response
    const researchResult = mcpResult.content?.[0]?.text || mcpResult.toString()

    // Simple parsing to extract structured data
    const lenders = parseLenderResponse(researchResult)

    return NextResponse.json({
      success: true,
      data: {
        rawResponse: researchResult,
        structuredData: lenders,
        projectData: projectData
      }
    })

  } catch (error) {
    console.error('Lender research error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to research lenders',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        hasApiKey: !!process.env.PERPLEXITY_API_KEY,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function parseLenderResponse(response: string): any[] {
  // Simple parsing logic - can be enhanced later
  const lenders = []
  
  // Split by common patterns to identify individual lenders
  const sections = response.split(/\n\s*\d+\.\s*|\n\s*##\s*|\n\s*\*\*/)
  
  for (const section of sections) {
    if (section.trim().length > 50) { // Skip very short sections
      const lender = {
        name: extractLenderName(section),
        content: section.trim(),
        contact: extractContactInfo(section),
        features: extractFeatures(section)
      }
      
      if (lender.name) {
        lenders.push(lender)
      }
    }
  }
  
  return lenders
}

function extractLenderName(text: string): string {
  // Look for common patterns for lender names
  const namePatterns = [
    /^([A-Z][a-zA-Z\s&]+(?:Bank|Credit Union|Financial|Lending|Mortgage|Capital))/,
    /^([A-Z][a-zA-Z\s&]+)/
  ]
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }
  
  return ''
}

function extractContactInfo(text: string): any {
  const contact = {
    phone: '',
    email: '',
    website: ''
  }
  
  // Extract phone numbers
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  if (phoneMatch) {
    contact.phone = phoneMatch[0]
  }
  
  // Extract emails
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) {
    contact.email = emailMatch[0]
  }
  
  // Extract websites
  const websiteMatch = text.match(/https?:\/\/[\w.-]+|www\.[\w.-]+/)
  if (websiteMatch) {
    contact.website = websiteMatch[0]
  }
  
  return contact
}

function extractFeatures(text: string): string[] {
  const features = []
  
  // Look for common construction loan features
  const featurePatterns = [
    /construction[- ]to[- ]perm/i,
    /construction[- ]only/i,
    /owner[- ]builder/i,
    /general contractor/i,
    /jumbo/i,
    /VA/i,
    /FHA/i,
    /USDA/i,
    /conventional/i
  ]
  
  for (const pattern of featurePatterns) {
    if (pattern.test(text)) {
      features.push(pattern.source.replace(/[\/\\igrx]/g, ''))
    }
  }
  
  return features
}