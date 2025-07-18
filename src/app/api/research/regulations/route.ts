import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { location, projectType } = await request.json()
    
    const prompt = `Research building codes and permit requirements for construction in ${location}:

PROJECT DETAILS:
- Location: ${location}
- Project Type: ${projectType || 'Residential construction'}

RESEARCH REQUIREMENTS:
Provide comprehensive information about:
1. Building codes that apply (IBC, IRC, local amendments)
2. Permit requirements and process
3. Inspection requirements and timeline
4. Zoning restrictions and setback requirements
5. Environmental regulations
6. Special requirements (fire safety, accessibility, etc.)
7. Permit costs and fees
8. Processing times and approval timeline
9. Required documentation
10. Local building department contact information

Focus on specific, actionable information that would be needed for permit applications.`

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

    const regulations = parseRegulationResponse(researchResult)

    return NextResponse.json({
      success: true,
      data: {
        rawResponse: researchResult,
        structuredData: regulations,
        location: location,
        projectType: projectType
      }
    })

  } catch (error) {
    console.error('Regulation research error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to research regulations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function parseRegulationResponse(response: string): any {
  return {
    buildingCodes: extractSection(response, ['building code', 'code requirements']),
    permits: extractSection(response, ['permit', 'permitting']),
    inspections: extractSection(response, ['inspection', 'inspector']),
    zoning: extractSection(response, ['zoning', 'setback']),
    environmental: extractSection(response, ['environmental', 'impact']),
    costs: extractSection(response, ['cost', 'fee', 'price']),
    timeline: extractSection(response, ['timeline', 'processing time', 'approval']),
    contact: extractContactInfo(response),
    rawContent: response
  }
}

function extractSection(text: string, keywords: string[]): string[] {
  const sections = []
  const lines = text.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    
    if (keywords.some(keyword => line.includes(keyword))) {
      let section = lines[i]
      
      // Include following lines that seem related
      for (let j = i + 1; j < lines.length && j < i + 3; j++) {
        if (lines[j].trim().length > 0 && !lines[j].match(/^\d+\./)) {
          section += '\n' + lines[j]
        } else {
          break
        }
      }
      
      sections.push(section.trim())
    }
  }
  
  return sections
}

function extractContactInfo(text: string): any {
  const contact = {
    department: '',
    phone: '',
    email: '',
    website: '',
    address: ''
  }
  
  // Extract department names
  const deptMatch = text.match(/(building department|planning department|code enforcement|permit office)/i)
  if (deptMatch) {
    contact.department = deptMatch[1]
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