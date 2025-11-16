import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Force rebuild: 2025-01-16
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Log user activity for authenticated users
  if (user) {
    // Create service role client for background tasks
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {
            // No need to set cookies for service role
          },
        },
      }
    )

    // Check for pending invitations and accept them automatically
    // This ensures invitations are accepted regardless of how the user logs in
    if (user.email) {
      serviceSupabase
        .from('pending_invitations')
        .select('*')
        .eq('email', user.email)
        .is('accepted_at', null)
        .then(async ({ data: pendingInvitations }) => {
          if (pendingInvitations && pendingInvitations.length > 0) {
            // Accept all pending invitations sequentially
            for (const invitation of pendingInvitations) {
              try {
                // Add user to the cookbook
                await serviceSupabase.from('book_members').insert({
                  book_id: invitation.book_id,
                  user_id: user.id,
                  role: invitation.role,
                  invited_by: invitation.invited_by,
                })

                // Mark invitation as accepted
                await serviceSupabase
                  .from('pending_invitations')
                  .update({ accepted_at: new Date().toISOString() })
                  .eq('id', invitation.id)
              } catch (error) {
                console.error('Error accepting invitation:', error)
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error checking pending invitations:', error)
        })
    }

    // Only log activity for page views (not API calls or static assets)
    const isPageView =
      !request.nextUrl.pathname.startsWith('/api/') &&
      !request.nextUrl.pathname.startsWith('/_next/') &&
      !request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/)

    if (isPageView) {
      // Determine activity type based on path
      let activityType = 'page_view'
      if (request.nextUrl.pathname.startsWith('/recipes/') && request.nextUrl.pathname.length > 10) {
        activityType = 'recipe_view'
      }

      // Fire and forget - don't await to avoid blocking
      try {
        // Don't await to avoid blocking the response
        serviceSupabase.rpc('log_user_activity', {
          p_user_id: user.id,
          p_activity_type: activityType,
        })
      } catch (error) {
        // Silently fail if activity logging fails
        // This ensures user experience isn't affected
      }
    }
  }

  // Protected routes - allow public access to certain paths
  const isPublicPath =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/api/invitations') ||
    request.nextUrl.pathname.startsWith('/api/webhooks') ||
    request.nextUrl.pathname.startsWith('/api/debug') ||
    request.nextUrl.pathname.startsWith('/share')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
