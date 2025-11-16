import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function acceptInvitations() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      })
    }

    if (!user.email) {
      return NextResponse.json({
        success: false,
        error: 'User has no email',
      })
    }

    // Get pending invitations
    const { data: pendingInvitations, error: inviteError } = await supabase
      .from('pending_invitations')
      .select('*')
      .eq('email', user.email)
      .is('accepted_at', null)

    if (inviteError) {
      return NextResponse.json({
        success: false,
        error: `Error fetching invitations: ${inviteError.message}`,
      })
    }

    if (!pendingInvitations || pendingInvitations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending invitations found',
        invitationsProcessed: 0,
      })
    }

    const results = []
    let successCount = 0

    // Process each invitation
    for (const invitation of pendingInvitations) {
      try {
        // Add user to the cookbook
        const { error: insertError } = await supabase.from('book_members').insert({
          book_id: invitation.book_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
        })

        if (insertError) {
          results.push({
            invitationId: invitation.id,
            success: false,
            error: insertError.message,
          })
          continue
        }

        // Mark invitation as accepted
        const { error: updateError } = await supabase
          .from('pending_invitations')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', invitation.id)

        if (updateError) {
          results.push({
            invitationId: invitation.id,
            success: false,
            error: `Failed to mark as accepted: ${updateError.message}`,
          })
          continue
        }

        results.push({
          invitationId: invitation.id,
          bookId: invitation.book_id,
          success: true,
        })
        successCount++
      } catch (error) {
        results.push({
          invitationId: invitation.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingInvitations.length} invitations, ${successCount} successful`,
      invitationsProcessed: successCount,
      results,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export async function POST() {
  return acceptInvitations()
}

export async function GET() {
  return acceptInvitations()
}
