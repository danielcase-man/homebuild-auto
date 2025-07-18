import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasPerplexityKey: !!process.env.PERPLEXITY_API_KEY,
    perplexityKeyLength: process.env.PERPLEXITY_API_KEY?.length || 0,
    keyPreview: process.env.PERPLEXITY_API_KEY?.substring(0, 10) + '...' || 'NOT_FOUND'
  }

  return NextResponse.json(debug)
}

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json()
    
    if (testType === 'perplexity') {
      // Test Perplexity API connection
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{ role: 'user', content: 'Test message: What is 2+2?' }],
          temperature: 0.1,
          max_tokens: 100
        })
      })

      const responseText = await response.text()
      
      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        response: response.ok ? JSON.parse(responseText) : responseText,
        headers: Object.fromEntries(response.headers.entries())
      })
    }
    
    return NextResponse.json({ error: 'Unknown test type' }, { status: 400 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}