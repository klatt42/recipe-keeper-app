'use server'

import { resend, isEmailEnabled, EMAIL_FROM, APP_URL } from './resend'
import { CookbookInvitationEmail } from './templates/cookbook-invitation'
import { captureError } from '@/lib/utils/sentry'

interface SendCookbookInvitationParams {
  toEmail: string
  inviterName: string
  cookbookName: string
  cookbookId: string
  role: 'editor' | 'viewer'
  invitationToken?: string
}

export async function sendCookbookInvitation({
  toEmail,
  inviterName,
  cookbookName,
  cookbookId,
  role,
  invitationToken,
}: SendCookbookInvitationParams) {
  // Check if email is enabled
  if (!isEmailEnabled()) {
    console.warn('Email service is not configured. Skipping invitation email.')
    return {
      success: false,
      error: 'Email service not configured',
      message: 'Invitation created but email was not sent. Please share the cookbook link manually.',
    }
  }

  try {
    // Generate invitation accept URL
    // If there's an invitation token, user needs to signup first
    const acceptUrl = invitationToken
      ? `${APP_URL}/signup?invitation=${invitationToken}`
      : `${APP_URL}/cookbooks/${cookbookId}/accept`

    // Send email using Resend with simple HTML
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `${inviterName} invited you to ${cookbookName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="background-color: #f3f4f6; padding: 40px 20px;">
              <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px 24px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">🍳 My Family Recipe Keeper</h1>
                </div>

                <!-- Content -->
                <div style="padding: 32px 24px;">
                  <h2 style="color: #111827; font-size: 24px; font-weight: bold; margin-top: 0; margin-bottom: 16px;">You've been invited!</h2>

                  <p style="color: #374151; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 16px;">
                    <strong>${inviterName}</strong> has invited you to collaborate on their cookbook:
                  </p>

                  <div style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="color: #92400e; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">❤️ ${cookbookName}</p>
                    <p style="color: #78350f; font-size: 14px; margin: 0;">
                      Role: <span style="background-color: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 12px; font-weight: bold;">${role === 'editor' ? 'Editor' : 'Viewer'}</span>
                    </p>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${acceptUrl}" style="background-color: #3b82f6; color: #ffffff; font-size: 16px; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; display: inline-block;">Accept Invitation</a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 24px; margin-bottom: 8px;">
                    Or copy and paste this URL into your browser:
                  </p>
                  <p style="color: #3b82f6; font-size: 12px; text-align: center; word-break: break-all; margin: 0 0 24px 0;">${acceptUrl}</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 4px 0;">
                    This invitation was sent by ${inviterName} via My Family Recipe Keeper.
                  </p>
                  <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 4px 0;">
                    If you don't want to accept this invitation, you can safely ignore this email.
                  </p>
                </div>

              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send invitation email:', error)
      captureError(new Error('Failed to send invitation email'), {
        tags: { service: 'resend', type: 'cookbook_invitation' },
        extra: { error, toEmail, cookbookId },
      })
      return {
        success: false,
        error: error.message,
        message: 'Failed to send invitation email. The user has been added but may not receive a notification.',
      }
    }

    console.log('Invitation email sent successfully:', data?.id)
    return {
      success: true,
      data,
      message: 'Invitation email sent successfully!',
    }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    captureError(error as Error, {
      tags: { service: 'resend', type: 'cookbook_invitation' },
      extra: { toEmail, cookbookId },
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'An error occurred while sending the invitation email.',
    }
  }
}
