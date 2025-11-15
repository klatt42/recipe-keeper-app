import { NextResponse } from 'next/server'
import { isEmailEnabled, EMAIL_FROM } from '@/lib/email/resend'
import { resend } from '@/lib/email/resend'

export async function GET() {
  try {
    const emailEnabled = isEmailEnabled()
    const apiKey = process.env.RESEND_API_KEY

    if (!emailEnabled) {
      return NextResponse.json({
        error: 'Email not enabled',
        emailEnabled: false,
        hasApiKey: !!apiKey,
        emailFrom: EMAIL_FROM,
      }, { status: 500 })
    }

    // Try to send a simple test email
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: 'ppsc.rok@gmail.com', // Send to Resend registered email
      subject: 'Recipe Keeper - Test Email',
      html: '<p>This is a test email from Recipe Keeper. If you receive this, email is working!</p>',
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to send email',
        resendError: error,
      }, { status: 500 })
    }

    console.log('Test email sent successfully:', data)
    return NextResponse.json({
      success: true,
      message: 'Test email sent!',
      emailId: data?.id,
      sentTo: 'h15629526027@gmail.com',
      from: EMAIL_FROM,
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
