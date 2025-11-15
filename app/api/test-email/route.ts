import { NextResponse } from 'next/server'
import { isEmailEnabled, EMAIL_FROM } from '@/lib/email/resend'
import { resend } from '@/lib/email/resend'

export async function GET() {
  try {
    const emailEnabled = isEmailEnabled()
    const apiKey = process.env.RESEND_API_KEY

    // Don't send actual email in test, just check config
    return NextResponse.json({
      emailEnabled,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'none',
      emailFrom: EMAIL_FROM,
      env: {
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        EMAIL_FROM: process.env.EMAIL_FROM || 'not set',
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
