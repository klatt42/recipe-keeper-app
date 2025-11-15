import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { invitationToken } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Find the pending invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('pending_invitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .is('accepted_at', null)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found or already accepted' },
        { status: 404 }
      )
    }

    // Verify the email matches
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { success: false, error: 'This invitation is for a different email address' },
        { status: 403 }
      )
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'This invitation has expired' }, { status: 410 })
    }

    // Add user to the cookbook
    const { error: memberError } = await supabase.from('book_members').insert({
      book_id: invitation.book_id,
      user_id: user.id,
      role: invitation.role,
      invited_by: invitation.invited_by,
    })

    if (memberError) {
      if (memberError.code === '23505') {
        // User is already a member, still mark invitation as accepted
        console.log('User already a member of this cookbook')
      } else {
        return NextResponse.json({ success: false, error: memberError.message }, { status: 500 })
      }
    }

    // Mark invitation as accepted
    await supabase
      .from('pending_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('invitation_token', invitationToken)

    // Get cookbook name for response
    const { data: book } = await supabase
      .from('recipe_books')
      .select('name')
      .eq('id', invitation.book_id)
      .single()

    return NextResponse.json({
      success: true,
      error: null,
      cookbookName: book?.name || 'the cookbook',
    })
  } catch (error) {
    console.error('[API /api/invitations/accept] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
