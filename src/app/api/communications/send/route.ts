import { NextRequest, NextResponse } from 'next/server'
import { gmailService, type EmailComposition } from '@/lib/gmail-integration-service'

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailComposition = await request.json()
    
    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.body) {
      return NextResponse.json(
        { error: 'To, subject, and body are required' },
        { status: 400 }
      )
    }

    // Send email
    const result = await gmailService.sendEmail(emailData)
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      threadId: result.threadId
    })
    
  } catch (error) {
    console.error('Failed to send email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}