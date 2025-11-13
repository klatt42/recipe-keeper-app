import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will not work.')
}

export const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-development')

/**
 * Send an email using Resend
 *
 * @param options Email options
 * @returns Promise with send result
 */
export async function sendEmail(options: {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}) {
  const from = options.from || `My Family Recipe Keeper <noreply@${process.env.RESEND_DOMAIN || 'yourdomain.com'}>`

  try {
    const  { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify that Resend is properly configured
 */
export async function verifyEmailConfig() {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-development') {
    return { configured: false, error: 'RESEND_API_KEY not set' }
  }

  // Test API key by listing domains
  try {
    await resend.domains.list()
    return { configured: true, error: null }
  } catch (error: any) {
    return { configured: false, error: error.message }
  }
}
