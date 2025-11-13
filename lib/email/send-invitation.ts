'use server'

import { sendEmail } from './client'
import { CookbookInvitationEmail } from './templates/cookbook-invitation'
import { createClient } from '@/lib/supabase/server'
import { captureError } from '@/lib/utils/error-handler'

interface SendInvitationParams {
  inviteeEmail: string
  inviterName: string
  cookbookId: string
  cookbookName: string
  role: 'owner' | 'editor' | 'viewer'
}

/**
 * Send a cookbook invitation email
 */
export async function sendCookbookInvitation(params: SendInvitationParams) {
  try {
    const supabase = await createClient()

    // Get recipe count for the cookbook
    const { count: recipesCount } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', params.cookbookId)

    // Generate accept URL
    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cookbooks/${params.cookbookId}`

    // Generate HTML email
    const html = CookbookInvitationEmail({
      inviterName: params.inviterName,
      cookbookName: params.cookbookName,
      role: params.role,
      acceptUrl,
      recipesCount: recipesCount || 0,
    })

    // Send email
    const result = await sendEmail({
      to: params.inviteeEmail,
      subject: `${params.inviterName} invited you to "${params.cookbookName}" cookbook`,
      html,
    })

    if (!result.success) {
      // Log to Sentry but don't fail the invitation
      // (user is still added to cookbook even if email fails)
      captureError(new Error('Failed to send invitation email'), {
        action: 'sendCookbookInvitation',
        metadata: {
          inviteeEmail: params.inviteeEmail,
          cookbookId: params.cookbookId,
          error: result.error
        }
      })
    }

    return result
  } catch (error: any) {
    const errorMessage = captureError(error, {
      action: 'sendCookbookInvitation',
      metadata: params
    })

    console.error('Error sending invitation email:', error)
    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Send a welcome email to new users
 */
export async function sendWelcomeEmail(email: string, name?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header-icon { font-size: 64px; }
          h1 { color: #f59e0b; margin-bottom: 20px; }
          .button { display: inline-block; background: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🍳</div>
            <h1>Welcome to My Family Recipe Keeper!</h1>
          </div>

          <p>Hi${name ? ` ${name}` : ''}!</p>

          <p>Thank you for joining My Family Recipe Keeper, where families preserve their culinary heritage together.</p>

          <h3>What you can do:</h3>
          <ul>
            <li>📸 Import recipes from photos (even handwritten cards!)</li>
            <li>📚 Organize recipes in family cookbooks</li>
            <li>🤝 Share and collaborate with family members</li>
            <li>🤖 Generate variations with AI</li>
            <li>📊 Track nutrition and scale servings</li>
          </ul>

          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Get Started →</a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            Need help? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL}/help">Help Center</a> or reply to this email.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Welcome to My Family Recipe Keeper! 🍳',
    html,
  })
}
