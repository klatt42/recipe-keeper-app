import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // After successful email confirmation, check for pending invitations
    if (data.user) {
      const { data: pendingInvitations } = await supabase
        .from('pending_invitations')
        .select('*')
        .eq('email', data.user.email)
        .is('accepted_at', null)

      // Accept all pending invitations for this user
      if (pendingInvitations && pendingInvitations.length > 0) {
        for (const invitation of pendingInvitations) {
          // Add user to the cookbook
          await supabase.from('book_members').insert({
            book_id: invitation.book_id,
            user_id: data.user.id,
            role: invitation.role,
            invited_by: invitation.invited_by,
          })

          // Mark invitation as accepted
          await supabase
            .from('pending_invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('id', invitation.id)
        }
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
