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

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `${inviterName} invited you to ${cookbookName}`,
      react: CookbookInvitationEmail({
        inviterName,
        cookbookName,
        role,
        acceptUrl,
      }),
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
