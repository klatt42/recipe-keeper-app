import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
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
        userError: userError?.message,
      })
    }

    // Get pending invitations
    const { data: pendingInvitations, error: inviteError } = await supabase
      .from('pending_invitations')
      .select('*')
      .eq('email', user.email)
      .is('accepted_at', null)

    // Get existing book memberships
    const { data: bookMembers, error: memberError } = await supabase
      .from('book_members')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
      pendingInvitations: pendingInvitations || [],
      inviteError: inviteError?.message,
      bookMembers: bookMembers || [],
      memberError: memberError?.message,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
