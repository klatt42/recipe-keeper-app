import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCookbookInvitation } from '@/lib/email/send-cookbook-invitation'
import { invitationLimit, checkRateLimit } from '@/lib/ratelimit'

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const { bookId } = params
    const { email, role = 'editor' } = await request.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(invitationLimit, user.id, 'cookbook invitation')
    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.'
      }, { status: 429 })
    }

    // Verify the current user has permission to invite
    const { data: membership } = await supabase
      .from('book_members')
      .select('role')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'editor'].includes(membership.role)) {
      return NextResponse.json({ success: false, error: 'No permission to invite members' }, { status: 403 })
    }

    // Get the book details
    const { data: book } = await supabase
      .from('recipe_books')
      .select('name')
      .eq('id', bookId)
      .single()

    if (!book) {
      return NextResponse.json({ success: false, error: 'Cookbook not found' }, { status: 404 })
    }

    // Check if user already exists
    const adminClient = createAdminClient()
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()

    if (usersError) {
      return NextResponse.json({ success: false, error: 'Unable to search for users' }, { status: 500 })
    }

    const invitedUser = users?.find(u => u.email === email)

    if (!invitedUser) {
      // User doesn't exist yet - create a pending invitation
      const { data: pendingInvite, error: pendingError } = await supabase
        .from('pending_invitations')
        .insert({
          email,
          book_id: bookId,
          invited_by: user.id,
          role,
        })
        .select('invitation_token')
        .single()

      if (pendingError) {
        if (pendingError.code === '23505') {
          return NextResponse.json({ success: false, error: 'This email has already been invited to this cookbook' }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: pendingError.message }, { status: 500 })
      }

      // Send invitation email with signup link
      await sendCookbookInvitation({
        toEmail: email,
        inviterName: user.user_metadata?.full_name || user.email || 'Someone',
        cookbookId: bookId,
        cookbookName: book.name,
        role,
        invitationToken: pendingInvite.invitation_token,
      })

      return NextResponse.json({ success: true, error: null, isPending: true })
    }

    // User exists - add them directly as a member
    const { error } = await supabase
      .from('book_members')
      .insert({
        book_id: bookId,
        user_id: invitedUser.id,
        role,
        invited_by: user.id,
      })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'User is already a member of this cookbook' }, { status: 400 })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Send notification email (no signup needed)
    await sendCookbookInvitation({
      toEmail: email,
      inviterName: user.user_metadata?.full_name || user.email || 'Someone',
      cookbookId: bookId,
      cookbookName: book.name,
      role,
    })

    return NextResponse.json({ success: true, error: null, isPending: false })
  } catch (error) {
    console.error('[API /api/cookbooks/invite] Error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
