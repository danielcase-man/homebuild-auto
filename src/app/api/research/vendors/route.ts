import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { location, services, projectType } = await request.json()
    
    const prompt = `Research contractors and vendors for construction project in ${location}:

PROJECT DETAILS:
- Location: ${location}
- Project Type: ${projectType || 'Residential construction'}
- Services Needed: ${services || 'General construction services'}

RESEARCH REQUIREMENTS:
Find contractors and vendors for the following services:
1. General contractors
2. Excavation and site preparation
3. Concrete and foundation work
4. Framing contractors
5. Roofing contractors
6. Plumbing contractors
7. Electrical contractors
8. HVAC contractors
9. Insulation contractors
10. Drywall contractors
11. Flooring contractors
12. Kitchen and bathroom contractors
13. Painting contractors
14. Landscaping contractors

For each contractor/vendor, provide:
- Business name
- Contact information (phone, email, website)
- Services offered
- Service area
- License information (if available)
- Experience level
- Specialties or notable features

Focus on local contractors with good reputations and proper licensing.`

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-huge-128k-online',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const researchResult = data.choices[0].message.content

    const vendors = parseVendorResponse(researchResult)

    return NextResponse.json({
      success: true,
      data: {
        rawResponse: researchResult,
        structuredData: vendors,
        location: location,
        services: services,
        projectType: projectType
      }
    })

  } catch (error) {
    console.error('Vendor research error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to research vendors',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        hasApiKey: !!process.env.PERPLEXITY_API_KEY,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function parseVendorResponse(response: string): any[] {
  const vendors = []
  
  // Split by common patterns to identify individual vendors
  const sections = response.split(/\n\s*\d+\.\s*|\n\s*##\s*|\n\s*\*\*/)
  
  for (const section of sections) {
    if (section.trim().length > 50) { // Skip very short sections
      const vendor = {
        name: extractVendorName(section),
        content: section.trim(),
        contact: extractContactInfo(section),
        services: extractServices(section),
        serviceArea: extractServiceArea(section)
      }
      
      if (vendor.name) {
        vendors.push(vendor)
      }
    }
  }
  
  return vendors
}

function extractVendorName(text: string): string {
  // Look for common patterns for vendor names
  const namePatterns = [
    /^([A-Z][a-zA-Z\s&]+(?:Construction|Contractors?|Services?|Inc|LLC|Corp))/,
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

function extractServices(text: string): string[] {
  const services = []
  
  // Look for common construction services
  const servicePatterns = [
    /general contract/i,
    /excavation/i,
    /concrete/i,
    /foundation/i,
    /framing/i,
    /roofing/i,
    /plumbing/i,
    /electrical/i,
    /HVAC/i,
    /insulation/i,
    /drywall/i,
    /flooring/i,
    /kitchen/i,
    /bathroom/i,
    /painting/i,
    /landscaping/i
  ]
  
  for (const pattern of servicePatterns) {
    if (pattern.test(text)) {
      services.push(pattern.source.replace(/[\/\\igrx]/g, ''))
    }
  }
  
  return services
}

function extractServiceArea(text: string): string {
  // Look for service area mentions
  const areaPatterns = [
    /serves?\s+([A-Z][a-zA-Z\s,]+)/i,
    /service area[:\s]+([A-Z][a-zA-Z\s,]+)/i,
    /covering?\s+([A-Z][a-zA-Z\s,]+)/i
  ]
  
  for (const pattern of areaPatterns) {
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