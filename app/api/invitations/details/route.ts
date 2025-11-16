import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get token from query parameter instead of dynamic route
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'No invitation token provided' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the pending invitation (no auth required to view invitation details)
    const { data: invitation, error: invitationError } = await supabase
      .from('pending_invitations')
      .select('email, book_id, role, expires_at, accepted_at')
      .eq('invitation_token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ success: false, error: 'Invitation already accepted' }, { status: 410 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Invitation has expired' }, { status: 410 })
    }

    // Get cookbook name
    const { data: book } = await supabase
      .from('recipe_books')
      .select('name')
      .eq('id', invitation.book_id)
      .single()

    return NextResponse.json({
      success: true,
      error: null,
      invitation: {
        email: invitation.email,
        cookbookName: book?.name || 'Unknown Cookbook',
        role: invitation.role,
      },
    })
  } catch (error) {
    console.error('[API /api/invitations/details] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
